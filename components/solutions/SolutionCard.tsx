import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Solution } from "@/lib/solutions";

/**
 * Home page card for a solution category.
 *
 * When the solution has a cover image the card inverts to a photo tile with a
 * scrim; without one it stays on the light surface style. Both variants keep
 * the same shape and spacing so a mixed grid still lines up.
 */
export function SolutionCard({ solution }: { solution: Solution }) {
  const image = solution.coverImage;

  return (
    <Link
      href={solution.href}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border p-6",
        "transition-[border-color,background-color,box-shadow] duration-200 ease-out",
        image
          ? "border-white/10 bg-slate-950 hover:border-white/30"
          : "border-line bg-background hover:border-brand hover:bg-brand-light/40 hover:shadow-lg hover:shadow-slate-900/5",
      )}
    >
      {image && (
        <>
          {/* Scaling the image rather than the card avoids the hover flicker
              you get when the hover target itself moves. */}
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-slate-950/70" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-slate-950/85 to-slate-950/30"
          />
        </>
      )}

      <div className="relative flex flex-1 flex-col">
        <h3
          className={cn(
            "text-lg font-semibold",
            image
              ? "text-white"
              : "text-foreground transition-colors duration-150 ease-gentle group-hover:text-brand",
          )}
        >
          {solution.title}
        </h3>
        <p
          className={cn(
            "mt-3 flex-1 text-sm leading-relaxed",
            image ? "text-white/80" : "text-muted",
          )}
        >
          {solution.oneLiner}
        </p>
        <p
          className={cn(
            "mt-5 flex items-center gap-2 text-xs",
            image ? "text-white/70" : "text-muted",
          )}
        >
          {solution.subSolutions.length}{" "}
          {solution.subSolutions.length === 1 ? "solution" : "solutions"}
          <span
            aria-hidden="true"
            className={cn(
              "opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:translate-x-1 group-hover:opacity-100",
              image ? "text-sky-300" : "text-brand",
            )}
          >
            →
          </span>
        </p>
      </div>
    </Link>
  );
}
