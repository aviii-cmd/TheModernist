import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDashboardStats, getNewsroomArticles } from "@/lib/queries/articles";
import { getSubmissions } from "@/lib/queries/submissions";
import { categoryLabel } from "@/types";
import { formatDate, formatDateTime, isScheduled } from "@/lib/utils/format";

export const revalidate = 0;

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border px-5 py-4">
      <p className="text-2xl font-semibold text-ink">{value}</p>
      <p className="text-[13px] text-ink-secondary">{label}</p>
    </div>
  );
}

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

export default async function NewsroomOverviewPage() {
  const supabase = await createClient();
  const [stats, articles, newTips] = await Promise.all([
    getDashboardStats(supabase),
    getNewsroomArticles(supabase),
    getSubmissions(supabase, "new"),
  ]);

  const recent = articles.slice(0, 6);

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink">Overview</h1>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Published" value={stats.published} />
        <StatCard label="Scheduled" value={stats.scheduled} />
        <StatCard label="Drafts" value={stats.drafts} />
        <StatCard label="In Review" value={stats.inReview} />
        <StatCard label="New Tips" value={stats.newTips} />
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <h2 className="font-serif text-lg font-semibold text-ink">Recent Articles</h2>
        <div className="mt-4 divide-y divide-border">
          {recent.length === 0 && <p className="py-6 text-ink-secondary">No articles yet.</p>}
          {recent.map((article) => (
            <Link
              key={article.id}
              href={`/newsroom/articles/${article.id}`}
              className="flex items-center justify-between gap-4 py-3 hover:bg-surface"
            >
              <div>
                <p className="font-medium text-ink">{article.title}</p>
                <p className="mt-0.5 text-[13px] text-ink-secondary">
                  {categoryLabel(article.category)}
                  <span className="px-1.5">·</span>
                  {isScheduled(article.published_at) && article.published_at
                    ? `Publishes ${formatDateTime(article.published_at)}`
                    : formatDate(article.published_at ?? article.created_at)}
                </p>
              </div>
              {statusBadge(article.status, article.published_at)}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-ink">Submissions</h2>
          <Link href="/newsroom/submissions" className="text-sm text-accent hover:underline">
            Review submissions →
          </Link>
        </div>
        <p className="mt-2 text-ink-secondary">{newTips.length} new story tip(s) waiting for review.</p>
      </div>

      <Link
        href="/newsroom/articles/new"
        className="mt-10 inline-block rounded bg-ink900 px-5 py-2.5 text-sm font-medium text-white hover:bg-ink900/90"
      >
        + New Article
      </Link>
    </div>
  );
}
