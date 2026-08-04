import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { SubBenefit } from "@/lib/solutions";
import { Glyph } from "./Glyph";

/**
 * Benefit cards that invert on hover.
 *
 * At rest the card is light, with its photograph sitting as a plate at the
 * top. On hover the plate folds away and the same photograph takes over the
 * whole card, blurred and darkened, with the copy reversed out over it.
 *
 * Every word is readable in the resting state — the hover only restyles what
 * is already there. That matters because there is no hover on a touch screen,
 * and a card that hides its content behind one would simply be unreadable on a
 * phone.
 *
 * The plate collapses by animating grid-template-rows from 1fr to 0fr, which
 * needs no magic height and so keeps working whatever the copy or the column
 * width does.
 */
export function SubSolutionBenefits({ items }: { items: SubBenefit[] }) {
  return (
    <Container>
      <section className="py-14 sm:py-16">
        <Reveal>
          <h2 className="text-2xl font-medium tracking-tight text-brand sm:text-3xl">
            Benefits
          </h2>
        </Reveal>

        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <li key={item.title}>
              <Reveal delay={index * 70} className="h-full">
                <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-background p-5 transition-colors duration-500 ease-out hover:border-transparent">
                  {/* The take-over layer. Blurred and overscaled so the photo
                      reads as atmosphere rather than as a second picture, and
                      scrimmed hard enough to carry white text. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 motion-reduce:transition-none"
                  >
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="scale-110 object-cover blur-[6px]"
                    />
                    <div className="absolute inset-0 bg-slate-950/80" />
                  </div>

                  <div className="relative flex flex-1 flex-col">
                    <div className="grid grid-rows-[1fr] transition-[grid-template-rows,opacity] duration-500 ease-out group-hover:grid-rows-[0fr] group-hover:opacity-0 motion-reduce:transition-none">
                      <div className="overflow-hidden">
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                          <Image
                            src={item.image}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Teal in both states — it is the one colour that holds
                        against the light card and the dark takeover alike. */}
                    <Glyph
                      name={item.icon}
                      className="mt-6 h-7 w-7 text-accent"
                    />
                    <h3 className="mt-4 text-xl font-medium text-foreground transition-colors duration-500 ease-out group-hover:text-white motion-reduce:transition-none">
                      {item.title}
                    </h3>
                    <ul className="mt-4 space-y-3">
                      {item.points.map((point) => (
                        <li
                          key={point}
                          className="flex gap-2.5 text-base leading-relaxed text-muted transition-colors duration-500 ease-out group-hover:text-white/85 motion-reduce:transition-none"
                        >
                          <span aria-hidden="true" className="text-accent">
                            •
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
