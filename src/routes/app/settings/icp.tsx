import { createFileRoute } from "@tanstack/react-router";
import { getIcp } from "~/lib/icp/server";
import { OnboardingWizard } from "~/components/onboarding/OnboardingWizard";

export const Route = createFileRoute("/app/settings/icp")({
  loader: async () => {
    try {
      const d = (await getIcp()) as any;
      return { org: d?.org ?? null, icp: d?.icp ?? null };
    } catch {
      return { org: null, icp: null };
    }
  },
  component: IcpSettingsPage,
});

function IcpSettingsPage() {
  const { org, icp } = Route.useLoaderData();

  return (
    <div className="mx-auto flex max-w-2xl flex-col py-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-900 dark:text-white">Ideal Client Profile</h2>
        <p className="mt-1 max-w-lg text-sm text-ink-500 dark:text-ink-400">
          Review and update the firms you're looking for. WealthFlow uses these
          business/professional criteria to research, score, and personalize outreach.
        </p>
      </div>
      <OnboardingWizard
        mode="edit"
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
      />
    </div>
  );
}

export default IcpSettingsPage;
