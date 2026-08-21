import { Breadcrumbs } from "@/components/solutions/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { EchoText } from "@/components/ui/EchoText";
import { Galaxy } from "@/components/ui/Galaxy";
import { Reveal } from "@/components/ui/Reveal";
import { PARTNERS_HERO } from "@/lib/partners";

/**
 * Partners cover.
 *
 * The same frame as the company and careers covers — full bleed, running up
 * behind the transparent header, breadcrumbs at the top — with two differences.
 *
 * The picture is not a photograph. It is a star field, and it is generated.
 *
 * And the copy is centred rather than pinned to the foot, because the page's
 * name leads it: "Partners" is set at display size with a trail of echoes
 * behind it, and a word that large reads as a title only from the middle of the
 * frame. Pinned low with a statement under it, it would read as a caption on a
 * picture. The two sentences the brief supplies follow underneath, in the same
 * order and at a size that keeps the first of them the idea it was.
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
    // Taller than it was, because the title is now display size and the stack
    // is centred rather than sitting on the floor. Still short of a screen at
    // every step, which is the point made on the page itself.
    <section className="relative isolate -mt-16 flex min-h-[26rem] flex-col overflow-hidden bg-slate-950 pt-16 sm:min-h-[31rem] lg:min-h-[37rem]">
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
      {/* Under the title rather than down one side, which is where the type is
          now. The left-hand gradient this replaces was settling the left half
          of the field because that is where the column ran; a centred stack
          wants the quiet in the middle and the stars left alone at the edges. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(65%_55%_at_50%_52%,rgba(2,6,23,0.78),rgba(2,6,23,0)_72%)]"
      />

      <Container className="relative flex flex-1 flex-col">
        <div className="pt-6 sm:pt-8">
          <Breadcrumbs
            tone="dark"
            trail={[{ label: "Home", href: "/" }, { label: "Partners" }]}
          />
        </div>

        {/* Centred in what is left of the cover rather than pinned to its foot.
            my-auto rather than mt-auto: the breadcrumbs take the top, and this
            takes the middle of everything below them. */}
        <div className="my-auto flex flex-col items-center py-10 text-center sm:py-12">
          {/* The title is the page's name at display size — see PARTNERS_HERO.
              Not wrapped in a Reveal: it has an entrance of its own that starts
              from a spread-out trail, and fading the whole thing up first would
              spend the reveal on the frame before that trail exists. */}
          <h1 className="text-white">
            <EchoText
              text={PARTNERS_HERO.title}
              // Cyan rather than the component's default sky blue: it is the
              // site's own accent, and it is already the family the star field
              // behind it is generated in.
              tint="#29a8b8"
              echoes={10}
              offset={30}
              lag={0.26}
              fade={0.74}
              blur={3}
              cursorRadius={460}
              duration={1100}
              fontSize="clamp(3.25rem, 11vw, 8rem)"
              fontWeight={800}
              color="#ffffff"
            />
          </h1>

          <Reveal delay={120}>
            {/* Was the h1 and is now the sentence under one. It keeps the size
                that made it a heading, because it is still the idea the page
                opens on — only the page's name is now larger than it. */}
            <p className="mt-6 text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.02em] text-white sm:mt-7 sm:text-[1.875rem]">
              {PARTNERS_HERO.headline}
            </p>
          </Reveal>

          <Reveal delay={200}>
            {/* Held narrower than the line above it. That one is short enough
                to sit on one or two lines at any width; this is a full
                sentence, and across the whole column it would run past the
                measure where a line is still easy to come back from. */}
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              {PARTNERS_HERO.lead}
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
