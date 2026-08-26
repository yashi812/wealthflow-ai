import { useState } from "react";
import { Button, ButtonLink } from "~/components/ui/Button";
import { Card, CardContent } from "~/components/ui/Card";
import { inputCls } from "~/lib/inputCls";
import { saveIcp, type IcpFormData } from "~/lib/icp/server";

const FIRM_TYPES = [
  "Registered Investment Advisor (RIA)",
  "Wealth management firm",
  "Financial planning firm",
  "Family office",
  "Investment advisory firm",
  "Other",
];

const TONES = ["Professional", "Friendly", "Consultative", "Concise", "Warm & personal"];

/**
 * Reusable multi-step Ideal Client Profile wizard.
 * Used both for post-signup onboarding (/app/onboarding) and for editing the
 * ICP later (/app/settings/icp). Persists via saveIcp() (upsert).
 */
export function OnboardingWizard({
  initial,
  mode = "onboarding",
  onComplete,
}: {
  initial?: Partial<IcpFormData>;
  mode?: "onboarding" | "edit";
  onComplete?: () => void | Promise<void>;
}) {
  const STEPS = ["Firm", "Ideal client", "Services", "Outreach", "Review"];
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Partial<IcpFormData>>({
    firmName: initial?.firmName ?? "",
    website: initial?.website ?? "",
    firmType: initial?.firmType ?? "",
    targetClientType: initial?.targetClientType ?? "",
    targetLocation: initial?.targetLocation ?? "",
    minClientProfile: initial?.minClientProfile ?? "",
    services: initial?.services ?? "",
    calendarUrl: initial?.calendarUrl ?? "",
    emailAccount: initial?.emailAccount ?? "",
    outreachTone: initial?.outreachTone ?? TONES[0],
    followupCadenceDays: initial?.followupCadenceDays ?? 2,
    dailySendLimit: initial?.dailySendLimit ?? 20,
    autoFollowups: initial?.autoFollowups ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof IcpFormData, v: string | number | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  function validateStep(s: number): string | null {
    if (s === 0) {
      if (!String(form.firmName ?? "").trim()) return "Please enter your firm name.";
    }
    if (s === 1) {
      if (!String(form.targetClientType ?? "").trim())
        return "Please describe who your ideal client is.";
      if (!String(form.targetLocation ?? "").trim())
        return "Please add your geographic market.";
    }
    if (s === 2) {
      const email = String(form.emailAccount ?? "").trim();
      if (!email) return "Please add the sender email account for outreach.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return "Please enter a valid email address.";
    }
    if (s === 3) {
      const lim = Number(form.dailySendLimit ?? 0);
      if (!Number.isFinite(lim) || lim < 1 || lim > 500)
        return "Daily send limit must be between 1 and 500.";
      const cad = Number(form.followupCadenceDays ?? 0);
      if (!Number.isFinite(cad) || cad < 1 || cad > 60)
        return "Follow-up cadence must be between 1 and 60 days.";
    }
    return null;
  }

  async function submit() {
    setError(null);
    const e = validateStep(3);
    if (e) {
      setError(e);
      return;
    }
    setSaving(true);
    try {
      const res = (await saveIcp({
        data: {
          firmName: String(form.firmName ?? ""),
          website: String(form.website ?? ""),
          firmType: String(form.firmType ?? ""),
          targetClientType: String(form.targetClientType ?? ""),
          targetLocation: String(form.targetLocation ?? ""),
          minClientProfile: String(form.minClientProfile ?? ""),
          services: String(form.services ?? ""),
          calendarUrl: String(form.calendarUrl ?? ""),
          emailAccount: String(form.emailAccount ?? ""),
          outreachTone: String(form.outreachTone ?? ""),
          followupCadenceDays: Number(form.followupCadenceDays ?? 2),
          dailySendLimit: Number(form.dailySendLimit ?? 20),
          autoFollowups: Boolean(form.autoFollowups),
        },
      })) as any;
      if (res?.error) {
        setError(res.error);
        setSaving(false);
        return;
      }
      setDone(true);
      if (onComplete) await onComplete();
    } catch (err) {
      setError("Something went wrong saving your profile. Please try again.");
      setSaving(false);
    }
  }

  // ----- Final "You're ready" screen ---------------------------------------
  if (done) {
    return (
      <Card className="mx-auto w-full max-w-xl">
        <CardContent className="p-8 text-center sm:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-ink-900 dark:text-white">
            {mode === "edit" ? "Your Ideal Client Profile is saved" : "You're ready to grow"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500 dark:text-ink-400">
            {mode === "edit"
              ? "Your changes are live. WealthFlow will use these criteria to find, score, and personalize outreach for the right prospects."
              : "Your Ideal Client Profile is set. WealthFlow AI can now research, score, and personalize outreach for the right firms."}
          </p>
          <div className="mx-auto mt-4 flex max-w-sm flex-col gap-2 text-left text-sm text-ink-600 dark:text-ink-300">
            <div className="flex items-center gap-2.5 rounded-lg bg-ink-50 px-3 py-2 dark:bg-ink-900/50">
              <span className="text-brand-500">✓</span> Targeted at <strong className="text-ink-900 dark:text-white">{form.targetClientType || "your ideal client"}</strong>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg bg-ink-50 px-3 py-2 dark:bg-ink-900/50">
              <span className="text-brand-500">✓</span> Focusing on <strong className="text-ink-900 dark:text-white">{form.targetLocation || "your market"}</strong>
            </div>
          </div>
          <div className="mt-7">
            <ButtonLink href="/app/dashboard" size="lg">
              Go to Dashboard
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </ButtonLink>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ----- Wizard body --------------------------------------------------------
  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="p-6 sm:p-8">
        {/* Progress bar */}
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-500">
            {STEPS[step]}
          </p>
          <p className="text-xs text-ink-400 dark:text-ink-500">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>
        <div className="mb-7 h-1.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step 0: Firm */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Firm name *</label>
              <input className={inputCls} value={form.firmName ?? ""} onChange={(e) => set("firmName", e.target.value)} placeholder="Morgan Advisory LLC" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Website</label>
              <input className={inputCls} value={form.website ?? ""} onChange={(e) => set("website", e.target.value)} placeholder="https://morganadvisory.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Firm type</label>
              <select className={inputCls} value={form.firmType ?? ""} onChange={(e) => set("firmType", e.target.value)}>
                <option value="">Select your firm type…</option>
                {FIRM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 1: Ideal client */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Target client type *</label>
              <input className={inputCls} value={form.targetClientType ?? ""} onChange={(e) => set("targetClientType", e.target.value)} placeholder="e.g. Business owners, medical practice partners, tech executives" />
              <p className="mt-1 text-xs text-ink-400 dark:text-ink-500">Who are you looking to work with?</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Geographic market *</label>
              <input className={inputCls} value={form.targetLocation ?? ""} onChange={(e) => set("targetLocation", e.target.value)} placeholder="e.g. United States — Southeast, or nationwide" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Minimum client profile</label>
              <textarea
                className={inputCls + " min-h-[96px] resize-y"}
                value={form.minClientProfile ?? ""}
                onChange={(e) => set("minClientProfile", e.target.value)}
                placeholder="Business & professional characteristics — e.g. business owners with 10–100 employees, company revenue $2M+, HQ in your region. We focus on professional criteria, not personal financial data."
              />
              <p className="mt-1 text-xs text-ink-400 dark:text-ink-500">
                Business/professional characteristics only (industry, business-owner status, company size, geography, services).
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Services & delivery */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Services offered</label>
              <textarea
                className={inputCls + " min-h-[84px] resize-y"}
                value={form.services ?? ""}
                onChange={(e) => set("services", e.target.value)}
                placeholder="e.g. Financial planning, investment management, retirement planning, estate planning coordination"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Calendar / booking URL</label>
              <input className={inputCls} value={form.calendarUrl ?? ""} onChange={(e) => set("calendarUrl", e.target.value)} placeholder="https://cal.com/your-firm or https://calendly.com/you" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Sender email account *</label>
              <input className={inputCls} value={form.emailAccount ?? ""} onChange={(e) => set("emailAccount", e.target.value)} placeholder="advisors@yourfirm.com" />
              <p className="mt-1 text-xs text-ink-400 dark:text-ink-500">The address your outreach will be sent from. Every message includes an easy opt-out.</p>
            </div>
          </div>
        )}

        {/* Step 3: Outreach preferences */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Outreach tone</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("outreachTone", t)}
                    className={
                      "rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors " +
                      (form.outreachTone === t
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-200"
                        : "border-ink-200 text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-900")
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Follow-up cadence (days)</label>
                <input
                  type="number" min={1} max={60}
                  className={inputCls}
                  value={form.followupCadenceDays ?? 2}
                  onChange={(e) => set("followupCadenceDays", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Daily send limit</label>
                <input
                  type="number" min={1} max={500}
                  className={inputCls}
                  value={form.dailySendLimit ?? 20}
                  onChange={(e) => set("dailySendLimit", Number(e.target.value))}
                />
              </div>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink-200 p-3.5 dark:border-ink-700">
              <input
                type="checkbox"
                checked={form.autoFollowups ?? true}
                onChange={(e) => set("autoFollowups", e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-600"
              />
              <span>
                <span className="block text-sm font-medium text-ink-800 dark:text-ink-100">Enable automatic follow-ups</span>
                <span className="block text-xs text-ink-400 dark:text-ink-500">
                  AI drafts scheduled follow-ups that you approve before any message is sent. Stops immediately on unsubscribe or negative replies.
                </span>
              </span>
            </label>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm text-ink-500 dark:text-ink-400">
              Review your Ideal Client Profile. You can edit all of this later from Settings → Ideal Client Profile.
            </p>
            <div className="overflow-hidden rounded-xl border border-ink-200 dark:border-ink-700">
              {[
                ["Firm name", form.firmName],
                ["Website", form.website],
                ["Firm type", form.firmType],
                ["Target client type", form.targetClientType],
                ["Geographic market", form.targetLocation],
                ["Minimum client profile", form.minClientProfile],
                ["Services offered", form.services],
                ["Calendar URL", form.calendarUrl],
                ["Sender email", form.emailAccount],
                ["Outreach tone", form.outreachTone],
                ["Follow-up cadence", `${form.followupCadenceDays} day(s)`],
                ["Daily send limit", String(form.dailySendLimit)],
                ["Auto follow-ups", form.autoFollowups ? "On" : "Off"],
              ].map(([label, val], i) => (
                <div
                  key={label}
                  className={
                    "flex items-start justify-between gap-4 px-4 py-2.5 text-sm " +
                    (i % 2 ? "bg-ink-50 dark:bg-ink-900/40" : "bg-white dark:bg-transparent") +
                    " border-b border-ink-100 last:border-0 dark:border-ink-800"
                  }
                >
                  <span className="text-ink-500 dark:text-ink-400">{label}</span>
                  <span className="text-right font-medium text-ink-900 dark:text-ink-100">{val || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-800">
            {error}
          </p>
        )}

        {/* Nav buttons */}
        <div className="mt-7 flex items-center justify-between">
          {step > 0 ? (
            <Button variant="outline" onClick={() => { setError(null); setStep((s) => s - 1); }}>
              Back
            </Button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => {
                const e = validateStep(step);
                if (e) { setError(e); return; }
                setError(null);
                setStep((s) => s + 1);
              }}
            >
              Continue
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Button>
          ) : (
            <Button onClick={submit} disabled={saving}>
              {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Finish setup"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
