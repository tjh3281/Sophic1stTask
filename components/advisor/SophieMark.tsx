/**
 * Sophie's face.
 *
 * An HMI panel — the screen bolted to the front of a machine — rather than a
 * speech bubble. The bubble is what every assistant on every site wears, and it
 * says nothing about where this one lives. A panel with two indicator lamps and
 * an antenna belongs on a factory floor, and it is drawn in the same line-art
 * weight as the glyphs already used across the solution pages.
 */
export function SophieMark({ className }: { className?: string }) {
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      {/* Antenna, so the panel reads as listening rather than as a box. */}
      <path d="M12 3v2.5" {...stroke} />
      <circle cx="12" cy="2.5" r="1.15" fill="currentColor" />
      <rect x="3.5" y="5.5" width="17" height="13" rx="3.25" {...stroke} />
      {/* Lamps, set wide — close together they read as a face in distress. */}
      <circle cx="9" cy="11" r="1.35" fill="currentColor" />
      <circle cx="15" cy="11" r="1.35" fill="currentColor" />
      <path d="M9.5 15h5" {...stroke} />
      {/* Feet: the panel is mounted on something. */}
      <path d="M8 18.5v2M16 18.5v2" {...stroke} />
    </svg>
  );
}
