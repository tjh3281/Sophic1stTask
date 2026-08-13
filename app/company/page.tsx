import type { Metadata } from "next";
import { CompanyCover } from "@/components/company/CompanyCover";
import { CompanyScene } from "@/components/company/CompanyScene";
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
        </Container>
      </section>
    </>
  );
}
