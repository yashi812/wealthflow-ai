// ============================================================================
// WealthFlow AI — public demo fixtures (Stage 6).
//
// EVERYTHING in this file is fictional. "Northstar Wealth Partners", its team
// and its prospects do not exist. The demo route (/demo) renders the real app
// UI on top of this static data only — it never reads or writes the database,
// never creates an organization, and never touches a real tenant.
//
// Responsible-AI rules for these fixtures:
//   • No securities recommendations, no return promises, no buy/sell advice.
//   • No net worth / income / asset inference about any prospect. Scores are
//     based on business criteria (firm size, role, public activity) only.
//   • Every outreach draft is educational/informational, carries a disclaimer,
//     and is marked as requiring human approval before it is sent.
// ============================================================================

import type { CrmLead, LeadStatus } from "~/lib/leads/status";

export const DEMO_FIRM = {
  name: "Northstar Wealth Partners",
  tagline: "RIA · Boston, MA · 12 people",
  owner: "Dana Whitfield",
  ownerRole: "Managing Partner",
};

export const DEMO_DISCLAIMER =
  "This message is general information for financial professionals — not investment, tax or legal advice, and not a recommendation of any security or strategy. WealthFlow AI is a marketing and client-acquisition platform, not a financial advisor. Please consult a qualified financial professional before acting.";

export interface DemoDraft {
  subject: string;
  body: string;
  status: "awaiting" | "approved" | "sent";
  approvedBy?: string;
}

export interface DemoLead extends CrmLead {
  /** Public role at the prospect's firm. */
  role: string;
  /** AI research summary, built from public sources only. */
  research: string;
  /** Explained score components (0–100 total). */
  scoreReasons: string[];
  draft: DemoDraft;
}

function draft(
  first: string,
  subject: string,
  hook: string,
  cta: string,
  owner: string,
  status: DemoDraft["status"] = "awaiting",
  approvedBy?: string
): DemoDraft {
  return {
    status,
    approvedBy,
    subject,
    body: `Hi ${first},

${hook}

${cta}

${DEMO_DISCLAIMER}

— ${owner}, ${DEMO_FIRM.name}
Reply STOP or click Unsubscribe and we will not follow up again.`,
  };
}

type Seed = Omit<DemoLead, "email" | "phone" | "notes" | "doNotContact" | "unsubscribed" | "consentOk" | "updatedAt" | "ownerId"> & {
  emailHandle: string;
  phone?: string;
  notes?: string;
  doNotContact?: boolean;
  unsubscribed?: boolean;
  consentOk?: boolean;
};

function make(s: Seed): DemoLead {
  const domain = (s.company ?? "firm").toLowerCase().replace(/[^a-z]/g, "").slice(0, 14) + ".example";
  return {
    id: s.id,
    name: s.name,
    role: s.role,
    company: s.company,
    email: `${s.emailHandle}@${domain}`,
    phone: s.phone ?? null,
    source: s.source,
    leadScore: s.leadScore,
    status: s.status,
    ownerId: "demo-member-1",
    ownerName: s.ownerName,
    lastContact: s.lastContact,
    nextAction: s.nextAction,
    notes: s.notes ?? null,
    tags: s.tags,
    consentOk: s.consentOk ?? true,
    doNotContact: s.doNotContact ?? false,
    unsubscribed: s.unsubscribed ?? false,
    createdAt: s.createdAt,
    updatedAt: s.lastContact ?? s.createdAt,
    research: s.research,
    scoreReasons: s.scoreReasons,
    draft: s.draft,
  };
}

const DANA = "Dana Whitfield";
const LUIS = "Luis Ferrante";
const REBECCA = "Rebecca Cole";

