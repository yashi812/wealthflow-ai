import { createFileRoute, redirect } from "@tanstack/react-router";
import { hasIcp } from "~/lib/icp/server";

// /app — the post-signup landing destination. Route the user to onboarding if
// their org has no Ideal Client Profile yet, otherwise to the dashboard.
export const Route = createFileRoute("/app/")({
  beforeLoad: async () => {
    try {
      const { has } = await hasIcp();
      if (has) throw redirect({ to: "/app/dashboard" });
    } catch (e) {
      if ((e as any)?.isRedirect) throw e;
    }
    throw redirect({ to: "/app/onboarding" });
  },
});
