import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getIcp } from "~/lib/icp/server";
import { OnboardingWizard } from "~/components/onboarding/OnboardingWizard";

export const Route = createFileRoute("/app/onboarding")({
  loader: async () => {
    try {
      const r = await getIcp();
      const d = r as any;
      return {
        org: d?.org ?? null,
        icp: d?.icp ?? null,
      };
    } catch {
      return { org: null, icp: null };
    }
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  const { org, icp } = Route.useLoaderData();
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex max-w-2xl flex-col py-4">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-ink-900 dark:text-white">
          {icp ? "Continue setting up" : "Welcome — let's set up your firm"}
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-ink-500 dark:text-ink-400">
          Tell us about your firm and the clients you're looking for. WealthFlow AI uses this
          to research, score, and personalize outreach for the right prospects. Takes about 2 minutes.
        </p>
      </div>
      <OnboardingWizard
        mode="onboarding"
        initial={{
          firmName: org?.name ?? "",
          website: org?.website ?? "",
          firmType: icp?.firmType ?? org?.firmType ?? "",
          targetClientType: icp?.targetClientType ?? "",
          targetLocation: icp?.targetLocation ?? "",
          minClientProfile: icp?.minClientProfile ?? "",
          services: icp?.services ?? "",
          calendarUrl: icp?.calendarUrl ?? "",
          emailAccount: icp?.emailAccount ?? "",
          outreachTone: icp?.outreachTone ?? "",
          followupCadenceDays: icp?.followupCadenceDays ?? 2,
          dailySendLimit: icp?.dailySendLimit ?? 20,
          autoFollowups: icp?.autoFollowups ?? true,
        }}
        onComplete={() => navigate({ to: "/app/dashboard" })}
      />
      <p className="mx-auto mt-5 max-w-lg text-center text-xs leading-relaxed text-ink-400 dark:text-ink-500">
        WealthFlow AI is a marketing, lead-gen, and CRM platform — not a financial advisor. It
        never provides investment advice. You'll always review and approve outreach before it's sent.
      </p>
    </div>
  );
}

export default OnboardingPage;
