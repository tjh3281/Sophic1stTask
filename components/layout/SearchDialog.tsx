"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  SEARCH_INDEX,
  searchPages,
  tokenize,
  type SearchEntry,
  type SearchEntryKind,
} from "@/lib/search";

/**
 * Site search, as a panel that drops out of the header.
 *
 * Deliberately not a modal: it hangs off the bar it was opened from, dims
 * nothing and covers nothing but the strip of page directly beneath it, so the
 * reader can still see where they are while they look for where to go next.
 * Escape, a click anywhere outside, or picking a result puts it away.
 *
 * Built as a combobox rather than a page of results: the index is a dozen
 * routes, so the answer is always one keystroke and one Enter away, and sending
 * the reader to a results page first would just add a stop on the way.
 *
 * Focus stays in the input the whole time. The rows are real links — so they
 * can be middle-clicked and are prefetched on sight — but they are taken out of
 * the tab order and driven by aria-activedescendant, which is what lets the
 * arrow keys move the selection while the caret stays where the reader is
 * typing.
 */
export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // An empty box offers the whole site rather than nothing — the palette
  // doubles as a site map for a reader who is browsing rather than looking.
  const trimmed = query.trim();
  const results = trimmed ? searchPages(trimmed) : SEARCH_INDEX;
  const tokens = tokenize(trimmed);
  const active = results[activeIndex];

  // Every edit re-ranks the list, so the old highlight would be pointing at a
  // different page. Adjusted during render rather than in an effect so the
  // selection is never a frame behind the rows it sits on.
  const [lastQuery, setLastQuery] = useState(query);
  if (lastQuery !== query) {
    setLastQuery(query);
    setActiveIndex(0);
  }

  // Reopening should not resume someone else's half-typed search. Adjusted
  // during render, like the selection above, so the box is already empty on the
  // frame it appears.
  const [lastOpen, setLastOpen] = useState(open);
  if (lastOpen !== open) {
    setLastOpen(open);
    setQuery("");
    setActiveIndex(0);
  }

  // Return the reader to whatever opened the palette, so a keyboard user is not
  // dropped back at the top of the document.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => opener?.focus?.();
  }, [open]);

  // Dismissal. There is no backdrop to catch the click any more, so the
  // document does it instead — the same way the solutions mega menu closes.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Element | null;
      if (panelRef.current?.contains(target as Node)) return;
      // The trigger toggles itself. Closing here as well would let the click
      // that follows reopen the panel, so it looks like nothing happened.
      if (target?.closest?.("[data-search-trigger]")) return;
      onOpenChange(false);
    }

    // Escape is handled on the input too, for the case where focus has since
    // moved out of it — the Esc button, or a tab through the panel.
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  // Keep the highlighted row in view when the arrows walk past the fold.
  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  function go(entry: SearchEntry) {
    onOpenChange(false);
    router.push(entry.href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        onOpenChange(false);
        break;
      case "ArrowDown":
        event.preventDefault();
        // Wraps, so holding one arrow reaches every row without a dead end.
        setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) =>
          results.length ? (i - 1 + results.length) % results.length : 0,
        );
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(Math.max(results.length - 1, 0));
        break;
      case "Enter":
        if (!active) break;
        event.preventDefault();
        go(active);
        break;
    }
  }

  return (
    // Anchored to the header row, which is the nearest positioned ancestor —
    // so it hangs under the bar rather than floating over the middle of the
    // page. Full width of the container on a phone, where the panel is most of
    // the screen anyway; a card tucked under the right-hand end of the bar from
    // sm up, where both triggers sit.
    <div
      ref={panelRef}
      className="search-panel absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-line bg-background shadow-xl shadow-slate-900/10 sm:w-[28rem]"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <SearchIcon className="h-4 w-4 shrink-0 text-muted" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label="Search this site"
          aria-expanded="true"
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={
            active ? `search-option-${activeIndex}` : undefined
          }
          placeholder="Search solutions, equipment…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
        />
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close search"
          className="-mr-1 hidden shrink-0 rounded border border-line px-1.5 py-0.5 text-[11px] font-medium text-muted transition-colors hover:text-foreground sm:block"
        >
          Esc
        </button>
      </div>

      {results.length > 0 ? (
        <>
          <p className="px-4 pt-3 text-xs font-semibold uppercase tracking-wider text-muted">
            {trimmed ? "Results" : "All pages"}
          </p>
          {/* data-lenis-prevent: this list scrolls on its own, and momentum
              scrolling would otherwise take the wheel and glide the page
              behind it — which is now visible, so it would be obvious. */}
          <ul
            ref={listRef}
            data-lenis-prevent
            id="search-results"
            role="listbox"
            aria-label="Search results"
            className="max-h-[min(22rem,calc(100vh-12rem))] overflow-y-auto overscroll-contain p-2"
          >
            {results.map((entry, index) => {
              const isActive = index === activeIndex;
              return (
                <li
                  key={entry.id}
                  id={`search-option-${index}`}
                  role="option"
                  aria-selected={isActive}
                  data-active={isActive}
                >
                  <Link
                    href={entry.href}
                    tabIndex={-1}
                    onClick={() => onOpenChange(false)}
                    // Mouse *move*, not enter: a cursor resting over the list
                    // would otherwise steal the selection back from the arrows
                    // every time the rows re-order underneath it.
                    onMouseMove={() => {
                      if (!isActive) setActiveIndex(index);
                    }}
                    className={cn(
                      "flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors duration-100 ease-gentle",
                      isActive ? "bg-brand-light" : "hover:bg-surface",
                    )}
                  >
                    <ResultIcon
                      kind={entry.kind}
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        isActive ? "text-brand" : "text-muted",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-sm font-medium",
                          isActive ? "text-brand" : "text-foreground",
                        )}
                      >
                        <Highlight text={entry.title} tokens={tokens} />
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted">
                        {entry.breadcrumb}
                      </span>
                      {/* No `block` here: line-clamp needs its own display
                          value, and the two would fight over it. */}
                      <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                        <Highlight text={entry.summary} tokens={tokens} />
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 text-xs text-brand transition-opacity",
                        isActive ? "opacity-100" : "opacity-0",
                      )}
                    >
                      ↵
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div className="px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">
            No pages match “{trimmed}”
          </p>
          <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-muted">
            Try a category — assembly, inspection, material handling, ICT — or a
            machine, like AMR, laser marking or machine vision.
          </p>
        </div>
      )}

      <div className="hidden items-center gap-4 border-t border-line bg-surface px-4 py-2.5 text-[11px] text-muted sm:flex">
        <Hint keys={["↑", "↓"]} label="Navigate" />
        <Hint keys={["↵"]} label="Open" />
        <Hint keys={["Esc"]} label="Close" />
      </div>
    </div>
  );
}

