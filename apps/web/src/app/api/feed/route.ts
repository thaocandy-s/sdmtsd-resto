import { NextResponse } from "next/server";

const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://restohub.com";

export async function GET() {
  const apiBase = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

  let foods: { name: string; slug: string; description: string | null; updatedAt: string }[] = [];
  let events: { title: string; description: string | null; startDate: string }[] = [];

  try {
    const [foodRes, eventRes] = await Promise.all([
      fetch(`${apiBase}/api/menu`)
        .then((r) => r.json())
        .catch(() => ({ data: [] })),
      fetch(`${apiBase}/api/events`)
        .then((r) => r.json())
        .catch(() => ({ data: [] })),
    ]);
    foods = foodRes.data || [];
    events = eventRes.data || [];
  } catch (error) {
    console.error("RSS feed fetch error:", error);
  }

  const items = [
    ...foods.map(
      (f) => `
    <item>
      <title><![CDATA[${f.name}]]></title>
      <link>${baseUrl}/en/menu/${f.slug}</link>
      <guid>${baseUrl}/en/menu/${f.slug}</guid>
      <description><![CDATA[${f.description || ""}]]></description>
      <pubDate>${new Date(f.updatedAt).toUTCString()}</pubDate>
    </item>`
    ),
    ...events.map(
      (e) => `
    <item>
      <title><![CDATA[${e.title}]]></title>
      <link>${baseUrl}/en</link>
      <guid>${baseUrl}/en/events#${e.title}</guid>
      <description><![CDATA[${e.description || ""}]]></description>
      <pubDate>${new Date(e.startDate).toUTCString()}</pubDate>
    </item>`
    ),
  ].join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Resto Hub</title>
    <link>${baseUrl}</link>
    <description>Latest menu items and events from Resto Hub</description>
    <language>en</language>
    <atom:link href="${baseUrl}/api/feed" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
