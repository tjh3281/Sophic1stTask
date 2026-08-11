import Image from "next/image";
import { Breadcrumbs } from "@/components/solutions/Breadcrumbs";
import { Container } from "@/components/ui/Container";

/**
 * Cover for the job openings list.
 *
 * Built like CareersCover rather than like the flat CareersPageHeader the role
 * pages use, because this is the page the careers cover sends people to and the
 * two should look like one place. Same scrim recipe, same drawn rule above the
 * label, same white title.
 *
 * Shorter than the careers cover, though, and deliberately. That one is selling
 * the idea of working here and gets to be a picture with a line of type on it;
 * this one is the door to a list, and a full screen of illustration above nine
 * rows would put the thing the reader came for below the fold.
 *
 * The artwork is a drawing rather than a photograph, so the scrim is lighter
 * than the careers cover's — flat colour has no highlights to lose, but it also
 * has none to hide behind, and dropping a heavy tint over it just makes it look
 * like a mistake. It runs left to right and gives up by 70%, which keeps the
 * copy readable over the blue without touching the pale side the ladders climb
 * into.
 */
export function OpeningsCover() {
  return (
    // -mt-16 pt-16 cancels the layout's clearance for the fixed header so the
    // illustration runs behind it, then restores the spacing inside.
    <section className="relative isolate -mt-16 flex min-h-[17rem] flex-col overflow-hidden bg-slate-900 pt-16 sm:min-h-[20rem] lg:min-h-[23rem]">
      <Image
        src="/images/JobOpening-cover.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-slate-950/65 via-slate-950/25 to-transparent to-70%"
      />
      {/* The top band, and the one place this cover has to be firmer than the
          left-to-right wash above. The header goes transparent on this route,
          so its white links and light logo sit on whatever is behind them —
          and at the right-hand end, where most of the bar is, that is the pale
          corner the ladders climb into. White on cream is not a contrast
          problem you can style your way out of at the header.

          So it holds at 55% through the top quarter, which covers the 64px bar
          at every height this cover takes, and only then lets go. That band of
          the illustration is empty sky in any case — the platforms all sit
          below it — so what it costs is nothing you can see. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/55 via-25% to-transparent to-55%"
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

        {/* mt-auto pins the title to the foot; the illustration takes whatever
            height is left above it. */}
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
