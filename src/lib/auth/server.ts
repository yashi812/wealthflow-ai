// ============================================================================
// WealthFlow AI — authentication server functions
//
// Email signup (creates user + org together), login, logout, password reset,
// and Google OAuth. Passwords are hashed with Bun.password (argon2) before
// storage. Sessions are signed HTTP-only cookies (see session.ts).
//
// DATABASE_URL is injected by the owner; until it arrives, every function that
// touches the DB throws the "DATABASE_URL is not set" error from src/db.ts.
// This module is built and typed to work the moment the DB is connected.
// ============================================================================
import { createServerFn } from "@tanstack/react-start";
import { sql } from "~/db";
import {
  signSession,
  sessionCookieHeader,
  clearSessionCookieHeader,
  withSession,
  getCookieValue,
  type SessionPayload,
} from "~/lib/auth/session";
import {
  validateSignup,
  validateLogin,
  isEmail,
  isStrongPassword,
  rateLimit,
  jsonError,
} from "~/lib/auth/validate";

// --- Password hashing (Bun runtime, argon2 via Bun.password) -----------------
const BunRuntime = (globalThis as { Bun?: any }).Bun;
export async function hashPassword(plain: string): Promise<string> {
  if (BunRuntime?.password?.hash) {
    return BunRuntime.password.hash(plain, { algorithm: "argon2id" });
  }
  throw new Error("Password hashing is unavailable in this runtime.");
}
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (BunRuntime?.password?.verify) {
    return BunRuntime.password.verify(plain, hash);
  }
  return false;
}

// --- DB lazy singleton --------------------------------------------------------
let _db: ReturnType<typeof sql> | null = null;
function getDb(): ReturnType<typeof sql> {
  if (!_db) _db = sql(); // throws if DATABASE_URL unset
  return _db;
}

// --- Audit worksheet ----------------------------------------------------------
async function audit(entry: {
  organization_id: string | null;
  user_id: string | null;
  action: string;
  ip: string;
  ua: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    const db = getDb();
    await db`
      INSERT INTO audit_logs (organization_id, user_id, action, ip, user_agent, meta)
      VALUES (${entry.organization_id}, ${entry.user_id}, ${entry.action}, ${entry.ip}, ${entry.ua}, ${JSON.stringify(entry.meta ?? {})})
    `;
  } catch (e) {
    // Audit must never break an auth op — log and continue.
    console.error("audit_logs write failed:", e);
  }
}

function randomToken(bytes = 32): string {
  return Buffer.from(
    (globalThis.crypto as Crypto).getRandomValues(new Uint8Array(bytes))
  ).toString("base64url");
}
async function sha256Hex(s: string): Promise<string> {
  const buf = await (globalThis.crypto as Crypto).subtle.digest(
    "SHA-256",
    new TextEncoder().encode(s)
  );
  return Buffer.from(buf).toString("hex");
}

// --- Me / session -------------------------------------------------------------
export const getSession = createServerFn({ method: "GET" })
  .middleware([withSession])
  .validator((d: unknown) => d)
  .handler(async ({ context }) => {
    const s = context.session as SessionPayload | null;
    if (!s) return { user: null };
    return {
      user: {
        id: s.uid,
        organizationId: s.oid,
        role: s.role,
        name: s.name,
        email: s.email,
      },
    };
  });

