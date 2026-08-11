"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CareerGlyph } from "@/components/careers/CareerGlyph";
import { BRAND_RAMP } from "@/components/solutions/figureGradient";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { CUBE_PILLARS } from "@/lib/careers";
import "./PillarCube.css";
// The truck is the foot of the mast that runs down through the section above
// this one; its placement is arithmetic shared with that run.
import "./ForkliftRun.css";

/**
 * Six pillars on the sides of the crate the forklift is carrying.
 *
 * The section is a tall runway with a sticky frame inside it — the same shape
 * the home page hero uses — so the load holds still in the middle of the screen
 * while the page scrolls past, and only the rotation moves.
 *
 * The cube itself is not here. It belongs to ForkliftRun, which flies it down
 * from the section above and lands it on this truck's fork; the stops it turns
 * through, and the driver that turns them, are in that file. What is left here
 * is everything anchored to the section: the illustration behind the frame, the
 * heading, and the list of sides. Those last two are written to from the same
 * loop that turns the cube — `data-pillar-backdrop` and `data-pillar-step` are
 * the hooks it finds them by.
 */
export function PillarCube() {
  // Anyone who has asked for less motion gets the plain grid instead of a
  // solid tumbling as they scroll. Set after mount, so the server and the
  // first client render agree.
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const heading = (
    <>
      <Reveal>
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-9 shrink-0 bg-brand" />
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-brand">
            Why work with us
          </p>
        </div>
        <h2 className="mt-4 max-w-md text-[1.75rem] font-bold leading-[1.15] tracking-[-0.025em] text-foreground sm:text-[2.25rem]">
          Six things we hold ourselves to.
        </h2>
      </Reveal>
    </>
  );

  // The plain grid: everything below lg, and everything at all under
  // prefers-reduced-motion.
  const grid = (
    <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CUBE_PILLARS.map((pillar, index) => (
        <li key={pillar.name}>
          <Reveal delay={Math.min(index, 4) * 60} className="h-full">
            <div className="float-glow float-glow-card">
              <article className="group flex h-full flex-col rounded-xl border border-line bg-background p-5 transition-colors duration-200 ease-gentle hover:border-brand/40">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-white ${BRAND_RAMP}`}
                >
                  <CareerGlyph name={pillar.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-bold tracking-[-0.01em] text-foreground">
                  {pillar.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {pillar.gist}
                </p>
                <p className="mt-4 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted/80 transition-colors duration-200 ease-gentle group-hover:text-brand">
                  {pillar.group}
                </p>
              </article>
            </div>
          </Reveal>
        </li>
      ))}
    </ul>
  );

  if (reduced) {
    return (
      <section
        id="why-sophic"
        className="scroll-mt-20 bg-surface py-16 sm:py-24"
      >
        <Container>
          {heading}
          {grid}
        </Container>
      </section>
    );
  }

  return (
    <section
      id="why-sophic"
      // The runway. Roughly two thirds of a screen per side, plus the screen
      // the sticky frame occupies, plus the stretch at the head of it the load
      // spends coming down onto the fork before the first side is square.
      // Only from lg — below it the cube is not rendered and a 440vh section
      // would be 440vh of nothing.
      className="scroll-mt-20 bg-surface lg:h-[440vh]"
    >
      <div className="relative lg:sticky lg:top-16 lg:flex lg:h-[calc(100vh-4rem)] lg:items-center">
        {/* The backdrop, behind everything in the frame — cube, heading and
            step list alike. It lives inside the sticky frame rather than on the
            section, so it holds the screen for the whole runway instead of
            scrolling away after the first screen. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
        >
          {CUBE_PILLARS.map((pillar, index) => (
            <div
              key={pillar.name}
              data-pillar-backdrop
              className="pillar-backdrop absolute inset-0"
              // The first side is showing before a scroll has happened, so its
              // picture is the one already on screen.
              style={{ opacity: index === 0 ? 1 : 0 }}
            >
              <Image
                src={pillar.image}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
                // Only the first is on screen at load; the rest arrive as the
                // cube turns, and a priority hint on six full-bleed images
                // would fight the page's own content for bandwidth.
                priority={index === 0}
              />
            </div>
          ))}

          {/* Weighted, not flat, and that weighting is what lets the pictures
              stay legible at all. The left is where the heading and the step
              list sit on nothing but this, so it keeps a heavy wash; by the
              right it has thinned to a light veil, and that half — the half the
              cube is in — is where you actually read the illustration.

              A flat scrim would have to be set for the worst case, which is the
              text, and would then hide the artwork everywhere including where
              nothing needed protecting. */}
          <div className="absolute inset-0 bg-gradient-to-r from-surface/92 via-surface/76 to-surface/58" />
        </div>

        <Container className="relative w-full">
          {/* Two columns, and the first one is empty: it is the space the
              machine stands in. Both the truck and the cube it is holding are
              drawn by ForkliftRun, in a layer over this one. */}
          <div className="py-16 sm:py-24 lg:grid lg:grid-cols-[minmax(0,51%)_minmax(0,1fr)] lg:items-center lg:gap-8 lg:py-0">
            {/* The foot of the mast the headline came down. The crate now
                resting on its fork is not part of this image — ForkliftRun
                flies it here from the section above. That is why the fork is
                empty.

                Decorative: it repeats what the section already says in words,
                and a screen reader has no use for a second copy. */}
            <div aria-hidden="true" className="hidden lg:block">
              {/* The wrapper is what carries the machine's placement, so the
                  contact shadow underneath it has something to measure
                  against — the shadow has to sit on the truck's ground line,
                  which is a fraction of the truck's own height. */}
              <div className="forklift-stand">
                {/* A window onto the foot of the same picture the mast above is
                    drawn from — one file, two views of it. */}
                <div className="forklift-truck">
                  <Image
                    src="/images/forklift.png"
                    alt=""
                    width={680}
                    height={1690}
                    sizes="28vw"
                    className="select-none"
                  />
                </div>
              </div>
            </div>

            <div>
              {heading}

              {/* The contents page for the cube: which side is showing, and
                  how many are left. Hidden below lg along with the cube it
                  describes. */}
              <ol className="mt-8 hidden space-y-1 lg:block">
                {CUBE_PILLARS.map((pillar, index) => (
                  <li
                    key={pillar.name}
                    data-pillar-step
                    data-active={index === 0 ? "true" : "false"}
                    className="group flex items-center gap-3 py-1 text-sm text-muted transition-colors duration-300 ease-gentle data-[active=true]:text-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="h-px w-4 shrink-0 bg-line transition-all duration-300 ease-gentle group-data-[active=true]:w-8 group-data-[active=true]:bg-brand"
                    />
                    <span className="font-medium transition-transform duration-300 ease-gentle group-data-[active=true]:translate-x-0.5">
                      {pillar.name}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Below lg only. */}
            <div className="lg:hidden">{grid}</div>
          </div>
        </Container>
      </div>
    </section>
  );
}
