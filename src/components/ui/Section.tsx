import type { ReactNode } from "react";
import { cn } from "~/lib/cn";
import { Badge } from "./Badge";
import { Reveal } from "./Reveal";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  eyebrowTone?: "brand" | "neutral" | "accent";
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  align?: "center" | "left";
}

/**
 * Standard section wrapper with a consistent eyebrow + title + description
 * heading block.
 */
export function Section({
  id,
  eyebrow,
  eyebrowTone = "brand",
  title,
  description,
  children,
  className,
  align = "center",
}: SectionProps) {
  return (
    <section id={id} className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}>
      <Reveal
        className={cn(
          "mb-12 flex flex-col gap-4 sm:mb-16",
          align === "center"
            ? "items-center text-center"
            : "items-start text-left"
        )}
      >
        {eyebrow ? (
          <Badge tone={eyebrowTone}>{eyebrow}</Badge>
        ) : null}
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl md:text-[2.6rem] md:leading-[1.15] dark:text-ink-50">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-base leading-relaxed text-ink-500 sm:text-lg dark:text-ink-400">
            {description}
          </p>
        ) : null}
      </Reveal>
      {children}
    </section>
  );
}
