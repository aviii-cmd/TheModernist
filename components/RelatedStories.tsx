import type { ArticleWithAuthor } from "@/types";
import ArticleCard from "@/components/ArticleCard";

export default function RelatedStories({ articles }: { articles: ArticleWithAuthor[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-8">
      <h2 className="font-serif text-xl font-semibold text-ink">Related Stories</h2>
      <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
