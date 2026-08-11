"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CareerGlyph } from "@/components/careers/CareerGlyph";
import { BRAND_RAMP } from "@/components/solutions/figureGradient";
import { cn } from "@/lib/cn";
import { CUBE_PILLARS } from "@/lib/careers";
import "./ForkliftRun.css";
import "./PillarCube.css";

/**
 * The forklift that runs through both careers sections, and the cube it carries.
 *
 * One machine, one load. The load sits at the top of the mast, centred on the
 * paragraphs beside it and carrying the headline on a sign, and stays there
 * while the page scrolls — until the header catches up with it. From that point
 * the header holds it and the mast slides past, which reads as the fork
 * lowering, until it comes to rest on the truck in the culture-cube section
 * below. Once it is down, the sign goes and the load turns: six sides, one
 * pillar each, driven by the rest of that section's runway.
 *
 * The crate on the fork IS the cube. There is no second solid anywhere on the
 * page. All the way down it is the render — a photographed white box with the
 * headline screwed to it — and on the way down that is all it is. The six
 * faces only arrive as it touches the fork, cross-fading in over the crate at
 * the size the crate already is, so the swap reads as the box turning to face
 * you rather than as one object being exchanged for another.
 *
 * That is why this component wraps both sections rather than living inside
 * either. A load that has to end up in the second section cannot be a child of
 * the first, and the second section's frame is sticky — so the truck's position
 * in the document is not fixed and cannot be precomputed.
 *
 * Both ends of every span are therefore measured live, each frame:
 *
 *   the rail's foot   the top of the truck, wherever sticky has put it
 *   the load's landing the truck's fork, same
 *   the load's start  the top of the argument column
 *
 * so the track is continuous by construction. Written straight to the DOM from
 * a rAF rather than through state — this runs on every scroll event, and a
 * re-render per frame is how a page like this starts dropping them.
 *
 * One loop drives all of it: position, rotation, the glow, the step list beside
 * the cube and the illustration behind it. They are all functions of the same
 * two rectangles, and splitting them across two scroll listeners is how the
 * picture ends up a frame behind the side it belongs to.
 */

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const smoothstep = (t: number) => t * t * (3 - 2 * t);
/** 0 before `from`, 1 after `to`, straight line between. */
const ramp = (t: number, from: number, to: number) =>
  clamp01((t - from) / (to - from));

/** Clearance kept between the header and the top of the load once it pins. */
const HEADER_GAP = 12;

/** Fallback header height, if there is no header element to measure. */
const HEADER_FALLBACK = 64;

/** The fork's landing height inside the truck crop. */
const TRUCK_FORK_BOTTOM = 0.958;

/** 1690 / 850: how tall the whole picture has to be drawn for its mast band —
 *  the top 850 rows — to fill a given height exactly. */
const MAST_STRETCH = 1690 / 850;

/** How far past each edge of the screen the mast is still built, so a frame
 *  the browser skips cannot bring its cut end into view. */
const MAST_MARGIN = 240;

/**
 * How far the mast is drawn past the truck's top edge.
 *
 * The two are laid out to meet exactly and they do — but the truck's top is
 * wherever the browser's own layout put it, fractional pixels and all, while
 * the mast's foot is a number we write. Round those to different sides of the
 * same device pixel and the sliver neither of them paints is a hairline of the
 * section behind showing straight through the mast, which is what the white
 * line across it was.
 *
 * Overlapping is free. Both sides are drawing the same rows of the same
 * picture at that join, so the extra couple of pixels are the mast twice.
 */
const SEAM_OVERLAP = 2;

/** How much of the culture cube's runway the load takes to settle onto the
 *  fork. Short: it should be down and parked well before the first side is
 *  being read, not still drifting under it. The turn starts where this ends. */
const LAND_BY = 0.12;

/** Face classes in the order they come round. */
const FACES = ["top", "front", "right", "back", "left", "bottom"] as const;

/**
 * Cube rotation that brings the face of the same index to the camera.
 *
 * Every stop turns on ONE axis at a time, apart from the last. `rotateX(a)
 * rotateY(b)` composes, so an arbitrary pair of angles does not put a
 * predictable face forward — but when either angle is zero the other behaves
 * exactly as you would expect, and each face's own transform is undone by the
 * matching stop. That is why the order is top → front → right → back → left →
 * bottom: it walks the four sides on Y with X pinned at zero, and takes the two
 * caps on X with Y at a multiple of 360.
 *
 * It also starts on the face the load is already showing. The first stop is the
 * attitude the crate holds all the way down the mast, so the descent is the
 * cube at rest rather than a pose it has to snap out of.
 *
 * The last transition moves both, and has to. Coming off the left face at
 * -270deg, the Y rotation carries on to -360 while X swings to 90 — finishing
 * the turn rather than unwinding it, and landing the bottom face with no net
 * spin in its own plane.
 */
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

