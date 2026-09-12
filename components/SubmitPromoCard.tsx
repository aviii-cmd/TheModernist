import Link from "next/link";

const STORY_KINDS = [
  "News and current events",
  "Student achievements",
  "Club and event updates",
  "Opinion pieces",
  "Investigative stories",
  "Anything that matters to our school",
];

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden className="mt-0.5 shrink-0">
      <path d="M2 6.5L5 9.5L11 3" stroke="#1F3D66" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SubmitPromoCard() {
  return (
    <div className="rounded-md border border-border p-5">
      <h2 className="flex items-center gap-1.5 font-serif text-lg font-semibold text-ink">
        <span className="text-accent">
          <PencilIcon />
        </span>
        Submit a Story
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
        Seen something interesting? Know a story worth telling? We want to hear from you.
      </p>
      <Link
        href="/submit"
        className="mt-4 inline-block rounded bg-ink900 px-4 py-2 text-sm font-medium text-white hover:bg-ink900/90"
      >
        Share a Tip →
      </Link>

      <p className="mt-5 text-[12px] font-medium uppercase tracking-[0.05em] text-ink-secondary">
        What kind of stories?
      </p>
      <ul className="mt-2 space-y-1.5">
        {STORY_KINDS.map((kind) => (
          <li key={kind} className="flex items-start gap-2 text-[13.5px] text-ink-secondary">
            <CheckIcon />
            {kind}
          </li>
        ))}
      </ul>
    </div>
  );
}
