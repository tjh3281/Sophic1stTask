import { Breadcrumbs } from "@/components/solutions/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Galaxy } from "@/components/ui/Galaxy";
import { Reveal } from "@/components/ui/Reveal";
import { PARTNERS_HERO } from "@/lib/partners";

/**
 * Partners cover.
 *
 * The same frame as the company and careers covers — full bleed, running up
 * behind the transparent header, breadcrumbs at the top, copy pinned to the
 * foot — with the one difference that decides everything else about it: the
 * picture is not a photograph. It is a star field, and it is generated.
 *
 * That changes what the scrim is for. On the other two covers the gradients
 * exist to rescue white type from a bright photograph, so they are heavy at
 * both ends and clear out of the middle where the subject is. Here the ground
 * is already near-black and the type is never in danger. What the gradients do
 * instead is hold the stars *down* at the foot, so the copy sits on quiet sky
 * rather than competing with flares behind it — the opposite job, in the same
 * place.
 *
 * The copy is two sentences and they are set as two: the headline is the idea,
 * the lead names who it is addressed to. See lib/partners.
 */
export function PartnersCover() {
  return (
    // -mt-16 pt-16 cancels the layout's header clearance so the field runs
    // behind the transparent header, then restores the spacing inside.
    <section className="relative isolate -mt-16 flex min-h-[22rem] flex-col overflow-hidden bg-slate-950 pt-16 sm:min-h-[27rem] lg:min-h-[33rem]">
      {/* Behind everything, including the scrims. It paints its own stars over
          the section's near-black rather than carrying a ground of its own —
          `transparent` is what lets the two be the same colour. */}
      <div aria-hidden="true" className="absolute inset-0">
        <Galaxy
          // Blue-to-cyan rather than the component's default green: it puts the
          // field in the same family as the site's accent teal without being
          // asked to match it exactly, which at this saturation it could not.
          hueShift={205}
          saturation={0.55}
          density={1.15}
          glowIntensity={0.32}
          twinkleIntensity={0.45}
          // Slower than the default across the board. This is a backdrop behind
          // something a reader is meant to read; at upstream's speed the drift
          // pulls the eye off the sentence and onto the sky.
          starSpeed={0.28}
          rotationSpeed={0.035}
          speed={0.75}
          repulsionStrength={1.6}
          transparent
        />
      </div>

      {/* Two ends, like the other covers, but doing the opposite job — see the
          note at the top. Heavier at the foot, where the copy is. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent via-35% to-slate-950/85"
      />
      {/* Settles the left, where the type column runs, without flattening the
          right half of the field. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-slate-950/60 to-transparent to-60%"
      />

      <Container className="relative flex flex-1 flex-col">
        <div className="pt-6 sm:pt-8">
          <Breadcrumbs
            tone="dark"
            trail={[{ label: "Home", href: "/" }, { label: "Partners" }]}
          />
        </div>

        {/* mt-auto pins this to the foot; the field takes whatever height is
            left above it. */}
        <div className="mt-auto max-w-3xl pb-10 pt-12 sm:pb-12 lg:pb-14">
          <Reveal>
            <div className="flex items-center gap-3">
              {/* The drawn rule the company and careers covers both open on. */}
              <span aria-hidden="true" className="h-px w-9 shrink-0 bg-accent" />
              <p className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-white/80">
                {PARTNERS_HERO.eyebrow}
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-4 text-[2rem] font-bold leading-[1.12] tracking-[-0.03em] text-white sm:text-[2.75rem]">
              {PARTNERS_HERO.headline}
            </h1>
          </Reveal>

          <Reveal delay={160}>
            {/* Held narrower than the heading. The heading is short enough to
                sit on one or two lines at any width; this is a full sentence,
                and across the whole column it would run past the measure where
                a line is still easy to come back from. */}
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              {PARTNERS_HERO.lead}
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
