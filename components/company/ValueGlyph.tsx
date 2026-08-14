/**
 * The six marks on Sophic's values board, redrawn as line art.
 *
 * A third glyph family, after the machinery in Glyph and the culture marks in
 * CareerGlyph, and a separate one for the same reason CareerGlyph gives for
 * splitting from Glyph: nothing in either of those sets is a handshake or a
 * globe with people over it. What they share is the house style — one square
 * grid, no fills, `currentColor` strokes, round caps — so the three read as one
 * hand at a glance.
 *
 * The grid here is 48 rather than 24. These are drawn at eight or ten times the
 * size of a pillar icon and carry real detail: a clipboard with two ticks on
 * it, three figures in front of a building. At 24 units those collapse into
 * mush, and the stroke is set to 2.4 — half the weight it would need at 24 — so
 * the line stays as fine as the board's does when it is blown up.
 *
 * Two conventions the stylesheet depends on, both of them here rather than
 * inferred from the shape of the markup:
 *
 *   - Parts that move carry a class. `nth-of-type` would be the obvious way to
 *     stagger three figures and it is a trap: it counts among siblings of the
 *     same element name, and these drawings interleave paths that animate with
 *     paths that do not, so "the second tick" is the fourth path.
 *   - Anything staggered carries `--i`, its place in its own queue. The delays
 *     are arithmetic on that, so adding a fourth figure is one number here
 *     rather than a fourth rule there.
 */

export type ValueGlyphName =
  | "win"
  | "diversity"
  | "innovation"
  | "integrity"
  | "quality"
  | "social";

/** Position in a staggered group, read by CompanyValues.css. */
const at = (index: number) => ({ "--i": index }) as React.CSSProperties;

