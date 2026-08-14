import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { VISION_MISSION } from "@/lib/company";
import "./CompanyDark.css";

/**
 * The vision and the mission.
 *
 * Where the dark half of the page begins. It shares its ground with the values
 * board directly below it — same navy, no border, no gap — so the two read as
 * one dark chapter after the white the page has run in until now, rather than
 * as two bands that happen to be the same colour.
 *
 * The two statements sit side by side from lg rather than stacked. Stacked,
 * they are two long paragraphs of white text on navy and the second is read as
 * a continuation of the first; side by side, the fact that there are exactly
 * two of them is the first thing you notice, which is the shape of the heading
 * over them. Each is marked with a short rule rather than a label — see the
 * note in lib/company on why they are not titled.
 *
 * A server component. There is nothing to animate here beyond the site's own
 * scroll reveal, and this section is deliberately the still one: it is what the
 * values board is read against.
 */
export function CompanyVision({ className }: { className?: string }) {
  return (
    // Where it sits on the page, and what that costs it, is the caller's
    // business — see the note on the -mb-24 in app/company/page.tsx.
    <section className={`company-dark py-20 sm:py-28${className ? ` ${className}` : ""}`}>
      <Container>
        <Reveal>
          <div className="text-center">
            {/* Set exactly as the values heading below it, because the two are
                a pair — a reader should see one hand behind both. */}
            <h2 className="company-dark__title">{VISION_MISSION.heading}</h2>
            <span
              aria-hidden="true"
              className="mx-auto mt-4 block h-px w-14 bg-[var(--mint)]"
            />
          </div>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-5xl gap-10 sm:mt-14 lg:grid-cols-2 lg:gap-14">
          {VISION_MISSION.statements.map((statement, index) => (
            <Reveal key={statement} delay={index * 90}>
              <div className="h-full">
                <span
                  aria-hidden="true"
                  className="block h-0.5 w-10 bg-[var(--mint)]"
                />
                <p className="mt-5 text-[1rem] leading-[1.75] text-white/85 sm:text-[1.0625rem]">
                  {statement}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
