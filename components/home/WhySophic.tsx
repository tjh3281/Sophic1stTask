import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { MotionArt } from "@/components/ui/MotionArt";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

/**
 * The company copy, verbatim from the brief.
 *
 * Kept as data rather than written into the markup so the three paragraphs
 * cannot drift apart from each other as the layout around them changes. The
 * wording is Sophic's own and is not to be edited.
 */
const INTRO = [
  "Sophic Automation Sdn Bhd was founded in 2007 with the mission of providing the most innovative and effective Industrial Automation Solutions to our customers.",
  "Combining cutting edge and the adventurous spirit of our technical competency, we have seen an extensive growth in business solutions.",
  "We offer an attractively priced and complete outsourcing mechanism whereby we develop, supply, and manage customized automation solutions and engineering services for our customers.",
];

const ANNIVERSARY =
  "Throughout the anniversary year, colleagues across the globe celebrated this milestone through inspiring stories, local community engagement and creative contributions. These highlights, projects and moments have been brought together in our 20th Anniversary eBook.";

/**
 * Outlined call to action.
 *
 * A link where it has somewhere to go, and a <button> where it does not —
 * which is still the case for the eBook, since there is no such file on the
 * site. A <button> rather than an <a href="#"> for that one: the anchor would
 * navigate, dirty the history and land the reader back where they started,
 * which is worse than a control that visibly does nothing.
 */
function OutlineButton({
  href,
  className,
  children,
}: {
  href?: Route;
  className?: string;
  children: React.ReactNode;
}) {
  const classes = cn(
    "group inline-flex items-center gap-3 rounded-md border border-brand/35 px-4 py-2.5 text-sm font-medium text-brand transition-colors duration-200 ease-gentle hover:border-brand hover:bg-brand-light",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes}>
      {children}
    </button>
  );
}

/**
 * The third screen: who Sophic are, and the anniversary book.
 *
 * Two bands under one heading. The upper one is the company statement beside
 * the isometric line of equipment; the lower is the 20th anniversary eBook.
 * They are one section rather than two because the second is a footnote to the
 * first — it has no heading of its own and would read as an orphan under one.
 */
export function WhySophic() {
  return (
    <section className="bg-white pb-20 pt-16 sm:pb-28 sm:pt-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          <Reveal>
            <p className="text-sm font-medium text-brand">Why Choose Sophic?</p>

            <h2 className="mt-2 text-[1.75rem] font-bold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-[2.25rem]">
              Your Single Destination for Success
            </h2>

            {/* The rule under the heading, as drawn in the brief. */}
            <span
              aria-hidden="true"
              className="mt-5 block h-1 w-28 rounded-full bg-brand"
            />

            {/* Justified from sm up only. The brief sets these justified and
                they should be — but a justified paragraph in a phone-width
                column is mostly white rivers, since there are too few words
                per line for the spacing to absorb. */}
            <div className="mt-6 space-y-5 text-[0.9375rem] leading-relaxed text-muted sm:text-justify">
              {INTRO.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-8">
              <OutlineButton href="/company">Get To Know Us</OutlineButton>
            </div>
          </Reveal>

          <Reveal variant="settle">
            {/* Decorative: a stylised smart factory that repeats what the copy
                beside it already says. It loops, so it holds a still frame
                until it is scrolled to and never moves at all for a reader who
                asked for less motion — see MotionArt. */}
            <MotionArt
              animated="/images/single-destination.webp"
              still="/images/single-destination-still.webp"
              alt=""
              width={591}
              height={457}
              className="mx-auto w-full max-w-sm lg:max-w-none"
            />
          </Reveal>
        </div>

        {/* The anniversary book. Set apart from the statement above by space
            rather than a rule — it is the same voice continuing, not a new
            subject. */}
        <div className="mt-16 grid gap-8 sm:mt-20 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)] sm:gap-10 lg:gap-14">
          <Reveal variant="settle">
            <Image
              src="/images/anniversary-book.png"
              alt="The Sophic 20th Anniversary eBook, front and back covers."
              width={207}
              height={235}
              sizes="(min-width: 640px) 9rem, 40vw"
              className="mx-auto h-auto w-32 sm:mx-0 sm:w-full"
            />
          </Reveal>

          <Reveal>
            <p className="text-[0.9375rem] leading-relaxed text-muted sm:text-justify">
              {ANNIVERSARY}
            </p>

            {/* Pushed to the right of its own column from sm, as drawn. */}
            <div className="mt-7 sm:flex sm:justify-end">
              <OutlineButton className="w-full justify-between sm:w-[26rem]">
                <span>
                  View our 20<sup>th</sup> Anniversary Book
                </span>
                <span
                  aria-hidden="true"
                  className="text-base leading-none transition-transform duration-200 ease-gentle group-hover:translate-x-0.5"
                >
                  ›
                </span>
              </OutlineButton>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
