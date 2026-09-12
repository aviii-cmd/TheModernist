import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getArticlesByTagPage } from "@/lib/queries/articles";
import ArticleGrid from "@/components/ArticleGrid";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 12;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  return { title: `#${decodeURIComponent(tag)}` };
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag).toLowerCase();

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const supabase = await createClient();
  const { articles, total } = await getArticlesByTagPage(supabase, decodedTag, page, PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-grid px-5 py-10 md:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.06em] text-accent">Tag</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">{decodedTag}</h1>
      <div className="mt-8">
        <ArticleGrid articles={articles} />
      </div>
      <Pagination basePath={`/tags/${tag}`} page={page} totalPages={totalPages} />
    </div>
  );
}
