// ============================================================================
// WealthFlow AI — session handling (server-side, scalable)
//
// Stateless, HMAC-signed session cookie. The token carries the user + org ids
// and an expiry; the signature is verified server-side with SESSION_SECRET on
// every request. No server-side session store is required, so it scales across
// instances. This is NOT a JWT from a third-party lib — it is a compact
// signed token implemented with Web Crypto (HMAC-SHA256), available in Node/Bun.
// ============================================================================
import { createMiddleware } from "@tanstack/react-start";

export const SESSION_COOKIE = "wf_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const TOKEN_TTL_SECONDS = 60 * 60; // reset/oauth codes valid 1 hour

export interface SessionPayload {
  uid: string; // user id
  oid: string; // organization id
  role: string; // user role in this org
  name: string;
  email: string;
  exp: number; // unix seconds
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    // Development fallback so the app builds and runs pre-DB. In production a
    // strong SESSION_SECRET must be set. Never log it.
    return "wealthflow-dev-insecure-session-secret-change-me";
  }
  return secret;
}

const encoder = new TextEncoder();

async function hmacSign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Buffer.from(sig).toString("base64url");
}

function b64urlEncode(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

function b64urlDecode<T>(s: string): T | null {
  try {
    return JSON.parse(Buffer.from(s, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

/** Build a signed session token. */
export async function signSession(p: Omit<SessionPayload, "exp">): Promise<string> {
  const payload: SessionPayload = { ...p, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const body = b64urlEncode(payload);
  const sig = await hmacSign(body);
  return `${body}.${sig}`;
}

/** Verify a session token; returns the payload or null. */
export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return null;
  const body = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = await hmacSign(body);
  if (sig.length !== expected.length || !timingSafeEqual(sig, expected)) return null;
  const payload = b64urlDecode<SessionPayload>(body);
  if (!payload || !payload.uid || !payload.exp) return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Parse the value of any cookie by name from a raw Cookie header. */
export function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return null;
}

/** Parse the wf_session cookie out of a raw Cookie header. */
export function getSessionTokenFromCookieHeader(cookieHeader: string | null): string | null {
  return getCookieValue(cookieHeader, SESSION_COOKIE);
}

/** Create the Set-Cookie header value for a session token. */
export function sessionCookieHeader(token: string, maxAge: number = SESSION_TTL_SECONDS): string {
  const isSecure = process.env.NODE_ENV === "production" || !!process.env.PUBLIC_SITE_URL?.startsWith("https");
  const secure = isSecure ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${maxAge}`;
}

/** Set-Cookie value that immediately expires the session cookie (logout). */
export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

// ----------------------------------------------------------------------------
// Request middleware: attach the verified session to server-fn context.
// Use `.middleware([withSession])` on any server function that needs the
// current user/org, then read `ctx.context.session`.
// ----------------------------------------------------------------------------
export const withSession = createMiddleware().server(async ({ next, request }) => {
  const cookieHeader = request.headers.get("cookie");
  const token = getSessionTokenFromCookieHeader(cookieHeader);
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const ua = request.headers.get("user-agent") || "";
  const session = await verifySessionToken(token);
  // Must return the full RequestServerResult (result of next()) with our
  // session attached, so it can be read from the server-fn handler context.
  const result = await next();
  return {
    ...result,
    context: { ...(result.context ?? {}), session, ip, ua, cookieHeader },
  };
});

/** 401 JSON body used by protected server functions. */
export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}

export { TOKEN_TTL_SECONDS };
