"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { registerSmoothScroll } from "@/lib/smoothScroll";

/**
 * useLayoutEffect, minus the server warning.
 *
 * The route-change handler below has to run before the browser paints, or the
 * reader sees one frame of the old scroll position. That means a layout effect,
 * and a layout effect in a component that also renders on the server warns.
 */
const useBeforePaint =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Momentum scrolling for the whole page.
 *
 * The wheel no longer moves the page directly. Lenis collects the input,
 * carries a velocity, and eases the scroll position toward it every frame — so
 * a notch of the wheel glides to a stop instead of jumping, and everything
 * driven by scroll position inherits that smoothness for free.
 *
 * It drives the real scroll offset (`wrapper.scrollTo`) rather than translating
 * a wrapper element, which is why the rest of the site is unaffected: the
 * hero's `position: sticky` pin still pins, `window.scrollY` still reads true,
 * and the reveal and counter observers still fire normally.
 *
 * Touch is deliberately left native. Phones and trackpads already have their
 * own inertia, and overriding it is the thing that makes smooth-scroll sites
 * feel wrong on a phone.
 *
 * Renders nothing.
 */
export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  /** Set when the last navigation came from Back or Forward. */
  const restoringRef = useRef(false);
  /** False until the first client-side navigation. */
  const navigatedRef = useRef(false);

  useEffect(() => {
    // A reader who asked for less motion did not ask for the page to coast.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      // Fraction of the remaining distance covered per frame. 0.1 is the
      // familiar weight; lower glides longer, higher tightens toward native.
      lerp: 0.1,
      // Take over in-page jumps too, so the hero's "Explore solutions" anchor
      // eases down instead of snapping while the rest of the page glides.
      anchors: true,
      // Lenis runs its own requestAnimationFrame loop.
      autoRaf: true,
    });

    lenisRef.current = lenis;
    // Published for anything on a page that needs to scroll the reader
    // somewhere. See lib/smoothScroll — a plain window.scrollTo cannot do it
    // while this is running.
    registerSmoothScroll(lenis);

    return () => {
      registerSmoothScroll(null);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Back and Forward should land where they left off, so those are the one
  // case the handler below leaves alone.
  useEffect(() => {
    const onPopState = () => {
      restoringRef.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Put the reader at the top of every page they navigate to.
  //
  // Lenis keeps its own idea of the scroll position and writes it to the page
  // each frame. It picks up scrolling it did not cause by listening for native
  // scroll events — but it ignores those while its own glide is still running,
  // which is exactly the state a link click interrupts. Next resets the page to
  // the top, Lenis discards that event, and on its next frame it puts the old
  // offset back. On a shorter page that offset clamps to the maximum, so the
  // new page opens at its end.
  //
  // This sets the position rather than reading it. Reading looks tidier, but a
  // route change runs inside a transition, so effects are deferred and Lenis
  // can get a frame in first — the value read back is then the stale offset it
  // just restored, and syncing to it pins the very position being fixed.
  useBeforePaint(() => {
    // Nothing to correct on first paint, and forcing the top here would
    // override a deep link that arrived pointing at an anchor. Checked before
    // the instance, because this runs as a layout effect and so beats the
    // passive effect that constructs Lenis — on mount there is nothing here
    // yet, and leaving the flag unset would skip the first real navigation.
    if (!navigatedRef.current) {
      navigatedRef.current = true;
      return;
    }

    // No instance means reduced motion, where Lenis never starts and Next's
    // own scroll handling was never interfered with.
    const lenis = lenisRef.current;
    if (!lenis) return;

    const restoring = restoringRef.current;
    restoringRef.current = false;

    const sync = () => {
      // The new page is a different height, and Lenis only remeasures on a
      // debounced observer callback — without this the scroll ceiling is still
      // the old page's, which is what turns a stale offset into "the bottom".
      lenis.resize();
      if (restoring) {
        lenis.scrollTo(window.scrollY, { immediate: true, force: true });
        return;
      }
      // Both halves are needed: the first moves the page, the second tells
      // Lenis that is where the page now is, so it stops steering back.
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true, force: true });
    };

    sync();
    // Next applies its own scroll during the commit, ahead of this — except
    // when the incoming page suspends, where it lands a commit later and would
    // otherwise overwrite what we just set. One deferred pass covers that.
    const frame = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
