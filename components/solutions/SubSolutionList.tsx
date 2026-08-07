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
                {/* The glow sits outside the card, which is overflow-hidden and
                    would clip anything drawn beyond its own edges. Same
                    treatment as the category cards on the home page. */}
                <div className="float-glow float-glow-card">
                  <Link
                    href={item.href}
                    // The tight contact shadow; the wrapper's glow is the
                    // ambient half of the same elevation.
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-background transition-[border-color,box-shadow] duration-200 ease-out hover:border-brand hover:shadow-lg hover:shadow-slate-900/5"
                  >
                    {item.image && (
                      // Every card fills this panel edge to edge, with no
                      // per-image special case — that is the only way a row of
                      // them looks like one set.
                      //
                      // It holds because the sources are prepared to suit it.
                      // The machine shots are already 4:3, each one centred on a
                      // white plate at the same optical size, so cover neither
                      // crops them nor leaves a margin; the panel is white to
                      // match their backdrop. Scene photographs are cropped to
                      // fit. Contain would undo this: it fits to whichever edge
                      // binds first, so images of differing ratios settle at
                      // differing heights and the row goes ragged.
                      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-line bg-white">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
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
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
