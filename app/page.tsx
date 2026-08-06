import { HeroScene } from "@/components/home/HeroScene";
import { LogoMarquee } from "@/components/home/LogoMarquee";
import { SolutionCard } from "@/components/solutions/SolutionCard";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SOLUTIONS } from "@/lib/solutions";

export default function HomePage() {
  return (
    <>
      {/* Scroll runway. From lg the frame inside pins to the top while this
          scrolls past, so the scene sits still and only the arm moves. Below lg
          it collapses to an ordinary stacked hero. */}
      <section className="relative lg:h-[165vh]">
        {/* isolate + overflow-hidden keeps the full-bleed stage inside the hero;
            the copy sits above it on z-10 where the stage is masked away. */}
        <div className="relative isolate overflow-hidden border-b border-line bg-surface lg:sticky lg:top-16 lg:flex lg:h-[calc(100vh-4rem)] lg:items-center">
          <Container className="relative z-10 w-full">
            <div className="py-16 lg:max-w-[52%] lg:py-0">
            <div>
              {/* Staggered entrance — 70ms apart so the group still lands fast. */}
              <Reveal>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                  Automation Solutions
                </p>
              </Reveal>
              <Reveal delay={70} className="mt-3">
                {/* Break is explicit rather than left to wrapping: the column
                    is only a few px wider than the longest line, so natural
                    wrapping flips between two and three lines. Stays inline
                    below lg, where the copy is full width. */}
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[2.4rem] xl:text-5xl">
                  <span className="lg:block">Four solution categories,</span>{" "}
                  <span className="lg:block">one automation partner.</span>
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
                  className="btn-brand group inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium text-white transition-transform duration-150 ease-out active:scale-[0.97]"
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
          </div>
          </Container>

          <HeroScene />
        </div>
      </section>

      <LogoMarquee />

      <Container>
        {/* scroll-mt clears the sticky header when jumped to from the hero.
            From lg the section is sized to one screen and centred in it, so the
            jump from the hero lands on all four categories at once with nothing
            cut off at the fold. Below lg the cards stack, where four of them
            cannot share a screen without becoming too small to read — so there
            they scroll like ordinary content. */}
        <section
          id="solutions"
          className="scroll-mt-20 py-16 lg:flex lg:min-h-[calc(100vh-4rem)] lg:flex-col lg:justify-center lg:py-12"
        >
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
