import type { HTMLAttributes } from "react";
import { cn } from "~/lib/cn";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "accent";

const tones: Record<Tone, string> = {
  neutral:
    "bg-ink-100 text-ink-700 ring-ink-200 dark:bg-ink-800 dark:text-ink-200 dark:ring-ink-700",
  brand:
    "bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-950/60 dark:text-brand-200 dark:ring-brand-800",
  success:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800",
  warning:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800",
  danger:
    "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-800",
  accent:
    "bg-accent-500/10 text-accent-600 ring-accent-500/30 dark:text-accent-300",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
