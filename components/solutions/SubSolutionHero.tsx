import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { Solution, SubSolution } from "@/lib/solutions";
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
        <div className="grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_minmax(0,30rem)]">
          <div>
            <Breadcrumbs
              trail={[
                { label: "Home", href: "/" },
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
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={image}
                  alt={title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 30rem, 100vw"
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
