"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HEADER_NAV, isCurrentSection } from "@/lib/nav";
import { SOLUTIONS } from "@/lib/solutions";
import { cn } from "@/lib/cn";

/**
 * Below lg the header collapses into a drawer. "Solution" becomes a two-level
 * accordion; the other items stay inert, matching the desktop behaviour.
 *
 * The current page is marked in brand blue here too. The drawer is the bar at
 * this width, and a reader who opens it to see where they can go should not
 * have to remember where they already are. It reads the pathname itself rather
 * than taking one from the header: it is already a client component under the
 * same router, and a prop would be a second copy of a value that cannot
 * disagree.
 */
export function MobileNav({
  overlay = false,
  open,
  onOpenChange,
}: {
  /** Sitting on a dark cover rather than the solid bar. */
  overlay?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();

  /** Same rule the bar uses: a route inside a section counts as that section. */
  const inSection = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => onOpenChange(!open)}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-150 ease-gentle",
          overlay
            ? "text-white hover:bg-white/10"
            : "text-foreground hover:bg-surface",
        )}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
          {open ? (
            <path
              d="m6 6 12 12M18 6 6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 7h16M4 12h16M4 17h16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {open && (
        // data-lenis-prevent: this panel scrolls on its own, and momentum
        // scrolling would otherwise take the wheel and glide the page behind it.
        <div
          data-lenis-prevent
          className="absolute inset-x-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line bg-background shadow-lg"
        >
          <nav className="px-4 py-3 sm:px-6">
            <ul className="divide-y divide-line">
              {HEADER_NAV.map((item) =>
                item.hasMenu ? (
                  <li key={item.label} className="py-2">
                    <p className="px-1 py-2 text-xs font-semibold uppercase tracking-wider text-muted">
                      {item.label}
                    </p>
                    <ul className="space-y-1">
                      {/* Matches the desktop menu: the overview sits above the
                          categories it covers, since the "Solution" heading
                          here is a label rather than a link. */}
                      <li>
                        <Link
                          href="/solutions"
                          className="block rounded-md px-1 py-2 text-sm font-medium text-brand"
                        >
                          All solutions
                        </Link>
                      </li>
                      {SOLUTIONS.map((solution) => {
                        const isExpanded = expanded === solution.slug;
                        return (
                          <li key={solution.slug}>
                            <div className="flex items-center">
                              <Link
                                href={solution.href}
                                aria-current={
                                  inSection(solution.href) ? "page" : undefined
                                }
                                className={cn(
                                  "flex-1 rounded-md px-1 py-2 text-sm font-medium",
                                  inSection(solution.href)
                                    ? "text-brand"
                                    : "text-foreground",
                                )}
                              >
                                {solution.title}
                              </Link>
                              <button
                                type="button"
                                aria-expanded={isExpanded}
                                aria-label={`${isExpanded ? "Hide" : "Show"} ${solution.title} solutions`}
                                onClick={() =>
                                  setExpanded(isExpanded ? null : solution.slug)
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface"
                              >
                                <svg
                                  viewBox="0 0 20 20"
                                  aria-hidden="true"
                                  className={cn(
                                    "h-3.5 w-3.5 transition-transform",
                                    isExpanded && "rotate-180",
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
                            </div>

                            {isExpanded && (
                              <ul className="mb-2 ml-1 space-y-1 border-l border-line pl-3">
                                {solution.subSolutions.map((sub) => (
                                  <li key={sub.slug}>
                                    <Link
                                      href={sub.href}
                                      aria-current={
                                        pathname === sub.href
                                          ? "page"
                                          : undefined
                                      }
                                      className={cn(
                                        "block rounded-md px-2 py-2 text-sm hover:text-brand",
                                        pathname === sub.href
                                          ? "font-medium text-brand"
                                          : "text-muted",
                                      )}
                                    >
                                      {sub.title}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ) : (
                  <li key={item.label}>
                    {item.href ? (
                      // The drawer closes itself on navigation, from the
                      // pathname watch in Header.
                      <Link
                        href={item.href}
                        aria-current={
                          isCurrentSection(item, pathname) ? "page" : undefined
                        }
                        className={cn(
                          "block px-1 py-3.5 text-sm font-medium",
                          isCurrentSection(item, pathname)
                            ? "text-brand"
                            : "text-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="w-full px-1 py-3.5 text-left text-sm font-medium text-foreground"
                      >
                        {item.label}
                      </button>
                    )}
                  </li>
                ),
              )}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
