import type { ReactNode } from "react";
import { Card } from "./Card";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  icon?: ReactNode;
  accent?: string;
}

export function KpiCard({
  label,
  value,
  delta,
  deltaTone = "up",
  icon,
  accent = "bg-brand-500/10 text-brand-600 dark:text-brand-300",
}: KpiCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">
            {label}
          </p>
          <p className="tnum mt-2 text-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
            {value}
          </p>
          {delta ? (
            <span
              className={`mt-1 inline-flex items-center text-xs font-medium ${
                deltaTone === "up"
                  ? "text-success"
                  : deltaTone === "down"
                    ? "text-danger"
                    : "text-ink-500"
              }`}
            >
              {delta}
            </span>
          ) : null}
        </div>
        {icon ? (
          <span
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}
          >
            {icon}
          </span>
        ) : null}
      </div>
    </Card>
  );
}
