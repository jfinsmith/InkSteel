/** URL-safe slug. MUST be the single source of truth so generated links and
 *  getStaticPaths agree (e.g. "Science & Reality" → "science-reality"). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Estimated reading time in minutes (~220 wpm). */
export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** Human date, e.g. "June 4, 2025". */
export function formatDate(d: Date, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(
    'en-US',
    opts ?? { year: 'numeric', month: 'long', day: 'numeric' },
  ).format(d);
}
