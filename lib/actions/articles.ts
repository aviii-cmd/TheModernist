"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify, istInputToUtcIso } from "@/lib/utils/format";
import type { ArticleCategory, ArticleStatus } from "@/types";

export type ArticleActionState = { error: string | null };

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  title: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(title) || "story";
  let candidate = base;
  let n = 1;

  // Small, bounded loop — fine for a school-scale publication.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let query = supabase.from("articles").select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

function fieldsFromForm(formData: FormData) {
  const publishedAtRaw = String(formData.get("published_at") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "");

  return {
    title: String(formData.get("title") ?? "").trim(),
    subtitle: String(formData.get("subtitle") ?? "").trim() || null,
    category: String(formData.get("category") ?? "news") as ArticleCategory,
    content: String(formData.get("content") ?? ""),
    cover_image_url: String(formData.get("cover_image_url") ?? "").trim() || null,
    author_id: String(formData.get("author_id") ?? "").trim() || null,
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
    tags: tagsRaw
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
    // Left blank = "publish now" (the database trigger fills this in).
    // Set to a future time = scheduled publish, enforced by RLS, not a cron job.
    // The datetime-local field is filled in as IST wall-clock time (see the
    // editor), so it must be converted with the same fixed IST offset here —
    // never `new Date(raw).toISOString()`, which silently uses whatever
    // timezone this server process happens to run in (usually UTC) and was
    // the source of the scheduling bug.
    published_at: publishedAtRaw ? istInputToUtcIso(publishedAtRaw) : null,
  };
}

export async function createArticle(
  _prevState: ArticleActionState,
  formData: FormData
): Promise<ArticleActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const fields = fieldsFromForm(formData);
  if (!fields.title) return { error: "Give the article a headline first." };

  const slug = await uniqueSlug(supabase, fields.title);
  const status = String(formData.get("status") ?? "draft") as ArticleStatus;

  const { data, error } = await supabase
    .from("articles")
    .insert({ ...fields, slug, status, created_by: user.id })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/newsroom/articles");
  redirect(`/newsroom/articles/${data.id}`);
}

export async function updateArticle(
  id: string,
  _prevState: ArticleActionState,
  formData: FormData
): Promise<ArticleActionState> {
  const supabase = await createClient();
  const fields = fieldsFromForm(formData);
  if (!fields.title) return { error: "Give the article a headline first." };

  const { error } = await supabase.from("articles").update(fields).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/newsroom/articles");
  revalidatePath(`/newsroom/articles/${id}`);
  revalidatePath("/");
  return { error: null };
}

export async function setArticleStatus(id: string, status: ArticleStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("articles").update({ status }).eq("id", id);

  revalidatePath("/newsroom/articles");
  revalidatePath(`/newsroom/articles/${id}`);
  revalidatePath("/");

  return { error: error?.message ?? null };
}

/** Editors only (enforced by RLS) — permanently removes an article. */
export async function deleteArticle(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("articles").delete().eq("id", id);

  if (!error) {
    revalidatePath("/newsroom/articles");
    revalidatePath("/");
  }

  return { error: error?.message ?? null };
}
