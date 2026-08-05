"use client";

import { useEffect, useRef } from "react";
import type { Metric } from "@/lib/solutions";
import { FIGURE_GRADIENT } from "./figureGradient";

/** Long enough to read as a deliberate climb, short enough not to be waited on. */
const DURATION = 1400;
/** How much of the figure must be on screen before it starts counting. */
const SHOW_RATIO = 0.4;

/**
 * A spec figure that counts up from zero the first time it reaches the screen.
 *
 * Renders its final values on the server, so the numbers are correct before
 * hydration, without JavaScript, and for anyone who prefers reduced motion —
 * the count is an embellishment on top of real content, never the only way to
 * read it.
 *
 * Frames are written straight to the text nodes. Counting through React state
 * would re-render the whole band sixty times a second to change a few digits.
 *
 * Unlike Reveal, this runs once per visit and is then done: the observer is
 * disconnected on the first pass and the figures are left standing at their
 * real values. A number that rewinds to zero every time you scroll back to it
 * stops reading as an arrival and starts reading as a spec sheet that cannot
 * make up its mind. Coming back to the page mounts the component afresh, so a
 * genuine return does count again.
 *
 * The trigger is the enclosing [data-metric-scope], not the figure itself. In
 * the marquee the figures are constantly sliding in and out of the clip, so
 * watching each one would leave them counting at cross purposes — and the
 * duplicated track would show the same figure at two different values.
 */
export function MetricValue({
  values,
  decimals = 0,
  separator,
  prefix,
  suffix,
}: Omit<Metric, "label">) {
  const ref = useRef<HTMLSpanElement>(null);
  // Arrays are a fresh reference on every render, so depend on the contents.
  const key = values.join(",");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const nodes = Array.from(
      element.querySelectorAll<HTMLElement>("[data-metric-number]"),
    );
    if (nodes.length === 0) return;

    // Leave the final values in place when motion is unwelcome or unobservable.
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = key.split(",").map(Number);
    const write = (fraction: number) => {
      nodes.forEach((node, index) => {
        node.textContent = (targets[index] * fraction).toFixed(decimals);
      });
    };

    let frame = 0;
    let startedAt = 0;

    const step = (now: number) => {
      if (!startedAt) startedAt = now;
      const progress = Math.min(1, (now - startedAt) / DURATION);
      // easeOutCubic: quick off the mark, then settling onto the real figure.
      write(1 - Math.pow(1 - progress, 3));
      frame = progress < 1 ? requestAnimationFrame(step) : 0;
    };

    // Wind back for the entrance. Runs on mount rather than during render so
    // the server-rendered figures stay intact until the client takes over.
    write(0);

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.intersectionRatio >= SHOW_RATIO)) {
          return;
        }
        // Done for this visit. Disconnecting here rather than tracking a
        // "has run" flag means nothing is left listening once the figures have
        // landed, so scrolling back past the band cannot restart them.
        observer.disconnect();
        frame = requestAnimationFrame(step);
      },
      { threshold: SHOW_RATIO },
    );

    observer.observe(element.closest("[data-metric-scope]") ?? element);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [key, decimals]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {values.map((value, index) => (
        <span key={index}>
          {index > 0 && separator}
          {/* Width has to be held for the finished figure, or the digits widen
              as they count and shove everything after them along — in the
              marquee, the whole track.

              A hidden copy of the final text does the holding. Reserving `ch`
              per character instead only works for digits: `ch` is the width of
              a zero, so "0.5" claimed three digit-widths and the number sat in
              a box wider than itself. */}
          <span className="relative inline-block">
            <span className="invisible">{value.toFixed(decimals)}</span>
            {/* Carries its own copy of the figure gradient. The <dd> around
                this cannot supply it: background-clip:text only clips to the
                glyphs of in-flow descendants, and a positioned box is painted
                outside that pass — the digits came out transparent with
                nothing behind them. Same ramp over the same height, since
                leading-none makes both boxes one font-size tall. */}
            <span
              data-metric-number=""
              className={`absolute right-0 top-0 ${FIGURE_GRADIENT}`}
            >
              {value.toFixed(decimals)}
            </span>
          </span>
        </span>
      ))}
      {suffix && (
        // Set small and baseline-aligned low, so the unit reads as an
        // annotation on the figure rather than part of it.
        <span className="ml-1 align-baseline text-[0.28em] font-semibold text-foreground">
          {suffix}
        </span>
      )}
    </span>
  );
}
