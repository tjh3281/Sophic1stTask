import type { Metadata } from "next";
import { LogoMarquee } from "@/components/home/LogoMarquee";
import { SolutionLineBlock } from "@/components/solutions/SolutionLineBlock";
import { SolutionsHero } from "@/components/solutions/SolutionsHero";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SOLUTION_LINES } from "@/lib/solutions";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "How Sophic's work is grouped — four lines of business: Digitalised Solutions, Automated Equipment, Product Engineering Services and Engineering Support Services.",
};

/**
 * The /solutions landing page.
 *
 * Where the Solution item in the header lands, so it is the front door to the
 * whole tree rather than a redirect with a card on it. It names the lines of
 * business underneath Solutions and hands the reader a button into each.
 *
 * Built from SOLUTION_LINES rather than from the blocks it happens to draw
 * today, which is what took this page from one line to four without an edit to
 * the markup — including the numbering, which is each line's position in that
 * array. The same array feeds the header menu and the mobile drawer, so none of
 * the three can disagree about what is down here.
 *
 * The hero is the site's scroll-driven assembly cell and belongs to this page
 * alone — the line pages below open on their own photographs instead. See
 * SolutionsHero.
 */
export default function SolutionsPage() {
  return (
    <>
      <SolutionsHero
        eyebrow="Sophic Automation"
        title="Solutions"
        lead="Where Sophic's work is grouped — the software that runs a plant, the equipment that runs on the floor, and the engineers behind both. Each line opens onto everything inside it."
        jump={{ href: "#lines", label: "Explore the lines" }}
      />

      {/* The customer strip, moved up here from the Automated Equipment page.
          It belongs to whichever page is the front door of this section, and
          that is now this one — it answers "who trusts them" at the point a
          reader is deciding whether to go further in, which is here rather
          than one level down after they already have. */}
      <LogoMarquee />

      <Container>
        {/* scroll-mt clears the sticky header when jumped to from the hero. */}
        <section id="lines" className="scroll-mt-20 py-16">
          {/* Not "Solutions" again — that is the h1 at the top of this same
              page, and a heading that repeats the title verbatim tells a reader
              nothing about what changed between them. This one names what the
              list below actually is. */}
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Lines of business
            </h2>
          </Reveal>

          {/* One block per row, however many lines there are.

              This briefly switched to two columns once a second line existed,
              which was right while a block was a heading and a paragraph and
              wrong the moment it gained a photograph: the block is a horizontal
              composition — picture beside copy — and half a container does not
              hold one. At lg the split left the photo its 26rem and the words
              about fifty pixels. Stacked, every block gets the full width the
              composition was drawn for, and a third line simply makes the list
              longer rather than making the blocks unreadable. */}
          <ul className="mt-8 grid gap-5">
            {SOLUTION_LINES.map((line, index) => (
              <li key={line.slug}>
                <Reveal delay={index * 60} className="h-full">
                  <SolutionLineBlock line={line} index={index} />
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </>
  );
}
