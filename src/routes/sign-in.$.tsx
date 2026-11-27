import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

// Clerk-hosted sign-in, mounted at /sign-in/$ so Clerk's path routing can drive
// its sub-steps (verification, forgot-password, SSO callback…). Clerk owns the
// credentials; this app never sees or stores a password.
export const Route = createFileRoute("/sign-in/$")({
  component: SignInPage,
});

function SignInPage() {
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
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/app"
      />
      <p className="mt-6 max-w-sm text-center text-xs leading-relaxed text-ink-400 dark:text-ink-500">
        WealthFlow AI is a marketing, lead-gen, and CRM platform — not a financial
        advisor. It never provides investment advice.
      </p>
    </div>
  );
}

export default SignInPage;
