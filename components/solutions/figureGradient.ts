/**
 * The brand ramp — blue falling to teal — and the two ways it gets used.
 *
 * Its own module rather than an export from either component: MetricValue is a
 * client component, and a plain value exported from one reaches the server as a
 * client reference, not a string.
 */

/**
 * The ramp as an ordinary background, for a filled shape such as the icon tile
 * on a function card.
 */
export const BRAND_RAMP = "bg-gradient-to-b from-brand to-accent";

/**
 * The same ramp clipped to glyphs, for the technical-metrics figures.
 *
 * It has to be applied in two places — the <dd> covers the parts in normal
 * flow, while the counting digits carry it themselves because they are
 * positioned and fall outside the <dd>'s background-clip pass. Composed from
 * BRAND_RAMP so the figures and the tiles cannot drift apart.
 */
export const FIGURE_GRADIENT = `${BRAND_RAMP} bg-clip-text text-transparent`;
