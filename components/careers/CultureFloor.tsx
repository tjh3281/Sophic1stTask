"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CareerGlyph } from "@/components/careers/CareerGlyph";
import { PILLAR_GROUPS } from "@/lib/careers";
import {
  AISLE,
  DOCK,
  FLOOR,
  JUNCTION,
  PROJECTOR,
  SCREEN,
  STATION,
  STATION_X,
  across,
  beam,
  branchPath,
  dockLanes,
  dockPose,
  dockToDockPath,
  down,
  junctionPose,
  roadNetwork,
  stationPose,
  trunkPath,
  type Pose,
} from "@/lib/cultureFloor";
import "./CultureFloor.css";

/**
 * Culture, values and environment, as a floor a robot works.
 *
 * The eight pillars are eight paragraphs of one voice, and a page that simply
 * prints them asks the reader to swallow all eight. Read as a route instead,
 * each one is something fetched: pick a heading and a machine sets off from it,
 * picks the load up at the junction the three headings share, and carries it to
 * whichever pillar was asked for. The reader chooses twice and gets one
 * paragraph — which is the paragraph they were going to read anyway.
 *
 * It is drawn as a plan view because that is what the section is: three ways in,
 * one place they meet, and a shelf of answers beside it. A perspective render of
 * the same thing would be a picture of a robot; from above it is a diagram of
 * the argument.
 *
 * The floor is bare. It used to carry racking and stacked pallets in whichever
 * half the words were not being read in, and they were the wrong kind of detail:
 * a plan of a route wants nothing on it that is not the route, and the scenery
 * was holding open a floor twice as tall as the reading needed. Everything left
 * is either a road, a place the robot stops, or the answer.
 *
 * Two layers, one rectangle. The SVG holds the roads and the machine; the
 * blocks are real buttons laid over it, positioned as percentages of the same
 * coordinate space the viewBox uses (lib/cultureFloor). Neither layer knows
 * about the other, and they line up because they are measured from the same
 * numbers.
 *
 * Below lg the floor is not drawn at all. A plan this wide shrinks to a
 * thumbnail on a phone, and the same buttons stack into an ordinary list that
 * answers in one tap — so the machinery is a way of reading the section, never
 * the only way.
 */

/* --- Driving ---------------------------------------------------------------
   The robot is moved by writing a transform straight to the DOM from a rAF,
   not by re-rendering. Position, heading and the queue of legs it still has to
   drive are all refs for the same reason: a component that re-renders sixty
   times a second to move one <g> is how a page like this starts dropping
   frames.
-------------------------------------------------------------------------- */

/** Milliseconds per floor unit — a speed, not a duration, so a long way round
 *  takes longer than a short one instead of both taking "one animation". */
const MS_PER_UNIT = 2.6;
const SHORTEST_LEG = 720;
const LONGEST_LEG = 2100;

/** How long the load sits on the junction before the robot sets off again, so
 *  the pickup is a beat of its own rather than something that happens while
 *  the machine is already leaving. */
const PICKUP_DWELL = 520;

/** Time the route takes to paint itself in. The robot waits it out — driving
 *  onto a road that is still being drawn reads as a bug, not as a lead. */
const PAVE = 460;

/** How far ahead and behind the tangent is sampled. Small enough to follow a
 *  corner, wide enough that floating point noise does not make the robot
 *  shiver on a straight. */
const TANGENT = 3;

/**
 * The width the plan is drawn from, and the one number this file shares with
 * CultureFloor.css — where the same width opens every rule that lays the blocks
 * onto the drawing. Change one and the other has to follow: a floor the
 * stylesheet has drawn but this file thinks is absent gets no robot on it.
 *
 * It is 72rem rather than the 64rem the rest of the site breaks at, and the
 * reason is the paragraph. It is read on the floor now, in a bay that is a
 * fixed fraction of the plan's width, and below about this width the longest of
 * the eight cannot be set in that bay at a size anybody would want to read.
 * Under it the section is a plain list, which answers the same question in one
 * tap and sets the answer at full size.
 */
const PLAN_FROM = "(min-width: 72rem)";

/** Anything past this and the machine turns before it sets off rather than
 *  snapping to the new heading in one frame. */
const PIVOT_FROM = 12;

/** Milliseconds per degree of a turn on the spot. */
const MS_PER_DEGREE = 2.4;
const SHORTEST_PIVOT = 200;

