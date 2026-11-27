import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { KpiCard } from "~/components/ui/KpiCard";
import { LeadKanban } from "~/components/crm/LeadKanban";
import { LeadTable } from "~/components/crm/LeadTable";
import { DemoLeadPanel } from "~/components/demo/DemoLeadPanel";
import { useTheme } from "~/lib/theme";
import { cn } from "~/lib/cn";
import { LEAD_STATUS_META, type CrmLead, type LeadStatus } from "~/lib/leads/status";
import type { CrmFilters } from "~/lib/leads/useCrm";
import {
  DEMO_ACTIVITY,
  DEMO_DISCLAIMER,
  DEMO_FIRM,
  DEMO_ICP,
  DEMO_KPIS,
  DEMO_LEADS,
  DEMO_TREND,
  type DemoLead,
} from "~/lib/demo/fixtures";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Live demo — WealthFlow AI for Northstar Wealth Partners (fictional firm)" },
      {
        name: "description",
        content:
          "Click through the real WealthFlow AI workspace filled with demo data for a fictional advisory firm. No signup required. WealthFlow AI is a marketing and client-acquisition platform, not a financial advisor.",
      },
    ],
  }),
  component: DemoPage,
});

type View = "dashboard" | "pipeline" | "prospects" | "icp";

const NAV: { key: View; label: string; icon: React.ReactNode }[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />,
  },
  {
    key: "prospects",
    label: "Prospects",
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    key: "pipeline",
    label: "Pipeline",
    icon: (
      <>
        <path d="M6 5v14" />
        <path d="M12 5v10" />
        <path d="M18 5v14" />
      </>
    ),
  },
  {
    key: "icp",
    label: "Ideal Client Profile",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
      </>
    ),
  },
];

const LOCKED = [
  { label: "Campaigns", icon: "send" },
  { label: "Appointments", icon: "calendar" },
  { label: "Analytics", icon: "chart" },
];

const LOCKED_ICONS: Record<string, React.ReactNode> = {
  send: (
    <>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="m7 14 4-4 4 3 5-6" />
    </>
  ),
};

