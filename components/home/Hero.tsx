import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ParticleText } from "@/components/ui/ParticleText";
import { VantaNet } from "@/components/ui/VantaNet";
import { EvolutionSequence } from "./EvolutionSequence";
import "./Hero.css";

const HEADLINE = "Transforming Your Business";

/** Silent, white on black, and cropped to the figures by Hero.css. */
const EVOLUTION_CLIP = "/images/evolution.mp4";

/**
 * The home page's opening screen.
 *
 * Built around the motif the old site opened on — the evolution of man with
 * "er" trailing it — rather than replacing it. What changes is that the figures
 * are no longer a strip cut out of a photograph: they are keyed to
 * transparency, walk in one at a time, and stand on a line of light instead of
 * on a dark rectangle that never quite matched whatever was behind it.
 *
 * Three canvases and a stylesheet make up the screen, and they are deliberately
 * kept apart:
 *
 *   - VantaNet draws the background. It is a WebGL scene, it knows nothing
 *     about the page, and it is covered by a scrim that does the legibility
 *     work.
 *   - ParticleText draws the headline. It is decorative; the h1 below is the
 *     real heading, which is what a screen reader, a search engine and a reader
 *     with JavaScript off all get.
 *   - Everything else is DOM with CSS keyframes on it, so the figures, the
 *     line, the lede and the button arrive in order without a frame of
 *     JavaScript.
 *
 * That split is also what lets this stay a server component: only the two
 * canvases cross into the client.
 */
export function Hero() {
  return (
    // -mt-16 pt-16 cancels the layout's header clearance so the field runs
    // behind the transparent header, then gives the content the space back.
    // isolate holds the two absolute layers below inside the section.
    <section className="hero relative isolate -mt-16 flex min-h-[100svh] flex-col justify-center overflow-hidden bg-[#23153c] pb-16 pt-28 text-white sm:pt-32">
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        <VantaNet
          // The configuration from vantajs.com, value for value: cyan on
          // violet, a lattice edge of 10 — which is (10+1)² × 2 = 242 dots,
          // not 10 — and upstream's own connection radius and spacing. The
          // section's background is set to the same violet, so the canvas and
          // the CSS behind it are the same colour and nothing shows a seam
          // before the first frame or if WebGL is missing.
          //
          // The effect is left at full strength everywhere, including behind
          // the type. What keeps the headline clear is the pool in Hero.css,
          // which is local to the column of content — so the net is only ever
          // held back where a word is standing on it, and reads exactly as it
          // does on vantajs.com across the rest of the frame.
          color="#3fecff"
          backgroundColor="#23153c"
          points={10}
          maxDistance={20}
          spacing={15}
          speed={1}
          mouseCoeff={1}
        />
      </div>
      <div aria-hidden="true" className="hero-scrim absolute inset-0 -z-10" />

      <Container className="relative flex flex-col items-center text-center">
        {/* The real heading. The particles below are a picture of it — this is
            what is announced, indexed, and what shows if the canvas never
            runs. Same arrangement CareersCover uses for its drawn wordmark. */}
        <h1 className="sr-only">
          {HEADLINE} — automation solutions from Sophic.
        </h1>

        {/* Deliberately taller than the type. The particles start scattered
            around where they are going, and a box cut to the words clips the
            whole opening move. */}
        <div className="h-[clamp(6.5rem,15vw,10.5rem)] w-full">
          <ParticleText
            text={HEADLINE}
            fontSize="clamp(1.9rem, 5.4vw, 4rem)"
            fontWeight={700}
            // White at the left running to the accent teal at the right: the
            // same ramp the filled buttons wear, laid across the headline.
            color="#ffffff"
            highlightColor="#5ec8e0"
            // Fine grain and a lot of it. A headline is a long, thin shape:
            // sampled at upstream's spacing it comes out at a few dozen dots
            // per letter, which is a smear rather than a word.
            particleSize={1.7}
            density={2}
            maxParticles={5000}
            scatter={80}
            gatherDuration={1250}
            stagger={320}
            // Canvas shadows cost a blur per draw call and there are a couple
            // of thousand of those a frame here. The field behind supplies the
            // atmosphere instead.
            glow={false}
            idleDrift={0.45}
            repelRadius={110}
            pointerRepel={34}
          />
        </div>

        {/* The figures and the "er". Its own client component because the "er"
            is timed off the clip's playback position rather than a delay. */}
        <EvolutionSequence src={EVOLUTION_CLIP} />

        <p
          className="hero-fade mt-10 max-w-xl text-base leading-relaxed text-white/70"
          style={{ "--delay": "var(--hero-lede-at)" } as React.CSSProperties}
        >
          Assembly, inspection, material handling and electrical test —
          engineered into your production line.
        </p>

        <div
          className="hero-fade mt-8"
          style={{ "--delay": "var(--hero-cta-at)" } as React.CSSProperties}
        >
          {/* The wrapper carries the glow: .btn-brand has already spent its own
              ::before on the hover face. */}
          <span className="float-glow">
            {/* Off to /solutions rather than a same-page jump. The page does
                now continue below — the awards section is under this one — but
                that is not what this button offers, and a button whose label
                says one thing and whose destination is the next thing down the
                page is worse than a longer journey.

                Left pointing at /solutions, not at the equipment catalogue one
                level inside it, so the button and the header item of the same
                name arrive at the same place. */}
            <Link
              href="/solutions"
              className="btn-brand group inline-flex items-center gap-2 rounded-md px-6 py-3.5 text-sm font-semibold text-white transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none"
            >
              Explore solutions
              <span
                aria-hidden="true"
                className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </span>
        </div>
      </Container>
    </section>
  );
}
