import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Author } from "@/types";

type Client = SupabaseClient<Database>;

export async function getAuthors(supabase: Client): Promise<Author[]> {
  const { data } = await supabase.from("authors").select("*").order("name");
  return data ?? [];
}

export async function getAuthorById(supabase: Client, id: string): Promise<Author | null> {
  const { data } = await supabase.from("authors").select("*").eq("id", id).maybeSingle();
  return data;
}