type Leg =
  | {
      kind: "drive";
      d: string;
      /** Held still for this long once the leg is done. */
      dwell?: number;
      onArrive?: () => void;
    }
  /** A turn on the spot, which is how a machine on two driven wheels changes
   *  its mind. Never queued by hand: a drive whose road sets off in a
   *  different direction to the one the robot is facing puts one in front of
   *  itself, so nothing that asks for a journey has to think about heading. */
  | { kind: "turn"; to: number };

/** Where the robot will be standing once everything queued has been driven —
 *  not where it is now. Every decision about the next leg is made from here,
 *  which is what lets the reader press three things in a row and get one
 *  continuous run rather than three fights over the same machine. */
type Resting =
  | { at: "station"; index: number }
  | { at: "junction" }
  | { at: "dock"; index: number };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** The same turn, expressed as the shorter way round. */
const shortWay = (degrees: number) => {
  const wrapped = ((degrees + 180) % 360 + 360) % 360 - 180;
  return wrapped;
};

/** Which way the road is running at a point on it, in degrees. Sampled either
 *  side rather than forwards only, so a heading taken mid-corner is the
 *  average of the turn and not one frame of it. */
const headingAt = (path: SVGPathElement, at: number, length: number) => {
  const ahead = path.getPointAtLength(Math.min(length, at + TANGENT));
  const behind = path.getPointAtLength(Math.max(0, at - TANGENT));
  return (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;
};

/**
 * A trapezoidal speed profile: accelerate, cruise, brake.
 *
 * Returns distance covered, 0..1, for time 0..1. An ease-in-out would have the
 * robot at its fastest for one instant in the middle of every leg, which is a
 * ball being thrown. This holds a flat speed through the long middle of a run
 * and only ramps at the ends, which is a vehicle.
 */
const drive = (t: number, up = 0.22, downRamp = 0.22) => {
  const area = 1 - up / 2 - downRamp / 2;
  if (t < up) return t * t / (2 * up) / area;
  if (t < 1 - downRamp) return (t - up / 2) / area;
  const left = 1 - t;
  return (area - (left * left) / (2 * downRamp)) / area;
};

/**
 * Every road on the floor, drawn three times over.
 *
 * All the kerbs, then all the surfaces, then all the lane markings — in that
 * order and never road by road. Kerbs and surface are how you get an edge on a
 * stroke, and a road painted complete before the next one starts would lay its
 * kerb straight across the middle of the one beside it. Drawn in passes, the
 * kerbs of two roads that meet are one outline and every crossing comes out a
 * plain T.
 *
 * The first two passes carry pathLength={1} so the paving animation is a dash
 * of the whole length whatever length that is. The lane markings cannot:
 * their dashes are a real measurement, and normalising the path would stretch
 * them to whatever this particular road happened to be.
 */
function Roads({ paths }: { paths: string[] }) {
  const paving = (index: number) => ({ animationDelay: `${index * 70}ms` });
  return (
    <g className="amr-road">
      {paths.map((d, index) => (
        <path
          key={`kerb-${index}`}
          className="amr-road__kerb"
          pathLength={1}
          d={d}
          style={paving(index)}
        />
      ))}
      {paths.map((d, index) => (
        <path
          key={`top-${index}`}
          className="amr-road__top"
          pathLength={1}
          d={d}
          style={paving(index)}
        />
      ))}
      {paths.map((d, index) => (
        <path
          key={`lane-${index}`}
          className="amr-road__lane"
          d={d}
          style={paving(index)}
        />
      ))}
    </g>
  );
}

export function CultureFloor() {
  const [group, setGroup] = useState(0);
  const [pillar, setPillar] = useState<number | null>(null);
  const [carrying, setCarrying] = useState(false);
  const [moving, setMoving] = useState(false);
  const [delivered, setDelivered] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<SVGGElement>(null);
  /** Never painted. It exists so the browser will measure a route for us:
   *  getPointAtLength is the only thing that can put a robot on a curve and
   *  tell us which way it is pointing when it gets there. */
  const rulerRef = useRef<SVGPathElement>(null);

  const groupRef = useRef(0);
  const queueRef = useRef<Leg[]>([]);
  const restingRef = useRef<Resting>({ at: "station", index: 0 });
  const runningRef = useRef(false);
  const pendingRef = useRef(false);
  /** Set the first time the reader presses anything, and only ever read by the
   *  automatic first run — which must not overrule a choice already made. */
  const touchedRef = useRef(false);
  const frameIdRef = useRef(0);
  const timerRef = useRef(0);

  // Both read at the moment of a click rather than rendered, so neither costs a
  // re-render: they only decide whether there is a journey or a jump.
  const reducedRef = useRef(false);
  const desktopRef = useRef(true);
  const instant = useCallback(
    () => reducedRef.current || !desktopRef.current,
    [],
  );

  /** The last pose written. Read back when a leg needs to know which way the
   *  machine is already facing. */
  const poseRef = useRef<Pose>(stationPose(0));

  const place = useCallback((pose: Pose) => {
    poseRef.current = pose;
    botRef.current?.setAttribute(
      "transform",
      `translate(${pose.x} ${pose.y}) rotate(${pose.angle})`,
    );
  }, []);

  /** Puts the robot wherever the queue says it has ended up. Used when the
   *  layout changes under it, and when a run is cut short. */
  const settle = useCallback(() => {
    const resting = restingRef.current;
    const count = PILLAR_GROUPS[groupRef.current].pillars.length;
    if (resting.at === "station") place(stationPose(resting.index));
    else if (resting.at === "dock") place(dockPose(resting.index, count));
    else place(junctionPose);
  }, [place]);

  const halt = useCallback(() => {
    if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
    frameIdRef.current = 0;
    timerRef.current = 0;
    queueRef.current = [];
    runningRef.current = false;
    pendingRef.current = false;
    setMoving(false);
  }, []);

  /** How a leg reaches for the next one. A queue that drives itself has to be
   *  able to call itself, and a callback cannot name itself while it is still
   *  being declared — so the recursion goes through a ref, set below. */
  const pumpRef = useRef<() => void>(() => {});

  /** Turns on the spot, then hands back to the queue. */
  const pivot = useCallback(
    (to: number) => {
      const { x, y, angle } = poseRef.current;
      const duration = Math.max(
        SHORTEST_PIVOT,
        Math.abs(to - angle) * MS_PER_DEGREE,
      );
      runningRef.current = true;
      setMoving(true);
      const started = performance.now();

      const step = (now: number) => {
        const t = clamp01((now - started) / duration);
        place({ x, y, angle: angle + (to - angle) * smoothstep(t) });
        if (t < 1) {
          frameIdRef.current = requestAnimationFrame(step);
          return;
        }
        runningRef.current = false;
        pumpRef.current();
      };

      frameIdRef.current = requestAnimationFrame(step);
    },
    [place],
  );

  /** Drives whatever is in the queue, one leg after another, and stops when it
   *  runs out. Nothing else starts an animation. */
  const pump = useCallback(() => {
    if (runningRef.current || pendingRef.current) return;

    const next = queueRef.current.shift();
    const ruler = rulerRef.current;
    if (!next || !ruler) {
      runningRef.current = false;
      setMoving(false);
      return;
    }

    if (next.kind === "turn") {
      pivot(next.to);
      return;
    }

    ruler.setAttribute("d", next.d);
    const length = ruler.getTotalLength();

    // Face the road before driving it. A machine that changed heading in one
    // frame every time it left a dock would be teleporting, not turning.
    const swing = shortWay(headingAt(ruler, 0, length) - poseRef.current.angle);
    if (Math.abs(swing) > PIVOT_FROM) {
      queueRef.current.unshift(next);
      pivot(poseRef.current.angle + swing);
      return;
    }

    const duration = Math.min(
      LONGEST_LEG,
      Math.max(SHORTEST_LEG, length * MS_PER_UNIT),
    );

    runningRef.current = true;
    setMoving(true);
    const started = performance.now();

    const step = (now: number) => {
      const t = clamp01((now - started) / duration);
      const at = drive(t) * length;
      const here = ruler.getPointAtLength(at);
      place({ x: here.x, y: here.y, angle: headingAt(ruler, at, length) });

      if (t < 1) {
        frameIdRef.current = requestAnimationFrame(step);
        return;
      }

      next.onArrive?.();
      runningRef.current = false;
      if (next.dwell) {
        setMoving(false);
        timerRef.current = window.setTimeout(() => {
          timerRef.current = 0;
          pumpRef.current();
        }, next.dwell);
        return;
      }
      pumpRef.current();
    };

    frameIdRef.current = requestAnimationFrame(step);
  }, [pivot, place]);

  useEffect(() => {
    pumpRef.current = pump;
  }, [pump]);

  /**
   * A heading is chosen: the floor is relaid and the robot drives the trunk.
   *
   * `cut` is off for the run the section starts by itself, where the robot is
   * already standing at the station and simply sets off. Everywhere else the
   * machine is somewhere else on the floor when the heading changes, and a
   * fade to the new start reads as a new run beginning rather than as a robot
   * teleporting mid-journey.
   */
  const beginRun = useCallback(
    (index: number, cut = true) => {
      halt();
      groupRef.current = index;
      setGroup(index);
      setPillar(null);
      setDelivered(false);
      setCarrying(false);
      restingRef.current = { at: "junction" };

      if (instant()) {
        place(junctionPose);
        setCarrying(true);
        return;
      }

      place(stationPose(index));
      if (cut) {
        botRef.current?.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          { duration: 260, easing: "ease-out" },
        );
      }

      // The road is drawn before it is driven. Queued rather than started, so a
      // reader who picks a pillar during the wait is not ignored: the trunk is
      // put in front of whatever they asked for and both are driven in order.
      const trunk: Leg = {
        kind: "drive",
        d: trunkPath(index),
        dwell: PICKUP_DWELL,
        onArrive: () => setCarrying(true),
      };
      pendingRef.current = true;
      timerRef.current = window.setTimeout(
        () => {
          timerRef.current = 0;
          pendingRef.current = false;
          queueRef.current.unshift(trunk);
          pump();
        },
        cut ? PAVE : 0,
      );
    },
    [halt, instant, place, pump],
  );

  /**
   * A pillar is chosen: the robot carries the load out to that dock.
   *
   * Every case is decided from where the robot will be when the queue drains,
   * never from where it is at this instant — so a second choice made mid-run
   * queues behind the first instead of snatching the machine off the road.
   */
  const choosePillar = useCallback(
    (index: number) => {
      const count = PILLAR_GROUPS[groupRef.current].pillars.length;
      const resting = restingRef.current;
      if (resting.at === "dock" && resting.index === index) return;

      setPillar(index);
      setDelivered(false);

      if (instant()) {
        halt();
        place(dockPose(index, count));
        restingRef.current = { at: "dock", index };
        setCarrying(true);
        setDelivered(true);
        return;
      }

      // Only when this is still the stop being asked for. Press two in a row
      // and the first leg still lands — but it lands somewhere nobody is
      // waiting on any more, and it must not open the panel on its way past.
      const arrive = () => {
        const now = restingRef.current;
        if (now.at === "dock" && now.index === index) setDelivered(true);
      };

      const legs: Leg[] = [];
      if (resting.at === "dock") {
        // Along the lower aisle, dock to dock. The load is already aboard and
        // the junction has nothing to add to the trip.
        legs.push({
          kind: "drive",
          d: dockToDockPath(resting.index, index, count),
          onArrive: arrive,
        });
      } else {
        // Straight from a station: the reader skipped the heading and went for
        // the pillar, so the run they skipped is driven for them.
        if (resting.at === "station") {
          legs.push({
            kind: "drive",
            d: trunkPath(resting.index),
            dwell: PICKUP_DWELL,
            onArrive: () => setCarrying(true),
          });
        }
        legs.push({
          kind: "drive",
          d: branchPath(index, count),
          onArrive: arrive,
        });
      }

      restingRef.current = { at: "dock", index };
      queueRef.current.push(...legs);
      pump();
    },
    [halt, instant, place, pump],
  );

  // --- Wiring ---------------------------------------------------------------

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia(PLAN_FROM);

    const onChange = () => {
      reducedRef.current = motion.matches;
      desktopRef.current = wide.matches;
      // The plan appears, disappears or stops animating under the robot; put it
      // back where the queue says it stands, whichever layout it lands in.
      halt();
      settle();
    };

    reducedRef.current = motion.matches;
    desktopRef.current = wide.matches;
    settle();

    motion.addEventListener("change", onChange);
    wide.addEventListener("change", onChange);
    return () => {
      motion.removeEventListener("change", onChange);
      wide.removeEventListener("change", onChange);
    };
  }, [halt, settle]);

  // The first run is not asked for. The section is a diagram until something
  // moves on it, so the moment it is properly in view the robot drives the
  // first heading itself — once, and never again.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          if (!instant() && !touchedRef.current) beginRun(0, false);
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(frame);
    return () => observer.disconnect();
  }, [beginRun, instant]);

  useEffect(() => halt, [halt]);

  // --- Pressed --------------------------------------------------------------

  const stationRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dockRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const pickStation = (index: number) => {
    touchedRef.current = true;
    beginRun(index);
  };

  const pickDock = (index: number) => {
    touchedRef.current = true;
    choosePillar(index);
  };

  const arrows = (
    event: React.KeyboardEvent,
    current: number,
    count: number,
    refs: React.RefObject<(HTMLButtonElement | null)[]>,
    choose: (index: number) => void,
  ) => {
    const go = (next: number) => {
      event.preventDefault();
      const wrapped = (next + count) % count;
      choose(wrapped);
      refs.current[wrapped]?.focus();
    };
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        go(current + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        go(current - 1);
        break;
      case "Home":
        go(0);
        break;
      case "End":
        go(count - 1);
        break;
    }
  };

  // --- What it says ---------------------------------------------------------

  const active = PILLAR_GROUPS[group];
  const pillars = active.pillars;
  const lanes = dockLanes(pillars.length);
  const chosen = pillar === null ? null : pillars[pillar];

  const status = !carrying
    ? moving
      ? "En route to the junction"
      : `Standing by at ${active.name}`
    : chosen
      ? delivered
        ? `Unloaded at ${chosen.name}`
        : `Carrying to ${chosen.name}`
      : "Loaded at the junction";

  return (
    <div
      className="amr-floor"
      data-moving={moving}
      data-carrying={carrying}
      data-lit={delivered && chosen !== null}
    >
      <div
        ref={frameRef}
        className="amr-floor__frame"
        style={
          {
            "--floor-ratio": `${FLOOR.width} / ${FLOOR.height}`,
          } as React.CSSProperties
        }
      >
        {/* --- The plan ----------------------------------------------------
            Decoration in the accessibility sense — every word on it is also a
            button in the layer above, and the state it draws is announced in
            the status line at the foot of the frame. */}
        <svg
          className="amr-floor__map"
          viewBox={`0 0 ${FLOOR.width} ${FLOOR.height}`}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <pattern
              id="amr-tiles"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path className="amr-floor__tile" d="M40 0H0V40" />
            </pattern>

            <linearGradient id="amr-shell" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffdc6b" />
              <stop offset="1" stopColor="#eda40c" />
            </linearGradient>

            <linearGradient id="amr-carton" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#e0b689" />
              <stop offset="1" stopColor="#b58553" />
            </linearGradient>

            <radialGradient id="amr-cast">
              <stop offset="0" stopColor="#0f172a" stopOpacity="0.3" />
              <stop offset="1" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>

            {/* Anchored on the sensor rather than on the wedge's own box, so
                the sweep fades outwards from the turret it comes out of. */}
            <radialGradient
              id="amr-beam"
              gradientUnits="userSpaceOnUse"
              cx="0"
              cy="0"
              r="36"
            >
              <stop className="amr__beam-near" offset="0" />
              <stop className="amr__beam-far" offset="1" />
            </radialGradient>
          </defs>

          <rect
            className="amr-floor__tiles"
            width={FLOOR.width}
            height={FLOOR.height}
            fill="url(#amr-tiles)"
          />

          {/* The line the three headings stand on. */}
          <path
            className="amr-floor__aisle"
            d={`M ${AISLE.from} ${AISLE.y} H ${AISLE.to}`}
          />

          {/* Keyed on the heading, so React rebuilds the roads when it changes
              and the paving animation runs again on the new route rather than
              the old one silently swapping its own shape. */}
          <Roads
            key={`roads-${group}`}
            paths={[trunkPath(group), ...roadNetwork(pillars.length)]}
          />

          {/* The junction. The ring only flares when something is picked up
              here, which is the one event on the floor with no block of its
              own to light up. */}
          <g className="amr-floor__junction">
            <circle
              className="amr-floor__junction-ring"
              cx={JUNCTION.x}
              cy={JUNCTION.y}
              r={JUNCTION.radius}
            />
            <circle
              className="amr-floor__junction-pad"
              cx={JUNCTION.x}
              cy={JUNCTION.y}
              r={JUNCTION.radius}
            />
            <circle
              className="amr-floor__junction-pip"
              cx={JUNCTION.x}
              cy={JUNCTION.y}
              r="5"
            />
          </g>

          {/* --- The projector -------------------------------------------
              Stood in the corridor between the stops and the screen, facing
              right. The beam stops at the near edge of the lit rectangle
              rather than crossing it: the screen is where the light lands, and
              a wash drawn over the top of it would be a wash between the
              reader and the words.

              It does not move with the heading any more, because the screen
              does not either. Every road on this plan is on the left of the
              floor, so the right of it is clear whatever is chosen. */}
          <g className="amr-lamp">
            <polygon className="amr-lamp__beam" points={beam()} />
            <g transform={`translate(${PROJECTOR.x} ${PROJECTOR.y})`}>
              <ellipse className="amr-lamp__cast" cx="0" cy="1" rx="17" ry="14" />
              <rect
                className="amr-lamp__body"
                x="-13"
                y="-10"
                width="22"
                height="20"
                rx="4"
              />
              <path className="amr-lamp__vent" d="M-8 -5h10M-8 0h10M-8 5h10" />
              <circle className="amr-lamp__barrel" cx="11" cy="0" r="6" />
              <circle className="amr-lamp__lens" cx="11" cy="0" r="3" />
            </g>
          </g>

          {/* Measured, never drawn. */}
          <path ref={rulerRef} className="amr-floor__ruler" d="M0 0" />

          {/* --- The machine ---------------------------------------------
              Drawn nose-first along +x and rotated to whatever heading the
              route gives it, so nothing in here has to know about the floor.
              Everything is on the same 1-unit-is-1-floor-unit scale as the
              roads: this is a plan, and a robot drawn to a different scale
              than its aisle is a picture of a different building. */}
          <g ref={botRef} className="amr" transform="translate(172 118) rotate(180)">
            <ellipse className="amr__cast" cx="1" cy="2" rx="34" ry="31" />

            {/* Drive wheels, proud of the skirt by a couple of units. Tucked
                fully underneath they read as two dark smudges on a dark band;
                standing out, they are the thing that says which axis this
                machine turns about. */}
            <rect className="amr__wheel" x="-10" y="-26" width="20" height="9" rx="2" />
            <rect className="amr__wheel" x="-10" y="17" width="20" height="9" rx="2" />

            <rect
              className="amr__bumper"
              x="-26"
              y="-23.5"
              width="52"
              height="47"
              rx="15"
            />
            <rect
              className="amr__shell"
              x="-22"
              y="-19.5"
              width="44"
              height="39"
              rx="12"
            />

            {/* Laser scanner, front corner, sweeping. The hull is invisible and
                exists only so the group's box is square about the turret —
                fill-box rotation turns about the centre of the box it is
                given, and a bare wedge would swing round its own middle. */}
            <g transform="translate(14 -12)">
              <g className="amr__sweep">
                <circle className="amr__sweep-hull" r="36" />
                <path className="amr__beam" d="M0 0 L34 -13 A36 36 0 0 1 34 13 Z" />
              </g>
              <circle className="amr__turret" r="5.5" />
              <circle className="amr__lens" r="2.4" />
            </g>

            {/* Second scanner on the opposite corner: between them they see all
                the way round, which is why real machines carry two. */}
            <g transform="translate(-14 12)">
              <circle className="amr__turret" r="4.4" />
              <circle className="amr__lens" r="1.9" />
            </g>

            <rect className="amr__deck" x="-15" y="-13" width="30" height="26" rx="6" />
            <rect className="amr__led" x="19.5" y="-11" width="3" height="22" rx="1.5" />

            {/* The load. Nothing until the junction, then a carton on the deck
                for the rest of the run.

                Smaller than the deck it sits on, and by some margin. A box that
                covers the machine is a box with wheels; leaving the shell,
                the scanners and the deck plate showing round it is what keeps
                this a robot that is carrying something. */}
            <g className="amr__load">
              <rect
                className="amr__load-cast"
                x="-10.5"
                y="-8.5"
                width="24"
                height="21"
                rx="1.5"
              />
              <rect
                className="amr__carton"
                x="-12"
                y="-10.5"
                width="24"
                height="21"
                rx="2"
              />
              <path className="amr__seam" d="M0 -10.5V10.5" />
              <rect className="amr__tape" x="-12" y="-2.75" width="24" height="5.5" />
              <rect className="amr__label" x="-9" y="-7.5" width="7" height="4.5" rx="0.8" />
            </g>
          </g>
        </svg>

        {/* --- The headings ------------------------------------------------- */}
        <div
          role="tablist"
          aria-label="What it is like to work here"
          aria-orientation="horizontal"
          className="amr-floor__stations"
          onKeyDown={(event) =>
            arrows(event, group, PILLAR_GROUPS.length, stationRefs, pickStation)
          }
        >
          {PILLAR_GROUPS.map((item, index) => {
            const selected = index === group;
            return (
              <button
                key={item.name}
                ref={(node) => {
                  stationRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`floor-tab-${index}`}
                aria-selected={selected}
                aria-controls={`floor-bay-${index}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => pickStation(index)}
                className="amr-floor__station"
                data-selected={selected}
                style={
                  {
                    "--x": across(STATION_X[index]),
                    "--y": down(AISLE.y),
                    "--w": across(STATION.width),
                    "--h": down(STATION.height),
                  } as React.CSSProperties
                }
              >
                <span className="amr-floor__station-name">{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* --- What that heading holds ---------------------------------------
            The panel for the heading tabs, and the tablist for the pillars,
            are the same element: choosing a heading changes nothing else. */}
        <div
          id={`floor-bay-${group}`}
          role="tabpanel"
          aria-labelledby={`floor-tab-${group}`}
          tabIndex={-1}
          className="amr-floor__bay"
        >
          <div
            role="tablist"
            aria-label={`${active.name} — what it means`}
            aria-orientation="horizontal"
            className="amr-floor__docks"
            onKeyDown={(event) =>
              arrows(event, pillar ?? 0, pillars.length, dockRefs, pickDock)
            }
          >
            {pillars.map((item, index) => {
              const selected = index === pillar;
              return (
                <button
                  key={`${active.name}-${item.name}`}
                  ref={(node) => {
                    dockRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`dock-tab-${index}`}
                  aria-selected={selected}
                  aria-controls="floor-detail"
                  tabIndex={selected || (pillar === null && index === 0) ? 0 : -1}
                  onClick={() => pickDock(index)}
                  className="amr-floor__dock"
                  data-selected={selected}
                  data-open={selected && delivered}
                  style={
                    {
                      "--x": across(DOCK.left),
                      "--y": down(lanes[index]),
                      "--w": across(DOCK.width),
                      "--h": down(DOCK.height),
                      "--i": index,
                    } as React.CSSProperties
                  }
                >
                  <span className="amr-floor__dock-name">
                    <CareerGlyph name={item.icon} className="amr-floor__dock-mark" />
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* --- What the light lands on --------------------------------------
            The paragraph, read on the floor of the bay the lamp is pointed at.
            It used to sit in a panel under the whole plan, which meant the
            answer arrived a screen away from the machine that fetched it —
            the delivery finished somewhere the reader was not looking.

            Below lg there is no bay and no lamp: the same element is simply
            the last block in the stack. */}
        <div
          id="floor-detail"
          role="tabpanel"
          aria-labelledby={chosen ? `dock-tab-${pillar}` : undefined}
          aria-label={chosen ? undefined : `${active.name} — what it means`}
          tabIndex={0}
          className="amr-floor__screen"
          data-lit={delivered && chosen !== null}
          style={
            {
              "--x": across(SCREEN.x),
              "--y": down(SCREEN.y),
              "--w": across(SCREEN.width),
              "--h": down(SCREEN.height),
            } as React.CSSProperties
          }
        >
          {chosen ? (
            <article
              key={`${active.name}-${chosen.name}`}
              className="amr-floor__detail"
              data-open={delivered}
            >
              <div className="amr-floor__detail-head">
                <span aria-hidden="true" className="amr-floor__detail-rule" />
                <p className="amr-floor__detail-group">{active.name}</p>
              </div>
              <h3 className="amr-floor__detail-name">{chosen.name}</h3>
              <p className="amr-floor__detail-body">{chosen.body}</p>
            </article>
          ) : (
            <p className="amr-floor__hint">Pick a heading</p>
          )}
        </div>

        <p className="amr-floor__status" aria-live="polite">
          <span className="amr-floor__status-dot" aria-hidden="true" />
          {status}
        </p>
      </div>
    </div>
  );
}
