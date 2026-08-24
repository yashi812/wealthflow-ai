import { Badge } from "./ui/Badge";
import { ButtonLink } from "./ui/Button";

export function AuthPlaceholder({
  mode,
}: {
  mode: "login" | "signup";
}) {
  const isLogin = mode === "login";
  return (
    <div className="flex min-h-dvh flex-col bg-ink-50/50 dark:bg-ink-950">
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center px-5 sm:px-8">
        <a href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 20h18M5 20V8M10 20V4M15 20v-8M20 20V6" /></svg>
          </span>
          <span className="text-[15px] font-semibold text-ink-900 dark:text-white">
            WealthFlow<span className="text-brand-500"> AI</span>
          </span>
        </a>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-md rounded-2xl border border-ink-200 bg-white p-8 shadow-card dark:border-ink-800 dark:bg-ink-900/60">
          <Badge tone="brand" className="mb-4">Coming soon</Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">
            {isLogin ? "Log in to your workspace" : "Start your free trial"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
            {isLogin
              ? "Authentication is part of the next stage of WealthFlow AI. This login shell is coming online soon."
              : "Account creation and organization setup arrive in the next stage. This signup shell is coming online soon."}
          </p>

          {/* Stub form shell */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-600 dark:text-ink-300">
                Work email
              </label>
              <input
                type="email"
                placeholder="you@firm.com"
                className="h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-ink-700 dark:bg-ink-950 dark:text-white"
              />
            </div>
            {!isLogin ? (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink-600 dark:text-ink-300">
                  Organization name
                </label>
                <input
                  type="text"
                  placeholder="Northstar Wealth Partners"
                  className="h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-ink-700 dark:bg-ink-950 dark:text-white"
                />
              </div>
            ) : null}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-600 dark:text-ink-300">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-ink-700 dark:bg-ink-950 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <ButtonLink href="/" className="w-full" size="lg">
              {isLogin ? "Log in" : "Create account"} <span className="opacity-70">· soon</span>
            </ButtonLink>
            <ButtonLink href="/" variant="ghost" className="w-full">
              ← Back to homepage
            </ButtonLink>
          </div>
          <p className="mt-6 text-center text-[11px] leading-relaxed text-ink-400">
            WealthFlow AI is a marketing &amp; CRM platform, not a financial advisor.
          </p>
        </div>
      </main>
    </div>
  );
}
