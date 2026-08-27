import type { Metadata } from "next";
import { SolutionCard } from "@/components/solutions/SolutionCard";
import { SolutionLineCover } from "@/components/solutions/SolutionLineCover";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { DIGITALISED_SOLUTIONS } from "@/lib/solutions";

export const metadata: Metadata = {
  title: "Digitalised Solutions",
  description:
    "Asset and material management, workforce and process digitalisation, factory intelligence and connectivity — the software layer over a working plant.",
};

/**
 * The Digitalised Solutions overview.
 *
 * Built as the mirror of the Automated Equipment page rather than as its own
 * thing, and on purpose: they are the two lines of business, they sit side by
 * side on /solutions, and a reader who has seen one should not have to learn a
 * second page to read the other. Same cover, same card grid, same order.
 *
 * Three categories where the equipment line has seven, so this one genuinely
 * does fit on a screen — but the grid is left exactly as it is over there. A
 * layout that changes shape because a list happens to be short today is a
 * layout that has to be revisited the day it is not.
 *
 * Every page under this route is a stand-in. See the note on the categories in
 * lib/solutions: the line arrived as a sitemap with no copy, and what is here
 * is scaffolding that looks like scaffolding.
 */
export default function DigitalisedSolutionsPage() {
  return (
    <>
      {/* Everything the cover says comes off DIGITALISED_SOLUTIONS, including
          the lead — unlike the equipment line, whose opening sentence predates
          its summary and is passed in. Nothing here needs to differ. */}
      <SolutionLineCover
        line={DIGITALISED_SOLUTIONS}
        eyebrow="Solutions"
        jump={{ href: "#categories", label: "Explore the software" }}
      />

      <Container>
        {/* scroll-mt clears the sticky header when jumped to from the cover. */}
        <section id="categories" className="scroll-mt-20 py-16">
          {/* Named for what the list is rather than repeating the h1 above it.
              "Solution areas" rather than the equipment page's "Equipment
              categories", because none of what is under here is equipment. */}
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Solution areas
            </h2>
          </Reveal>

          <ul className="mt-8 grid gap-5 sm:grid-cols-2">
            {DIGITALISED_SOLUTIONS.children.map((solution, index) => (
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
