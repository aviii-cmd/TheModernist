"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SubmitStoryForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot — real visitors never fill this hidden field; bots often do.
    if (String(data.get("company_website") ?? "").trim() !== "") {
      setStatus("done");
      return;
    }

    const supabase = createClient();

    try {
      const imageUrls: string[] = [];

      for (const file of files) {
        const path = `submissions/${crypto.randomUUID()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("media").upload(path, file);
        if (uploadError) throw uploadError;
        const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);
        imageUrls.push(publicUrl.publicUrl);
      }

      const { error: insertError } = await supabase.from("submissions").insert({
        title: String(data.get("title") ?? ""),
        location: String(data.get("location") ?? "") || null,
        event_date: String(data.get("event_date") ?? "") || null,
        description: String(data.get("description") ?? ""),
        submitter_name: String(data.get("submitter_name") ?? ""),
        contact: String(data.get("contact") ?? "") || null,
        image_urls: imageUrls,
      });

      if (insertError) throw insertError;

      setStatus("done");
      form.reset();
      setFiles([]);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-md border border-border bg-surface p-8 text-center">
        <h2 className="font-serif text-xl font-semibold text-ink">
          Thanks. Your tip has been sent to The Modernist newsroom.
        </h2>
        <p className="mt-2 text-ink-secondary">
          We read every submission. We can't promise every tip becomes a story, but a reporter will take a look.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot field — hidden from real visitors via CSS, not `display:none` (which some bots skip) */}
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="company_website">Leave this field empty</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Field label="What's happening?" name="title" required>
        <input
          id="title"
          name="title"
          required
          type="text"
          className="input"
          placeholder="Coding club drew 47 students this week"
        />
      </Field>

      <Field label="Where did it happen?" name="location">
        <input id="location" name="location" type="text" className="input" placeholder="Room 204" />
      </Field>

      <Field label="When did it happen?" name="event_date">
        <input id="event_date" name="event_date" type="date" className="input max-w-[220px]" />
      </Field>

      <Field label="Tell us what you know." name="description" required>
        <textarea
          id="description"
          name="description"
          required
          rows={6}
          className="input resize-y"
          placeholder="Share as much detail as you can — what happened, who was involved, why it matters."
        />
      </Field>

      <Field label="Upload photos" name="photos">
        <input
          id="photos"
          name="photos"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="block w-full text-sm text-ink-secondary file:mr-4 file:rounded file:border-0 file:bg-surface file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-border"
        />
        {files.length > 0 && (
          <p className="mt-1.5 text-[13px] text-ink-secondary">{files.length} photo(s) selected</p>
        )}
      </Field>

      <Field label="Your name" name="submitter_name" required>
        <input id="submitter_name" name="submitter_name" required type="text" className="input" />
      </Field>

      <Field label="Optional contact information" name="contact">
        <input
          id="contact"
          name="contact"
          type="text"
          className="input"
          placeholder="Email or phone, in case we have follow-up questions"
        />
      </Field>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded bg-ink900 px-6 py-2.5 text-sm font-medium text-white hover:bg-ink900/90 disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : "Submit Story"}
      </button>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 6px;
          border: 1px solid #e3e1da;
          background: #fafaf8;
          padding: 0.625rem 0.75rem;
          font-size: 15px;
          color: #14171b;
        }
        .input:focus {
          outline: none;
          border-color: #1f3d66;
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      {children}
    </div>
  );
}
