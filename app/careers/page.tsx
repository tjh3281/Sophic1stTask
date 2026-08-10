import type { Metadata } from "next";
import Link from "next/link";
import { CareersCover } from "@/components/careers/CareersCover";
import { CulturePillars } from "@/components/careers/CulturePillars";
import { ForkliftLift } from "@/components/careers/ForkliftLift";
import { PillarCube } from "@/components/careers/PillarCube";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { CAREERS_HERO, OPENINGS_HREF } from "@/lib/careers";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Talent as catalyst for digital innovation — what it is like to work at" +
    " Sophic Automation, and the roles we are hiring for.",
};

/**
 * The careers page.
 *
 * Four movements: the claim (cover), the argument behind it, six of the things
 * that make it true on the sides of a cube you turn by scrolling, and then all
 * of them as prose if the cube interested you. The job openings button appears
 * twice — in
 * the cover and again at the foot — because those are the two moments somebody
 * decides to act, and the page is long enough that only having it at the top
 * would mean scrolling back.
 *
 * Headings across the page run bolder and tighter than the solution pages set
 * theirs, and every section opens on the same drawn rule the cover does. That
 * is the whole difference between a section of a site and a page that looks
 * like the template it was stamped from.
 */
export default function CareersPage() {
  return (
    <>
      <CareersCover />

      {/* --- The argument ------------------------------------------------- */}
      <section className="border-b border-line bg-background py-16 sm:py-24">
        <Container>
          {/* The heading is a load on a forklift, so it belongs inside the
              machine rather than beside it — ForkliftLift owns the column and
              the words are handed to it.

              22rem, not the 19rem this started at: the truck stands at the
              right of the column and reaches a little way into the gutter, and
              the heading needs to keep clear of the mast.

              No min-height. Forcing one bought a longer pin and paid for it in
              dead page — the paragraphs set their own height, and on a wide
              screen they wrap short enough that a floor of 34rem left a screen
              of blank under the whole section. */}
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
            <ForkliftLift>
              <Reveal>
                <Eyebrow>Why we invest in people</Eyebrow>
                {/* Capped well short of the column so the last few characters
                    of a line never end up under the mast. */}
                <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.15] tracking-[-0.025em] text-foreground sm:text-[2rem] lg:max-w-[15rem]">
                  Employees are the driving force.
                </h2>
              </Reveal>
            </ForkliftLift>

            <div className="relative">
              {/* The hero's opening paragraph, moved off the photograph and set
                  as the largest type in the section — it is still the first
                  thing said, just no longer said over somebody's face. */}
              <Reveal>
                <p className="text-lg leading-relaxed text-foreground sm:text-xl sm:leading-relaxed">
                  {CAREERS_HERO.lead}
                </p>
              </Reveal>
              <Reveal delay={70} className="mt-6">
                <p className="text-base leading-relaxed text-muted">
                  {CAREERS_HERO.body[0]}
                </p>
              </Reveal>
              <Reveal delay={140} className="mt-6">
                {/* The rule marks this out as the line the section lands on
                    without setting it as a pull quote, which would promise
                    somebody said it out loud. */}
                <p className="border-l-2 border-brand pl-5 text-base leading-relaxed text-foreground">
                  {CAREERS_HERO.body[1]}
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* --- Six, at a glance -----------------------------------------------
          On the faces of a cube that turns with the scroll. It carries its own
          heading, because the heading has to sit inside the sticky frame — a
          heading left outside would scroll away and leave the cube turning
          under nothing. */}
      <PillarCube />

      {/* --- All of them, in full ------------------------------------------- */}
      <section className="border-y border-line bg-background py-16 sm:py-24">
        <Container>
          <Reveal>
            <Eyebrow>In our own words</Eyebrow>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.15] tracking-[-0.025em] text-foreground sm:text-[2.25rem]">
              Culture, values, environment.
            </h2>
          </Reveal>
          <Reveal delay={70} className="mt-4">
            <p className="max-w-2xl text-base leading-relaxed text-muted">
              Pick a heading.
            </p>
          </Reveal>

          <CulturePillars />
        </Container>
      </section>

      {/* --- Openings ------------------------------------------------------- */}
      <section className="bg-surface py-16 sm:py-24">
        <Container>
          <Reveal variant="settle">
            {/* Dark panel rather than another white section: this is the one
                thing on the page that is an action, and after four light
                sections the reader's eye goes straight to it. */}
            <div className="relative isolate overflow-hidden rounded-2xl bg-slate-950 px-6 py-12 sm:px-12 sm:py-16">
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-dark via-slate-950 to-slate-950"
              />
              {/* A single soft light in the corner, so the panel is lit rather
                  than flat. */}
              <div
                aria-hidden="true"
                className="absolute -right-24 -top-24 -z-10 h-64 w-64 rounded-full bg-accent/25 blur-3xl"
              />

              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="h-px w-9 shrink-0 bg-accent"
                    />
                    <p className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-white/75">
                      Job openings
                    </p>
                  </div>
                  {/* No count. The list behind this button is placeholder
                      content, and "6 roles open" is the one claim on the page a
                      reader could act on before they reach the notice that says
                      the roles are samples. */}
                  <h2 className="mt-5 text-[1.75rem] font-bold leading-[1.15] tracking-[-0.025em] text-white sm:text-[2rem]">
                    Roles across engineering, software and field service.
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-white/75">
                    Penang, Selangor and Singapore. If none of them is quite
                    you, the culture above is still the job — tell us what you
                    do and we will find where it fits.
                  </p>
                </div>

                <div className="shrink-0">
                  <span className="float-glow">
                    <Link
                      href={OPENINGS_HREF}
                      className="btn-brand group inline-flex items-center gap-2 rounded-md px-6 py-3.5 text-sm font-semibold text-white transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none"
                    >
                      See all job openings
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

/**
 * Section label: the same drawn rule and wide-tracked caps the cover opens on.
 *
 * The solution pages label their sections with a short bright-blue word. Using
 * that here would have been the single thing most likely to make this page read
 * as the same template — so this is deliberately the other move, quiet type
 * with a mark beside it rather than loud type on its own.
 */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className="h-px w-9 shrink-0 bg-brand" />
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-brand">
        {children}
      </p>
    </div>
  );
}
