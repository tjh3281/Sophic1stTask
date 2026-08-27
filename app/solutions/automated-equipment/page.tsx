import type { Metadata } from "next";
import { SolutionCard } from "@/components/solutions/SolutionCard";
import { SolutionLineCover } from "@/components/solutions/SolutionLineCover";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { AUTOMATED_EQUIPMENT, SOLUTIONS } from "@/lib/solutions";

export const metadata: Metadata = {
  title: "Automated Equipment",
  description:
    "Vision, assembly, inspection and test, storage and material handling, robotics and custom-built equipment — engineered into your production line.",
};

/**
 * The Automated Equipment overview.
 *
 * This page opened the site until the home page took that job, and sat at
 * /solutions until Automated Equipment became one line of business among the
 * ones that will follow it. It has moved twice and changed almost none of the
 * time: it still heads the seven category routes, which now sit beneath it
 * rather than beside it, and the cards are still the cards.
 *
 * What did have to go, when the set went from four categories to seven, is the
 * assumption that it fits on one screen — see the note on the section below.
 */
export default function AutomatedEquipmentPage() {
  return (
    <>
      {/* The kicker names the section the reader is in; the heading names the
          page. Same order the category covers use — "Solution" over "Machine
          Vision" — so the two levels of this branch are introduced the same way
          wherever you enter it.

          The name and the photograph come off AUTOMATED_EQUIPMENT rather than
          being typed here, so this cover and the block that links to it on
          /solutions cannot end up showing a different picture or calling the
          line something else.

          The lead is the exception, and stated. The line's own summary has to
          serve a header menu as well, where this sentence would be too long;
          a cover has the room for the opening it was written with. */}
      <SolutionLineCover
        line={AUTOMATED_EQUIPMENT}
        eyebrow="Solutions"
        lead="Seven equipment families, one automation partner. Vision, assembly, inspection and test, storage and material handling, robotics and custom-built equipment — engineered into your production line."
        jump={{ href: "#solutions", label: "Explore equipment" }}
      />

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
