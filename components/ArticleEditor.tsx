"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { createArticle, updateArticle, setArticleStatus, deleteArticle, type ArticleActionState } from "@/lib/actions/articles";
import RichTextEditor from "@/components/RichTextEditor";
import { articleContentHtml } from "@/lib/utils/content";
import { toDatetimeLocalValue, isScheduled, formatDateTime } from "@/lib/utils/format";
import { CATEGORIES } from "@/types";
import type { Author, ArticleCategory, ArticleStatus } from "@/types";

type Initial = {
  title: string;
  subtitle: string;
  category: ArticleCategory;
  content: string;
  cover_image_url: string;
  author_id: string;
  featured: boolean;
  status: ArticleStatus;
  tags: string[];
  published_at: string | null;
};

const emptyInitial: Initial = {
  title: "",
  subtitle: "",
  category: "news",
  content: "",
  cover_image_url: "",
  author_id: "",
  featured: false,
  status: "draft",
  tags: [],
  published_at: null,
};

export default function ArticleEditor({
  mode,
  articleId,
  initial,
  authors,
  canPublish,
}: {
  mode: "new" | "edit";
  articleId?: string;
  initial?: Initial;
  authors: Author[];
  canPublish: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const values = initial ?? emptyInitial;

  const [subtitle, setSubtitle] = useState(values.subtitle);
  const [category, setCategory] = useState<ArticleCategory>(values.category);
  const [authorId, setAuthorId] = useState(values.author_id);
  const [coverImageUrl, setCoverImageUrl] = useState(values.cover_image_url);
  const [featured, setFeatured] = useState(values.featured);
  const [content, setContent] = useState(values.content);
  const [title, setTitle] = useState(values.title);
  const [tagsInput, setTagsInput] = useState(values.tags.join(", "));
  const [publishAt, setPublishAt] = useState(toDatetimeLocalValue(values.published_at));
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ArticleStatus>("draft");

  const boundAction =
    mode === "new" ? createArticle : updateArticle.bind(null, articleId as string);
  const [state, formAction, formPending] = useActionState<ArticleActionState, FormData>(
    boundAction,
    { error: null }
  );

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    const path = `articles/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    setUploading(false);

    if (error) {
      toast.error("Cover image upload failed: " + error.message);
      return;
    }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    setCoverImageUrl(data.publicUrl);
  }

  function submitWithStatus(status: ArticleStatus, formEl: HTMLFormElement) {
    setPendingStatus(status);
    const statusInput = formEl.elements.namedItem("status") as HTMLInputElement;
    statusInput.value = status;
    formEl.requestSubmit();
  }

  function archiveOrRestore(next: ArticleStatus) {
    if (!articleId) return;
    startTransition(async () => {
      const { error } = await setArticleStatus(articleId, next);
      if (error) toast.error(error);
      else router.refresh();
    });
  }

  function handleDelete() {
    if (!articleId) return;
    if (!window.confirm("Delete this article permanently? This can't be undone.")) return;
    startTransition(async () => {
      const { error } = await deleteArticle(articleId);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Article deleted.");
        router.push("/newsroom/articles");
      }
    });
  }

  const busy = formPending || isPending || uploading;

  return (
    <div>
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="status" value={values.status} />

        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-ink">
            Headline
          </label>
          <input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border border-border bg-paper px-3 py-2.5 font-serif text-[22px] text-ink focus:border-accent"
            placeholder="Write a clear, specific headline"
          />
        </div>

        <div>
          <label htmlFor="subtitle" className="mb-1.5 block text-sm font-medium text-ink">
            Subtitle / Dek
          </label>
          <textarea
            id="subtitle"
            name="subtitle"
            rows={2}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full rounded border border-border bg-paper px-3 py-2 text-[15px] text-ink focus:border-accent"
            placeholder="One or two sentences summarizing the story"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-ink">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ArticleCategory)}
              className="w-full rounded border border-border bg-paper px-3 py-2 text-[15px] text-ink focus:border-accent"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="author_id" className="mb-1.5 block text-sm font-medium text-ink">
              Author
            </label>
            <select
              id="author_id"
              name="author_id"
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="w-full rounded border border-border bg-paper px-3 py-2 text-[15px] text-ink focus:border-accent"
            >
              <option value="">Unassigned</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Cover image</label>
          <input type="hidden" name="cover_image_url" value={coverImageUrl} />
          {coverImageUrl && (
            <div className="relative mb-2 aspect-[16/9] w-full max-w-md overflow-hidden rounded bg-surface">
              <Image src={coverImageUrl} alt="" fill className="object-cover" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="block text-sm text-ink-secondary file:mr-4 file:rounded file:border-0 file:bg-surface file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-border"
          />
          {uploading && <p className="mt-1 text-[13px] text-ink-secondary">Uploading…</p>}
        </div>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="featured"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Feature this story on the homepage hero
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="tags" className="mb-1.5 block text-sm font-medium text-ink">
              Tags
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="coding-club, robotics, science-fair"
              className="w-full rounded border border-border bg-paper px-3 py-2 text-[15px] text-ink focus:border-accent"
            />
            <p className="mt-1 text-[12px] text-ink-secondary">Comma-separated. Optional — used for cross-category topic pages.</p>
          </div>

          {canPublish && (
            <div>
              <label htmlFor="published_at" className="mb-1.5 block text-sm font-medium text-ink">
                Publish date &amp; time
              </label>
              <input
                id="published_at"
                name="published_at"
                type="datetime-local"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
                className="w-full rounded border border-border bg-paper px-3 py-2 text-[15px] text-ink focus:border-accent"
              />
              <p className="mt-1 text-[12px] text-ink-secondary">
                {publishAt
                  ? new Date(publishAt).getTime() > Date.now()
                    ? "Scheduled — goes live automatically at this time once published."
                    : "In the past — will go live immediately once published."
                  : "Leave blank to publish immediately."}
              </p>
            </div>
          )}
        </div>

        {mode === "edit" && isScheduled(values.published_at) && (
          <p className="rounded-md bg-blue-50 px-4 py-2.5 text-sm text-blue-800">
            This article is scheduled to go live {formatDateTime(values.published_at as string)}.
          </p>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Article body</label>
          <input type="hidden" name="content" value={content} />
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        {state.error && <p className="text-sm text-red-700">{state.error}</p>}

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
          {(mode === "new" || values.status === "draft") && (
            <button
              type="button"
              disabled={busy}
              onClick={(e) => submitWithStatus("draft", e.currentTarget.form as HTMLFormElement)}
              className="rounded border border-border px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface disabled:opacity-60"
            >
              {busy && pendingStatus === "draft" ? "Saving…" : "Save Draft"}
            </button>
          )}

          {mode === "edit" && values.status !== "draft" && (
            <button
              type="button"
              disabled={busy}
              onClick={(e) => submitWithStatus(values.status, e.currentTarget.form as HTMLFormElement)}
              className="rounded border border-border px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface disabled:opacity-60"
            >
              {busy && pendingStatus === values.status ? "Saving…" : "Save Changes"}
            </button>
          )}

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="rounded border border-border px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface"
          >
            Preview
          </button>

          {canPublish && (mode === "new" || values.status === "draft") && (
            <button
              type="button"
              disabled={busy}
              onClick={(e) => submitWithStatus("published", e.currentTarget.form as HTMLFormElement)}
              className="rounded bg-ink900 px-5 py-2.5 text-sm font-medium text-white hover:bg-ink900/90 disabled:opacity-60"
            >
              {busy && pendingStatus === "published" ? "Publishing…" : "Publish"}
            </button>
          )}

          {mode === "edit" && canPublish && values.status === "published" && (
            <button
              type="button"
              onClick={() => archiveOrRestore("archived")}
              className="ml-auto text-sm text-ink-secondary hover:text-ink"
            >
              Archive
            </button>
          )}
          {mode === "edit" && canPublish && values.status === "archived" && (
            <button
              type="button"
              onClick={() => archiveOrRestore("published")}
              className="ml-auto text-sm text-accent hover:underline"
            >
              Restore to published
            </button>
          )}
          {mode === "edit" && canPublish && (
            <button
              type="button"
              onClick={handleDelete}
              className={`text-sm text-red-700 hover:underline ${values.status === "draft" ? "ml-auto" : ""}`}
            >
              Delete
            </button>
          )}
        </div>
      </form>

      {previewOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink900/60 px-4 py-8">
          <div className="mx-auto max-w-[760px] rounded-md bg-paper p-6 md:p-10">
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="mb-6 text-sm text-ink-secondary hover:text-ink"
            >
              ← Close preview
            </button>
            <span className="text-xs font-medium uppercase tracking-[0.06em] text-accent">
              {CATEGORIES.find((c) => c.value === category)?.label}
            </span>
            <h1 className="mt-3 font-serif text-[32px] font-semibold leading-[1.15] text-ink">
              {title || "Untitled draft"}
            </h1>
            {subtitle && <p className="mt-4 text-[18px] text-ink-secondary">{subtitle}</p>}
            {coverImageUrl && (
              <div className="relative mt-8 aspect-[16/10] w-full overflow-hidden rounded bg-surface">
                <Image src={coverImageUrl} alt="" fill className="object-cover" />
              </div>
            )}
            <div
              className="article-prose mt-10 max-w-none"
              dangerouslySetInnerHTML={{ __html: articleContentHtml(content) }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
