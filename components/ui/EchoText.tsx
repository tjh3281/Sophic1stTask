"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "./EchoText.css";

/**
 * EchoText, from React Bits — ported to TypeScript.
 *
 * One crisp copy of the word with a stack of ghosts behind it. Each ghost
 * chases the one in front by a little less than the last, so a movement drags a
 * trail through them and the trail catches up in order rather than all at once.
 * Two things move them: an entrance that starts the stack spread out along one
 * axis and collapses it, and the pointer, which pulls the whole stack towards
 * itself and lets it settle back.
 *
 * Nothing here is React state — the loop writes transforms and opacities
 * straight to the nodes. A render per frame across a dozen layers is how a
 * cover like this starts dropping them.
 *
 * Local changes, both about what it costs to leave running:
 *
 *   - Upstream's loop never stops on a machine with a pointer: `stillMoving`
 *     ends in `|| canHover`, so a desktop reader gets a requestAnimationFrame
 *     running for as long as the page is open, whether or not anything is
 *     moving. Here the loop ends when the stack has settled and the pointer
 *     handlers wake it again.
 *   - The pointer is listened to on the window, because the text answers a
 *     cursor that is nowhere near it. That is the effect and it is kept, but an
 *     observer now gates it on the cover actually being on screen: without one,
 *     every mouse move anywhere on the page does this arithmetic for a heading
 *     scrolled out of view several screens ago.
 *   - The echoes are not rendered until mount — see echoCount. Upstream sends
 *     all of them in the HTML, which puts the same word in a heading a dozen
 *     times for every reader who will never see them move.
 *
 * `style` is spread last so a caller can override the properties the component
 * sets from its own props, which is upstream's order here and worth keeping.
 */

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

type Vector = { x: number; y: number };

export type EchoDirection = "right" | "left" | "up" | "down" | "diagonal";
export type EchoEase = "linear" | "ease-out" | "ease-in-out" | "snappy";

const DIRECTIONS: Record<EchoDirection, Vector> = {
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  diagonal: { x: 0.72, y: 0.72 },
};

