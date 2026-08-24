import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "span" | "li";
  variant?: "slideUp" | "fade";
  delay?: number;
}

/**
 * Scroll-reveal wrapper using IntersectionObserver.
 * Fades/slides content in once it enters the viewport.
 */
export function Reveal({
  children,
  className = "",
  as: Tag = "div",
  variant = "slideUp",
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const base =
    variant === "fade" ? "reveal-fade" : "reveal";
  return (
    <Tag
      ref={ref as never}
      className={`${base} ${visible ? "reveal-visible" : ""} ${className}`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
