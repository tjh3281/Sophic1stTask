"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import "./MedalDrop.css";

/**
 * The medal, lowered on its ribbon when the reader leaves the hero.
 *
 * All this component does is decide *when*. The movement itself is six CSS
 * animations across three linked pieces, described in MedalDrop.css; there is
 * no per-frame JavaScript here, and nothing is driven off the scroll position
 * directly. That matters on this page in particular — the site runs momentum
 * scrolling, so a scroll-linked animation would be recomputing transforms on
 * every frame of every glide, for an effect that plays exactly once.
 *
 * Once, and then it stays. Retriggering on re-entry is what the site's Reveal
 * component does and it is right for a paragraph fading up, but a medal that
 * is lowered again every time you scroll past stops being an arrival and
 * becomes a loop. So the observer disconnects the moment it fires, and
 * scrolling back to the hero leaves the medal hanging where it landed.
 */

/**
 * How far the section has to have come up the screen before the medal starts
 * down.
 *
 * A negative bottom margin shrinks the observer's idea of the viewport from
 * below, so this fires when the rig's top edge crosses the 76% line rather
 * than when it first appears at the bottom. That is roughly the point where
 * the reader has committed to the second section instead of merely catching
 * the top of it — early enough that the drop is under way as the section
 * rises, late enough that it cannot go off while the hero still fills the
 * screen.
 */
const TRIGGER_ROOT_MARGIN = "0px 0px -24% 0px";

/**
 * When everything has stopped: the last animation is the medal's swing, at
 * 1280ms of delay plus 4200ms of run. Rounded up, and used only to take the
 * compositor hints back off — nothing visible depends on the exact number.
 */
const SETTLED_AFTER_MS = 5700;

export function MedalDrop() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let settleTimer: number | undefined;

    const start = () => {
      root.dataset.state = "drop";
      settleTimer = window.setTimeout(() => {
        root.dataset.state = "settled";
      }, SETTLED_AFTER_MS);
    };

    // No observer means no way to know where the reader is, and a medal that
    // never arrives is worse than one that was already there.
    if (typeof IntersectionObserver === "undefined") {
      start();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          start();
        }
      },
      { rootMargin: TRIGGER_ROOT_MARGIN },
    );

    // Deliberately observing this element and not the rig inside it. The rig
    // spends the whole of its first second translated up above the section,
    // where the section's overflow clip hides it — and a clipped element has
    // no intersection with the viewport, so an observer pointed at it would
    // wait for a signal that only arrives after the thing it is meant to
    // trigger. This wrapper is never transformed, so its box sits exactly
    // where the rig is going to land.
    observer.observe(root);

    return () => {
      observer.disconnect();
      window.clearTimeout(settleTimer);
    };
  }, []);

  return (
    <div ref={rootRef} data-state="idle" className="medal-hang">
      <div className="medal-hang__arm">
        {/* The ribbon and the clasp are decorative — they are how the medal
            hangs, not what it says. The disc carries the alt text for all
            three, because the credentials stamped on its face are now the
            only place they are stated: the list that used to sit beside it
            has been replaced by the certificate. Its own type is a couple of
            pixels tall at this size, so nobody is reading it off the picture
            either way. */}
        <Image
          className="medal-hang__ribbon"
          src="/images/medal-ribbon.png"
          alt=""
          width={294}
          height={330}
        />
        {/* The clasp's own anchor, at the point the ribbon's two straps
            converge. Both the clasp and the disc hang off it. */}
        <div className="medal-hang__joint">
          {/* Written before the disc so it paints behind it. A clasp is a
              loop the ribbon is threaded through and the medal hangs off; the
              medal's top edge covers its lower part, not the other way round.
              Painted over the disc it read as a bar laid across the face of
              the medal — the one part of the rig that looked stuck on rather
              than assembled. */}
          <Image
            className="medal-hang__clasp"
            src="/images/medal-clasp.png"
            alt=""
            width={142}
            height={43}
          />
          <div className="medal-hang__swivel">
            {/* Cropped from the supplied `latest medal.png`, which is the disc
                sitting in the middle of a 1366x768 transparent sheet. The crop
                is the opaque box read off its alpha channel — 705x708 at
                (329, 23) — so the disc fills this file edge to edge exactly as
                the old one did. That is what keeps it where it was: the
                stylesheet hangs it by the top edge and the horizontal centre of
                the file, and the crop leaves both unchanged.

                It is also 2.6x the resolution of the drawing it replaces, which
                is the point — the old face was a 268px file drawn at 268px, so
                every retina screen was looking at an upscale. */}
            <Image
              className="medal-hang__disc"
              src="/images/medal-disc.webp"
              alt="Sophic Automation awards and certifications: ISO 9001:2015 Quality Management System, ISO/IEC 27001:2022 Information Security Management System, Dun & Bradstreet Business Eminence Awards 2024 Malaysia, and Intel Partner Gold."
              width={705}
              height={708}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
