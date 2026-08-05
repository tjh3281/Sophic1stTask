"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/lib/solutions";

/** How long each frame holds before the next fades in. */
const DWELL = 4500;
/** Fraction of the drag actually applied to the stage, so it lags the hand. */
const DRAG_RESISTANCE = 0.28;
/** Furthest the stage will travel while being dragged, in px. */
const DRAG_LIMIT = 90;

/**
 * The rotating half of a showcase hero.
 *
 * Shares .hero-stage and .hero-soften with the home page, so it dissolves into
 * the copy column the same way rather than sitting in the page as a picture in
 * a box. The frames are stacked and cross-faded — no sliding — because a
 * horizontal slide would fight the masked left edge, where a moving image would
 * be visibly cut off mid-travel.
 *
 * Dragging is handled with pointer events, which covers mouse, touch and pen in
 * one path. The stage follows the hand a little, then springs back and commits
 * to the next or previous frame once the drag is long enough to have been
 * meant. Vertical scrolling is left to the browser via touch-action, so a
 * thumb swiping down the page still scrolls it.
 *
 * The images carry no alt text. Only one is visible at a time, so six
 * alternatives would all be announced at once; the caption below carries the
 * name as real text instead, and the dots name their own slide.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: number; startX: number; moved: number } | null>(
    null,
  );

  useEffect(() => {
    if (slides.length < 2 || hovered || dragging) return;
    // Auto-advance is motion the reader did not ask for, and it never stops.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      DWELL,
    );
    return () => window.clearInterval(timer);
  }, [slides.length, hovered, dragging]);

  // Transform is written straight to the node: a drag fires pointermove far
  // faster than this tree needs to re-render.
  const shift = (px: number, animate: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = animate
      ? "transform 320ms var(--ease-out-quart)"
      : "none";
    track.style.transform = px ? `translate3d(${px}px, 0, 0)` : "";
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (slides.length < 2) return;
    // Let the dots take their own clicks.
    if ((event.target as HTMLElement).closest("button")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    dragRef.current = { id: event.pointerId, startX: event.clientX, moved: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    drag.moved = event.clientX - drag.startX;
    const damped =
      Math.sign(drag.moved) *
      Math.min(Math.abs(drag.moved) * DRAG_RESISTANCE, DRAG_LIMIT);
    shift(damped, false);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    shift(0, true);

    // Scaled to the stage, so the gesture asks the same effort on a phone as on
    // a wide monitor, but never more than a comfortable flick.
    const threshold = Math.min(
      80,
      Math.max(36, event.currentTarget.clientWidth * 0.12),
    );
    if (Math.abs(drag.moved) < threshold) return;

    const direction = drag.moved < 0 ? 1 : -1;
    setIndex(
      (current) => (current + direction + slides.length) % slides.length,
    );
  };

  const active = slides[index];

  return (
    <div
      className={[
        "hero-stage relative mx-4 mb-14 aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-surface sm:mx-6",
        "lg:absolute lg:inset-y-0 lg:right-0 lg:m-0 lg:aspect-auto lg:w-[62%] lg:rounded-none lg:border-0",
        // pan-y keeps vertical page scrolling with the browser; only sideways
        // movement is ours. select-none stops a drag turning into a selection.
        "touch-pan-y select-none",
        slides.length > 1 &&
          (dragging ? "cursor-grabbing" : "cursor-grab"),
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* Everything that moves with the hand lives on this one node. */}
      <div ref={trackRef} className="absolute inset-0">
        {slides.map((slide, position) => (
          <div
            key={slide.image}
            aria-hidden={position !== index}
            className="hero-layer transition-opacity duration-700 ease-out motion-reduce:transition-none"
            style={{ opacity: position === index ? 1 : 0 }}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              draggable={false}
              // Only the first frame is worth blocking the paint on; the rest
              // are seconds away at best.
              priority={position === 0}
              sizes="(min-width: 1024px) 62vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Softens the seam where the photo fades into the copy. */}
      <div aria-hidden="true" className="hero-soften absolute inset-0 hidden lg:block" />

      {/* Caption and controls, held clear of the masked left edge. */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-end gap-3 p-5 sm:p-6 lg:pr-10">
        <p className="rounded-full bg-slate-950/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
          {active.title}
        </p>
        <div className="flex gap-2">
          {slides.map((slide, position) => (
            <button
              key={slide.image}
              type="button"
              aria-label={slide.title}
              aria-current={position === index}
              onClick={() => setIndex(position)}
              className={[
                "h-2 rounded-full transition-[width,background-color] duration-300 ease-out motion-reduce:transition-none",
                position === index
                  ? "w-6 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/80",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
