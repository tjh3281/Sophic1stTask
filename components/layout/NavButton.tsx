import { cn } from "@/lib/cn";

/**
 * An inert header item. Deliberately a <button> with no handler rather than an
 * <a href="#"> so the prototype never navigates or dirties browser history,
 * while still being focusable and visually identical to the live "Solution" item.
 */
export function NavButton({
  label,
  cta = false,
  overlay = false,
  className,
}: {
  label: string;
  cta?: boolean;
  /** Sitting on a dark cover rather than the solid bar. */
  overlay?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-md text-sm font-medium transition-colors duration-150 ease-gentle",
        cta
          ? "bg-brand px-4 py-2 text-white hover:bg-brand-dark"
          : cn(
              "px-3 py-2",
              overlay
                ? "text-white/90 hover:text-white"
                : "text-foreground hover:text-brand",
            ),
        className,
      )}
    >
      {label}
    </button>
  );
}
