// Fire-and-forget trigger that asks the public website to revalidate its
// ISR cache after a successful admin mutation (create/update/delete/reorder).
// Failures are logged but never block or fail the admin request. No-op when
// the env vars are missing (e.g. local dev without the web app running).

const THROTTLE_MS = 5_000;

// Mutations often come in bursts (e.g. save + reorder); one revalidation per
// window is enough since the web app revalidates its whole layout.
let lastTriggeredAt = 0;

export function triggerWebRevalidation(sourcePath: string): void {
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!webUrl || !secret) return;

  const now = Date.now();
  if (now - lastTriggeredAt < THROTTLE_MS) return;
  lastTriggeredAt = now;

  fetch(`${webUrl.replace(/\/$/, "")}/api/revalidate`, {
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
}
