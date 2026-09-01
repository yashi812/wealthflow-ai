import { createFileRoute } from "@tanstack/react-router";
import { CrmView } from "~/components/crm/CrmView";

export const Route = createFileRoute("/app/prospects")({
  component: ProspectsPage,
});

function ProspectsPage() {
  return <CrmView view="table" />;
}

export default ProspectsPage;