// --- Signup (creates user + organization together) ----------------------------
export const signup = createServerFn({ method: "POST" })
  .middleware([withSession])
  .validator((d: unknown) => d)
  .handler(async ({ data, context }) => {
    const input = (data ?? {}) as {
      name?: unknown;
      email?: unknown;
      password?: unknown;
      orgName?: unknown;
    };
    if (!rateLimit(`signup:${context.ip}`, 10, 15 * 60 * 1000)) {
      return jsonError(429, "Too many signup attempts. Please wait a few minutes.");
    }
    const errors = validateSignup(input);
    if (errors.length) return jsonError(400, errors[0].message);

    const name = String(input.name).trim();
    const email = String(input.email).trim().toLowerCase();
    const password = String(input.password);
    const orgName = String(input.orgName).trim();

    const db = getDb();
    const existing = await db`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existing.length) {
      return jsonError(409, "An account with this email already exists. Try logging in.");
    }

    const passwordHash = await hashPassword(password);

    // Create user, org, membership, and subscription within the same request.
    const [user] = await db`
      INSERT INTO users (email, password_hash, name, role, email_verified)
      VALUES (${email}, ${passwordHash}, ${name}, 'owner', true)
      RETURNING id
    `;
    const [org] = await db`
      INSERT INTO organizations (name) VALUES (${orgName}) RETURNING id
    `;
    await db`
      INSERT INTO team_members (organization_id, user_id, role)
      VALUES (${org.id}, ${user.id}, 'owner')
    `;
    await db`
      INSERT INTO subscriptions (organization_id, plan, status)
      VALUES (${org.id}, 'starter', 'trialing')
    `;
    await audit({
      organization_id: org.id,
      user_id: user.id,
      action: "signup",
      ip: context.ip,
      ua: context.ua,
      meta: { org_name: orgName },
    });

    const token = await signSession({
      uid: String(user.id),
      oid: String(org.id),
      role: "owner",
      name,
      email,
    });
    return new Response(
      JSON.stringify({ ok: true, redirect: "/app" }),
      { status: 200, headers: { "content-type": "application/json", "set-cookie": sessionCookieHeader(token) } }
    );
  });

// --- Login --------------------------------------------------------------------
export const login = createServerFn({ method: "POST" })
  .middleware([withSession])
  .validator((d: unknown) => d)
  .handler(async ({ data, context }) => {
    const input = (data ?? {}) as { email?: unknown; password?: unknown };
    if (!rateLimit(`login:${context.ip}`, 10, 15 * 60 * 1000)) {
      return jsonError(429, "Too many login attempts. Please wait a few minutes.");
    }
    const errors = validateLogin(input);
    if (errors.length) return jsonError(400, errors[0].message);

    const email = String(input.email).trim().toLowerCase();
    const password = String(input.password);
    const db = getDb();

    const rows = await db`
      SELECT u.id, u.email, u.password_hash, u.name, u.role,
             tm.organization_id, tm.role AS member_role
      FROM users u
      LEFT JOIN team_members tm ON tm.user_id = u.id
      WHERE u.email = ${email}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row || !row.password_hash) {
      // Same message whether user is missing, or is Google-only, to avoid account enumeration.
      return jsonError(401, "Invalid email or password.");
    }
    const okPass = await verifyPassword(password, String(row.password_hash));
    if (!okPass) return jsonError(401, "Invalid email or password.");

    const uid = String(row.id);
    const oid = row.organization_id ? String(row.organization_id) : null;
    const role = row.member_role || row.role || "member";
    await audit({
      organization_id: oid,
      user_id: uid,
      action: "login",
      ip: context.ip,
      ua: context.ua,
    });

    const token = await signSession({
      uid,
      oid: oid ?? "",
      role,
      name: String(row.name),
      email: String(row.email),
    });
    return new Response(
      JSON.stringify({ ok: true, redirect: "/app" }),
      { status: 200, headers: { "content-type": "application/json", "set-cookie": sessionCookieHeader(token) } }
    );
  });

// --- Logout -------------------------------------------------------------------
export const logout = createServerFn({ method: "POST" })
  .middleware([withSession])
  .validator((d: unknown) => d)
  .handler(async ({ context }) => {
    const s = context.session as SessionPayload | null;
    await audit({
      organization_id: s?.oid ?? null,
      user_id: s?.uid ?? null,
      action: "logout",
      ip: context.ip,
      ua: context.ua,
    });
    return new Response(
      JSON.stringify({ ok: true, redirect: "/login" }),
      { status: 200, headers: { "content-type": "application/json", "set-cookie": clearSessionCookieHeader() } }
    );
  });

// --- Password reset ------------------------------------------------------------
function emailProviderConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY || process.env.EMAIL_FROM);
}

