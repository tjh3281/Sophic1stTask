"use client";

import { useEffect, useRef } from "react";
import "./ClickSpark.css";

/**
 * ClickSpark, from React Bits — ported to TypeScript.
 *
 * A ring of short lines thrown out of wherever the reader pressed, shrinking
 * as they travel. Nothing is clickable underneath it and nothing changes when
 * you press; it is a spark struck off the page.
 *
 * Local changes:
 *
 *   1. The loop only runs while there are sparks to draw. Upstream leaves a
 *      requestAnimationFrame loop turning over for the lifetime of the page,
 *      clearing an empty canvas sixty times a second whether anyone has ever
 *      clicked or not. Here the first press starts it and the last spark to
 *      expire stops it, so the resting cost is nothing.
 *
 *   2. The buffer follows the device pixel ratio. Upstream sizes the canvas in
 *      CSS pixels, so on any retina display the sparks are drawn at half
 *      resolution and come out soft — which on two-pixel lines is most of what
 *      you see of them.
 *
 *   3. Sparks are struck on pointerdown rather than click, so they land under
 *      the finger at the moment of the press instead of on release, and a drag
 *      that starts here still sparks.
 *
 *   4. Nothing at all under prefers-reduced-motion: no canvas, no listener.
 *
 *   5. The wrapper is a plain block, not a forced 100%-by-100% box. Upstream's
 *      version only works inside a parent with a resolved height; this one
 *      takes the height of whatever it wraps, which is what lets it sit around
 *      a section of ordinary flowing content.
 */

type Spark = {
  x: number;
  y: number;
  angle: number;
  /** performance.now() at the press that made it. */
  bornAt: number;
};

export type ClickSparkProps = {
  /** Colour of each line. Any canvas stroke style. */
  sparkColor?: string;
  /** Length of a line at the moment it appears, in CSS pixels. */
  sparkSize?: number;
  /** How far the lines travel from the point of the press. */
  sparkRadius?: number;
  /** Lines per press, spread evenly around the circle. */
  sparkCount?: number;
  /** Life of one spark, in milliseconds. */
  duration?: number;
  /** Width of a line, in CSS pixels. */
  lineWidth?: number;
  className?: string;
  children: React.ReactNode;
};

/** Upstream's default easing, written out: decelerating, ending at rest. */
function easeOut(t: number) {
  return t * (2 - t);
}

export function ClickSpark({
  sparkColor = "#fff",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  lineWidth = 2,
  className,
  children,
}: ClickSparkProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Live values, read inside the loop, so changing a prop never restarts it.
  const propsRef = useRef({
    sparkColor,
    sparkSize,
    sparkRadius,
    sparkCount,
    duration,
    lineWidth,
  });

  useEffect(() => {
    propsRef.current = {
      sparkColor,
      sparkSize,
      sparkRadius,
      sparkCount,
      duration,
      lineWidth,
    };
  });

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sparks: Spark[] = [];
    let raf = 0;
    /** The drawing surface in CSS pixels — the units everything below is in. */
    let cssWidth = 0;
    let cssHeight = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = root.getBoundingClientRect();
      cssWidth = width;
      cssHeight = height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      // One transform, set once per resize, so everything below can be written
      // in the CSS pixels the pointer arrived in. Setting width or height is
      // what resets the context, so this has to come after both.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const p = propsRef.current;
      const now = performance.now();

      // In CSS pixels, not canvas.width/height. Those are device pixels, and
      // under the transform above they describe a box a factor of dpr out —
      // too small on a display that reports less than 1, which leaves a band
      // down the right and along the bottom that is never wiped and collects
      // every spark ever struck in it.
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      ctx.strokeStyle = p.sparkColor;
      ctx.lineWidth = p.lineWidth;
      ctx.lineCap = "round";

      // Backwards, so removing a dead spark cannot skip the next one.
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        const elapsed = now - spark.bornAt;
        if (elapsed >= p.duration) {
          sparks.splice(i, 1);
          continue;
        }

        const eased = easeOut(elapsed / p.duration);
        const distance = eased * p.sparkRadius;
        // Shrinks to nothing as it goes, so the ring thins out rather than
        // stopping dead at full length.
        const length = p.sparkSize * (1 - eased);
        const cos = Math.cos(spark.angle);
        const sin = Math.sin(spark.angle);

        ctx.beginPath();
        ctx.moveTo(spark.x + distance * cos, spark.y + distance * sin);
        ctx.lineTo(
          spark.x + (distance + length) * cos,
          spark.y + (distance + length) * sin,
        );
        ctx.stroke();
      }

      // Last one out clears the canvas and stops the loop.
      if (sparks.length === 0) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(draw);
    };

    const onPointerDown = (event: PointerEvent) => {
      const p = propsRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const bornAt = performance.now();

      for (let i = 0; i < p.sparkCount; i++) {
        sparks.push({ x, y, angle: (2 * Math.PI * i) / p.sparkCount, bornAt });
      }

      if (!raf) raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(root);
    resize();

    root.addEventListener("pointerdown", onPointerDown);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      root.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <div ref={rootRef} className={`click-spark${className ? ` ${className}` : ""}`}>
      {children}
      {/* After the children rather than before, so the sparks land in front of
          them. They are two pixels wide and gone in four hundred milliseconds;
          behind the type they would be hidden by the very thing the reader was
          pointing at. */}
      <canvas ref={canvasRef} aria-hidden="true" className="click-spark__canvas" />
    </div>
  );
}
