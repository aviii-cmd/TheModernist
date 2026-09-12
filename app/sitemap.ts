import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://themodernist.example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, category, published_at, tags")
    .eq("status", "published");

  const tags = Array.from(new Set((articles ?? []).flatMap((a) => a.tags)));

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "hourly" },
    { url: `${SITE_URL}/submit`, changeFrequency: "monthly" },
    { url: `${SITE_URL}/search`, changeFrequency: "monthly" },
    ...CATEGORIES.map((c) => ({
      url: `${SITE_URL}/${c.value}`,
      changeFrequency: "hourly" as const,
    })),
    ...tags.map((tag) => ({
      url: `${SITE_URL}/tags/${encodeURIComponent(tag)}`,
      changeFrequency: "weekly" as const,
    })),
  ];

  const articleRoutes: MetadataRoute.Sitemap = (articles ?? []).map((a) => ({
    url: `${SITE_URL}/${a.category}/${a.slug}`,
    lastModified: a.published_at ?? undefined,
    changeFrequency: "weekly",
  }));

  return [...staticRoutes, ...articleRoutes];
}
