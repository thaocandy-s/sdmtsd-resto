import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://restohub.com";

export async function GET() {
  let foods: { name: string; slug: string; description: string | null; updatedAt: Date }[] = [];

  try {
    foods = await prisma.food.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      select: { name: true, slug: true, description: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
  } catch (error) {
    console.error("RSS feed query error:", error);
  }

  const items = foods
    .map(
      (f) => `
    <item>
      <title><![CDATA[${f.name}]]></title>
      <link>${baseUrl}/en/menu/${f.slug}</link>
      <guid>${baseUrl}/en/menu/${f.slug}</guid>
      <description><![CDATA[${f.description || ""}]]></description>
      <pubDate>${new Date(f.updatedAt).toUTCString()}</pubDate>
    </item>`
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Resto Hub</title>
    <link>${baseUrl}</link>
    <description>Latest menu items from Resto Hub</description>
    <language>en</language>
    <atom:link href="${baseUrl}/api/feed" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
