"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { COMMUNITY_SCENES } from "@/lib/community";
import { cn } from "@/lib/cn";
import { MediaSlot } from "./MediaSlot";
import "./CommunityGlobe.css";

/**
 * The globe, and the three scenes that come over its horizon.
 *
 * A tall runway with a sticky frame inside it — the same shape the values board
 * on the company page uses — so the stage holds the screen while the page
 * scrolls past it. What is different here is what the held screen does with the
 * scroll it is absorbing: the page stops, and the world turns instead.
 *
 * Two layouts, and they are not variations on each other:
 *
 *   The opening scene is the world at the size of the screen. The globe is as
 *   wide as the stage is tall, its top sits just under the header, and it runs
 *   off the bottom edge — you are close to it. Nothing else is on that screen:
 *   no frames, no field behind it, no type.
 *
 *   Each visit is a room. It has a field of its own behind everything; the
 *   close-up sits along the bottom with its cut edge flush to the floor of the
 *   frame, so it reads as ground rather than as a ball; the scene's clip hangs
 *   at the centre with a beam of light thrown onto it; and six photographs run
 *   down the two flanks — hard against the edges of the window and cut by them,
 *   so the screen reads as a wall of them continuing past the frame.
 *
 * The runway is a list of segments rather than equal beats, because two quite
 * different things happen on it and they do not want the same amount of room:
 *
 *   reel — the scene holds while its two flanks travel upward, far enough that
 *          the frames cut off at the bottom come fully into view. On the
 *          opening scene there is nothing to travel, so the globe turns one
 *          full revolution instead and the stretch reads as "the page has
 *          stopped" rather than as a page that has failed to move.
 *   hand — the scene is carried off to the left and the next rides in from the
 *          right, both along the curve of the sphere.
 *
 * Four reels and three handovers, so the last scene is not pushed off the stage
 * by nothing. Equal beats would either strand it or leave a dead stretch of
 * runway at the end; see SEGMENTS.
 *
 * The movement is circular because of where the rotation happens rather than
 * because of any path written out here. Every globe is pinned at the *centre of
 * its own sphere* — see the note at the top of CommunityGlobe.css — so one
 * angle is all it takes: the artwork swings about the sphere's axis, and the
 * figure standing on top travels along the limb. The orbit translation on top
 * of that is what carries a scene off the stage once it has been read, on a
 * path that falls away as it goes rather than sliding flat.
 *
 * Everything is driven from one rAF loop reading one rectangle, and written
 * straight to the DOM rather than through state: this recomputes on every
 * scroll event, and a React render per frame is how a page like this starts
 * dropping them.
 */

const SCENES = COMMUNITY_SCENES.length;

/** Photographs down each flank. */
const PER_FLANK = 3;

/**
 * How the runway is divided.
 *
 * A reel run is worth nearly twice a handover: six frames have to be looked at,
 * and a globe crossing the frame does not. Weights rather than absolute heights
 * so the section's own height is the only thing that sets the pace.
 */
const REEL_WEIGHT = 0.85;
const HANDOVER_WEIGHT = 0.45;

/**
 * The opening reel, which is the odd one out: the world turning on the spot
 * before anything has arrived to look at.
 *
 * A third of an ordinary reel, because there is nothing to read here. The other
 * three carry six photographs apiece that have to travel far enough to be seen;
 * this one carries a single revolution, and a revolution stretched over most of
 * a screen of scrolling reads as a page that has jammed rather than as a world
 * turning. At the section heights below it comes to roughly 23vh — one flick of
 * the wheel, two at most, and the turn is done.
 */
const OPEN_WEIGHT = 0.3;

/**
 * The opening handover, which is not a handover at all but the set piece the
 * whole section opens on: the camera flies into the globe, passes through its
 * surface, and the next world swings in around the viewer.
 *
 * Three times an ordinary swap, because it is doing three times as much. It was
 * twice that to begin with, on the reasoning that each of its five beats wanted
 * room to be read rather than glimpsed — but a set piece that takes two screens
 * of scrolling to get through stops feeling cinematic somewhere in the middle
 * and starts feeling like a page that will not let go. At the heights below it
 * is about 100vh: every beat still lands, none of them outstays.
 */
const HERO_WEIGHT = 1.35;

type Segment = {
  kind: "reel" | "hand";
  /** The scene holding the stage. On a handover it is the one leaving. */
  scene: number;
  start: number;
  end: number;
};

/**
 * reel 0 → hand 0 → reel 1 → hand 1 → reel 2 → hand 2 → reel 3, as fractions of
 * the runway. Built once at module scope: it depends on nothing but the scene
 * count.
 */
