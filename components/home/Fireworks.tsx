"use client";

import type { AnimationItem } from "lottie-web";
import { useEffect, useRef } from "react";
import "./Fireworks.css";

/**
 * The fireworks going off behind the anniversary band.
 *
 * One Lottie file, played several times over at different sizes, speeds and
 * points in its own loop. That is the whole trick: a single burst repeating on
 * a two-second cycle reads as a looping graphic, but three of them at 0.92,
 * 1.08 and 0.8 speed drift permanently out of step with each other — the
 * pattern only comes back around after several minutes, by which time nobody
 * is still here. Non-multiple speeds are the point; 0.5 and 1.0 would resync
 * every other burst and put the display back on a visible beat.
 *
 * Nothing about it is loaded until it is needed. The player and the animation
 * are both fetched from inside the observer callback, so a reader who never
 * scrolls this far pays nothing at all: the initial bundle for this page does
 * not contain lottie-web, and the 99KB of JSON is never requested. Once
 * running, it stops whenever the band leaves the viewport or the tab goes to
 * the background — same arrangement as DarkVeil, and for the same reason.
 *
 * Under prefers-reduced-motion the effect declines to load anything. There is
 * no still frame to fall back to: a firework held at one instant is a scatter
 * of unrelated specks, and the sky behind is a composition in its own right.
 */

/** Fetched once and parsed per burst — see the note at the parse. */
const SOURCE = "/animations/fireworks.json";

/**
 * Below this the band is a single column of text with no clear space either
 * side of it, so the bursts marked `wide` are never built.
 */
const NARROW = "(max-width: 39.99rem)";

type Burst = {
  /** Centre of the burst, as a percentage of the band. */
  x: number;
  y: number;
  /** Width, as a percentage of the band. The artboard is square. */
  size: number;
  /** Playback rate. Deliberately not a simple ratio of the others. */
  speed: number;
  /** Frame of the 63-frame loop to enter at, so they never fire together. */
  from: number;
  opacity: number;
  /** Skipped on a phone, where there is no room for it. */
  wide?: boolean;
};

/**
 * Placed around the type rather than behind it: the two large bursts sit out
 * in the margins either side of the heading, and the two small ones are low
 * and to either side, where the column has already narrowed. Opacity falls
 * with distance from the top, which is what gives the group depth — the far
 * bursts are the dim ones.
 *
 * Four rather than three, and the entry frames are spread across the loop
 * rather than bunched. A burst spends the last fifth of its cycle fading to
 * nothing, so with too few of them the sky goes dark for a beat and the whole
 * corner of the screen looks broken. Staggered like this there is always one
 * of them alight.
 */
const BURSTS: Burst[] = [
  { x: 15, y: 32, size: 30, speed: 0.92, from: 0, opacity: 0.8 },
  { x: 85, y: 26, size: 27, speed: 1.08, from: 22, opacity: 0.75 },
  { x: 72, y: 80, size: 19, speed: 0.8, from: 44, opacity: 0.5, wide: true },
  { x: 29, y: 76, size: 16, speed: 1.22, from: 34, opacity: 0.42, wide: true },
];

export function Fireworks() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const narrow = window.matchMedia(NARROW).matches;

    let cancelled = false;
    let started = false;
    let visible = false;
    const anims: AnimationItem[] = [];

    const play = () => {
      if (document.hidden || !visible) return;
      for (const anim of anims) anim.play();
    };

    const pause = () => {
      for (const anim of anims) anim.pause();
    };

    const start = async () => {
      started = true;
      try {
        // The light build: no expressions and no effects, which this file uses
        // none of, and about half the weight of the full player.
        const [{ default: lottie }, raw] = await Promise.all([
          import("lottie-web/build/player/lottie_light"),
          fetch(SOURCE).then((response) => response.text()),
        ]);
        if (cancelled) return;

        const hosts = root.querySelectorAll<HTMLElement>(".fireworks__burst");

        hosts.forEach((host, index) => {
          const burst = BURSTS[index];
          if (!burst || (burst.wide && narrow)) return;

          const anim = lottie.loadAnimation({
            container: host,
            renderer: "svg",
            loop: true,
            // Started by hand below, at this burst's own point in the loop.
            autoplay: false,
            // Parsed again for every burst rather than handing the same object
            // to each. lottie-web writes its own bookkeeping onto the data it
            // is given, so instances sharing one object corrupt each other's
            // playback — they end up locked to the same frame.
            animationData: JSON.parse(raw),
            rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
          });

          anim.setSpeed(burst.speed);
          anim.goToAndStop(burst.from, true);
          anims.push(anim);
        });

        play();
      } catch {
        // A failed fetch or a player that would not load leaves the night sky
        // behind this, which is a finished background on its own.
      }
    };

    const wake = () => {
      if (!started) void start();
      else play();
    };

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver === "undefined") {
      visible = true;
      wake();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            visible = entry.isIntersecting;
            if (visible) wake();
            else pause();
          }
        },
        // Enough lead time for the player and the file to arrive before the
        // band is on screen, so the first burst is not a pop into an empty sky.
        { rootMargin: "300px" },
      );
      observer.observe(root);
    }

    const onVisibilityChange = () => {
      if (document.hidden) pause();
      else if (visible) play();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      for (const anim of anims) anim.destroy();
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true" className="fireworks">
      {BURSTS.map((burst) => (
        <div
          key={`${burst.x}-${burst.y}`}
          className="fireworks__burst"
          style={
            {
              "--x": `${burst.x}%`,
              "--y": `${burst.y}%`,
              "--w": `${burst.size}%`,
              "--o": burst.opacity,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
