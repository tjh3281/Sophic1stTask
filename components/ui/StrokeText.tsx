"use client";

import { gsap } from "gsap";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./StrokeText.css";

/**
 * StrokeText, from React Bits — ported to TypeScript.
 *
 * The wordmark is drawn twice into one SVG: an outlined copy whose dash offset
 * animates from "fully hidden" to "fully drawn", and a filled copy underneath
 * that is revealed afterwards, either by fading in or by a clip rectangle
 * wiping across it. The viewBox is measured from the glyphs themselves, so the
 * result scales to whatever width it is given.
 *
 * Local changes:
 *
 *   - The outline is stroked outside the letterform rather than straddling it —
 *     see the mask below. This is the one change with a visible effect, and it
 *     is the difference between the effect working and not.
 *   - `trigger="scroll"` uses an IntersectionObserver rather than GSAP's
 *     ScrollTrigger plugin. Behaviour is the same — fire once, when the
 *     wordmark is 82% of the way up the viewport — but ScrollTrigger is a
 *     large plugin to ship on a marketing page for one "has this scrolled into
 *     view yet" question, and this project already scopes its fonts per route
 *     to avoid exactly that kind of weight.
 *   - The box is sized by aspect ratio once measured; see StrokeText.css.
 *   - `style` is spread last, so a caller can override the custom properties
 *     the component sets. Upstream spreads it first, which means the one thing
 *     you would want to override is the one thing you cannot.
 */

const DEFAULT_TEXT = "Draw Attention";

type Box = { x: number; y: number; width: number; height: number };

