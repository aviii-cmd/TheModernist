import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getArticleById } from "@/lib/queries/articles";
import { getAuthors } from "@/lib/queries/authors";
import ArticleEditor from "@/components/ArticleEditor";

export const revalidate = 0;

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [article, authors, { data: { user } }] = await Promise.all([
    getArticleById(supabase, id),
    getAuthors(supabase),
    supabase.auth.getUser(),
  ]);

  if (!article) notFound();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink">Edit Article</h1>
      <div className="mt-6">
        <ArticleEditor
          mode="edit"
          articleId={article.id}
          authors={authors}
          canPublish={profile?.role === "editor"}
          initial={{
            title: article.title,
            subtitle: article.subtitle ?? "",
            category: article.category,
            content: article.content,
            cover_image_url: article.cover_image_url ?? "",
            author_id: article.author_id ?? "",
            featured: article.featured,
            status: article.status,
            tags: article.tags,
            published_at: article.published_at,
          }}
        />
      </div>
    </div>
  );
}
