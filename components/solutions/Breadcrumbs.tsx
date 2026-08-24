import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/cn";

export type Crumb = { label: string; href?: Route };

export function Breadcrumbs({
  trail,
  tone = "light",
}: {
  trail: Crumb[];
  /** "dark" is for breadcrumbs sitting on a cover image. */
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";

  return (
    <nav aria-label="Breadcrumb">
      <ol
        className={cn(
          "flex flex-wrap items-center gap-x-2 gap-y-1 text-xs",
          isDark ? "text-white/60" : "text-muted",
        )}
      >
        {/* Keyed by position, not by label. A trail can legitimately say the
            same word twice — /solutions/inspection-testing/inspection-testing-
            equipment is a machine called Inspection & Testing inside a category
            called Inspection & Testing, which is what the Automated Equipment
            sitemap asks for — and labels as keys made that a duplicate-key
            error in the console.

            Index is the right key here rather than the usual last resort: a
            trail is a fixed path from the root to this page, so a crumb's
            position *is* its identity, and the list never reorders, filters or
            grows under the reader. */}
        {trail.map((crumb, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className={cn(
                  "transition-colors duration-150 ease-gentle",
                  isDark ? "hover:text-white" : "hover:text-brand",
                )}
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                aria-current="page"
                className={isDark ? "text-white" : "text-foreground"}
              >
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