const PATHS: Record<ValueGlyphName, React.ReactNode> = {
  /** The company behind three people: everybody standing in front of it wins. */
  win: (
    <>
      <path d="M13 27V13h22v14" />
      <path d="M10 13h28" />
      <rect x="16.5" y="17" width="4" height="4" />
      <rect x="26.5" y="17" width="4" height="4" />
      <path d="M6 41h36" />
      {/* The middle figure has its arms up; the two beside it do not. */}
      <g className="vg-rise" style={at(0)}>
        <circle cx="24" cy="28.5" r="3.1" />
        <path d="M19 41v-4a5 5 0 0 1 10 0v4" />
        <path d="M18.2 28.5 21.8 32M29.8 28.5 26.2 32" />
      </g>
      <g className="vg-rise" style={at(1)}>
        <circle cx="12.6" cy="32" r="2.4" />
        <path d="M8.8 41v-2.8a3.8 3.8 0 0 1 7.6 0V41" />
      </g>
      <g className="vg-rise" style={at(2)}>
        <circle cx="35.4" cy="32" r="2.4" />
        <path d="M31.6 41v-2.8a3.8 3.8 0 0 1 7.6 0V41" />
      </g>
    </>
  ),

  /** One world, and the people spread across it. */
  diversity: (
    <>
      <circle cx="24" cy="31" r="11" />
      <path d="M24 20c-4.6 4.6-4.6 16.4 0 22M24 20c4.6 4.6 4.6 16.4 0 22" />
      <path d="M13.4 27h21.2M13.4 35h21.2" />
      <g className="vg-centre">
        <circle cx="24" cy="9" r="3" />
        <path d="M19.4 17a4.6 4.6 0 0 1 9.2 0" />
      </g>
      <g className="vg-left">
        <circle cx="12.8" cy="11" r="2.5" />
        <path d="M9 17.6a3.8 3.8 0 0 1 7.6 0" />
      </g>
      <g className="vg-right">
        <circle cx="35.2" cy="11" r="2.5" />
        <path d="M31.4 17.6a3.8 3.8 0 0 1 7.6 0" />
      </g>
    </>
  ),

  /** A thought forming inside the lamp, and the light it throws. */
  innovation: (
    <>
      {/* Behind the glass, and the only filled shape in the set: it is light
          rather than an edge, and an outline cannot be that. */}
      <circle
        className="vg-glow"
        cx="24"
        cy="21"
        r="11"
        fill="currentColor"
        stroke="none"
      />
      <path d="M24 7a12 12 0 0 0-7 21.7V33h14v-4.3A12 12 0 0 0 24 7Z" />
      <path d="M18.5 37h11M20.5 41h7" />
      <path d="M19.6 22.4a3 3 0 0 1 3-3 2.5 2.5 0 0 1 1.4.44 2.5 2.5 0 0 1 1.4-.44 3 3 0 0 1 3 3" />
      <path d="M24 19.4V28" />
      <g className="vg-spark" style={at(0)}>
        <path d="M8.6 8.4c.5 2.5 1.1 3.1 3.6 3.6-2.5.5-3.1 1.1-3.6 3.6-.5-2.5-1.1-3.1-3.6-3.6 2.5-.5 3.1-1.1 3.6-3.6Z" />
      </g>
      <g className="vg-spark" style={at(1)}>
        <path d="M39.4 13.6c.35 1.8.8 2.25 2.6 2.6-1.8.35-2.25.8-2.6 2.6-.35-1.8-.8-2.25-2.6-2.6 1.8-.35 2.25-.8 2.6-2.6Z" />
      </g>
    </>
  ),

  /** A deal held to, under the thing that says it was worth holding to. */
  integrity: (
    <>
      <path d="M24 4l7.6 3v5.6c0 4.7-3.2 8.2-7.6 9.2-4.4-1-7.6-4.5-7.6-9.2V7L24 4Z" />
      <path d="m20.6 12.4 2.6 2.6 4.8-5" />
      <g className="vg-left">
        <path d="M3 26h7.6v9H3Z" />
        <path d="M10.6 28.2 17.8 32.3" />
      </g>
      <g className="vg-right">
        <path d="M45 26h-7.6v9H45Z" />
        <path d="M37.4 28.2 30.2 32.3" />
      </g>
      <path
        className="vg-grip"
        d="M17.8 32.3c1.6 2.4 3.8 3.7 6.2 3.7s4.6-1.3 6.2-3.7"
      />
    </>
  ),

  /** Work checked off, and the mark that says it was done properly. */
  quality: (
    <>
      <rect x="11" y="11" width="21" height="30" rx="2.5" />
      <path d="M17.5 8h8v5.4h-8Z" />
      <rect x="15.5" y="19" width="5" height="5" rx="1" />
      <path className="vg-tick" style={at(0)} d="m16.6 21.4 1.6 1.6 3.2-3.4" />
      <path d="M23.5 21.5h5" />
      <rect x="15.5" y="28.5" width="5" height="5" rx="1" />
      <path className="vg-tick" style={at(1)} d="m16.6 30.9 1.6 1.6 3.2-3.4" />
      <path d="M23.5 31h5" />
      <circle cx="36" cy="35" r="7" />
      <path className="vg-tick" style={at(2)} d="m32.8 35 2.2 2.2 4.2-4.4" />
    </>
  ),

  /** The community held up, and reaching past the edge of the drawing. */
  social: (
    <>
      <path className="vg-arc" d="M9 13a20 20 0 0 1 30 0" />
      <g className="vg-spread" style={at(0)}>
        <circle cx="24" cy="16" r="3" />
        <path d="M19.4 24a4.6 4.6 0 0 1 9.2 0" />
      </g>
      <g className="vg-spread" style={at(1)}>
        <circle cx="13.6" cy="18.4" r="2.5" />
        <path d="M9.8 25a3.8 3.8 0 0 1 7.6 0" />
      </g>
      <g className="vg-spread" style={at(2)}>
        <circle cx="34.4" cy="18.4" r="2.5" />
        <path d="M30.6 25a3.8 3.8 0 0 1 7.6 0" />
      </g>
      <path d="M6 28.5c0 7.5 8 13 18 13s18-5.5 18-13" />
      <path d="M6 28.5 2.6 25M42 28.5 45.4 25" />
    </>
  ),
};

export function ValueGlyph({
  name,
  className = "h-6 w-6",
}: {
  name: ValueGlyphName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      // Which drawing this is. Two of them share the same pair of part names —
      // Diversity's outer figures and Integrity's hands are both vg-left and
      // vg-right — and move in opposite directions, so the stylesheet has to be
      // able to tell them apart.
      data-icon={name}
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
