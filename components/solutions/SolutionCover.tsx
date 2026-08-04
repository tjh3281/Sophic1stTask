import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import type { Solution } from "@/lib/solutions";
import { BenefitIcon } from "./BenefitIcon";
import { Breadcrumbs } from "./Breadcrumbs";

/**
 * Full-bleed cover for a solution page: the one-liner over a photo of the
 * process, with the benefits as translucent cards on the same image.
 *
 * The source photo is a bright factory interior, so it needs a heavy scrim —
 * a flat tint for a predictable floor plus a gradient that deepens behind the
 * headline, where the text is largest.
 */
export function SolutionCover({ solution }: { solution: Solution }) {
  const { coverImage, benefits } = solution;

  return (
    // -mt-16 pt-16 cancels the layout's header clearance so the photo runs
    // behind the transparent header, then restores the spacing inside.
    <section className="relative isolate -mt-16 overflow-hidden bg-slate-950 pt-16">
      {coverImage && (
        <Image
          src={coverImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}

      {/* Three-part scrim. The flat tint sets a floor; the vertical gradient
          deepens at the top, where the headline and sub-heading sit, and again
          at the bottom, so the photo stops competing with the benefit cards.
          The photo reads through the lighter middle band. */}
      <div aria-hidden="true" className="absolute inset-0 bg-slate-950/50" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/25 to-slate-950/80"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-brand-dark/30 to-transparent"
      />

      <Container className="relative">
        {/* Asymmetric: the section's pt-16 already clears the fixed header, so
            the top only needs a small gap under it. */}
        <div className="pb-16 pt-6 sm:pb-20 sm:pt-8 lg:pb-24 lg:pt-10">
          <Breadcrumbs
            tone="dark"
            trail={[{ label: "Home", href: "/" }, { label: solution.title }]}
          />

          <Reveal className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">
              Solution
            </p>
          </Reveal>
          <Reveal delay={70} className="mt-2">
            {/* Medium, not bold. Poppins is a wide geometric face and carries
                far more weight than Geist at the same value; the restraint is
                what makes a large headline read as considered. */}
            <h1 className="max-w-3xl text-3xl font-medium tracking-tight text-white sm:text-4xl lg:text-5xl">
              {solution.title}
            </h1>
          </Reveal>
          <Reveal delay={140} className="mt-5">
            <p className="max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
              {solution.oneLiner}
            </p>
          </Reveal>

          {benefits && benefits.length > 0 && (
            <>
              <Reveal delay={210} className="mt-14 sm:mt-16">
                {/* One step heavier than the h1: this one sits over the busiest
                    part of the photo and needs the extra weight to hold. */}
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Why {solution.title}?
                </h2>
              </Reveal>

              {/* Column count follows the card count so a three-benefit
                  category fills its row instead of leaving a gap. Written as
                  whole class strings — Tailwind only sees literals. */}
              <ul
                className={cn(
                  "mt-8 grid gap-5 sm:grid-cols-2",
                  benefits.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4",
                )}
              >
                {benefits.map((benefit, index) => (
                  <li key={benefit.title}>
                    <Reveal delay={index * 60} className="h-full">
                      {/* Half-transparent glass at rest, firming up to 70%
                          opaque on hover while the blur deepens. Blur is
                          scaled against a 16px ceiling — heavier backdrop
                          blur gets expensive, Safari especially — so 35%
                          is 6px and 50% is 8px. */}
                      <article className="flex h-full flex-col rounded-xl border border-white/15 bg-slate-950/50 p-6 shadow-xl shadow-slate-950/40 backdrop-blur-[6px] transition-[backdrop-filter,border-color,background-color] duration-300 ease-out hover:border-white/30 hover:bg-slate-950/70 hover:backdrop-blur-[8px] motion-reduce:transition-none">
                        <BenefitIcon name={benefit.icon} />
                        <h3 className="mt-5 text-lg font-semibold text-white">
                          {benefit.title}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-white/80">
                          {benefit.description}
                        </p>
                      </article>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
