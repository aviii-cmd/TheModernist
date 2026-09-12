import type { Metadata } from "next";
import SubmitStoryForm from "@/components/SubmitStoryForm";

export const metadata: Metadata = { title: "Submit a Story" };

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink">Submit a Story</h1>
      <p className="mt-3 text-ink-secondary">
        Tell us what's happening. A member of the newsroom will follow up if we'd like to take it further.
      </p>
      <div className="mt-8">
        <SubmitStoryForm />
      </div>
    </div>
  );
}
