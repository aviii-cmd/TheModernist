import Link from "next/link";
import type { ArticleWithAuthor } from "@/types";
import { categoryLabel } from "@/types";
import { relativeTime } from "@/lib/utils/format";

function BoltIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7.5 1L2.5 8H6.5L6 13L11 6H7L7.5 1Z" fill="currentColor" />
    </svg>
  );
}

export default function LatestUpdates({ articles }: { articles: ArticleWithAuthor[] }) {
  return (
    <aside className="rounded-md bg-surface p-5">
      <h2 className="flex items-center gap-1.5 font-serif text-lg font-semibold text-ink">
        <span className="text-accent">
          <BoltIcon />
        </span>
        Latest Updates
      </h2>
      <ul className="mt-3 divide-y divide-border-strong/70">
        {articles.map((article) => (
          <li key={article.id} className="py-3 first:pt-3">
            <Link href={`/${article.category}/${article.slug}`} className="group block">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-accent">
                  {categoryLabel(article.category)}
                </span>
                <span className="shrink-0 text-[12px] text-ink-faint">
                  {relativeTime(article.published_at ?? article.created_at)}
                </span>
              </div>
              <p className="mt-1 text-[14.5px] font-medium leading-snug text-ink group-hover:text-accent">
                {article.title}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
