import { Link } from "@tanstack/react-router";
import { useCrm } from "~/lib/leads/useCrm";
import { ALL_STATUSES, LEAD_STATUS_META } from "~/lib/leads/status";
import { inputCls } from "~/lib/inputCls";
import { cn } from "~/lib/cn";
import { Button } from "~/components/ui/Button";
import { LeadTable } from "~/components/crm/LeadTable";
import { LeadKanban } from "~/components/crm/LeadKanban";
import { LeadDetailDrawer } from "~/components/crm/LeadDetailDrawer";
import { NewLeadModal } from "~/components/crm/NewLeadModal";

export function CrmView({ view }: { view: "table" | "kanban" }) {
  const crm = useCrm();
  const statusOptions = view === "kanban" ? ALL_STATUSES : ALL_STATUSES;

  function onSort(key: string) {
    if (crm.filters.sort === key) {
      crm.setFilter({ order: crm.filters.order === "asc" ? "desc" : "asc" });
    } else {
      crm.setFilter({ sort: key, order: key === "name" ? "asc" : "desc" });
    }
  }

  const filteredCount = crm.leads.length;

  return (
    <div className="mx-auto max-w-full">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-ink-900 dark:text-white">
              {view === "table" ? "Prospects" : "Pipeline"}
            </h2>
            <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">
              {filteredCount} prospect{filteredCount === 1 ? "" : "s"}
              {view === "kanban" ? " · drag cards between stages to move them" : " · click a row to open details"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center rounded-lg border border-ink-200 bg-white p-0.5 dark:border-ink-700 dark:bg-ink-900">
              <Link
                to="/app/prospects"
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  view === "table"
                    ? "bg-ink-100 text-ink-900 dark:bg-ink-800 dark:text-white"
                    : "text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100"
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                  Table
                </span>
              </Link>
              <Link
                to="/app/pipeline"
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  view === "kanban"
                    ? "bg-ink-100 text-ink-900 dark:bg-ink-800 dark:text-white"
                    : "text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100"
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 5v14"/><path d="M12 5v10"/><path d="M18 5v14"/></svg>
                  Pipeline
                </span>
              </Link>
            </div>
            <Button onClick={() => crm.setShowNew(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              New lead
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              className={cn(inputCls, "pl-9")}
              placeholder="Search name, company, email, tags…"
              value={crm.filters.search}
              onChange={(e) => crm.setFilter({ search: e.target.value })}
            />
          </div>
          <select
            className={cn(inputCls, "w-auto")}
            value={crm.filters.status}
            onChange={(e) => crm.setFilter({ status: e.target.value })}
          >
            <option value="">All stages</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{LEAD_STATUS_META[s].label}</option>
            ))}
          </select>
          <select
            className={cn(inputCls, "w-auto")}
            value={crm.filters.source}
            onChange={(e) => crm.setFilter({ source: e.target.value })}
          >
            <option value="">All sources</option>
            {crm.sources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {(crm.filters.search || crm.filters.status || crm.filters.source) && (
            <button
              onClick={() => crm.setFilter({ search: "", status: "", source: "" })}
              className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300"
            >
              Clear filters
            </button>
          )}
        </div>

        {crm.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {crm.error}
          </p>
        )}
      </div>

      {/* Body */}
      <div className="mt-5">
        {crm.loading && crm.leads.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-ink-100 dark:bg-ink-800/60" />
            ))}
          </div>
        ) : view === "table" ? (
          <LeadTable leads={crm.leads} filters={crm.filters} onSort={onSort} onOpen={crm.openLead} />
        ) : (
          <LeadKanban leads={crm.leads} onMove={crm.moveStatus} onOpen={crm.openLead} />
        )}
      </div>

      {crm.drawerOpen && crm.selected && (
        <LeadDetailDrawer
          lead={crm.selected}
          open={crm.drawerOpen}
          activities={crm.activities}
          members={crm.members}
          onClose={crm.closeDrawer}
          onPatch={(id: string, patch: Record<string, unknown>) => crm.patchLead(id, patch)}
          onAddNote={crm.addNote}
        />
      )}
      <NewLeadModal
        open={crm.showNew}
        onClose={() => crm.setShowNew(false)}
        onCreated={crm.afterCreate}
        presetSources={crm.sources}
      />
    </div>
  );
}

