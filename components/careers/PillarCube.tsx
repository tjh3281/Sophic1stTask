"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CareerGlyph } from "@/components/careers/CareerGlyph";
import { BRAND_RAMP } from "@/components/solutions/figureGradient";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { CUBE_PILLARS } from "@/lib/careers";
import "./PillarCube.css";

/**
 * Six pillars on the sides of a solid, turned by the scroll position.
 *
 * The section is a tall runway with a sticky frame inside it — the same shape
 * the home page hero uses — so the cube holds still in the middle of the screen
 * while the page scrolls past, and only the rotation moves.
 *
 * Two things are worth knowing before editing the stops below.
 *
 * Every stop turns on ONE axis at a time, apart from the last. `rotateX(a)
 * rotateY(b)` composes, so an arbitrary pair of angles does not put a
 * predictable face forward — but when either angle is zero the other behaves
 * exactly as you would expect, and each face's own transform is undone by the
 * matching stop. That is why the order is top → front → right → back → left →
 * bottom: it walks the four sides on Y with X pinned at zero, and takes the
 * two caps on X with Y at a multiple of 360.
 *
 * The last transition moves both, and has to. Coming off the left face at
 * -270deg, the Y rotation carries on to -360 while X swings to 90 — finishing
 * the turn rather than unwinding it, and landing the bottom face with no net
 * spin in its own plane. Stopping Y at -270 would work too, since at X=90 the
 * bottom faces the camera whatever Y is doing, but the face would arrive lying
 * on its side.
 */

/** Face classes in the order they come round. */
const FACES = ["top", "front", "right", "back", "left", "bottom"] as const;

/** Cube rotation that brings the face of the same index to the camera. */
const STOPS: Array<{ rx: number; ry: number }> = [
  { rx: -90, ry: 0 }, // top
  { rx: 0, ry: 0 }, // front
  { rx: 0, ry: -90 }, // right
  { rx: 0, ry: -180 }, // back
  { rx: 0, ry: -270 }, // left
  { rx: 90, ry: -360 }, // bottom
];

/** Fraction of each step spent holding the face still before it turns. Without
 *  it the cube never stops moving and no face is ever simply readable. */
const DWELL = 0.42;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

