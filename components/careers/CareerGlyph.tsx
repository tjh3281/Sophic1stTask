import type { CareerGlyphName } from "@/lib/careers";

/**
 * The marks beside each culture pillar.
 *
 * A second family rather than an addition to Glyph: that set is machinery —
 * trays, lasers, grippers — and a pillar called Diversity drawn from the same
 * box would land on a barcode. Same 24-unit grid, same stroke weight and the
 * same currentColor stroke, so the two read as one house style at a glance.
 */
const PATHS: Record<CareerGlyphName, React.ReactNode> = {
  // Nodes wired to each other rather than to a hub: no one is the centre.
  network: (
    <>
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="5" cy="17" r="2.2" />
      <circle cx="19" cy="17" r="2.2" />
      <path d="M10.9 6.9 6.1 15.1M13.1 6.9l4.8 8.2M7.2 17h9.6" />
    </>
  ),
  // Three figures shoulder to shoulder, the middle one forward.
  team: (
    <>
      <circle cx="12" cy="10" r="3" />
      <path d="M6.6 20a5.4 5.4 0 0 1 10.8 0" />
      <circle cx="4.4" cy="11.5" r="2" />
      <path d="M1.5 19.6a3.6 3.6 0 0 1 2.6-4" />
      <circle cx="19.6" cy="11.5" r="2" />
      <path d="M22.5 19.6a3.6 3.6 0 0 0-2.6-4" />
    </>
  ),
  // Two bubbles, each with a tail: a conversation, not an announcement.
  dialogue: (
    <>
      <path d="M4 3.5h8.5A1.5 1.5 0 0 1 14 5v5a1.5 1.5 0 0 1-1.5 1.5H8.5L5 14.5v-3H4A1.5 1.5 0 0 1 2.5 10V5A1.5 1.5 0 0 1 4 3.5Z" />
      <path d="M12.5 13h7a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-1l-2.5 2.5V19h-3.5A1.5 1.5 0 0 1 11 17.5v-3a1.5 1.5 0 0 1 1.5-1.5Z" />
    </>
  ),
  // Bars climbing to an arrowhead: capability being stretched, not just held.
  growth: (
    <>
      <path d="M3 20h18" />
      <path d="M6.5 20v-4.2M12 20v-9M17.5 20V6.5" />
      <path d="m14.8 9.2 2.7-2.7 2.7 2.7" />
    </>
  ),
  // Four marks, none of them alike, arranged as a set rather than a stack.
  diversity: (
    <>
      <circle cx="7" cy="7" r="3" />
      <rect x="14" y="4" width="6" height="6" rx="1.4" />
      <path d="M7 14.2 10.4 20H3.6L7 14.2Z" />
      <circle cx="17" cy="17" r="3" />
    </>
  ),
  // A four-point spark, with a smaller one catching: recognition spreading.
  spark: (
    <>
      <path d="M11 3.2c.6 3.7 2.1 5.2 5.8 5.8-3.7.6-5.2 2.1-5.8 5.8-.6-3.7-2.1-5.2-5.8-5.8 3.7-.6 5.2-2.1 5.8-5.8Z" />
      <path d="M18.2 14.9c.3 1.7 1 2.4 2.7 2.7-1.7.3-2.4 1-2.7 2.7-.3-1.7-1-2.4-2.7-2.7 1.7-.3 2.4-1 2.7-2.7Z" />
    </>
  ),
  // A beam levelled on its pivot — two things held, neither of them dropped.
  balance: (
    <>
      <path d="M12 6v13.5M8 19.5h8" />
      <path d="M4 8h16" />
      <path d="M4 8 1.8 13a2.6 2.6 0 0 0 4.4 0L4 8Z" />
      <path d="m20 8-2.2 5a2.6 2.6 0 0 0 4.4 0L20 8Z" />
    </>
  ),
  // A package on legs: the tooling the work is actually done on.
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.6" />
      <rect x="10.5" y="10.5" width="3" height="3" rx="0.6" />
      <path d="M10 7V4M14 7V4M10 20v-3M14 20v-3M7 10H4M7 14H4M20 10h-3M20 14h-3" />
    </>
  ),
};

export function CareerGlyph({
  name,
  className = "h-6 w-6",
}: {
  name: CareerGlyphName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
