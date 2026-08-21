import type Lenis from "lenis";

/**
 * A way for the page to ask the momentum scroller to go somewhere.
 *
 * Without this, anything that wants to scroll the page programmatically has to
 * call `window.scrollTo`, and that quietly does not work while Lenis is
 * running. An instant `scrollTo` survives, because Lenis picks up native scroll
 * events it did not cause. A *smooth* one does not: the browser animates it
 * over a dozen frames, and Lenis writes its own idea of the position back on
 * every one of those frames, so the scroll is undone as fast as it happens.
 * The call succeeds, no error is thrown, and the page simply never moves.
 *
 * So the instance is registered here when SmoothScroll starts it, and taken
 * back when it stops. Callers ask for a scroll and get the right one either
 * way: Lenis eases it if Lenis is running, and the browser does it natively if
 * it is not — which is the case under prefers-reduced-motion, where Lenis never
 * starts at all and instant is the correct behaviour anyway.
 */

let instance: Lenis | null = null;

/** Called by SmoothScroll. Nothing else should be setting this. */
export function registerSmoothScroll(next: Lenis | null) {
  instance = next;
}

export function scrollToY(top: number, options?: { immediate?: boolean }) {
  const immediate = options?.immediate ?? false;

  if (instance) {
    instance.scrollTo(top, { immediate });
    return;
  }

  window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
}

/* --- Holding the page still ------------------------------------------------
   Both halves are needed and they cover different inputs. Lenis owns the wheel
   and keyboard on desktop, and a page with `overflow: hidden` under it still
   scrolls, because Lenis writes the offset itself and never asks the document
   whether it is allowed to. Touch is the other way round: Lenis deliberately
   leaves it native, so on a phone the only thing that stops a drag is the
   document.

   Restoring rather than clearing. `overflow` may well have been set by
   something else — a dialog, a drawer — and a lock that ends by writing "" puts
   the page back the way *this* module found it rather than the way it was.
-------------------------------------------------------------------------- */

let heldOverflow: string | null = null;

export function holdScroll() {
  if (heldOverflow !== null) return;
  instance?.stop();
  heldOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = "hidden";
}

export function releaseScroll() {
  if (heldOverflow === null) return;
  document.documentElement.style.overflow = heldOverflow;
  heldOverflow = null;
  instance?.start();
}
