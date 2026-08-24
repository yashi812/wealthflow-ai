import { useEffect, useState } from "react";
import { ButtonLink } from "./ui/Button";
import { useTheme } from "~/lib/theme";
import { cn } from "~/lib/cn";

const LINK = (href: string, label: string) => ({ href, label });

const NAV_LINKS = [
  LINK("#product", "Product"),
  LINK("#pricing", "Pricing"),
  LINK("#faq", "FAQ"),
  LINK("#security", "Security"),
];

function Logo({ dark }: { dark?: boolean }) {
  return (
    <a href="/" className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 20h18" />
          <path d="M5 20V8" />
          <path d="M10 20V4" />
          <path d="M15 20v-8" />
          <path d="M20 20V6" />
        </svg>
      </span>
      <span
        className={cn(
          "text-[15px] font-semibold tracking-tight",
          dark ? "text-white" : "text-ink-900 dark:text-white"
        )}
      >
        WealthFlow<span className="text-brand-500"> AI</span>
      </span>
    </a>
  );
}

function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-600 transition-colors hover:bg-ink-100 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800",
        className
      )}
    >
      {theme === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-200",
        scrolled
          ? "border-b border-ink-200/70 bg-white/85 backdrop-blur-md dark:border-ink-800 dark:bg-ink-950/80"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-900 dark:hover:text-ink-100"
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="/login"
            className="hidden text-sm font-semibold text-ink-700 transition-colors hover:text-ink-900 sm:inline dark:text-ink-200 dark:hover:text-white"
          >
            Log in
          </a>
          <ButtonLink
            href="/signup"
            size="sm"
            className="hidden sm:inline-flex"
          >
            Start Free
          </ButtonLink>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-700 md:hidden dark:border-ink-700 dark:text-ink-200"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </nav>
      {open ? (
        <div className="border-t border-ink-200/70 bg-white px-5 py-4 md:hidden dark:border-ink-800 dark:bg-ink-950">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.concat(
              { href: "/login", label: "Log in" },
              { href: "/signup", label: "Start Free" }
            ).map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-900"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
