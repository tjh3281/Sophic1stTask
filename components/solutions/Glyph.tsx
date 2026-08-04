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
