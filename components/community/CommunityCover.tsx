import { Breadcrumbs } from "@/components/solutions/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { COMMUNITY_HERO } from "@/lib/community";

/**
 * Community cover.
 *
 * The same frame as the company, careers and partners covers — full bleed,
 * running up behind the transparent header, breadcrumbs at the top, copy pinned
 * to the foot. What fills it is a band cut out of the same illustration the
 * page below floats in, softened until the drawn ribbons in it read as light
 * rather than as shapes.
 *
 * The crop is not the top of the file. The top of it is empty sky, which is
 * right behind a globe and dead behind a headline; the band about
 * three-quarters of the way down is where the galaxy's arms cross, and that is
 * the part that has any light in it. See .community-cover__wash.
 *
 * It belongs to this section rather than to the window, which is the whole
 * point: it scrolls up with the words it sits behind. The page's own sky is
 * fixed — the globe sequence below needs a backdrop that holds still while the
 * camera flies at it — so the two would part company at this section's bottom
 * edge and show a line travelling up the screen. They do not, because this
 * layer dissolves into the sky before it gets there rather than stopping on an
 * edge. See the mask on .community-cover__light.
 *
 * (Until recently this ran React Bits' Grainient at its shipped settings — a
 * green-to-violet WebGL gradient. components/ui/Grainient is left in the tree
 * and is now unused.)
 *
 * The type is held by a shadow on the type itself as well as by the shade
 * layer, because the light in the band moves under it.
 *
 * It is short — the same three heights as the job openings cover rather than
 * the taller company and careers ones. What is below the fold here is a
 * screen-height animation that needs to be met at its top edge, and a full
 * screen above it would push the reader into the middle of the globe sequence
 * on their first scroll.
 *
 * One sentence, not two. A lead under the headline was describing in the
 * vaguest possible terms what the page below then shows; the page shows it
 * better. See the note on COMMUNITY_HERO.description.
 */
export function CommunityCover() {
  return (
    // -mt-16 pt-16 cancels the layout's header clearance so the section runs up
    // behind the transparent header, then restores the spacing inside.
    <section className="community-cover relative isolate -mt-16 flex min-h-[17rem] flex-col overflow-hidden pt-16 sm:min-h-[20rem] lg:min-h-[23rem]">
      <div aria-hidden="true" className="community-cover__light">
        {/* The crop, blurred. */}
        <div className="community-cover__wash" />
        {/* The light moving over it. */}
        <div className="community-cover__glow" />
        {/* And the shadow the light is read against. */}
        <div className="community-cover__shade" />
      </div>

      <Container className="relative flex flex-1 flex-col">
        <div className="community-cover__type pt-6 sm:pt-8">
          <Breadcrumbs
            tone="dark"
            trail={[{ label: "Home", href: "/" }, { label: "Community" }]}
          />
        </div>

        {/* mt-auto pins this to the foot; the field takes whatever height is
            left above it. */}
        <div className="community-cover__type mt-auto max-w-2xl pb-10 pt-12 sm:pb-12">
          <Reveal>
            <div className="flex items-center gap-3">
              {/* The drawn rule the company, careers and partners covers all
                  open on. */}
              <span aria-hidden="true" className="h-px w-9 shrink-0 bg-accent" />
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-white/80">
                {COMMUNITY_HERO.eyebrow}
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-4 text-[2rem] font-bold leading-[1.12] tracking-[-0.03em] text-white sm:text-[2.75rem]">
              {COMMUNITY_HERO.headline}
            </h1>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
