"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import type { Author } from "@/types";

type Draft = { name: string; bio: string; avatar_url: string };
const emptyDraft: Draft = { name: "", bio: "", avatar_url: "" };

export default function AuthorsManager({
  initialAuthors,
  canDelete,
}: {
  initialAuthors: Author[];
  canDelete: boolean;
}) {
  const [authors, setAuthors] = useState(initialAuthors);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("authors").select("*").order("name");
    setAuthors(data ?? []);
  }, []);

  function startNew() {
    setDraft(emptyDraft);
    setEditingId("new");
  }

  function startEdit(author: Author) {
    setDraft({ name: author.name, bio: author.bio ?? "", avatar_url: author.avatar_url ?? "" });
    setEditingId(author.id);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    const path = `authors/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    setUploading(false);

    if (error) {
      toast.error("Avatar upload failed: " + error.message);
      return;
    }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    setDraft((d) => ({ ...d, avatar_url: data.publicUrl }));
  }

  async function handleSave() {
    if (!draft.name.trim()) {
      toast.error("Give the author a name.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: draft.name.trim(),
      bio: draft.bio.trim() || null,
      avatar_url: draft.avatar_url || null,
    };

    const { error } =
      editingId === "new"
        ? await supabase.from("authors").insert(payload)
        : await supabase.from("authors").update(payload).eq("id", editingId as string);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId === "new" ? "Author added." : "Author updated.");
    setEditingId(null);
    refresh();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Remove this author? Articles already bylined to them will keep the name on file.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("authors").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Author removed.");
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-ink">Authors</h1>
        {editingId === null && (
          <button
            type="button"
            onClick={startNew}
            className="rounded bg-ink900 px-4 py-2 text-sm font-medium text-white hover:bg-ink900/90"
          >
            + New Author
          </button>
        )}
      </div>

      {editingId !== null && (
        <div className="mt-6 rounded-md border border-border p-5">
          <div className="flex items-start gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-surface">
              {draft.avatar_url && <Image src={draft.avatar_url} alt="" fill className="object-cover" />}
            </div>
            <div className="flex-1 space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                className="w-full rounded border border-border bg-paper px-3 py-2 text-[15px] text-ink focus:border-accent"
              />
              <textarea
                placeholder="Short bio (optional)"
                rows={2}
                value={draft.bio}
                onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
                className="w-full rounded border border-border bg-paper px-3 py-2 text-[14px] text-ink focus:border-accent"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="block text-sm text-ink-secondary file:mr-3 file:rounded file:border-0 file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:file:bg-border"
              />
              {uploading && <p className="text-[13px] text-ink-secondary">Uploading…</p>}
            </div>
          </div>
          <div className="mt-4 flex gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded bg-ink900 px-4 py-2 text-sm font-medium text-white hover:bg-ink900/90 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded border border-border px-4 py-2 text-sm text-ink hover:bg-surface"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 divide-y divide-border border-y border-border">
        {authors.length === 0 && <p className="py-6 text-ink-secondary">No authors yet.</p>}
        {authors.map((author) => (
          <div key={author.id} className="flex items-center gap-4 py-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface">
              {author.avatar_url && <Image src={author.avatar_url} alt="" fill className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">{author.name}</p>
              {author.bio && <p className="truncate text-[13px] text-ink-secondary">{author.bio}</p>}
            </div>
            <button
              type="button"
              onClick={() => startEdit(author)}
              className="text-sm text-accent hover:underline"
            >
              Edit
            </button>
            {canDelete && (
              <button
                type="button"
                onClick={() => handleDelete(author.id)}
                className="text-sm text-red-700 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
