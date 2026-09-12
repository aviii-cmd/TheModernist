import { createClient } from "@/lib/supabase/server";
import NewsroomSidebar from "@/components/NewsroomSidebar";

export default async function NewsroomDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
    : { data: null };

  return (
    <div className="lg:flex lg:min-h-screen">
      <NewsroomSidebar profile={profile ?? null} />
      <main className="flex-1 bg-paper">
        <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">{children}</div>
      </main>
    </div>
  );
}
