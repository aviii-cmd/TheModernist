import Link from "next/link";
import type { ArticleCategory, ArticleWithAuthor } from "@/types";
import ArticleCard from "@/components/ArticleCard";

export default function CategorySection({
  category,
  title,
  articles,
}: {
  category: ArticleCategory;
  title: string;
  articles: ArticleWithAuthor[];
}) {
  if (articles.length === 0) return null;

  return (
    <section className="border-t border-border py-10 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-2xl font-semibold text-ink">{title}</h2>
        <Link href={`/${category}`} className="text-sm text-accent hover:underline">
          View all →
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