export function PillarCube() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const backdropRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  useEffect(() => {
    if (reduced) return;

    const section = sectionRef.current;
    // Everything is written to the stage rather than to the cube: custom
    // properties inherit, so the cube picks up its rotation from here and the
    // glow blob beside it picks up the same brightness from the same place.
    const stage = stageRef.current;
    if (!section || !stage) return;

    // Below lg the cube is not rendered at all and the runway collapses, so
    // there is nothing to drive. Checked per frame rather than once, because a
    // window can be resized across the breakpoint.
    const desktop = window.matchMedia("(min-width: 64rem)");

    let frame = 0;
    let active = -1;

    const update = () => {
      frame = 0;
      if (!desktop.matches) return;

      const rect = section.getBoundingClientRect();
      // How far the sticky frame has travelled through its runway.
      const travel = rect.height - window.innerHeight;
      const progress = travel > 0 ? clamp01(-rect.top / travel) : 0;

      const span = STOPS.length - 1;
      const scaled = progress * span;
      const index = Math.min(Math.floor(scaled), span - 1);
      const withinStep = scaled - index;

      // Hold, then turn — and ease the turn so the cube settles rather than
      // stopping dead against the next face.
      const turn = smoothstep(clamp01((withinStep - DWELL) / (1 - DWELL)));

      const from = STOPS[index];
      const to = STOPS[index + 1];
      stage.style.setProperty("--cube-rx", `${lerp(from.rx, to.rx, turn)}deg`);
      stage.style.setProperty("--cube-ry", `${lerp(from.ry, to.ry, turn)}deg`);

      // Nothing at either end of a step, brightest halfway through it — so the
      // light belongs to the movement rather than to a position. Taken off the
      // eased value, so it swells and fades with the turn instead of ramping
      // linearly while the cube is still accelerating.
      stage.style.setProperty("--cube-glow", Math.sin(turn * Math.PI).toFixed(3));

      // The backdrop crossfades on the same eased value that turns the cube,
      // so the picture changes at exactly the rate the face does — no easing of
      // its own and no CSS transition, either of which would put the image a
      // beat behind the side it belongs to.
      backdropRefs.current.forEach((node, position) => {
        if (!node) return;
        const opacity =
          position === index ? 1 - turn : position === index + 1 ? turn : 0;
        node.style.opacity = opacity.toFixed(3);
      });

      // The step list beside the cube tracks whichever face is nearest front.
      const nearest = turn > 0.5 ? index + 1 : index;
      if (nearest !== active) {
        active = nearest;
        stepRefs.current.forEach((node, position) => {
          node?.setAttribute("data-active", String(position === nearest));
        });
      }
    };

    // Written to the DOM from a rAF rather than through state: this runs on
    // every scroll event, and a re-render per frame is how a sticky section
    // starts dropping them.
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

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
      ref={sectionRef}
      id="why-sophic"
      // The runway. Roughly two thirds of a screen per face, plus the screen
      // the sticky frame occupies. Only from lg — below it the cube is not
      // rendered and a 400vh section would be 400vh of nothing.
      className="scroll-mt-20 bg-surface lg:h-[400vh]"
    >
      <div className="relative lg:sticky lg:top-16 lg:flex lg:h-[calc(100vh-4rem)] lg:items-center">
        {/* The backdrop, behind everything in the frame — cube, heading and
            step list alike. It lives inside the sticky frame rather than on the
            section, so it holds the screen for the whole 400vh runway instead
            of scrolling away after the first one. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
        >
          {CUBE_PILLARS.map((pillar, index) => (
            <div
              key={pillar.name}
              ref={(node) => {
                backdropRefs.current[index] = node;
              }}
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
          <div className="py-16 sm:py-24 lg:grid lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-center lg:gap-12 lg:py-0">
            <div>
              {heading}

              {/* The contents page for the cube: which face is showing, and
                  how many are left. Hidden below lg along with the cube it
                  describes. */}
              <ol className="mt-8 hidden space-y-1 lg:block">
                {CUBE_PILLARS.map((pillar, index) => (
                  <li
                    key={pillar.name}
                    ref={(node) => {
                      stepRefs.current[index] = node;
                    }}
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

            {/* The cube itself. Below lg this is dropped and the grid stands
                in — a 3D solid driven by scroll needs a sticky runway, and a
                phone has neither the height nor the appetite for one. */}
            <div className="hidden lg:block">
              <div
                ref={stageRef}
                className="pillar-cube-stage"
                style={
                  {
                    "--cube-size": "clamp(17rem, 24vw, 21rem)",
                    "--cube-half": "calc(var(--cube-size) / 2)",
                  } as React.CSSProperties
                }
              >
                {/* Behind the cube in the DOM, so it paints under it. */}
                <div aria-hidden="true" className="pillar-cube-glow" />

                <div className="pillar-cube">
                  {CUBE_PILLARS.map((pillar, index) => (
                    <article
                      key={pillar.name}
                      className={cn(
                        "pillar-cube__face",
                        `pillar-cube__face--${FACES[index]}`,
                        // No shadow utilities here: the face's elevation and
                        // its glow are one box-shadow declaration in the CSS,
                        // and a Tailwind shadow would be a second one that
                        // replaces it rather than adding to it.
                        "flex flex-col justify-between rounded-2xl border border-line bg-background p-7",
                      )}
                    >
                      <span
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-lg text-white ${BRAND_RAMP}`}
                      >
                        <CareerGlyph name={pillar.icon} className="h-6 w-6" />
                      </span>

                      <div>
                        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-brand">
                          {pillar.group}
                        </p>
                        <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-foreground">
                          {pillar.name}
                        </h3>
                        <p className="mt-2.5 text-sm leading-relaxed text-muted">
                          {pillar.gist}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            {/* Below lg only. */}
            <div className="lg:hidden">{grid}</div>
          </div>
        </Container>
      </div>
    </section>
  );
}
