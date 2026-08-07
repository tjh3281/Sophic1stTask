"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/** Arm's resting height above the chip, in % of layer height. Matches .hero-arm. */
const LIFT = 18;

/**
 * How far the arm closes toward its target each 60Hz frame.
 *
 * Most of the smoothing now comes from the page itself — SmoothScroll eases the
 * scroll offset, so scrollY already arrives as a glide rather than in wheel-sized
 * steps. This is only the last little bit of trailing weight on top, tuned tight
 * (~80ms) because stacking two lerps of equal strength is what makes an arm feel
 * like it is dragging behind the scroll rather than responding to it.
 *
 * It also stands alone: if momentum scrolling is off, this still keeps the arm
 * from stepping.
 */
const SMOOTHING = 0.45;

/** Closer than this, in % of layer height, the glide is over — stop the loop. */
const EPSILON = 0.02;

/**
 * How close to docked counts as the needle touching the board, in % of layer
 * height.
 *
 * Deliberately not zero. The arm eases into its target, so the last fraction of
 * a percent takes as long as the first several and waiting for an exact landing
 * would hold the light back for a beat after the needle has visibly arrived.
 * One percent of the layer is well under the width of the needle itself.
 */
const CONTACT = 1;

/* --- The chip ------------------------------------------------------------
   Where the board sits inside hero-scene.webp, as fractions of the artwork
   rather than of the stage.

   It has to be measured against the picture because the stage crops with
   object-cover: the board lands somewhere different in the frame at every
   window size, and a glow pinned to a percentage of the box would drift off
   it the moment the window changed shape. Re-measure these four numbers only
   if the scene photograph is recut.
-------------------------------------------------------------------------- */

/** Centre of the board's teal insert, where the needle comes down. */
const CHIP_U = 0.535;
const CHIP_V = 0.735;

/** Size of the pool of light, as fractions of the artwork. Wide and flat, to
 *  sit on the board in its own perspective — a circle would read as a sticker
 *  floating above the bench rather than as light landing on a surface. */
const CHIP_W = 0.22;
const CHIP_H = 0.1;

/** Aspect of both hero layers, which object-cover fits to the stage. */
const ART_ASPECT = 16 / 9;

/**
 * The hero's right-hand stage: the assembly cell with the arm removed, and the
 * arm keyed onto transparency above it. The cell stays put; only the arm moves,
 * swinging down onto the chip in step with the reader's scroll.
 *
 * Both layers share identical geometry (.hero-layer) so the arm stays
 * registered to the chip however the stage crops.
 *
 * The motion is damped rather than bound rigidly to the scroll offset: scroll
 * sets a target and the arm eases toward it every frame, so a wheel notch reads
 * as a glide instead of a step. Page scrolling itself is left native — no wheel
 * hijacking, so the scrollbar, keyboard, find-in-page and anchor jumps all
 * behave normally.
 *
 * The transform is written straight to the node inside rAF rather than held in
 * state: a scroll-linked animation re-rendering React every frame drops frames.
 * The resting lift lives in CSS so the arm is never briefly docked before
 * hydration, and reduced-motion readers simply keep the docked frame.
 */