const EASING: Record<EchoEase, (t: number) => number> = {
  linear: (t) => t,
  "ease-out": (t) => 1 - Math.pow(1 - t, 3),
  "ease-in-out": (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  snappy: (t) => 1 - Math.pow(1 - t, 5),
};

type EchoState = {
  targetX: number;
  targetY: number;
  lastTargetX: number;
  lastTargetY: number;
  activity: number;
  positions: Vector[];
  startTime: number;
};

export type EchoTextProps = {
  /** Rendered by the crisp front copy and by every echo behind it. */
  text?: string;
  /** Ghost copies behind the front text. Capped at 24. */
  echoes?: number;
  /** How slowly the deeper echoes chase the target. */
  lag?: number;
  /** Pixels of travel for both the entrance spread and the pointer pull. */
  offset?: number;
  /** Which way the entrance trail collapses from. */
  direction?: EchoDirection;
  /** Opacity falloff from one echo to the next. */
  fade?: number;
  /** Blur in pixels on the deepest echo, ramped from none on the nearest. */
  blur?: number;
  /** Colour mixed into the echoes. `false` leaves them the front copy's colour. */
  tint?: string | false;
  /** Whether to run the entrance, the pointer smear, or both. */
  mode?: "entrance" | "pointer" | "both";
  /** Distance over which the cursor pulls the stack to its full offset. */
  cursorRadius?: number;
  /** Milliseconds the entrance takes to converge. */
  duration?: number;
  ease?: EchoEase;
  fontSize?: string | number;
  fontWeight?: string | number;
  /** The front copy's colour. */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
};

export function EchoText({
  text = "Motion Echo",
  echoes = 12,
  lag = 0.24,
  offset = 36,
  direction = "right",
  fade = 0.72,
  blur = 3,
  tint = "#7dd3fc",
  mode = "both",
  cursorRadius = 320,
  duration = 900,
  ease = "ease-out",
  fontSize = "clamp(3rem, 9vw, 7rem)",
  fontWeight = 800,
  color = "#f8fafc",
  className = "",
  style,
}: EchoTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const copyRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const frameRef = useRef<number | null>(null);
  const stateRef = useRef<EchoState | null>(null);
  /**
   * Three states rather than a boolean, and "unknown" is the useful one: it is
   * what the server renders and what the client renders until the media query
   * has been asked. Only "full" draws ghosts.
   */
  const [motion, setMotion] = useState<"unknown" | "full" | "reduced">(
    "unknown",
  );

  /**
   * How many ghosts there are.
   *
   * None for a reader who has asked for less motion — the stack collapses to
   * the one crisp copy, which is the whole word either way.
   *
   * And none on the server. The echoes exist only to be animated, so rendering
   * them into the HTML puts the same word in a heading a dozen times for every
   * reader who will never run the loop — a crawler, or anyone whose JavaScript
   * did not arrive. Upstream renders them eagerly; waiting costs the one render
   * this component was already doing to answer the motion query.
   */
  const echoCount = motion === "full" ? clamp(Math.round(echoes), 0, 24) : 0;
  const copyIndexes = useMemo(
    () => Array.from({ length: echoCount + 1 }, (_, index) => index),
    [echoCount],
  );

  useEffect(() => {
    // No way to ask the question means the answer stays "unknown", which draws
    // no ghosts. Upstream's equivalent leaves the flag at false and trails
    // anyway; erring the other way is the right way round for a motion
    // preference nobody can read.
    if (typeof window === "undefined" || !window.matchMedia) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotion(media.matches ? "reduced" : "full");
    update();

    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || motion !== "full") return;

    const vector = DIRECTIONS[direction] ?? DIRECTIONS.right;
    const safeOffset = clamp(Number(offset) || 0, 0, 120);
    const safeCursorRadius = clamp(Number(cursorRadius) || 320, 40, 1200);
    const safeLag = clamp(Number(lag) || 0.16, 0.02, 0.5);
    const safeFade = clamp(Number(fade) || 0.64, 0.1, 0.95);
    const safeBlur = clamp(Number(blur) || 0, 0, 16);
    const safeDuration = Math.max(0, Number(duration) || 0);
    const easeFn = EASING[ease] ?? EASING["ease-out"];
    const entranceEnabled = mode === "entrance" || mode === "both";
    const pointerEnabled = mode === "pointer" || mode === "both";

    const positions: Vector[] = Array.from(
      { length: echoCount + 1 },
      (_, index) => {
        const spread = entranceEnabled ? safeOffset * (index + 0.35) : 0;
        return { x: vector.x * spread, y: vector.y * spread };
      },
    );

    stateRef.current = {
      targetX: 0,
      targetY: 0,
      lastTargetX: 0,
      lastTargetY: 0,
      activity: entranceEnabled ? 1 : 0,
      positions,
      startTime: performance.now(),
    };

    const renderFrame = (now: number) => {
      frameRef.current = null;

      const state = stateRef.current;
      if (!state) return;

      const elapsed = now - state.startTime;
      const entranceProgress =
        entranceEnabled && safeDuration > 0
          ? clamp(elapsed / safeDuration, 0, 1)
          : 1;
      const entranceRest = entranceEnabled ? 1 - easeFn(entranceProgress) : 0;
      const targetVelocity = Math.hypot(
        state.targetX - state.lastTargetX,
        state.targetY - state.lastTargetY,
      );

      state.lastTargetX = state.targetX;
      state.lastTargetY = state.targetY;

      let maxSeparation = 0;

      for (let index = 0; index <= echoCount; index += 1) {
        const copy = copyRefs.current[index];
        const current = state.positions[index];
        if (!copy || !current) continue;

        const spread = entranceRest * safeOffset * (index + 0.35);
        const desiredX = state.targetX + vector.x * spread;
        const desiredY = state.targetY + vector.y * spread;
        // Each layer back chases a little more slowly, which is what turns one
        // movement into a trail rather than a dozen copies moving as a block.
        const lerp = clamp(0.34 / (1 + index * safeLag * 4.2), 0.018, 0.36);

        current.x += (desiredX - current.x) * lerp;
        current.y += (desiredY - current.y) * lerp;

        copy.style.transform = `translate3d(${current.x.toFixed(3)}px, ${current.y.toFixed(3)}px, 0)`;

        if (index > 0) {
          const front = state.positions[0];
          const separation = front
            ? Math.hypot(current.x - front.x, current.y - front.y)
            : 0;
          maxSeparation = Math.max(maxSeparation, separation);
          const depth = echoCount ? index / echoCount : 0;
          copy.style.filter =
            safeBlur > 0 ? `blur(${(safeBlur * depth).toFixed(2)}px)` : "none";
        }
      }

      // The echoes are only visible while something is happening: spread out,
      // or being dragged. At rest the stack is the front copy alone.
      const separationActivity =
        safeOffset > 0 ? clamp(maxSeparation / (safeOffset * 2.25), 0, 1) : 0;
      const targetActivity =
        safeOffset > 0 ? clamp(targetVelocity / (safeOffset * 0.35), 0, 1) : 0;
      const nextActivity = Math.max(
        entranceRest,
        separationActivity,
        targetActivity,
      );
      state.activity += (nextActivity - state.activity) * 0.18;

      for (let index = 1; index <= echoCount; index += 1) {
        const copy = copyRefs.current[index];
        if (!copy) continue;
        copy.style.opacity = String(Math.pow(safeFade, index) * state.activity);
      }

      const stillMoving =
        state.activity > 0.002 ||
        Math.abs(state.targetX) > 0.01 ||
        Math.abs(state.targetY) > 0.01 ||
        entranceProgress < 1;

      if (stillMoving) frameRef.current = requestAnimationFrame(renderFrame);
    };

    /** Restart the loop if it has settled and gone to sleep. */
    const wake = () => {
      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(renderFrame);
      }
    };

    let onScreen = true;
    let observer: IntersectionObserver | undefined;
    let cleanupPointer = () => {};

    const canHover =
      pointerEnabled &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (canHover) {
      // Only worth knowing while the heading is on screen; see the note above.
      if (typeof IntersectionObserver !== "undefined") {
        observer = new IntersectionObserver((entries) => {
          for (const entry of entries) onScreen = entry.isIntersecting;
        });
        observer.observe(root);
      }

      const handlePointerMove = (event: PointerEvent) => {
        const state = stateRef.current;
        if (!state || !onScreen) return;

        const rect = root.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const deltaX = event.clientX - (rect.left + rect.width / 2);
        const deltaY = event.clientY - (rect.top + rect.height / 2);
        const distance = Math.hypot(deltaX, deltaY);
        const reach = distance > 0 ? clamp(distance / safeCursorRadius, 0, 1) : 0;

        state.targetX = (distance > 0 ? deltaX / distance : 0) * reach * safeOffset;
        // Less vertical than horizontal: the word is wide and short, and a
        // trail that travels as far up as along reads as the whole heading
        // sliding rather than smearing.
        state.targetY =
          (distance > 0 ? deltaY / distance : 0) * reach * safeOffset * 0.72;
        wake();
      };

      const handlePointerLeave = () => {
        const state = stateRef.current;
        if (!state) return;
        state.targetX = 0;
        state.targetY = 0;
        wake();
      };

      window.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      document.addEventListener("pointerleave", handlePointerLeave);
      cleanupPointer = () => {
        window.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerleave", handlePointerLeave);
      };
    }

    frameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      cleanupPointer();
      observer?.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      stateRef.current = null;
    };
  }, [
    blur,
    cursorRadius,
    direction,
    duration,
    ease,
    echoCount,
    fade,
    lag,
    mode,
    motion,
    offset,
  ]);

  const rootStyle: React.CSSProperties = {
    fontSize,
    fontWeight,
    color,
    ...style,
  };

  return (
    <span
      ref={rootRef}
      className={`echo-text ${className}`.trim()}
      style={rootStyle}
    >
      {/* Deepest first, so the front copy is last in the source and paints over
          the rest without any of them needing a z-index of their own. */}
      {copyIndexes
        .slice(1)
        .reverse()
        .map((index) => (
          <span
            aria-hidden="true"
            className="echo-text__echo"
            data-echo-index={index}
            key={`echo-${index}`}
            ref={(element) => {
              copyRefs.current[index] = element;
            }}
            style={{
              color: tint
                ? `color-mix(in srgb, ${tint} ${Math.min(72, 18 + index * 5)}%, ${color})`
                : color,
              opacity: 0,
            }}
          >
            {text}
          </span>
        ))}

      {/* The only copy in the accessibility tree — the echoes are the same word
          a dozen more times, and are hidden from it. */}
      <span
        className="echo-text__echo echo-text__echo--front"
        data-echo-index="0"
        ref={(element) => {
          copyRefs.current[0] = element;
        }}
      >
        {text}
      </span>
    </span>
  );
}

export default EchoText;
