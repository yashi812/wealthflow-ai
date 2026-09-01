// ============================================================================
// WealthFlow AI — CRM server functions (Stage 4)
//
// Leads / pipeline data access for the signed-in org only. Every function is
// scoped by `organization_id` from the session (multi-tenant isolation); a
// lead id passed in is always checked against the org before any read/write.
//
// Responsibilities: listLeads (search/filter/sort), createLead, updateLead
// (status/notes/tags/owner/next_action), activity read/write, org metadata
// (sources + team members) and dashboard KPIs. Status changes write a
// lead_activity entry AND an audit_logs row; all outbound consent flags are
// surfaced to the UI so DO_NOT_CONTACT/unsubscribed leads are never worked.
// ============================================================================
import { createServerFn } from "@tanstack/react-start";
import { sql } from "~/db";
import { withSession, unauthorized, type SessionPayload } from "~/lib/auth/session";
import { jsonError, isEmail } from "~/lib/auth/validate";
import { ALL_STATUSES, type CrmLead, type CrmActivity, type LeadStatus } from "~/lib/leads/status";

// --- helpers -----------------------------------------------------------------

function legitStatus(s: string): s is LeadStatus {
  return (ALL_STATUSES as string[]).includes(s);
}

/** Coerce a raw DB row into the JSON-safe CrmLead shape. */
function toLead(row: any): CrmLead {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    company: row.company ? String(row.company) : null,
    email: row.email ? String(row.email) : null,
    phone: row.phone ? String(row.phone) : null,
    source: row.source ? String(row.source) : null,
    leadScore: Number(row.lead_score ?? 0),
    status: (legitStatus(String(row.status)) ? row.status : "NEW") as LeadStatus,
    ownerId: row.owner ? String(row.owner) : null,
    ownerName: row.owner_name ? String(row.owner_name) : null,
    lastContact: row.last_contact ? String(row.last_contact) : null,
    nextAction: row.next_action ? String(row.next_action) : null,
    notes: row.notes ? String(row.notes) : null,
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    consentOk: Boolean(row.consent_ok),
    doNotContact: Boolean(row.do_not_contact),
    unsubscribed: Boolean(row.unsubscribed),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

/** Accept a tags array OR a comma-separated string (the UI sends both forms). */
function parseTags(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map((t) => String(t).trim()).filter(Boolean).slice(0, 12);
  }
  const v = String(input ?? "").trim();
  if (!v) return [];
  return v
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function activityMeta(m: unknown): Record<string, unknown> {
  if (m && typeof m === "object") return m as Record<string, unknown>;
  try {
    return JSON.parse(String(m ?? "{}"));
  } catch {
    return {};
  }
}

async function audit(
  db: ReturnType<typeof sql>,
  entry: { organization_id: string | null; user_id: string | null; action: string; meta?: unknown }
): Promise<void> {
  try {
    await db`
      INSERT INTO audit_logs (organization_id, user_id, action, ip, user_agent, meta)
      VALUES (${entry.organization_id}, ${entry.user_id}, ${entry.action}, 'app', 'crm',
              ${JSON.stringify(entry.meta ?? {})})
    `;
  } catch (e) {
    console.error("audit write failed:", e);
  }
}

// --- list --------------------------------------------------------------------

export interface ListLeadsInput {
  search?: string;
  status?: string;
  source?: string;
  sort?: string; // column key, whitelisted below
  order?: "asc" | "desc";
}

// sort column key -> SQL expression (whitelisted; no user text reaches SQL)
const SORT_WHITELIST: Record<string, string> = {
  name: "l.name",
  company: "l.company",
  email: "l.email",
  source: "l.source",
  score: "l.lead_score",
  status: "l.status",
  owner: "u.name",
  created: "l.created_at",
  lastContact: "l.last_contact",
};

export const listLeads = createServerFn({ method: "GET" })
  .middleware([withSession])
  .validator((d: unknown) => d)
  .handler(async ({ data, context }) => {
    const s = context.session as SessionPayload | null;
    if (!s?.oid) return unauthorized();
    const input = (data ?? {}) as ListLeadsInput;
    const db = sql();

    const where = ["l.organization_id = $oid"];
    const params: Record<string, unknown> = { oid: s.oid };

    const term = String(input.search ?? "").trim();
    if (term) {
      where.push(
        "(l.name ILIKE $term OR l.company ILIKE $term OR l.email ILIKE $term OR " +
          "l.phone ILIKE $term OR l.next_action ILIKE $term OR l.notes ILIKE $term OR " +
          "l.tags::text ILIKE $term)"
      );
      params.term = `%${term}%`;
    }
    if (String(input.status ?? "")) {
      if (!legitStatus(String(input.status))) return jsonError(400, "Invalid status filter.");
      where.push("l.status = $status");
      params.status = String(input.status);
    }
    if (String(input.source ?? "")) {
      where.push("l.source = $source");
      params.source = String(input.source);
    }

    const sortKey = SORT_WHITELIST[String(input.sort ?? "created")] ?? SORT_WHITELIST.created;
    const order = String(input.order ?? "desc") === "asc" ? "ASC" : "DESC";

    const rows = await db.query(
      `SELECT l.*, u.name AS owner_name
       FROM leads l
       LEFT JOIN users u ON u.id = l.owner
       WHERE ${where.join(" AND ")}
       ORDER BY ${sortKey} ${order} NULLS LAST, l.created_at DESC
       LIMIT 500`,
      params
    );
    return { leads: rows.map(toLead) };
  });

// --- create ------------------------------------------------------------------

export const createLead = createServerFn({ method: "POST" })
  .middleware([withSession])
  .validator((d: unknown) => d)
  .handler(async ({ data, context }) => {
    const s = context.session as SessionPayload | null;
    if (!s?.oid) return unauthorized();
    const d = (data ?? {}) as {
      name?: unknown;
      company?: unknown;
      email?: unknown;
      phone?: unknown;
      source?: unknown;
      tags?: unknown;
      status?: unknown;
      notes?: unknown;
      consentOk?: unknown;
    };
    const name = String(d.name ?? "").trim();
    if (!name || name.length > 160) return jsonError(400, "A prospect name is required (max 160 chars).");
    const email = String(d.email ?? "").trim();
    if (email && !isEmail(email)) return jsonError(400, "Enter a valid email address.");
    const status = String(d.status ?? "NEW");
    if (!legitStatus(status)) return jsonError(400, "Invalid status.");

    const tags = parseTags(d.tags);

    const db = sql();
    const [row] = await db`
      INSERT INTO leads (
        organization_id, name, company, email, phone, source, status, owner,
        notes, tags, consent_ok
      ) VALUES (
        ${s.oid}, ${name},
        ${String(d.company ?? "").trim() || null},
        ${email || null},
        ${String(d.phone ?? "").trim() || null},
        ${String(d.source ?? "").trim() || null},
        ${status}, ${s.uid},
        ${String(d.notes ?? "").trim() || null},
        ${tags},
        ${Boolean(d.consentOk)}
      )
      RETURNING *
    `;
    const lead = toLead(row);

    await db`
      INSERT INTO lead_activities (organization_id, lead_id, user_id, type, summary, meta)
      VALUES (${s.oid}, ${lead.id}, ${s.uid}, 'created',
              ${`Lead "${lead.name}" added to pipeline`},
              ${JSON.stringify({ status: lead.status, source: lead.source ?? "" }) })
    `;
    await audit(db, { organization_id: s.oid, user_id: s.uid, action: "lead_created", meta: { lead_id: lead.id, name: lead.name } });
    return { lead };
  });

// --- update ------------------------------------------------------------------

export interface UpdateLeadInput {
  id?: unknown;
  name?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  source?: unknown;
  status?: unknown;
  notes?: unknown;
  nextAction?: unknown;
  tags?: unknown;
  owner?: unknown; // user id or null
  consentOk?: unknown;
}

export const updateLead = createServerFn({ method: "POST" })
  .middleware([withSession])
  .validator((d: unknown) => d)
  .handler(async ({ data, context }) => {
    const s = context.session as SessionPayload | null;
    if (!s?.oid) return unauthorized();
    const d = (data ?? {}) as UpdateLeadInput;
    const id = String(d.id ?? "");
    if (!id) return jsonError(400, "Lead id is required.");

    const db = sql();
    const existing = (await db`SELECT * FROM leads WHERE id = ${id} AND organization_id = ${s.oid} LIMIT 1`)[0];
    if (!existing) return jsonError(404, "Lead not found.");

    const sets: string[] = [];
    const params: Record<string, unknown> = {};
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    let dirty = false;

    if (d.status !== undefined) {
      const status = String(d.status);
      if (!legitStatus(status)) return jsonError(400, "Invalid status.");
      if (String(existing.status) !== status) {
        sets.push("status = $status");
        params.status = status;
        changes.status = { from: String(existing.status), to: status };
        dirty = true;
      }
    }
    if (d.name !== undefined) {
      const name = String(d.name).trim();
      if (!name || name.length > 160) return jsonError(400, "Name is required.");
      if (String(existing.name) !== name) {
        sets.push("name = $name");
        params.name = name;
        changes.name = { from: String(existing.name), to: name };
        dirty = true;
      }
    }
    if (d.company !== undefined) {
      const v = String(d.company).trim() || null;
      sets.push("company = $company");
      params.company = v;
      changes.company = { from: existing.company ?? null, to: v };
      dirty = true;
    }
    if (d.email !== undefined) {
      const v = String(d.email).trim() || null;
      if (v && !isEmail(v)) return jsonError(400, "Enter a valid email address.");
      sets.push("email = $email");
      params.email = v;
      changes.email = { from: existing.email ?? null, to: v };
      dirty = true;
    }
    if (d.phone !== undefined) {
      const v = String(d.phone).trim() || null;
      sets.push("phone = $phone");
      params.phone = v;
      changes.phone = { from: existing.phone ?? null, to: v };
      dirty = true;
    }
    if (d.source !== undefined) {
      const v = String(d.source).trim() || null;
      sets.push("source = $source");
      params.source = v;
      changes.source = { from: existing.source ?? null, to: v };
      dirty = true;
    }
    if (d.notes !== undefined) {
      const v = String(d.notes).trim() || null;
      sets.push("notes = $notes");
      params.notes = v;
      changes.notes = { from: existing.notes ?? null, to: v };
      dirty = true;
    }
    if (d.nextAction !== undefined) {
      const v = String(d.nextAction).trim() || null;
      sets.push("next_action = $next_action");
      params.next_action = v;
      changes.next_action = { from: existing.next_action ?? null, to: v };
      dirty = true;
    }
    if (d.owner !== undefined) {
      const v = d.owner === null || d.owner === "" ? null : String(d.owner);
      if (v) {
        const member = (await db`
          SELECT 1 FROM team_members WHERE organization_id = ${s.oid} AND user_id = ${v} LIMIT 1
        `)[0];
        if (!member) return jsonError(400, "Owner must be a member of your firm.");
      }
      sets.push("owner = $owner");
      params.owner = v;
      changes.owner = { from: existing.owner ? String(existing.owner) : null, to: v };
      dirty = true;
    }
    if (d.tags !== undefined) {
      const v = parseTags(d.tags);
      sets.push("tags = $tags");
      params.tags = v;
      changes.tags = { from: existing.tags ?? [], to: v };
      dirty = true;
    }
    if (d.consentOk !== undefined) {
      sets.push("consent_ok = $consent_ok");
      params.consent_ok = Boolean(d.consentOk);
      dirty = true;
    }

    if (!dirty) return { lead: toLead(existing), changedStatus: false };

    // Every pipeline move "touches" the lead: bump updated_at, and a status
    // change additionally records last_contact.
    sets.push("updated_at = now()");
    const hasStatusChange = !!changes.status;
    if (hasStatusChange) sets.push("last_contact = now()");

    const [row] = await db.query(
      `UPDATE leads SET ${sets.join(", ")}
       WHERE id = $id AND organization_id = $oid
       RETURNING *`,
      { ...params, id, oid: s.oid }
    );
    const lead = toLead(row);

    if (hasStatusChange) {
      await db`
        INSERT INTO lead_activities (organization_id, lead_id, user_id, type, summary, meta)
        VALUES (${s.oid}, ${lead.id}, ${s.uid}, 'status_change',
                ${`Status moved: ${String(changes.status!.from)} → ${String(changes.status!.to)}`},
                ${JSON.stringify(changes.status) })
      `;
      await audit(db, {
        organization_id: s.oid,
        user_id: s.uid,
        action: "lead_status_change",
        meta: { lead_id: lead.id, from: changes.status!.from, to: changes.status!.to },
      });
    } else if (changes.notes) {
      await db`
        INSERT INTO lead_activities (organization_id, lead_id, user_id, type, summary, meta)
        VALUES (${s.oid}, ${lead.id}, ${s.uid}, 'note', ${"Notes updated"}, ${JSON.stringify({}) })
      `;
    }

    return { lead, changedStatus: hasStatusChange };
  });

// --- activity ----------------------------------------------------------------

export const getLeadActivity = createServerFn({ method: "GET" })
  .middleware([withSession])
  .validator((d: unknown) => d)
  .handler(async ({ data, context }) => {
    const s = context.session as SessionPayload | null;
    if (!s?.oid) return unauthorized();
    const leadId = String((data as any)?.leadId ?? "");
    if (!leadId) return jsonError(400, "Lead id is required.");
    const db = sql();
    const rows = await db.query(
      `SELECT la.*, u.name AS user_name
       FROM lead_activities la
       LEFT JOIN users u ON u.id = la.user_id
       WHERE la.lead_id = $leadId AND la.organization_id = $oid
       ORDER BY la.created_at DESC
       LIMIT 200`,
      { leadId, oid: s.oid }
    );
    const activities: CrmActivity[] = rows.map((r: any) => ({
      id: String(r.id),
      type: String(r.type ?? "note"),
      summary: r.summary ? String(r.summary) : null,
      meta: activityMeta(r.meta),
      createdAt: String(r.created_at),
      userName: r.user_name ? String(r.user_name) : null,
    }));
    return { activities };
  });

export const addActivity = createServerFn({ method: "POST" })
  .middleware([withSession])
  .validator((d: unknown) => d)
  .handler(async ({ data, context }) => {
    const s = context.session as SessionPayload | null;
    if (!s?.oid) return unauthorized();
    const d = (data ?? {}) as { leadId?: unknown; summary?: unknown; type?: unknown };
    const leadId = String(d.leadId ?? "");
    const summary = String(d.summary ?? "").trim();
    if (!leadId) return jsonError(400, "Lead id is required.");
    if (!summary || summary.length > 2000) return jsonError(400, "Note must be 1–2000 characters.");

    const db = sql();
    const exists = (await db`SELECT 1 FROM leads WHERE id = ${leadId} AND organization_id = ${s.oid} LIMIT 1`)[0];
    if (!exists) return jsonError(404, "Lead not found.");

    const type = String(d.type ?? "note");
    const [row] = await db`
      INSERT INTO lead_activities (organization_id, lead_id, user_id, type, summary, meta)
      VALUES (${s.oid}, ${leadId}, ${s.uid}, ${type}, ${summary}, ${JSON.stringify({}) })
      RETURNING *
    `;
    return {
      activity: {
        id: String(row.id),
        type: String(row.type),
        summary: String(row.summary ?? ""),
        meta: activityMeta(row.meta),
        createdAt: String(row.created_at),
        userName: s.name ?? null,
      } as CrmActivity,
    };
  });

// --- org metadata (sources + team for owner assignment) ------------------------

export const getCrmMeta = createServerFn({ method: "GET" })
  .middleware([withSession])
  .validator((d: unknown) => d)
  .handler(async ({ context }) => {
    const s = context.session as SessionPayload | null;
    if (!s?.oid) return unauthorized();
    const db = sql();
    const sourceRows = await db.query(
      `SELECT DISTINCT source FROM leads WHERE organization_id = $oid AND source IS NOT NULL AND source <> '' ORDER BY source`,
      { oid: s.oid }
    );
    const configured = await db`SELECT name FROM lead_sources WHERE organization_id = ${s.oid} AND is_active ORDER BY name`;
    const members = await db.query(
      `SELECT u.id, u.name, u.email, tm.role
       FROM team_members tm JOIN users u ON u.id = tm.user_id
       WHERE tm.organization_id = $oid
       ORDER BY u.name`,
      { oid: s.oid }
    );
    const sources: string[] = [];
    for (const r of [...configured, ...sourceRows]) {
      const n = String(r.name ?? r.source ?? "").trim();
      if (n && !sources.includes(n)) sources.push(n);
    }
    return {
      sources,
      members: members.map((m: any) => ({
        id: String(m.id),
        name: String(m.name ?? m.email),
        email: String(m.email ?? ""),
        role: String(m.role ?? "member"),
      })),
    };
  });

// --- dashboard KPIs -----------------------------------------------------------

export const getLeadStats = createServerFn({ method: "GET" })
  .middleware([withSession])
  .validator((d: unknown) => d)
  .handler(async ({ context }) => {
    const s = context.session as SessionPayload | null;
    if (!s?.oid) return unauthorized();
    const db = sql();
    const rows = await db.query(
      `SELECT status, count(*)::int AS n FROM leads WHERE organization_id = $oid GROUP BY status`,
      { oid: s.oid }
    );
    const byStatus: Record<string, number> = {};
    let total = 0;
    for (const r of rows as any[]) {
      byStatus[String(r.status)] = Number(r.n);
      total += Number(r.n);
    }
    const active = (st: string) => byStatus[st] ?? 0;
    const clients = active("CLIENT");
    const conversion = total > 0 ? Math.round((clients / total) * 1000) / 10 : 0;

    const scoreRow = (
      await db.query(`SELECT avg(lead_score)::float AS avg_score FROM leads WHERE organization_id = $oid`, {
        oid: s.oid,
      })
    )[0] as any;
    const avgScore = scoreRow?.avg_score ? Math.round(Number(scoreRow.avg_score)) : null;

    return {
      total,
      new: active("NEW"),
      contacted: active("CONTACTED"),
      replied: active("REPLIED"),
      qualified: active("QUALIFIED"),
      meetingsBooked: active("MEETING_BOOKED"),
      meetingsCompleted: active("MEETING_COMPLETED"),
      clients,
      nurture: active("NURTURE"),
      lost: active("LOST"),
      doNotContact: active("DO_NOT_CONTACT"),
      conversionPct: conversion,
      avgScore,
      byStatus,
    };
  });