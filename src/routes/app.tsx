import { useClerk, UserButton } from "@clerk/tanstack-react-start";
import {
  createFileRoute,
  redirect,
  useRouterState,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { bootstrapAccount } from "~/lib/auth/server";
import { Button } from "~/components/ui/Button";
import { useTheme } from "~/lib/theme";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    // Route guard + first-run provisioning, resolved from the CLERK session on
    // the server. `bootstrapAccount` is idempotent: it guarantees our
    // users / organizations / team_members(owner) rows exist for this Clerk
    // user, then returns them. It runs on hard SSR loads too (the Clerk session
    // cookie is available server-side), so protected pages no longer bounce.
    const res = await bootstrapAccount().catch(() => null);
    if (!res?.signedIn) throw redirect({ to: "/sign-in/$", params: { _splat: "" } });
    return { me: res.user };
  },
  component: AppShell,
});

const NAV = [
  { label: "Dashboard", to: "/app/dashboard", icon: "grid" },
  { label: "Prospects", to: "/app/prospects", icon: "users" },
  { label: "Pipeline", to: "/app/pipeline", icon: "kanban" },
  { label: "Campaigns", to: null, icon: "send" },
  { label: "Appointments", to: null, icon: "calendar" },
  { label: "Analytics", to: null, icon: "chart" },
];

const ICONS: Record<string, React.ReactNode> = {
  grid: <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />,
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  kanban: (
    <>
      <path d="M6 5v14" /><path d="M12 5v10" /><path d="M18 5v14" />
    </>
  ),
  send: (
    <>
      <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" /><path d="m7 14 4-4 4 3 5-6" />
    </>
  ),
};

function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();
  const clerk = useClerk();
  // The signed-in user + organization, resolved server-side from the Clerk
  // session by the /app route guard (see beforeLoad above).
  const { me } = Route.useRouteContext();

  async function onLogout() {
    // Clerk owns the session; signing out clears it and drops us back to the
    // public site. Protected routes then redirect to /sign-in.
    await clerk.signOut({ redirectUrl: "/" });
  }

  return (
    <div className="flex min-h-dvh bg-ink-50 dark:bg-ink-950">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-ink-200 bg-white md:flex dark:border-ink-800 dark:bg-ink-900/60">
        <Link to="/" className="flex h-16 items-center gap-2.5 border-b border-ink-200 px-5 dark:border-ink-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20h18" /><path d="M5 20V8" /><path d="M10 20V4" /><path d="M15 20v-8" /><path d="M20 20V6" /></svg>
          </span>
          <span className="text-[15px] font-semibold text-ink-900 dark:text-white">WealthFlow<span className="text-brand-500"> AI</span></span>
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => {
            const active = item.to ? pathname.startsWith(item.to) : false;
            const inner = (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{ICONS[item.icon]}</svg>
                {item.label}
              </>
            );
            const cls = active
              ? "flex items-center gap-2.5 rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 dark:bg-brand-950/50 dark:text-brand-200"
              : "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800";
            return item.to ? (
              <Link key={item.label} to={item.to} className={cls}>{inner}</Link>
            ) : (
              <div key={item.label} className={cls + " cursor-not-allowed opacity-60"} title="Coming in a later stage">{inner}</div>
            );
          })}
        </nav>
        <div className="border-t border-ink-200 p-3 dark:border-ink-800">
          <Link
            to="/app/settings/icp"
            className={
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium " +
              (pathname.startsWith("/app/settings")
                ? "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-200"
                : "text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800")
            }
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            Ideal Client Profile
          </Link>
          <div className="mt-1">
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={onLogout}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
              Log out
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-60">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-ink-200 bg-white/80 px-5 backdrop-blur dark:border-ink-800 dark:bg-ink-900/70">
          <h1 className="text-lg font-bold text-ink-900 dark:text-white">
            {pathname.startsWith("/app/onboarding") ? "Set up your firm" : "WealthFlow workspace"}
          </h1>
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
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-tight text-ink-900 dark:text-ink-100">{me?.name || "…"}</p>
                <p className="text-xs text-ink-500 dark:text-ink-400">{me?.email}</p>
              </div>
              {/* Clerk-owned account control: avatar, profile, security, sign out */}
              <UserButton
                appearance={{ elements: { avatarBox: "h-9 w-9" } }}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
