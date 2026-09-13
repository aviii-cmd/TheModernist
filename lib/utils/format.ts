/** Roughly estimates reading time from plain-text article content. */
const SITE_TIMEZONE = "Asia/Kolkata";

export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** "2h ago", "5d ago" — falls back to a short date past ~6 days. */
export function relativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatDate(isoDate);
}

/** "September 11, 2026" — always shown in IST, regardless of server/browser timezone. */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: SITE_TIMEZONE,
  });
}

/** "September 11, 2026, 2:30 PM" — used for scheduled-publish timestamps. Always IST. */
export function formatDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: SITE_TIMEZONE,
  });
}

/** True when an article's `published_at` is set but still in the future. Pure instant comparison — timezone-independent. */
export function isScheduled(publishedAt: string | null): boolean {
  return !!publishedAt && new Date(publishedAt).getTime() > Date.now();
}

// The Modernist is an MDIS (India) publication — IST has no daylight saving,
// so a fixed offset is correct year-round. This site standardizes on IST for
// every schedule-related conversion below, rather than trusting the "local"
// timezone of whatever machine happens to run the code (the server usually
// runs in UTC; a reader's browser could be anywhere) — that mismatch is what
// previously caused the article editor's publish-date field and its
// "scheduled for" message to disagree.
const IST_OFFSET_MINUTES = 5 * 60 + 30;

/**
 * ISO (UTC) string → "YYYY-MM-DDTHH:mm" representing that instant in IST, for
 * a `<input type="datetime-local">`. Deterministic regardless of the runtime's
 * own timezone (uses UTC-explicit getters on a shifted timestamp, not
 * `getHours()`/`getMonth()` etc., which silently follow the local machine).
 */
export function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const shifted = new Date(new Date(iso).getTime() + IST_OFFSET_MINUTES * 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}T${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`;
}

/**
 * The inverse of `toDatetimeLocalValue`: a datetime-local input's raw value
 * (read as IST wall-clock time, since that's what the field displays) →
 * a proper UTC ISO string to store. This is what actually fixes scheduling —
 * it no longer matters what timezone the server process runs in.
 */
export function istInputToUtcIso(localValue: string): string {
  const [datePart, timePart] = localValue.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const utcMillis = Date.UTC(year, month - 1, day, hour, minute) - IST_OFFSET_MINUTES * 60_000;
  return new Date(utcMillis).toISOString();
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
