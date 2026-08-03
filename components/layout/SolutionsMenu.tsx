"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SOLUTIONS } from "@/lib/solutions";
import { cn } from "@/lib/cn";

/**
 * Desktop mega menu for the "Solution" header item — the only nav entry in the
 * prototype that resolves to real routes.
 *
 * Left column lists the four categories, right column reveals the third level
 * (sub-solutions) for whichever category is hovered or focused.
 */
export function SolutionsMenu({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState(SOLUTIONS[0].slug);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const active = SOLUTIONS.find((s) => s.slug === activeSlug) ?? SOLUTIONS[0];
  const isSolutionRoute = pathname.startsWith("/solutions");

  // Any navigation dismisses the panel. Adjusted during render rather than in
  // an effect so the closed panel never paints for a frame after routing.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  useEffect(() => () => clearTimer(), []);

  function clearTimer() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }

  // Small grace period so the pointer can cross the gap into the panel.
  function scheduleClose() {
    clearTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  function openNow() {
    clearTimer();
    setOpen(true);
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={scheduleClose}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => (open ? setOpen(false) : openNow())}
        onFocus={openNow}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ease-gentle",
          overlay
            ? "text-white hover:text-white/80"
            : open || isSolutionRoute
              ? "text-brand"
              : "text-foreground hover:text-brand",
        )}
      >
        Solution
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
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
      </button>

      <div
        className={cn(
          "absolute left-1/2 top-full z-50 w-[44rem] -translate-x-1/2 pt-3",
          "transition duration-150",
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0",
        )}
      >
        <div className="grid grid-cols-[19rem_1fr] overflow-hidden rounded-xl border border-line bg-background shadow-xl shadow-slate-900/10">
          <ul className="border-r border-line bg-surface p-2">
            {SOLUTIONS.map((solution) => {
              const isActive = solution.slug === active.slug;
              return (
                <li key={solution.slug}>
                  <Link
                    href={solution.href}
                    onMouseEnter={() => setActiveSlug(solution.slug)}
                    onFocus={() => setActiveSlug(solution.slug)}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-background text-brand shadow-sm"
                        : "text-foreground hover:bg-background/70",
                    )}
                  >
                    {solution.title}
                    <span aria-hidden="true" className="text-muted">
                      ›
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="p-6">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted">
              {active.title}
            </p>

            <ul className="mt-3 space-y-0.5">
              {active.subSolutions.map((sub) => (
                <li key={sub.slug}>
                  <Link
                    href={sub.href}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors duration-150 ease-gentle hover:bg-brand-light hover:text-brand"
                  >
                    {sub.title}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href={active.href}
              className="group mt-4 inline-flex items-center gap-1.5 px-3 text-sm font-medium text-brand transition-colors duration-150 ease-gentle hover:text-brand-dark"
            >
              View overview
              <span
                aria-hidden="true"
                className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
