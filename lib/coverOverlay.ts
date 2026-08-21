"use client";

import { useSyncExternalStore } from "react";

/**
 * A cover asking the header to get out of its way.
 *
 * The header already goes transparent by itself at the top of any route in its
 * COVER_ROUTES set, and for a cover that is a photograph — one picture, the same
 * from the first paint to the last — that is the whole story. A cover that is a
 * film is not: it is dark for eight seconds and then it lands on a near-white
 * board, and white nav links are legible over the first of those and invisible
 * over the second. Nothing about the route can express that, because it is not a
 * fact about the route. It is a fact about what the picture is doing right now.
 *
 * So the cover says. This is the whole channel: one boolean, set by whatever is
 * playing and read by the bar.
 *
 * Deliberately not React context. Context needs a provider around both ends,
 * which here means wrapping the entire app in a client component to carry one
 * boolean that matters on one route — and every page on the site would pay for
 * it. A module the two of them import costs nothing to the pages that never
 * touch it.
 *
 * The setter is not a hook and can be called from anywhere: an effect, an event
 * handler, a cleanup. What it must always be is *paired* — whatever turns it on
 * owns turning it off again, on unmount included, or the next route inherits a
 * transparent bar over its own opaque page.
 */

let asking = false;
const listeners = new Set<() => void>();

export function askForOverlay(on: boolean) {
  if (asking === on) return;
  asking = on;
  for (const listen of listeners) listen();
}

function subscribe(listen: () => void) {
  listeners.add(listen);
  return () => {
    listeners.delete(listen);
  };
}

const read = () => asking;

/** False on the server, and false for the first client render that has to match
 *  it. Nothing has played yet at that point, so this is also simply true. */
const readOnServer = () => false;

export function useCoverOverlay() {
  return useSyncExternalStore(subscribe, read, readOnServer);
}
