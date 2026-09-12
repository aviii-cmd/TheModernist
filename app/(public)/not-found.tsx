import Link from "next/link";

export default function PublicNotFound() {
  return (
    <div className="mx-auto max-w-grid px-5 py-24 text-center md:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.06em] text-accent">404</p>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">We couldn't find that story</h1>
      <p className="mt-3 text-ink-secondary">
        The page you're looking for may have been moved, archived, or never existed.
      </p>
      <Link href="/" className="mt-6 inline-block rounded bg-ink900 px-5 py-2.5 text-sm font-medium text-white">
        Back to the homepage
      </Link>
    </div>
  );
}
