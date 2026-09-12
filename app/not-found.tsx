import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <p className="font-serif text-2xl font-semibold text-ink">Page not found</p>
      <Link href="/" className="mt-4 text-accent hover:underline">
        Back to The Modernist
      </Link>
    </div>
  );
}
