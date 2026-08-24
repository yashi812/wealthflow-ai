import { useState } from "react";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { login, getSession } from "~/lib/auth/server";
import { Button, ButtonLink } from "~/components/ui/Button";
import { Card, CardContent } from "~/components/ui/Card";
import { inputCls } from "~/lib/inputCls";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    // If already logged in, skip straight to the app.
    try {
      const { user } = await getSession();
      if (user) throw redirect({ to: "/app" });
    } catch {
      /* ignore */
    }
  },
  component: LoginPage,
});

function GoogleButton() {
  return (
    <a href="/auth/google-start" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 dark:hover:bg-ink-800">
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.17 3.57-8.81z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.93-2.91l-3.87-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.96H1.29v3.1A12 12 0 0 0 12 24z" />
        <path fill="#FBBC05" d="M5.28 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.29a12 12 0 0 0 0 10.76l3.99-3.1z" />
        <path fill="#EA4335" d="M12 4.76c1.76 0 3.34.6 4.58 1.79l3.44-3.44A11.98 11.98 0 0 0 1.29 6.62l3.99 3.1C6.22 6.87 8.87 4.76 12 4.76z" />
      </svg>
      Continue with Google
    </a>
  );
}

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = (await login({ data: { email, password } })) as any;
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      await router.navigate({ to: "/app" });
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-50 px-4 py-12 dark:bg-ink-950">
      <a href="/" className="mb-8 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20h18" /><path d="M5 20V8" /><path d="M10 20V4" /><path d="M15 20v-8" /><path d="M20 20V6" /></svg>
        </span>
        <span className="text-[16px] font-semibold text-ink-900 dark:text-white">
          WealthFlow<span className="text-brand-500"> AI</span>
        </span>
      </a>

      <Card className="w-full max-w-md">
        <CardContent className="p-6 sm:p-8">
          <h1 className="text-xl font-bold text-ink-900 dark:text-ink-100">Log in to your workspace</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Welcome back. Enter your details to continue.</p>

          <div className="mt-6">
            <GoogleButton />
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-ink-400 dark:text-ink-500">
            <span className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
            or continue with email
            <span className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Work email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="you@firm.com"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-ink-700 dark:text-ink-200">Password</label>
                <a href="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700">Forgot password?</a>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-800">
                {error}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Logging in…" : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
            New to WealthFlow?{" "}
            <ButtonLink href="/signup" variant="ghost" size="sm" className="!p-0 text-brand-600 hover:text-brand-700">
              Start free trial
            </ButtonLink>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