export const requestPasswordReset = createServerFn({ method: "POST" })
  .middleware([withSession])
  .validator((d: unknown) => d)
  .handler(async ({ data, context }) => {
    const input = (data ?? {}) as { email?: unknown };
    if (!isEmail(String(input.email ?? ""))) {
      return jsonError(400, "Enter a valid email address.");
    }
    const email = String(input.email).trim().toLowerCase();
    if (!rateLimit(`reset:${email}:${context.ip}`, 5, 15 * 60 * 1000)) {
      return jsonError(429, "Too many reset requests. Please wait a few minutes.");
    }
    const db = getDb();
    const rows = await db`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    const user = rows[0];

    // Always return the same success message (no account enumeration).
    const reply = { ok: true };

    if (!user) {
      // Unknown user: do not leak existence. Optionally audit.
      await audit({ organization_id: null, user_id: null, action: "password_reset_request_unknown", ip: context.ip, ua: context.ua });
      return reply;
    }
    const uid = String(user.id);
    const token = randomToken();
    const tokenHash = await sha256Hex(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await db`
      INSERT INTO reset_tokens (user_id, token_hash, expires_at)
      VALUES (${uid}, ${tokenHash}, ${expiresAt})
    `;
    await audit({ organization_id: null, user_id: uid, action: "password_reset_request", ip: context.ip, ua: context.ua });

    // Delivering the reset link needs an email/SMTP provider. Wiring is in
    // place but no provider is configured, so nothing is actually emailed yet.
    // (See note in final report — do NOT claim an email was sent.)
    if (emailProviderConfigured()) {
      const link = `${process.env.PUBLIC_SITE_URL ?? ""}/reset-password?token=${token}`;
      await sendResetEmail(email, link);
    } else {
      console.log(
        `[password-reset] provider not configured — skipped email. token=${token} user=${uid}`
      );
    }
    return reply;
  });

async function sendResetEmail(_to: string, _link: string): Promise<void> {
  // Placeholder integration point (e.g. Resend) — implement when a provider
  // is connected. Must never be called before emailProviderConfigured().
  throw new Error("sendResetEmail called without provider implementation");
}

export const resetPassword = createServerFn({ method: "POST" })
  .middleware([withSession])
  .validator((d: unknown) => d)
  .handler(async ({ data, context }) => {
    const input = (data ?? {}) as { token?: unknown; password?: unknown };
    const token = String(input.token ?? "");
    const password = String(input.password ?? "");
    if (!token) return jsonError(400, "Missing reset token.");
    if (!isStrongPassword(password)) return jsonError(400, "Password must be 8–128 characters.");

    const db = getDb();
    const tokenHash = await sha256Hex(token);
    const rows = await db`
      SELECT id, user_id, used, expires_at
      FROM reset_tokens
      WHERE token_hash = ${tokenHash}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const record = rows[0];
    if (!record || record.used || new Date(record.expires_at) < new Date()) {
      return jsonError(400, "This reset link is invalid or has expired.");
    }
    const passwordHash = await hashPassword(password);
    await db`UPDATE users SET password_hash = ${passwordHash}, updated_at = now() WHERE id = ${record.user_id}`;
    await db`UPDATE reset_tokens SET used = true WHERE id = ${record.id}`;
    await audit({ organization_id: null, user_id: String(record.user_id), action: "password_reset", ip: context.ip, ua: context.ua });
    return { ok: true, redirect: "/login" };
  });

// --- Google OAuth --------------------------------------------------------------
function googleConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}
function googleRedirectUri(): string {
  return (
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.PUBLIC_SITE_URL ?? ""}/auth/google-callback`
  );
}

export const getGoogleAuthUrl = createServerFn({ method: "GET" }).handler(() => {
  if (!googleConfigured()) {
    return {
      configured: false,
      error: "Google login is not configured yet (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set).",
    };
  }
  const state = randomToken(24);
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });
  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  // Set the CSRF state cookie on our origin (HttpOnly, short-lived). It is sent
  // back on the /auth/google/callback request so the code exchange can verify it.
  return new Response(
    JSON.stringify({ configured: true, url, state }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
        "set-cookie": `wf_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
      },
    }
  );
});