const SEGMENTS: Segment[] = (() => {
  const parts: Array<Omit<Segment, "start" | "end"> & { weight: number }> = [];
  for (let i = 0; i < SCENES; i++) {
    parts.push({
      kind: "reel",
      scene: i,
      weight: i === 0 ? OPEN_WEIGHT : REEL_WEIGHT,
    });
    if (i < SCENES - 1) {
      parts.push({
        kind: "hand",
        scene: i,
        weight: i === 0 ? HERO_WEIGHT : HANDOVER_WEIGHT,
      });
    }
  }
  const total = parts.reduce((sum, part) => sum + part.weight, 0);
  let at = 0;
  return parts.map((part) => {
    const start = at / total;
    at += part.weight;
    return { kind: part.kind, scene: part.scene, start, end: at / total };
  });
})();

/**
 * How far around the sphere a scene travels between arriving and centre stage,
 * in degrees.
 *
 * This is the number that decides how curved the movement looks. The path a
 * scene takes drops by tan(SWEEP / 2) of its own sideways travel, so 36° falls
 * about a third of the distance it crosses — plainly an arc, without tipping
 * the artwork so far that the horizon inside it reads as crooked on the way in.
 */
const SWEEP = 36;

/**
 * Radius of that orbit, as a multiple of the window's width.
 *
 * Squeezed between two limits, and it sits deliberately near the low one.
 *
 * The floor: the outgoing scene and the incoming one must never touch. They are
 * the same globe at two different angles, and its surface has enough drawn on
 * it that an overlap would read as a double exposure rather than as a
 * crossfade.
 *
 * The ceiling is loose — almost any radius above the floor gets a scene off the
 * stage in time. What decides the value is what the middle of a handover looks
 * like: wide radii throw both scenes so far out that the stage is empty at the
 * halfway point, and a reader who stops scrolling exactly there is looking at
 * nothing.
 */
const ORBIT = 1.45;

/**
 * How far into its sweep a scene is fully opaque, as a fraction of the whole.
 *
 * Deliberately early. A scene that finishes fading in only once it is centred
 * has done its travelling invisibly, and the travelling is the thing worth
 * watching.
 */
const HOLD = 0.4;

/** Revolutions the opening globe makes while its segment runs. */
const TURNS = 1;

/**
 * How much bigger the opening world is by the end of its turn.
 *
 * The world does not sit still and spin — it comes closer while it spins, and
 * keeps coming. This is the first stretch of one continuous approach rather
 * than a separate move: the set piece's own zoom picks up from exactly this
 * number (see APPROACH's first point), so there is no seam where the turn ends
 * and the camera starts.
 *
 * Small, because it is spread over a short segment and the point is that it is
 * barely perceptible as movement — the reader should notice that the world is
 * nearer, not watch it grow.
 *
 * Taken about the sphere's *crown*, not its centre, like everything else in
 * this sequence: the figures are standing up there, and scaling about the
 * middle would carry them up under the header while the reader is looking at
 * them.
 */
const OPEN_ZOOM = 1.15;

/* --- The opening set piece -----------------------------------------------
   One continuous camera move, not a transition between two pictures: the world
   turns on its axis, the camera closes on the point the figure is standing on,
   the surface swallows the frame, and the next world swings in around the
   viewer from the right.

   The whole thing is driven by one number — how far through the hero segment
   the reader has scrolled — and every value below is a curve read off that.
   Nothing here is on a timer, so scrolling back up runs it exactly backwards.

   Why the camera can fly *into* the figure at all: the drawing puts the elderly
   man at the very top of the globe, and the scene he arrives in is a close-up
   of that same spot. So the approach is aimed at the sphere's crown rather than
   its middle, and the two scenes are the same place at two distances. That is
   the join the whole effect rests on.
-------------------------------------------------------------------------- */

/**
 * Where the camera has got to, as scale, against progress through the hero.
 *
 * Starts at OPEN_ZOOM rather than at 1: the turn before this one has already
 * brought the world that much closer, and starting from 1 here would snap it
 * back to arm's length the instant the reader crossed into the set piece.
 */
const APPROACH: Array<[number, number]> = [
  [0, OPEN_ZOOM],
  [0.15, 1.24],
  [0.25, 1.4],
  [0.45, 2.6],
  [0.62, 5],
  [0.78, 9],
];

