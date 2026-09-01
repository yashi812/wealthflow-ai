import { useEffect, useState } from "react";
import { inputCls } from "~/lib/inputCls";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";
import {
  ALL_STATUSES,
  LEAD_STATUS_META,
  scoreTone,
  type CrmActivity,
  type CrmLead,
} from "~/lib/leads/status";
import type { CrmMember } from "~/lib/leads/useCrm";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

const ACTIVITY_ICONS: Record<string, string> = {
  created: "#M6 3v12M6 6l10 0M6 10l7 0",
  status_change: "#M5 12h14M13 6l6 6-6 6",
  note: "#M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z",
  email_sent: "#m22 2-7 20-4-9-9-4Zm0 0L11 13",
  call: "#M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 2Z",
  meeting: "#M8 2v4M16 2v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
};

function activityIcon(type: string) {
  return ACTIVITY_ICONS[type] ?? "#M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z";
}

export function LeadDetailDrawer({
  lead,
  activities,
  members,
  open,
  onClose,
  onPatch,
  onAddNote,
}: {
  lead: CrmLead;
  activities: CrmActivity[];
  members: CrmMember[];
  open: boolean;
  onClose: () => void;
  onPatch: (id: string, patch: Record<string, unknown>) => Promise<unknown>;
  onAddNote: (leadId: string, summary: string) => Promise<unknown>;
}) {
  const [draft, setDraft] = useState({ owner: "", nextAction: "", notes: "", tags: "" });
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [natto, setNatto] = useState(false);

  // Sync drafts when the selected lead changes.
  useEffect(() => {
    setDraft({
      owner: lead.ownerId ?? "",
      nextAction: lead.nextAction ?? "",
      notes: lead.notes ?? "",
      tags: lead.tags.join(", "),
    });
    setNote("");
    setError(null);
  }, [lead.id, lead.ownerId, lead.nextAction, lead.notes, lead.tags]);

  if (!open || !lead) return null;

  const meta = LEAD_STATUS_META[lead.status];
  const dnc = lead.doNotContact || lead.unsubscribed;

  async function onStatusChange(next: string) {
    if (next === lead.status) return;
    setBusy(true);
    setError(null);
    try {
      await onPatch(lead.id, { status: next });
    } catch (e: any) {
      setError(e?.message ?? "Failed to update status.");
    } finally {
      setBusy(false);
    }
  }

  async function saveEdits() {
    setSaving(true);
    setError(null);
    try {
      await onPatch(lead.id, {
        owner: draft.owner || null,
        nextAction: draft.nextAction.trim() || null,
        notes: draft.notes,
        tags: draft.tags,
      });
      setNatto(true);
      setTimeout(() => setNatto(false), 1600);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function submitNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onAddNote(lead.id, note.trim());
      setNote("");
    } catch (e: any) {
      setError(e?.message ?? "Failed to add note.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink-950/40 backdrop-blur-[2px]">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-ink-200 bg-white shadow-2xl dark:border-ink-800 dark:bg-ink-900">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-ink-200 bg-white/95 px-5 pb-4 pt-5 backdrop-blur dark:border-ink-800 dark:bg-ink-900/95">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-lg font-bold text-ink-900 dark:text-white">{lead.name}</h3>
                {lead.doNotContact && <Badge tone="danger">Do not contact</Badge>}
                {lead.unsubscribed && <Badge tone="danger">Unsubscribed</Badge>}
              </div>
              <p className="mt-0.5 truncate text-sm text-ink-500 dark:text-ink-400">
                {[lead.company, lead.email, lead.phone].filter(Boolean).join(" · ") || "No contact details yet"}
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
          <div className="mt-3 flex items-center gap-2">
            <Badge tone={meta.tone}>{meta.label}</Badge>
            <span className="text-xs text-ink-400 dark:text-ink-500">Added {fmtDate(lead.createdAt)}</span>
            <span className="text-xs text-ink-400 dark:text-ink-500">· Source: {lead.source || "—"}</span>
          </div>
        </div>

        <div className="flex-1 space-y-5 p-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </p>
          )}

          {/* Score + research placeholder */}
          <section className="rounded-xl border border-ink-200 p-4 dark:border-ink-700">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tabular-nums text-ink-900 dark:text-white">{lead.leadScore}</span>
                <span className="text-xs font-medium text-ink-500 dark:text-ink-400">/ 100 lead score</span>
              </div>
              <Badge tone={scoreTone(lead.leadScore)}>{lead.leadScore >= 70 ? "High intent" : lead.leadScore >= 40 ? "Medium" : "Cold"}</Badge>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
              <div
                className={`h-full rounded-full ${lead.leadScore >= 70 ? "bg-emerald-500" : lead.leadScore >= 40 ? "bg-amber-400" : "bg-ink-300 dark:bg-ink-600"}`}
                style={{ width: `${Math.max(lead.leadScore, 2)}%` }}
              />
            </div>
            <div className="mt-3 rounded-lg bg-ink-50 p-3 text-xs leading-relaxed text-ink-500 dark:bg-ink-950/60 dark:text-ink-400">
              <span className="font-semibold text-ink-700 dark:text-ink-200">AI research & score breakdown</span> — component
              scoring (ICP fit, engagement, intent, data confidence) and the researched summary arrive in
              Stage 5. Scores update automatically once research runs.
            </div>
          </section>

          {/* Stage control */}
          <section>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
              Pipeline stage
            </label>
            <select
              className={inputCls}
              value={lead.status}
              disabled={busy}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>{LEAD_STATUS_META[st].label}</option>
              ))}
            </select>
            {dnc && (
              <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                This prospect has opted out or unsubscribed — do not send outreach.
              </p>
            )}
          </section>

          {/* Editable fields */}
          <section className="space-y-3.5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
                Owner
              </label>
              <select
                className={inputCls}
                value={draft.owner}
                onChange={(e) => setDraft((d) => ({ ...d, owner: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
                Next action
              </label>
              <input
                className={inputCls}
                value={draft.nextAction}
                onChange={(e) => setDraft((d) => ({ ...d, nextAction: e.target.value }))}
                placeholder="e.g. Call Tuesday 10am to discuss retirement plan review"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
                Tags
              </label>
              <input
                className={inputCls}
                value={draft.tags}
                onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))}
                placeholder="comma, separated"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
                Notes
              </label>
              <textarea
                className={inputCls + " min-h-[84px] resize-y"}
                value={draft.notes}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                placeholder="Internal notes about this prospect…"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              {natto && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Saved ✓</span>}
              <Button size="sm" onClick={saveEdits} disabled={saving}>
                {saving ? "Saving…" : "Save details"}
              </Button>
            </div>
          </section>

          {/* Activity feed */}
          <section>
            <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
              Activity {activities.length > 0 && <span className="text-ink-400">({activities.length})</span>}
            </h4>
            <form onSubmit={submitNote} className="mb-3">
              <textarea
                className={inputCls + " min-h-[64px] resize-y"}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note to the timeline…"
              />
              <div className="mt-1.5 flex justify-end">
                <Button size="sm" variant="secondary" type="submit" disabled={saving || !note.trim()}>
                  Add note
                </Button>
              </div>
            </form>
            {activities.length === 0 ? (
              <p className="rounded-lg border border-dashed border-ink-200 p-4 text-center text-xs text-ink-400 dark:border-ink-700">
                No activity yet. Notes and stage changes will show up here.
              </p>
            ) : (
              <ol className="relative space-y-4 border-l border-ink-200 pl-4 dark:border-ink-700">
                {activities.map((a) => (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[21.5px] flex h-4 w-4 items-center justify-center rounded-full border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
                        <path d={activityIcon(a.type)} />
                      </svg>
                    </span>
                    <p className="text-[13px] font-medium leading-snug text-ink-800 dark:text-ink-100">{a.summary || a.type}</p>
                    <p className="mt-0.5 text-[11px] text-ink-400 dark:text-ink-500">
                      {a.userName ? `${a.userName} · ` : ""}
                      {fmtDateTime(a.createdAt)}
                      {a.meta && typeof a.meta.from === "string" && typeof a.meta.to === "string" && (
                        <span className="ml-1 text-ink-400">
                          ({LEAD_STATUS_META[a.meta.from as keyof typeof LEAD_STATUS_META]?.label ?? a.meta.from} → {LEAD_STATUS_META[a.meta.to as keyof typeof LEAD_STATUS_META]?.label ?? a.meta.to})
                        </span>
                      )}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Misc info */}
          <section className="rounded-xl border border-ink-200 p-4 text-xs text-ink-500 dark:border-ink-700 dark:text-ink-400">
            <div className="grid grid-cols-2 gap-y-2">
              <span className="text-ink-400 dark:text-ink-500">Last contact</span>
              <span className="text-right font-medium text-ink-700 dark:text-ink-200">{fmtDateTime(lead.lastContact)}</span>
              <span className="text-ink-400 dark:text-ink-500">Last updated</span>
              <span className="text-right font-medium text-ink-700 dark:text-ink-200">{fmtDateTime(lead.updatedAt)}</span>
              <span className="text-ink-400 dark:text-ink-500">Consent to contact</span>
              <span className="text-right font-medium text-ink-700 dark:text-ink-200">{lead.consentOk ? "Yes" : "Not recorded"}</span>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

