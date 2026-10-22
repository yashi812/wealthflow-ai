import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy alias: /signup now points at the Clerk-powered sign-up route.
// Kept so existing links, bookmarks and marketing CTAs keep working.
export const Route = createFileRoute("/signup")({
  beforeLoad: () => {
    throw redirect({ to: "/sign-up/$", params: { _splat: "" } });
  },
});
