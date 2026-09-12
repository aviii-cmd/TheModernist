"use client";

import { useState, type FormEvent } from "react";

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 4L8 9L14 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function NewsletterCard() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="rounded-md border border-border p-5">
      <h2 className="flex items-center gap-1.5 font-serif text-lg font-semibold text-ink">
        <span className="text-accent">
          <MailIcon />
        </span>
        Get the latest
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
        Straight to your inbox. Subscribe for weekly updates.
      </p>
      {submitted ? (
        <p className="mt-4 text-[14px] text-ink">Thanks — we'll be in touch.</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
          <input
            type="email"
            required
            placeholder="Enter your school email"
            className="w-full rounded border border-border bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent"
          />
          <button
            type="submit"
            className="w-full rounded bg-ink900 px-4 py-2 text-sm font-medium text-white hover:bg-ink900/90"
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}
