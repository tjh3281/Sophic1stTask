import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/solutions/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { StrokeText } from "@/components/ui/StrokeText";
import { CAREERS_COVER, CAREERS_HERO, OPENINGS_HREF } from "@/lib/careers";

/**
 * Careers cover.
 *
 * Deliberately not built like SolutionCover, which is a dark panel that happens
 * to have a photograph behind it: four frosted benefit cards sit on that image,
 * so it gets a scrim heavy enough to hold them and the picture survives as
 * texture. Here the picture is the argument — it is what the page is selling —
 * so it is given height, kept legible, and asked to carry only a line of type.
 *
 * Three things do that work:
 *
 *   - Height. A fixed minimum rather than however tall the copy happens to be,
 *     so the frame is a photograph with words on it rather than a headline with
 *     a background. Sized to land inside a laptop viewport with the section
 *     below it starting to show — tall enough to be a picture, short enough
 *     that the page does not open on a full screen of one.
 *   - A scrim that clears the middle. Dark at the top for the breadcrumbs and
 *     the header above them, dark at the bottom for the copy, and close to
 *     nothing across the band where the faces are.
 *   - Copy pushed to the foot, so everything above it is picture.
 *
 * The lead paragraph deliberately lives further down the page and not here. It
 * is four lines, and four lines of body copy is the difference between a
 * photograph and a wall with a photo on it.
 */
export function CareersCover() {
  return (
    // -mt-16 pt-16 cancels the layout's header clearance so the photo runs
    // behind the transparent header, then restores the spacing inside.
    <section className="relative isolate -mt-16 flex min-h-[25rem] flex-col overflow-hidden bg-slate-950 pt-16 sm:min-h-[29rem] lg:min-h-[33rem]">
      <Image
        src={CAREERS_COVER}
        alt=""
        fill
        priority
        sizes="100vw"
        // Held slightly right of centre: the subjects sit right of the frame,
        // and centring the crop puts them behind the copy column at narrow
        // widths where the picture is cropped hardest.
        className="object-cover object-[70%_center]"
      />

      {/* Top and bottom only. No flat tint over the whole frame — that is what
          the solution covers use to hold their cards, and it is exactly what
          would flatten this photograph back into a background. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/5 via-40% to-slate-950/85"
      />
      {/* Anchors the copy column without touching the right half of the frame,
          where the picture is. Stops at halfway on purpose. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-slate-950/55 to-transparent to-55%"
      />

      <Container className="relative flex flex-1 flex-col">
        <div className="pt-6 sm:pt-8">
          <Breadcrumbs
            tone="dark"
            trail={[{ label: "Home", href: "/" }, { label: "Careers" }]}
          />
        </div>

        {/* mt-auto is what pins the block to the foot; the picture takes
            whatever height is left above it. */}
        <div className="mt-auto max-w-3xl pb-10 pt-12 sm:pb-12 lg:pb-14">
          <Reveal>
            <div className="flex items-center gap-3">
              {/* A short rule, not a coloured word. The solution covers open on
                  a bright sky-blue eyebrow; opening on a drawn mark instead is
                  the quickest way for the two to stop looking like the same
                  template with the photo swapped.
                  The brief's own headline lives here now that the board has
                  taken the headline slot — it is too good a line to drop, and
                  as a label above three cycling words it reads as the promise
                  they are variations on. */}
              <span
                aria-hidden="true"
                className="h-px w-9 shrink-0 bg-accent"
              />
              <p className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-white/80">
                {CAREERS_HERO.title}
              </p>
            </div>
          </Reveal>

          <Reveal delay={80} className="mt-5">
            {/* The heading is the real text and the drawn wordmark is
                decorative, not the other way round. The SVG carries the phrase
                twice — once outlined, once filled — so anything walking it
                finds "Join Our TeamJoin Our Team"; sr-only text is what keeps
                the h1 clean while the picture of it does the talking. */}
            <h1 className="sr-only">
              Join our team — careers at Sophic Automation.
            </h1>
            <div aria-hidden="true" className="max-w-xl">
              {/* Outlines in the accent teal and floods white behind it, so the
                  draw is visible against the photograph before the fill lands.
                  The wordmark scales to whatever width it is given, so the size
                  is set by the max-w above rather than by fontSize — that only
                  sets the resolution it is measured at. */}
              <StrokeText
                text={CAREERS_HERO.wordmark}
                trigger="mount"
                fillMode="wipe"
                strokeColor="#29a8b8"
                fillColor="#ffffff"
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

          <Reveal delay={160} className="mt-7">
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
                  prefetch. Glass rather than a second filled button, so the
                  pair reads as one primary action and one aside. */}
              <a
                href="#why-sophic"
                className="group inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-[6px] transition-colors duration-200 ease-gentle hover:border-white/50 hover:bg-white/15"
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
        </div>
      </Container>
    </section>
  );
}
