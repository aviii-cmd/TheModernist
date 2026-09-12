import type { ArticleWithAuthor } from "@/types";
import ArticleCard from "@/components/ArticleCard";

export default function ArticleGrid({ articles }: { articles: ArticleWithAuthor[] }) {
  if (articles.length === 0) {
    return <p className="py-16 text-center text-ink-secondary">No stories here yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
