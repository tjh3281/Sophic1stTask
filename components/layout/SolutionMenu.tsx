"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Glyph } from "@/components/solutions/Glyph";
import { cn } from "@/lib/cn";
import { SOLUTION_LINES } from "@/lib/solutions";

/**
 * The Solution item on the desktop bar, with the menu of what sits under it.
 *
 * The word itself is still an ordinary link. That was the complaint against the
 * mega menu this replaces — it put a panel between the reader and a page they
 * were already pointing at — and it stays fixed here: clicking "Solution" goes
 * to /solutions exactly as every other item on the bar goes to its page.
 *
 * What changed is what /solutions holds. It used to be the equipment catalogue
 * itself; it is now a signpost one level above it, so without a menu the bar
 * would hide the whole equipment tree an extra click away. The menu is purely
 * additive: it opens on hover and on keyboard focus, and never intercepts the
 * click.
 *
 * The panel hangs off the wrapper on padding rather than a margin. Margin is
 * outside the element, so a pointer crossing that gap from the bar to the panel
 * leaves the wrapper on the way and the menu closes underneath it.
 */
export function SolutionMenu({
  label,
  href,
  overlay = false,
  current = false,
}: {
  label: string;
  href?: Route;
  /** Sitting on a dark cover rather than the solid bar. */
  overlay?: boolean;
  /** The section the reader is currently in. */
  current?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Close when the route changes. Adjusted during render rather than in an
  // effect so an open panel never paints over the page it just navigated to.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  // Matches NavButton exactly, minus the call-to-action branch this item can
  // never take. Two colours because there are two backgrounds: brand blue
  // disappears on a dark cover, where the accent teal is what those covers
  // already use to mark things out.
  const trigger = cn(
    "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-[color,transform] duration-200 ease-gentle",
    overlay
      ? current
        ? "text-accent"
        : "text-white/90 hover:text-white"
      : current
        ? "text-brand"
        : "text-foreground hover:text-brand",
  );

  const chevron = (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={cn(
        "h-3 w-3 transition-transform duration-200 ease-gentle",
        open && "rotate-180",
      )}
    >
      <path
        d="M5 7.5 10 12.5 15 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div
      className="relative"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      // Keyboard: focus entering the group opens it, focus leaving the group
      // entirely closes it. relatedTarget is where focus is heading, so the
      // test is "is it still inside?" rather than "did something blur?" —
      // without that, tabbing from the trigger onto the first link in the panel
      // would close the panel the reader was tabbing into.
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      {href ? (
        <Link
          href={href}
          aria-current={current ? "page" : undefined}
          aria-expanded={open}
          className={trigger}
          onClick={() => setOpen(false)}
        >
          {label}
          {chevron}
        </Link>
      ) : (
        <button type="button" aria-expanded={open} className={trigger}>
          {label}
          {chevron}
        </button>
      )}

      {open && (
        // Always solid, whatever the bar is doing. The trigger goes translucent
        // over a cover; a translucent panel over a factory photograph is
        // unreadable at any scrim strength.
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2">
          {/* 19.5rem, up from 17.5. The mark and its gap take 32px off the row
              before the title starts, and "Product Engineering Services" needs
              about 204 of the 190 that left it — so at the old width the two
              longest lines wrapped to a second row and the panel went ragged.
              Widening is the right lever rather than shrinking the type: this
              is four rows now, so the panel can afford the width and the
              titles are the thing being read. */}
          <div className="w-[19.5rem] overflow-hidden rounded-xl border border-line bg-background shadow-lg shadow-slate-900/5">
            {/* The lines, and nothing under them.

                Each line used to carry its categories as a sub-list, which read
                well at one line and stopped working at four: twelve categories
                under four headings is sixteen rows of hover menu, and the
                longest of them wraps to two lines inside a panel this wide. A
                menu that has to be read is no longer doing a menu's job.

                Four rows instead, one per line, and the categories are a click
                further on — where the line's own page lists them as cards with
                a photograph each, which is a better way to choose between them
                than a column of small grey type was. */}
            <ul>
              {SOLUTION_LINES.map((line) => {
                const lineCurrent =
                  pathname === line.href ||
                  pathname.startsWith(`${line.href}/`);

                // The divider sits on the row rather than on the link inside
                // it: `first:` matches the first child of a parent, and every
                // link is the only child of its own <li>, so on the link it
                // would match all four rows and draw none.
                return (
                  <li
                    key={line.slug}
                    className="border-t border-line first:border-0"
                  >
                    <Link
                      href={line.href}
                      aria-current={
                        pathname === line.href ? "page" : undefined
                      }
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 px-4 py-3 transition-colors duration-150 ease-gentle hover:bg-surface",
                        lineCurrent ? "text-brand" : "text-foreground",
                      )}
                    >
                      {/* Set quieter than the title it labels, and lifting to
                          brand with the row. The mark is what the eye lands on
                          when the menu opens, but it is not what the reader is
                          here to read — four titles at one weight with four
                          marks at the same weight is a panel with no order in
                          it. Carries its own colour rather than inheriting the
                          row's, which is foreground and far too dark for a
                          line drawing at this size. */}
                      <Glyph
                        name={line.icon}
                        className={cn(
                          "h-5 w-5 shrink-0 transition-colors duration-150 ease-gentle group-hover:text-brand",
                          lineCurrent ? "text-brand" : "text-muted",
                        )}
                      />
                      <span className="flex-1 text-sm font-semibold tracking-tight">
                        {line.title}
                      </span>
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-brand opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:translate-x-0.5 group-hover:opacity-100"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
