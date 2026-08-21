import type { Metadata } from "next";
import { CompanyCover } from "@/components/company/CompanyCover";
import { CompanyLeaders } from "@/components/company/CompanyLeaders";
import { CompanyOffices } from "@/components/company/CompanyOffices";
import { CompanyScene } from "@/components/company/CompanyScene";
import { CompanyValues } from "@/components/company/CompanyValues";
import { CompanyVision } from "@/components/company/CompanyVision";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Company",
  description:
    "Sophic Automation Sdn Bhd was founded in 2007 with the mission of" +
    " providing the most innovative and effective Industrial Automation" +
    " Solutions to our customers.",
};

/**
 * The company background copy, verbatim from the brief. Not to be edited.
 *
 * Worth knowing: the home page's "Your Single Destination for Success" section
 * carries an earlier draft of these same two paragraphs — "cutting edge" for
 * "cutting-edge technology", "seen an extensive growth" for "witnessed
 * extensive growth", "automation solutions and engineering services" for
 * "automation projects". Both were supplied as written and neither has been
 * changed to match the other. If one of them is the current wording, the other
 * wants updating to it; they are the only two places this passage appears.
 */
const BACKGROUND = [
  "Sophic Automation Sdn Bhd was founded in 2007 with the mission of providing the most innovative and effective Industrial Automation Solutions to our customers.",
  "Combining cutting-edge technology and the adventurous spirit of our technical competency, we have witnessed extensive growth in business solutions. We offer an attractively priced and complete outsourcing mechanism, through which we develop, supply, and manage customized automation projects for our customers.",
];

/**
 * The company page.
 *
 * The cover is a placeholder until the header artwork exists — see
 * CompanyCover for what to change when it does.
 */
export default function CompanyPage() {
  return (
    <>
      <CompanyCover />

      <section className="bg-background py-16 sm:py-24">
        <Container>
          {/* The scene is the wider of the two and takes the larger share:
              it is a landscape nearly twice as wide as it is tall, and squeezed
              into half a page the buildings come out too small to read as
              buildings. Below lg the two stack and the text leads, so the
              paragraph is never below the fold on a phone. */}
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:gap-14">
            <div>
              <Reveal>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-px w-9 shrink-0 bg-brand"
                  />
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-brand">
                    Company Background
                  </p>
                </div>

                <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.15] tracking-[-0.025em] text-foreground sm:text-[2rem]">
                  Founded in 2007.
                </h2>
              </Reveal>

              <Reveal delay={70} className="mt-6 space-y-5">
                {BACKGROUND.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base leading-relaxed text-muted"
                  >
                    {paragraph}
                  </p>
                ))}
              </Reveal>
            </div>

            {/* Not wrapped in a Reveal. It has an entrance of its own and a
                trigger of its own, and fading the whole thing up first would
                spend the reveal on an empty box — the scene is invisible until
                it builds. */}
            <CompanyScene className="mx-auto w-full max-w-2xl lg:max-w-none" />
          </div>

          {/* The three offices the drawing above does not cover, photographed.
              Below the whole grid rather than inside either column: they belong
              to the paragraph and the scene together, and dropping them under
              the scene alone would put them beside the text on a wide screen,
              where a strip of photographs at a third of the page is too small
              to be worth showing. */}
          <CompanyOffices className="mt-14 sm:mt-16" />
        </Container>
      </section>

      {/* Still white, and deliberately on this side of the turn: the founders
          belong with who the company is rather than with what it believes, and
          putting them here leaves the dark chapter below as the page's close.
          It is on its own background, so it moves without consequence. */}
      <CompanyLeaders />

      {/* --- The dark half -------------------------------------------------
          Where the company page turns. Both sections below share one ground so
          the change of colour happens once, at the top of the first, and they
          read as a single chapter rather than as two bands that happen to
          match.

          The values board goes first and takes the turn with it: it opens with
          a light at the top of its stage, which is what the change from white
          reads against. The vision and mission then close the page still, after
          the one section that asked the reader to work for it. */}
      <CompanyValues />
      {/* -mb-24 cancels the footer's own top margin. That margin is right
          everywhere else — it is the air between a white page and a near-white
          footer — but under a dark band it opens a strip of bare page between
          two grounds, which reads as a seam rather than as space. It belongs to
          whichever section ends up last here, not to the section itself. */}
      <CompanyVision className="-mb-24" />
    </>
  );
}