export type StrokeTextProps = {
  /** The heading copy, rendered as measured SVG glyphs. */
  text?: string;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  /** Seconds each character outline spends drawing on. */
  drawDuration?: number;
  /** Seconds to wait after the outline draw before the fill begins. */
  fillDelay?: number;
  /** Delay in seconds between each character's animation. */
  stagger?: number;
  ease?: string;
  /** When the draw timeline starts. */
  trigger?: "mount" | "hover" | "scroll" | "loop";
  /** Whether the fill arrives as a fade, a left-to-right wipe, or not at all. */
  fillMode?: "fade" | "wipe" | "none";
  /** SVG font size before the responsive viewBox scales the wordmark. */
  fontSize?: number;
  fontWeight?: number | string;
  letterSpacing?: number;
  /** Stagger from the final character back to the first. */
  reverse?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export function StrokeText({
  text = DEFAULT_TEXT,
  strokeColor = "#A78BFA",
  fillColor = "#F8FAFC",
  strokeWidth = 1.4,
  drawDuration = 1.6,
  fillDelay = 0.2,
  stagger = 0.05,
  ease = "power2.out",
  trigger = "mount",
  fillMode = "wipe",
  fontSize = 128,
  fontWeight = 800,
  letterSpacing = -4,
  reverse = false,
  className = "",
  style,
}: StrokeTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const strokeTextRef = useRef<SVGTextElement>(null);
  const wipeRectRef = useRef<SVGRectElement>(null);

  const [box, setBox] = useState<Box | null>(null);

  const rawId = useId();
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const wipeId = `stroke-text-wipe-${safeId}`;
  const outlineId = `stroke-text-outline-${safeId}`;

  // Array.from, not split(""), so an emoji or an accented character stays one
  // glyph rather than being torn into surrogate halves.
  const characters = useMemo(() => Array.from(String(text ?? "")), [text]);

  // The dash has to be at least as long as the longest glyph outline, or the
  // pattern repeats and the letter appears to draw in several places at once.
  const dash = Math.max(fontSize * 7, 200);

  /**
   * The outline is stroked at twice its nominal width and then masked back to
   * the half of it that falls outside the letterform, which is the only way to
   * draw type this way and get the shape you asked for.
   *
   * A stroke with no fill does not trace the silhouette of a letter — it traces
   * every contour the glyph is built from, and in a variable font those pieces
   * overlap on purpose. The fill rule welds them into one shape when the glyph
   * is filled; nothing welds them when it is not. Plus Jakarta Sans draws 'e' as
   * a bowl with a separate bar laid across it, so the unmasked outline puts a
   * spear through the middle of the letter, and 'a' and 'm' carry the same kind
   * of seam where a stem meets a shoulder. Every one of those artefacts sits
   * *inside* the ink, so masking the inside away takes all of them at once and
   * leaves the silhouette — and the counters, which are not ink — untouched.
   *
   * Doubling the width first is what keeps the visible line the thickness the
   * caller asked for, since only half of it now survives the mask.
   */
  const maskPad = strokeWidth * 2;

  const fontStyle = useMemo(
    () => ({
      fontSize: `${fontSize}px`,
      fontWeight,
      letterSpacing: `${letterSpacing}px`,
    }),
    [fontSize, fontWeight, letterSpacing],
  );

  useLayoutEffect(() => {
    const node = strokeTextRef.current;
    if (!node) return undefined;

    let cancelled = false;

    const measure = () => {
      if (cancelled || !strokeTextRef.current) return;

      let bbox: DOMRect;
      try {
        bbox = strokeTextRef.current.getBBox();
      } catch {
        // getBBox throws when the node is not rendered yet.
        return;
      }
      if (!bbox || !bbox.width) return;

      const pad = Math.max(Number(strokeWidth) || 1, fontSize * 0.1);
      const next: Box = {
        x: bbox.x - pad,
        y: bbox.y - pad,
        width: bbox.width + pad * 2,
        height: bbox.height + pad * 2,
      };

      setBox((prev) =>
        prev &&
        Math.abs(prev.x - next.x) < 0.5 &&
        Math.abs(prev.width - next.width) < 0.5 &&
        Math.abs(prev.y - next.y) < 0.5
          ? prev
          : next,
      );
    };

    measure();
    // Re-measure once webfonts land: the first pass runs against the fallback
    // face, and a different face is a different width.
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [characters, fontSize, fontWeight, letterSpacing, strokeWidth]);

  useEffect(() => {
    const root = rootRef.current;
    if (typeof window === "undefined" || !root || !box) return undefined;

    const strokes = gsap.utils.toArray<SVGTSpanElement>(
      root.querySelectorAll("[data-stroke-char]"),
    );
    const fills = gsap.utils.toArray<SVGTSpanElement>(
      root.querySelectorAll("[data-fill-char]"),
    );
    const wipe = wipeRectRef.current;
    if (!strokes.length) return undefined;

    const fillEnabled = fillMode !== "none";
    const useWipe = fillEnabled && fillMode === "wipe";
    const fillDuration = Math.max(0.4, drawDuration * 0.5);
    const staggerConfig: number | gsap.StaggerVars = reverse
      ? { each: stagger, from: "end" }
      : stagger;
    const targets = [...strokes, ...fills, wipe].filter(Boolean);

    const setStart = () => {
      gsap.killTweensOf(targets);
      gsap.set(strokes, { strokeDasharray: dash, strokeDashoffset: dash });
      gsap.set(fills, { opacity: useWipe ? 1 : 0 });
      if (wipe) gsap.set(wipe, { attr: { width: 0 } });
    };

    const setEnd = () => {
      gsap.killTweensOf(targets);
      gsap.set(strokes, { strokeDasharray: dash, strokeDashoffset: 0 });
      gsap.set(fills, { opacity: fillEnabled ? 1 : 0 });
      if (wipe) gsap.set(wipe, { attr: { width: fillEnabled ? box.width : 0 } });
    };

    // Nothing draws itself for anyone who has asked for less motion; the
    // wordmark is simply already finished.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setEnd();
      return () => gsap.killTweensOf(targets);
    }

    const build = () => {
      setStart();
      const tl = gsap.timeline({
        paused: true,
        repeat: trigger === "loop" ? -1 : 0,
        repeatDelay: trigger === "loop" ? 0.9 : 0,
        defaults: { overwrite: "auto" },
      });

      tl.to(
        strokes,
        {
          strokeDashoffset: 0,
          duration: drawDuration,
          ease,
          stagger: staggerConfig,
        },
        0,
      );

      if (useWipe && wipe) {
        tl.to(
          wipe,
          {
            attr: { width: box.width },
            duration: fillDuration,
            ease: "power2.inOut",
          },
          drawDuration + fillDelay,
        );
      } else if (fillEnabled) {
        tl.to(
          fills,
          {
            opacity: 1,
            duration: fillDuration,
            ease: "power2.out",
            stagger: staggerConfig,
          },
          drawDuration + fillDelay,
        );
      }

      return tl;
    };

    let timeline: gsap.core.Timeline | null = null;
    let observer: IntersectionObserver | undefined;
    let removeHover: (() => void) | undefined;

    if (trigger === "hover") {
      // Rests finished, and redraws from the top each time the pointer arrives.
      setEnd();
      const play = () => {
        timeline?.kill();
        timeline = build();
        timeline.play(0);
      };
      root.addEventListener("pointerenter", play);
      removeHover = () => root.removeEventListener("pointerenter", play);
    } else {
      timeline = build();

      if (trigger === "scroll") {
        // -18% on the bottom edge is GSAP's "top 82%": the callback fires once
        // the top of the wordmark has come 82% of the way up the viewport.
        observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              timeline?.play(0);
              observer?.disconnect();
            }
          },
          { rootMargin: "0px 0px -18% 0px" },
        );
        observer.observe(root);
      } else {
        timeline.play(0);
      }
    }

    return () => {
      removeHover?.();
      observer?.disconnect();
      timeline?.kill();
      gsap.killTweensOf(targets);
    };
  }, [box, dash, drawDuration, fillDelay, stagger, ease, trigger, fillMode, reverse]);

  const viewBox = box
    ? `${box.x} ${box.y} ${box.width} ${box.height}`
    : `0 ${-fontSize} 600 ${fontSize * 1.3}`;

  const rootStyle = {
    "--stroke-text-height": `${Math.round(fontSize * 1.3)}px`,
    ...(box
      ? { "--stroke-text-ratio": `${box.width} / ${box.height}` }
      : undefined),
    ...style,
  } as React.CSSProperties;

  return (
    <span
      ref={rootRef}
      data-measured={box ? "true" : undefined}
      className={`stroke-text ${trigger === "hover" ? "stroke-text--hover" : ""} ${className}`.trim()}
      style={rootStyle}
      role="img"
      aria-label={String(text ?? "")}
    >
      <svg
        className="stroke-text__svg"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {box && (
          <defs>
            {fillMode === "wipe" && (
              <clipPath id={wipeId} clipPathUnits="userSpaceOnUse">
                <rect
                  ref={wipeRectRef}
                  x={box.x}
                  y={box.y}
                  width="0"
                  height={box.height}
                />
              </clipPath>
            )}

            {/* White everywhere, black over the letterforms: the stroke keeps
                the half of itself that is outside the ink and loses the half
                that is inside, along with the glyph's own inner seams. The
                region is padded by the full stroke width so the outer edge is
                never clipped by the mask's own bounds. */}
            <mask
              id={outlineId}
              maskUnits="userSpaceOnUse"
              x={box.x - maskPad}
              y={box.y - maskPad}
              width={box.width + maskPad * 2}
              height={box.height + maskPad * 2}
            >
              <rect
                x={box.x - maskPad}
                y={box.y - maskPad}
                width={box.width + maskPad * 2}
                height={box.height + maskPad * 2}
                fill="#fff"
              />
              {/* Same tspan-per-character structure as the copies below, so the
                  browser kerns it into exactly the same positions. One string
                  would be shaped as one run and could land a fraction off. */}
              <text x="0" y="0" fill="#000" stroke="none" style={fontStyle}>
                {characters.map((char, index) => (
                  <tspan key={`m-${index}`}>{char}</tspan>
                ))}
              </text>
            </mask>
          </defs>
        )}

        <text
          ref={strokeTextRef}
          className="stroke-text__stroke"
          x="0"
          y="0"
          fill="none"
          stroke={strokeColor}
          // Doubled and masked back down — see maskPad above. Before the glyphs
          // have been measured there is no mask to halve it, so it stays at the
          // width asked for.
          strokeWidth={box ? strokeWidth * 2 : strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          mask={box ? `url(#${outlineId})` : undefined}
          style={fontStyle}
        >
          {characters.map((char, index) => (
            <tspan data-stroke-char key={`s-${index}`}>
              {char}
            </tspan>
          ))}
        </text>

        <text
          className="stroke-text__fill"
          x="0"
          y="0"
          fill={fillColor}
          stroke="none"
          style={fontStyle}
          clipPath={
            fillMode === "wipe" && box ? `url(#${wipeId})` : undefined
          }
        >
          {characters.map((char, index) => (
            <tspan data-fill-char key={`f-${index}`}>
              {char}
            </tspan>
          ))}
        </text>
      </svg>
    </span>
  );
}

export default StrokeText;
