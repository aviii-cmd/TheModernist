"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

type MediaItem = { name: string; url: string; createdAt: string | null };

export default function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("media")
      .list("articles", { sortBy: { column: "created_at", order: "desc" }, limit: 100 });

    const withUrls = (data ?? [])
      .filter((f) => f.name !== ".emptyFolderPlaceholder")
      .map((f) => {
        const { data: pub } = supabase.storage.from("media").getPublicUrl(`articles/${f.name}`);
        return { name: f.name, url: pub.publicUrl, createdAt: f.created_at ?? null };
      });

    setItems(withUrls);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setUploading(true);
    const supabase = createClient();
    let failures = 0;
    for (const file of files) {
      const path = `articles/${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) failures += 1;
    }
    setUploading(false);
    if (failures > 0) {
      toast.error(`${failures} file(s) failed to upload.`);
    } else {
      toast.success(`${files.length} file(s) uploaded.`);
    }
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-ink">Media</h1>
        <label className="cursor-pointer rounded bg-ink900 px-4 py-2 text-sm font-medium text-white hover:bg-ink900/90">
          {uploading ? "Uploading…" : "+ Upload"}
          <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
        </label>
      </div>

      {loading ? (
        <p className="mt-6 text-ink-secondary">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-ink-secondary">
          No media yet. Images you upload here, or as article cover photos, will show up in this library.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square overflow-hidden rounded bg-surface"
            >
              <Image src={item.url} alt="" fill className="object-cover transition group-hover:opacity-90" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