/* --- The sky, on the way in ----------------------------------------------
   The starfield grows too, and the gap between how fast it grows and how fast
   the world does is the whole of the effect.

   A camera moving forward enlarges everything in front of it, but not equally:
   the near thing races outward and the far thing barely stirs. That difference
   is the only cue a flat screen has for depth of movement — hold the background
   still while the world swells and the world reads as a picture being zoomed;
   move them together at one rate and the whole frame reads as a zoom. Let the
   sky creep while the world races and the camera is travelling.

   So these numbers are deliberately small against the world's. By the time the
   drawing has given the frame over to the surface it is at nine times its size
   and the sky is at half again — a twelfth of the growth, which is what puts
   the stars a long way behind the planet.

   This does not contradict the note in app/community/community.css about the
   sky being fixed. That is about *scroll* parallax — a sky sliding up the
   window as the page moves, which would say the reader is travelling past the
   scene. This says they are travelling into it.
-------------------------------------------------------------------------- */

/** Where the opening turn leaves the sky, against the world's OPEN_ZOOM. */
const SKY_OPEN = 1.05;

/**
 * The sky's own approach, against progress through the hero segment.
 *
 * It picks up from SKY_OPEN for the same reason APPROACH picks up from
 * OPEN_ZOOM — the turn has already moved it and starting from 1 would snap it
 * back — and it is released to 1 at the end.
 *
 * That release is not a cheat. It happens between SHELL_FULL and EARTH_OUT,
 * which is precisely the stretch where the surface is at full opacity across
 * the whole frame: the sky is not on screen to be seen resetting, and it has to
 * reset, because what comes out the other side is a different place and a sky
 * still held at half again would have the reader emerge into a starfield that
 * had been enlarged for no reason they could see.
 */
const SKY_APPROACH: Array<[number, number]> = [
  [0, SKY_OPEN],
  [0.25, 1.1],
  [0.45, 1.2],
  [0.62, 1.34],
  [0.72, 1.5],
  [0.78, 1],
];

/** Degrees the globe turns about its own vertical axis on the way in. */
const TURN = 15;
/** How far the camera is from the plane, in px. Shallower reads as wide-angle. */
const PERSPECTIVE = 1400;

/** Beats of the hero segment, as fractions of it. */
const TURN_END = 0.2;
/** By here the crown of the globe has drifted to the middle of the frame. */
const FOCUS_END = 0.45;
/* The surface takes the frame over from the drawing, holds while we are inside
   it, and is gone before the next world is readable.

   That last part is the one that had to be tuned rather than guessed. The first
   arrangement had the surface still at half strength while the next scene was
   arriving, on the theory that coming through it would read as emerging. It did
   not — it read as a green veil laid over the finished composition. The two
   overlap by a hair now: the world behind is barely there while the surface is
   still clearing, and everything worth looking at happens after it has gone. */
const SHELL_IN = 0.58;
const SHELL_FULL = 0.72;
/** The drawing is gone; we are inside. */
const EARTH_OUT = 0.76;
/** We come out the other side. */
const SHELL_OUT = 0.84;
/** The next world starts its swing in. */
const ARRIVE_FROM = 0.76;
/** ...and is fully present by here, leaving the last of the segment to settle. */
const ARRIVE_TO = 0.95;

/** The arc the next world travels: degrees, and the ellipse it rides. */
const ARRIVE_SWEEP = 22;
const ARRIVE_RX = 2.8;
const ARRIVE_RY = 1.4;
/** How small it starts, before it has come round to face the viewer. */
const ARRIVE_SCALE = 0.7;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/* --- Falling into the scene ----------------------------------------------
   The field a scene stands in does not travel with it. It arrives in place and
   the rest of the scene drops into it — which is a different thing from the
   globe's arc, and deliberately so: the globe swings in because it is a world
   coming round, and the screen falls because it is an object with weight.

   The curve is the real one. A body released from rest covers ground in
   proportion to the *square* of the time, so the drop starts imperceptibly and
   arrives fast; the eased curves used everywhere else in this file do the exact
   opposite and read as a thing being placed rather than dropped. What follows
   the landing is a rebound of about a fourteenth of the drop, then a much
   smaller one, both squared away — which is what a solid object does when it
   lands and is the part that sells the weight.
-------------------------------------------------------------------------- */

/** Where in the fall the object first touches down. The rest is the bounce. */
const FALL_LAND = 0.78;
/** How far above its resting place the drop starts, as a fraction of the deck. */
const FALL_HEIGHT = 0.92;
/** The field is that much larger while it is arriving, and settles back to 1. */
const FIELD_PUSH = 0.07;

