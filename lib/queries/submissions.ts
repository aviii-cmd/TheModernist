import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Submission } from "@/types";

type Client = SupabaseClient<Database>;

export async function getSubmissions(
  supabase: Client,
  status?: Submission["status"]
): Promise<Submission[]> {
  let query = supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data } = await query;
  return data ?? [];
}

export async function getSubmissionById(
  supabase: Client,
  id: string
): Promise<Submission | null> {
  const { data } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return data;
}
