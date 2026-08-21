"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { COMPANY_VALUES, VALUES_INTRO } from "@/lib/company";
import { scrollToY } from "@/lib/smoothScroll";
import { ValueGlyph } from "./ValueGlyph";
import "./CompanyDark.css";
import "./CompanyValues.css";

/**
 * The values board, taken apart and read one value at a time as you scroll.
 *
 * The section is a tall runway with a sticky frame inside it — the same shape
 * the culture cube uses on the careers page — so the stage holds the screen
 * while the page scrolls past it, and the only thing moving is which value is
 * on it. Six equal slices of the runway, one per value, and the page carries
 * on normally at the end of the sixth.
 *
 * Everything is driven from one rAF loop reading one rectangle, and written
 * straight to the DOM. Not through state: this recomputes on every scroll
 * event, and a React render per frame is how a page like this starts dropping
 * them. The only state here is which value is active, and that is set from the
 * same loop but *only when the number changes* — six times over the whole
 * runway rather than sixty times a second — because the progress rail and the
 * counter genuinely are a rendering of that number, and a data attribute
 * written by hand would be a second copy of it to keep in step.
 *
 * Three renderings of the same six values, and which one you get is a question
 * about you rather than about the screen:
 *
 *   - the runway, for anyone who has not asked for less motion
 *   - a plain grid, for anyone who has. No sticky frame, no runway, no
 *     transitions: all six values at once, in the same voice
 *   - and without JavaScript the cards stack and read straight down the page,
 *     which is one rule in the layout's noscript block
 */

/**
 * Fraction of each value's slice spent arriving.
 *
 * The rest of the slice is a hold, and the hold is the point — a value that is
 * still moving is a value nobody has read. A third in, two thirds still.
 */
const ENTER = 0.34;

/** Where in a value's slice a click on the rail should land: past the entrance,
 *  early in the hold, so the value is square to the reader when it stops. */
const CLICK_AT = 0.55;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
/** Eases both ends, so a card neither leaps away nor stops dead. */
const smoothstep = (t: number) => t * t * (3 - 2 * t);