/**
 * How far above its resting place a falling object is, from 1 (released) to 0
 * (landed and still).
 */
function fall(t: number): number {
  if (t <= 0) return 1;
  if (t >= 1) return 0;
  if (t < FALL_LAND) {
    const k = t / FALL_LAND;
    return 1 - k * k;
  }
  const k = (t - FALL_LAND) / (1 - FALL_LAND);
  return Math.abs(Math.sin(2 * Math.PI * k)) * 0.075 * (1 - k) * (1 - k);
}

/**
 * Reads a value off a list of [progress, value] checkpoints.
 *
 * Between two checkpoints the value is eased rather than run straight, so the
 * approach accelerates and settles instead of stepping between the numbers the
 * curve was specified with.
 */
function curve(points: Array<[number, number]>, p: number): number {
  if (p <= points[0][0]) return points[0][1];
  const last = points[points.length - 1];
  if (p >= last[0]) return last[1];
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    if (p <= x1) return y0 + (y1 - y0) * smoothstep((p - x0) / (x1 - x0));
  }
  return last[1];
}

/**
 * The angle each photograph is pinned up at.
 *
 * A fixed pattern rather than Math.random, so the page looks the same on every
 * visit and the server and the client agree on it.
 */
const TILTS = [-9, 7, -12, 10, -7, 12];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
/** Eases both ends, so nothing here leaps away or stops dead. */
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * The sequence with the scrolling taken out: four drawings, four captions, read
 * straight down.
 *
 * Rendered twice, and never both at once. Once for a reader who has asked for
 * less motion, where it is the whole section — and once inside a <noscript>
 * under the runway, because without JavaScript there is nothing to advance the
 * held stage and it would otherwise be several screens of the same picture.
 *
 * This is also the only place the scene names and lines appear at all, the
 * moving stage having no type on it. That is not a downgrade: a reader who
 * cannot use the animation gets *more* here, not less.
 */
function PlainReading() {
  return (
    <ul className="mx-auto max-w-md space-y-14">
      {COMMUNITY_SCENES.map((scene) => (
        <li key={scene.slug} className="text-center">
          <Image
            src={scene.src}
            alt={scene.alt}
            width={scene.width}
            height={scene.height}
            sizes="(min-width: 28rem) 28rem, 100vw"
            className="community-globe__still-art"
          />
          <h3 className="community-globe__name mt-6">{scene.name}</h3>
          <p className="community-globe__line">{scene.line}</p>
        </li>
      ))}
    </ul>
  );
}

