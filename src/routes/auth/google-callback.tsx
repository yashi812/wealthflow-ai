import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { handleGoogleCallback, getSession } from "~/lib/auth/server";

export const Route = createFileRoute("/auth/google-callback")({
  component: GoogleCallbackPage,
});

function GoogleCallbackPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth/google-callback" }) as {
    code?: string;
    state?: string;
    error?: string;
  };
  const [error, setError] = useState<string | null>(search.error ? String(search.error) : null);

  useEffect(() => {
    if (error) return;
    if (!search.code || !search.state) {
      setError("This Google sign-in link is incomplete or expired. Please try again.");
      return;
    }
    (async () => {
      try {
        const me = (await getSession()) as any;
        const res = (await handleGoogleCallback({
          data: { code: search.code, state: search.state, activeSession: !!me.user },
        })) as any;
        if (res.error) {
          setError(res.error);
          return;
        }
        await navigate({ to: "/app" });
      } catch (err) {
        setError("Google sign-in failed. Please try again.");
      }
    })();
  }, [search.code, search.state, error, navigate]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-50 px-4 dark:bg-ink-950">
      {error ? (
        <div className="max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-card dark:border-red-800 dark:bg-ink-900">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
          <a href="/login" className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700">
            Back to log in
          </a>
        </div>
      ) : (
        <p className="text-sm text-ink-500 dark:text-ink-400">Completing Google sign-in…</p>
      )}
    </div>
  );
}

export default GoogleCallbackPage;
