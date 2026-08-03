"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/** Fraction of the element that must be visible before it animates in. */
const SHOW_RATIO = 0.1;

/**
 * Animates its children in whenever they scroll into view — every time, not
 * just the first.
 *
 * Showing and hiding use different boundaries on purpose: an element reveals
 * once 10% of it is visible, but only resets after it has left the viewport
 * completely. That gap stops it flickering when the user parks the scroll
 * position right on the trigger line, and means the reset is never seen.
 *
 * Toggles a data attribute on the DOM node directly rather than going through
 * state — there is nothing for React to re-render, and keeping the work out of
 * the render cycle avoids dropped frames.
 *
 * The motion itself lives in globals.css, including the prefers-reduced-motion
 * opt-out.
 */
export function Reveal({
  delay = 0,
  variant = "rise",
  once = false,
  className,
  children,
}: {
  /** Stagger offset in ms. Keep the total under ~300ms across a group. */
  delay?: number;
  /** "rise" travels up 12px; "settle" scales from 0.97. */
  variant?: "rise" | "settle";
  /** Animate only on first entry instead of every re-entry. */
  once?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Without IntersectionObserver, show everything rather than hiding it.
    if (typeof IntersectionObserver === "undefined") {
      element.setAttribute("data-visible", "true");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement;

          if (entry.intersectionRatio >= SHOW_RATIO) {
            target.setAttribute("data-visible", "true");
            if (once) observer.unobserve(target);
          } else if (!entry.isIntersecting && !once) {
            // Fully out of view — arm the animation for the next entry.
            target.setAttribute("data-visible", "false");
          }
        }
      },
      { threshold: [0, SHOW_RATIO] },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={cn(variant === "settle" ? "reveal-settle" : "reveal", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
