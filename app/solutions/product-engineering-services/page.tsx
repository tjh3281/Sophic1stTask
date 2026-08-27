import type { Metadata } from "next";
import { SolutionCard } from "@/components/solutions/SolutionCard";
import { SolutionLineCover } from "@/components/solutions/SolutionLineCover";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { PRODUCT_ENGINEERING_SERVICES } from "@/lib/solutions";

export const metadata: Metadata = {
  title: "Product Engineering Services",
  description:
    "Post-silicon validation, software engineering and new product introduction — the engineering between a design that works and a product that ships.",
};

/**
 * The Product Engineering Services overview.
 *
 * The same page as the other three lines, on purpose — cover, heading, card
 * grid, in that order. See the note on the Digitalised Solutions page: the
 * lines sit side by side on /solutions and a reader who has read one should not
 * have to learn a second layout to read the next.
 *
 * One category under it today, so the grid draws a single card in a two-column
 * row. That is left alone rather than special-cased. A layout that rearranges
 * itself around how short a list happens to be is a layout that has to be
 * revisited the day it grows, and the card is the same card at either width.
 *
 * Every page under this route is a stand-in; the line arrived as a sitemap.
 */
export default function ProductEngineeringServicesPage() {
  return (
    <>
      <SolutionLineCover
        line={PRODUCT_ENGINEERING_SERVICES}
        eyebrow="Solutions"
        jump={{ href: "#categories", label: "Explore the services" }}
      />

      <Container>
        {/* scroll-mt clears the sticky header when jumped to from the cover. */}
        <section id="categories" className="scroll-mt-20 py-16">
          {/* "Service areas" rather than the equipment line's "Equipment
              categories" — nothing under here is equipment. */}
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Service areas
            </h2>
          </Reveal>

          <ul className="mt-8 grid gap-5 sm:grid-cols-2">
            {PRODUCT_ENGINEERING_SERVICES.children.map((solution, index) => (
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
