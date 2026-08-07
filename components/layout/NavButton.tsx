import type { Route } from "next";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * A header item.
 *
 * With an `href` it is a real link, so middle-click and "open in new tab" work
 * the way they do everywhere else in the bar. Without one it is a <button>
 * rather than an <a href="#">, so the items that are still inert never
 * navigate or dirty browser history, while staying focusable and visually
 * identical to the live ones.
 */
export function NavButton({
  label,
  href,
  cta = false,
  overlay = false,
  className,
}: {
  label: string;
  href?: Route;
  cta?: boolean;
  /** Sitting on a dark cover rather than the solid bar. */
  overlay?: boolean;
  className?: string;
}) {
  const classes = cn(
    "inline-block rounded-md text-sm font-medium transition-[color,transform] duration-200 ease-gentle",
    cta
      ? "btn-brand px-4 py-2 text-white hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transform-none"
      : cn(
          "px-3 py-2",
          overlay
            ? "text-white/90 hover:text-white"
            : "text-foreground hover:text-brand",
        ),
    className,
  );

  const control = href ? (
    <Link href={href} className={classes}>
      {label}
    </Link>
  ) : (
    <button type="button" className={classes}>
      {label}
    </button>
  );

  // Only the filled item floats. The plain nav links have no fill to throw a
  // colour, and glowing every item would turn the bar into a light show.
  if (!cta) return control;

  return <span className="float-glow float-glow-sm">{control}</span>;
}
