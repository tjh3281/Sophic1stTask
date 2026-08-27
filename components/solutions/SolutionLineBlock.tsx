import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { SolutionLine } from "@/lib/solutions";

/**
 * One line of business on /solutions: what it is called, what is in it, and a
 * button into it.
 *
 * Deliberately not a clickable card, which is what every other tile in this
 * section is. The block carries a real button, and a button inside a link is
 * invalid markup — so the choice is one or the other, and the button wins here
 * because this is the top of the tree: a reader on this page is choosing which
 * line of business to enter, and the control that does it should be the thing
 * they are looking at rather than a card that happens to be clickable.
 *
 * That decision runs through the rest of the styling. There is no hover border
 * and no float-glow on the block, because both are how this site says "this is
 * a link" — spending them on something inert is what teaches a reader that the
 * affordance means nothing. The block sits still and the button answers.
 */
export function SolutionLineBlock({
  line,
  index,
}: {
  line: SolutionLine;
  /** Position in the list, zero-based. Drawn as the block's number. */
  index: number;
}) {
  return (
    <div
      className={cn(
        "grid h-full overflow-hidden rounded-xl border border-line bg-background shadow-sm shadow-slate-900/[0.03]",
        // The photograph takes a fixed column and the words take what is left,
        // so the picture is the same size on every block regardless of how much
        // any one line has to say for itself. Below sm it becomes a band across
        // the top instead — a 22rem column and a paragraph cannot both fit on a
        // phone, and shrinking the photo to make them is what turns it into a
        // thumbnail of a room nobody can make out.
        //
        // Without artwork the type simply takes the whole block, so a line can
        // be added before its photography exists.
        line.image
          ? "sm:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]"
          : "grid-cols-1",
      )}
    >
      {line.image && (
        <div className="relative aspect-[16/10] sm:aspect-auto">
          <Image
            src={line.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 26rem, (min-width: 640px) 20rem, 100vw"
            className="object-cover"
          />
          {/* The same brand tint the category cards wear. It is what stops a
              daylight-cool photograph sitting on a white card looking like a
              window cut in it, and it ties this block to the cover it opens —
              where the brand light does the same job in the shadows. */}
          <div aria-hidden="true" className="absolute inset-0 bg-brand-dark/15" />
          {/* Only on the stacked layout, where the photo meets the type edge
              on. Side by side there is a real border doing this. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent sm:hidden"
          />
        </div>
      )}

      <div className="flex flex-col p-6 sm:p-8 lg:p-10">
        {/* Numbered rather than labelled. With one line of business the number
            is the quieter of the two — a lone "Automated Equipment" under a
            heading that already says these are the lines does not need the word
            repeated over it — and it is the part that keeps meaning something
            as the list grows. */}
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-muted">
          Line {String(index + 1).padStart(2, "0")}
        </p>

        <h3 className="mt-3 text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl">
          {line.title}
        </h3>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          {line.summary}
        </p>

        {/* mt-auto, so in a row of blocks of unequal height the buttons still
            line up along the bottom instead of floating each at its own text's
            end. Nothing depends on it while the list is one long. */}
        <div className="mt-auto pt-8">
          <span className="float-glow">
            <Link
              href={line.href}
              className="btn-brand group inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium text-white transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none"
            >
              Explore {line.title}
              <span
                aria-hidden="true"
                className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
