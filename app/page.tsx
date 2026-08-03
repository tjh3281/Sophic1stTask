import Image from "next/image";
import { SolutionCard } from "@/components/solutions/SolutionCard";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SOLUTIONS } from "@/lib/solutions";

export default function HomePage() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <Container>
          <div className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
            <div>
              {/* Staggered entrance — 70ms apart so the group still lands fast. */}
              <Reveal>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                  Automation Solutions
                </p>
              </Reveal>
              <Reveal delay={70} className="mt-3">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  Four solution categories, one automation partner.
                </h1>
              </Reveal>
              <Reveal delay={140} className="mt-5">
                <p className="max-w-xl text-base leading-relaxed text-muted">
                  Assembly, inspection, material handling and electrical test —
                  engineered into your production line.
                </p>
              </Reveal>
              <Reveal delay={210} className="mt-8">
                {/* Same-page jump, so a plain anchor rather than next/link —
                    there is no route to prefetch or transition to. */}
                <a
                  href="#solutions"
                  className="group inline-flex items-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-medium text-white transition-[background-color,transform] duration-150 ease-out hover:bg-brand-dark active:scale-[0.97]"
                >
                  Explore solutions
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 ease-out group-hover:translate-y-0.5"
                  >
                    ↓
                  </span>
                </a>
              </Reveal>
            </div>

            <Reveal
              variant="settle"
              delay={120}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-background"
            >
              <Image
                src="/images/assembly-automation-1.avif"
                alt="Robotic arm placing a chip onto a circuit board"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </Reveal>
          </div>
        </Container>
      </section>

      <Container>
        {/* scroll-mt clears the sticky header when jumped to from the hero. */}
        <section id="solutions" className="scroll-mt-24 py-16">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Solutions
            </h2>
          </Reveal>

          <ul className="mt-8 grid gap-5 sm:grid-cols-2">
            {SOLUTIONS.map((solution, index) => (
              <li key={solution.slug}>
                <Reveal delay={index * 60} className="h-full">
                  <SolutionCard solution={solution} />
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </>
  );
}
