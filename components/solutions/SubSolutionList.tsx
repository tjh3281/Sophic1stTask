import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { SubSolution } from "@/lib/solutions";

/**
 * The sub-solutions belonging to a category.
 *
 * Items with an equipment shot render as picture cards — photo panel, category
 * chip, title, then the call to action pinned to the bottom edge. Items without
 * one keep the same card minus the panel, so a category can gain photography
 * one sub-solution at a time without the row falling apart.
 */
export function SubSolutionList({ items }: { items: SubSolution[] }) {
  return (
    <Container>
      <section className="pt-12">
        <Reveal>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Solutions in this category
          </h2>
        </Reveal>

        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <li key={item.slug}>
              <Reveal delay={index * 60} className="h-full">
                <Link
                  href={item.href}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-background transition-[border-color,box-shadow] duration-200 ease-out hover:border-brand hover:shadow-lg hover:shadow-slate-900/5"
                >
                  {item.image && (
                    // The shots are machines on a white sweep, so the panel is
                    // white too and the backdrop disappears into the card.
                    // object-contain rather than cover: cropping a photo of a
                    // specific machine to fit a box defeats the point of it.
                    <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-line bg-white">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-semibold leading-snug text-foreground transition-colors duration-150 ease-gentle group-hover:text-brand">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {item.summary}
                    </p>
                    {/* mt-auto pins this to the bottom, so the call to action
                        lines up across cards whose copy runs to different
                        lengths. */}
                    <span className="mt-auto flex items-center gap-2 pt-6 text-xs font-semibold uppercase tracking-wider text-brand">
                      Read more
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-200 ease-out group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
