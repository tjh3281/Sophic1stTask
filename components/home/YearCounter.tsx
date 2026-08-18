"use client";

import { useEffect, useRef } from "react";
import "./YearCounter.css";

/**
 * The anniversary band: a strip of the site's own dark under the awards
 * section, counting 2007 up to 2027 on a loop.
 *
 * The clip is a still white page with a black band across the lower two thirds
 * and the year rolling inside it. Only the band is wanted, and only the middle
 * of the band, so the video is scaled up and pushed off its own corner behind a
 * window cut to the numerals — the same crop the hero uses for the evolution
 * figures, with the measurements in YearCounter.css.
 *
 * That leaves the numerals sitting on their own black, which `screen` in the
 * stylesheet disposes of: screening black leaves the backdrop as it was, so
 * what lands on the strip is the year and nothing else. It is also what keeps
 * the strip the site's #04101c rather than the clip's flat #000, and what
 * hides the grey the encoder left along two of the frame's edges.
 *
 * The count repeats. All this component decides is when it is allowed to: a
 * clip that loops for the life of the page would go on decoding video the
 * whole time someone reads the rest of it, so it runs while the strip is on
 * screen and is stopped the moment it is not. Coming back after a while starts
 * the count again from 2007 rather than resuming part-way up, because the span
 * is the point and arriving at 2019 is not a span.
 */

/**
 * How far outside the window the strip counts as still being watched.
 *
 * The same margin EvolutionSequence uses. It starts the clip just before the
 * strip appears, so the count is already running when it arrives rather than
 * beginning with a visible first frame, and it does not stop the moment the
 * strip's last pixel leaves.
 */
const WATCH_ROOT_MARGIN = "120px";

/**
 * Off screen for longer than this and the count starts again from 2007 on
 * return, instead of resuming wherever it was stopped.
 *
 * The threshold is what stops a scroll that overshoots the band by a few
 * pixels and comes straight back from restarting it mid-count.
 */
const RESTART_AFTER_MS = 1200;

