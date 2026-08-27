import { HeroScene } from "@/components/home/HeroScene";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The hero at the top of the Solutions tree: copy on the left, the assembly
 * cell on the right, and the arm swinging onto the chip as the reader scrolls.
 *
 * /solutions only. Automated Equipment ran this too for a while and now opens
 * on its own photograph instead — see SolutionLineCover — which leaves this as
 * the site's one piece of theatre, at the front door of the section, met once
 * on the way in rather than twice.
 *
 * Kept as a component rather than folded back into the page it serves, because
 * of the contract below: the nesting is the kind of thing that looks like
 * ordinary markup and breaks silently when somebody tidies it.
 *
 * The structure is load-bearing and not merely nesting. HeroScene measures its
 * runway by walking up two parents — the pinned frame, then the section — and
 * takes the difference in height as the distance it has to play the descent
 * over. So the section keeps its lg:h-[165vh], the pinned child keeps its
 * viewport height, and HeroScene stays a direct child of that pinned element.
 * Wrap it in anything and the arm docks against the wrong runway.
 *
 * Below lg the whole thing collapses: no runway, no pinning, and the stage
 * becomes an ordinary panel under the copy. HeroScene falls back to its own
 * height for the descent there.
 */
export function SolutionsHero({
  eyebrow,
  title,
  lead,
  jump,
}: {
  /** Names the section the reader is in, above the heading that names the page. */
  eyebrow: string;
  title: string;
  lead: string;
  /**
   * The button under the copy.
   *
   * A same-page jump on both pages that use this, so `href` is an anchor and
   * the control is a plain `<a>` rather than next/link — there is no route to
   * prefetch or transition to, and the arrow points down because the thing it
   * goes to is further down this page.
   */
  jump: { href: string; label: string };
}) {
  return (
    /* Scroll runway. From lg the frame inside pins to the top while this
       scrolls past, so the scene sits still and only the arm moves. */
    <section className="relative lg:h-[165vh]">
      {/* isolate + overflow-hidden keeps the full-bleed stage inside the hero;
          the copy sits above it on z-10 where the stage is masked away. */}
      <div className="relative isolate overflow-hidden border-b border-line bg-surface lg:sticky lg:top-16 lg:flex lg:h-[calc(100vh-4rem)] lg:items-center">
        <Container className="relative z-10 w-full">
          <div className="py-16 lg:max-w-[52%] lg:py-0">
            {/* Staggered entrance — 70ms apart so the group still lands fast. */}
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                {eyebrow}
              </p>
            </Reveal>
            <Reveal delay={70} className="mt-3">
              {/* The largest thing on the page, and sized so a short title
                  manages that without being loud. Breaks are left to wrapping:
                  every title that reaches this slot is one or two words and
                  fits the 52% column on two comfortable lines at worst. */}
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl xl:text-6xl">
                {title}
              </h1>
            </Reveal>
            <Reveal delay={140} className="mt-5">
              <p className="max-w-xl text-base leading-relaxed text-muted">
                {lead}
              </p>
            </Reveal>
            <Reveal delay={210} className="mt-8">
              {/* The wrapper carries the glow. It cannot hang off the button
                  itself: .btn-brand already spends its ::before on the hover
                  face, and a second layer underneath would be revealed
                  through the button the moment that face faded. */}
              <span className="float-glow">
                <a
                  href={jump.href}
                  className="btn-brand group inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium text-white transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none"
                >
                  {jump.label}
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 ease-out group-hover:translate-y-0.5"
                  >
                    ↓
                  </span>
                </a>
              </span>
            </Reveal>
          </div>
        </Container>

        <HeroScene />
      </div>
    </section>
  );
}
