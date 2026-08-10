import { PLACEHOLDER_NOTICE } from "@/lib/careers";

/**
 * Says out loud that the vacancies below are invented.
 *
 * On the page rather than in a code comment, and on both openings routes
 * rather than only the first: a sample job ad is the one kind of placeholder a
 * reader can act on by mistake, and somebody who arrives on a role's own URL
 * from a shared link never sees the listing page that would have warned them.
 *
 * Amber rather than the brand blue. Every other tinted thing on the site is
 * blue, so a blue notice would read as a feature of the page instead of a
 * caveat about it.
 */
export function PlaceholderNotice() {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-lg border border-amber-300/70 bg-amber-50 px-4 py-3"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5M12 16.2h.01" />
      </svg>
      <p className="text-sm leading-relaxed text-amber-900">
        {PLACEHOLDER_NOTICE}
      </p>
    </div>
  );
}
