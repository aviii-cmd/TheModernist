"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { setSubmissionStatus, convertSubmissionToDraft } from "@/lib/actions/submissions";
import { relativeTime } from "@/lib/utils/format";
import type { Submission } from "@/types";

const STATUS_STYLES: Record<Submission["status"], string> = {
  new: "bg-blue-50 text-blue-700",
  reviewing: "bg-amber-50 text-amber-700",
  converted: "bg-emerald-50 text-emerald-700",
  rejected: "bg-gray-100 text-gray-500",
};

export default function SubmissionCard({ submission }: { submission: Submission }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function updateStatus(status: Submission["status"]) {
    startTransition(async () => {
      await setSubmissionStatus(submission.id, status);
      router.refresh();
    });
  }

  function convert() {
    startTransition(async () => {
      await convertSubmissionToDraft(submission.id);
    });
  }

  return (
    <div className="rounded-md border border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{submission.title}</p>
          <p className="mt-0.5 text-[13px] text-ink-secondary">
            Submitted by {submission.submitter_name}
            <span className="px-1.5">·</span>
            {relativeTime(submission.created_at)}
          </p>
        </div>
        <span className={`shrink-0 rounded px-2 py-0.5 text-[12px] font-medium capitalize ${STATUS_STYLES[submission.status]}`}>
          {submission.status}
        </span>
      </button>

      {open && (
        <div className="border-t border-border px-4 py-4">
          <dl className="grid gap-x-6 gap-y-2 text-[14px] sm:grid-cols-2">
            {submission.location && (
              <div>
                <dt className="text-ink-secondary">Where</dt>
                <dd className="text-ink">{submission.location}</dd>
              </div>
            )}
            {submission.event_date && (
              <div>
                <dt className="text-ink-secondary">When</dt>
                <dd className="text-ink">{submission.event_date}</dd>
              </div>
            )}
            {submission.contact && (
              <div>
                <dt className="text-ink-secondary">Contact</dt>
                <dd className="text-ink">{submission.contact}</dd>
              </div>
            )}
          </dl>

          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
            {submission.description}
          </p>

          {submission.image_urls.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {submission.image_urls.map((url) => (
                <div key={url} className="relative aspect-square overflow-hidden rounded bg-surface">
                  <Image src={url} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
            {submission.status !== "converted" && (
              <button
                type="button"
                disabled={isPending}
                onClick={convert}
                className="rounded bg-ink900 px-4 py-2 text-sm font-medium text-white hover:bg-ink900/90 disabled:opacity-60"
              >
                Create Article Draft
              </button>
            )}
            {submission.status === "new" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => updateStatus("reviewing")}
                className="rounded border border-border px-4 py-2 text-sm text-ink hover:bg-surface"
              >
                Mark as reviewing
              </button>
            )}
            {submission.status !== "rejected" && submission.status !== "converted" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => updateStatus("rejected")}
                className="ml-auto text-sm text-ink-secondary hover:text-ink"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
