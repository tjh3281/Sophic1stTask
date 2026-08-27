import type { Metadata } from "next";
import { SolutionCard } from "@/components/solutions/SolutionCard";
import { SolutionLineCover } from "@/components/solutions/SolutionLineCover";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ENGINEERING_SUPPORT_SERVICES } from "@/lib/solutions";

export const metadata: Metadata = {
  title: "Engineering Support Services",
  description:
    "Engineering support for IC assembly and test, working alongside a customer's own team on the equipment already running.",
};

/**
 * The Engineering Support Services overview.
 *
 * The smallest line on the site — one category, one service under it — and
 * still the same page as the other three. See the note on the services lines in
 * lib/solutions for why the shape is kept rather than collapsed: the sitemap
 * says this line has a category in it, and a reader who has learned how a line
 * page works should not find the rule broken on the short one.
 *
 * Every page under this route is a stand-in; the line arrived as a sitemap.
 */
export default function EngineeringSupportServicesPage() {
  return (
    <>
      <SolutionLineCover
        line={ENGINEERING_SUPPORT_SERVICES}
        eyebrow="Solutions"
        jump={{ href: "#categories", label: "Explore the services" }}
      />

      <Container>
        {/* scroll-mt clears the sticky header when jumped to from the cover. */}
        <section id="categories" className="scroll-mt-20 py-16">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Service areas
            </h2>
          </Reveal>

          <ul className="mt-8 grid gap-5 sm:grid-cols-2">
            {ENGINEERING_SUPPORT_SERVICES.children.map((solution, index) => (
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
