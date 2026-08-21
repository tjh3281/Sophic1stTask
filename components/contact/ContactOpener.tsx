"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { askForOverlay } from "@/lib/coverOverlay";
import { holdScroll, releaseScroll } from "@/lib/smoothScroll";
import "./ContactOpener.css";

/**
 * The contact page's opener.
 *
 * Ten seconds over the whole window, with the page held still underneath it: an
 * astronaut in space says hello in four languages, brings a board up to the
 * camera, and the camera pushes into it until the Sophic mark resolves on the
 * copper. Then the film dissolves and the page it was covering is the contact
 * form.
 *
 * Which is the same object. The form is laid out as a board — fields tracked
 * down to a part, the part tracked down to the three ways of reaching us — on a
 * photograph of a real one. So the last frame of the film and the page behind it
 * are both a light circuit board, and the hand-off is a straight cross-fade
 * between two pictures of the same thing: the film goes, the board stays. That
 * is the whole reason this works as a full-window intro rather than reading as a
 * video that got out of the way.
 *
 * Nobody is ever trapped behind it. It dismisses when the film ends, when the
 * reader presses Skip or Escape, if the browser refuses to play it, and — the
 * one that needs no event to arrive — after a watchdog that does not care why
 * none of the others fired.
 */

const CLIP = "/images/contact-opener.mp4";
const POSTER = "/images/contact-opener-poster.webp";

/** The clip's own pixel size. Needed here because working out where a point in
 *  the picture has landed on the screen means doing the same arithmetic
 *  `object-fit: cover` does, and that starts from the frame's real shape. */
const FRAME = { width: 3840, height: 2160 } as const;

/**
 * The generative-AI watermark burned into the footage, as fractions of the
 * frame: where its centre is, and how big it is against the frame's width.
 *
 * Measured off the clip rather than eyeballed — a four-pointed star in the
 * lower right, about twelve luminance above the sky behind it, which is faint
 * enough to miss on a still and impossible to miss once it is the only thing on
 * screen not moving. It vanishes on its own in the last second, when the shot
 * lands on the board and everything goes bright.
 *
 * The Skip control is parked on top of it. That is the whole reason the button
 * is placed by measurement instead of pinned to the corner: `cover` crops a
 * different amount at every window shape, so the mark is 58px in from the right
 * on one screen and 233px on another, and no fixed corner offset covers both.
 */
const MARK = { x: 0.909, y: 0.834, size: 0.042 } as const;

/**
 * When the camera lands and the picture turns light.
 *
 * Measured the same way: the top strip of the frame holds between 57 and 99 of
 * 255 for the first eight and a half seconds, then jumps to 143 and is 205 by
 * the end. Two things hang off it — the Skip control gets out of the way of the
 * closing shot, and it is the last moment a dark scrim over the top of the
 * picture is doing any good rather than dirtying it.
 */
const LANDS_AT = 8.5;

/**
 * When the words arrive under the mark.
 *
 * Derived from the landing rather than written as its own number, so the two
 * cannot drift: the board has to have resolved and the frame has to have turned
 * light before anything is set over it, and a fixed second and a half would stop
 * meaning that the moment the clip was re-cut. The delay is the beat between the
 * mark arriving and the invitation under it — long enough that they read as two
 * things in sequence rather than one card fading up, short enough that the
 * closing second is not spent waiting.
 */
const GREETS_AT = LANDS_AT + 0.4;

/**
 * How long the film gets to start, in milliseconds.
 *
 * This is the one that matters, and it matters because the page is held. A
 * 4K clip on a thin connection can spend several seconds buffering, and every
 * one of those seconds is a reader looking at a still frame of a page they
 * cannot scroll. If it has not begun by now it is not going to begin well, so
 * the intro is abandoned and they get the form — which is what they came for.
 */
const STARTS_WITHIN = 4500;

/**
 * The backstop, in milliseconds.
 *
 * Comfortably past the ten seconds the film runs, and the only way out that
 * needs nothing at all to happen. A clip that stalls halfway fires no `ended`
 * and no `error` — it simply stops, and without this the page it is covering
 * would stop with it.
 */
