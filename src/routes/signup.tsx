import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { signup } from "~/lib/auth/server";
import { Button, ButtonLink } from "~/components/ui/Button";
import { Card, CardContent } from "~/components/ui/Card";
import { inputCls } from "~/lib/inputCls";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = (await signup({
        data: { name, email, orgName, password },
      })) as any;
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
          <h1 className="text-xl font-bold text-ink-900 dark:text-ink-100">Start your free trial</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Create your workspace and organization. No credit card required.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Full name</label>
              <input id="name" type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Alex Morgan" />
            </div>
            <div>
              <label htmlFor="org" className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Firm / organization name</label>
              <input id="org" type="text" required value={orgName} onChange={(e) => setOrgName(e.target.value)} className={inputCls} placeholder="Morgan Advisory LLC" />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Work email</label>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@firm.com" />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Password</label>
              <input id="password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="8+ characters" />
            </div>

            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-800">
                {error}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creating workspace…" : "Create my workspace"}
            </Button>
          </form>

          <p className="mt-4 text-xs leading-relaxed text-ink-400 dark:text-ink-500">
            By continuing you agree to our Terms and Privacy Policy. WealthFlow AI is a
            marketing, lead-gen, and CRM platform — not a financial advisor. It never provides
            investment advice.
          </p>

          <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
            Already have an account?{" "}
            <ButtonLink href="/login" variant="ghost" size="sm" className="!p-0 text-brand-600 hover:text-brand-700">
              Log in
            </ButtonLink>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignupPage;
