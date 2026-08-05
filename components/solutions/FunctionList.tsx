import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { SolutionFunction } from "@/lib/solutions";
import { BRAND_RAMP } from "./figureGradient";
import { Glyph } from "./Glyph";

/**
 * What the machine does, one card per function.
 *
 * The cards carry a pale brand tint rather than a border. On a page that
 * already has an outlined content block and photo cards, another bordered box
 * would just add lines; a filled panel separates the group from the page by
 * tone instead.
 */
export function FunctionList({ items }: { items: SolutionFunction[] }) {
  return (
    <Container>
      <section className="py-14 sm:py-16">
        <Reveal>
          <h2 className="text-2xl font-medium tracking-tight text-brand sm:text-3xl">
            Functions
          </h2>
        </Reveal>

        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <li key={item.title}>
              <Reveal delay={index * 70} className="h-full">
                <article className="flex h-full flex-col rounded-xl bg-brand-light p-6">
                  {/* The same blue-to-teal ramp the metric figures are filled
                      with, so the two sections read as one page rather than
                      two. Painted on the tile rather than the mark: the glyph
                      is a hairline stroke, and a gradient across 1.5px of line
                      is a colour nobody can see. */}
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-lg text-white ${BRAND_RAMP}`}
                  >
                    <Glyph name={item.icon} />
                  </span>
                  {/* Set to the reference's proportions: the title one step
                      larger but a weight lighter, and body copy at full size
                      rather than the small text used elsewhere. The heavier,
                      smaller pairing was what made these read as a different
                      face from the rest of the page. */}
                  <h3 className="mt-5 text-xl font-medium text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-muted">
                    {item.description}
                  </p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
