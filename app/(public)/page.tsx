import { createClient } from "@/lib/supabase/server";
import { getFeaturedArticle, getLatestArticles, getHomepageSections } from "@/lib/queries/articles";
import { CATEGORIES } from "@/types";
import HeroStory from "@/components/HeroStory";
import LatestUpdates from "@/components/LatestUpdates";
import SubmitPromoCard from "@/components/SubmitPromoCard";
import NewsletterCard from "@/components/NewsletterCard";
import CategorySection from "@/components/CategorySection";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();

  const [featured, latest, sections] = await Promise.all([
    getFeaturedArticle(supabase),
    getLatestArticles(supabase, 4),
    getHomepageSections(
      supabase,
      CATEGORIES.map((c) => c.value),
      4
    ),
  ]);

  if (!featured) {
    return (
      <div className="mx-auto max-w-grid px-5 py-24 text-center md:px-8">
        <h1 className="font-serif text-2xl text-ink">No stories published yet</h1>
        <p className="mt-2 text-ink-secondary">
          Once the newsroom publishes its first article, it will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-grid px-5 py-8 md:px-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <HeroStory article={featured} />
          {CATEGORIES.map((c) => (
            <CategorySection
              key={c.value}
              category={c.value}
              title={c.label}
              articles={sections[c.value]}
            />
          ))}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
          <LatestUpdates articles={latest} />
          <SubmitPromoCard />
          <NewsletterCard />
        </aside>
      </div>
    </div>
  );
}