const WATCHDOG = 15000;

/** playing → the film has the window and the page is held.
 *  leaving → dissolving; the page is released and the bar is back.
 *  gone    → unmounted. */
type Phase = "playing" | "leaving" | "gone";

/**
 * How the film goes, which depends on what asked it to.
 *
 * fade → the cross-fade this component was built around: the last shot is a
 *        board, the page underneath is a board, and one settles onto the other.
 * lift → the film is carried up and off. This is the answer to a scroll, and it
 *        is a different move on purpose — a reader who pushed the page down is
 *        owed something that goes with the push rather than a dissolve that
 *        could have happened at any moment. It is also quicker: they have said
 *        what they want, and the film is now in the way of it.
 */
type Exit = "fade" | "lift";

/* --- Reading a scroll that cannot scroll -----------------------------------
   The page is held while the film runs, so a wheel turn moves nothing and the
   scrollbar stays where it is. The gesture still arrives, though, and it is
   worth listening to: somebody scrolling a page they came to write on is asking
   to get on with it, in the plainest way a page can be asked.

   Lenis is stopped rather than gone, and a stopped Lenis calls preventDefault
   on the wheel without stopping it propagating — so these events still reach a
   listener on the window. That is what makes this possible at all, and it is
   the one thing here that depends on how the scroller behaves.
-------------------------------------------------------------------------- */

/**
 * How much scrolling counts as asking, in CSS pixels.
 *
 * A threshold rather than the first event, because a wheel is noisy: a trackpad
 * reports a few pixels for a palm brushing past it, and dismissing an intro on
 * that would feel like the page had glitched rather than obeyed. This is about
 * one notch of a Windows wheel and two of a Firefox one — a deliberate push,
 * and nothing anybody arrives at by accident.
 */
const SCROLL_INTENT = 90;

/**
 * How long a partial push stays on the books, in milliseconds.
 *
 * Without this the total only ever grows, and four separate nudges spread over
 * a minute would eventually add up to a dismissal nobody asked for. A gesture
 * is a burst; a gap this long means the last one is over.
 */
const INTENT_WINDOW = 420;

/**
 * Assumed line height for wheels that report in lines, in pixels.
 *
 * Firefox sends deltaMode 1 — deltaY of 3 means three lines, not three pixels —
 * and a threshold in pixels compared against a number of lines is a threshold
 * roughly thirty times too high. The exact figure does not matter much; being
 * in the right unit does.
 */
const LINE_HEIGHT = 16;

/**
 * How long to wait for the dissolve before taking the element away regardless.
 *
 * A backstop, not the timing. What normally ends the dissolve is the
 * transition saying it has finished — because a timer running alongside a
 * transition is a race, and the frame it loses is the one where the film is
 * still half there and is removed anyway. Any throttling that slows the
 * transition slows this too, so the timer cannot win by accident; it only ever
 * fires when there was no transition to wait for.
 */
const DISSOLVE_BACKSTOP = 2600;

