import { createFileRoute, Link } from "@tanstack/react-router";
import { getSession } from "~/lib/auth/server";
import { getIcp } from "~/lib/icp/server";
import { getLeadStats } from "~/lib/leads/server";
import { Card, CardContent } from "~/components/ui/Card";
import { ButtonLink } from "~/components/ui/Button";
import { KpiCard } from "~/components/ui/KpiCard";
import { ACTIVE_STATUSES, LEAD_STATUS_META } from "~/lib/leads/status";

export const Route = createFileRoute("/app/dashboard")({
  loader: async () => {
    let me: any = null;
    let icp: any = null;
    let orgName = "";
    let stats: any = null;
    try {
      me = (await getSession()).user;
    } catch {}
    try {
      const d: any = await getIcp();
      icp = d?.icp ?? null;
      orgName = d?.org?.name ?? "";
    } catch {}
    try {
      stats = await getLeadStats();
    } catch {}
    return { me, hasIcp: !!icp, orgName, icp, stats: stats ?? null };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { me, hasIcp, orgName, icp, stats } = Route.useLoaderData();
  const firstName = me?.name ? String(me.name).split(" ")[0] : "";
  const s = stats ?? ({} as any);

  const kpis = [
    {
      label: "Total prospects",
      value: String(s.total ?? 0),
      hint: "Leads in your pipeline",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
      ),
    },
    {
      label: "New leads",
      value: String(s.new ?? 0),
      hint: "Awaiting first outreach",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
      ),
      accent: "bg-brand-500/10 text-brand-600 dark:text-brand-300",
    },
    {
      label: "Qualified",
      value: String((s.qualified ?? 0)),
      hint: "Qualified prospects",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="m9 11 3 3L22 4"/></svg>
      ),
      accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    },
    {
      label: "Meetings booked",
      value: String((s.meetingsBooked ?? 0) + (s.meetingsCompleted ?? 0)),
      hint: `${s.meetingsCompleted ?? 0} completed`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
      ),
      accent: "bg-accent-500/10 text-accent-600 dark:text-accent-300",
    },
  ];

  const clients = s.clients ?? 0;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink-900 dark:text-white">
            Welcome{firstName ? ` back, ${firstName}` : ""} 👋
          </h2>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            {orgName ? `${orgName} — ` : ""}Your WealthFlow AI workspace
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ButtonLink href="/app/prospects" variant="outline" size="sm">View prospects</ButtonLink>
          <ButtonLink href="/app/pipeline" size="sm">Open pipeline</ButtonLink>
        </div>
      </div>

      {!hasIcp ? (
        <Card className="mt-6">
          <CardContent className="bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-white">
            <h3 className="text-xl font-bold">Let's set up your Ideal Client Profile</h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-brand-100">
              Tell WealthFlow who your firm serves and how you like to reach them. It takes about
              two minutes and unlocks AI research, scoring, and personalized outreach.
            </p>
            <div className="mt-5">
              <ButtonLink href="/app/onboarding" className="!bg-white !text-brand-700 hover:!bg-brand-50">
                Set up your Ideal Client Profile
              </ButtonLink>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-ink-500 dark:text-ink-400">Live counts from your pipeline (Stage 7 expands analytics).</p>
          {hasIcp && (
            <Link to="/app/settings/icp" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Edit Ideal Client Profile →
            </Link>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} label={k.label} value={k.value} hint={k.hint} icon={k.icon} accent={(k as any).accent} />
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Conversion */}
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">Conversion to client</p>
          <p className="tnum mt-2 text-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
            {s.total ? `${s.conversionPct ?? 0}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-ink-400 dark:text-ink-500">
            {clients} client{clients === 1 ? "" : "s"} of {s.total ?? 0} prospects
          </p>
          {s.avgScore != null && (
            <p className="mt-3 border-t border-ink-100 pt-3 text-xs text-ink-500 dark:border-ink-800 dark:text-ink-400">
              Avg. lead score: <span className="font-semibold text-ink-700 dark:text-ink-200">{s.avgScore}</span> / 100
            </p>
          )}
        </Card>

        {/* Pipeline distribution */}
        <Card className="p-5 lg:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">Pipeline distribution</p>
          <div className="mt-4 space-y-2.5">
            {ACTIVE_STATUSES.map((st) => {
              const n = s.byStatus?.[st] ?? 0;
              const pct = s.total ? Math.round((n / s.total) * 100) : 0;
              return (
                <div key={st} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-xs font-medium text-ink-600 dark:text-ink-300">
                    {LEAD_STATUS_META[st].label}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                    <div
                      className={`h-full rounded-full ${
                        st === "CLIENT"
                          ? "bg-teal-500"
                          : st === "MEETING_BOOKED" || st === "MEETING_COMPLETED"
                            ? "bg-emerald-400"
                            : st === "QUALIFIED"
                              ? "bg-emerald-500"
                              : st === "NEW"
                                ? "bg-brand-500"
                                : "bg-accent-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-ink-700 dark:text-ink-200">{n}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