function Hint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      {keys.map((key) => (
        <kbd
          key={key}
          className="rounded border border-line bg-background px-1.5 py-0.5 font-sans"
        >
          {key}
        </kbd>
      ))}
      {label}
    </span>
  );
}

/**
 * Marks the matched runs inside a label, so it is obvious why a row is there.
 *
 * Ranges are collected for every token and merged before rendering — two tokens
 * overlapping the same word would otherwise nest one <mark> inside another and
 * double the tint.
 */
function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  if (tokens.length === 0) return <>{text}</>;

  const haystack = text.toLowerCase();
  const ranges: Array<[number, number]> = [];

  for (const token of tokens) {
    let from = haystack.indexOf(token);
    while (from !== -1) {
      ranges.push([from, from + token.length]);
      from = haystack.indexOf(token, from + token.length);
    }
  }
  if (ranges.length === 0) return <>{text}</>;

  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const [start, end] of ranges) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  merged.forEach(([start, end], index) => {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <mark
        key={index}
        className="bg-transparent font-semibold text-brand-dark"
      >
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));

  return <>{parts}</>;
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className}>
      <circle
        cx="9"
        cy="9"
        r="5.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m13 13 3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** One mark per level of the tree, so the shape of a result reads before the
 *  words do: a house, a stack of categories, a single machine. */
function ResultIcon({
  kind,
  className,
}: {
  kind: SearchEntryKind;
  className?: string;
}) {
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;

  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className}>
      {kind === "home" && <path d="M3.5 9 10 3.75 16.5 9v7.25h-13Z" {...stroke} />}
      {kind === "category" && (
        <>
          <path d="M10 3.5 17 7l-7 3.5L3 7Z" {...stroke} />
          <path d="m3 11.5 7 3.5 7-3.5" {...stroke} />
        </>
      )}
      {kind === "equipment" && (
        <>
          <rect x="6" y="6" width="8" height="8" rx="1.25" {...stroke} />
          <path d="M8.5 3.5v2.5M11.5 3.5v2.5M8.5 14v2.5M11.5 14v2.5" {...stroke} />
          <path d="M3.5 8.5H6M3.5 11.5H6M14 8.5h2.5M14 11.5h2.5" {...stroke} />
        </>
      )}
    </svg>
  );
}
