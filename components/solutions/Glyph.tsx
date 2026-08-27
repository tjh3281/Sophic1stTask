import type { GlyphName } from "@/lib/solutions";

/**
 * The small line-art marks used on the sub-solution cards.
 *
 * Inline SVG rather than files: these sit at 24-28px, where a raster would be
 * soft on a high-density screen and the animated icons from the category
 * covers would be far too busy. Drawn on one 24-unit grid at a single stroke
 * weight so the set reads as one family, and stroked with currentColor so a
 * card can recolour them as it changes state.
 */
const PATHS: Record<GlyphName, React.ReactNode> = {
  // Sealed carton, drawn in perspective: the lid seam reads as the seal.
  package: (
    <>
      <path d="M12 3 3 7.5v9L12 21l9-4.5v-9L12 3Z" />
      <path d="M3 7.5 12 12l9-4.5" />
      <path d="M12 12v9" />
    </>
  ),
  // Bars of uneven height — the thing that makes a barcode legible as one.
  barcode: <path d="M4 6v12M7.5 6v12M10.5 6v8M13.5 6v12M17 6v12M20 6v8" />,
  // Sliders: settings moved off their defaults, i.e. built to order.
  tune: (
    <>
      <path d="M4 7h5M13 7h7M4 12h11M19 12h1M4 17h3M15 17h5" />
      <circle cx="11" cy="7" r="2" />
      <circle cx="17" cy="12" r="2" />
      <circle cx="13" cy="17" r="2" />
    </>
  ),
  // Dial with the needle swung high — speed held, not just reached.
  gauge: (
    <>
      <path d="M4 18a8 8 0 1 1 16 0" />
      <path d="m12 18 4.5-5.5" />
      <circle cx="12" cy="18" r="1.2" />
    </>
  ),
  // Luggage-style tag: an identifier travelling with the goods.
  tag: (
    <>
      <path d="M12.5 3H20a1 1 0 0 1 1 1v7.5a2 2 0 0 1-.59 1.41l-7.5 7.5a2 2 0 0 1-2.82 0l-6.5-6.5a2 2 0 0 1 0-2.82l7.5-7.5A2 2 0 0 1 12.5 3Z" />
      <circle cx="16.5" cy="7.5" r="1.4" />
    </>
  ),
  // A beam narrowing onto a workpiece, with the mark left behind it.
  laser: (
    <>
      <path d="M12 2v5" />
      <path d="m8.5 4.5 3.5 4 3.5-4" />
      <path d="M12 8.5 10 14h4l-2-5.5Z" />
      <path d="M4 18h16" />
      <path d="M10 21h4" />
    </>
  ),
  // Shield with a tick: the mark survives wear, heat and handling.
  durable: (
    <>
      <path d="M12 3l7 3v5.5c0 4.2-2.9 7.6-7 8.5-4.1-.9-7-4.3-7-8.5V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  // Jointed arm on a base, reaching out to a gripper.
  arm: (
    <>
      <path d="M4 21h8" />
      <path d="M8 21v-6" />
      <path d="m8 15 6-7" />
      <circle cx="8" cy="15" r="1.5" />
      <circle cx="14" cy="8" r="1.5" />
      <path d="M15.5 8H19" />
      <path d="M19 5.5v5" />
    </>
  ),
  // Stacked trays, the middle one drawn out — the switch mid-motion.
  trays: (
    <>
      <path d="M3 4.5h15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" />
      <path d="M6 11h15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" />
      <path d="M3 17.5h15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" />
    </>
  ),
  // One stream in, two out: pass one way, reject the other.
  sort: (
    <>
      <path d="M2 12h6" />
      <path d="m8 12 4-6h7" />
      <path d="m8 12 4 6h7" />
      <path d="m16.5 3 3 3-3 3" />
      <path d="m16.5 15 3 3-3 3" />
    </>
  ),
  // A lens inside a viewfinder frame: something is being looked at closely.
  lens: (
    <>
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="12" cy="12" r="1.5" />
      <path d="M4 8.5V5.5A1.5 1.5 0 0 1 5.5 4h3" />
      <path d="M15.5 4h3A1.5 1.5 0 0 1 20 5.5v3" />
      <path d="M20 15.5v3a1.5 1.5 0 0 1-1.5 1.5h-3" />
      <path d="M8.5 20h-3A1.5 1.5 0 0 1 4 18.5v-3" />
    </>
  ),
  // Bars on a baseline: a history you can look back over.
  chart: (
    <>
      <path d="M4 20h16" />
      <path d="M7.5 20v-4.5" />
      <path d="M12 20v-9" />
      <path d="M16.5 20v-13" />
    </>
  ),
  // A screen on a stand with a reading on it: the plant seen through software.
  screen: (
    <>
      <rect x="2.5" y="4" width="19" height="12.5" rx="1.8" />
      <path d="M7 13v-2.5M11 13v-5.5M15 13v-3.5" />
      <path d="M12 16.5V21" />
      <path d="M9 21h6" />
    </>
  ),
  // Drafting dividers: a dimension being set rather than measured, which is the
  // half of engineering that happens before anything is built.
  compass: (
    <>
      <circle cx="12" cy="4" r="1.7" />
      <path d="m11 5.6-4.5 13.4M13 5.6l4.5 13.4" />
      <path d="M8.9 12h6.2" />
    </>
  ),
  // Open-ended spanner: hands on equipment that is already running.
  wrench: (
    <path d="M14.2 3.4a4.8 4.8 0 0 0-3.4 8.2l-6.6 6.6a1.9 1.9 0 0 0 2.7 2.7l6.6-6.6a4.8 4.8 0 0 0 5.9-5.9l-2.7 2.7-2.8-2.8 2.7-2.7a4.8 4.8 0 0 0-2.4-2.2Z" />
  ),
  // A closed loop of arrows: the work goes round without a hand in it.
  cycle: (
    <>
      <path d="M20 12a8 8 0 0 1-13.7 5.6" />
      <path d="M4 12A8 8 0 0 1 17.7 6.4" />
      <path d="M17.5 3v3.6h-3.6M6.5 21v-3.6h3.6" />
    </>
  ),
};

export function Glyph({
  name,
  className = "h-6 w-6",
}: {
  name: GlyphName;
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
