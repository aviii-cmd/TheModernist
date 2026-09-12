import Link from "next/link";

export default function Pagination({
  basePath,
  page,
  totalPages,
}: {
  basePath: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-10 flex items-center justify-between border-t border-border pt-6" aria-label="Pagination">
      {page > 1 ? (
        <Link href={`${basePath}?page=${page - 1}`} className="text-sm text-accent hover:underline">
          ← Newer
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-ink-secondary">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={`${basePath}?page=${page + 1}`} className="text-sm text-accent hover:underline">
          Older →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
