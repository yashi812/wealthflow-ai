import { useCallback, useEffect, useRef, useState } from "react";
import {
  listLeads,
  updateLead,
  getLeadActivity,
  addActivity,
  getCrmMeta,
  type ListLeadsInput,
  type UpdateLeadInput,
} from "~/lib/leads/server";
import type { CrmLead, CrmActivity } from "~/lib/leads/status";

export interface CrmMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface CrmFilters {
  search: string;
  status: string;
  source: string;
  sort: string;
  order: "asc" | "desc";
}

export const DEFAULT_FILTERS: CrmFilters = {
  search: "",
  status: "",
  source: "",
  sort: "created",
  order: "desc",
};

function errMsg(e: unknown, fallback: string): string {
  if (e instanceof Error && e.message) return e.message;
  const r = e as any;
  if (r?.message?.error) return String(r.message.error);
  if (r?.message && typeof r.message === "string") return r.message;
  return fallback;
}

/**
 * Shared client-side data layer for the CRM views (table + Kanban + drawer).
 * Owns the lead list, filters, picking a lead (drawer), and the drawer's
 * activity feed. Both /app/prospects and /app/pipeline use this hook.
 */
export function useCrm() {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [members, setMembers] = useState<CrmMember[]>([]);
  const [filters, setFilters] = useState<CrmFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drawer state
  const [selected, setSelected] = useState<CrmLead | null>(null);
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const reqSeq = useRef(0);

  const refresh = useCallback(async (f: CrmFilters = filters, silent = false) => {
    const seq = ++reqSeq.current;
    if (!silent) setLoading(true);
    try {
      const res: any = await listLeads(f);
      if (seq !== reqSeq.current) return;
      setLeads(res?.leads ?? []);
      setError(null);
    } catch (e) {
      if (seq !== reqSeq.current) return;
      setError(errMsg(e, "Failed to load leads."));
    } finally {
      if (seq === reqSeq.current) setLoading(false);
    }
  }, [filters]);

  const setFilter = useCallback((patch: Partial<CrmFilters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      return next;
    });
  }, []);

  // Debounced fetch on filter/sort change.
  useEffect(() => {
    const t = setTimeout(() => {
      refresh(filters, true);
    }, filters.search ? 250 : 0);
    return () => clearTimeout(t);
  }, [filters, refresh]);

  useEffect(() => {
    getCrmMeta()
      .then((res: any) => {
        setSources(res?.sources ?? []);
        setMembers(res?.members ?? []);
      })
      .catch(() => {});
  }, []);

  // --- actions -----------------------------------------------------------------

  const openLead = useCallback(async (lead: CrmLead) => {
    setSelected(lead);
    setDrawerOpen(true);
    try {
      const res: any = await getLeadActivity({ leadId: lead.id });
      setActivities(res?.activities ?? []);
    } catch {
      setActivities([]);
    }
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const patchLead = useCallback(
    async (id: string, patch: UpdateLeadInput) => {
      const res: any = await updateLead({ id, ...patch });
      const updated: CrmLead | null = res?.lead ?? null;
      if (!updated) throw new Error("Update failed");
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
      setSelected((prev) => (prev && prev.id === id ? updated : prev));
      // Refresh the timeline when a status change lands.
      if (res.changedStatus) {
        getLeadActivity({ leadId: id })
          .then((r: any) => setActivities(r?.activities ?? []))
          .catch(() => {});
      }
      return updated;
    },
    []
  );

  const moveStatus = useCallback(
    async (lead: CrmLead, status: string) => {
      if (lead.status === status) return;
      // Optimistic move, then reconcile with the server.
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: status as any } : l)));
      try {
        await patchLead(lead.id, { status });
      } catch (e) {
        setError(errMsg(e, "Failed to move lead."));
        await refresh();
      }
    },
    [patchLead, refresh]
  );

  const addNote = useCallback(
    async (leadId: string, summary: string) => {
      const res: any = await addActivity({ leadId, summary });
      if (res?.activity) setActivities((prev) => [res.activity, ...prev]);
      return res;
    },
    []
  );

  const afterCreate = useCallback(async () => {
    setShowNew(false);
    await refresh();
  }, [refresh]);

  return {
    leads,
    sources,
    members,
    filters,
    setFilter,
    loading,
    error,
    setError,
    selected,
    activities,
    drawerOpen,
    showNew,
    setShowNew,
    openLead,
    closeDrawer,
    patchLead,
    moveStatus,
    addNote,
    afterCreate,
  };
}