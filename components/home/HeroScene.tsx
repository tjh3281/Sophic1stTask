"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/** Arm's resting height above the chip, in % of layer height. Matches .hero-arm. */
const LIFT = 18;

/**
 * The hero's right-hand stage: the assembly cell with the arm removed, and the
 * arm keyed onto transparency above it. The cell stays put; only the arm moves,
 * swinging down onto the chip in step with the reader's scroll.
 *
 * Both layers share identical geometry (.hero-layer) so the arm stays
 * registered to the chip however the stage crops.
 *
 * The transform is written straight to the node inside rAF rather than held in
 * state: a scroll-linked animation re-rendering React every frame drops frames.
 * The resting lift lives in CSS so the arm is never briefly docked before
 * hydration, and reduced-motion readers simply keep the docked frame.
 */
export function HeroScene() {
  const frameRef = useRef<HTMLDivElement>(null);
  const armRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const arm = armRef.current;
    if (!frame || !arm) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let queued = 0;
    let lastArm = Number.NaN;

    const apply = () => {
      queued = 0;
      // The hero sits at the top of the document, so scrollY is exactly how far
      // it has been pulled up.
      //
      // When the frame is pinned, the runway is the section's overhang: the
      // distance scrolled while the frame stays put. Dock at 75% of it so the
      // arm lands with a beat to spare before the hero releases. Unpinned
      // (below lg) there is no overhang, so fall back to the stage's height.
      const pinned = frame.parentElement;
      const runway = pinned?.parentElement
        ? pinned.parentElement.offsetHeight - pinned.offsetHeight
        : 0;
      const range = runway > 40 ? runway * 0.75 : frame.offsetHeight * 0.35;
      const progress = Math.min(1, Math.max(0, window.scrollY / range));
      // Ease out: quick to close the gap, slowing as it meets the chip.
      const eased = progress * (2 - progress);

      const armOffset = -LIFT * (1 - eased);
      if (Math.abs(armOffset - lastArm) < 0.05) return;
      lastArm = armOffset;

      arm.style.transform = `translate3d(0, ${armOffset.toFixed(2)}%, 0)`;
    };

    const onScroll = () => {
      if (!queued) queued = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (queued) cancelAnimationFrame(queued);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={frameRef}
      className={[
        // Mobile: an in-flow panel under the copy.
        "hero-stage relative mx-4 mb-14 aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-surface sm:mx-6",
        // lg+: full-bleed stage pinned to the right of the section.
        "lg:absolute lg:inset-y-0 lg:right-0 lg:m-0 lg:aspect-auto lg:w-[62%] lg:rounded-none lg:border-0",
      ].join(" ")}
    >
      <div className="hero-layer">
        <Image
          src="/images/hero-scene.webp"
          alt="Automated assembly cell with a circuit board on the line"
          fill
          priority
          sizes="(min-width: 1024px) 62vw, 100vw"
          className="object-cover"
        />
      </div>
      <div ref={armRef} className="hero-layer hero-arm">
        <Image
          src="/images/hero-arm.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 62vw, 100vw"
          className="object-cover"
        />
      </div>
      {/* Blurs and lightens the strip the headline crosses. lg only — below
          that the copy sits above the image rather than over it. */}
      <div aria-hidden="true" className="hero-soften absolute inset-0 hidden lg:block" />
    </div>
  );
}
