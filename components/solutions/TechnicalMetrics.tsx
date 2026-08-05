import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { Metric } from "@/lib/solutions";
import { FIGURE_GRADIENT } from "./figureGradient";
import { MetricValue } from "./MetricValue";

/**
 * The spec-sheet band: oversized figures that count up on arrival and then
 * drift past in a continuous loop.
 *
 * A marquee rather than a grid because the figures are wildly different widths
 * — "±2–5" beside "0.5~0.8" — and equal columns left those two stranded in
 * their own whitespace. Flowing them with fixed spacing means every gap is the
 * same, and the row no longer has to fit a fixed number of metrics.
 *
 * Runs full-bleed while the heading stays in the Container, so figures are cut
 * off by the viewport edge and the row reads as longer than the screen.
 */
export function TechnicalMetrics({ metrics }: { metrics: Metric[] }) {
  // Each figure is its own one-entry description list, which keeps the term
  // and its definition paired without nesting a list inside the track.
  const items = metrics.map((metric) => (
    <dl key={metric.label} className="flex flex-col-reverse px-8 sm:px-10">
      {/* Source order is term-then-definition for screen readers;
          column-reverse puts the figure on top for everyone else.
          pre-line so a newline in the label breaks the line — the figure keeps
          nowrap of its own, since a range must never split. */}
      <dt className="mt-4 whitespace-pre-line text-sm text-muted">
        {metric.label}
      </dt>
      {/* Fills the parts that sit in normal flow — the tolerance sign and the
          range separator. The counting digits carry the same gradient
          themselves; see the note in MetricValue. */}
      <dd
        className={`whitespace-nowrap text-5xl font-semibold leading-none tracking-tight sm:text-6xl ${FIGURE_GRADIENT}`}
      >
        <MetricValue
          values={metric.values}
          decimals={metric.decimals}
          separator={metric.separator}
          prefix={metric.prefix}
          suffix={metric.suffix}
        />
      </dd>
    </dl>
  ));

  return (
    // data-metric-scope is what the counters watch: one trigger for the whole
    // band, so every figure — including its duplicate — counts on the same tick.
    <section
      data-metric-scope=""
      className="overflow-hidden border-b border-line py-14 sm:py-16"
    >
      <Container>
        <Reveal>
          <h2 className="text-2xl font-medium tracking-tight text-brand sm:text-3xl">
            Technical Metrics
          </h2>
        </Reveal>
      </Container>

      <Reveal delay={80} className="marquee mt-10">
        <div className="marquee-track">
          {/* items-start on the copies, not just the track: the figures are
              the top element of each item, so without it they hang off the
              bottom of a stretched row and a two-line label drops its whole
              column out of line with the rest. */}
          <div className="flex items-start">{items}</div>
          {/* The second copy exists only to fill the gap the first leaves as it
              slides off. Hidden from screen readers so nothing is announced
              twice, and dropped entirely under reduced motion. */}
          <div
            aria-hidden="true"
            data-marquee-clone=""
            className="flex items-start"
          >
            {items}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

