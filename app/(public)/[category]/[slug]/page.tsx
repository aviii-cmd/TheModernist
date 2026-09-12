import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getArticleBySlug, getRelatedArticles } from "@/lib/queries/articles";
import { isArticleCategory, categoryLabel } from "@/types";
import { formatDate, readingTime } from "@/lib/utils/format";
import { articleContentHtml } from "@/lib/utils/content";
import RelatedStories from "@/components/RelatedStories";

export const revalidate = 0;

async function loadArticle(category: string, slug: string) {
  if (!isArticleCategory(category)) return null;
  const supabase = await createClient();
  const article = await getArticleBySlug(supabase, slug);
  if (!article || article.category !== category) return null;
  return { supabase, article };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const result = await loadArticle(category, slug);
  if (!result) return {};
  const { article } = result;

  return {
    title: article.title,
    description: article.subtitle ?? undefined,
    alternates: { canonical: `/${article.category}/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.subtitle ?? undefined,
      type: "article",
      publishedTime: article.published_at ?? undefined,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const result = await loadArticle(category, slug);
  if (!result) notFound();
  const { supabase, article } = result;

  const related = await getRelatedArticles(supabase, article.category, article.id, 3);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://themodernist.example.com";
  const articleUrl = `${siteUrl}/${article.category}/${article.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.subtitle ?? undefined,
    image: article.cover_image_url ? [article.cover_image_url] : undefined,
    datePublished: article.published_at ?? article.created_at,
    dateModified: article.updated_at,
    author: article.author ? { "@type": "Person", name: article.author.name } : undefined,
    publisher: { "@type": "Organization", name: "The Modernist" },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    articleSection: categoryLabel(article.category),
  };

  return (
    <article className="mx-auto max-w-[760px] px-5 py-10 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <span className="text-xs font-medium uppercase tracking-[0.06em] text-accent">
        {categoryLabel(article.category)}
      </span>
      <h1 className="mt-3 font-serif text-[32px] font-semibold leading-[1.15] text-ink sm:text-[40px]">
        {article.title}
      </h1>
      {article.subtitle && (
        <p className="mt-4 text-[19px] leading-relaxed text-ink-secondary">{article.subtitle}</p>
      )}

      <div className="mt-6 flex items-center gap-3 border-b border-border pb-6">
        {article.author?.avatar_url && (
          <Image src={article.author.avatar_url} alt="" width={36} height={36} className="rounded-full" />
        )}
        <div className="text-[14px] text-ink-secondary">
          {article.author && (
            <p className="text-ink">
              By{" "}
              <Link href={`/authors/${article.author.id}`} className="hover:underline">
                {article.author.name}
              </Link>
            </p>
          )}
          <p>
            {formatDate(article.published_at ?? article.created_at)}
            <span className="px-1.5">·</span>
            {readingTime(article.content)} min read
          </p>
        </div>
      </div>

      {article.cover_image_url && (
        <div className="relative mt-8 aspect-[16/10] w-full overflow-hidden rounded bg-surface">
          <Image
            src={article.cover_image_url}
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 760px, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <div
        className="article-prose mt-10 max-w-none"
        dangerouslySetInnerHTML={{ __html: articleContentHtml(article.content) }}
      />

      {article.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
          {article.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="rounded-full border border-border px-3 py-1 text-[13px] text-ink-secondary hover:border-accent hover:text-accent"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      <RelatedStories articles={related} />
    </article>
  );
}