export const handleGoogleCallback = createServerFn({ method: "POST" })
  .middleware([withSession])
  .validator((d: unknown) => d)
  .handler(async ({ data, context }) => {
    const { code, state, activeSession } = (data ?? {}) as any;
    if (!googleConfigured()) return jsonError(400, "Google login is not configured.");
    if (!code) return jsonError(400, "Missing authorization code.");

    // Verify the CSRF state against the cookie set before redirecting to Google.
    const cookieHeader = (context.cookieHeader as string | null) ?? null;
    const expectedState = cookieHeader ? getCookieValue(cookieHeader, "wf_oauth_state") : null;
    if (!state || !expectedState || state !== expectedState) {
      return jsonError(400, "Invalid OAuth state. Please try again.");
    }
    // The state cookie is single-use; clear it now.
    const clearStateCookie = "wf_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: String(code),
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: googleRedirectUri(),
        grant_type: "authorization_code",
      }),
    }).catch(() => null);
    if (!tokenRes || !tokenRes.ok) return jsonError(401, "Google authorization failed.");
    const tokenJson: any = await tokenRes.json();
    if (!tokenJson.access_token) return jsonError(401, "Google authorization failed.");

    const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { authorization: `Bearer ${tokenJson.access_token}` },
    }).catch(() => null);
    if (!infoRes || !infoRes.ok) return jsonError(401, "Could not fetch Google profile.");
    const profile: any = await infoRes.json();
    const gid = String(profile.sub ?? "");
    const email = String(profile.email ?? "").toLowerCase();
    const name = String(profile.name ?? profile.email ?? "User");
    if (!gid || !email) return jsonError(401, "Could not read Google profile.");

    const db = getDb();
    let user = (
      await db`SELECT id, email, password_hash, google_id, name, role FROM users WHERE google_id = ${gid} OR email = ${email} LIMIT 1`
    )[0];

    // If the user already had a session, keep them (already logged in).
    if (activeSession) {
      return new Response(JSON.stringify({ ok: true, redirect: "/app" }), {
        status: 200,
        headers: [["content-type", "application/json"], ["set-cookie", clearStateCookie]],
      });
    }

    if (!user) {
      // First-time Google sign-in: create user + a starter org to be
      // configured/renamed in the Stage 3 onboarding wizard.
      const [newUser] = await db`
        INSERT INTO users (email, name, google_id, role, email_verified)
        VALUES (${email}, ${name}, ${gid}, 'owner', true) RETURNING id
      `;
      const [org] = await db`
        INSERT INTO organizations (name) VALUES (${`${name.split(/[\s@]/)[0]} Firm`}) RETURNING id
      `;
      await db`
        INSERT INTO team_members (organization_id, user_id, role)
        VALUES (${org.id}, ${newUser.id}, 'owner')
      `;
      await db`
        INSERT INTO subscriptions (organization_id, plan, status)
        VALUES (${org.id}, 'starter', 'trialing')
      `;
      await audit({ organization_id: org.id, user_id: newUser.id, action: "signup_google", ip: context.ip, ua: context.ua });
      user = { id: newUser.id, email, name, role: "owner", google_id: gid };
      const oid = String(org.id);
      const token = await signSession({ uid: String(newUser.id), oid, role: "owner", name, email });
      return new Response(JSON.stringify({ ok: true, redirect: "/app" }), {
        status: 200,
        headers: [["content-type", "application/json"], ["set-cookie", clearStateCookie], ["set-cookie", sessionCookieHeader(token)]],
      });
    }

    // Existing user — associate google_id if missing, then sign them into
    // their (first) org.
    if (!user.google_id) {
      await db`UPDATE users SET google_id = ${gid}, updated_at = now() WHERE id = ${user.id}`;
    }
    const membership = (
      await db`SELECT organization_id, role FROM team_members WHERE user_id = ${user.id} ORDER BY created_at LIMIT 1`
    )[0];
    if (!membership) return jsonError(403, "No organization linked to this account.");
    await audit({ organization_id: String(membership.organization_id), user_id: String(user.id), action: "login_google", ip: context.ip, ua: context.ua });
    const token = await signSession({
      uid: String(user.id),
      oid: String(membership.organization_id),
      role: membership.role || "member",
      name: String(user.name),
      email,
    });
    return new Response(JSON.stringify({ ok: true, redirect: "/app" }), {
      status: 200,
      headers: [["content-type", "application/json"], ["set-cookie", clearStateCookie], ["set-cookie", sessionCookieHeader(token)]],
    });
  });
