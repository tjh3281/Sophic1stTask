import Image from "next/image";
import { ClickSpark } from "@/components/ui/ClickSpark";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SideRays } from "@/components/ui/SideRays";
import { Fireworks } from "./Fireworks";
import "./Anniversary.css";

/**
 * The anniversary copy, verbatim from the brief. Not to be edited.
 *
 * Split the way it is set rather than the way it was written: the opening
 * sentence carries the whole section on its own and is given the size to say
 * so, the middle two are the body, and the last line is a slogan, not a
 * paragraph. Nothing is added, removed or reordered.
 */
const LEDE = "For 20 years, Sophic Automation has been powered by its people.";

const BODY = [
  "Their ideas, expertise, and dedication have driven innovation, built lasting partnerships, and transformed challenges into opportunities. Every milestone we have achieved reflects the passion and commitment of the individuals who make Sophic Automation what it is today.",
  "As we celebrate our 20th anniversary, we honor the people who shaped our journey and continue to inspire the future of automation.",
];

const CLOSING = "20 Years. One Team. One Vision.";

/**
 * The fourth screen: twenty years, and the people behind them.
 *
 * Night, where the original was a pale blue. That is not a preference — it is
 * what the fireworks need. The animation's sparks are a saturated red-orange
 * and gold, and warm colour on pale blue has nowhere to go: it either
 * disappears into the ground or sits on top of it like clip art, which is what
 * hand-drawn starbursts on a light background always end up looking like. On a
 * dark sky the same colours are light, and can be blended as light. Everything
 * else about this section follows from that one decision.
 *
 * It also closes the page where the page opened. The hero is this same dark;
 * the two white sections between them are the body of the argument, and this
 * is the curtain coming down on it rather than a fifth band of white.
 *
 * The heading is the first line of the copy, at the size the design gives it.
 * There is no invented title and no hidden one — the sentence a reader sees
 * first is the sentence a screen reader announces as the section's heading,
 * which is the only arrangement where the two agree.
 */
export function Anniversary() {
  return (
    // -mb-24 cancels the footer's own top margin, so the band runs straight
    // into it. That margin is right everywhere else — it is the air between a
    // white page and a near-white footer — but here it opens a strip of bare
    // page between two dark grounds, which reads as a seam rather than as
    // space. Nothing else on the site ends on a dark band, so the fix belongs
    // to this section rather than to the footer.
    <section className="anniversary relative isolate -mb-24 overflow-hidden text-white">
      {/* The three background layers, back to front: the rays are the light in
          the sky, the fireworks go off in front of them, and the sparks are
          struck on top of both. Order in the markup is the whole of it — every
          one of them is positioned, so none needs a z-index. */}
      <div aria-hidden="true" className="anniversary__rays">
        <SideRays
          // Thrown from the top left, across the page and away from the two
          // brightest fireworks, which are top-right. Both in one corner and
          // the whole composition leans that way.
          origin="top-left"
          // The Lottie's own gold against the site's accent teal, so the light
          // in the sky is made of the same two colours as the things burning
          // in it. Upstream's defaults are a yellow and a pale blue that
          // belong to nothing here.
          rayColor1="#ffba3b"
          rayColor2="#5ec8e0"
          // Slow. This is weather, not an event: anything quicker competes
          // with the bursts for attention and the reader ends up watching the
          // background instead of reading.
          speed={0.55}
          // Wide fan, shallow falloff, held well down in opacity. Falloff is
          // the one to be careful with: it is an inverse power of distance, so
          // upstream's default of 2 spends the whole of the light within a
          // couple of hundred pixels of the corner and leaves a bright smudge
          // there rather than rays. Low enough to cross the band, and the
          // opacity — not the falloff — is what keeps it off the text.
          spread={2.2}
          intensity={3.4}
          falloff={1.35}
          saturation={1.15}
          blend={0.62}
          tilt={-8}
          opacity={0.6}
        />
      </div>

      <Fireworks />

      {/* Wraps the content rather than sitting behind it, because it has to be
          the thing the press lands on: a canvas underneath everything would
          have the type and the container between it and the pointer. It adds
          no behaviour — nothing in this section is actionable — so there is no
          keyboard equivalent to leave out. */}
      <ClickSpark
        // Struck in the fireworks' gold, so a press reads as one more small
        // thing going off rather than as a separate effect.
        sparkColor="#ffd27a"
        sparkCount={10}
        sparkSize={12}
        sparkRadius={22}
        duration={520}
      >
        <Container className="relative py-24 sm:py-32">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            {/* Decorative: the wordmark is the company's own name, and the
                name is in the sentence directly under it. The light cut of the
                logo, which exists for exactly this ground. */}
            <Reveal variant="settle">
              <Image
                src="/images/sophic-logo-light.png"
                alt=""
                width={480}
                height={267}
                sizes="(min-width: 640px) 13rem, 10rem"
                className="h-auto w-40 sm:w-52"
              />
            </Reveal>

            <Reveal delay={80}>
              <h2 className="mt-8 text-balance text-[1.5rem] font-semibold leading-[1.3] tracking-[-0.02em] sm:text-[2.25rem]">
                {LEDE}
              </h2>
            </Reveal>

            {/* Held well inside the heading's measure. This is centred text,
                and centred text is read by finding the start of each line in
                the middle of the page — past about seventy characters that
                search costs more than the extra words are worth. */}
            <Reveal
              delay={160}
              className="mt-8 max-w-[34rem] space-y-5 text-[0.9375rem] leading-relaxed text-white/75 sm:text-[1.0625rem]"
            >
              {BODY.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </Reveal>

            <Reveal delay={240} className="mt-12 flex flex-col items-center">
              {/* A rule that fades out at both ends rather than stopping. The
                  band has no boxes and no borders anywhere else in it; a hard
                  100px line would be the only drawn edge on the whole
                  screen. */}
              <span
                aria-hidden="true"
                className="block h-px w-28 bg-gradient-to-r from-transparent via-white/55 to-transparent"
              />

              {/* The payoff line, in the hero's own ramp — white at the left
                  running to the accent teal at the right. It is the site's
                  treatment for a display line, and using it here is what ties
                  the bottom of the page back to the top. */}
              <p className="mt-8 bg-gradient-to-r from-white to-[#5ec8e0] bg-clip-text text-[1.25rem] font-bold tracking-[0.01em] text-transparent sm:text-[1.75rem]">
                {CLOSING}
              </p>
            </Reveal>
          </div>
        </Container>
      </ClickSpark>
    </section>
  );
}