export function CompanyValues() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Set after mount, so the server and the first client render agree.
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced) return;

    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const cards = Array.from(
      section.querySelectorAll<HTMLElement>("[data-value-card]"),
    );
    if (cards.length === 0) return;

    const count = cards.length;
    let frame = 0;
    let current = -1;

    const update = () => {
      frame = 0;

      const rect = section.getBoundingClientRect();
      // What is left of the section once the sticky frame has taken its screen:
      // the distance the page travels while the stage is pinned.
      const runway = rect.height - stage.offsetHeight;
      if (runway <= 0) return;

      const progress = clamp01(-rect.top / runway);

      // Six equal slices, the last one included. Splitting the runway between
      // the *gaps* instead - five of them - is the version where the sixth
      // value arrives exactly as the section lets go, and is never read.
      const scaled = Math.min(progress * count, count - 0.0001);
      const index = Math.floor(scaled);
      const enter = smoothstep(clamp01((scaled - index) / ENTER));

      for (let i = 0; i < count; i++) {
        // Two cards are ever on screen: the one arriving, and the one it is
        // replacing. Everything else is parked at zero and costs nothing.
        let shown = 0;
        // Which way it travels: an arriving card rises into place from below,
        // a leaving one carries on upward. Same axis, so the two read as one
        // movement rather than as a swap.
        let direction = 0;
        if (i === index) {
          // The first value is not arriving from anywhere. It is what the
          // section already had on the stage before a scroll happened, and
          // running its entrance off the runway would leave it at nothing for
          // as long as the section sat below the fold.
          shown = index === 0 ? 1 : enter;
          direction = 1;
        } else if (i === index - 1) {
          shown = 1 - enter;
          direction = -1;
        }

        const card = cards[i];

        // Marked rather than inferred, so the stylesheet can hint only the two
        // cards that are actually moving. Written on change alone: this is an
        // attribute, and attributes are not free the way a style write is.
        const onStage = shown > 0 ? "1" : "0";
        if (card.dataset.shown !== onStage) card.dataset.shown = onStage;

        card.style.opacity = shown.toFixed(3);
        // Deliberately not `visibility: hidden`, which would be the cheaper way
        // to park the four off-stage cards and would also take them out of the
        // accessibility tree. All six statements are on this page whether or
        // not you can scroll: a screen reader reads them straight down, which
        // is a better version of this section than one value at a time.
        if (shown <= 0) continue;

        // Both of these are compositor work and nothing else. The blur that
        // goes with them is on the icon alone - a small box - because blurring
        // a whole column of type every frame is a repaint of the column.
        card.style.transform = `translate3d(0, ${(
          (1 - shown) * 30 * -direction
        ).toFixed(1)}px, 0) scale(${(0.955 + shown * 0.045).toFixed(4)})`;
        card.style.setProperty(
          "--card-blur",
          `${((1 - shown) * 5).toFixed(2)}px`,
        );
      }

      // The rail and the counter are a rendering of this number, so they are
      // rendered from it - but only when it moves.
      const nearest = enter > 0.5 ? index : Math.max(0, index - 1);
      if (nearest !== current) {
        current = nearest;
        setActive(nearest);
      }
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
  }, [reduced]);

  /** Scroll to the point in the runway where `index` is being held. */
  const jumpTo = (index: number) => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const runway = section.offsetHeight - stage.offsetHeight;
    if (runway <= 0) return;

    const top =
      section.getBoundingClientRect().top +
      window.scrollY +
      ((index + CLICK_AT) / COMPANY_VALUES.length) * runway;

    // Not window.scrollTo. A smooth one of those is animated by the browser
    // over a dozen frames, and the momentum scroller writes its own position
    // back on every one of them — the page never moves, and nothing errors.
    scrollToY(top, { immediate: reduced });
  };

  // No eyebrow above it. The eyebrow used to read "Our Values" over a heading
  // that said something else; now the heading says it, and a label repeating
  // the title it labels is just the title twice.
  const intro = (
    <div className="text-center">
      <h2 className="company-dark__title">{VALUES_INTRO.heading}</h2>
      {/* The mark the heading used to get from its eyebrow. Under it rather
          than around it: rules either side of a line this size read as a
          certificate. */}
      <span
        aria-hidden="true"
        className="mx-auto mt-4 block h-px w-14 bg-[var(--mint)]"
      />
    </div>
  );

  // --- The plain reading -------------------------------------------------
  // Everything at once, nothing moving. Not a lesser version: it is the same
  // six values in the same colours, and it is what the board itself does.
  if (reduced) {
    return (
      <section id="our-values" className="company-dark company-values scroll-mt-20 py-16 sm:py-24">
        <Container>
          {intro}
          <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {COMPANY_VALUES.map((value, index) => (
              <li key={value.slug} className="text-center">
                <span className="company-values__ring company-values__ring--sm">
                  <ValueGlyph name={value.icon} className="h-10 w-10" />
                </span>
                <p className="mt-4 text-[0.625rem] font-semibold tabular-nums tracking-[0.2em] text-white/45">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1 text-lg font-bold uppercase tracking-[0.02em] text-[var(--mint)]">
                  {value.name}
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-[0.9375rem] leading-relaxed text-white/80">
                  {value.statement}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    );
  }

  // --- The runway ---------------------------------------------------------
  return (
    <section
      ref={sectionRef}
      id="our-values"
      // Six slices plus the screen the stage occupies. Shorter on a phone,
      // where a slice of the same height is a great deal more thumb.
      className="company-dark company-values scroll-mt-20 h-[420vh] sm:h-[520vh]"
    >
      <div
        ref={stageRef}
        className="company-values__stage sticky top-16 flex h-[calc(100svh-4rem)] flex-col justify-center overflow-hidden"
      >
        {/* --- The scene behind the value --------------------------------
            Six photographs in one box, and the one belonging to the value on
            the stage is the one you can see.

            Keyed on `active` rather than driven per frame like the cards are,
            and that is a decision about depth rather than about cost: the card
            in front tracks the scroll exactly, and a backdrop that tracked it
            just as exactly would sit in the same plane as the card. Changing on
            the value instead, over most of a second, puts it behind.

            Hidden from the reading order. Six photographs of the same company
            say nothing the six statements do not, and announcing them would put
            six unnamed images between a reader and the words. */}
        <div aria-hidden="true" className="company-values__scenery">
          {COMPANY_VALUES.map((value, index) => (
            <Image
              key={value.slug}
              data-active={index === active ? "true" : "false"}
              className="company-values__scene"
              src={value.background}
              alt=""
              fill
              // One screen wide at every size, so there is nothing to choose
              // between: this asks for the whole viewport and lets the
              // optimizer pick the file.
              sizes="100vw"
              // Cover on a box whose shape is the reader's screen, against
              // sources that run from 2.5:1 to 1.3:1. Every one of them is
              // framed with its subject in the middle, so the crop can be the
              // same for all six.
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          ))}
          {/* Drawn over all six — see the stylesheet for how heavy it is and
              what it is holding up. */}
          <span className="company-values__scrim" />
        </div>

        {/* The padding is not decoration — see .company-values__frame. */}
        <Container className="company-values__frame company-values__content w-full">
          {intro}

          {/* The stage. Its height is reserved rather than taken from whichever
              value happens to be on it, so the rail below never moves as the
              statements change length - "We make a difference in the
              communities we serve." is a third of the length of Diversity's. */}
          <div className="company-values__deck">
            {COMPANY_VALUES.map((value, index) => (
              <article
                key={value.slug}
                data-value-card
                data-active={index === active ? "true" : "false"}
                // The first value is the one already on the stage before a
                // scroll has happened.
                style={index === 0 ? undefined : { opacity: 0 }}
                className="company-values__card"
              >
                <span className="company-values__ring">
                  <ValueGlyph
                    name={value.icon}
                    className="company-values__glyph"
                  />
                </span>

                <h3 className="company-values__name">{value.name}</h3>

                <p className="company-values__statement">{value.statement}</p>
              </article>
            ))}
          </div>

          {/* --- Where you are ------------------------------------------- */}
          <div className="mt-8 sm:mt-10">
            {/* The count, and the only place the total is stated. */}
            <p className="text-center text-sm tabular-nums text-white/50">
              <span
                key={active}
                className="company-values__count font-semibold text-[var(--mint)]"
              >
                {String(active + 1).padStart(2, "0")}
              </span>
              <span className="px-1.5">/</span>
              {String(COMPANY_VALUES.length).padStart(2, "0")}
            </p>

            {/* The rail. Six names from sm up; below that the names are the
                first thing to go - six labels across a phone are either
                illegible or untappable, and the dots plus the count above say
                the same thing without either problem. */}
            <ul className="company-values__rail" role="list">
              {COMPANY_VALUES.map((value, index) => (
                <li key={value.slug} className="company-values__rail-item">
                  <button
                    type="button"
                    onClick={() => jumpTo(index)}
                    data-active={index === active ? "true" : "false"}
                    aria-current={index === active ? "true" : undefined}
                    // The visible label is a number and an abbreviation, and on
                    // a phone it is neither. This is the whole sentence.
                    aria-label={`Value ${index + 1} of ${COMPANY_VALUES.length}: ${value.name}`}
                    className="company-values__step"
                  >
                    <span aria-hidden="true" className="company-values__dot" />
                    <span aria-hidden="true" className="company-values__num">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span aria-hidden="true" className="company-values__short">
                      {value.short}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </div>
    </section>
  );
}