export function ContactOpener() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  /** Measured in `place`, so the pill is kept on screen by what it really is
   *  rather than by the minimum it was asked for. */
  const skipRef = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<Phase>("playing");
  const [landed, setLanded] = useState(false);
  /** Whether the invitation under the mark is up. Separate from `landed`
   *  because they are two beats of the closing shot, not one. */
  const [greeting, setGreeting] = useState(false);
  const leftRef = useRef(false);

  /**
   * Which way the film goes, decided by whoever ends it.
   *
   * Set immediately before the phase, and safe to be two pieces of state rather
   * than one because React batches everything raised inside a single handler —
   * including the plain window listeners below. Both land in the same render,
   * so there is never a frame where the film is dissolving without knowing
   * which way it is meant to be moving.
   */
  const [exit, setExit] = useState<Exit>("fade");

  /**
   * Which showing this is.
   *
   * Only ever read as a dependency: bumping it is what makes the whole setup
   * below run again, on a film that has already been and gone. It is a counter
   * rather than a boolean because the reader can ask for this as many times as
   * they like, and each time has to be a change.
   */
  const [run, setRun] = useState(0);

  /**
   * How to call off a dissolve that is already under way.
   *
   * `leave` arms two things that will eventually unmount the film — a listener
   * for the end of the fade and a timer in case that never comes — and a reader
   * who asks for the film again in the middle of it would otherwise have both
   * of them fire during the new showing and take it away. Held here so a replay
   * can disarm them.
   */
  const dissolveRef = useRef<(() => void) | null>(null);

  /**
   * Put the Skip control on the watermark.
   *
   * Repeats the browser's own `cover` arithmetic — scale to the larger of the
   * two ratios, centre, crop the overflow — to turn a point in the picture into
   * a point on the screen, then hands the answer to the stylesheet as offsets
   * from the bottom-right corner. Everything about how the control *looks* stays
   * in CSS; this only says where the thing it has to hide has ended up.
   *
   * The clamp is for the window shapes where the mark is cropped off the screen
   * entirely, which is most phones: there is nothing to cover, so the button
   * simply sits in the corner where a skip control belongs.
   */
  const place = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = Math.max(vw / FRAME.width, vh / FRAME.height);
    const shown = { width: FRAME.width * scale, height: FRAME.height * scale };

    const size = MARK.size * shown.width;
    const x = (vw - shown.width) / 2 + MARK.x * shown.width;
    const y = (vh - shown.height) / 2 + MARK.y * shown.height;

    // The pill is sized from the mark so it covers it at every window shape,
    // and floored so it is never smaller than a comfortable target.
    const width = Math.max(148, size * 2.2);
    const height = Math.max(52, size * 1.15);
    const edge = 16;

    const clamp = (value: number, span: number, extent: number) =>
      Math.min(Math.max(value, span / 2 + edge), extent - span / 2 - edge);

    shell.style.setProperty("--skip-mark", `${Math.round(size)}px`);
    shell.style.setProperty("--skip-w", `${Math.round(width)}px`);
    shell.style.setProperty("--skip-h", `${Math.round(height)}px`);

    /* What the pill actually came out as, which is not what was just asked for.
       The two numbers above are minimums — the control carries a label and a
       hint beside it, and text is as wide as text is — so the pill is routinely
       wider than the figure derived from the mark. Clamping against that figure
       instead of the real one is how the control ends up hanging over the right
       edge of the window at the shapes where the mark sits close to it and the
       clamp is the thing holding the pill on screen.

       Read after the minimums are written and before the offsets are, so the
       measurement is of the pill as it will actually be drawn. */
    const box = skipRef.current?.getBoundingClientRect();
    const realWidth = Math.max(width, box?.width ?? 0);
    const realHeight = Math.max(height, box?.height ?? 0);

    shell.style.setProperty(
      "--skip-right",
      `${Math.round(clamp(vw - x, realWidth, vw))}px`,
    );
    shell.style.setProperty(
      "--skip-bottom",
      `${Math.round(clamp(vh - y, realHeight, vh))}px`,
    );
  }, []);

  /**
   * Let go of everything, once.
   *
   * Every way out lands here — the film ending, Skip, Escape, a refusal, the
   * watchdog — so the page is released, the bar comes back and the section
   * underneath becomes reachable in exactly one place, whichever of them
   * happened first.
   */
  const leave = useCallback(() => {
    if (leftRef.current) return;
    leftRef.current = true;

    setPhase("leaving");
    askForOverlay(false);
    releaseScroll();
    document.querySelector(".contact-page")?.removeAttribute("inert");

    // Gone when the dissolve says so. `transitionend` fires per property, so
    // this waits for opacity specifically rather than for whichever of the two
    // happens to land first — and ignores anything bubbling up from the button
    // inside, which has transitions of its own.
    const shell = shellRef.current;
    const done = (event: TransitionEvent) => {
      if (event.target !== shell || event.propertyName !== "opacity") return;
      setPhase("gone");
    };
    shell?.addEventListener("transitionend", done);
    const timer = window.setTimeout(() => setPhase("gone"), DISSOLVE_BACKSTOP);

    // Both of the above, in a form a replay can cancel. Neither is dangerous on
    // its own; together they are the two ways this film gets taken off screen,
    // and a showing that started after they were armed would be taken off by
    // them mid-play.
    dissolveRef.current = () => {
      window.clearTimeout(timer);
      shell?.removeEventListener("transitionend", done);
      dissolveRef.current = null;
    };
  }, []);

  /**
   * The same way out, taken because the reader scrolled.
   *
   * Everything still goes through `leave`; this only says what the film should
   * do on its way off, before the render that carries it.
   */
  const leaveByScroll = useCallback(() => {
    if (leftRef.current) return;
    setExit("lift");
    leave();
  }, [leave]);

  /**
   * Show it again, from the first frame.
   *
   * Everything that says the film is over gets put back: the latch every exit
   * checks, the exit style, the closing shot, and the phase. Bumping the run
   * counter last is what re-runs the whole setup below — the hold, the guards,
   * the listeners — against whichever video element is on the page by then,
   * which may be a brand new one if the film had already been unmounted.
   *
   * Safe at any point. Called during the film it restarts it; called during the
   * dissolve it disarms it and starts again; called long afterwards it brings
   * the whole thing back.
   *
   * Reduced motion is the one time this does nothing. Someone who has asked not
   * to be shown ten seconds of film has not changed their mind by clicking the
   * link they are already on.
   */
  const replay = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    dissolveRef.current?.();
    leftRef.current = false;
    setExit("fade");
    setLanded(false);
    setGreeting(false);
    setPhase("playing");
    setRun((showing) => showing + 1);
  }, []);

  /**
   * Asking for it again by clicking Contact.
   *
   * A reader already on this page who clicks Contact in the bar is asking for
   * the page they are looking at, and the router quite correctly does nothing
   * with that. The intro is the one part of it that can be given back, so this
   * gives it back.
   *
   * Listened for here rather than wired into the header, and that is the point:
   * the header is on every page on the site, and this is a fact about one of
   * them. Anything pointing at /contact counts — the bar's button, the drawer's
   * copy of it, a link in the footer — because from where the reader sits those
   * are all the same button, and none of them should have to know about the
   * film to behave the same way.
   *
   * The click is only ever observed. The navigation is left to proceed, so the
   * drawer still closes itself and a middle-click still opens a tab.
   */
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // Anything but a plain left click is somebody going somewhere else with
      // it — a new tab, a download, a context menu — and none of that is a
      // request to watch this again.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const strip = (path: string) => path.replace(/\/+$/, "") || "/";
      if (strip(url.pathname) !== "/contact") return;

      replay();
    };

    // Capture, so this is heard before the router gets the click and starts
    // taking the page apart around it.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [replay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // A reader who asked for less motion did not ask to be held in front of a
    // film for ten seconds. They get the page, immediately, and never see this.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      leftRef.current = true;
      setPhase("gone");
      return;
    }

    // Whatever the browser restored on a reload — the film covers the window,
    // so opening halfway down the form behind it would mean dissolving to a
    // page already scrolled.
    window.scrollTo(0, 0);
    holdScroll();
    askForOverlay(true);

    place();
    window.addEventListener("resize", place);

    // Held still and covered is not the same as out of reach: without this,
    // tabbing goes straight into a form nobody can see, and the focus ring
    // travels down a page that cannot scroll to follow it.
    document.querySelector(".contact-page")?.setAttribute("inert", "");

    /* --- The scroll ------------------------------------------------------
       One running total, fed by whichever input the reader happens to be
       using, and reset whenever the pushing stops. Down only: at the top of a
       held page there is nothing above to ask for, and counting an upward
       flick would mean a reader shoving the film back into place watched it
       leave instead.
    --------------------------------------------------------------------- */

    let intent = 0;
    let intentAt = 0;

    const push = (amount: number) => {
      const now = performance.now();
      if (now - intentAt > INTENT_WINDOW) intent = 0;
      intentAt = now;
      if (amount <= 0) return;

      intent += amount;
      if (intent >= SCROLL_INTENT) leaveByScroll();
    };

    // deltaMode says what the number means: 0 pixels, 1 lines, 2 pages. Reading
    // it as pixels regardless is the classic way to end up with a threshold
    // that fires instantly on one browser and never on another.
    const onWheel = (event: WheelEvent) => {
      const unit =
        event.deltaMode === 1
          ? LINE_HEIGHT
          : event.deltaMode === 2
            ? window.innerHeight
            : 1;
      push(event.deltaY * unit);
    };

    // A drag is measured against the last frame of itself rather than against
    // where the finger landed, so a slow pull and a flick of the same length
    // count the same and a change of direction mid-drag does not bank the
    // distance already travelled.
    let touchY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY;
      if (y === undefined) return;
      // Finger up, page down.
      push(touchY - y);
      touchY = y;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        leave();
        return;
      }
      // The keyboard's scroll: no threshold, because a key is not a noisy
      // input — nobody presses Page Down by brushing against it.
      if (
        event.key === "ArrowDown" ||
        event.key === "PageDown" ||
        event.key === "End" ||
        event.key === " "
      ) {
        leaveByScroll();
      }
    };

    // Passive, all three. Lenis is already refusing these on the page's behalf;
    // this only wants to know that they happened.
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("keydown", onKeyDown);

    video.addEventListener("ended", leave);
    video.addEventListener("error", leave);

    // Two timers, two different failures. The first is the film never getting
    // going; the second is it getting going and then stopping. Neither needs an
    // event to arrive, which is the point of both.
    const startGuard = window.setTimeout(leave, STARTS_WITHIN);
    const watchdog = window.setTimeout(leave, WATCHDOG);
    const onPlaying = () => window.clearTimeout(startGuard);
    video.addEventListener("playing", onPlaying);

    // The door closes as the film arrives. Two reasons, and the second is the
    // one that matters: the watermark the Skip control is covering has gone by
    // now — the frame is a bright board and there is nothing left to see — so
    // holding a dark pill over the closing shot would be hiding nothing at the
    // cost of the one frame the whole page continues from.
    const onTime = () => {
      if (video.currentTime >= LANDS_AT) setLanded(true);
      if (video.currentTime >= GREETS_AT) setGreeting(true);
    };
    video.addEventListener("timeupdate", onTime);

    /* --- Silence ---------------------------------------------------------
       The film is a greeting, not a broadcast. It opens over a page somebody
       came to write on, it plays without being asked, and it is very possibly
       playing in an office — so it makes no sound, ever.

       Saying so once is not enough to mean it:

         - the clip does carry an AAC track, so there is something real to keep
           quiet. `muted` on the element is the only thing standing between it
           and a room;
         - `muted` in JSX sets a property, and the `muted=""` in the server's
           HTML only ever sets the *default*. Once anything touches the
           property, the attribute stops having a say — which is why this sets
           the property itself rather than trusting the markup to have carried;
         - and a replay runs against an element that has already been playing,
           where whatever state it is in now is the state it keeps.

       So it is set here, on the way into every showing, and defended after:
       `volumechange` is the one event that says the sound has moved, whoever
       moved it — the browser's own media controls, an extension, a stray
       property assignment — and putting it straight back is what makes silent
       mean silent rather than silent-so-far. The guard is what stops that from
       being a loop, since re-muting raises the event again.
    --------------------------------------------------------------------- */

    const silence = () => {
      if (video.muted && video.volume === 0) return;
      video.muted = true;
      video.volume = 0;
    };

    // Reflected into the attribute too, so an element React built on the client
    // — anyone arriving by clicking Contact rather than loading the URL — starts
    // out as muted as the server's markup does.
    video.defaultMuted = true;
    silence();
    video.addEventListener("volumechange", silence);

    // From the top. A first showing is at zero already; a repeat may be running
    // on the very element that was playing a moment ago, and "again" has to mean
    // again rather than "carry on from where the reader interrupted it".
    video.currentTime = 0;

    // Muted autoplay is allowed nearly everywhere, but low-power mode and some
    // enterprise policies still say no. There is nothing to recover here and no
    // reason to try: the reader came to write to us, not to watch.
    void video.play().catch(leave);

    return () => {
      window.clearTimeout(startGuard);
      window.clearTimeout(watchdog);
      window.removeEventListener("resize", place);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("keydown", onKeyDown);
      video.removeEventListener("volumechange", silence);
      video.removeEventListener("ended", leave);
      video.removeEventListener("error", leave);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("timeupdate", onTime);
      // Paired with the three above, and the reason they are here rather than
      // only in `leave`: navigating away mid-film would otherwise leave the
      // next page held still, inert and under a transparent bar.
      releaseScroll();
      askForOverlay(false);
      document.querySelector(".contact-page")?.removeAttribute("inert");
    };
    // `run` is what makes a replay a new showing rather than a no-op: it is the
    // only dependency here that ever changes, and changing it tears this whole
    // arrangement down and builds it again around the film's next outing.
  }, [leave, leaveByScroll, place, run]);

  if (phase === "gone") return null;

  return (
    <div
      ref={shellRef}
      className="contact-opener"
      data-phase={phase}
      data-exit={exit}
      data-landed={landed}
      data-greeting={greeting}
      // Not a dialog. A dialog is something the reader is asked to deal with,
      // and this is a title sequence — it wants announcing once and then
      // ignoring, which is what a plain labelled region does.
      role="region"
      aria-label="Sophic Automation introduction"
    >
      <video
        ref={videoRef}
        className="contact-opener__film"
        src={CLIP}
        poster={POSTER}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* The bar is transparent over this and the picture underneath is night
          sky — but "mostly dark" is not "dark enough at the right-hand end",
          where the nav is busiest and the film ends on a near-white board. */}
      <div aria-hidden="true" className="contact-opener__crown" />

      {/* The invitation, under the mark, for the last stretch of the film.
          The shot has landed and the board has resolved by the time this
          arrives, so it is the last thing said before the film hands the window
          to the form — and it says the thing the form is for.

          Set low in the window rather than measured off the mark, and that is a
          decision rather than an approximation: `cover` crops symmetrically
          about the centre, so anything the camera has pushed in on sits at the
          middle of the window at every window shape, and the lower third is
          therefore below it on all of them without a number that would have to
          be re-measured every time the clip is re-cut. See the stylesheet for
          why it is dark rather than white. */}
      <p className="contact-opener__greeting">Let&rsquo;s Talk</p>

      {/* Ten seconds is a long time to hold somebody who came to send a
          message. The film is the greeting; this is the door.

          It is also the lid on the watermark, which is why it is sized from
          MARK and placed by `place` rather than pinned to the corner. */}
      <button
        ref={skipRef}
        type="button"
        className="contact-opener__skip"
        onClick={leave}
      >
        <span className="contact-opener__skip-label">
          Skip
          <span aria-hidden="true" className="contact-opener__skip-arrow">
            →
          </span>
        </span>

        {/* The other way out, said out loud.
            Scrolling has always dismissed the film — see SCROLL_INTENT — but
            nothing on screen said so, which makes it a shortcut for people who
            already knew rather than a way out for people who want one.

            Hidden from the accessibility tree on purpose, and not to hide it:
            it would otherwise land in this button's accessible name, and the
            button does not scroll. The name stays "Skip", which is what it
            does and what a voice-control user would say to press it. A reader
            on a screen reader is not short of a way out either — the same
            control, and Escape. */}
        <span aria-hidden="true" className="contact-opener__skip-hint">
          or scroll down
        </span>
      </button>
    </div>
  );
}
