import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Solution } from "@/lib/solutions";

/**
 * Home page card for a solution category.
 *
 * Photograph on the left, words on the right, and never the two overlapping.
 * The earlier version set the copy over the photo behind a scrim, which no
 * strength of scrim could rescue: a factory floor is all girders, cabling and
 * conveyor rail, so a scrim light enough to leave the photo recognisable was
 * never dark enough to read against. Splitting them fixes it outright — the
 * type sits on the card's own white, and the photo keeps doing the one job it
 * is good at, which is telling four categories apart before a word is read.
 *
 * The photo has no frame around it. It fades out through the mask in
 * globals.css, finishing before the type column begins.
 *
 * The list of equipment replaces the old "3 solutions" counter. The count was
 * dead metadata — an engineer scanning for a tray handler needs to know whether
 * this is the category that holds one, and the names answer that where a
 * number cannot. It is also what makes the four cards read differently from
 * each other rather than as four variations of the same tile.
 */
export function SolutionCard({ solution }: { solution: Solution }) {
  const image = solution.coverImage;

  return (
    // The glow has to sit outside the card: the card is overflow-hidden, which
    // would clip anything drawn beyond its own edges.
    <div className="float-glow float-glow-card">
      <Link
        href={solution.href}
        // Everything in the card is inside the link, so without this a screen
        // reader announces the description and the whole equipment list as the
        // link's name. The text stays in the document and is still read as
        // text; it just stops being the label.
        aria-label={solution.title}
        className={cn(
          "group relative grid h-full overflow-hidden rounded-xl border border-line bg-background",
          "transition-[border-color,box-shadow] duration-200 ease-out",
          // The tight contact shadow. The wrapper's glow is the ambient half of
          // the same elevation — one sits under the card, the other spreads
          // beneath it, and real lifted objects cast both.
          "hover:border-brand hover:shadow-lg hover:shadow-slate-900/5",
          // Without a photo the type simply takes the whole card, so a category
          // can be added before its photography exists.
          // Narrower on a phone: the longest equipment name is 35 monospaced
          // characters, and the photo cannot take room the names need to sit on
          // one line each.
          image
            ? "grid-cols-[6.5rem_minmax(0,1fr)] sm:grid-cols-[9.5rem_minmax(0,1fr)]"
            : "grid-cols-1",
        )}
      >
        {image && (
          // Masked as one unit, so the tint fades out with the photo under it.
          <div className="solution-card-photo relative overflow-hidden">
            <Image
              src={image}
              alt=""
              fill
              // A tenth of the width it used to occupy, so the browser can
              // fetch a far smaller file than the full-bleed version needed.
              sizes="(min-width: 640px) 152px, 104px"
              className={cn(
                "object-cover saturate-[0.85]",
                // Leans toward the type on hover rather than growing the card —
                // moving the hover target itself makes the pointer flicker in
                // and out of it. One transform, and nothing reflows.
                "transition-transform duration-500 ease-out group-hover:translate-x-1.5 group-hover:scale-105",
                "motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:scale-100",
              )}
            />
            {/* Four photographs shot under four different lights. A common tint
                pulls them into one family without hiding what they show. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-brand-dark/20"
            />
          </div>
        )}

        <div className="flex flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold leading-snug tracking-tight text-foreground transition-colors duration-150 ease-gentle group-hover:text-brand sm:text-lg">
              {solution.title}
            </h3>
            <span
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-brand opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:translate-x-0.5 group-hover:opacity-100"
            >
              →
            </span>
          </div>

          <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted">
            {solution.oneLiner}
          </p>

          {/* Follows the description immediately. Pinning it to the foot of the
              card lined the lists up across a row, but the rows stretch to
              their tallest card — so on a category with one machine it opened a
              hole in the middle of the card. Trailing space under a short list
              reads as breathing room; a gap in the middle reads as a bug. */}
          <div className="mt-5">
            <p className="border-t border-line pt-3 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-muted">
              Equipment
            </p>
            <ul className="mt-2 space-y-1">
              {solution.subSolutions.map((sub) => (
                <li
                  key={sub.slug}
                  className="font-mono text-[0.6875rem] leading-relaxed text-foreground/80"
                >
                  {sub.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Link>
    </div>
  );
}
