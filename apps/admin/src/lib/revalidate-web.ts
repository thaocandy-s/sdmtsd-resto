import { waitUntil } from "@vercel/functions";

// Trigger that asks the public website to revalidate its ISR cache after a
// successful admin mutation (create/update/delete/reorder). The fetch is kept
// alive via waitUntil so the serverless runtime doesn't freeze the function
// before the request completes; failures are logged but never block or fail
// the admin request. No-op when the env vars are missing (e.g. local dev
// without the web app running).

export function triggerWebRevalidation(sourcePath: string): void {
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!webUrl || !secret) return;

  const revalidation = fetch(`${webUrl.replace(/\/$/, "")}/api/revalidate`, {
    method: "POST",
    headers: {
      "x-revalidate-secret": secret,
      "content-type": "application/json",
    },
    body: JSON.stringify({ source: sourcePath }),
  })
    .then((res) => {
      if (!res.ok) console.error(`Web revalidation failed with status ${res.status}`);
    })
    .catch((err) => {
      console.error("Failed to trigger web revalidation:", err);
    });

  waitUntil(revalidation);
}
