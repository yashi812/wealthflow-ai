import { SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

// Clerk-hosted sign-up at /sign-up/$. Clerk verifies the email and owns the
// password; our own organizations/team_members rows are created on first
// sign-in (src/lib/auth/account.ts → ensureAccount()).
export const Route = createFileRoute("/sign-up/$")({
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-50 px-4 py-12 dark:bg-ink-950">
      <a href="/" className="mb-8 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 20h18" />
            <path d="M5 20V8" />
            <path d="M10 20V4" />
            <path d="M15 20v-8" />
            <path d="M20 20V6" />
          </svg>
        </span>
        <span className="text-[16px] font-semibold text-ink-900 dark:text-white">
          WealthFlow<span className="text-brand-500"> AI</span>
        </span>
      </a>
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/app"
      />
      <p className="mx-auto mt-6 max-w-sm text-center text-xs leading-relaxed text-ink-400 dark:text-ink-500">
        By continuing you agree to our Terms and Privacy Policy. WealthFlow AI is a
        marketing, lead-gen, and CRM platform — not a financial advisor. You'll
        review and approve every outreach before it is sent.
      </p>
    </div>
  );
}

export default SignUpPage;
