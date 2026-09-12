import Image from "next/image";
import Link from "next/link";
import type { ArticleWithAuthor } from "@/types";
import { categoryLabel } from "@/types";
import { formatDate, readingTime } from "@/lib/utils/format";

export default function ArticleCard({
  article,
  imageAspect = "aspect-[4/3]",
}: {
  article: ArticleWithAuthor;
  imageAspect?: string;
}) {
  const href = `/${article.category}/${article.slug}`;

  return (
    <article className="flex flex-col">
      <Link href={href} className={`relative block ${imageAspect} overflow-hidden rounded bg-surface`}>
        {article.cover_image_url && (
          <Image
            src={article.cover_image_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 hover:scale-[1.02]"
          />
        )}
      </Link>
      <div className="mt-3 flex flex-1 flex-col">
        <span className="text-xs font-medium uppercase tracking-[0.06em] text-accent">
          {categoryLabel(article.category)}
        </span>
        <Link href={href} className="mt-1.5">
          <h3 className="font-serif text-[19px] font-semibold leading-snug text-ink hover:text-accent">
            {article.title}
          </h3>
        </Link>
        {article.subtitle && (
          <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-ink-secondary">
            {article.subtitle}
          </p>
        )}
        <p className="mt-auto pt-2.5 text-[13px] text-ink-faint">
          {formatDate(article.published_at ?? article.created_at)}
          <span className="px-1.5">·</span>
          {readingTime(article.content)} min read
        </p>
      </div>
    </article>
  );
}
