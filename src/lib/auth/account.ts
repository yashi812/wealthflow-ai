// ============================================================================
// WealthFlow AI — Clerk-backed account resolution (multi-tenant)
//
// Authentication itself is Clerk (see src/start.ts clerkMiddleware + the
// /sign-in/$ and /sign-up/$ routes). Postgres stays the source of truth for
// EVERYTHING that is org-scoped: `users`, `organizations`, `team_members` and
// the `organization_id` on all tenant data.
//
// The bridge is `users.clerk_id`: the Clerk user id ("user_…") stored on our
// own user row. Every server function resolves the caller by
//   1. `auth()`  → the Clerk user id from the verified session (server-side),
//   2. `users` row where clerk_id = that id,
//   3. the caller's first `team_members` row → the organization they act in.
//
// There is no app-owned session cookie any more: the Clerk session cookie is
// the only credential, so the same resolution works on SSR (hard refresh) and
// on client-side RPC calls.
//
// `ensureAccount()` is the only function that WRITES: it provisions the
// users / organizations / team_members(owner) / subscriptions rows the first
// time a Clerk user shows up. It is idempotent and is called from the /app
// route guard, so an account can never be half-created.
// ============================================================================
import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { sql } from "~/db";

/** The signed-in caller, resolved to OUR ids. */
export interface Account {
  clerkUserId: string;
  userId: string; // users.id
  organizationId: string; // team_members.organization_id
  role: string; // role within that organization
  name: string;
  email: string;
}

/** Public shape handed to the client (never exposes clerk_id or internals). */
export interface PublicUser {
  id: string;
  organizationId: string;
  role: string;
  name: string;
  email: string;
}

export function publicUser(a: Account): PublicUser {
  return {
    id: a.userId,
    organizationId: a.organizationId,
    role: a.role,
    name: a.name,
    email: a.email,
  };
}

/** 401 JSON body used by protected server functions. */
export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}

type Db = ReturnType<typeof sql>;

async function audit(
  db: Db,
  entry: {
    organization_id: string | null;
    user_id: string | null;
    action: string;
    meta?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await db`
      INSERT INTO audit_logs (organization_id, user_id, action, ip, user_agent, meta)
      VALUES (${entry.organization_id}, ${entry.user_id}, ${entry.action}, 'clerk', 'app',
              ${JSON.stringify(entry.meta ?? {})})
    `;
  } catch (e) {
    // Auditing must never break authentication.
    console.error("audit_logs write failed:", e);
  }
}

/** The Clerk user id for the current request, or null when signed out. */
export async function currentClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}

/**
 * Read-only: map a Clerk user id to our user + organization rows.
 * Returns null when the caller is not provisioned yet (or has no org).
 */
export async function resolveAccount(clerkUserId: string): Promise<Account | null> {
  const db = sql();
  const user = (
    await db`SELECT id, email, name FROM users WHERE clerk_id = ${clerkUserId} LIMIT 1`
  )[0];
  if (!user) return null;

  const member = (
    await db`
      SELECT organization_id, role FROM team_members
      WHERE user_id = ${user.id}
      ORDER BY created_at
      LIMIT 1
    `
  )[0];
  if (!member) return null;

  return {
    clerkUserId,
    userId: String(user.id),
    organizationId: String(member.organization_id),
    role: String(member.role ?? "member"),
    name: String(user.name ?? user.email ?? ""),
    email: String(user.email ?? ""),
  };
}

/**
 * The current caller, read-only. Null when signed out, unprovisioned, or when
 * Clerk/DB resolution fails (fail closed — callers must treat null as 401).
 */
export async function currentAccount(): Promise<Account | null> {
  try {
    const clerkUserId = await currentClerkUserId();
    if (!clerkUserId) return null;
    return await resolveAccount(clerkUserId);
  } catch (e) {
    console.error("currentAccount() failed:", e);
    return null;
  }
}

/** Default org name until the onboarding wizard records the real firm name. */
function defaultOrgName(name: string, email: string): string {
  const first = name.trim().split(/\s+/)[0] || email.split("@")[0] || "New";
  return `${first} Advisory`;
}