export const DEMO_LEADS: DemoLead[] = [
  make({
    id: "demo-lead-01",
    name: "Marguerite Okafor",
    role: "Managing Partner",
    company: "Halcyon Family Office",
    emailHandle: "m.okafor",
    phone: "+1 617 555 0142",
    source: "LinkedIn",
    leadScore: 92,
    status: "MEETING_BOOKED",
    ownerName: DANA,
    lastContact: "2026-08-25T15:20:00Z",
    nextAction: "Discovery call Thursday 2:00 PM — send agenda",
    tags: ["family office", "succession", "high fit"],
    createdAt: "2026-08-11T09:10:00Z",
    research:
      "Halcyon Family Office is a 12-person multi-family office in Boston whose public site lists estate coordination, tax planning and business-owner transition work. The firm published two succession-planning notes this quarter and its Managing Partner spoke at a regional exit-planning event in June. No client portfolio, income or asset information is collected or inferred by WealthFlow AI.",
    scoreReasons: [
      "Managing Partner at a 12-person multi-family office — inside your ICP firm-size band",
      "Public succession-planning content published twice this quarter (strong buying signal)",
      "Booked a consultation within 3 hours of the first email",
      "Referred by an existing client — referral sources score highest in your ICP",
    ],
    draft: draft(
      "Marguerite",
      "Thursday's call — agenda and a short read-ahead",
      "Thanks for making time on Thursday. Ahead of our conversation I pulled together a one-page agenda covering how advisory firms are tightening follow-up on inbound referrals, plus the two questions most Managing Partners ask us first.",
      "If there is anything specific you would like covered, reply with a line and I will add it. Otherwise I will keep it to 25 minutes.",
      DANA,
      "approved",
      DANA
    ),
  }),
  make({
    id: "demo-lead-02",
    name: "Daniel Whitcomb",
    role: "Principal",
    company: "Whitcomb & Reed Advisors",
    emailHandle: "d.whitcomb",
    source: "Referral",
    leadScore: 88,
    status: "REPLIED",
    ownerName: DANA,
    lastContact: "2026-08-24T11:05:00Z",
    nextAction: "Reply to pricing question — offer two call slots",
    tags: ["referral", "6-person RIA"],
    createdAt: "2026-08-14T13:40:00Z",
    research:
      "Whitcomb & Reed Advisors is a 6-person RIA in Providence, RI, focused on retirement-income planning for senior professionals. The firm recently posted a Client Experience Coordinator role, which usually signals rising inbound volume. Public information only — no client financials are collected.",
    scoreReasons: [
      "Principal of a 6-person RIA — matches your ICP firm size",
      "Hiring for client experience suggests inbound volume is outgrowing manual follow-up",
      "Replied to the first email within 20 minutes",
      "Referred by an existing client",
    ],
    draft: draft(
      "Daniel",
      "Re: pricing and how the trial works",
      "Happy to answer directly: Starter is $99/month, Growth is $249/month and Pro is $499/month, all with a 14-day trial and no credit card to start. Most 6-person firms land on Growth because it includes follow-up automation and reply classification.",
      "Would Tuesday 10:00 AM or Wednesday 3:00 PM work for a 20-minute walkthrough? I will send a calendar invite for whichever you prefer.",
      DANA
    ),
  }),
  make({
    id: "demo-lead-03",
    name: "Priya Raghunathan",
    role: "Chief Operating Officer",
    company: "Beacon Ridge Wealth",
    emailHandle: "p.raghunathan",
    source: "Webinar",
    leadScore: 84,
    status: "QUALIFIED",
    ownerName: LUIS,
    lastContact: "2026-08-25T09:30:00Z",
    nextAction: "Qualified — route to Dana for a fit call",
    tags: ["webinar", "ops", "qualified"],
    createdAt: "2026-08-09T16:00:00Z",
    research:
      "Beacon Ridge Wealth is a 21-person advisory firm in Greater Boston with separate planning and operations teams. The COO attended the Q3 webinar on referral follow-up and asked two questions in the chat about reply triage. Business information from public sources only.",
    scoreReasons: [
      "COO — owns the process your product replaces, a strong decision-maker fit",
      "Attended the Q3 referral-follow-up webinar and asked two operational questions",
      "Firm size (21 people) sits at the top of your ICP band",
      "Engagement score high: webinar plus two email opens and one click",
    ],
    draft: draft(
      "Priya",
      "The reply-triage questions you asked in the webinar",
      "You asked how other firms route replies without an ops hire. The short version: classify on first reply (interested / not now / not a fit / opt-out), then auto-route only the interested ones to an advisor calendar.",
      "I put the two-slide version of that answer in a short note — want me to send it over, or would a 20-minute call be easier?",
      LUIS
    ),
  }),
  make({
    id: "demo-lead-04",
    name: "Tomas Lindqvist",
    role: "Founder",
    company: "Lindqvist Capital Partners",
    emailHandle: "t.lindqvist",
    source: "Content download",
    leadScore: 79,
    status: "CONTACTED",
    ownerName: LUIS,
    lastContact: "2026-08-22T14:15:00Z",
    nextAction: "Follow-up 2 of 3 — Thursday",
    tags: ["guide download", "founder"],
    createdAt: "2026-08-18T08:25:00Z",
    research:
      "Lindqvist Capital Partners is a 9-person advisory firm in southern New Hampshire serving business owners. Downloaded the 'Referral follow-up playbook' guide and opened the follow-up email twice. Public firm information only.",
    scoreReasons: [
      "Founder of a 9-person advisory firm — inside your ICP firm size",
      "Downloaded the referral follow-up playbook (direct intent signal)",
      "Opened the follow-up email twice within 48 hours",
      "Location matches your target geography (southern New Hampshire)",
    ],
    draft: draft(
      "Tomas",
      "Following up on the referral playbook",
      "You picked up the referral follow-up playbook last week. The part most founders react to is the 5-minute first-response target — firms that hit it book roughly twice as many consultations from the same referral volume.",
      "Want the one-page checklist that goes with it? Reply 'checklist' and I will send it, no call needed.",
      LUIS
    ),
  }),
  make({
    id: "demo-lead-05",
    name: "Aisha Bennett",
    role: "Partner",
    company: "Bennett Meridian Group",
    emailHandle: "a.bennett",
    source: "Referral",
    leadScore: 76,
    status: "NEW",
    ownerName: REBECCA,
    lastContact: null,
    nextAction: "Research queued — first email not yet drafted",
    tags: ["new", "research queued", "partner"],
    createdAt: "2026-08-26T07:45:00Z",
    research:
      "Bennett Meridian Group is a 14-person advisory firm in Boston with a planning-led practice. Added from a client referral yesterday; AI research is queued and the first draft has not been generated yet. Public information only.",
    scoreReasons: [
      "Partner at a 14-person firm — inside your ICP firm size band",
      "Referral source, which scores highest in your ICP weighting",
      "Boston — your primary target geography",
      "Data confidence medium: research queued, no engagement history yet",
    ],
    draft: draft(
      "Aisha",
      "Introduction from a mutual client",
      "A client of ours suggested we compare notes. We help advisory firms tighten follow-up on referrals so fewer warm introductions go cold — no advice, no portfolio work, just the acquisition workflow.",
      "Would a 20-minute call in the next two weeks be useful? Happy to work around your calendar.",
      REBECCA
    ),
  }),
  make({
    id: "demo-lead-06",
    name: "Nathan Osei",
    role: "Director of Client Experience",
    company: "Fairmont Wealth",
    emailHandle: "n.osei",
    source: "LinkedIn",
    leadScore: 74,
    status: "NEW",
    ownerName: LUIS,
    lastContact: null,
    nextAction: "Research queued — review before first send",
    tags: ["new", "ops", "linkedin"],
    createdAt: "2026-08-25T18:10:00Z",
    research:
      "Fairmont Wealth is an 11-person firm in Cambridge, MA. The Director of Client Experience posted publicly about consolidating three tools into one CRM. Research summary built from public posts only.",
    scoreReasons: [
      "Owns client experience — the exact role that buys this workflow",
      "Publicly posted about consolidating CRM tools (active evaluation signal)",
      "11-person firm — inside your ICP firm size band",
      "No email engagement yet, so intent score is provisional",
    ],
    draft: draft(
      "Nathan",
      "Your post about consolidating CRM tools",
      "You mentioned three tools that each hold a piece of the follow-up process. We take the acquisition half — prospect research, scoring, drafted outreach with human approval, and follow-up — and leave the servicing side alone.",
      "Worth a short call to see whether that split maps to what you are consolidating?",
      LUIS
    ),
  }),
  make({
    id: "demo-lead-07",
    name: "Clara Devereux",
    role: "Managing Director",
    company: "Devereux Advisory",
    emailHandle: "c.devereux",
    source: "Conference",
    leadScore: 71,
    status: "MEETING_BOOKED",
    ownerName: DANA,
    lastContact: "2026-08-25T12:00:00Z",
    nextAction: "Consultation Thursday 2:00 PM",
    tags: ["conference", "managing director"],
    createdAt: "2026-08-06T10:30:00Z",
    research:
      "Devereux Advisory is a 17-person firm in Boston that presented at the regional planning conference in July. Met at the conference booth and followed up the same day. Public firm information only.",
    scoreReasons: [
      "Managing Director at a 17-person firm — inside your ICP firm size band",
      "Met at the regional planning conference and asked about follow-up automation",
      "Replied to the same-day follow-up within an hour",
      "Consultation booked for Thursday — high intent",
    ],
    draft: draft(
      "Clara",
      "Confirming Thursday at 2:00 PM",
      "Confirming our consultation for Thursday at 2:00 PM. I will cover how firms run human-approved outreach at volume, and what the first two weeks look like if you start a trial.",
      "If the time needs to move, reply with two windows that work and I will rebook.",
      DANA,
      "sent"
    ),
  }),
  make({
    id: "demo-lead-08",
    name: "Ravi Menon",
    role: "Head of Growth",
    company: "Solstice Wealth Advisors",
    emailHandle: "r.menon",
    source: "Cold email",
    leadScore: 68,
    status: "CONTACTED",
    ownerName: LUIS,
    lastContact: "2026-08-21T16:40:00Z",
    nextAction: "Follow-up 1 of 3 — Tuesday",
    tags: ["growth", "cold email"],
    createdAt: "2026-08-19T09:05:00Z",
    research:
      "Solstice Wealth Advisors is a 24-person firm in Greater Boston with a dedicated growth function. Opened the first email but has not clicked. Public firm information only.",
    scoreReasons: [
      "Head of Growth — a role that owns acquisition metrics and budget",
      "Firm size 24 people sits at the top of your ICP band",
      "Opened the first email, no click yet — intent score mid-range",
      "Source is cold email, which your ICP weights below referral",
    ],
    draft: draft(
      "Ravi",
      "What 34% reply rates look like in practice",
      "Firms running researched, human-approved outreach see roughly a third of prospects reply, versus single digits for generic templates. The difference is the research step, not the copy.",
      "I can send the two-page breakdown of how that sequence is structured — want it?",
      LUIS
    ),
  }),
  make({
    id: "demo-lead-09",
    name: "Helena Vasquez",
    role: "Senior Advisor",
    company: "Vasquez Family Practice",
    emailHandle: "h.vasquez",
    source: "Referral",
    leadScore: 66,
    status: "NEW",
    ownerName: REBECCA,
    lastContact: null,
    nextAction: "Research queued — first email not yet drafted",
    tags: ["new", "referral"],
    createdAt: "2026-08-24T14:20:00Z",
    research:
      "Vasquez Family Practice is a 4-person advisory firm in Providence, RI. Referral from an existing client; the firm is below your ICP firm-size band but sits in your target geography. Public information only.",
    scoreReasons: [
      "Referral source — highest ICP weighting",
      "Providence, RI — inside your target geography",
      "4-person firm is below your ICP firm-size band, which caps the fit score",
      "No engagement history yet",
    ],
    draft: draft(
      "Helena",
      "Introduction — referral from a shared client",
      "A shared client suggested we talk. We help small advisory practices keep referral follow-up consistent without adding headcount or changing how you serve clients.",
      "Would a 15-minute call be useful, or would you rather I send a one-page overview first?",
      REBECCA
    ),
  }),
  make({
    id: "demo-lead-10",
    name: "Owen Traynor",
    role: "Founding Partner",
    company: "Traynor & Pike",
    emailHandle: "o.traynor",
    source: "Podcast guest",
    leadScore: 63,
    status: "NURTURE",
    ownerName: LUIS,
    lastContact: "2026-08-12T10:00:00Z",
    nextAction: "Nurture — revisit after Q4 planning season",
    tags: ["nurture", "not now"],
    createdAt: "2026-07-22T11:30:00Z",
    research:
      "Traynor & Pike is a 15-person firm in Boston. The founding partner replied 'not this quarter — ask me in Q4', so the lead was moved to nurture with follow-ups paused until October. Public firm information only.",
    scoreReasons: [
      "Founding Partner at a 15-person firm — inside your ICP firm-size band",
      "Replied 'not now' — timing objection, not a fit objection",
      "Engagement cooled after the first exchange",
      "Follow-ups paused until Q4 at the prospect's request",
    ],
    draft: draft(
      "Owen",
      "Checking back in October, as promised",
      "You asked me to come back after Q4 planning season. Picking that up now: the short version is that we handle research, scoring and human-approved follow-up so referral volume does not stall during busy quarters.",
      "If the timing is still wrong, reply 'later' and I will set the reminder out another quarter.",
      LUIS
    ),
  }),
  make({
    id: "demo-lead-11",
    name: "Sofia Marchetti",
    role: "Partner",
    company: "Marchetti Wealth Studio",
    emailHandle: "s.marchetti",
    source: "LinkedIn",
    leadScore: 61,
    status: "MEETING_COMPLETED",
    ownerName: DANA,
    lastContact: "2026-08-20T17:30:00Z",
    nextAction: "Send trial invite after the follow-up note",
    tags: ["discovery done", "trial candidate"],
    createdAt: "2026-08-01T09:15:00Z",
    research:
      "Marchetti Wealth Studio is an 8-person firm in Boston. Discovery call completed on 20 August; the partner asked for a trial before any commercial conversation. Public firm information only.",
    scoreReasons: [
      "Partner at an 8-person firm — inside your ICP firm-size band",
      "Discovery call completed and asked for a trial",
      "No budget objection raised",
      "Engagement steady rather than high, so intent score is mid-range",
    ],
    draft: draft(
      "Sofia",
      "Your trial invite, plus what to try first",
      "Here is the trial invite. If you only test one thing in the first week, test the approval queue: drafts land there for a human to approve before anything sends.",
      "The trial runs 14 days with no card on file. Tell me what you would like reviewed on day 7 and I will join for 15 minutes.",
      DANA,
      "approved",
      DANA
    ),
  }),
  make({
    id: "demo-lead-12",
    name: "Jonah Feldman",
    role: "Principal Advisor",
    company: "Feldman Ledger",
    emailHandle: "j.feldman",
    source: "Webinar",
    leadScore: 58,
    status: "CONTACTED",
    ownerName: LUIS,
    lastContact: "2026-08-18T13:25:00Z",
    nextAction: "Follow-up 2 of 3 — Wednesday",
    tags: ["webinar", "small firm"],
    createdAt: "2026-08-15T15:50:00Z",
    research:
      "Feldman Ledger is a 3-person advisory practice in Cambridge, MA. Attended the webinar but has not engaged with email. Public information only.",
    scoreReasons: [
      "3-person practice is below your ICP firm-size band",
      "Attended the webinar — some intent signal",
      "No email opens after two sends",
      "Geography matches your target",
    ],
    draft: draft(
      "Jonah",
      "One question after the webinar",
      "You stayed to the end of the webinar, so I will keep this short: for three-person practices the useful piece is usually the approval queue, because nothing sends without you reading it.",
      "Want me to send the 4-step setup for a small practice, or is this not a priority right now?",
      LUIS
    ),
  }),
  make({
    id: "demo-lead-13",
    name: "Beatrice Nwosu",
    role: "Managing Partner",
    company: "Cedarline Advisors",
    emailHandle: "b.nwosu",
    source: "Referral",
    leadScore: 55,
    status: "NURTURE",
    ownerName: REBECCA,
    lastContact: "2026-08-08T09:40:00Z",
    nextAction: "Nurture — quarterly check-in",
    tags: ["nurture", "long cycle"],
    createdAt: "2026-06-30T12:00:00Z",
    research:
      "Cedarline Advisors is a 19-person firm in Boston that is mid-way through a CRM migration. Asked to be revisited once the migration closes. Public firm information only.",
    scoreReasons: [
      "Managing Partner at a 19-person firm — inside your ICP firm-size band",
      "Mid-migration: the timing objection is real, not a fit objection",
      "Referral source, so fit remains strong",
      "Engagement paused at the prospect's request",
    ],
    draft: draft(
      "Beatrice",
      "Once the migration closes",
      "You asked me to check back after the CRM migration. No pitch here — just confirming we are still on your list for the follow-up workflow once the dust settles.",
      "Reply with a month that works and I will hold the reminder until then.",
      REBECCA
    ),
  }),
  make({
    id: "demo-lead-14",
    name: "Elliot Grayson",
    role: "Founder",
    company: "Grayson Fiduciary",
    emailHandle: "e.grayson",
    source: "Content download",
    leadScore: 49,
    status: "LOST",
    ownerName: LUIS,
    lastContact: "2026-08-05T16:10:00Z",
    nextAction: "Closed — chose an in-house build",
    tags: ["lost", "in-house build"],
    createdAt: "2026-07-14T08:45:00Z",
    research:
      "Grayson Fiduciary is a 7-person firm in Boston. Declined after evaluating, citing an internal build. Closed as lost with a reason recorded. Public firm information only.",
    scoreReasons: [
      "Founder of a 7-person firm — inside your ICP firm-size band",
      "Downloaded two guides, so intent was present",
      "Declined on build-versus-buy, not on price or fit",
      "Closed as lost — kept for win/loss reporting",
    ],
    draft: draft(
      "Elliot",
      "Closing the loop",
      "Thanks for the straight answer on building in-house. I have closed the file and stopped the sequence so you do not get more email.",
      "If the build gets expensive to maintain, my door is open — no follow-up from me until you ask.",
      LUIS,
      "sent"
    ),
  }),
  make({
    id: "demo-lead-15",
    name: "Yuki Tanaka",
    role: "Chief Operating Officer",
    company: "Northbridge Planning",
    emailHandle: "y.tanaka",
    source: "Conference",
    leadScore: 44,
    status: "NEW",
    ownerName: REBECCA,
    lastContact: null,
    nextAction: "Research queued — verify firm size before outreach",
    tags: ["new", "verify fit"],
    createdAt: "2026-08-23T11:15:00Z",
    research:
      "Northbridge Planning is a 30-person firm in Greater Boston; the badge scan from the conference did not confirm which team owns acquisition. Research queued, fit unconfirmed. Public information only.",
    scoreReasons: [
      "30-person firm is above your ICP firm-size band, which lowers fit",
      "Conference badge scan only — data confidence low",
      "COO role is a strong decision-maker match",
      "No engagement history yet",
    ],
    draft: draft(
      "Yuki",
      "Quick question after the conference",
      "We met briefly at the conference. Before I send anything longer: does acquisition sit with you, or with a growth lead on your team?",
      "One line back is plenty — I will tailor from there or step out of your inbox.",
      REBECCA
    ),
  }),
  make({
    id: "demo-lead-16",
    name: "Marcus Adeyemi",
    role: "Partner",
    company: "Adeyemi & Co",
    emailHandle: "m.adeyemi",
    source: "Cold email",
    leadScore: 38,
    status: "DO_NOT_CONTACT",
    ownerName: LUIS,
    lastContact: "2026-08-17T10:05:00Z",
    nextAction: "Opted out — all sequences stopped",
    tags: ["opt-out", "do not contact"],
    createdAt: "2026-08-16T09:00:00Z",
    research:
      "Opted out after the first email. All sequences stopped automatically and the record is retained only so the opt-out is honoured. Public firm information only.",
    scoreReasons: [
      "Unsubscribed on the first email — all follow-ups stopped automatically",
      "Opt-out is permanent and overrides every other score component",
      "Record retained so the do-not-contact state is never lost",
      "Excluded from every campaign and send count",
    ],
    draft: draft(
      "Marcus",
      "You are off the list",
      "Confirmed — you have been removed and will not receive further email from us.",
      "If anything changes on your side, you are welcome to reach out and we will pick it up from there.",
      LUIS,
      "sent"
    ),
    doNotContact: true,
    unsubscribed: true,
    consentOk: false,
  }),
  make({
    id: "demo-lead-17",
    name: "Fiona Castellanos",
    role: "Managing Partner",
    company: "Castellanos Wealth",
    emailHandle: "f.castellanos",
    source: "Referral",
    leadScore: 90,
    status: "CLIENT",
    ownerName: DANA,
    lastContact: "2026-08-19T14:00:00Z",
    nextAction: "Onboarded — Growth plan, annual billing",
    tags: ["client", "growth plan"],
    createdAt: "2026-07-02T10:20:00Z",
    research:
      "Castellanos Wealth is a 16-person firm in Boston. Converted from a referral in July and is on the Growth plan. Public firm information only.",
    scoreReasons: [
      "Managing Partner at a 16-person firm — inside your ICP firm-size band",
      "Referral source, highest ICP weighting",
      "Full sequence engagement before conversion",
      "Converted to a paying client in July",
    ],
    draft: draft(
      "Fiona",
      "Month two check-in",
      "Two months in — the referral sequence is running and the approval queue is clearing daily. Nothing needs action from you.",
      "If you want the follow-up cadence tightened from 3 days to 2, reply and I will change it.",
      DANA,
      "sent"
    ),
  }),
];

