import { useState } from "react";
import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";
import { resetPassword } from "~/lib/auth/server";
import { Button, ButtonLink } from "~/components/ui/Button";
import { Card, CardContent } from "~/components/ui/Card";
import { inputCls } from "~/lib/inputCls";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const router = useRouter();
  const { token } = useSearch({ from: "/reset-password" }) as { token?: string };
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = (await resetPassword({ data: { token, password } })) as any;
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      setDone(true);
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-50 px-4 py-12 dark:bg-ink-950">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 sm:p-8">
          {done ? (
            <>
              <h1 className="text-xl font-bold text-ink-900 dark:text-ink-100">Password updated</h1>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">You can now log in with your new password.</p>
              <Button className="mt-6 w-full" size="lg" onClick={() => router.navigate({ to: "/login" })}>Go to log in</Button>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-ink-900 dark:text-ink-100">Choose a new password</h1>
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">At least 8 characters.</p>
              {!token ? (
                <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800">
                  This reset link is missing its token. Use the link from your email.
                </p>
              ) : null}
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="pw" className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">New password</label>
                  <input id="pw" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="pw2" className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Confirm password</label>
                  <input id="pw2" type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} />
                </div>
                {error ? (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-800">{error}</p>
                ) : null}
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Saving…" : "Update password"}
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

export default ResetPasswordPage;
