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
  current = false,
  className,
}: {
  label: string;
  href?: Route;
  cta?: boolean;
  /** Sitting on a dark cover rather than the solid bar. */
  overlay?: boolean;
  /** The section the reader is currently in. */
  current?: boolean;
  className?: string;
}) {
  // Colour only, and the weight is deliberately left alone: the bar is a row of
  // items sized by their own text, and swapping one to semibold on navigation
  // would nudge every item after it sideways.
  //
  // Two colours because there are two backgrounds. Brand blue is invisible on a
  // dark cover, so the overlay marks the current section in the accent teal
  // instead — the same highlight those covers already use for their eyebrows.
  const classes = cn(
    "inline-block rounded-md text-sm font-medium transition-[color,transform] duration-200 ease-gentle",
    cta
      ? "btn-brand px-4 py-2 text-white hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transform-none"
      : cn(
          "px-3 py-2",
          overlay
            ? current
              ? "text-accent"
              : "text-white/90 hover:text-white"
            : current
              ? "text-brand"
              : "text-foreground hover:text-brand",
        ),
    className,
  );

  // Set even on the call to action, which has no room to look any different
  // from the filled button it already is — the state is still worth announcing.
  const control = href ? (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={classes}
    >
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
