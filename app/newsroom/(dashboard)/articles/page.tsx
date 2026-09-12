import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getNewsroomArticlesPage } from "@/lib/queries/articles";
import { categoryLabel } from "@/types";
import { formatDate, isScheduled } from "@/lib/utils/format";
import Pagination from "@/components/Pagination";

export const revalidate = 0;

const PAGE_SIZE = 20;

function statusBadge(status: string, publishedAt: string | null) {
  if (status === "published" && isScheduled(publishedAt)) {
    return <span className="rounded bg-blue-50 px-2 py-0.5 text-[12px] font-medium text-blue-700">Scheduled</span>;
  }
  const styles: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-700",
    draft: "bg-amber-50 text-amber-700",
    archived: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`rounded px-2 py-0.5 text-[12px] font-medium capitalize ${styles[status] ?? ""}`}>
      {status}
    </span>
  );
}

export default async function NewsroomArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const supabase = await createClient();
  const { articles, total } = await getNewsroomArticlesPage(supabase, page, PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-ink">Articles</h1>
        <Link
          href="/newsroom/articles/new"
          className="rounded bg-ink900 px-4 py-2 text-sm font-medium text-white hover:bg-ink900/90"
        >
          + New Article
        </Link>
      </div>

      <div className="mt-6 divide-y divide-border border-y border-border">
        {articles.length === 0 && <p className="py-6 text-ink-secondary">No articles yet.</p>}
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/newsroom/articles/${article.id}`}
            className="flex items-center justify-between gap-4 py-4 hover:bg-surface"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{article.title || "Untitled draft"}</p>
              <p className="mt-0.5 text-[13px] text-ink-secondary">
                {categoryLabel(article.category)}
                <span className="px-1.5">·</span>
                {article.author?.name ?? "Unassigned"}
                <span className="px-1.5">·</span>
                {formatDate(article.updated_at)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {article.featured && (
                <span className="rounded bg-accent/10 px-2 py-0.5 text-[12px] font-medium text-accent">
                  Featured
                </span>
              )}
              {statusBadge(article.status, article.published_at)}
            </div>
          </Link>
        ))}
      </div>

      <Pagination basePath="/newsroom/articles" page={page} totalPages={totalPages} />
    </div>
  );
}