/** Small helper for the demo pages. */
export function leadsByStatus(status: LeadStatus): DemoLead[] {
  return DEMO_LEADS.filter((l) => l.status === status);
}

export const DEMO_KPIS = [
  { label: "New prospects this week", value: "24", delta: "+9 vs last week", hint: "Added from referral, LinkedIn, webinar and content" },
  { label: "Avg. lead score", value: "71", delta: "out of 100", hint: "ICP fit, engagement and data confidence" },
  { label: "Reply rate", value: "34%", delta: "+6 pts vs last month", hint: "Replies per email sent, all sequences" },
  { label: "Consultations booked", value: "9", delta: "+3 vs last week", hint: "Calendar bookings in the last 14 days" },
  { label: "Active pipeline", value: "17", delta: "prospects, not dollars", hint: "Leads currently in a live stage" },
];

export const DEMO_TREND = [
  { day: "Thu", n: 3 },
  { day: "Fri", n: 4 },
  { day: "Sat", n: 1 },
  { day: "Sun", n: 2 },
  { day: "Mon", n: 5 },
  { day: "Tue", n: 4 },
  { day: "Wed", n: 5 },
];

export const DEMO_ACTIVITY = [
  { when: "12 min ago", what: "AI research completed for Marguerite Okafor — score 92", who: "WealthFlow AI" },
  { when: "48 min ago", what: "Reply classified as “Interested — asked for pricing” for Daniel Whitcomb", who: "WealthFlow AI" },
  { when: "2 hrs ago", what: "Draft outreach approved by Dana Whitfield for Sofia Marchetti", who: "Dana Whitfield" },
  { when: "3 hrs ago", what: "Consultation booked — Thursday 2:00 PM with Clara Devereux", who: "Calendar" },
  { when: "Yesterday", what: "Follow-up sequence stopped — Marcus Adeyemi opted out (Do Not Contact)", who: "WealthFlow AI" },
  { when: "Yesterday", what: "New prospect added from a client referral: Aisha Bennett", who: "Rebecca Cole" },
];

export const DEMO_ICP = {
  firm: DEMO_FIRM.name,
  updated: "Updated 18 Aug 2026 by Dana Whitfield",
  fields: [
    { label: "Target client type", value: "Business owners and senior professionals preparing for a transition or exit" },
    { label: "Client portfolio band (firm-defined target)", value: "$1M–$10M investable — a targeting criterion the firm sets, not data about any prospect" },
    { label: "Geography", value: "Greater Boston, Rhode Island and southern New Hampshire" },
    { label: "Decision-maker roles", value: "Managing Partner, Founder, Principal Advisor, COO" },
    { label: "Target firm size", value: "5–25 person RIAs and multi-family offices" },
    { label: "Service lines", value: "Retirement-income planning, business succession and exit planning, estate coordination, tax-aware planning" },
    { label: "Pain points", value: "Referral follow-up slips, no CRM discipline, growth depends on the founder's calendar" },
    { label: "Buying signals", value: "Hiring a client-experience role, publishing succession content, asking about follow-up automation" },
    { label: "Outreach tone", value: "Consultative and concise — no hype, no performance claims" },
    { label: "Follow-up cadence", value: "Every 3 days, max 20 sends per day, human approval required before every send" },
  ],
};