/**
 * How long to wait, once the count has been asked to run, for a clip that is
 * not coming.
 *
 * Autoplay can be refused, a file can 404, a decoder can give up. None of them
 * are worth leaving 2007 on the screen for, so every path out of here ends at
 * the last frame — see park().
 *
 * Timed from the first attempt and not from mount, which is the whole
 * difference between this and the same guard in EvolutionSequence. That clip
 * is `autoPlay` and starts with the page, so a deadline on the page is a
 * deadline on the clip. This one is held back until the reader reaches it —
 * and anyone who spends a few seconds above it, which is everyone, would
 * arrive at a band that had already given up and parked.
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

export function YearCounter({ src }: { src: string }) {
  const bandRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const band = bandRef.current;
    const video = videoRef.current;
    if (!band || !video) return;

    /** The file itself is unusable — a 404, or a decoder that gave up on it. */
    let broken = false;
    /** Autoplay was refused outright. Cleared by the first user gesture. */
    let refused = false;
    /**
     * Parked on 2027 because the clip would not run.
     *
     * Its whole job is to stop the two restarts below putting it back: the
     * `pause` handler and the watchdog both exist to revive a clip that
     * stopped without being asked to, and a park is exactly that shape — a
     * deliberate pause they would otherwise undo a frame or a second later.
     *
     * Cleared when the strip comes back on screen, so a stall on first arrival
     * costs one attempt rather than the rest of the visit.
     */
    let parked = false;
    /** Whether the strip is currently worth decoding video for. */
    let onScreen = false;
    /** When it went off screen, or 0 while it is on. */
    let leftAt = 0;
    /** Armed on an attempt, cleared once anything actually plays. */
    let fallback: number | undefined;
    let everPlayed = false;

    /**
     * Show the end of the count without playing it.
     *
     * Used by everything that is not an ordinary playthrough: reduced motion,
     * a refused autoplay, a clip that never started. 2027 is the year the
     * whole band is about, so it is the right thing to be left on.
     *
     * Declared after the state it writes and before the reduced-motion branch
     * that calls it, because that branch can run before the rest of this
     * effect — and a `let` read before its declaration is a crash, not a
     * default.
     *
     * The seek is allowed to fail and deliberately not compensated for. A file
     * served without range support has no seekable range at all, and there the
     * assignment is simply ignored and the clip stays on its first frame —
     * which is 2007, the other end of the same span, and no worse than a band
     * that had never loaded. Next serves /public with ranges, so this is a
     * fallback for the fallback.
     */
    const park = () => {
      parked = true;
      video.pause();
      try {
        // Just short of the end: seeking to duration itself lands on the far
        // side of the last frame, where engines disagree about what to show.
        video.currentTime = Math.max(0, (video.duration || 0) - 0.05);
      } catch {
        // Not seekable. See above.
      }
    };

    // A reader who asked for less motion did not ask for a year counter to run
    // on a loop for as long as it is on their screen. They get the end of the
    // count, held.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (video.readyState >= 1) park();
      else video.addEventListener("loadedmetadata", park, { once: true });
      return () => video.removeEventListener("loadedmetadata", park);
    }

    const onMediaError = () => {
      broken = true;
      window.clearTimeout(fallback);
    };

    const resume = () => {
      if (broken || refused || parked || !onScreen || document.hidden) return;

      if (leftAt && performance.now() - leftAt > RESTART_AFTER_MS) {
        try {
          video.currentTime = 0;
        } catch {
          // Not seekable yet. It picks up where it left off, which is the old
          // behaviour rather than a failure.
        }
      }
      leftAt = 0;

      if (!everPlayed && fallback === undefined) {
        fallback = window.setTimeout(() => {
          // Cleared before the check so a later attempt can arm a fresh one.
          fallback = undefined;
          if (!everPlayed) park();
        }, FALLBACK_MS);
      }

      void video.play().then(
        () => {
          everPlayed = true;
          window.clearTimeout(fallback);
        },
        (error: unknown) => {
          // Two quite different things arrive here and only one is a problem.
          //
          // AbortError is the ordinary one: play() settles a frame or two
          // later, and pausing before then rejects it. Every scroll that
          // carries the strip off screen mid-start does exactly that.
          //
          // NotAllowedError means the browser refused autoplay outright, and
          // hammering play() at it will not change its mind — only a gesture
          // will, so stand down until there is one and show the end of the
          // count in the meantime.
          if ((error as DOMException)?.name === "NotAllowedError") {
            refused = true;
            window.clearTimeout(fallback);
            park();
            window.addEventListener("pointerdown", onGesture, { once: true });
          }
        },
      );
    };

    const suspend = () => {
      leftAt = performance.now();
      video.pause();
    };

    const onGesture = () => {
      refused = false;
      resume();
    };

    // An unexpected pause: a background tab that suspended the decoder, or an
    // engine that stopped on a dry buffer. Ours always come from suspend() or
    // park(), where the guards in resume() decline to undo them.
    const onPause = () => resume();
    video.addEventListener("pause", onPause);
    video.addEventListener("error", onMediaError);

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver === "undefined") {
      // No way to know where the reader is. A count that runs unwatched is
      // better than one that never runs.
      onScreen = true;
      resume();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            onScreen = entry.isIntersecting;
            if (onScreen) {
              // Arriving is the one thing allowed to reconsider a park: the
              // clip that would not start a minute ago may only have been
              // waiting on a network that has since come back.
              parked = false;
              resume();
            } else {
              suspend();
            }
          }
        },
        { rootMargin: WATCH_ROOT_MARGIN },
      );
      observer.observe(band);
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
      if (broken || refused || parked || !onScreen || document.hidden) return;
      if (video.paused) resume();
    }, WATCHDOG_MS);

    return () => {
      observer?.disconnect();
      window.clearInterval(watchdog);
      window.clearTimeout(fallback);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pointerdown", onGesture);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("error", onMediaError);
    };
  }, []);

  return (
    // Decorative, in full. It is four digits counting to the year on the
    // certificate above it, and that certificate's alt text already says both
    // the founding year and the twenty — so announcing this as well would only
    // read the same fact twice to the one reader who cannot skim past the
    // repetition.
    <div ref={bandRef} aria-hidden="true" className="year-band">
      <div className="year-band__stage">
        <video
          ref={videoRef}
          className="year-band__video"
          src={src}
          muted
          loop
          playsInline
          // Not autoPlay: the effect above owns when this runs, and starting it
          // at mount would have it counting behind two screens the reader has
          // not reached. preload is what keeps the start immediate once they
          // do — it is half a megabyte.
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
        />
      </div>
    </div>
  );
}
