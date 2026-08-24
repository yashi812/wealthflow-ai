import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getGoogleAuthUrl } from "~/lib/auth/server";

export const Route = createFileRoute("/auth/google-start")({
  component: GoogleStartPage,
});

function GoogleStartPage() {
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      const res = (await getGoogleAuthUrl()) as any;
      if (!res.configured) {
        // Fall back to the login page with an explanatory error.
        await navigate({ to: "/login", search: { error: res.error } as any });
        return;
      }
      window.location.href = res.url;
    })();
  }, [navigate]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-50 px-4 dark:bg-ink-950">
      <p className="text-sm text-ink-500 dark:text-ink-400">Redirecting to Google…</p>
    </div>
  );
}

export default GoogleStartPage;
