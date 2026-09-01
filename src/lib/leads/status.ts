// ============================================================================
// WealthFlow AI — CRM pipeline status metadata (shared client+server).
// Mirrors the `lead_status` enum in the DB. Used for badge tones, column
// ordering, labels and filter options across the table / Kanban / detail views.
// ============================================================================

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "REPLIED"
  | "QUALIFIED"
  | "MEETING_BOOKED"
  | "MEETING_COMPLETED"
  | "CLIENT"
  | "NURTURE"
  | "LOST"
  | "DO_NOT_CONTACT";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "accent";

export interface StatusMeta {
  value: LeadStatus;
  label: string;
  tone: BadgeTone;
  /** Which column groups this status lives in. */
  stage: "active" | "other";
}

/** Order of the Kanban columns — active funnel first, then secondary statuses. */
export const ACTIVE_STATUSES: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "REPLIED",
  "QUALIFIED",
  "MEETING_BOOKED",
  "MEETING_COMPLETED",
  "CLIENT",
];

export const OTHER_STATUSES: LeadStatus[] = ["NURTURE", "LOST", "DO_NOT_CONTACT"];

export const ALL_STATUSES: LeadStatus[] = [...ACTIVE_STATUSES, ...OTHER_STATUSES];

export const LEAD_STATUS_META: Record<LeadStatus, StatusMeta> = {
  NEW: { value: "NEW", label: "New", tone: "brand", stage: "active" },
  CONTACTED: { value: "CONTACTED", label: "Contacted", tone: "accent", stage: "active" },
  REPLIED: { value: "REPLIED", label: "Replied", tone: "accent", stage: "active" },
  QUALIFIED: { value: "QUALIFIED", label: "Qualified", tone: "success", stage: "active" },
  MEETING_BOOKED: { value: "MEETING_BOOKED", label: "Meeting booked", tone: "success", stage: "active" },
  MEETING_COMPLETED: { value: "MEETING_COMPLETED", label: "Meeting completed", tone: "success", stage: "active" },
  CLIENT: { value: "CLIENT", label: "Client", tone: "success", stage: "active" },
  NURTURE: { value: "NURTURE", label: "Nurture", tone: "warning", stage: "other" },
  LOST: { value: "LOST", label: "Lost", tone: "danger", stage: "other" },
  DO_NOT_CONTACT: { value: "DO_NOT_CONTACT", label: "Do not contact", tone: "danger", stage: "other" },
};

export function statusMeta(s: string): StatusMeta {
  return LEAD_STATUS_META[s as LeadStatus] ?? { value: s as LeadStatus, label: s, tone: "neutral", stage: "other" };
}

/** Badge tone for a numeric lead score. */
export function scoreTone(score: number): BadgeTone {
  if (score >= 70) return "success";
  if (score >= 40) return "warning";
  return "neutral";
}

/** A lead as returned by the CRM server layer (all values JSON-safe strings). */
export interface CrmLead {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  leadScore: number;
  status: LeadStatus;
  ownerId: string | null;
  ownerName: string | null;
  lastContact: string | null;
  nextAction: string | null;
  notes: string | null;
  tags: string[];
  consentOk: boolean;
  doNotContact: boolean;
  unsubscribed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrmActivity {
  id: string;
  type: string;
  summary: string | null;
  meta: Record<string, unknown>;
  createdAt: string;
  userName: string | null;
}
