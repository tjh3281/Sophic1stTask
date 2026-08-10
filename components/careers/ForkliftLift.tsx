"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import "./ForkliftLift.css";

/**
 * "Employees are the driving force", carried on the fork of a forklift.
 *
 * The words are the load. They sit on the tines, and the fork lowers down its
 * mast as the section passes the screen — full height when it arrives, at the
 * foot by the time it leaves — so the heading rides down with it.
 *
 * The truck does not move. It is bolted to the page and only the fork travels,
 * which is the whole difference between a forklift working and a forklift
 * floating. Both layers live inside the moving element and the truck cancels
 * the movement with a transform of its own; see the CSS.
 *
 * --lift is written straight to the DOM from a rAF rather than held in state.
 * This runs on every scroll event, and a re-render per frame is how a section
 * like this starts dropping them.
 */

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Where in the viewport the fork is at full height, and where it reaches the
 *  mast foot — as fractions of the screen, top down. Generous at both ends so
 *  the whole travel happens while the section is actually being read. */
const FROM = 0.7;
const TO = 0.3;

export function ForkliftLift({ children }: { children: React.ReactNode }) {
  const rigRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rig = rigRef.current;
    if (!rig) return;

    // Anyone who has asked for less motion keeps the fork where it starts:
    // raised, with the words on it. The still is the same picture, just not
    // driven by the scrollbar.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Below lg the machine is not rendered at all. Checked per frame rather
    // than once, because a window can be resized across the breakpoint.
    const desktop = window.matchMedia("(min-width: 64rem)");

    let frame = 0;

    const update = () => {
      frame = 0;
      if (!desktop.matches) return;

      const rect = rig.getBoundingClientRect();
      const height = window.innerHeight;
      const span = (FROM - TO) * height + rect.height;
      const lift = span > 0 ? clamp01((FROM * height - rect.top) / span) : 0;

      rig.style.setProperty("--lift", lift.toFixed(4));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={rigRef}
      className="forklift-rig relative lg:sticky lg:top-28 lg:self-start"
    >
      <div className="forklift-load">
        {/* Before the words in the markup, and behind them on the page. */}
        <div aria-hidden="true" className="forklift-machine">
          <Image
            src="/images/forklift-truck.png"
            alt=""
            width={560}
            height={630}
            sizes="14rem"
            className="forklift-truck"
          />
          <Image
            src="/images/forklift-fork.png"
            alt=""
            width={480}
            height={402}
            sizes="12rem"
            className="forklift-fork"
          />
        </div>

        <div className="forklift-words">{children}</div>
      </div>
    </div>
  );
}
