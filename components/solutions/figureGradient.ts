/**
 * The fill used by the technical-metrics figures.
 *
 * It has to be applied in two places — the <dd> covers the parts in normal
 * flow, while the counting digits carry it themselves because they are
 * positioned and fall outside the <dd>'s background-clip pass. Both must be the
 * same ramp, so it is defined once.
 *
 * Its own module rather than an export from either component: MetricValue is a
 * client component, and a plain value exported from one reaches the server as a
 * client reference, not a string.
 */
export const FIGURE_GRADIENT =
  "bg-gradient-to-b from-brand to-accent bg-clip-text text-transparent";
