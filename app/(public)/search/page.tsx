import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { searchArticles } from "@/lib/queries/articles";
import ArticleGrid from "@/components/ArticleGrid";

export const metadata: Metadata = { title: "Search" };
export const revalidate = 0;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const supabase = await createClient();
  const results = query ? await searchArticles(supabase, query) : [];

  return (
    <div className="mx-auto max-w-grid px-5 py-10 md:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink">Search</h1>
      <form method="get" className="mt-6 max-w-xl">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search stories by title, topic, or category"
          className="w-full rounded border border-border bg-paper px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-accent"
          autoFocus
        />
      </form>

      <div className="mt-10">
        {query ? (
          <>
            <p className="mb-6 text-sm text-ink-secondary">
              {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
            </p>
            <ArticleGrid articles={results} />
          </>
        ) : (
          <p className="text-ink-secondary">Start typing to search The Modernist's archive.</p>
        )}
      </div>
    </div>
  );
}
