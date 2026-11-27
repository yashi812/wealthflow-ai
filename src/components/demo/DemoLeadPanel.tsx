import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { LEAD_STATUS_META, scoreTone } from "~/lib/leads/status";
import type { DemoLead } from "~/lib/demo/fixtures";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const DRAFT_BADGE = {
  awaiting: { tone: "warning" as const, label: "Awaiting your approval" },
  approved: { tone: "success" as const, label: "Approved — queued to send" },
  sent: { tone: "neutral" as const, label: "Sent" },
};

/**
 * Read-only prospect detail panel for the public demo. Mirrors the real
 * LeadDetailDrawer's layout, but every action is inert: approve / edit / send
 * only raise a "demo — read only" notice, because the demo never writes data.
 */
export function DemoLeadPanel({
  lead,
  onClose,
  onNotify,
}: {
  lead: DemoLead;
  onClose: () => void;
  onNotify: (msg: string) => void;
}) {
  const meta = LEAD_STATUS_META[lead.status];
  const draftMeta = DRAFT_BADGE[lead.draft.status];
  const dnc = lead.doNotContact || lead.unsubscribed;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink-950/40 backdrop-blur-[2px]">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <aside className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-ink-200 bg-white shadow-2xl dark:border-ink-800 dark:bg-ink-900">
        <div className="sticky top-0 z-10 border-b border-ink-200 bg-white/95 px-5 pb-4 pt-5 backdrop-blur dark:border-ink-800 dark:bg-ink-900/95">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-lg font-bold text-ink-900 dark:text-white">{lead.name}</h3>
                <Badge tone="neutral">Demo data</Badge>
                {dnc && <Badge tone="danger">Do not contact</Badge>}
              </div>
              <p className="mt-0.5 truncate text-sm text-ink-500 dark:text-ink-400">
                {[lead.role, lead.company].filter(Boolean).join(" · ")}
              </p>
              <p className="mt-0.5 truncate text-xs text-ink-400 dark:text-ink-500">
                {[lead.email, lead.phone].filter(Boolean).join(" · ")}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close details"
              className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone={meta.tone}>{meta.label}</Badge>
            <span className="text-xs text-ink-400 dark:text-ink-500">Source: {lead.source ?? "—"}</span>
            <span className="text-xs text-ink-400 dark:text-ink-500">· Added {fmtDate(lead.createdAt)}</span>
          </div>
        </div>

        <div className="flex-1 space-y-5 p-5">
          {/* Lead score + explained reasons */}
          <section className="rounded-xl border border-ink-200 p-4 dark:border-ink-700">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tabular-nums text-ink-900 dark:text-white">{lead.leadScore}</span>
                <span className="text-xs font-medium text-ink-500 dark:text-ink-400">/ 100 lead score</span>
              </div>
              <Badge tone={scoreTone(lead.leadScore)}>
                {lead.leadScore >= 70 ? "High intent" : lead.leadScore >= 40 ? "Medium" : "Cold"}
              </Badge>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
              <div
                className={`h-full rounded-full ${lead.leadScore >= 70 ? "bg-emerald-500" : lead.leadScore >= 40 ? "bg-amber-400" : "bg-ink-300 dark:bg-ink-600"}`}
                style={{ width: `${Math.max(lead.leadScore, 2)}%` }}
              />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
              Why this score
            </p>
            <ul className="mt-2 space-y-2">
              {lead.scoreReasons.map((r) => (
                <li key={r} className="flex gap-2 text-[13px] leading-snug text-ink-700 dark:text-ink-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-brand-500">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-ink-100 pt-3 text-[11px] leading-relaxed text-ink-400 dark:border-ink-800 dark:text-ink-500">
              Scored on ICP fit, engagement and data confidence — business criteria only. WealthFlow AI never
              infers or stores a prospect's net worth, income or assets.
            </p>
          </section>

          {/* AI research summary */}
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
              AI research summary
            </h4>
            <div className="rounded-xl bg-ink-50 p-3.5 text-[13px] leading-relaxed text-ink-600 dark:bg-ink-950/60 dark:text-ink-300">
              {lead.research}
            </div>
            <p className="mt-2 text-[11px] text-ink-400 dark:text-ink-500">
              Built from public sources. Demo record — Northstar Wealth Partners is a fictional firm.
            </p>
          </section>

          {/* Outreach draft — human approval required */}
          <section className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-ink-300">
                Personalized outreach draft
              </h4>
              <Badge tone={draftMeta.tone}>{draftMeta.label}</Badge>
            </div>
            <p className="mt-3 text-[13px] font-semibold text-ink-900 dark:text-ink-100">
              Subject: {lead.draft.subject}
            </p>
            <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">
              {lead.draft.body}
            </pre>
            {lead.draft.approvedBy && (
              <p className="mt-2 text-[11px] text-ink-400 dark:text-ink-500">
                Approved by {lead.draft.approvedBy} before sending.
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-amber-200/70 pt-3 dark:border-amber-900/50">
              <Button
                size="sm"
                disabled={dnc}
                onClick={() => onNotify("Demo — read only. In your workspace, this sends only after a firm user approves it.")}
              >
                Approve &amp; send
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNotify("Demo — read only. Draft editing is disabled in the public demo.")}
              >
                Edit draft
              </Button>
              <span className="text-[11px] text-ink-500 dark:text-ink-400">
                {dnc ? "Opted out — sending is blocked" : "Nothing sends without human approval"}
              </span>
            </div>
          </section>

          {/* Next action + record info */}
          <section className="rounded-xl border border-ink-200 p-4 text-xs text-ink-500 dark:border-ink-700 dark:text-ink-400">
            <div className="grid grid-cols-2 gap-y-2">
              <span className="text-ink-400 dark:text-ink-500">Next action</span>
              <span className="text-right font-medium text-ink-700 dark:text-ink-200">{lead.nextAction ?? "—"}</span>
              <span className="text-ink-400 dark:text-ink-500">Owner</span>
              <span className="text-right font-medium text-ink-700 dark:text-ink-200">{lead.ownerName ?? "Unassigned"}</span>
              <span className="text-ink-400 dark:text-ink-500">Last contact</span>
              <span className="text-right font-medium text-ink-700 dark:text-ink-200">{fmtDate(lead.lastContact)}</span>
              <span className="text-ink-400 dark:text-ink-500">Consent to contact</span>
              <span className="text-right font-medium text-ink-700 dark:text-ink-200">
                {lead.consentOk ? "Yes" : "Not recorded"}
              </span>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
