import { Container } from "@/components/ui/Container";
import { CursorGrid } from "@/components/ui/CursorGrid";
import { Reveal } from "@/components/ui/Reveal";
import type { HeroSlide, Solution, SubSolution } from "@/lib/solutions";
import { Breadcrumbs } from "./Breadcrumbs";
import { HeroCarousel } from "./HeroCarousel";

/**
 * Full-height hero for a sub-solution that has a set of machines to show
 * rather than one product shot.
 *
 * Laid out like the home page: copy in the left column, photography running
 * full-bleed off the right edge with its inner edge masked away, so the two
 * meet without a frame or a seam. The difference is that the stage rotates.
 */
export function SubSolutionShowcaseHero({
  solution,
  subSolution,
  slides,
}: {
  solution: Solution;
  subSolution: SubSolution;
  slides: HeroSlide[];
}) {
  return (
    // isolate + overflow-hidden keeps the full-bleed stage inside the hero; the
    // copy sits above it on z-10, where the stage is masked away.
    // Sized to the copy, not to the viewport. A full-height banner is right for
    // the home page, where the hero is the whole first screen and its arm
    // animates through it; here there are only four short lines to carry, and
    // the rest came out as empty column. min-h keeps it from collapsing on a
    // short laptop screen.
    <section className="relative isolate overflow-hidden border-b border-line bg-surface lg:flex lg:h-[60vh] lg:min-h-[26rem] lg:items-center">
      {/* Lattice that lights under the cursor. -z-10 puts it above the section's
          own background but beneath the copy; it tracks the pointer through
          `window`, so being underneath does not stop it reacting.
          pointer-events-none so it can never intercept a breadcrumb link. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <CursorGrid
          cellSize={70}
          color="#C0C0C0"
          radius={160}
          falloff="smooth"
          holdTime={400}
          fadeDuration={800}
          lineWidth={1.2}
          maxOpacity={1}
          fillOpacity={0}
          gridOpacity={0}
          cellRadius={0}
          clickPulse
          pulseSpeed={600}
        />
      </div>

      <Container className="relative z-10 w-full">
        <div className="py-12 lg:max-w-[52%] lg:py-0">
          <Breadcrumbs
            trail={[
              { label: "Home", href: "/" },
              { label: solution.title, href: solution.href },
              { label: subSolution.title },
            ]}
          />
          <Reveal className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              {solution.title}
            </p>
          </Reveal>
          <Reveal delay={70} className="mt-2">
            <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {subSolution.title}
            </h1>
          </Reveal>
          <Reveal delay={140} className="mt-5">
            <p className="max-w-xl text-base leading-relaxed text-muted">
              {subSolution.summary}
            </p>
          </Reveal>
        </div>
      </Container>

      <HeroCarousel slides={slides} />
    </section>
  );
}
