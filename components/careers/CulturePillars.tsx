"use client";

import { useRef, useState } from "react";
import { CareerGlyph } from "@/components/careers/CareerGlyph";
import { BRAND_RAMP } from "@/components/solutions/figureGradient";
import { cn } from "@/lib/cn";
import { PILLAR_GROUPS } from "@/lib/careers";

/**
 * Culture, Values and Environment, one panel each.
 *
 * The brief writes these as eight headed paragraphs in a row. Read straight
 * down, the eight blur into one long statement about being a nice place to
 * work; put behind three tabs they become a question the reader chooses to ask
 * — and the three headings are the part that carries meaning, since which
 * bucket a pillar falls in is itself the claim.
 *
 * Tab mechanics are lifted from CapabilityTabs, deliberately: roving tabindex,
 * both arrow axes, Home and End. Two tabbed sections on one site that answer
 * the keyboard differently is a bug the second one introduced.
 */
export function CulturePillars() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = (next: number) => {
    const wrapped = (next + PILLAR_GROUPS.length) % PILLAR_GROUPS.length;
    setActive(wrapped);
    tabRefs.current[wrapped]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault();
        focusTab(active + 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault();
        focusTab(active - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(PILLAR_GROUPS.length - 1);
        break;
    }
  };

  const group = PILLAR_GROUPS[active];

  return (
    <div className="mt-8">
      {/* A row above the panel rather than a column beside it: three short
          words do not need a 15rem column, and the panel gets the full measure
          back. On narrow screens the row scrolls, and the negative margin lets
          it bleed to the screen edge so it is clear there are more. */}
      <div
        role="tablist"
        aria-label="What it is like to work here"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {PILLAR_GROUPS.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.name}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`pillar-tab-${index}`}
              aria-selected={selected}
              aria-controls={`pillar-panel-${index}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-lg px-5 py-3 text-left text-sm font-medium",
                "transition-colors duration-200 ease-gentle",
                selected
                  ? `text-white ${BRAND_RAMP}`
                  : "bg-surface text-muted hover:bg-brand-light hover:text-brand",
              )}
            >
              {item.name}
            </button>
          );
        })}
      </div>

      {/* Keyed on the active tab so the entrance animation replays on switch. */}
      <div
        key={group.name}
        role="tabpanel"
        id={`pillar-panel-${active}`}
        aria-labelledby={`pillar-tab-${active}`}
        tabIndex={0}
        className="capability-panel mt-6 rounded-xl border border-line bg-background p-6 sm:p-8"
      >
        {/* The same rule-and-caps label the rest of the section uses, so the
            panel reads as part of the page rather than as a widget dropped
            into it. */}
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-9 shrink-0 bg-brand" />
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-brand">
            {group.name}
          </p>
        </div>
        <p className="mt-3 text-lg font-bold tracking-[-0.02em] text-foreground sm:text-xl">
          {group.tagline}
        </p>

        {/* A rule per pillar rather than a card each: these are paragraphs of
            one voice, and boxing them would set them arguing with the tab
            panel they already sit inside. */}
        <div className="mt-7 space-y-7">
          {group.pillars.map((pillar, index) => (
            <article
              key={pillar.name}
              className="capability-chip border-l-2 border-line pl-5 transition-colors duration-200 ease-gentle hover:border-brand"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <h3 className="flex items-center gap-2.5 text-base font-bold tracking-[-0.01em] text-foreground">
                <CareerGlyph name={pillar.icon} className="h-5 w-5 text-brand" />
                {pillar.name}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">
                {pillar.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
