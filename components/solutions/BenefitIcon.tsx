"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { BenefitIconName } from "@/lib/solutions";

/**
 * Animated line-art icon that plays once, the first time it scrolls into view,
 * then holds on its finished state.
 *
 * The stop is baked into the file rather than timed in JS: each .webp carries a
 * finite loop count sized to land near three seconds, so the browser halts on
 * the last frame by itself. A timer would cut the animation mid-stroke.
 *
 * Until then — and for anyone who prefers reduced motion — the `-still.webp`
 * final frame stands in, so the icon is never missing or half-drawn.
 *
 * `unoptimized` is required; Next's image optimizer would flatten the
 * animation to a single frame.
 */
export function BenefitIcon({ name }: { name: BenefitIconName }) {
  const animated = `/images/${name}.webp`;
  const still = `/images/${name}-still.webp`;

  const [play, setPlay] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // No observer, or motion is unwelcome: leave the still frame in place.
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Warm the HTTP cache so the swap does not stutter. fetch rather than a
    // second <img>: two elements sharing one animated resource can sync
    // playback position, which would drop the opening frames.
    void fetch(animated, { cache: "force-cache" }).catch(() => {});

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setPlay(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [animated]);

  return (
    <span ref={ref} className="block h-12 w-12">
      <Image
        src={play ? animated : still}
        alt=""
        width={128}
        height={128}
        unoptimized
        className="h-12 w-12"
      />
    </span>
  );
}