/**
 * Idempotent provisioning for a signed-in Clerk user:
 *   users row  →  organizations row (+ subscription)  →  team_members(owner)
 * Returns null when nobody is signed in.
 */
export async function ensureAccount(): Promise<Account | null> {
  const clerkUserId = await currentClerkUserId();
  if (!clerkUserId) return null;

  // Already provisioned — the common path on every later request.
  const existing = await resolveAccount(clerkUserId);
  if (existing) return existing;

  const db = sql();
  let user = (
    await db`SELECT id, email, name FROM users WHERE clerk_id = ${clerkUserId} LIMIT 1`
  )[0];

  if (!user) {
    // Pull the profile from Clerk so our row carries the real email/name.
    let email = "";
    let name = "";
    try {
      const cu = await clerkClient().users.getUser(clerkUserId);
      email = String(
        cu.primaryEmailAddress?.emailAddress ??
          cu.emailAddresses?.[0]?.emailAddress ??
          ""
      )
        .trim()
        .toLowerCase();
      name =
        [cu.firstName, cu.lastName].filter(Boolean).join(" ").trim() ||
        String(cu.username ?? "").trim();
    } catch (e) {
      console.error("Clerk user lookup failed:", e);
    }
    if (!email) email = `${clerkUserId}@clerk.user`.toLowerCase();
    if (!name) name = email.split("@")[0];

    // A row with the same email may predate Clerk (legacy email/Google account):
    // claim it by attaching the clerk_id instead of creating a duplicate.
    const byEmail = (await db`SELECT id FROM users WHERE email = ${email} LIMIT 1`)[0];
    try {
      if (byEmail) {
        [user] = await db`
          UPDATE users
          SET clerk_id = ${clerkUserId}, name = ${name}, email_verified = true, updated_at = now()
          WHERE id = ${byEmail.id}
          RETURNING id, email, name
        `;
      } else {
        [user] = await db`
          INSERT INTO users (clerk_id, email, name, role, email_verified)
          VALUES (${clerkUserId}, ${email}, ${name}, 'owner', true)
          ON CONFLICT (clerk_id) DO UPDATE SET updated_at = now()
          RETURNING id, email, name
        `;
      }
    } catch (e) {
      // Concurrent first requests can race on the unique keys; re-read instead.
      console.error("user provisioning race:", e);
      user = (
        await db`SELECT id, email, name FROM users WHERE clerk_id = ${clerkUserId} LIMIT 1`
      )[0];
    }
  }

  if (!user) return null;

  let member = (
    await db`
      SELECT organization_id, role FROM team_members
      WHERE user_id = ${user.id}
      ORDER BY created_at
      LIMIT 1
    `
  )[0];

  if (!member) {
    // First organization for this user: org + owner membership + trial sub.
    const orgName = defaultOrgName(String(user.name ?? ""), String(user.email ?? ""));
    const [org] = await db`
      INSERT INTO organizations (name) VALUES (${orgName}) RETURNING id
    `;
    await db`
      INSERT INTO team_members (organization_id, user_id, role)
      VALUES (${org.id}, ${user.id}, 'owner')
      ON CONFLICT (organization_id, user_id) DO NOTHING
    `;
    await db`
      INSERT INTO subscriptions (organization_id, plan, status)
      VALUES (${org.id}, 'starter', 'trialing')
      ON CONFLICT (organization_id) DO NOTHING
    `;
    await audit(db, {
      organization_id: String(org.id),
      user_id: String(user.id),
      action: "signup_clerk",
      meta: { clerk_user_id: clerkUserId, org_name: orgName },
    });
    member = { organization_id: org.id, role: "owner" };
  }

  return {
    clerkUserId,
    userId: String(user.id),
    organizationId: String(member.organization_id),
    role: String(member.role ?? "member"),
    name: String(user.name ?? ""),
    email: String(user.email ?? ""),
  };
}

/**
 * Guard helper for server functions: returns the caller or a 401 Response.
 *   const a = await requireAccount();
 *   if (a instanceof Response) return a;
 */
export async function requireAccount(): Promise<Account | Response> {
  const account = await currentAccount();
  if (!account) return unauthorized();
  return account;
}
