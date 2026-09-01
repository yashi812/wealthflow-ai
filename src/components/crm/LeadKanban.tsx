import { useState } from "react";
import { Badge } from "~/components/ui/Badge";
import { cn } from "~/lib/cn";
import {
  ACTIVE_STATUSES,
  LEAD_STATUS_META,
  OTHER_STATUSES,
  scoreTone,
  type CrmLead,
  type LeadStatus,
} from "~/lib/leads/status";

const DOT: Record<LeadStatus, string> = {
  NEW: "bg-brand-500",
  CONTACTED: "bg-accent-500",
  REPLIED: "bg-accent-400",
  QUALIFIED: "bg-emerald-500",
  MEETING_BOOKED: "bg-emerald-400",
  MEETING_COMPLETED: "bg-emerald-300",
  CLIENT: "bg-teal-500",
  NURTURE: "bg-amber-400",
  LOST: "bg-red-400",
  DO_NOT_CONTACT: "bg-red-600",
};

function KanbanCard({
  lead,
  dragged,
  onDragStart,
  onDragEnd,
  onOpen,
}: {
  lead: CrmLead;
  dragged: boolean;
  onDragStart: (lead: CrmLead) => void;
  onDragEnd: () => void;
  onOpen: (lead: CrmLead) => void;
}) {
  const dnc = lead.doNotContact || lead.unsubscribed;
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", lead.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart(lead);
      }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(lead)}
      className={cn(
        "group cursor-pointer rounded-xl border border-ink-200/80 bg-white p-3 shadow-sm transition-all hover:-translate-y-px hover:shadow-md dark:border-ink-700 dark:bg-ink-900",
        dragged && "opacity-40 ring-2 ring-brand-400"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[13px] font-semibold leading-snug text-ink-900 dark:text-ink-100">
          {lead.name}
          {dnc && <span className="ml-1 text-red-500" title="Do not contact">•</span>}
        </p>
        <Badge tone={scoreTone(lead.leadScore)} className="shrink-0">{lead.leadScore}</Badge>
      </div>
      {lead.company && <p className="mt-0.5 truncate text-xs text-ink-500 dark:text-ink-400">{lead.company}</p>}
      {lead.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {lead.tags.slice(0, 3).map((t) => (
            <span key={t} className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-600 dark:bg-ink-800 dark:text-ink-300">
              {t}
            </span>
          ))}
          {lead.tags.length > 3 && (
            <span className="text-[10px] font-medium text-ink-400">+{lead.tags.length - 3}</span>
          )}
        </div>
      )}
      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-ink-100 pt-2 dark:border-ink-800">
        {lead.nextAction ? (
          <p className="truncate text-[11px] text-ink-500 dark:text-ink-400">↳ {lead.nextAction}</p>
        ) : (
          <span className="text-[11px] text-ink-300 dark:text-ink-600">No next action</span>
        )}
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600/10 text-[10px] font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">
          {(lead.ownerName ?? "?").charAt(0).toUpperCase()}
        </span>
      </div>
    </div>
  );
}

function Column({
  status,
  leads,
  draggedId,
  onDragStart,
  onDragEnd,
  onDrop,
  onOpen,
}: {
  status: LeadStatus;
  leads: CrmLead[];
  draggedId: string | null;
  onDragStart: (lead: CrmLead) => void;
  onDragEnd: () => void;
  onDrop: (status: LeadStatus) => void;
  onOpen: (lead: CrmLead) => void;
}) {
  const [over, setOver] = useState(false);
  const meta = LEAD_STATUS_META[status];
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onDrop(status);
      }}
      className={cn(
        "flex w-[264px] shrink-0 flex-col rounded-2xl border bg-ink-50/70 transition-colors dark:bg-ink-950/40",
        over ? "border-brand-400 bg-brand-50/60 ring-2 ring-brand-400/40 dark:border-brand-500 dark:bg-brand-950/30" : "border-ink-200/70 dark:border-ink-800"
      )}
    >
      <div className="flex items-center justify-between px-3.5 pb-2 pt-3.5">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", DOT[status])} />
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-ink-300">{meta.label}</span>
        </div>
        <span className="rounded-full bg-ink-200/60 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink-600 dark:bg-ink-800 dark:text-ink-300">
          {leads.length}
        </span>
      </div>
      <div className="flex min-h-[120px] flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-3">
        {leads.map((l) => (
          <KanbanCard
            key={l.id}
            lead={l}
            dragged={draggedId === l.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onOpen={onOpen}
          />
        ))}
        {leads.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-ink-300 py-8 text-[11px] text-ink-400 dark:border-ink-700 dark:text-ink-500">
            Drop cards here
          </div>
        )}
      </div>
    </div>
  );
}

export function LeadKanban({
  leads,
  onMove,
  onOpen,
}: {
  leads: CrmLead[];
  onMove: (lead: CrmLead, status: LeadStatus) => void;
  onOpen: (lead: CrmLead) => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const dragged = leads.find((l) => l.id === draggedId) ?? null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {ACTIVE_STATUSES.map((st) => (
        <Column
          key={st}
          status={st}
          leads={leads.filter((l) => l.status === st)}
          draggedId={draggedId}
          onDragStart={(l) => setDraggedId(l.id)}
          onDragEnd={() => setDraggedId(null)}
          onDrop={(s) => dragged && onMove(dragged, s)}
          onOpen={onOpen}
        />
      ))}
      <div className="mx-1 w-px shrink-0 bg-ink-200 dark:bg-ink-800" aria-hidden />
      {OTHER_STATUSES.map((st) => (
        <Column
          key={st}
          status={st}
          leads={leads.filter((l) => l.status === st)}
          draggedId={draggedId}
          onDragStart={(l) => setDraggedId(l.id)}
          onDragEnd={() => setDraggedId(null)}
          onDrop={(s) => dragged && onMove(dragged, s)}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}