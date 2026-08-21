import { Container } from "@/components/ui/Container";
import { Particles } from "@/components/ui/Particles";
import { Reveal } from "@/components/ui/Reveal";
import { PARTNER_WITH_SOPHIC } from "@/lib/partners";
import { PartnerPillarsBoard } from "./PartnerPillarsBoard";
import "./PartnerPillars.css";

/**
 * "Partner with Sophic" — the statement, and the five pillars it names.
 *
 * One ground for the whole thing: the field runs behind the prose as well as
 * behind the garland, and every word sits on top of it. An earlier pass split
 * this into a white band and a dark one, which made the statement and the
 * diagram look like two sections that happened to be adjacent. They are not —
 * the second paragraph names all five pillars in order, in a sentence, and the
 * row underneath is that sentence taken apart. Sharing the ground is what says
 * so.
 *
 * The pillars hang on a curve rather than sitting in a row of five equal boxes.
 * A row would say these are five separate services you pick from. The garland
 * says they are one thing with five points on it, which is again what the
 * paragraph above it says in words.
 *
 * How the curve and the discs are kept in register is in PartnerPillars.css.
 */

/**
 * Where each pillar hangs, as a percentage of the stage.
 *
 * Symmetric about the middle and deepest at the centre, the way a hung line
 * actually falls. Read by the CSS at lg and above, and by CURVE below — change
 * a pair here and the path has to be regenerated to match, so the two are kept
 * next to each other.
 */
const POINTS: Array<[number, number]> = [
  [10, 22],
  [30, 45],
  [50, 57],
  [70, 45],
  [90, 22],
];

/**
 * The line the pillars hang from.
 *
 * A Catmull-Rom spline through POINTS, converted to cubic Béziers and extended
 * to (0,2) and (100,2) so it runs off both edges of the frame rather than
 * stopping at the outer discs. Drawn in a 0–100 box on both axes with
 * preserveAspectRatio="none", so it stretches to the stage exactly as the
 * percentage-positioned discs do; non-scaling-stroke is what keeps the line an
 * even weight despite that stretch.
 */
const CURVE =
  "M0,2 C3.33,8.67 5,14.83 10,22 C15,29.17 23.33,39.17 30,45" +
  " C36.67,50.83 43.33,57 50,57 C56.67,57 63.33,50.83 70,45" +
  " C76.67,39.17 85,29.17 90,22 C95,14.83 96.67,8.67 100,2";

export function PartnerPillars() {
  return (
    <section className="partner-pillars relative isolate overflow-hidden bg-slate-950 pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24">
      {/* Behind everything, prose included. Slower and sparser than the
          component's defaults: this runs under words somebody is reading, not
          under a hero. */}
      <div aria-hidden="true" className="absolute inset-0">
        <Particles
          particleCount={260}
          particleColors={["#ffffff", "#8ed4ee", "#45e0bd"]}
          particleSpread={13}
          speed={0.06}
          particleBaseSize={70}
          sizeRandomness={1.1}
          alphaParticles
          moveParticlesOnHover
          particleHoverFactor={0.35}
        />
      </div>

      {/* The cover above this one is also a dark band with a field of its own,
          and two fields meeting at a hard edge read as a seam rather than as
          sky. This fades the top of this one into flat ground so the join is
          the one place on the page with no stars in it. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-slate-950 to-transparent"
      />

      <Container className="relative">
        {/* The statement is posted on a billboard standing on open ground, and
            the four nested elements are all doing work — see the long note in
            PartnerPillars.css, which owns the geometry. In short: __statement
            is the measuring stick every size below is a fraction of, __scene
            holds the picture, __copy is the poster area at the width where the
            whole statement fits on it, and __head is the part that stays on the
            board at every width, because a billboard with nothing written on it
            reads as a mistake rather than as scenery. */}
        <Reveal>
          <div className="partner-pillars__statement">
            <div className="partner-pillars__scene">
              <div className="partner-pillars__copy">
                <div className="partner-pillars__head">
                  <h2 className="partner-pillars__statement-title">
                    {PARTNER_WITH_SOPHIC.heading}
                  </h2>
                  <span
                    aria-hidden="true"
                    className="partner-pillars__statement-rule"
                  />
                </div>

                <div className="partner-pillars__lead">
                  {PARTNER_WITH_SOPHIC.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="partner-pillars__statement-text"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-14 sm:mt-16 lg:mt-20">
          <PartnerPillarsBoard points={POINTS} curve={CURVE} />
        </div>
      </Container>
    </section>
  );
}
