"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { CapabilityGroup } from "@/lib/solutions";
import { BRAND_RAMP } from "./figureGradient";

/**
 * Tabbed breakdown of a machine's variants.
 *
 * The brief writes these as five paragraphs of comma-separated checks, which
 * nobody reads and nobody can compare. Splitting them across tabs and setting
 * each list as chips turns them into something you can scan, and flicking
 * between tabs makes the differences between the variants obvious — which is
 * the useful thing to know and the thing prose hides.
 *
 * Real tab semantics: roving tabindex, arrow keys, Home and End. That is what
 * makes it usable from the keyboard, and it costs a dozen lines.
 */
export function CapabilityTabs({ groups }: { groups: CapabilityGroup[] }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = (next: number) => {
    const wrapped = (next + groups.length) % groups.length;
    setActive(wrapped);
    tabRefs.current[wrapped]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    // Both axes: the list is a column from lg and a row below it.
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
        focusTab(groups.length - 1);
        break;
    }
  };

  const group = groups[active];

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[16rem_1fr] lg:gap-8">
      {/* Below lg the tabs run as a scrollable row; the negative margin lets
          them bleed to the screen edge so it is clear there are more. */}
      <div
        role="tablist"
        aria-label="Inspection systems"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {groups.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.name}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`capability-tab-${index}`}
              aria-selected={selected}
              aria-controls={`capability-panel-${index}`}
              // Roving tabindex: one stop for the whole group, then arrow keys.
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-lg px-4 py-3 text-left text-sm font-medium",
                "transition-colors duration-200 ease-gentle lg:w-full",
                selected
                  // The ramp the metric figures and function tiles carry, so
                  // the selected state is the page's blue rather than a second
                  // one. It arrives instantly where the unselected states
                  // cross-fade: transition-colors covers background-color, and
                  // a gradient is a background-image. Right way round anyway —
                  // the panel beside it swaps on the same click.
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
        id={`capability-panel-${active}`}
        aria-labelledby={`capability-tab-${active}`}
        tabIndex={0}
        className="capability-panel rounded-xl border border-line bg-background p-6 sm:p-8"
      >
        <h3 className="text-xl font-medium text-foreground">{group.name}</h3>
        {group.summary && (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
            {group.summary}
          </p>
        )}

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-brand">
          {group.itemsLabel}
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {group.items.map((entry, index) => (
            <li
              key={entry}
              className="capability-chip rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-foreground"
              // Capped so a thirteen-item list still finishes promptly.
              style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
            >
              {entry}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
