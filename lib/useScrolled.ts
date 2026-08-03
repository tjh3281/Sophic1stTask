"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/**
 * True once the page is scrolled past `threshold` pixels.
 *
 * useSyncExternalStore rather than an effect + state: it reads the real scroll
 * position on the very first client render, so a reload part-way down the page
 * does not briefly show the transparent header over white content.
 */
export function useScrolled(threshold = 24) {
  return useSyncExternalStore(
    subscribe,
    () => window.scrollY > threshold,
    () => false,
  );
}
