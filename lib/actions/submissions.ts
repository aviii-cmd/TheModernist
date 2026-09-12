"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/format";
import type { Submission } from "@/types";

export async function setSubmissionStatus(id: string, status: Submission["status"]) {
  const supabase = await createClient();
  const { error } = await supabase.from("submissions").update({ status }).eq("id", id);
  revalidatePath("/newsroom/submissions");
  return { error: error?.message ?? null };
}

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  title: string
): Promise<string> {
  const base = slugify(title) || "story";
  let candidate = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data } = await supabase.from("articles").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

/** Turns a public story tip into a draft article, ready for a reporter to write up. */
export async function convertSubmissionToDraft(submissionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/newsroom/login");

  const { data: submission } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission) return { error: "Submission not found." };

  const slug = await uniqueSlug(supabase, submission.title);

  const contextLines = [
    submission.location ? `Location: ${submission.location}` : null,
    submission.event_date ? `When: ${submission.event_date}` : null,
    `Submitted by: ${submission.submitter_name}${submission.contact ? ` (${submission.contact})` : ""}`,
  ].filter(Boolean);

  const draftContent = [
    `Tip details — ${contextLines.join(" · ")}`,
    "",
    submission.description,
  ].join("\n\n");

  const { data: article, error } = await supabase
    .from("articles")
    .insert({
      title: submission.title,
      slug,
      category: "news",
      content: draftContent,
      cover_image_url: submission.image_urls?.[0] ?? null,
      status: "draft",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await supabase
    .from("submissions")
    .update({ status: "converted", article_id: article.id })
    .eq("id", submissionId);

  revalidatePath("/newsroom/submissions");
  redirect(`/newsroom/articles/${article.id}`);
}
