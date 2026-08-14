"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { PARTNER_WITH_SOPHIC } from "@/lib/partners";
import { PartnerGlyph } from "./PartnerGlyph";

/**
 * The five pillars, and the one that is currently open.
 *
 * The detail arrives in one shared panel under the garland rather than in a
 * tooltip beside whichever disc the pointer is on. That is a decision the copy
 * forces: the shortest of these paragraphs is 250 characters and the longest is
 * nearly 400, so a bubble anchored to a disc would either cover its neighbours
 * or be a column of text narrower than it is tall. A panel in a fixed place is
 * also the only version where moving along the row reads as comparing five
 * things, because the words stay where your eye already is.
 *
 * It is built as a tab set, which is exactly what it is — five controls, one
 * region, one open at a time. That is what buys the behaviour hover alone
 * cannot give: arrow keys move between pillars, the panel is reachable and
 * announced, and a touch device (which has no hover at all) selects on tap.
 *
 * The first pillar is open on arrival rather than the panel starting empty.
 * An empty panel is either a hole in the page or a jump when it fills, and
 * neither is worth the half-second before the reader's pointer arrives.
 */
export function PartnerPillarsBoard({
  points,
  curve,
}: {
  /** [x, y] per pillar, as percentages of the stage. */
  points: Array<[number, number]>;
  /** The path the pillars hang from, drawn through those same points. */
  curve: string;
}) {
  const [active, setActive] = useState(0);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const pillars = PARTNER_WITH_SOPHIC.pillars;

  // Automatic activation: moving between tabs opens as it goes. Right for a
  // panel that is already rendered and costs nothing to swap.
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = pillars.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = active === last ? 0 : active + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = active === 0 ? last : active - 1;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = last;
    }
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabsRef.current[next]?.focus();
  };

  return (
    <>
      <div
        className="partner-pillars__list"
        role="tablist"
        aria-label={PARTNER_WITH_SOPHIC.heading}
      >
        {/* Behind the discs, and hidden below lg where the pillars are a grid
            and there is nothing for a garland to hang between. */}
        <svg
          className="partner-pillars__curve"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d={curve}
            fill="none"
            stroke="var(--mint)"
            strokeWidth={1.5}
            strokeOpacity={0.55}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {pillars.map((pillar, index) => {
          const selected = index === active;
          return (
            <button
              key={pillar.name}
              ref={(node) => {
                tabsRef.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`partner-pillar-${index}`}
              aria-selected={selected}
              aria-controls={`partner-pillar-panel-${index}`}
              // Roving tabindex: the row is one tab stop, arrows move inside it.
              tabIndex={selected ? 0 : -1}
              className="partner-pillars__item"
              data-active={selected}
              style={
                {
                  "--x": points[index][0],
                  "--y": points[index][1],
                } as CSSProperties
              }
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              onKeyDown={onKeyDown}
            >
              <span className="partner-pillars__disc">
                <PartnerGlyph name={pillar.icon} />
              </span>
              <span className="partner-pillars__label">{pillar.name}</span>
            </button>
          );
        })}
      </div>

      {/* All five panels are rendered and the four closed ones are `hidden`,
          rather than rendering only the open one. Two reasons, and both are
          about text that would otherwise not exist: four fifths of this copy
          would be missing from the served HTML, where a crawler is the only
          reader that will ever see it; and with JavaScript off there would be
          no way to reach it at all — see the noscript rule in app/layout.

          It also gets the entrance for free. Going from display:none to shown
          restarts a CSS animation, so the panel fades in on every change with
          no key or state to manage. */}
      <div className="partner-pillars__panels">
        {pillars.map((pillar, index) => (
          <div
            key={pillar.name}
            id={`partner-pillar-panel-${index}`}
            role="tabpanel"
            aria-labelledby={`partner-pillar-${index}`}
            // Focusable because the panel is the only place this content lives,
            // and a region a keyboard cannot reach is content it cannot read.
            // The row of tabs sits above it, so this is the next stop after it.
            tabIndex={0}
            hidden={index !== active}
            className="partner-pillars__panel"
          >
            <p className="partner-pillars__panel-title">{pillar.name}</p>
            <p className="partner-pillars__panel-text">{pillar.detail}</p>
          </div>
        ))}
      </div>
    </>
  );
}