export function CommunityGlobe() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);

  // Set after mount, so the server and the first client render agree.
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
    const stage = stageRef.current;
    const deck = deckRef.current;
    if (!section || !stage || !deck) return;

    const sets = Array.from(section.querySelectorAll<HTMLElement>("[data-set]"));
    if (sets.length !== SCENES) return;

    // Looked up per set rather than as one flat list: the opening scene has no
    // flanks at all, so an index into a flat list would be off by two for every
    // scene after it.
    const parts = sets.map((set) => ({
      set,
      scene: set.querySelector<HTMLElement>("[data-scene]"),
      field: set.querySelector<HTMLElement>("[data-field]"),
      drop: set.querySelector<HTMLElement>("[data-drop]"),
      tracks: Array.from(set.querySelectorAll<HTMLElement>("[data-track]")),
    }));

    const tunnel = section.querySelector<HTMLElement>("[data-tunnel]");

    /* The page's own sky, which belongs to the route rather than to this
       section — so it is asked for rather than assumed, and everything here
       still runs if the page does not offer one. */
    const sky =
      section
        .closest(".community-page")
        ?.querySelector<HTMLElement>("[data-sky]") ?? null;

    /* Measured, not assumed. The set piece has to aim the camera at the crown
       of the globe, which means knowing where the sphere's centre sits and how
       big it is — both of which come from the stylesheet and change with the
       window. Read once here and again on resize rather than per frame, since
       getComputedStyle forces a style recalculation.

       offsetWidth rather than getBoundingClientRect: the scene is under a
       transform for most of this, and the rect would report the scaled width
       and feed the measurement back into itself. */
    let worldAnchor = 0;
    let worldRadius = 0;
    /** 1 on a desktop, less on smaller screens — see the note on RESPONSIVE. */
    let depth = 1;

    const measure = () => {
      const world = parts[0].scene;
      if (!world) return;
      const style = getComputedStyle(world);
      worldAnchor = parseFloat(style.top) || 0;
      const artW = parseFloat(style.getPropertyValue("--art-w")) || 1.375;
      const art = world.querySelector("img");
      worldRadius = art ? art.offsetWidth / artW / 2 : 0;

      // The approach is a long move toward the viewer, and on a small screen a
      // long move toward the viewer is mostly a blur. Shortening the distance
      // keeps every beat — turn, approach, surface, arrival — while spending
      // less of it at scales where the drawing has stopped being a drawing.
      const w = window.innerWidth;
      depth = w >= 1024 ? 1 : w >= 640 ? 0.62 : 0.42;
    };

    let frame = 0;

    const update = () => {
      frame = 0;

      const rect = section.getBoundingClientRect();
      // What is left of the section once the sticky frame has taken its screen:
      // the distance the page travels while the stage is pinned.
      const runway = rect.height - stage.offsetHeight;
      if (runway <= 0) return;

      const progress = clamp01(-rect.top / runway);

      // Which segment the reader is in. Four scenes make seven of them, so a
      // scan is cheaper than any structure that could index it.
      let segment = SEGMENTS[SEGMENTS.length - 1];
      for (const candidate of SEGMENTS) {
        if (progress < candidate.end) {
          segment = candidate;
          break;
        }
      }
      const local = clamp01(
        (progress - segment.start) / (segment.end - segment.start),
      );

      const held = segment.scene;
      const reeling = segment.kind === "reel";
      // On a handover this is how far the swap has got; on a reel run there is
      // no swap and every scene stays where it is.
      const enter = reeling ? 0 : smoothstep(local);
      const deckW = deck.clientWidth;
      const deckH = deck.clientHeight;
      const orbit = deckW * ORBIT;

      // The opening handover is the set piece; every other one is a swap.
      const hero = segment.kind === "hand" && segment.scene === 0;

      // The sky, creeping outward while the world races toward the reader —
      // see the note on SKY_APPROACH for why the two rates differ so widely.
      // Driven from here rather than from inside the scene loop below: there is
      // one sky behind all four scenes, and writing it per scene would be four
      // writes a frame for one layer, three of them immediately overwritten.
      if (sky) {
        const zoom =
          reeling && held === 0
            ? 1 + (SKY_OPEN - 1) * depth * smoothstep(local)
            : hero
              ? 1 + (curve(SKY_APPROACH, local) - 1) * depth
              : 1;

        sky.style.transform = `scale(${zoom.toFixed(4)})`;
        // Hinted only while it is actually moving. This is a layer the size of
        // the window, and it is still for most of the runway.
        const live = zoom !== 1 ? "1" : "0";
        if (sky.dataset.live !== live) sky.dataset.live = live;
      }

      // The surface the camera passes through. Blooms as the drawing gives out,
      // holds while we are inside it, and clears as the next world arrives.
      if (tunnel) {
        const shell = hero
          ? curve(
              [
                [SHELL_IN, 0],
                [SHELL_FULL, 1],
                [EARTH_OUT, 1],
                [SHELL_OUT, 0],
              ],
              local,
            )
          : 0;
        tunnel.style.opacity = shell.toFixed(3);
        const live = shell > 0 ? "1" : "0";
        if (tunnel.dataset.live !== live) tunnel.dataset.live = live;
        if (shell > 0) {
          // Grows past the camera rather than sitting still, so it reads as
          // something being entered rather than a colour being faded up.
          const bloom =
            0.85 + 1.9 * clamp01((local - SHELL_IN) / (SHELL_OUT - SHELL_IN));
          tunnel.style.transform = `scale(${bloom.toFixed(3)})`;
        }
      }

      for (let i = 0; i < SCENES; i++) {
        // Where this scene is on the orbit: +1 is off to the right and still to
        // come, 0 is centre stage, -1 is gone to the left. Two scenes are ever
        // in play — the one leaving and the one replacing it — and the rest are
        // parked at either end, where they cost nothing.
        let u: number;
        if (i === held) u = -enter;
        else if (i === held + 1) u = 1 - enter;
        else u = i > held ? 1 : -1;

        let shown = smoothstep(clamp01((1 - Math.abs(u)) / (1 - HOLD)));
        // Built below. The ordinary swap derives it from `u`; the two scenes of
        // the opening set piece each have a timeline of their own.
        let transform: string | null = null;

        const { set, scene, field, drop, tracks } = parts[i];

        /* How far this scene has arrived, on its own clock rather than the
           segment's. On an ordinary swap the two are the same thing; through
           the set piece they are not, because scene 1 spends three quarters of
           that segment waiting off-stage while the camera is still inside the
           globe. Driving the fall off the segment there would have the screen
           landing before there was anything for it to land in. */
        const arrival =
          hero && i === 1
            ? clamp01((local - ARRIVE_FROM) / (1 - ARRIVE_FROM))
            : !reeling && i === held + 1
              ? enter
              : i <= held
                ? 1
                : 0;

        // The field is what everything else falls into, so it does not travel:
        // it comes in slightly large and settles back, and that is all.
        if (field) {
          const push = 1 + FIELD_PUSH * (1 - smoothstep(arrival));
          field.style.transform = `scale(${push.toFixed(4)})`;
        }

        // ...and this is the falling. Released from above the frame on the way
        // in; on the way out it is simply let go, and keeps accelerating off
        // the bottom rather than easing away.
        if (drop) {
          let dy = 0;
          if (arrival < 1) {
            dy = -fall(arrival) * deckH * FALL_HEIGHT;
          } else if (!reeling && i === held && !hero) {
            dy = enter * enter * deckH * 1.2;
          }
          drop.style.transform = `translate3d(0, ${dy.toFixed(1)}px, 0)`;
        }

        if (hero && i === 0) {
          // --- The approach -------------------------------------------------
          // The camera closes on the crown of the globe, so the scale is taken
          // about that point rather than about the sphere's centre: the crown
          // is where the figure is standing, and it is the spot the next scene
          // is a close-up of. Scaling about the middle instead would carry the
          // figure off the top of the frame on the way in — the camera would
          // fly past exactly the thing the sequence is about.
          //
          //   translate(0, drift) scale(s) translate(0, r)
          //
          // reads right to left: push the origin down to the crown, scale there,
          // then carry the crown to where the camera is looking. `drift` is the
          // whole of that second move, and at rest it is exactly -r, which
          // leaves the transform an identity.
          const s = 1 + (curve(APPROACH, local) - 1) * depth;
          const turn = -TURN * depth * smoothstep(clamp01(local / TURN_END));

          const crown = worldAnchor - worldRadius;
          // The crown slides to the middle of the frame as the camera lines up
          // on it, and stays there for the rest of the run.
          const aim =
            crown + (deckH * 0.5 - crown) * smoothstep(clamp01(local / FOCUS_END));

          shown =
            1 - smoothstep(clamp01((local - SHELL_IN) / (EARTH_OUT - SHELL_IN)));
          transform =
            `perspective(${PERSPECTIVE}px) ` +
            `translate(0px, ${(aim - worldAnchor).toFixed(1)}px) ` +
            `scale(${s.toFixed(4)}) ` +
            `translate(0px, ${worldRadius.toFixed(1)}px) ` +
            `rotateY(${turn.toFixed(2)}deg)`;
        } else if (hero && i === 1) {
          // --- Coming round -------------------------------------------------
          // Not a slide in from the right: an arc around the viewer. The world
          // rides an ellipse — wide across, shallow up — so it comes from off
          // the right and above, swings down and settles facing front. Turning
          // it by the same angle it has left to travel is what keeps the path
          // and the object reading as one movement rather than a rotation
          // applied to a translation.
          const e = easeOut(clamp01((local - ARRIVE_FROM) / (1 - ARRIVE_FROM)));
          const phi = ARRIVE_SWEEP * (1 - e);
          const rad = (phi * Math.PI) / 180;
          const scale = ARRIVE_SCALE + (1 - ARRIVE_SCALE) * e;

          shown = smoothstep(
            clamp01((local - ARRIVE_FROM) / (ARRIVE_TO - ARRIVE_FROM)),
          );
          transform =
            `translate(${(deckW * ARRIVE_RX * Math.sin(rad)).toFixed(1)}px, ` +
            `${(-deckW * ARRIVE_RY * (1 - Math.cos(rad))).toFixed(1)}px) ` +
            `rotate(${phi.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
        }

        // Marked rather than inferred, so the stylesheet can hint only the two
        // that are actually moving. Written on change alone: this is an
        // attribute, and attributes are not free the way a style write is.
        const onStage = shown > 0 ? "1" : "0";
        if (set.dataset.shown !== onStage) {
          set.dataset.shown = onStage;
          /* An off-stage scene is invisible but still in the document, so a
             link inside one is still in the tab order and still readable by a
             screen reader — a reader would tab to a picture nobody can see and
             be offered a story about a scene that is not on the stage. `inert`
             takes the whole scene out of both while it is not showing, and
             leaves layout alone, which matters because the flanks below are
             measured. */
          set.toggleAttribute("inert", onStage === "0");
        }

        // The whole layout fades — globe, sheet and flanks together, because
        // they are one scene. Only the globe then goes on to travel: frames
        // pinned to the page do not orbit anything.
        set.style.opacity = shown.toFixed(3);

        // The flanks run from 0 to 1 across this scene's own reel segment, and
        // stay wherever that left them: a scene already read keeps its frames
        // at the end, a scene still to come keeps them at the start. Otherwise
        // a globe arriving would bring flanks that had somehow already scrolled
        // themselves.
        //
        // `i <= held` on the second branch, not `i < held`. On a handover
        // `held` is the scene *leaving*, and its flanks have just finished —
        // sending it off with them wound back to the top would rewind six
        // frames in the reader's peripheral vision at the exact moment they are
        // looking at the globe. On a reel run the first branch has already
        // claimed i === held, so this only ever sees scenes that are done.
        const wound =
          reeling && i === held ? smoothstep(local) : i <= held ? 1 : 0;

        for (const track of tracks) {
          // Measured rather than assumed, so the frames land right whatever the
          // flank is sized to at this width. scrollHeight is the stack; the
          // parent's height is the window onto it. This is what guarantees the
          // thing the mechanic is for: the last frame always ends flush with
          // the bottom of the window, at every screen size.
          const travel = Math.max(
            0,
            track.scrollHeight - (track.parentElement?.clientHeight ?? 0),
          );
          track.style.transform = `translate3d(0, ${(-wound * travel).toFixed(1)}px, 0)`;
        }

        if (!scene) continue;

        // Deliberately not `visibility: hidden`, which would be the cheaper way
        // to park the off-stage scenes — a hidden subtree also stops the browser
        // laying its flanks out, and they are measured above.
        if (shown <= 0 && !transform) continue;

        if (!transform && i === 0) {
          // --- The turn -----------------------------------------------------
          // The world turns on its own while its segment runs, and comes closer
          // as it does. Held at a whole revolution afterwards rather than left
          // running, so it hands over the way it started — upright, with the
          // same scene at the top.
          //
          // Negative, and that is not a detail. A scene arriving from the right
          // unwinds from +SWEEP to 0, which carries the figure standing on it
          // leftwards across the top of the globe. Turning the world the other
          // way would have the planet rolling east while everything visiting it
          // travels west, and the two halves of the sequence would read as two
          // unrelated animations rather than one turning world.
          const spin = -wound * TURNS * 360;
          // Same composition as the approach that follows — turn about the
          // sphere's centre, then scale about its crown — and the same `depth`
          // factor, so the two meet at one number on a screen of any size.
          const s = 1 + (OPEN_ZOOM - 1) * depth * wound;

          transform =
            `translate(0px, ${(-worldRadius).toFixed(1)}px) ` +
            `scale(${s.toFixed(4)}) ` +
            `translate(0px, ${worldRadius.toFixed(1)}px) ` +
            `rotate(${spin.toFixed(2)}deg)`;
        } else if (!transform) {
          const degrees = u * SWEEP;
          const radians = (degrees * Math.PI) / 180;

          // Two moves about one point: a step along the orbit, then the rotation
          // that is the whole reason the artwork was pinned at the globe's
          // centre. Both are compositor work and nothing else.
          transform =
            `translate(${(orbit * Math.sin(radians)).toFixed(1)}px, ` +
            `${(orbit * (1 - Math.cos(radians))).toFixed(1)}px) ` +
            `rotate(${degrees.toFixed(2)}deg)`;
        }

        scene.style.transform = transform;
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      // The sky outlives this section — it belongs to the route. Left as the
      // last frame wrote it, a reader who turned reduced motion on halfway down
      // would be stuck with a starfield frozen at half again.
      if (sky) {
        sky.style.transform = "";
        delete sky.dataset.live;
      }
    };
  }, [reduced]);

  // --- The plain reading ---------------------------------------------------
  if (reduced) {
    return (
      <section
        ref={sectionRef}
        id="our-community"
        className="community-globe scroll-mt-20 py-16 sm:py-24"
      >
        <Container>
          <PlainReading />
        </Container>
      </section>
    );
  }

  // --- The runway ----------------------------------------------------------
  return (
    <section
      ref={sectionRef}
      id="our-community"
      // Seven segments plus the screen the stage occupies. Shorter on a phone,
      // where a segment of the same height is a great deal more thumb.
      //
      // This came down from 620vh once the opening turn and the set piece were
      // both cut: the weights decide how the runway is shared out, but only the
      // height decides how much scrolling any share of it costs, so shortening
      // one without the other would have handed the time saved straight back to
      // the reels.
      className="community-globe scroll-mt-20 h-[420vh] sm:h-[480vh]"
    >
      <div
        ref={stageRef}
        className="community-globe__stage sticky top-16 h-[calc(100svh-4rem)]"
      >
        <div ref={deckRef} className="community-globe__deck">
          {COMMUNITY_SCENES.map((scene, index) => (
            <div
              key={scene.slug}
              data-set={index}
              className="community-globe__set"
            >
              {/* The field the scene stands in, behind everything in it. It
                  does not travel with the scene — it is the thing the scene
                  arrives into, and the driver only settles it. */}
              {scene.bg && (
                <div
                  aria-hidden="true"
                  data-field
                  className="community-globe__field"
                >
                  <Image
                    src={scene.bg}
                    alt=""
                    fill
                    sizes="100vw"
                    className="community-globe__field-img"
                  />
                </div>
              )}

              {/* The two flanks. Outside the orbiting element on purpose: the
                  globe swings about the sphere's axis, and photographs pinned
                  to the frame have no business swinging with it. */}
              {scene.photos.length > 0 &&
                [0, 1].map((side) => (
                  <div
                    key={side}
                    className={cn(
                      "community-globe__flank",
                      side === 0
                        ? "community-globe__flank--left"
                        : "community-globe__flank--right",
                    )}
                  >
                    <div
                      data-track={`${index}-${side}`}
                      className="community-globe__track"
                    >
                      {scene.photos
                        .slice(side * PER_FLANK, side * PER_FLANK + PER_FLANK)
                        .map((slot, slotIndex) => {
                          const nth = side * PER_FLANK + slotIndex;
                          return (
                            <div
                              key={slotIndex}
                              className={cn(
                                "community-slot",
                                // Only a frame with something to reveal takes
                                // the pointer — see the stylesheet.
                                slot.caption && "community-slot--captioned",
                                slot.href && "community-slot--linked",
                              )}
                              style={{ rotate: `${TILTS[nth % TILTS.length]}deg` }}
                            >
                              <MediaSlot slot={slot} />
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}

              {/* The beam, thrown from above the frame down onto the clip. It
                  does not fall with the clip — the light is already there and
                  the screen drops into it, which is the right way round and
                  also the only way round that looks like a projection rather
                  than a lamp taped to the back of a picture. */}
              {scene.feature && (
                <div aria-hidden="true" className="community-globe__beam" />
              )}

              {/* The clip, at the centre of the stage. This is what falls. */}
              {scene.feature && (
                <div data-drop className="community-globe__feature">
                  <div className="community-screen">
                    <MediaSlot slot={scene.feature} />
                  </div>
                </div>
              )}

              {/* Last in the DOM, and above the clip: the close-up is the floor
                  of the frame, and the figure standing on it crosses in front
                  of the screen rather than being cut out around it. */}
              <div
                data-scene={index}
                className={cn(
                  "community-globe__scene",
                  index === 0
                    ? "community-globe__scene--world"
                    : "community-globe__scene--visit",
                )}
              >
                <div className="community-globe__art">
                  <Image
                    src={scene.src}
                    // The stage carries no type, so the pictures are the only
                    // thing describing this section to a screen reader.
                    alt={scene.alt}
                    width={scene.width}
                    height={scene.height}
                    // The widest the artwork is ever drawn, which is the file
                    // rather than the globe inside it: a close-up is 1.19
                    // diameters across, so a 62vw globe is a 74vw picture.
                    sizes={index === 0 ? "100vw" : "74vw"}
                    priority={index === 0}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* The surface the camera passes through, and the only element here
              that is not a picture of something. It exists because the drawing
              cannot do this part: a 699px PNG at fifteen times its size is not
              a planet, it is four coloured smudges. So the drawing hands over
              to this on the way in and takes it back on the way out, and the
              moment in between — the one that reads as being inside the
              globe — is drawn rather than photographed. */}
          <div aria-hidden="true" data-tunnel className="community-globe__tunnel" />
        </div>
      </div>

      {/* Nothing above this line moves without JavaScript, and the section is
          four screens tall. The layout's noscript block hides the stage and
          gives the section back its own height; this is what stands in its
          place. Browsers do not fetch images inside <noscript> while scripting
          is on, so it costs a reader with JavaScript nothing but the markup. */}
      <noscript>
        <Container className="py-16">
          <PlainReading />
        </Container>
      </noscript>
    </section>
  );
}
