import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { lineOf, type Solution, type SubSolution } from "@/lib/solutions";
import { Breadcrumbs } from "./Breadcrumbs";

/**
 * Hero for a sub-solution that has an equipment shot.
 *
 * The same photo does two jobs. Blown up, blurred and tinted it becomes the
 * section's backdrop — the blur is what makes that work, since these shots are
 * small and would fall apart if stretched sharp across the viewport. A second,
 * untouched copy sits at close to its native size as the subject.
 *
 * Unlike the category covers this stays light and stays below the header: the
 * header is only transparent over the category routes, so a full-bleed dark
 * treatment here would run copy underneath an opaque bar.
 */
export function SubSolutionHero({
  solution,
  subSolution,
}: {
  solution: Solution;
  subSolution: SubSolution;
}) {
  const { image, title, summary } = subSolution;
  const isPhoto = subSolution.imageFraming === "photo";
  const line = lineOf(solution);

  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-surface">
      {image && (
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          {/* Overscaled so the blur's soft edge falls outside the section
              rather than fading to nothing at the boundary. */}
          <Image
            src={image}
            alt=""
            fill
            sizes="100vw"
            className="scale-150 object-cover opacity-60 blur-3xl"
          />
        </div>
      )}
      {/* Warms the wash toward the brand and keeps the left side calm enough
          for the copy — the raw photo is a near-neutral grey. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-light/80 via-background/70 to-transparent"
      />

      <Container className="relative">
        {/* The picture column widens again at xl, where there is room to spend
            — at lg the copy still needs most of the width for a 48px heading,
            and taking it there pushes the title to three lines. */}
        <div className="grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_minmax(0,30rem)] xl:grid-cols-[1fr_minmax(0,34rem)]">
          <div>
            <Breadcrumbs
              trail={[
                { label: "Home", href: "/" },
                { label: line.title, href: line.href },
                { label: solution.title, href: solution.href },
                { label: title },
              ]}
            />
            <Reveal className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                {solution.title}
              </p>
            </Reveal>
            <Reveal delay={70} className="mt-2">
              <h1 className="max-w-2xl text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {title}
              </h1>
            </Reveal>
            <Reveal delay={140} className="mt-4">
              <p className="max-w-xl text-base leading-relaxed text-muted">
                {summary}
              </p>
            </Reveal>
          </div>

          {image && (
            <Reveal variant="settle" delay={140}>
              {/* A cut-out machine floats on the wash, so it fills the box and
                  keeps its whole silhouette. A scene photograph is cropped to
                  the frame instead — letterboxing one inside a 4:3 box leaves
                  bands of backdrop that read as a mistake. */}
              <div
                className={
                  isPhoto
                    ? "relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-line shadow-xl shadow-slate-900/10"
                    : "relative aspect-[4/3] w-full"
                }
              >
                <Image
                  src={image}
                  alt={title}
                  fill
                  priority
                  sizes="(min-width: 1280px) 34rem, (min-width: 1024px) 30rem, 100vw"
                  // The cut-out plates are 4:3 with the machine sized to about
                  // 72% of their height — the margin a card panel wants, and
                  // more than a hero does. A light scale takes some of it back,
                  // to roughly 79% of the box. Any surplus that spills past the
                  // edges is transparent, so nothing clips.
                  // A photograph is already cropped to fill, and its frame
                  // clips, so scaling that would only zoom the crop.
                  className={
                    isPhoto
                      ? "object-cover"
                      : "scale-120 object-contain drop-shadow-2xl"
                  }
                />
              </div>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
