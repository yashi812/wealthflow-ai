import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy alias: /login now points at the Clerk-powered sign-in route.
// Kept so existing links, bookmarks and marketing CTAs keep working.
export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    throw redirect({ to: "/sign-in/$", params: { _splat: "" } });
  },
});
