/**
 * The five partnership glyphs.
 *
 * A fourth glyph family on the site, and drawn to its own rules rather than the
 * values board's: these sit inside a disc at roughly twice the size, on near
 * black, so they are built on a 48 grid with a slightly lighter stroke and no
 * fills at all. Line only — a filled shape at this size on this ground turns
 * into a blob before it turns into a picture.
 *
 * Each is a single idea rather than a literal transcription of the reference
 * artwork. "Shared Expertise" is the clearest case: the reference draws two
 * heads *and* two lightbulbs, but a lightbulb is already what "Co-Creation &
 * Innovation" is, and two icons in one row that both resolve to "bulb" tell the
 * reader less than two that do not. So this one keeps the heads and the
 * exchange and drops the bulb.
 */

export type PartnerGlyphName =
  | "alignment"
  | "support"
  | "co-creation"
  | "expertise"
  | "agile";

const COMMON = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.1,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Eight gear teeth, spaced by angle rather than written out by hand. */
function teeth(cx: number, cy: number, inner: number, outer: number) {
  return Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return (
      <line
        key={i}
        x1={cx + cos * inner}
        y1={cy + sin * inner}
        x2={cx + cos * outer}
        y2={cy + sin * outer}
      />
    );
  });
}

export function PartnerGlyph({
  name,
  className = "",
}: {
  name: PartnerGlyphName;
  className?: string;
}) {
  return (
    <svg {...COMMON} className={className} aria-hidden="true" focusable="false">
      {name === "alignment" && (
        <>
          {/* A globe, read through a lens, with the pin marking the place the
              two parties are aiming at. */}
          <circle cx="20" cy="19" r="12.5" />
          <ellipse cx="20" cy="19" rx="5.6" ry="12.5" />
          <path d="M7.9 14.2h24.2M7.9 23.8h24.2" />
          <circle cx="31.5" cy="31.5" r="9" />
          <path d="M38 38l5.5 5.5" />
          <path d="M31.5 36.2s-3.4-3.9-3.4-6a3.4 3.4 0 1 1 6.8 0c0 2.1-3.4 6-3.4 6z" />
        </>
      )}

      {name === "support" && (
        <>
          {/* A headset over a speech bubble: someone on the line, for the whole
              length of it. */}
          <path d="M10.5 23.5v-3a13.5 13.5 0 0 1 27 0v3" />
          <rect x="6" y="21.5" width="6.5" height="11" rx="3.25" />
          <rect x="35.5" y="21.5" width="6.5" height="11" rx="3.25" />
          <path d="M38.75 32.5v3.25a4 4 0 0 1-4 4h-4.5" />
          <rect x="16" y="17.5" width="16" height="12" rx="3.5" />
          <path d="M21 29.5v4.5l5-4.5" />
          <path d="M20.5 23.5h.02M24 23.5h.02M27.5 23.5h.02" />
        </>
      )}

      {name === "co-creation" && (
        <>
          {/* The idea held between two hands rather than by one — the gear
              inside it is what keeps it from being only an idea.
              The hands are drawn with their thumbs up and a gap where they
              meet. An earlier pass had them as two plain arcs, which at this
              size read as a pair of brackets; the thumb is the single stroke
              that makes the shape a hand. */}
          <path d="M24 6a8 8 0 0 1 4.624 14.48c-.85.66-1.32 1.6-1.32 2.64v1.3h-7.16v-1.3c0-1.04-.47-1.98-1.32-2.64A8 8 0 0 1 24 6z" />
          <path d="M20.7 27.5h6.6" />
          <circle cx="24" cy="14" r="2.5" />
          {teeth(24, 14, 3.3, 4.8)}
          <path d="M23 43.5H17c-3.9 0-7-3.1-7-7v-4.2c0-1 .8-1.8 1.8-1.8s1.8.8 1.8 1.8v2.7" />
          <path d="M25 43.5h6c3.9 0 7-3.1 7-7v-4.2c0-1-.8-1.8-1.8-1.8s-1.8.8-1.8 1.8v2.7" />
        </>
      )}

      {name === "expertise" && (
        <>
          {/* Two people and what passes between them, both ways. */}
          <circle cx="12" cy="12.5" r="6" />
          <path d="M3 28.5a9 9 0 0 1 18 0" />
          <circle cx="36" cy="12.5" r="6" />
          <path d="M27 28.5a9 9 0 0 1 18 0" />
          <path d="M17.5 36.5h13" />
          <path d="M27.5 33.5l3 3-3 3" />
          <path d="M30.5 43.5h-13" />
          <path d="M20.5 40.5l-3 3 3 3" />
        </>
      )}

      {name === "agile" && (
        <>
          {/* The work turning, and coming back round changed. */}
          <circle cx="24" cy="24" r="5" />
          {teeth(24, 24, 5.8, 8.4)}
          <path d="M11.9 17A14 14 0 0 1 36.1 17" />
          <path d="M31.5 15.4l4.9 1.9-1.7 5" />
          <path d="M36.1 31A14 14 0 0 1 11.9 31" />
          <path d="M16.5 32.6l-4.9-1.9 1.7-5" />
        </>
      )}
    </svg>
  );
}
