import { useEffect, useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getSession, logout } from "~/lib/auth/server";
import { Button } from "~/components/ui/Button";
import { Card, CardContent } from "~/components/ui/Card";
import { useTheme } from "~/lib/theme";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    // Route guard: require an authenticated session to view /app.
    try {
      const { user } = await getSession();
      if (user) return;
    } catch {
      /* unauthenticated or DB error -> redirect to login */
    }
    throw redirect({ to: "/login" });
  },
  component: AppShell,
});

function AppShell() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [me, setMe] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    organizationId: string;
  } | null>(null);

  useEffect(() => {
    getSession()
      .then((r: any) => setMe(r.user))
      .catch(() => {});
  }, []);

  async function onLogout() {
    await logout();
    await navigate({ to: "/login" });
  }

  return (
    <div className="flex min-h-dvh bg-ink-50 dark:bg-ink-950">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-200 bg-white md:flex dark:border-ink-800 dark:bg-ink-900/60">
        <div className="flex h-16 items-center gap-2.5 border-b border-ink-200 px-5 dark:border-ink-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20h18" /><path d="M5 20V8" /><path d="M10 20V4" /><path d="M15 20v-8" /><path d="M20 20V6" /></svg>
          </span>
          <span className="text-[15px] font-semibold text-ink-900 dark:text-white">WealthFlow<span className="text-brand-500"> AI</span></span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {[
            { label: "Dashboard", active: true },
            { label: "Prospects", active: false },
            { label: "Pipeline", active: false },
            { label: "Campaigns", active: false },
            { label: "Appointments", active: false },
            { label: "Analytics", active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={
                item.active
                  ? "rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 dark:bg-brand-950/50 dark:text-brand-200"
                  : "rounded-lg px-3 py-2 text-sm font-medium text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800"
              }
            >
              {item.label}
            </div>
          ))}
        </nav>
        <div className="border-t border-ink-200 p-3 dark:border-ink-800">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={onLogout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
            Log out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-ink-200 bg-white/80 px-5 backdrop-blur dark:border-ink-800 dark:bg-ink-900/70">
          <h1 className="text-lg font-bold text-ink-900 dark:text-white">WealthFlow workspace</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-100 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A7 7 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              )}
            </button>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                {me?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight text-ink-900 dark:text-ink-100">{me?.name || "…"}</p>
                <p className="text-xs text-ink-500 dark:text-ink-400">{me?.email}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-ink-900 dark:text-ink-100">
                Welcome{me?.name ? `, ${me!.name.split(" ")[0]}` : ""} 👋
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                Your organization is set up and you're signed in. This is the workspace shell —
                onboarding (ICP configuration) and the prospects / pipeline CRM arrive in the
                next stages.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Organization", value: me ? me.organizationId.slice(0, 8) + "…" : "—" },
                  { label: "Role", value: me?.role || "—" },
                  { label: "Plan", value: "Starter (trial)" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-ink-200/70 bg-ink-50 p-4 dark:border-ink-800 dark:bg-ink-900/50">
                    <p className="text-xs font-medium text-ink-500 dark:text-ink-400">{s.label}</p>
                    <p className="mt-1 text-sm font-semibold text-ink-900 dark:text-ink-100">{s.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
