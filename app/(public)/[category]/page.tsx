import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getArticlesByCategoryPage } from "@/lib/queries/articles";
import { CATEGORIES, isArticleCategory, categoryLabel } from "@/types";
import ArticleGrid from "@/components/ArticleGrid";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 12;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.value }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  if (!isArticleCategory(category)) return {};
  return { title: categoryLabel(category) };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { category } = await params;
  if (!isArticleCategory(category)) notFound();

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const supabase = await createClient();
  const { articles, total } = await getArticlesByCategoryPage(supabase, category, page, PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-grid px-5 py-10 md:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink">{categoryLabel(category)}</h1>
      <div className="mt-8">
        <ArticleGrid articles={articles} />
      </div>
      <Pagination basePath={`/${category}`} page={page} totalPages={totalPages} />
    </div>
  );
}
