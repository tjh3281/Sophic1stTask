"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * A looping illustration that holds a still frame until somebody is looking at
 * it.
 *
 * Three things this is doing, none of which a plain <Image> would:
 *
 *   1. `unoptimized`. Next's image optimizer flattens an animated file to its
 *      first frame, so an animation that goes through it arrives as a picture
 *      of itself. Both files here are already WebP and already sized for the
 *      box, so there is nothing to optimize away.
 *
 *   2. It does not fetch the animation until the reader is near it. These files
 *      are hundreds of kilobytes — an animation is every frame of itself — and
 *      a decorative one at the bottom of a page should not be on the critical
 *      path of a page nobody has scrolled yet. The observer runs 200px early so
 *      the network has a head start on the swap.
 *
 *   3. Reduced motion gets the still and stays there. This loops for as long as
 *      the page is open, which is exactly the kind of movement that setting
 *      exists to stop.
 *
 * The two images are layered rather than swapped in place. Changing `src` on
 * one element blanks it until the new file decodes, and on something this size
 * that is a visible hole; leaving the still underneath and laying the animation
 * over it means there is never a frame with nothing in it.
 *
 * There is no fade between them and no `loaded` state deciding when to run one.
 * The still is frame one of the animation and the animation opens on frame one,
 * so the moment it paints there is nothing to see: an <img> that has not
 * arrived yet draws nothing at all, and what shows through is the frame it is
 * about to replace. A cross-fade here would be two identical pictures
 * dissolving into each other, and it would depend on an onLoad that quietly
 * never fires when the file came from cache.
 *
 * BenefitIcon does the same three things at icon scale and predates this. It
 * has not been moved onto this component because its animations play once and
 * stop, which is a different contract from a loop, and rewiring the icons on
 * four solution pages to prove the point is not worth the risk.
 */
export function MotionArt({
  animated,
  still,
  alt,
  width,
  height,
  className,
}: {
  /** The looping file. WebP or GIF; not run through the optimizer. */
  animated: string;
  /** A single frame of it, shown until the animation is wanted. */
  still: string;
  /** Empty for decoration, which is what these usually are. */
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    // No observer, or motion is unwelcome: the still frame is the finished
    // state, not a placeholder, so there is nothing to fall back to.
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setPlay(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={rootRef} className={cn("relative block", className)}>
      {/* In flow, so it is what gives the box its height. */}
      <Image
        src={still}
        alt={alt}
        width={width}
        height={height}
        unoptimized
        className="block h-auto w-full"
      />

      {play && (
        <Image
          src={animated}
          alt=""
          width={width}
          height={height}
          unoptimized
          className="absolute inset-0 block h-auto w-full"
        />
      )}
    </span>
  );
}
