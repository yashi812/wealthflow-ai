import { useState } from "react";
import { createLead } from "~/lib/leads/server";
import { ALL_STATUSES, LEAD_STATUS_META } from "~/lib/leads/status";
import { inputCls } from "~/lib/inputCls";
import { Button } from "~/components/ui/Button";

const COMMON_SOURCES = ["Website", "Referral", "Event", "LinkedIn", "Cold outreach", "Inbound", "Other"];

export function NewLeadModal({
  open,
  onClose,
  onCreated,
  presetSources,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
  presetSources: string[];
}) {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    source: "",
    tags: "",
    status: "NEW",
    notes: "",
    consentOk: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const sourceOptions = [...new Set([...COMMON_SOURCES, ...presetSources])];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("Prospect name is required.");
      return;
    }
    setSaving(true);
    try {
      const res: any = await createLead({
        name: form.name,
        company: form.company,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        source: form.source.trim() || undefined,
        tags: form.tags,
        status: form.status,
        notes: form.notes,
        consentOk: form.consentOk,
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      setForm({ name: "", company: "", email: "", phone: "", source: "", tags: "", status: "NEW", notes: "", consentOk: false });
      onClose();
      await onCreated();
    } catch (e: any) {
      setError(e?.message ?? "Failed to create lead.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/50 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-ink-200 bg-white p-6 shadow-2xl dark:border-ink-700 dark:bg-ink-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink-900 dark:text-white">Add a new prospect</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-ink-600 dark:text-ink-300">Full name *</span>
            <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Smith" autoFocus />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-600 dark:text-ink-300">Company</span>
            <input className={inputCls} value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Acme Capital" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-600 dark:text-ink-300">Source</span>
            <input className={inputCls} list="lead-sources" value={form.source} onChange={(e) => set("source", e.target.value)} placeholder="Website" />
            <datalist id="lead-sources">
              {sourceOptions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-600 dark:text-ink-300">Email</span>
            <input className={inputCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@acme.com" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-600 dark:text-ink-300">Phone</span>
            <input className={inputCls} type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(555) 123-4567" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-ink-600 dark:text-ink-300">Tags</span>
            <input className={inputCls} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="comma, separated, tags" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-600 dark:text-ink-300">Stage</span>
            <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{LEAD_STATUS_META[s].label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-600 dark:text-ink-300">Notes</span>
            <input className={inputCls} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Context about this prospect" />
          </label>
          <label className="flex items-center gap-2.5 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.consentOk}
              onChange={(e) => set("consentOk", e.target.checked)}
              className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs text-ink-600 dark:text-ink-300">
              We have consent to contact this prospect (marketing/outreach onward).
            </span>
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:bg-red-950/50 dark:text-red-300 sm:col-span-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Adding…" : "Add prospect"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
