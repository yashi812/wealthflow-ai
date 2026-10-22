import { ClerkProvider } from "@clerk/tanstack-react-start";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "~/styles/app.css?url";
import { ThemeProvider } from "~/lib/theme";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title:
          "WealthFlow AI — AI-Powered Client Acquisition for Financial Advisory Firms",
      },
      {
        name: "description",
        content:
          "Find qualified prospects, personalize outreach, nurture leads, and fill your consultation calendar — with AI that keeps humans in control. WealthFlow AI is a marketing, lead-gen, and CRM platform, not a financial advisor.",
      },
      { name: "theme-color", content: "#181f50" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-white px-6 text-center dark:bg-ink-950">
      <p className="text-5xl font-bold text-brand-600">404</p>
      <p className="text-lg font-semibold text-ink-900 dark:text-ink-100">
        Page not found
      </p>
      <a
        href="/"
        className="text-sm text-brand-600 underline hover:text-brand-700"
      >
        Back to home
      </a>
    </div>
  ),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <ThemeProvider>
        <Outlet />
      </ThemeProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ClerkProvider>
          {children}
          <Scripts />
        </ClerkProvider>
      </body>
    </html>
  );
}
