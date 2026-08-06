"use client";

import { cn } from "@/lib/cn";
import { SearchIcon } from "./SearchDialog";

/**
 * Opens and closes the search panel that drops out of the header.
 *
 * Two shapes for the two bars: a labelled pill on desktop, where there is room
 * for the word, and a plain icon beside the burger on small screens, where
 * there is not.
 *
 * The ⌘K / Ctrl K shortcut still works — it is just not printed on the button.
 * aria-keyshortcuts keeps it discoverable to a screen reader, which is the one
 * reader who cannot see the icon and guess.
 */
export function SearchTrigger({
  open,
  onToggle,
  overlay = false,
  variant = "bar",
}: {
  /** Whether the panel it controls is showing. */
  open: boolean;
  onToggle: () => void;
  /** Sitting on a dark cover rather than the solid bar. */
  overlay?: boolean;
  variant?: "bar" | "icon";
}) {
  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label="Search"
        aria-expanded={open}
        aria-keyshortcuts="Control+K Meta+K"
        data-search-trigger
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-150 ease-gentle",
          overlay
            ? "text-white hover:bg-white/10"
            : "text-foreground hover:bg-surface",
        )}
      >
        <SearchIcon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Search"
      aria-expanded={open}
      aria-keyshortcuts="Control+K Meta+K"
      data-search-trigger
      className={cn(
        "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors duration-150 ease-gentle",
        overlay
          ? open
            ? "border-white/60 text-white"
            : "border-white/30 text-white/90 hover:border-white/50 hover:text-white"
          : open
            ? "border-brand text-brand"
            : "border-line text-muted hover:border-muted/40 hover:text-foreground",
      )}
    >
      <SearchIcon className="h-4 w-4" />
      Search
    </button>
  );
}
