import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAuthorById } from "@/lib/queries/authors";
import { getArticlesByAuthor } from "@/lib/queries/articles";
import ArticleGrid from "@/components/ArticleGrid";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const author = await getAuthorById(supabase, id);
  if (!author) return {};
  return { title: author.name };
}

export default async function AuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const author = await getAuthorById(supabase, id);
  if (!author) notFound();

  const articles = await getArticlesByAuthor(supabase, id);

  return (
    <div className="mx-auto max-w-grid px-5 py-10 md:px-8">
      <div className="flex items-center gap-4">
        {author.avatar_url && (
          <Image
            src={author.avatar_url}
            alt=""
            width={64}
            height={64}
            className="rounded-full"
          />
        )}
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">{author.name}</h1>
          {author.bio && <p className="mt-1 max-w-lg text-[15px] text-ink-secondary">{author.bio}</p>}
        </div>
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <h2 className="font-serif text-lg font-semibold text-ink">Stories</h2>
        <div className="mt-5">
          <ArticleGrid articles={articles} />
        </div>
      </div>
    </div>
  );
}
