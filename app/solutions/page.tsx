import type { Metadata } from "next";
import { HeroScene } from "@/components/home/HeroScene";
import { LogoMarquee } from "@/components/home/LogoMarquee";
import { SolutionCard } from "@/components/solutions/SolutionCard";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SOLUTIONS } from "@/lib/solutions";

export const metadata: Metadata = {
  title: "Automated Equipment",
  description:
    "Vision, assembly, inspection and test, storage and material handling, robotics and custom-built equipment — engineered into your production line.",
};

/**
 * The Automated Equipment overview.
 *
 * This page opened the site until the home page took that job; it moved here
 * rather than changing, so it sits at the head of the category routes under
 * /solutions and gives the header's Solution menu a parent to belong to.
 *
 * It was four categories and is now seven, which is the whole of the change
 * here: the route is still /solutions and the cards are still the cards. What
 * did have to go is the assumption that the set fits on one screen — see the
 * note on the section below.
 */
export default function SolutionsPage() {
  return (
    <>
      {/* Scroll runway. From lg the frame inside pins to the top while this
          scrolls past, so the scene sits still and only the arm moves. Below lg
          it collapses to an ordinary stacked hero. */}
      <section className="relative lg:h-[165vh]">
        {/* isolate + overflow-hidden keeps the full-bleed stage inside the hero;
            the copy sits above it on z-10 where the stage is masked away. */}
        <div className="relative isolate overflow-hidden border-b border-line bg-surface lg:sticky lg:top-16 lg:flex lg:h-[calc(100vh-4rem)] lg:items-center">
          <Container className="relative z-10 w-full">
            <div className="py-16 lg:max-w-[52%] lg:py-0">
            <div>
              {/* Staggered entrance — 70ms apart so the group still lands fast. */}
              {/* The kicker names the section the reader is in; the heading
                  names the page. Same order the category covers use — "Solution"
                  over "Machine Vision" — so the two levels of this branch are
                  introduced the same way wherever you enter it. */}
              <Reveal>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                  Solutions
                </p>
              </Reveal>
              <Reveal delay={70} className="mt-3">
                {/* Two words, so the break is left to wrapping — there are only
                    two outcomes and both are fine, where the sentence this
                    replaced could land on two lines or three depending on a
                    handful of pixels and had to be broken by hand.

                    One step up from the sentence it replaced at every width,
                    and no more: it has to be the largest thing on the page,
                    which two words at this weight manage without being loud.
                    The lg step-down is gone with the sentence — that existed
                    because a long headline had to fit a 52% column, and this
                    one fits it on two comfortable lines. */}
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl xl:text-6xl">
                  Automated Equipment
                </h1>
              </Reveal>
              <Reveal delay={140} className="mt-5">
                <p className="max-w-xl text-base leading-relaxed text-muted">
                  Seven equipment families, one automation partner. Vision,
                  assembly, inspection and test, storage and material handling,
                  robotics and custom-built equipment — engineered into your
                  production line.
                </p>
              </Reveal>
              <Reveal delay={210} className="mt-8">
                {/* The wrapper carries the glow. It cannot hang off the button
                    itself: .btn-brand already spends its ::before on the hover
                    face, and a second layer underneath would be revealed
                    through the button the moment that face faded. */}
                <span className="float-glow">
                  {/* Same-page jump, so a plain anchor rather than next/link —
                      there is no route to prefetch or transition to. */}
                  <a
                    href="#solutions"
                    className="btn-brand group inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium text-white transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none"
                  >
                    Explore equipment
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 ease-out group-hover:translate-y-0.5"
                    >
                      ↓
                    </span>
                  </a>
                </span>
              </Reveal>
            </div>
          </div>
          </Container>

          <HeroScene />
        </div>
      </section>

      <LogoMarquee />

      <Container>
        {/* scroll-mt clears the sticky header when jumped to from the hero.

            This used to be sized to one screen and centred in it, so the jump
            from the hero landed on the whole set at once with nothing cut off
            at the fold. Four cards could do that; seven cannot — holding the
            section to one screen now either shrinks the cards past reading or,
            since they have a minimum, centres a set that overflows and hides
            the last row behind the fold instead of below it. So the set scrolls
            like ordinary content at every width, which is what it already did
            below lg.

            Two columns, not three, and that is the cards' doing rather than a
            preference: each one lists its equipment in a monospaced column, the
            longest name in the catalogue runs past forty characters, and a third
            column takes the width those names need to sit on one line each.
            The longest is "AMHS (Automated Material Handling System)", at 41.
        */}
        <section id="solutions" className="scroll-mt-20 py-16">
          {/* Not "Automated Equipment" again. That is the h1 at the top of this
              same page now, and a heading that repeats the title verbatim tells
              a reader nothing about what changed between them — this one names
              what the list below actually is. */}
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Equipment categories
            </h2>
          </Reveal>

          <ul className="mt-8 grid gap-5 sm:grid-cols-2">
            {SOLUTIONS.map((solution, index) => (
              <li key={solution.slug}>
                <Reveal delay={index * 60} className="h-full">
                  <SolutionCard solution={solution} />
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </>
  );
}
