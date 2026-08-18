import { Breadcrumbs } from "@/components/solutions/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { PixelBlast } from "@/components/ui/PixelBlast";

/**
 * Cover for the job openings list.
 *
 * The illustration that used to be here has been replaced by a dithered pixel
 * field — fractal noise pushed through a Bayer matrix, so the frame resolves
 * into a grid of hard-edged squares that bloom and thin as the noise drifts.
 * Clicking anywhere on it sends a ring out from the point.
 *
 * Which suits this page better than a drawing did. The careers cover next door
 * is a dot map of Sophic's offices, and this is the page it sends people to —
 * so both covers are now the same idea at two temperatures: a grid of small
 * marks, one still and factual, one moving. A picture of ladders had nothing to
 * do with either.
 *
 * The field is drawn in the accent teal on the same near-black the section
 * carries, with `transparent` on so the two are literally the same colour
 * rather than two blacks that nearly match — the same arrangement the partners
 * cover uses for its galaxy.
 *
 * Shorter than the careers cover, and deliberately. That one is selling the
 * idea of working here; this one is the door to a list, and a full screen of
 * animation above nine rows would put the thing the reader came for below the
 * fold.
 */
export function OpeningsCover() {
  return (
    // -mt-16 pt-16 cancels the layout's clearance for the fixed header so the
    // field runs behind it, then restores the spacing inside.
    <section className="relative isolate -mt-16 flex min-h-[17rem] flex-col overflow-hidden bg-slate-950 pt-16 sm:min-h-[20rem] lg:min-h-[23rem]">
      {/* A wash under the field rather than a flat black, so the frame has a
          direction to it — brand blue in the corner the title starts from,
          falling away to the section's own near-black. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-brand-dark/70 via-slate-950 to-slate-950"
      />

      <div aria-hidden="true" className="absolute inset-0">
        <PixelBlast
          // Squares, not the example's circles: the site already has two fields
          // of small round marks — the careers dot map and the partners galaxy —
          // and a third would be the same texture a third time. Squares also
          // read as a grid at this size, which circles stop doing.
          variant="square"
          color="#29a8b8"
          // Coarse enough to be seen as pixels rather than as grain. Upstream's
          // 3 is a texture; this is a pattern.
          pixelSize={7}
          patternScale={2.6}
          // Under half lit. This is a backdrop behind a title, and the density
          // upstream defaults to fills the frame solid enough that white type
          // on it needs a scrim heavy enough to hide the effect anyway.
          patternDensity={0.72}
          pixelSizeJitter={0.4}
          // Slower than the default. The same reasoning as the partners cover:
          // at upstream's speed the field boils, and something boiling behind a
          // heading is something you cannot read the heading over.
          speed={0.35}
          enableRipples
          rippleSpeed={0.34}
          rippleThickness={0.12}
          rippleIntensityScale={1.4}
          liquid
          liquidStrength={0.08}
          liquidRadius={1.1}
          liquidWobbleSpeed={4}
          // Wide, so the field has no edges of its own — it thins out into the
          // section instead of stopping at a rectangle.
          edgeFade={0.32}
          // The section behind is already the colour this should sit on.
          transparent
        />
      </div>

      {/* Two scrims for the copy, and only ever one of them at a time.

          From lg the title sits in the left third of a wide frame, so the wash
          runs left to right and gives up by 70% — the copy is covered and the
          side the field is busiest on is untouched.

          That gradient does nothing on a phone, where the title is as wide as
          the section and its last word lands past the point the wash has given
          up. So below lg it is replaced by one running up from the foot, which
          is where the copy is at every width — it costs the bottom of the
          field, but the bottom of the field is not what somebody came here to
          read. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/55 via-45% to-transparent to-75% lg:hidden"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent to-70% lg:block"
      />

      {/* The top band, and the one place this cover has to be firmer than the
          wash above. The header goes transparent on this route, so its white
          links and light logo sit on whatever is behind them — and what is
          behind them here is a field of bright teal squares that moves. White
          on moving teal is not a contrast problem you can style your way out of
          at the header.

          So it holds at 55% through the top quarter, which covers the 64px bar
          at every height this cover takes, and only then lets go. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/55 via-25% to-transparent to-55%"
      />

      <Container className="relative flex flex-1 flex-col">
        <div className="pt-6 sm:pt-8">
          <Breadcrumbs
            tone="dark"
            trail={[
              { label: "Home", href: "/" },
              { label: "Careers", href: "/careers" },
              { label: "Job Openings" },
            ]}
          />
        </div>

        {/* mt-auto pins the title to the foot; the field takes whatever height
            is left above it. */}
        <div className="mt-auto max-w-2xl pb-10 pt-12 sm:pb-12">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-9 shrink-0 bg-accent" />
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-white/80">
              Careers
            </p>
          </div>

          <h1 className="mt-4 text-[2rem] font-bold leading-[1.12] tracking-[-0.03em] text-white sm:text-[2.75rem]">
            Job openings
          </h1>
        </div>
      </Container>
    </section>
  );
}
