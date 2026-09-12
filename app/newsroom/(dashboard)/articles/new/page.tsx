import { createClient } from "@/lib/supabase/server";
import { getAuthors } from "@/lib/queries/authors";
import ArticleEditor from "@/components/ArticleEditor";

export const metadata = { title: "New Article" };

export default async function NewArticlePage() {
  const supabase = await createClient();
  const [{ data: { user } }, authors] = await Promise.all([
    supabase.auth.getUser(),
    getAuthors(supabase),
  ]);

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink">New Article</h1>
      <div className="mt-6">
        <ArticleEditor mode="new" authors={authors} canPublish={profile?.role === "editor"} />
      </div>
    </div>
  );
}