export function ForkliftRun({ children }: { children: React.ReactNode }) {
  const runRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const signRef = useRef<HTMLDivElement>(null);
  const loadRef = useRef<HTMLDivElement>(null);

  // Under prefers-reduced-motion the culture cube drops its sticky runway and
  // renders a plain grid with no truck in it, so there is nothing for the load
  // to land on and the whole machine stands down. Set after mount, so the
  // server and the first client render agree.
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

    const run = runRef.current;
    const rail = railRef.current;
    const box = boxRef.current;
    const sign = signRef.current;
    const load = loadRef.current;
    if (!run || !rail || !box || !sign || !load) return;

    // The picture inside the mast's window, sized and offset per frame rather
    // than in the stylesheet — it is the full span that decides both, and the
    // window it shows through is not.
    const railArt = rail.querySelector("img");
    if (!railArt) return;

    const desktop = window.matchMedia("(min-width: 64rem)");
    let frame = 0;
    let active = -1;

    // Measured rather than assumed: the header is the thing the load stops
    // against, and hard-coding its height is how that stops being true the
    // next time somebody edits it.
    const headerHeight = () => {
      const header = document.querySelector("header");
      return header ? header.getBoundingClientRect().height : HEADER_FALLBACK;
    };

    const update = () => {
      frame = 0;

      const start = run.querySelector<HTMLElement>("[data-forklift-start]");
      const truck = run.querySelector<HTMLElement>(".forklift-truck");
      const cube = run.querySelector<HTMLElement>("#why-sophic");
      if (!desktop.matches || !start || !truck || !cube) {
        run.dataset.machine = "off";
        return;
      }
      run.dataset.machine = "on";

      const runRect = run.getBoundingClientRect();
      const startRect = start.getBoundingClientRect();

      // The Container's content width, taken from the grid that fills it. Both
      // machines are positioned as fractions of this, and it has to be the real
      // laid-out width — 100vw includes the scrollbar and would drift the rail
      // off the truck by exactly that much.
      const grid = start.parentElement;
      if (grid) run.style.setProperty("--c", `${grid.clientWidth}px`);

      const truckRect = truck.getBoundingClientRect();
      const cubeRect = cube.getBoundingClientRect();

      const railTop = startRect.top - runRect.top;
      const truckTop = truckRect.top - runRect.top;

      // At full height the load sits centred on the paragraphs beside it — the
      // column stretches to the prose, so this is the prose's own middle.
      const boxHeight = box.offsetHeight;
      const parked = railTop + (startRect.height - boxHeight) / 2;
      const landing =
        truckTop + TRUCK_FORK_BOTTOM * truckRect.height - boxHeight;

      // The load holds at full height, riding up the page with everything else,
      // until the header catches it. From then on it is held just under the
      // header — which, since the page keeps moving and the load does not, is
      // the fork descending the mast.
      //
      // `ceiling` is the run-space position that keeps the load under the header
      // on screen. Before the header reaches it that number is smaller than
      // `parked`, so the max() leaves the load alone; afterwards it is larger,
      // and the load is pinned. The handover happens exactly where they cross,
      // with no progress variable to keep in sync.
      const ceiling = headerHeight() + HEADER_GAP - runRect.top;
      const held = Math.max(parked, ceiling);

      // Then a last move, and it needs its own driver. Once the culture-cube
      // section pins, the truck stops moving too — load and truck both frozen
      // to the viewport, still a few hundred pixels apart, and no amount of
      // scrolling would ever close that gap. So the final descent onto the fork
      // runs off the cube section's own runway instead, over its first stretch.
      const runway = cubeRect.height - window.innerHeight;
      const progress = runway > 0 ? clamp01(-cubeRect.top / runway) : 0;
      const settle = clamp01(progress / LAND_BY);

      const boxTop = held + (landing - held) * settle;
      box.style.top = `${boxTop.toFixed(1)}px`;

      // The mast: from the load's starting height down to the truck. Its foot
      // moves with the truck, so the two are always one line.
      //
      // Only the stretch of it on screen is built, though, and that is not a
      // micro-optimisation. The span runs to several thousand pixels once the
      // culture section's runway is under way, with a picture inside it drawn
      // twice as tall again — and because the element is masked, the browser
      // has to raster it as one piece rather than tile by tile. That is a
      // texture big enough to fail, and when it does the mast blanks out
      // mid-scroll. So the element is the screen plus a margin, and the picture
      // inside keeps the size and offset the whole span would have given it,
      // which is what stops the artwork sliding as the window moves.
      const railSpan = Math.max(0, truckTop - railTop);
      const railFoot = railTop + railSpan;
      const drawTop = Math.min(Math.max(railTop, -runRect.top - MAST_MARGIN), railFoot);
      const drawFoot = Math.max(
        Math.min(
          railFoot + SEAM_OVERLAP,
          window.innerHeight - runRect.top + MAST_MARGIN,
        ),
        drawTop,
      );
      // Negative once the head has gone off the top: the picture, and with it
      // the fade over its cut end, hangs above the element that shows it.
      const head = railTop - drawTop;

      rail.style.top = `${drawTop.toFixed(1)}px`;
      rail.style.height = `${(drawFoot - drawTop).toFixed(1)}px`;
      rail.style.setProperty("--rail-head", `${head.toFixed(1)}px`);
      railArt.style.top = `${head.toFixed(1)}px`;
      railArt.style.height = `${(railSpan * MAST_STRETCH).toFixed(1)}px`;

      // The handover, and the only moment the page has two versions of the same
      // object. All the way down it is the render, sign and all; on the fork it
      // is the cube. They are drawn the same size in the same place, so what
      // crosses over is the surface rather than the box.
      //
      // Staggered rather than a straight dissolve: half a beat where the sign
      // has gone but the faces have not arrived reads as the box turning, where
      // an even crossfade reads as both being half-there.
      sign.style.opacity = (1 - ramp(settle, 0, 0.5)).toFixed(3);
      load.style.opacity = ramp(settle, 0.45, 1).toFixed(3);

      // --- and then it turns ------------------------------------------------
      // Everything below runs on what is left of the runway once the load is
      // down, so the first side is square to the reader before it moves.
      const spin = clamp01((progress - LAND_BY) / (1 - LAND_BY));

      const span = STOPS.length - 1;
      const scaled = spin * span;
      const index = Math.min(Math.floor(scaled), span - 1);
      const withinStep = scaled - index;

      // Hold, then turn — and ease the turn so the cube settles rather than
      // stopping dead against the next face.
      const turn = smoothstep(clamp01((withinStep - DWELL) / (1 - DWELL)));

      const from = STOPS[index];
      const to = STOPS[index + 1];
      run.style.setProperty("--cube-rx", `${lerp(from.rx, to.rx, turn)}deg`);
      run.style.setProperty("--cube-ry", `${lerp(from.ry, to.ry, turn)}deg`);

      // Nothing at either end of a step, brightest halfway through it — so the
      // light belongs to the movement rather than to a position. Taken off the
      // eased value, so it swells and fades with the turn instead of ramping
      // linearly while the cube is still accelerating.
      run.style.setProperty("--cube-glow", Math.sin(turn * Math.PI).toFixed(3));

      // The backdrop crossfades on the same eased value that turns the cube,
      // so the picture changes at exactly the rate the face does — no easing of
      // its own and no CSS transition, either of which would put the image a
      // beat behind the side it belongs to.
      run
        .querySelectorAll<HTMLElement>("[data-pillar-backdrop]")
        .forEach((node, position) => {
          const opacity =
            position === index ? 1 - turn : position === index + 1 ? turn : 0;
          node.style.opacity = opacity.toFixed(3);
        });

      // The step list beside the cube tracks whichever face is nearest front.
      const nearest = turn > 0.5 ? index + 1 : index;
      if (nearest !== active) {
        active = nearest;
        run
          .querySelectorAll<HTMLElement>("[data-pillar-step]")
          .forEach((node, position) => {
            node.dataset.active = String(position === nearest);
          });
      }
    };

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

  return (
    <div ref={runRef} className="forklift-run" data-machine="off">
      {children}

      {!reduced && (
        <div className="forklift-flight">
          {/* The mast, drawn from the top of the one picture of the machine —
              the same file the truck below is drawn from, so there is nothing
              to keep in register. */}
          <div ref={railRef} aria-hidden="true" className="forklift-rail">
            <Image
              src="/images/forklift.png"
              alt=""
              width={680}
              height={1690}
              sizes="28vw"
              className="select-none"
            />
          </div>

          <div ref={boxRef} className="forklift-box">
            {/* The load as it was photographed: fork, tines, carriage and the
                white crate. It never goes — the crate underneath is the body
                the six faces belong to, and the fork holding it is the only
                thing that says this is a load and not a floating box. */}
            <Image
              src="/images/forklift-box.png"
              alt=""
              aria-hidden="true"
              fill
              sizes="32vw"
              className="select-none"
              priority
            />

            {/* Laid on the crate's face, not composited into it — the two box
                renders put the fork in different places, so crossfading them
                whole would slide the tines, while fading a plaque off a single
                unchanging crate does exactly what it should. */}
            <div ref={signRef} aria-hidden="true" className="forklift-sign">
              <Image
                src="/images/forklift-sign.png"
                alt=""
                fill
                sizes="14vw"
                className="select-none"
                priority
              />
            </div>

            {/* The six sides. Not aria-hidden, unlike everything else in this
                layer: from lg up this is the only copy of the pillars on the
                page, so hiding it would take them off it. */}
            <div ref={loadRef} className="forklift-load">
              <div className="pillar-cube-stage">
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
          </div>
        </div>
      )}
    </div>
  );
}
