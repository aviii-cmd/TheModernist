import { createClient } from "@/lib/supabase/server";
import { getAuthors } from "@/lib/queries/authors";
import AuthorsManager from "@/components/AuthorsManager";

export const revalidate = 0;
export const metadata = { title: "Authors" };

export default async function AuthorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [authors, { data: profile }] = await Promise.all([
    getAuthors(supabase),
    user
      ? supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return <AuthorsManager initialAuthors={authors} canDelete={profile?.role === "editor"} />;
}
