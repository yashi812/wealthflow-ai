import { Badge } from "~/components/ui/Badge";
import { LEAD_STATUS_META, scoreTone, type CrmLead } from "~/lib/leads/status";
import type { CrmFilters } from "~/lib/leads/useCrm";

function fmt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export interface TableCol {
  key: string;
  label: string;
  sortable?: boolean;
}

export const TABLE_COLS: TableCol[] = [
  { key: "name", label: "Prospect", sortable: true },
  { key: "company", label: "Company", sortable: true },
  { key: "email", label: "Email" },
  { key: "source", label: "Source", sortable: true },
  { key: "score", label: "Score", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "lastContact", label: "Last contact", sortable: true },
  { key: "owner", label: "Owner", sortable: true },
  { key: "created", label: "Created", sortable: true },
];

function SortIcon({ active, order }: { active: boolean; order: "asc" | "desc" }) {
  if (!active)
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-ink-300 dark:text-ink-600">
        <path d="m8 9 4-4 4 4" />
      </svg>
    );
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-brand-500">
      {order === "asc" ? <path d="m8 15 4 4 4-4" /> : <path d="m8 9 4-4 4 4" />}
    </svg>
  );
}

export function LeadTable({
  leads,
  filters,
  onSort,
  onOpen,
}: {
  leads: CrmLead[];
  filters: CrmFilters;
  onSort: (key: string) => void;
  onOpen: (lead: CrmLead) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-ink-200/70 bg-white shadow-card dark:border-ink-800 dark:bg-ink-900/60">
      <table className="w-full min-w-[900px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-ink-200 text-xs text-ink-500 dark:border-ink-800 dark:text-ink-400">
            {TABLE_COLS.map((c) => (
              <th key={c.key} className="whitespace-nowrap px-4 py-3 font-semibold">
                {c.sortable ? (
                  <button
                    onClick={() => onSort(c.key)}
                    className="inline-flex items-center gap-1 hover:text-ink-800 dark:hover:text-ink-200"
                  >
                    {c.label}
                    <SortIcon active={filters.sort === c.key} order={filters.order} />
                  </button>
                ) : (
                  c.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
          {leads.length === 0 ? (
            <tr>
              <td colSpan={TABLE_COLS.length} className="px-4 py-14 text-center">
                <p className="text-sm font-medium text-ink-500 dark:text-ink-400">No prospects found</p>
                <p className="mt-1 text-xs text-ink-400 dark:text-ink-500">Adjust your filters or add a new prospect.</p>
              </td>
            </tr>
          ) : (
            leads.map((l) => {
              const meta = LEAD_STATUS_META[l.status];
              const dnc = l.doNotContact || l.unsubscribed;
              return (
                <tr
                  key={l.id}
                  onClick={() => onOpen(l)}
                  className="cursor-pointer transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/40"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600/10 text-[11px] font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">
                        {l.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-ink-900 dark:text-ink-100">{l.name}</p>
                        {l.nextAction && (
                          <p className="max-w-[220px] truncate text-[11px] text-ink-400 dark:text-ink-500">↳ {l.nextAction}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{l.company || "—"}</td>
                  <td className="px-4 py-3 text-ink-600 dark:text-ink-300">
                    <span className={dnc ? "text-red-500 line-through" : ""}>{l.email || "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-500 dark:text-ink-400">{l.source || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={scoreTone(l.leadScore)}>{l.leadScore}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-500 dark:text-ink-400">{fmt(l.lastContact)}</td>
                  <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{l.ownerName || "Unassigned"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-500 dark:text-ink-400">{fmt(l.createdAt)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