function DemoPage() {
  const [view, setView] = useState<View>("dashboard");
  const [leads, setLeads] = useState<DemoLead[]>(DEMO_LEADS);
  const [selected, setSelected] = useState<DemoLead | null>(null);
  const [sort, setSort] = useState({ key: "score", order: "desc" as "asc" | "desc" });
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { theme, toggle } = useTheme();

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  function notify(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }

  // The shared CRM views hand back their own CrmLead shape; map it onto the
  // richer demo record so the detail panel keeps its research / score / draft.
  function openLead(row: CrmLead) {
    const found = leads.find((l) => l.id === row.id);
    if (found) setSelected(found);
  }

  // Demo-only stage move: updates local state so the Kanban feels real, and
  // never persists anything. No database write happens anywhere on /demo.
  function moveLead(row: CrmLead, status: LeadStatus) {
    const lead = leads.find((l) => l.id === row.id);
    if (!lead || lead.status === status) return;
    setLeads((prev) => prev.map((l) => (l.id === row.id ? { ...l, status } : l)));
    notify(`Demo — moved to “${LEAD_STATUS_META[status].label}” in this session only. Nothing is saved.`);
  }

  function onSort(key: string) {
    setSort((s) => (s.key === key ? { key, order: s.order === "asc" ? "desc" : "asc" } : { key, order: key === "name" ? "asc" : "desc" }));
  }

  const sortedLeads = useMemo(() => {
    const rank = (l: DemoLead) => {
      switch (sort.key) {
        case "name":
          return l.name.toLowerCase();
        case "company":
          return (l.company ?? "").toLowerCase();
        case "source":
          return (l.source ?? "").toLowerCase();
        case "status":
          return l.status;
        case "lastContact":
          return l.lastContact ?? "";
        case "owner":
          return (l.ownerName ?? "").toLowerCase();
        case "created":
          return l.createdAt;
        default:
          return l.leadScore;
      }
    };
    const out = [...leads].sort((a, b) => {
      const ra = rank(a);
      const rb = rank(b);
      if (typeof ra === "number" && typeof rb === "number") return ra - rb;
      return String(ra).localeCompare(String(rb));
    });
    return sort.order === "asc" ? out : out.reverse();
  }, [leads, sort]);

  const filters: CrmFilters = { search: "", status: "", source: "", sort: sort.key, order: sort.order };
  const sources = useMemo(
    () => Array.from(new Set(leads.map((l) => l.source).filter((s): s is string => !!s))),
    [leads]
  );

  const activeCount = leads.filter((l) => !["LOST", "DO_NOT_CONTACT", "NURTURE"].includes(l.status)).length;

  return (
    <div className="min-h-dvh bg-ink-50 dark:bg-ink-950">
      {/* Demo banner — pinned, always visible */}
      <div className="sticky top-0 z-50 border-b border-brand-800/40 bg-brand-950 text-white">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live demo
            </span>
            <span className="text-brand-100">
              Fictional firm and data — {DEMO_FIRM.name}. Nothing here is a real customer.
            </span>
          </p>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="hidden text-xs font-semibold text-brand-100 transition-colors hover:text-white sm:inline"
            >
              ← Back to site
            </a>
            <a
              href="/signup"
              className="inline-flex h-8 items-center justify-center rounded-lg bg-white px-3 text-[13px] font-semibold text-brand-900 transition-colors hover:bg-brand-50"
            >
              Start free trial
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1600px]">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-[57px] hidden h-[calc(100dvh-57px)] w-60 shrink-0 flex-col border-r border-ink-200 bg-white md:flex dark:border-ink-800 dark:bg-ink-900/60">
          <div className="flex h-16 items-center gap-2.5 border-b border-ink-200 px-5 dark:border-ink-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 20h18" />
                <path d="M5 20V8" />
                <path d="M10 20V4" />
                <path d="M15 20v-8" />
                <path d="M20 20V6" />
              </svg>
            </span>
            <span className="text-[15px] font-semibold text-ink-900 dark:text-white">
              WealthFlow<span className="text-brand-500"> AI</span>
            </span>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {NAV.map((item) => {
              const active = view === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setView(item.key)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm",
                    active
                      ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-950/50 dark:text-brand-200"
                      : "font-medium text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800"
                  )}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {item.icon}
                  </svg>
                  {item.label}
                </button>
              );
            })}
            {LOCKED.map((item) => (
              <div
                key={item.label}
                title="Included in the full product"
                className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-400 opacity-70 dark:text-ink-500"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {LOCKED_ICONS[item.icon]}
                </svg>
                {item.label}
              </div>
            ))}
          </nav>
          <div className="border-t border-ink-200 p-3 dark:border-ink-800">
            <div className="rounded-xl bg-ink-50 p-3 dark:bg-ink-950/60">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
                Demo workspace
              </p>
              <p className="mt-1 text-[12px] leading-snug text-ink-500 dark:text-ink-400">
                Read-only. Explore everything; approve, edit and send are disabled.
              </p>
              <a
                href="/signup"
                className="mt-2 inline-flex h-8 w-full items-center justify-center rounded-lg bg-brand-600 text-[13px] font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Start free trial
              </a>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between gap-3 border-b border-ink-200 bg-white/80 px-4 backdrop-blur sm:px-6 dark:border-ink-800 dark:bg-ink-900/70">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-ink-900 dark:text-white">{DEMO_FIRM.name}</p>
              <p className="truncate text-[11px] text-ink-500 dark:text-ink-400">{DEMO_FIRM.tagline}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="warning" className="hidden sm:inline-flex">
                Demo data
              </Badge>
              <button
                onClick={toggle}
                aria-label="Toggle dark mode"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-100 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
              >
                {theme === "dark" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
              <div className="hidden items-center gap-2.5 sm:flex">
                <div className="text-right">
                  <p className="text-[13px] font-semibold leading-tight text-ink-900 dark:text-ink-100">{DEMO_FIRM.owner}</p>
                  <p className="text-[11px] text-ink-500 dark:text-ink-400">{DEMO_FIRM.ownerRole}</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-[13px] font-bold text-white">
                  DW
                </span>
              </div>
            </div>
          </header>

          {/* Mobile / tablet nav */}
          <div className="flex gap-1 overflow-x-auto border-b border-ink-200 bg-white px-3 py-2 md:hidden dark:border-ink-800 dark:bg-ink-900/60">
            {NAV.map((item) => (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors",
                  view === item.key
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-200"
                    : "text-ink-500 dark:text-ink-400"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {view === "dashboard" && (
              <DashboardView activeCount={activeCount} onOpen={openLead} onNotify={notify} onGo={setView} />
            )}
            {view === "pipeline" && (
              <div>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-ink-900 dark:text-white">Pipeline</h2>
                    <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">
                      {leads.length} fictional prospects · drag a card to see how stages move
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setView("prospects")}>
                    Table view
                  </Button>
                </div>
                <LeadKanban leads={leads} onMove={moveLead} onOpen={openLead} />
              </div>
            )}
            {view === "prospects" && (
              <div>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-ink-900 dark:text-white">Prospects</h2>
                    <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">
                      {leads.length} fictional prospects · click a row to open the research, score and draft
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden text-xs text-ink-400 sm:inline dark:text-ink-500">
                      Sources: {sources.length}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setView("pipeline")}>
                      Pipeline view
                    </Button>
                  </div>
                </div>
                <LeadTable leads={sortedLeads} filters={filters} onSort={onSort} onOpen={openLead} />
              </div>
            )}
            {view === "icp" && <IcpView />}

            <p className="mx-auto mt-8 max-w-4xl rounded-xl border border-ink-200 bg-white/60 p-3.5 text-[11px] leading-relaxed text-ink-500 dark:border-ink-800 dark:bg-ink-900/40 dark:text-ink-400">
              <span className="font-semibold text-ink-700 dark:text-ink-200">About this demo: </span>
              {DEMO_FIRM.name}, its team and every prospect shown here are fictional and illustrative. This is a
              read-only demo of the WealthFlow AI workspace — no data is created, changed or sent. {DEMO_DISCLAIMER}
            </p>
          </main>
        </div>
      </div>

      {selected && (
        <DemoLeadPanel lead={selected} onClose={() => setSelected(null)} onNotify={notify} />
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-ink-700 bg-ink-900 px-4 py-3 text-center text-[13px] font-medium text-white shadow-2xl dark:border-ink-600 dark:bg-ink-800"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

const KPI_ICONS = [
  <path key="a" d="M12 5v14M5 12h14" />,
  <path key="b" d="m3 17 6-6 4 4 8-8" />,
  <path key="c" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  <g key="d">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </g>,
  <g key="e">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </g>,
];

function DashboardView({
  activeCount,
  onOpen,
  onNotify,
  onGo,
}: {
  activeCount: number;
  onOpen: (lead: DemoLead) => void;
  onNotify: (msg: string) => void;
  onGo: (v: View) => void;
}) {
  const max = Math.max(...DEMO_TREND.map((t) => t.n));
  const featured = DEMO_LEADS[0];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink-900 dark:text-white">Welcome back, Dana 👋</h2>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            {DEMO_FIRM.name} — demo workspace · {activeCount} prospects in live stages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onGo("prospects")}>
            View prospects
          </Button>
          <Button size="sm" onClick={() => onGo("pipeline")}>
            Open pipeline
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {DEMO_KPIS.map((k, i) => (
          <KpiCard
            key={k.label}
            label={k.label}
            value={k.value}
            delta={k.delta}
            deltaTone={k.delta.startsWith("out of") || k.delta.startsWith("prospects") ? "neutral" : "up"}
            hint={k.hint}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {KPI_ICONS[i]}
              </svg>
            }
          />
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Trend */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">
                New prospects · last 7 days
              </p>
              <p className="tnum mt-2 text-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">24</p>
              <p className="mt-1 text-xs text-ink-400 dark:text-ink-500">+9 vs the previous 7 days</p>
            </div>
            <Badge tone="success">+60%</Badge>
          </div>
          <div className="mt-6 flex h-32 items-end gap-2">
            {DEMO_TREND.map((t) => (
              <div key={t.day} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-brand-500/85 transition-all dark:bg-brand-400/80"
                    style={{ height: `${Math.round((t.n / max) * 100)}%` }}
                    title={`${t.n} prospects`}
                  />
                </div>
                <span className="text-[10px] font-medium text-ink-400 dark:text-ink-500">{t.day}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-ink-400 dark:text-ink-500">
            Illustrative demo figures — no real customer data is shown.
          </p>
        </Card>

        {/* Recent activity */}
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">
            Recent activity
          </p>
          <ol className="mt-3 space-y-3">
            {DEMO_ACTIVITY.map((a) => (
              <li key={a.what} className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                <div className="min-w-0">
                  <p className="text-[13px] leading-snug text-ink-700 dark:text-ink-200">{a.what}</p>
                  <p className="mt-0.5 text-[11px] text-ink-400 dark:text-ink-500">
                    {a.who} · {a.when}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* Featured prospect: research, score and approval queue */}
      <Card className="mt-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">
              Next in your approval queue
            </p>
            <p className="mt-1 text-base font-semibold text-ink-900 dark:text-white">
              {featured.name} · {featured.role}, {featured.company}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="success">{featured.leadScore} / 100</Badge>
            <Badge tone="warning">Draft awaiting approval</Badge>
          </div>
        </div>
        <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">
          {featured.scoreReasons[0]} · {featured.scoreReasons[1]}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => onOpen(featured)}>
            Open prospect
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNotify("Demo — read only. Approving and sending is disabled in the public demo.")}
          >
            Review draft
          </Button>
          <span className="text-[11px] text-ink-400 dark:text-ink-500">
            Every outbound message needs a firm user's approval first.
          </span>
        </div>
      </Card>

      {/* ICP summary */}
      <div className="mt-4">
        <IcpCard />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ICP                                                                 */
/* ------------------------------------------------------------------ */

function IcpCard() {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">
            Ideal Client Profile
          </p>
          <p className="mt-1 text-base font-semibold text-ink-900 dark:text-white">
            Who {DEMO_FIRM.name} wants to reach
          </p>
        </div>
        <Badge tone="brand">Drives research, scoring and draft tone</Badge>
      </div>
      <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {DEMO_ICP.fields.slice(0, 6).map((f) => (
          <div key={f.label}>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-500">
              {f.label}
            </dt>
            <dd className="mt-0.5 text-[13px] leading-snug text-ink-700 dark:text-ink-200">{f.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 border-t border-ink-100 pt-3 text-[11px] text-ink-400 dark:border-ink-800 dark:text-ink-500">
        {DEMO_ICP.updated} · Business and professional criteria only — no sensitive personal financial data is
        required or inferred.
      </p>
    </Card>
  );
}

function IcpView() {
  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="text-2xl font-bold text-ink-900 dark:text-white">Ideal Client Profile</h2>
      <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">
        {DEMO_FIRM.name} — the 10 onboarding answers that shape research, scoring and outreach tone
      </p>
      <Card className="mt-5 p-6">
        <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
          {DEMO_ICP.fields.map((f) => (
            <div key={f.label}>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-500">
                {f.label}
              </dt>
              <dd className="mt-1 text-[13px] leading-relaxed text-ink-700 dark:text-ink-200">{f.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 border-t border-ink-100 pt-4 text-[11px] leading-relaxed text-ink-400 dark:border-ink-800 dark:text-ink-500">
          {DEMO_ICP.updated}. Demo data for a fictional firm — the real product stores your own ICP per
          organization. Business and professional criteria only; WealthFlow AI does not infer or store net worth,
          income or assets for any prospect.
        </p>
      </Card>
    </div>
  );
}
