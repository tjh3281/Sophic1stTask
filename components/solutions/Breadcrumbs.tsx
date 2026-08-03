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
        {trail.map((crumb, index) => (
          <li key={crumb.label} className="flex items-center gap-2">
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
