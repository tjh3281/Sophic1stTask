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
 * How fast the clip runs.
 *
 * The figures assemble a shade quicker than the file was cut for, which is all
 * this is. Nothing else in the component has to move with it: every threshold
 * below is a position in the clip's own timeline rather than a wall-clock
 * delay, and `currentTime` still reports media seconds whatever rate it is
 * played at. That is the dividend of driving the reveal off playback position
 * instead of a timer — see the note at the top. A fixed delay would have needed
 * dividing by this, and would have been wrong on the first machine that took a
 * moment longer to start the video.
 *
 * The one number worth re-checking is CLEAR_AT's margin, and it holds: on
 * engines without requestVideoFrameCallback the check runs on `timeupdate`,
 * which fires about four times a wall second and so lands every 0.29 media
 * seconds at this rate rather than every 0.25. CLEAR_AT still sits 0.49 ahead
 * of the loop point, which absorbs it with room to spare.
 */
const RATE = 1.15;

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
 *
 * Showing "er" here is all this does. It used to also stop the component
 * tracking playback, which turned a slow start into a permanent one: scroll
 * past the hero inside six seconds and the clip was written off before it had
 * finished its first cycle, so coming back to the top found it frozen. The
 * clip is allowed to start late and take over whenever it does.
 */
const FALLBACK_MS = 6000;

/**
 * How often to check that a clip which ought to be running actually is.
 *
 * Nothing in the media API guarantees that a video which was told to play
 * stays playing. Chrome suspends decoders in background tabs and does not
 * always resume them, a stalled buffer can leave the element paused with no
 * event that says so on every engine, and an autoplay attempt made while the
 * page was still hidden is simply dropped. Rather than enumerate those, this
 * asks the one question that covers all of them — should it be playing, and is
 * it? — and restarts it if the answer differs.
 */
const WATCHDOG_MS = 1500;

/**
 * Off screen for longer than this and the clip starts again from the top on
 * return, instead of resuming wherever it was paused.
 *
 * Coming back to five figures already standing is not the picture this is
 * meant to make — the whole thing is an assembly, and the assembly is the
 * point. The threshold is what stops a scroll that overshoots the hero by a
 * few pixels and comes straight back from restarting it mid-stride.
 */
const RESTART_AFTER_MS = 1200;

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

    // Both, and the second is not redundant. Loading a resource resets
    // `playbackRate` to `defaultPlaybackRate`, so setting only the live rate
    // would quietly go back to 1x the moment anything re-ran the load
    // algorithm; setting only the default would not take effect on a clip the
    // browser had already started, which `autoPlay` means is the usual case.
    video.defaultPlaybackRate = RATE;
    video.playbackRate = RATE;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /**
     * The file itself is unusable — a 404, or a decoder that gave up on it.
     *
     * This is the only condition that stops the component trying, and it is
     * deliberately the only one: a media error is the single failure that
     * retrying cannot fix. Everything else — a refused autoplay, a buffer that
     * ran dry, a play() call cut short by a pause — is temporary, and treating
     * any of them as final is what used to leave the figures stopped for the
     * rest of the visit.
     */
    let broken = false;
    /** Autoplay was refused outright. Cleared by the first user gesture. */
    let refused = false;
    let everBuilt = false;
    let frameHandle: number | null = null;

    const setPhase = (phase: "playing" | "built") => {
      if (phase === "built") everBuilt = true;
      if (root.getAttribute("data-phase") !== phase) {
        root.setAttribute("data-phase", phase);
      }
    };

    const onMediaError = () => {
      broken = true;
      setPhase("built");
    };

    const fallback = window.setTimeout(() => {
      if (!everBuilt) setPhase("built");
    }, FALLBACK_MS);

    // Reduced motion gets the finished picture rather than the assembly, and
    // no loop: park the clip on a frame inside its hold, where all five are
    // standing, and leave it there. The pause is not belt and braces — the
    // element carries `autoplay`, so without it the clip would be running
    // before this effect ever gets to look at the media query.
    if (still) {
      // Twice, and both are needed: now, in case the browser has already
      // started on it, and again inside park() for the case where metadata has
      // not arrived yet and autoplay is still to come.
      video.pause();
      const park = () => {
        video.pause();
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
      if (broken) return;
      const t = video.currentTime;
      setPhase(t >= SETTLE_AT && t < CLEAR_AT ? "built" : "playing");
    };

    // Per rendered frame where that is available, which is what keeps both
    // edges of the reveal tight against the figures. timeupdate is the
    // fallback; the two thresholds above are set far enough inside the clip to
    // absorb its coarser resolution.
    const watch = () => {
      frameHandle = null;
      if (broken || video.paused) return;
      tick();
      if (video.requestVideoFrameCallback) {
        frameHandle = video.requestVideoFrameCallback(watch);
      }
    };

    const startWatching = () => {
      if (frameHandle === null && video.requestVideoFrameCallback && !broken) {
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
    video.addEventListener("error", onMediaError);

    // It loops for as long as the page is open, so it does not get to run while
    // nobody is looking at it — this sits at the top of the page and would
    // otherwise decode video the entire time someone reads the bottom of it.
    let onScreen = true;
    /** When it went off screen, or 0 while it is on. */
    let leftAt = 0;

    const resume = () => {
      if (broken || refused || !onScreen || document.hidden) return;

      if (leftAt && performance.now() - leftAt > RESTART_AFTER_MS) {
        try {
          video.currentTime = 0;
        } catch {
          // Not seekable yet. It will pick up wherever it left off, which is
          // the old behaviour rather than a failure.
        }
      }
      leftAt = 0;

      void video.play().catch((error: unknown) => {
        // Two quite different things arrive here and only one is a problem.
        //
        // AbortError is the ordinary one: play() returns a promise that
        // settles a frame or two later, and pausing before then rejects it.
        // Every scroll that carries the hero off screen mid-start does
        // exactly that, so this is a routine event and not a fault. It used
        // to be treated as one, which is what stopped the clip for good.
        //
        // NotAllowedError means the browser refused autoplay outright, and
        // hammering play() at it will not change its mind — only a gesture
        // will, so stand down until there is one.
        if ((error as DOMException)?.name === "NotAllowedError") {
          refused = true;
          setPhase("built");
          window.addEventListener("pointerdown", onGesture, { once: true });
        }
      });

      startWatching();
    };

    const suspend = () => {
      leftAt = performance.now();
      video.pause();
      stopWatching();
    };

    const onGesture = () => {
      refused = false;
      resume();
    };

    // An unexpected pause: a background tab that suspended the decoder, or an
    // engine that stopped on a dry buffer. Ours always come from suspend(),
    // where the guards in resume() decline to undo them.
    const onPause = () => resume();
    video.addEventListener("pause", onPause);

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

    // The backstop. Everything above reacts to an event that says something
    // went wrong; this one needs no such event, which is the point — the
    // failures that leave a clip stopped are exactly the ones that arrive
    // quietly.
    const watchdog = window.setInterval(() => {
      if (broken || refused || !onScreen || document.hidden) return;
      if (video.paused) resume();
      else startWatching();
    }, WATCHDOG_MS);

    return () => {
      window.clearTimeout(fallback);
      window.clearInterval(watchdog);
      stopWatching();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pointerdown", onGesture);
      video.removeEventListener("playing", startWatching);
      video.removeEventListener("timeupdate", tick);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("error", onMediaError);
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
            // Starts without waiting for hydration, and gives the browser its
            // own reason to keep it running. The effect above still owns when
            // it plays — it pauses this immediately under reduced motion, and
            // whenever the hero is off screen.
            autoPlay
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
