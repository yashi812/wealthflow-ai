import { createFileRoute, Link } from "@tanstack/react-router";
import { getSession } from "~/lib/auth/server";
import { getIcp } from "~/lib/icp/server";
import { Card, CardContent } from "~/components/ui/Card";
import { ButtonLink } from "~/components/ui/Button";

export const Route = createFileRoute("/app/dashboard")({
  loader: async () => {
    let me: any = null;
    let icp: any = null;
    let orgName = "";
    try {
      me = (await getSession()).user;
    } catch {}
    try {
      const d: any = await getIcp();
      icp = d?.icp ?? null;
      orgName = d?.org?.name ?? "";
    } catch {}
    return { me, hasIcp: !!icp, orgName, icp };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { me, hasIcp, orgName, icp } = Route.useLoaderData();
  const firstName = me?.name ? String(me.name).split(" ")[0] : "";

  const kpis = [
    { label: "Prospects added", value: "—", hint: "Add on Pipeline (Stage 4)" },
    { label: "Avg. lead score", value: "—", hint: "AI scoring (Stage 5)" },
    { label: "Outreach sent", value: "—", hint: "Campaigns (Stage 6)" },
    { label: "Meetings booked", value: "—", hint: "Appointments (Stage 7)" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink-900 dark:text-white">
            Welcome{firstName ? ` back, ${firstName}` : ""} 👋
          </h2>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            {orgName ? `${orgName} — ` : ""}Your WealthFlow AI workspace
          </p>
        </div>
      </div>

      {!hasIcp ? (
        <Card className="mt-6">
          <CardContent className="bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-white">
            <h3 className="text-xl font-bold">Let's set up your Ideal Client Profile</h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-brand-100">
              Tell WealthFlow who your firm serves and how you like to reach them. It takes about
              two minutes and unlocks AI research, scoring, and personalized outreach.
            </p>
            <div className="mt-5">
              <ButtonLink href="/app/onboarding" className="!bg-white !text-brand-700 hover:!bg-brand-50">
                Set up your Ideal Client Profile
              </ButtonLink>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-ink-500 dark:text-ink-400">
              Key metrics will appear here once you start adding prospects (Stage 4+).
            </p>
            <Link to="/app/settings/icp" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Edit Ideal Client Profile →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
              <Card key={k.label} className="p-5">
                <p className="text-xs font-medium text-ink-500 dark:text-ink-400">{k.label}</p>
                <p className="mt-2 text-3xl font-bold text-ink-900 dark:text-white">{k.value}</p>
                <p className="mt-2 text-xs text-ink-400 dark:text-ink-500">{k.hint}</p>
              </Card>
            ))}
          </div>
          <Card className="mt-4 p-5">
            <p className="text-sm text-ink-500 dark:text-ink-400">
              <span className="font-semibold text-ink-700 dark:text-ink-200">Your Ideal Client Profile:</span>{" "}
              {icp?.targetClientType ? `${icp.targetClientType}` : "Configured"} —{" "}
              {icp?.targetLocation ? icp.targetLocation : "your market"}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
