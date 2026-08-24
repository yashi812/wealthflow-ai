import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { requestPasswordReset } from "~/lib/auth/server";
import { Button, ButtonLink } from "~/components/ui/Button";
import { Card, CardContent } from "~/components/ui/Card";
import { inputCls } from "~/lib/inputCls";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = (await requestPasswordReset({ data: { email } })) as any;
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      setSent(true);
      setLoading(false);
    } catch {
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
        <span className="text-[16px] font-semibold text-ink-900 dark:text-white">WealthFlow<span className="text-brand-500"> AI</span></span>
      </a>

      <Card className="w-full max-w-md">
        <CardContent className="p-6 sm:p-8">
          {sent ? (
            <>
              <h1 className="text-xl font-bold text-ink-900 dark:text-ink-100">Check your inbox</h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                If an account exists for{" "}
                <span className="font-medium text-ink-700 dark:text-ink-200">{email}</span>, a
                password-reset link is on its way. Note: an email provider is not yet connected,
                so this demo may not deliver email — but the reset flow and token endpoint are
                fully built.
              </p>
              <ButtonLink href="/login" size="lg" className="mt-6 w-full">Back to log in</ButtonLink>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-ink-900 dark:text-ink-100">Reset your password</h1>
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                Enter your work email and we'll send you a reset link.
              </p>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Work email</label>
                  <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@firm.com" />
                </div>
                {error ? (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-800">{error}</p>
                ) : null}
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Sending…" : "Send reset link"}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
                <ButtonLink href="/login" variant="ghost" size="sm" className="!p-0 text-brand-600 hover:text-brand-700">Back to log in</ButtonLink>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ForgotPasswordPage;
