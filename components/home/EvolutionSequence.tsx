"use client";

import { useEffect, useRef } from "react";

/**
 * The evolution row: the five figures, now a clip, with "er" trailing them.
 *
 * The figures used to be five cutouts stepping in on staggered CSS delays. They
 * are one video now, and the whole point of this component is that "er" is no
 * longer on a timer of its own. A delay guessed against the clip only lines up
 * on the machine it was guessed on: the video has to be fetched, decoded and
 * allowed to autoplay first, and on a slow connection a fixed delay drops "er"
 * onto the page while the figures are still arriving — or worse, before any of
 * them have. So the reveal is driven from the clip's own playback position, and
 * the two stay linked however long the video takes to get going.
 *
 * That matters more now the whole thing repeats. The clip is cut to loop, and
 * "er" has to come and go with it: appear behind the fifth figure, hold while
 * all five are standing, and be gone again before they collapse back to one.
 * Anchoring both edges to playback position is what keeps them in step over an
 * unbounded number of cycles, where even a small error in a fixed delay would
 * accumulate into a visible drift.
 *
 * Two phases, published as a data attribute the stylesheet keys off:
 *
 *   playing — the clip is building or clearing; "er" is held back.
 *   built   — all five are standing, so "er" is in.
 *
 * The attribute is written straight to the node rather than held in state:
 * this changes twice per four-second cycle forever, there is nothing for React
 * to re-render, and the video element must not be torn down mid-playback.
 * Reveal does the same thing for the same reason.
 */

/**
 * Seconds into the clip at which the fifth figure has finished arriving.
 *
 * Measured, not eyeballed: the ink's right-hand extent was sampled frame by
 * frame across the clip, and this is where it reaches the value it then holds.
 * It needs re-measuring if the video is ever recut.
 */
const SETTLE_AT = 1.93;

/**
 * Seconds at which "er" starts leaving again.
 *
 * The clip is cut to loop: after 4.04 of its 4.1 seconds it snaps back to the
 * lone first figure so it can run again seamlessly. "er" has to be gone by
 * then, or it is left standing beside the gap where the other four were. This
 * leaves room for the exit transition to finish, and for the check to overshoot
 * on browsers where it runs on timeupdate — which fires about four times a
 * second — rather than per rendered frame.
 */
const CLEAR_AT = 3.55;

/** A frame inside the hold, used as the still under reduced motion. */
const HOLD_FRAME = 3;

/**
 * How long to wait on the video before revealing "er" anyway.
 *
 * Autoplay can be refused, a file can 404, a decoder can fail. None of those
 * are reasons to leave a word permanently invisible, so every path out of this
 * component ends with the sequence built.
 */
const FALLBACK_MS = 6000;

/** requestVideoFrameCallback is not in every TypeScript lib.dom yet. */
type FrameCallbackVideo = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: () => void) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

export function EvolutionSequence({ src }: { src: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current as FrameCallbackVideo | null;
    if (!root || !video) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** Playback never got going; hold the finished state and stop tracking. */
    let stalled = false;
    let everBuilt = false;
    let frameHandle: number | null = null;

    const setPhase = (phase: "playing" | "built") => {
      if (phase === "built") everBuilt = true;
      if (root.getAttribute("data-phase") !== phase) {
        root.setAttribute("data-phase", phase);
      }
    };

    const giveUp = () => {
      if (stalled) return;
      stalled = true;
      setPhase("built");
    };

    const fallback = window.setTimeout(() => {
      if (!everBuilt) giveUp();
    }, FALLBACK_MS);

    // Reduced motion gets the finished picture rather than the assembly, and
    // no loop: park the clip on a frame inside its hold, where all five are
    // standing, and leave it there.
    if (still) {
      const park = () => {
        try {
          video.currentTime = Math.min(HOLD_FRAME, video.duration || HOLD_FRAME);
        } catch {
          // A browser that will not seek yet still shows frame one, which is
          // one figure rather than five — not worth failing the page over.
        }
        setPhase("built");
      };
      if (video.readyState >= 1) park();
      else video.addEventListener("loadedmetadata", park, { once: true });

      return () => {
        window.clearTimeout(fallback);
        video.removeEventListener("loadedmetadata", park);
      };
    }

    const tick = () => {
      if (stalled) return;
      const t = video.currentTime;
      setPhase(t >= SETTLE_AT && t < CLEAR_AT ? "built" : "playing");
    };

    // Per rendered frame where that is available, which is what keeps both
    // edges of the reveal tight against the figures. timeupdate is the
    // fallback; the two thresholds above are set far enough inside the clip to
    // absorb its coarser resolution.
    const watch = () => {
      frameHandle = null;
      if (stalled || video.paused) return;
      tick();
      if (video.requestVideoFrameCallback) {
        frameHandle = video.requestVideoFrameCallback(watch);
      }
    };

    const startWatching = () => {
      if (frameHandle === null && video.requestVideoFrameCallback && !stalled) {
        frameHandle = video.requestVideoFrameCallback(watch);
      }
    };

    const stopWatching = () => {
      if (frameHandle !== null) {
        video.cancelVideoFrameCallback?.(frameHandle);
        frameHandle = null;
      }
    };

    video.addEventListener("playing", startWatching);
    video.addEventListener("timeupdate", tick);
    video.addEventListener("error", giveUp);

    // It loops for as long as the page is open, so it does not get to run while
    // nobody is looking at it — this sits at the top of the page and would
    // otherwise decode video the entire time someone reads the bottom of it.
    let onScreen = true;
    const resume = () => {
      if (stalled || !onScreen || document.hidden) return;
      void video.play().catch(giveUp);
      startWatching();
    };
    const suspend = () => {
      video.pause();
      stopWatching();
    };

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver === "undefined") {
      resume();
    } else {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            onScreen = entry.isIntersecting;
            if (onScreen) resume();
            else suspend();
          }
        },
        { rootMargin: "120px" },
      );
      io.observe(root);
    }

    const onVisibilityChange = () => {
      if (document.hidden) suspend();
      else resume();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearTimeout(fallback);
      stopWatching();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      video.removeEventListener("playing", startWatching);
      video.removeEventListener("timeupdate", tick);
      video.removeEventListener("error", giveUp);
    };
  }, []);

  return (
    // Decorative in full: five silhouettes and two letters that only mean
    // anything as a picture. The hero's h1 carries the words.
    <div
      ref={rootRef}
      aria-hidden="true"
      // Starts on neither phase, so the ground under the figures still gets to
      // draw itself in on the first cycle rather than being painted there.
      data-phase="idle"
      className="hero-evolution mt-2"
    >
      <div className="hero-evolution__row">
        {/* The window onto the clip. The video inside is blown up and pushed
            off its own edges so that the figures — which sit in the middle of a
            16:9 frame with a lot of black around them — fill this box exactly.
            See the crop values in Hero.css. */}
        <div className="hero-evolution__stage">
          <video
            ref={videoRef}
            className="hero-evolution__video"
            src={src}
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            tabIndex={-1}
          />
        </div>
        <span className="hero-er">er</span>
      </div>
      <div className="hero-evolution__track" />
    </div>
  );
}
