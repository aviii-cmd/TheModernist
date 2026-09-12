import { createClient } from "@/lib/supabase/server";
import { categoryLabel } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://themodernist.example.com";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("title, slug, subtitle, category, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

  const items = (articles ?? [])
    .map((a) => {
      const url = `${SITE_URL}/${a.category}/${a.slug}`;
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <category>${escapeXml(categoryLabel(a.category))}</category>
      ${a.subtitle ? `<description>${escapeXml(a.subtitle)}</description>` : ""}
      ${a.published_at ? `<pubDate>${new Date(a.published_at).toUTCString()}</pubDate>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>The Modernist</title>
    <link>${SITE_URL}</link>
    <description>The independent student publication of MDIS.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
