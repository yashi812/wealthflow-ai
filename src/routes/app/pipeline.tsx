import { createFileRoute } from "@tanstack/react-router";
import { CrmView } from "~/components/crm/CrmView";

export const Route = createFileRoute("/app/pipeline")({
  component: PipelinePage,
});

function PipelinePage() {
  return <CrmView view="kanban" />;
}

export default PipelinePage;
