// ============================================================================
// WealthFlow AI — Ideal Client Profile (ICP) server functions
//
// Reads / upserts the firm's Ideal Client Profile for the signed-in org. The
// ICP is the set of business/professional characteristics used to find,
// research, score and personalize outreach for prospects (Stage 5+). It is
// deliberately about BUSINESS/PROFESSIONAL criteria only — no sensitive
// personal financial data (net worth / assets / income) is required as a
// precondition, per Responsible-AI constraints.
//
// The 10 onboarding fields:
//   1. Firm name            -> organizations.name
//   2. Website              -> organizations.website
//   3. Firm type            -> ideal_client_profiles.firm_type
//   4. Target client type   -> ideal_client_profiles.target_client_type
//   5. Geographic market    -> ideal_client_profiles.target_location
//   6. Minimum client profile (business characteristics)
//                          -> ideal_client_profiles.min_client_profile
//   7. Services offered     -> ideal_client_profiles.services
//   8. Calendar URL         -> ideal_client_profiles.calendar_url
//   9. Email account        -> ideal_client_profiles.email_account
//  10. Outreach preferences -> tone / cadence / send limit / auto-followups
//                          -> outreach_tone, followup_cadence_days,
//                             daily_send_limit, auto_followups
// ============================================================================
import { createServerFn } from "@tanstack/react-start";
import { sql } from "~/db";
import { requireAccount } from "~/lib/auth/account";
import { jsonError } from "~/lib/auth/validate";

export interface IcpFormData {
  firmName: string;
  website: string;
  firmType: string;
  targetClientType: string;
  targetLocation: string;
  minClientProfile: string;
  services: string;
  calendarUrl: string;
  emailAccount: string;
  outreachTone: string;
  followupCadenceDays: number;
  dailySendLimit: number;
  autoFollowups: boolean;
}

/** Get the current org's ICP (joined with its org identity), or nulls. */
export const getIcp = createServerFn({ method: "GET" })
  .validator((d: unknown) => d)
  .handler(async () => {
    const s = await requireAccount();
    if (s instanceof Response) return s;
    const db = sql();
    const org = (
      await db`SELECT id, name, website, firm_type FROM organizations WHERE id = ${s.organizationId} LIMIT 1`
    )[0];
    if (!org) return { org: null, icp: null };
    const icp = (
      await db`
        SELECT organization_id, firm_type, target_client_type, target_location,
               min_client_profile, services, calendar_url, email_account,
               outreach_tone, followup_cadence_days, daily_send_limit, auto_followups
        FROM ideal_client_profiles WHERE organization_id = ${s.organizationId} LIMIT 1
      `
    )[0] ?? null;
    return {
      org: {
        name: String(org.name ?? ""),
        website: String(org.website ?? ""),
        firmType: String(org.firm_type ?? ""),
      },
      icp: icp
        ? {
            firmType: String(icp.firm_type ?? ""),
            targetClientType: String(icp.target_client_type ?? ""),
            targetLocation: String(icp.target_location ?? ""),
            minClientProfile: String(icp.min_client_profile ?? ""),
            services: String(icp.services ?? ""),
            calendarUrl: String(icp.calendar_url ?? ""),
            emailAccount: String(icp.email_account ?? ""),
            outreachTone: String(icp.outreach_tone ?? ""),
            followupCadenceDays: Number(icp.followup_cadence_days ?? 2),
            dailySendLimit: Number(icp.daily_send_limit ?? 20),
            autoFollowups: Boolean(icp.auto_followups),
          }
        : null,
    };
  });

/** Whether the org already has a completed ICP (used for post-signup routing). */
export const hasIcp = createServerFn({ method: "GET" })
  .validator((d: unknown) => d)
  .handler(async () => {
    const s = await requireAccount();
    if (s instanceof Response) return { has: false };
    const db = sql();
    const rows = await db`SELECT 1 FROM ideal_client_profiles WHERE organization_id = ${s.organizationId} LIMIT 1`;
    return { has: rows.length > 0 };
  });

/** Upsert the org's ICP + org identity fields. */
export const saveIcp = createServerFn({ method: "POST" })
  .validator((d: unknown) => d)
  .handler(async ({ data }) => {
    const s = await requireAccount();
    if (s instanceof Response) return s;
    const d = (data ?? {}) as Partial<IcpFormData>;
    const firmName = String(d.firmName ?? "").trim();
    if (!firmName) return jsonError(400, "Firm name is required.");

    const db = sql();
    const oid = s.organizationId;

    await db`
      UPDATE organizations
      SET name = ${firmName},
          website = ${String(d.website ?? "").trim() || null},
          firm_type = ${String(d.firmType ?? "").trim() || null},
          updated_at = now()
      WHERE id = ${oid}
    `;

    await db`
      INSERT INTO ideal_client_profiles (
        organization_id, firm_type, target_client_type, target_location,
        min_client_profile, services, calendar_url, email_account,
        outreach_tone, followup_cadence_days, daily_send_limit, auto_followups
      ) VALUES (
        ${oid},
        ${String(d.firmType ?? "").trim() || null},
        ${String(d.targetClientType ?? "").trim() || null},
        ${String(d.targetLocation ?? "").trim() || null},
        ${String(d.minClientProfile ?? "").trim() || null},
        ${String(d.services ?? "").trim() || null},
        ${String(d.calendarUrl ?? "").trim() || null},
        ${String(d.emailAccount ?? "").trim() || null},
        ${String(d.outreachTone ?? "").trim() || null},
        ${Number(d.followupCadenceDays ?? 2)},
        ${Number(d.dailySendLimit ?? 20)},
        ${Boolean(d.autoFollowups)}
      )
      ON CONFLICT (organization_id) DO UPDATE SET
        firm_type = EXCLUDED.firm_type,
        target_client_type = EXCLUDED.target_client_type,
        target_location = EXCLUDED.target_location,
        min_client_profile = EXCLUDED.min_client_profile,
        services = EXCLUDED.services,
        calendar_url = EXCLUDED.calendar_url,
        email_account = EXCLUDED.email_account,
        outreach_tone = EXCLUDED.outreach_tone,
        followup_cadence_days = EXCLUDED.followup_cadence_days,
        daily_send_limit = EXCLUDED.daily_send_limit,
        auto_followups = EXCLUDED.auto_followups,
        updated_at = now()
    `;

    try {
      await db`
        INSERT INTO audit_logs (organization_id, user_id, action, ip, user_agent, meta)
        VALUES (${oid}, ${s.userId}, 'icp_upsert', 'app', 'clerk',
                ${JSON.stringify({ firm_type: d.firmType }) })
      `;
    } catch (e) {
      console.error("audit icp_upsert failed:", e);
    }

    return { ok: true };
  });
