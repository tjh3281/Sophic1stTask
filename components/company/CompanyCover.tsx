import Image from "next/image";
import { Breadcrumbs } from "@/components/solutions/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Company cover.
 *
 * Built like the careers cover — full-bleed photograph running up behind the
 * transparent header, breadcrumbs at the top, copy pinned to the foot, and a
 * scrim that is dark at both ends and clears out of the middle. Same idea, for
 * the same reason: the picture is the argument, so it is given height and
 * asked to carry only a line of type.
 *
 * Where it deliberately differs from careers is how much of the frame the copy
 * takes. That one lands a drawn wordmark and two buttons at the foot, filling
 * something like the bottom third. This page has no call to action to make —
 * it is the company telling you who it is — and the foot of this frame is
 * already carrying the company name in the photograph itself. So it takes an
 * eyebrow and the page title and nothing else.
 *
 * The crop is the other half of that. See COVER below.
 */

/**
 * The photograph, and how it is framed.
 *
 * The subject is the signage in the left third — the logo cut out of the wall,
 * with the company name under it — and a plant filling the right. Everything
 * here is about keeping the sign whole.
 *
 *   - Horizontal. The frame is 2.58 wide, so below about 1300px the band is
 *     proportionally taller than the picture and object-cover starts eating it
 *     from both ends: a phone sees a little over half its width. Centred, that
 *     half is the blank wall between the sign and the plant and nothing else.
 *     Holding the crop at 15% keeps the sign in frame the whole way down and
 *     spends the loss on the plant, which is texture rather than subject.
 *
 *   - Vertical. Above that width the crop turns the other way and the
 *     horizontal offset stops mattering. Centred leaves the sign whole and
 *     trims the company name along the bottom edge, which is the right thing
 *     to lose: it is the one part of the photograph the copy sits on top of,
 *     and two sets of lettering in the same corner read as one.
 *
 *   - Height. The taller the band, the *less* of the width survives, because
 *     the scale is set by whichever axis has to fill. That is why this is
 *     shorter than the careers cover at the small end. It grows again past
 *     1536, where the band is finally wide enough that height buys picture back
 *     rather than costing it.
 */
const COVER = {
  src: "/images/testimonial-sophic-automation.webp",
  objectPosition: "15% center",
};

export function CompanyCover() {
  return (
    // -mt-16 pt-16 cancels the layout's header clearance so the photo runs
    // behind the transparent header, then restores the spacing inside.
    <section className="relative isolate -mt-16 flex min-h-[18rem] flex-col overflow-hidden bg-slate-950 pt-16 sm:min-h-[24rem] lg:min-h-[32rem] 2xl:min-h-[36rem]">
      <Image
        src={COVER.src}
        alt="Sophic Automation's sign at the entrance to its office."
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: COVER.objectPosition }}
      />

      {/* Top and bottom only, and close to nothing across the band the logo
          sits in. The top end has to hold white nav links across the full
          width, not just the corner the breadcrumbs sit in — the header is
          transparent over this and its own links have no background of their
          own. The bottom end is heavier than the top because what is under it
          is a white wall carrying black lettering. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/8 via-38% to-slate-950/90"
      />
      {/* Anchors the title without flattening the whole frame. Kept light and
          stopped just past halfway: the sign is on this side too, and taking
          the left down far enough to be certain of the type would take the
          thing the picture is of with it. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-slate-950/45 to-transparent to-55%"
      />

      <Container className="relative flex flex-1 flex-col">
        <div className="pt-6 sm:pt-8">
          <Breadcrumbs
            tone="dark"
            trail={[{ label: "Home", href: "/" }, { label: "Company" }]}
          />
        </div>

        {/* mt-auto is what pins this to the foot; the photograph takes whatever
            height is left above it. Deliberately two lines deep — see the note
            at the top about what sits across the row of people. */}
        <div className="mt-auto max-w-3xl pb-9 pt-10 sm:pb-11">
          <Reveal>
            <div className="flex items-center gap-3">
              {/* A drawn rule rather than a coloured word, the same mark the
                  careers cover opens on. */}
              <span aria-hidden="true" className="h-px w-9 shrink-0 bg-accent" />
              <p className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-white/80">
                About us
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-4 text-[2rem] font-bold leading-[1.12] tracking-[-0.03em] text-white sm:text-[2.75rem]">
              Company
            </h1>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
