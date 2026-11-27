// ============================================================================
// WealthFlow AI — auth entry points for the UI (Clerk-backed)
//
// Authentication lives in Clerk:
//   * UI      — <SignIn/> / <SignUp/> / <UserButton/> (Clerk components)
//   * session — Clerk's own session cookie, verified server-side by
//               clerkMiddleware() in src/start.ts on EVERY request.
//
// These server functions only resolve that Clerk session into OUR tenant model
// (users / organizations / team_members) — see src/lib/auth/account.ts.
// There are no passwords, reset tokens or OAuth callbacks in this app any more;
// Clerk owns credentials, verification, password reset and social sign-in.
// ============================================================================
import { createServerFn } from "@tanstack/react-start";
import {
  currentAccount,
  ensureAccount,
  publicUser,
  type PublicUser,
} from "~/lib/auth/account";

export interface SessionResult {
  signedIn: boolean;
  user: PublicUser | null;
}

/** Read the current session → our user + organization. Never writes. */
export const getSession = createServerFn({ method: "GET" })
  .validator((d: unknown) => d)
  .handler(async (): Promise<SessionResult> => {
    const account = await currentAccount();
    if (!account) return { signedIn: false, user: null };
    return { signedIn: true, user: publicUser(account) };
  });

/**
 * Idempotent bootstrap for a signed-in Clerk user: guarantees the
 * users / organizations / team_members(owner) rows exist, then returns them.
 * Called from the /app route guard so every protected page is provisioned.
 */
export const bootstrapAccount = createServerFn({ method: "POST" })
  .validator((d: unknown) => d)
  .handler(async (): Promise<SessionResult> => {
    const account = await ensureAccount();
    if (!account) return { signedIn: false, user: null };
    return { signedIn: true, user: publicUser(account) };
  });
