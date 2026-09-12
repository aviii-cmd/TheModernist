import Image from "next/image";
import Link from "next/link";
import type { ArticleWithAuthor } from "@/types";
import { categoryLabel } from "@/types";
import { formatDate, readingTime } from "@/lib/utils/format";

export default function HeroStory({ article }: { article: ArticleWithAuthor }) {
  const href = `/${article.category}/${article.slug}`;

  return (
    <section className="border-b border-border pb-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col justify-center">
          <span className="text-xs font-medium uppercase tracking-[0.06em] text-accent">
            {categoryLabel(article.category)}
          </span>
          <Link href={href}>
            <h1 className="mt-3 font-serif text-[34px] font-semibold leading-[1.12] text-ink sm:text-[42px] lg:text-[44px]">
              {article.title}
            </h1>
          </Link>
          {article.subtitle && (
            <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-ink-secondary">
              {article.subtitle}
            </p>
          )}
          <div className="mt-6 flex items-center gap-3">
            {article.author?.avatar_url && (
              <Image
                src={article.author.avatar_url}
                alt=""
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <p className="text-[14px] text-ink-secondary">
              {article.author && (
                <>
                  By{" "}
                  <Link href={`/authors/${article.author.id}`} className="hover:text-ink hover:underline">
                    {article.author.name}
                  </Link>
                </>
              )}
              <span className="px-1.5">·</span>
              {formatDate(article.published_at ?? article.created_at)}
              <span className="px-1.5">·</span>
              {readingTime(article.content)} min read
            </p>
          </div>
        </div>

        <Link
          href={href}
          className="relative block aspect-[4/3] overflow-hidden rounded bg-surface lg:aspect-auto"
        >
          {article.cover_image_url && (
            <Image
              src={article.cover_image_url}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          )}
        </Link>
      </div>
    </section>
  );
}
