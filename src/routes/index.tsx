import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Nav } from "~/components/Nav";
import { Footer } from "~/components/Footer";
import { Section } from "~/components/ui/Section";
import { Reveal } from "~/components/ui/Reveal";
import { Badge } from "~/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/Card";
import { KpiCard } from "~/components/ui/KpiCard";
import { ButtonLink } from "~/components/ui/Button";
import { cn } from "~/lib/cn";
import {
  IconRadar,
  IconTarget,
  IconUsers,
  IconMail,
  IconSend,
  IconCheck,
  IconCheckCircle,
  IconCalendar,
  IconClock,
  IconBarChart,
  IconPie,
  IconShield,
  IconLock,
  IconFileText,
  IconSparkles,
  IconTrendingUp,
  IconSearch,
  IconGauge,
} from "~/components/ui/icons";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

/* ------------------------------------------------------------------ */
/* HERO                                                                */
/* ------------------------------------------------------------------ */

function HeroDashboard() {
  const bars = [34, 48, 40, 64, 56, 72, 66, 88, 78, 60, 92, 70];
  return (
    <Reveal variant="slideUp" className="relative mt-16">
      {/* glow */}
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-b from-brand-500/15 via-brand-500/5 to-transparent blur-2xl" />
      <Card className="overflow-hidden border-ink-200/70 shadow-pop">
        <div className="flex items-center justify-between border-b border-ink-200/70 px-5 py-3 dark:border-ink-800">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <Badge tone="accent">DEMO DATA</Badge>
        </div>
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard label="Leads Found" value="1,248" icon={<IconSearch size={18} />} delta="+18% vs last 30d" />
            <KpiCard label="Qualified" value="184" icon={<IconTarget size={18} />} delta="24% qualify rate" />
            <KpiCard label="Meetings Booked" value="37" icon={<IconCalendar size={18} />} delta="+9 this week" accent="bg-success/10 text-success" />
            <KpiCard label="Pipeline Value" value="$84,500" icon={<IconTrendingUp size={18} />} delta="16 active deals" />
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
            <Card className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-600 dark:text-ink-300">
                  Qualified leads by month
                </span>
                <Badge tone="success">+32%</Badge>
              </div>
              <div className="flex h-36 items-end gap-1.5">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="group relative flex-1 rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400 transition-all hover:from-brand-500"
                    style={{ height: `${h}%`, minHeight: "8%" }}
                  />
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-600 dark:text-ink-300">
                  Funnel conversion
                </span>
                <IconPie size={15} className="text-brand-500" />
              </div>
              <div className="space-y-3">
                {[
                  { l: "Found", v: "1,248", p: "100%" },
                  { l: "Qualified", v: "184", p: "15%" },
                  { l: "Nurtured", v: "96", p: "52%" },
                  { l: "Booked", v: "37", p: "39%" },
                ].map((r) => (
                  <div key={r.l} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ink-500 dark:text-ink-400">{r.l}</span>
                      <span className="tnum font-semibold text-ink-800 dark:text-ink-100">{r.v}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: r.p }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </Reveal>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-32 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-60 dark:bg-grid-dark [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
      </div>
      <div className="mx-auto w-full max-w-7xl px-5 text-center sm:px-8">
        <Reveal>
          <Badge tone="brand" className="mb-6 px-3 py-1">
            <IconSparkles size={13} /> AI-powered client acquisition for advisory firms
          </Badge>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mx-auto max-w-4xl text-4xl font-semibold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl md:text-6xl dark:text-white">
            Your AI-Powered Client Acquisition Team for{" "}
            <span className="text-gradient">Financial Advisory Firms.</span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-500 sm:text-xl dark:text-ink-400">
            Find qualified prospects, personalize outreach, nurture leads, and fill
            your consultation calendar — while keeping investment decisions and
            advice in human hands.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/sign-up" size="lg" className="w-full sm:w-auto">
              Start Free
            </ButtonLink>
            <ButtonLink
              href="#product"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Demo
            </ButtonLink>
          </div>
        </Reveal>
        <Reveal delay={300}>
          <p className="mt-4 text-xs text-ink-400 dark:text-ink-500">
            14-day free trial · No credit card required · No investment advice — ever
          </p>
        </Reveal>
        <HeroDashboard />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* SECTION 1 — Pain points                                             */
/* ------------------------------------------------------------------ */

const PAIN = [
  {
    icon: <IconClock size={20} />,
    title: "Slow follow-up",
    body: "Leads go cold when responses take days. Speed is everything in wealth advisory, and manual follow-up simply isn't fast enough.",
  },
  {
    icon: <IconUsers size={20} />,
    title: "Leads fall through the cracks",
    body: "No single source of truth means prospects slip between spreadsheets, inboxes, and sticky notes — silently lost revenue.",
  },
  {
    icon: <IconMail size={20} />,
    title: "Generic outreach",
    body: "One-size-fits-all templates get ignored. High-net-worth prospects expect research-backed, personalized communication.",
  },
  {
    icon: <IconTarget size={20} />,
    title: "Poor qualification",
    body: "Chasing unqualified leads burns your team's time. Without disciplined scoring, your advisors book the wrong conversations.",
  },
  {
    icon: <IconCalendar size={20} />,
    title: "Empty calendars",
    body: "All that effort never converts into booked consultations, leaving your firm's billable pipeline dry.",
  },
];

function Section1() {
  return (
    <section id="pains" className="border-t border-ink-100 bg-ink-50/50 py-20 sm:py-28 dark:border-ink-800/60 dark:bg-ink-950/40">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto mb-14 max-w-3xl text-center">
          <Badge tone="danger" className="mb-4">The Problem</Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl dark:text-ink-50">
            Stop Losing Qualified Prospects
          </h2>
          <p className="mt-4 text-lg text-ink-500 dark:text-ink-400">
            Great advisory firms lose prospects not because their advice is weak — but
            because their acquisition pipeline leaks.
          </p>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PAIN.map((p, i) => (
            <Reveal key={p.title} delay={i * 60}>
              <Card className="h-full">
                <CardHeader>
                  <span className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-danger/10 text-danger">
                    {p.icon}
                  </span>
                  <CardTitle>{p.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                    {p.body}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* SECTION 2 — Flow                                                    */
/* ------------------------------------------------------------------ */

const FLOW = [
  { icon: <IconRadar size={20} />, label: "Find", body: "Discover qualified prospects across sources." },
  { icon: <IconSearch size={20} />, label: "Research", body: "AI builds a full prospect brief." },
  { icon: <IconSend size={20} />, label: "Personalize", body: "Tailored, human-approved drafts." },
  { icon: <IconMail size={20} />, label: "Nurture", body: "Automated cadences that follow up." },
  { icon: <IconTarget size={20} />, label: "Qualify", body: "Score & prioritize fit." },
  { icon: <IconCalendar size={20} />, label: "Book", body: "Fill your consultation calendar." },
];

function Section2() {
  return (
    <section id="product" className="py-20 sm:py-28">
      <Section
        eyebrow="The Pipeline"
        title="One AI System. Your Entire Acquisition Pipeline."
        description="From the first signal to a booked consultation, every stage of acquisition runs in one coherent, auditable system — with you approving the important decisions."
      />
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 px-5 sm:grid-cols-3 sm:px-8 lg:grid-cols-6">
        {FLOW.map((f, i) => (
          <Reveal key={f.label} delay={i * 70}>
            <Card className="relative h-full flex-col items-center justify-center p-5 text-center">
              {i < FLOW.length - 1 ? (
                <span className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-ink-300 lg:block dark:text-ink-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                </span>
              ) : null}
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
                {f.icon}
              </span>
              <p className="mt-3 text-sm font-semibold text-ink-900 dark:text-ink-100">{f.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-500 dark:text-ink-400">{f.body}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Feature sections (3–9)                                              */
/* ------------------------------------------------------------------ */

interface Feature {
  id?: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  bullets?: string[];
}

function FeatureLayout({
  id,
  eyebrow,
  badgeTone = "brand",
  title,
  description,
  items,
  visual,
  reversed,
}: {
  id?: string;
  eyebrow: string;
  badgeTone?: "brand" | "success" | "accent" | "neutral";
  title: React.ReactNode;
  description: string;
  items: Feature[];
  visual?: React.ReactNode;
  reversed?: boolean;
}) {
  return (
    <section id={id} className="border-t border-ink-100 py-20 sm:py-28 dark:border-ink-800/60">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
        <Reveal className={cn("order-2 lg:order-1", reversed && "lg:order-2")}>
          <Badge tone={badgeTone} className="mb-4">{eyebrow}</Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl dark:text-ink-50">
            {title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-500 dark:text-ink-400">
            {description}
          </p>
          <div className="mt-8 space-y-6">
            {items.map((it, i) => (
              <Reveal key={it.title} delay={i * 60}>
                <div className="flex gap-4">
                  <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
                    {it.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink-900 dark:text-ink-100">{it.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{it.body}</p>
                    {it.bullets ? (
                      <ul className="mt-2 space-y-1.5">
                        {it.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-sm text-ink-600 dark:text-ink-300">
                            <IconCheck size={15} className="mt-0.5 shrink-0 text-success" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
        <Reveal className={cn("order-1 lg:order-2", reversed && "lg:order-1")}>
          {visual}
        </Reveal>
      </div>
    </section>
  );
}

/* Section 3 — AI Lead Generation */
function LeadGenVisual() {
  const rows = [
    { name: "Avery Thompson & Co.", src: "IPO activity", score: 92, fit: "Excellent" },
    { name: "Granite Peak Wealth", src: "Referral network", score: 87, fit: "Excellent" },
    { name: "Harborline Advisory", src: "LinkedIn intent", score: 81, fit: "Strong" },
    { name: "Summit Springs Family", src: "Webinar attendee", score: 78, fit: "Strong" },
    { name: "Blue Pine Group", src: "Inbound form", score: 64, fit: "Warm" },
  ];
  return (
    <Card className="overflow-hidden shadow-card">
      <CardHeader className="border-b border-ink-100 pb-3 dark:border-ink-800">
        <div className="flex items-center justify-between">
          <CardTitle>Prospect radar</CardTitle>
          <Badge tone="brand">Scanning live sources</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2.5">
          {rows.map((r) => (
            <div key={r.name} className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 p-3 dark:border-ink-800">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-100">{r.name}</p>
                <p className="text-xs text-ink-500 dark:text-ink-400">{r.src}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge tone={r.score > 80 ? "success" : "accent"}>{r.fit}</Badge>
                <span className="tnum w-10 text-right text-sm font-bold text-brand-600 dark:text-brand-300">
                  {r.score}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-400 dark:text-ink-500">
          Educational signals only · No inferred financial data
        </p>
      </CardContent>
    </Card>
  );
}

/* Section 4 — AI Qualification */
function QualifyVisual() {
  return (
    <Card className="overflow-hidden shadow-card">
      <CardHeader className="border-b border-ink-100 pb-3 dark:border-ink-800">
        <CardTitle>Lead score breakdown — Avery Thompson & Co.</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {[
          { l: "Firm fit", s: 24, m: 25 },
          { l: "Decision-maker reachability", s: 19, m: 20 },
          { l: "Engagement", s: 16, m: 20 },
          { l: "Timing signal", s: 18, m: 20 },
          { l: "Asset complexity", s: 15, m: 15 },
        ].map((r) => (
          <div key={r.l} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-600 dark:text-ink-300">{r.l}</span>
              <span className="tnum font-semibold text-ink-900 dark:text-ink-100">
                {r.s}/{r.m}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                style={{ width: `${(r.s / r.m) * 100}%` }}
              />
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/40">
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Overall score</span>
          <span className="tnum text-2xl font-bold text-emerald-600 dark:text-emerald-300">92 / 100</span>
        </div>
        <p className="text-xs text-ink-400 dark:text-ink-500">
          Score uses firm fit, engagement & timing signals — never net worth or income.
        </p>
      </CardContent>
    </Card>
  );
}

/* Section 5 — Automated Follow-Up */
function FollowUpVisual() {
  const steps = [
    { d: "Day 0", t: "Initial personalized email sent (approved)", s: "done" },
    { d: "Day 2", t: "Value-add article on retirement planning", s: "sent" },
    { d: "Day 5", t: "Pricing consultation offer — reply: interested ✓", s: "replied" },
    { d: "Day 6", t: "Auto-booked discovery call", s: "auto" },
  ];
  return (
    <Card className="overflow-hidden shadow-card">
      <CardHeader className="border-b border-ink-100 pb-3 dark:border-ink-800">
        <div className="flex items-center justify-between">
          <CardTitle>Nurture sequence</CardTitle>
          <Badge tone="success">Reply detected</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-0">
          {steps.map((s, i) => (
            <div key={s.d} className="relative flex gap-4 pb-5 last:pb-0">
              {i < steps.length - 1 ? (
                <span className="absolute left-[13px] top-6 h-full w-px bg-ink-200 dark:bg-ink-700" />
              ) : null}
              <span
                className={cn(
                  "z-10 mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                  s.s === "done" && "bg-emerald-500",
                  s.s === "sent" && "bg-brand-500",
                  s.s === "replied" && "bg-emerald-500",
                  s.s === "auto" && "bg-accent-500"
                )}
              >
                {s.s === "done" ? "✓" : s.s === "auto" ? "⚡" : ""}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">{s.d}</span>
                  <Badge tone={s.s === "sent" ? "brand" : s.s === "auto" ? "accent" : "success"}>
                    {s.s === "sent" ? "Sent" : s.s === "auto" ? "Automated" : "Completed"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-medium text-ink-800 dark:text-ink-100">{s.t}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-500 dark:bg-ink-800/60 dark:text-ink-400">
          Negative or unsubscribe replies instantly stop the sequence and flag Do-Not-Contact.
        </p>
      </CardContent>
    </Card>
  );
}

/* Section 6 — Lead Magnet / Quiz Funnel */
function QuizVisual() {
  return (
    <Card className="overflow-hidden shadow-card">
      <CardHeader className="border-b border-ink-100 pb-3 dark:border-ink-800">
        <div className="flex items-center justify-between">
          <CardTitle>Retirement readiness quiz</CardTitle>
          <Badge tone="brand">Lead magnet</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <p className="text-sm font-medium text-ink-800 dark:text-ink-100">
            Q3 of 5 — How would you describe your current financial planning?
          </p>
          <div className="flex flex-wrap gap-2">
            {["Just getting started", "Building wealth", "Approaching retirement", "Retired"].map((o, i) => (
              <span
                key={o}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium",
                  i === 1
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300"
                    : "border-ink-200 text-ink-600 dark:border-ink-700 dark:text-ink-300"
                )}
              >
                {o}
              </span>
            ))}
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
              <div className="h-full w-3/5 rounded-full bg-brand-500" />
            </div>
            <div className="flex justify-between text-[11px] text-ink-400">
              <span>Question 3 of 5</span>
              <span>60% complete</span>
            </div>
          </div>
          <p className="rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-500 dark:bg-ink-800/60 dark:text-ink-400">
            Educational quiz — no financial data is collected or inferred. Captures
            opt-in consent and an ideal-firm-fit signal.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* Section 7 — Appointment Booking */
function BookingVisual() {
  const slots = [
    { d: "Mon, Sep 14", t: ["10:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"] },
    { d: "Tue, Sep 15", t: ["9:00 AM", "1:00 PM", "3:30 PM"] },
    { d: "Wed, Sep 16", t: ["10:30 AM", "12:00 PM", "2:30 PM", "5:00 PM"] },
  ];
  return (
    <Card className="overflow-hidden shadow-card">
      <CardHeader className="border-b border-ink-100 pb-3 dark:border-ink-800">
        <div className="flex items-center justify-between">
          <CardTitle>Book a consultation</CardTitle>
          <Badge tone="success">2 slots open</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {slots.map((d) => (
            <div key={d.d} className="rounded-xl border border-ink-100 p-3 dark:border-ink-800">
              <p className="text-xs font-semibold text-ink-600 dark:text-ink-300">{d.d}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {d.t.map((t) => (
                  <span
                    key={t}
                    className={cn(
                      "rounded-md border px-2 py-1 text-[11px] font-medium",
                      t === "10:00 AM"
                        ? "border-brand-500 bg-brand-500 text-white"
                        : "border-ink-200 text-ink-600 dark:border-ink-700 dark:text-ink-300"
                    )}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-400 dark:text-ink-500">
          Syncs to your calendar. No-shows auto-rescheduled by the nurture flow.
        </p>
      </CardContent>
    </Card>
  );
}

/* Section 8 — CRM */
function CrmVisual() {
  const stages = [
    { t: "New", n: 12, c: "bg-ink-300 text-ink-800" },
    { t: "Contacted", n: 8, c: "bg-brand-100 text-brand-700" },
    { t: "Qualified", n: 5, c: "bg-brand-500 text-white" },
    { t: "Meeting", n: 3, c: "bg-accent-400 text-ink-900" },
    { t: "Won", n: 2, c: "bg-emerald-500 text-white" },
  ];
  return (
    <Card className="overflow-hidden shadow-card">
      <CardHeader className="border-b border-ink-100 pb-3 dark:border-ink-800">
        <div className="flex items-center justify-between">
          <CardTitle>Kanban pipeline</CardTitle>
          <Badge tone="brand">Org: Northstar Wealth Partners (demo)</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-5 gap-2">
          {stages.map((s) => (
            <div key={s.t} className="flex flex-col items-center rounded-lg bg-ink-50 py-3 dark:bg-ink-800/50">
              <span className={cn("tnum inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold", s.c)}>
                {s.n}
              </span>
              <span className="mt-1.5 text-center text-[10px] font-medium uppercase tracking-wide text-ink-500">{s.t}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["Granite Peak Wealth", "Qualified · Brokerage", "$1.2M"],
            ["Harborline Advisory", "Meeting scheduled · Tue", "$840K"],
            ["Summit Springs Family", "Won · Intro call done", "$2.1M"],
          ].map((r) => (
            <div key={r[0]} className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2 dark:border-ink-800">
              <span className="truncate text-xs font-semibold text-ink-800 dark:text-ink-100">{r[0]}</span>
              <span className="ml-2 hidden truncate text-[11px] text-ink-400 sm:block">{r[1]}</span>
              <span className="tnum text-xs font-semibold text-accent-600 dark:text-accent-300">{r[2]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* Section 9 — Analytics */
function AnalyticsVisual() {
  const lines = [
    { l: "Meetings booked", w: 90, c: "#3f66ea" },
    { l: "Qualified leads", w: 68, c: "#c9a227" },
    { l: "Pipeline value", w: 78, c: "#16a34a" },
  ];
  return (
    <Card className="overflow-hidden shadow-card">
      <CardHeader className="border-b border-ink-100 pb-3 dark:border-ink-800">
        <div className="flex items-center justify-between">
          <CardTitle>Growth dashboard</CardTitle>
          <Badge tone="accent">30 days</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-0">
          {lines.map((l, i) => (
            <div key={l.l} className="space-y-1.5 pb-3 last:pb-1">
              <span className="text-xs font-medium text-ink-600 dark:text-ink-300">{l.l}</span>
              <svg viewBox="0 0 300 60" className="w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={l.c} stopOpacity="0.35" />
                    <stop offset="1" stopColor={l.c} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="300" height="60" fill={`url(#g${i})`} rx="4" />
                <path
                  d="M0,50 C30,46 45,40 70,38 C95,36 110,30 135,26 C160,22 180,28 205,20 C230,12 255,16 300,6"
                  fill="none"
                  stroke={l.c}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-400 dark:text-ink-500">
          ROI on every campaign · conversion by channel · booking velocity.
        </p>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* SECTION 3–9 composition                                             */
/* ------------------------------------------------------------------ */

function Section36() {
  return (
    <>
      <FeatureLayout
        id="lead-gen"
        eyebrow="AI Lead Generation"
        title="Find qualified prospects before your competitors do"
        description="WealthFlow scans public, educational, and opt-in signals to surface advisory prospects that match your Ideal Client Profile — continuously and at scale."
        items={[
          {
            icon: <IconRadar size={19} />,
            title: "Ideal Client Profile targeting",
            body: "Configure your ICP across firm size, location, planning triggers, and more — in 10 quick fields.",
          },
          {
            icon: <IconSearch size={19} />,
            title: "Continuous prospecting",
            body: "New qualified, verified contacts surface daily, ranked by fit — no cold list buying, no guesswork.",
            bullets: ["Verified, real contacts", "Opt-in & consent-aware", "Never scraped personal data"],
          },
        ]}
        visual={<LeadGenVisual />}
      />

      <FeatureLayout
        id="qualification"
        eyebrow="AI Lead Qualification"
        reversed
        title="Know exactly who to prioritize"
        description="Every lead gets a transparent 0–100 score with explained reasons, so your advisors spend time on the prospects most likely to become clients."
        items={[
          {
            icon: <IconGauge size={19} />,
            title: "Explainable lead scoring",
            body: "Each score breaks down into firm fit, reachability, engagement, and timing — every point justified.",
          },
          {
            icon: <IconTarget size={19} />,
            title: "Qualification that respects privacy",
            body: "We score on fit and behavioral signals only. We never infer net worth, assets, or income.",
          },
        ]}
        visual={<QualifyVisual />}
      />

      <FeatureLayout
        id="follow-up"
        eyebrow="Automated Follow-Up"
        title="Nurture every lead — without the busywork"
        description="Personalized, value-first sequences run on autopilot while your team stays in control of what ships. No prospect is ever forgotten."
        items={[
          {
            icon: <IconMail size={19} />,
            title: "Automated nurture sequences",
            body: "Timed, multi-step cadences keep you top-of-mind with genuinely useful, educational content.",
          },
          {
            icon: <IconSparkles size={19} />,
            title: "Smart reply classification",
            body: "Interested, book-a-meeting, unsubscribe, or not-a-fit? AI reads replies and routes them instantly.",
            bullets: ["Stops on any negative reply", "Honors unsubscribe instantly", "Flags Do-Not-Contact"],
          },
        ]}
        visual={<FollowUpVisual />}
      />

      <FeatureLayout
        id="lead-magnet"
        eyebrow="Lead Magnet & Quiz Funnel"
        reversed
        title="Turn educational content into qualified intros"
        description="Embed interactive quizzes and lead magnets that capture opt-in consent and ideal-fit signals — a compliant, low-friction way to grow your pipeline."
        items={[
          {
            icon: <IconTarget size={19} />,
            title: "On-brand quiz funnels",
            body: "Standalone pages, embedded forms, or embedded quizzes that collect consent and qualification signals.",
          },
          {
            icon: <IconUsers size={19} />,
            title: "Consent-first capture",
            body: "Every new contact enters with clear opt-in and an easy path to opt out — built for compliance from the start.",
          },
        ]}
        visual={<QuizVisual />}
      />

      <FeatureLayout
        id="booking"
        eyebrow="Appointment Booking"
        title="Fill your consultation calendar"
        description="Move interested prospects straight onto your calendar. No back-and-forth, no double-booking, no lost momentum."
        items={[
          {
            icon: <IconCalendar size={19} />,
            title: "Embedded booking",
            body: "A polished scheduling experience that syncs to your existing calendar and confirms in seconds.",
          },
          {
            icon: <IconClock size={19} />,
            title: "Fewer no-shows",
            body: "Automated reminders and smart rescheduling keep your consultations full and punctual.",
          },
        ]}
        visual={<BookingVisual />}
      />

      <FeatureLayout
        id="crm"
        eyebrow="CRM"
        reversed
        title="One clean home for every relationship"
        description="A full CRM pipeline — Kanban and table views — with org-level isolation, so your team always knows where every prospect stands."
        items={[
          {
            icon: <IconUsers size={19} />,
            title: "Pipeline that reflects reality",
            body: "Drag-and-drop stages from New to Won, track pipeline value, and never lose a thread.",
          },
          {
            icon: <IconShield size={19} />,
            title: "Multi-tenant isolation",
            body: "Every firm's data is fully isolated. Your prospects and conversations stay yours alone.",
          },
        ]}
        visual={<CrmVisual />}
      />

      <FeatureLayout
        id="analytics"
        eyebrow="Analytics"
        title="See what's actually driving growth"
        description="Understand conversion at every stage with beautiful, information-dense dashboards — from campaign ROI to booking velocity."
        items={[
          {
            icon: <IconBarChart size={19} />,
            title: "Growth at a glance",
            body: "Track leads found, qualified, meetings booked, and pipeline value over time.",
          },
          {
            icon: <IconPie size={19} />,
            title: "Conversion intelligence",
            body: "Know which channels and messages perform — and double down where it matters.",
          },
        ]}
        visual={<AnalyticsVisual />}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* SECTION 10 — Security & Human Oversight                              */
/* ------------------------------------------------------------------ */

function Section10() {
  const items = [
    {
      icon: <IconCheck size={19} />,
      title: "Human approval before send",
      body: "Every outbound campaign requires firm-authorized review and approval before anything goes out.",
    },
    {
      icon: <IconMail size={19} />,
      title: "Unsubscribe & Do-Not-Contact",
      body: "Every message honors unsubscribe immediately, and a firm-wide DNC list guarantees no re-contact.",
    },
    {
      icon: <IconFileText size={19} />,
      title: "Full audit logs",
      body: "Every AI action, approval, and send is recorded in an immutable, reviewable audit trail.",
    },
    {
      icon: <IconLock size={19} />,
      title: "Encrypted & consent-aware",
      body: "Data is encrypted in transit and at rest, and every contact enters with clear, documented consent.",
    },
  ];
  return (
    <section id="security" className="border-t border-ink-100 bg-ink-50/50 py-20 sm:py-28 dark:border-ink-800/60 dark:bg-ink-950/40">
      <Section
        eyebrow="Security & Human Oversight"
        title="Powerful automation, with humans firmly in control"
        description="WealthFlow AI amplifies your team — it never replaces their judgment. Every financial message is educational, reviewed, and compliant."
      />
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 60}>
            <Card className="h-full">
              <CardHeader>
                <span className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
                  {it.icon}
                </span>
                <CardTitle>{it.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-400">{it.body}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
      <Reveal className="mx-auto mt-14 max-w-3xl px-5 text-center sm:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm text-ink-600 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300">
          <IconShield size={16} className="text-success" />
          We never recommend securities, promise returns, or infer financial data.
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* SECTION 11 — Pricing                                                 */
/* ------------------------------------------------------------------ */

const PLANS = [
  {
    name: "Starter",
    monthly: 99,
    tagline: "For solo advisors getting started.",
    features: [
      "500 prospects / month",
      "1 user",
      "Basic CRM",
      "AI lead research",
      "1 outreach campaign",
      "Basic analytics",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Growth",
    monthly: 249,
    tagline: "For growing firms that want more.",
    features: [
      "2,500 prospects / month",
      "3 users",
      "AI personalization",
      "Automated follow-ups",
      "Lead scoring",
      "Funnel builder",
      "Calendar integration",
      "Advanced analytics",
    ],
    cta: "Start Free",
    popular: true,
  },
  {
    name: "Pro",
    monthly: 499,
    tagline: "For established advisory teams.",
    features: [
      "10,000 prospects / month",
      "10 users",
      "Multiple campaigns",
      "Advanced AI research",
      "Custom qualification workflows",
      "Team collaboration",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Enterprise",
    monthly: null,
    tagline: "For firms & multi-org practices.",
    features: [
      "Custom lead volumes",
      "Multiple organizations",
      "Custom integrations",
      "SSO / SAML",
      "Dedicated support",
      "Custom workflows",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

function Pricing() {
  const [annual, setAnnual] = useState(true);
  return (
    <section id="pricing" className="py-20 sm:py-28">
      <Section
        eyebrow="Pricing"
        title="Simple plans that scale with your firm"
        description="Start free, upgrade when you're ready. Every plan includes a 14-day free trial, monthly or annual billing, and no hidden fees."
      />
      <div className="mb-10 flex items-center justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-ink-50 p-1 dark:border-ink-700 dark:bg-ink-900">
          <button
            onClick={() => setAnnual(false)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              !annual ? "bg-white text-ink-900 shadow-sm dark:bg-ink-800 dark:text-white" : "text-ink-500 dark:text-ink-400"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              annual ? "bg-white text-ink-900 shadow-sm dark:bg-ink-800 dark:text-white" : "text-ink-500 dark:text-ink-400"
            )}
          >
            Annual
            <span className="ml-1.5 text-xs font-bold text-success">−20%</span>
          </button>
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-5 sm:px-8 lg:grid-cols-4">
        {PLANS.map((p, i) => (
          <Reveal key={p.name} delay={i * 60}>
            <Card
              className={cn(
                "relative flex h-full flex-col p-6",
                p.popular && "border-brand-500 ring-1 ring-brand-500 shadow-glow"
              )}
            >
              {p.popular ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  Most popular
                </span>
              ) : null}
              <h3 className="text-lg font-semibold text-ink-900 dark:text-ink-100">{p.name}</h3>
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{p.tagline}</p>
              <div className="mt-5 flex items-end gap-1">
                {p.monthly ? (
                  <span className="text-4xl font-semibold tracking-tight text-ink-900 dark:text-white">
                    ${annual ? Math.round(p.monthly * 0.8) : p.monthly}
                  </span>
                ) : (
                  <span className="text-4xl font-semibold tracking-tight text-ink-900 dark:text-white">Custom</span>
                )}
                <span className="mb-1 text-sm text-ink-400">/mo</span>
              </div>
              {p.monthly ? (
                <p className="mt-1 text-xs text-ink-400">
                  {annual ? "billed annually" : "billed monthly"}
                </p>
              ) : (
                <p className="mt-1 text-xs text-ink-400">tailored to your firm</p>
              )}
              <ul className="mt-6 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-600 dark:text-ink-300">
                    <IconCheckCircle size={16} className="mt-0.5 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <ButtonLink
                href="/sign-up"
                variant={p.popular ? "primary" : p.monthly ? "outline" : "secondary"}
                className="mt-6 w-full"
              >
                {p.cta}
              </ButtonLink>
            </Card>
          </Reveal>
        ))}
      </div>
      <Reveal className="mx-auto mt-8 max-w-2xl px-5 text-center">
        <p className="text-xs text-ink-400 dark:text-ink-500">
          All paid plans include a 14-day free trial. Cancel anytime. Prices in USD.
        </p>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* SECTION 12 — FAQ                                                     */
/* ------------------------------------------------------------------ */

const FAQS = [
  {
    q: "Is WealthFlow AI a financial advisor?",
    a: "No. WealthFlow AI is a marketing, lead-generation, CRM, and workflow platform. It never recommends securities, provides buy/sell advice, promises returns, or infers a prospect's net worth, assets, or income. All financial content is educational and informational, designed to route decision-making to you and qualified financial professionals.",
  },
  {
    q: "How does human approval work before anything is sent?",
    a: "AI drafts outreach using your approved templates and prospect research, but nothing is sent automatically on first contact. A firm-authorized human reviews and approves each message (and each campaign) before it goes out. You are always the final gate.",
  },
  {
    q: "Does it comply with consent, unsubscribe, and Do-Not-Contact rules?",
    a: "Yes. Every contact enters with clear opt-in consent, every message includes an easy unsubscribe, negative or unsubscribe replies instantly stop sequences, and a firm-wide Do-Not-Contact list is enforced automatically. Full audit logs back it all up.",
  },
  {
    q: "What does pricing and contract look like?",
    a: "Plans start at $99/mo (Starter), $249/mo (Growth), and $499/mo (Pro), with Enterprise custom. All plans include a 14-day free trial with no credit card required, and you can choose monthly or annual billing. No long-term lock-in on the trial tiers.",
  },
  {
    q: "How is my data secured?",
    a: "Data is encrypted in transit and at rest, org data is fully isolated per firm (multi-tenant), and every AI action is recorded in an audit trail. We align with SOC 2-style security practices, and we never use your prospect data to train other customers' models.",
  },
  {
    q: "Do I need to connect Gmail or a calendar?",
    a: "For the full experience, yes — Growth and Pro plans integrate with your email and calendar so sequences can send (after your approval) and consultations can be booked and synced. You can use the CRM and analytics without connecting anything.",
  },
  {
    q: "What is demo mode?",
    a: "Demo mode loads a clearly labeled, fictional advisory firm — 'Northstar Wealth Partners' — with sample data so you can explore the full product before entering any real prospects. It is visibly marked as DEMO DATA and never mixes with your real data.",
  },
  {
    q: "Will this replace my advisors?",
    a: "No. WealthFlow AI automates the repetitive, manual parts of acquisition so your advisors can spend their time on high-value conversations and relationships. The human advisory relationship remains entirely in your hands.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold text-ink-900 dark:text-ink-100">{q}</span>
        <span className={cn("shrink-0 text-ink-400 transition-transform duration-200", open && "rotate-45")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </span>
      </button>
      {open ? (
        <div className="px-5 pb-5">
          <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-400">{a}</p>
        </div>
      ) : null}
    </Card>
  );
}

function Section12() {
  return (
    <section id="faq" className="border-t border-ink-100 bg-ink-50/50 py-20 sm:py-28 dark:border-ink-800/60 dark:bg-ink-950/40">
      <Section
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Everything you need to know about how WealthFlow AI works — and what it never does."
      />
      <div className="mx-auto w-full max-w-3xl space-y-3 px-5 sm:px-8">
        {FAQS.map((f, i) => (
          <Reveal key={f.q} delay={i * 30}>
            <FaqItem q={f.q} a={f.a} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CTA band                                                             */
/* ------------------------------------------------------------------ */

function Cta() {
  return (
    <section id="demo" className="py-20 sm:py-24">
      <Reveal className="mx-auto w-full max-w-5xl px-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-ink-950 px-6 py-16 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-30" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Turn qualified prospects into booked financial consultations — automatically.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-100/90">
              Start your 14-day free trial. No credit card, no investment advice
              generated — your humans stay in control.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/sign-up"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-6 text-base font-semibold text-ink-900 transition-colors hover:bg-ink-100"
              >
                Start Free
              </a>
              <a
                href="#pricing"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/30 px-6 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                View Pricing
              </a>
            </div>
            <p className="mt-6 text-xs text-brand-200/80">
              By continuing you agree to our terms &amp; privacy policy. We are a
              marketing/CRM tool, not an investment advisor.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE                                                                */
/* ------------------------------------------------------------------ */

function LandingPage() {
  return (
    <div className="min-h-dvh bg-white dark:bg-ink-950">
      <Nav />
      <main>
        <Hero />
        <Section1 />
        <Section2 />
        <Section36 />
        <Section10 />
        <Pricing />
        <Section12 />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
