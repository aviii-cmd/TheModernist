"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center bg-paper px-5 text-center font-sans">
        <p className="font-serif text-2xl font-semibold text-ink">Something went wrong</p>
        <p className="mt-2 text-ink-secondary">The Modernist hit a snag loading this page.</p>
        <button
          onClick={() => reset()}
          className="mt-5 rounded bg-ink900 px-5 py-2.5 text-sm font-medium text-white"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