export function HeroScene() {
  const frameRef = useRef<HTMLDivElement>(null);
  const armRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);

  /**
   * Lands the pool of light on the board.
   *
   * Separate from the scroll loop below, and deliberately not skipped under
   * reduced motion: that setting leaves the arm at its natural position, which
   * is docked, so the needle is drawn touching the board and the chip should be
   * lit to match. What reduced motion drops is the arrival and the pulse, not
   * the light itself.
   */
  useEffect(() => {
    const frame = frameRef.current;
    const glow = glowRef.current;
    if (!frame || !glow) return;

    const place = () => {
      const width = frame.clientWidth;
      const height = frame.clientHeight;
      if (width === 0 || height === 0) return;

      // Repeat what object-cover does to the layers, so the light sits on the
      // board rather than on a fraction of the box the board happens to be in.
      const cover =
        width / height > ART_ASPECT
          ? { w: width, h: width / ART_ASPECT }
          : { w: height * ART_ASPECT, h: height };
      const originX = (width - cover.w) / 2;
      const originY = (height - cover.h) / 2;

      glow.style.setProperty("--glow-x", `${originX + CHIP_U * cover.w}px`);
      glow.style.setProperty("--glow-y", `${originY + CHIP_V * cover.h}px`);
      glow.style.setProperty("--glow-w", `${CHIP_W * cover.w}px`);
      glow.style.setProperty("--glow-h", `${CHIP_H * cover.h}px`);
    };

    place();

    // The arm never descends under reduced motion, so nothing else will ever
    // switch this on. Light it once and leave it.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      glow.dataset.contact = "true";
    }

    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    const arm = armRef.current;
    if (!frame || !arm) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Measured once here and again only on resize. These are layout reads, and
    // doing them inside the scroll handler put three of them on the critical
    // path of every frame; the runway is viewport-derived, so it cannot change
    // without a resize anyway.
    let range = 1;

    const measure = () => {
      // When the frame is pinned, the runway is the section's overhang: the
      // distance scrolled while the frame stays put. Dock at 75% of it so the
      // arm lands with a beat to spare before the hero releases. Unpinned
      // (below lg) there is no overhang, so fall back to the stage's height.
      const pinned = frame.parentElement;
      const runway = pinned?.parentElement
        ? pinned.parentElement.offsetHeight - pinned.offsetHeight
        : 0;
      range = runway > 40 ? runway * 0.75 : frame.offsetHeight * 0.35;
    };

    // How far through the descent we are, 0 to 1. The hero sits at the top of
    // the document, so scrollY is exactly how far it has been pulled up.
    const progressNow = () =>
      Math.min(1, Math.max(0, window.scrollY / range));

    // Where the arm should end up for the current scroll position.
    const targetFor = () => {
      // Ease out: quick to close the gap, slowing as it meets the chip.
      const progress = progressNow();
      const eased = progress * (2 - progress);
      return -LIFT * (1 - eased);
    };

    measure();
    let target = targetFor();
    let current = target;
    let frameId = 0;
    let previous = 0;

    // Written as an attribute rather than through state for the same reason the
    // transform is: this runs inside rAF, and a React render every frame drops
    // them. Guarded because the value only flips twice a visit, and writing an
    // unchanged attribute still invalidates style.
    let touching = false;
    const setContact = (next: boolean) => {
      if (next === touching) return;
      touching = next;
      if (glowRef.current) glowRef.current.dataset.contact = String(next);
    };

    const paint = () => {
      arm.style.transform = `translate3d(0, ${current.toFixed(3)}%, 0)`;
      setContact(current > -CONTACT);
    };

    const tick = (now: number) => {
      // Normalise the step to a 60Hz frame, so the glide lasts the same wall
      // time on a 120Hz display. Capped, or a backgrounded tab resumes with one
      // enormous delta and the arm teleports.
      const delta = previous ? Math.min(now - previous, 64) : 16.7;
      previous = now;

      const alpha = 1 - Math.pow(1 - SMOOTHING, delta / 16.7);
      current += (target - current) * alpha;

      if (Math.abs(target - current) < EPSILON) {
        // Settled. Land exactly on the target and stop — an idle rAF loop keeps
        // waking the compositor for nothing.
        current = target;
        paint();
        frameId = 0;
        previous = 0;
        return;
      }

      paint();
      frameId = requestAnimationFrame(tick);
    };

    const wake = () => {
      target = targetFor();
      if (!frameId) {
        previous = 0;
        frameId = requestAnimationFrame(tick);
      }
    };

    const onResize = () => {
      measure();
      wake();
    };

    paint();
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", onResize);
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
      {/* Between the two layers on purpose: the light belongs on the board, so
          the needle drawn in the arm layer stays crisp on top of it rather than
          being washed out by it. */}
      <span ref={glowRef} aria-hidden="true" className="hero-chip-glow" />
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
