import Link from "next/link";
import { OfficeMap } from "@/components/careers/OfficeMap";
import { Breadcrumbs } from "@/components/solutions/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { StrokeText } from "@/components/ui/StrokeText";
import { CAREERS_HERO, OPENINGS_HREF } from "@/lib/careers";
import { OFFICE_SUMMARY } from "@/lib/officeMap";
import "./CareersCover.css";

/**
 * Careers cover: the claim, on a map of where you would be making it.
 *
 * This used to be a photograph of three people at a laptop with the headline
 * over the bottom of it — the same shape as every other cover on the site, and
 * the same shape as every careers page anywhere. What replaced it answers a
 * question the picture could not: somebody reading this wants to know where the
 * job is, and Sophic has offices in three cities across two countries. So the
 * background is a dot map of them, and it is the only place on the site that
 * says so above the fold.
 *
 * Which makes this the one cover on the site that is light. The rest are
 * photographs with white type on them; this is a drawing, and a drawing this
 * faint on a dark ground is a drawing nobody can see. The consequence is in
 * components/layout/Header — /careers is off the list of routes the bar goes
 * transparent over, because a transparent bar here would be white links on a
 * near-white page.
 *
 * The map is behind the copy rather than beside it, which only works because
 * of what is at the west end of the window: the copy column sits over open
 * water, and the map's left edge is dissolved into the page before the
 * coastline starts. Nothing legible is ever drawn at half strength.
 *
 * The lead paragraph still lives further down the page rather than here — four
 * lines of body copy under a headline is a wall whatever is behind it. The one
 * line that did earn a place is the office count under the buttons, because it
 * is what the background is a picture of, and a picture of a fact is not the
 * same as stating it.
 */
export function CareersCover() {
  return (
    // Near-white on the copy side, easing to the palest grey under the map, so
    // the dots have a ground of their own without the section reading as two
    // panels. isolate holds the stacking context the map's z-order needs.
    <section className="careers-cover relative isolate overflow-hidden border-b border-line bg-gradient-to-r from-background via-background to-surface">
      <Container>
        <div className="py-10 sm:py-14 lg:min-h-[34rem] lg:py-16">
          {/* Narrower at lg than at xl, and the wordmark shrinks with it. The
              map is anchored to the window's right edge and sized by height, so
              the less width there is the further left it reaches — at lg it is
              almost at the headline, and the copy column gives way rather than
              the background being cut back to a strip. */}
          <div className="relative z-10 lg:max-w-[30rem] xl:max-w-[34rem]">
            <Breadcrumbs
              trail={[{ label: "Home", href: "/" }, { label: "Careers" }]}
            />

            <Reveal className="mt-8">
              <div className="flex items-center gap-3">
                {/* A short rule, not a coloured word. The solution covers open
                    on a bright sky-blue eyebrow; opening on a drawn mark
                    instead is the quickest way for the two to stop looking like
                    the same template.
                    The brief's own headline lives here now that the wordmark
                    has taken the headline slot — it is too good a line to drop,
                    and above the drawn words it reads as the promise they are
                    the short form of. */}
                <span aria-hidden="true" className="h-px w-9 shrink-0 bg-brand" />
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-brand">
                  {CAREERS_HERO.title}
                </p>
              </div>
            </Reveal>

            <Reveal delay={80} className="mt-5">
              {/* The heading is the real text and the drawn wordmark is
                  decorative, not the other way round. The SVG carries the
                  phrase three times over — outlined, filled, and once more
                  inside the mask that trims the outline — so anything walking
                  it finds "Join Our Team" repeated; sr-only text is what keeps
                  the h1 clean while the picture of it does the talking. */}
              <h1 className="sr-only">
                Join our team — careers at Sophic Automation.
              </h1>
              <div aria-hidden="true" className="max-w-lg">
                {/* Teal outline, navy flood — the same pair the wordmark wore
                    over the photograph, with the fill taken off white and onto
                    the page's own ink now that there is no picture behind it to
                    stand out from. The wordmark scales to whatever width it is
                    given, so the size is set by the max-w above rather than by
                    fontSize; that only sets the resolution it is measured at. */}
                <StrokeText
                  text={CAREERS_HERO.wordmark}
                  trigger="mount"
                  fillMode="wipe"
                  strokeColor="#29a8b8"
                  fillColor="#0f172a"
                  strokeWidth={2}
                  fontSize={128}
                  fontWeight={800}
                  letterSpacing={-3}
                  drawDuration={1.5}
                  fillDelay={0.15}
                  stagger={0.045}
                />
              </div>
            </Reveal>

            <Reveal delay={160} className="mt-8">
              <div className="flex flex-wrap items-center gap-3">
                {/* The wrapper carries the glow — .btn-brand has already spent
                    its own ::before on the hover face. */}
                <span className="float-glow">
                  <Link
                    href={OPENINGS_HREF}
                    className="btn-brand group inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none"
                  >
                    View job openings
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </Link>
                </span>

                {/* Same-page jump, so a plain anchor: there is no route to
                    prefetch. Outlined rather than a second filled button, so
                    the pair reads as one primary action and one aside. */}
                <a
                  href="#why-sophic"
                  className="group inline-flex items-center gap-2 rounded-md border border-line bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors duration-200 ease-gentle hover:border-brand/40 hover:bg-brand-light"
                >
                  Why work with us
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 ease-out group-hover:translate-y-0.5"
                  >
                    ↓
                  </span>
                </a>
              </div>
            </Reveal>

            {/* What the map behind this is a drawing of, in words — so the fact
                survives a screen reader, a print stylesheet and anybody who
                simply does not look at the right-hand half of the page. */}
            <Reveal delay={220} className="mt-6">
              <p className="text-xs leading-relaxed text-muted">
                Our offices — {OFFICE_SUMMARY}.
              </p>
            </Reveal>
          </div>

          {/* Last in the DOM so it paints behind nothing and reads after
              everything. From lg the stylesheet lifts it out of the flow and
              hangs it off the section; below that it stays here, under the
              copy, which is the order it should be read in anyway. */}
          <div className="careers-cover__map mt-10 lg:mt-0">
            <OfficeMap />
          </div>
        </div>
      </Container>
    </section>
  );
}
