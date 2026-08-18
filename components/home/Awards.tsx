import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { MedalDrop } from "./MedalDrop";
import "./Awards.css";

/**
 * The commemorative certificate, at its native proportions.
 *
 * Named for what it is rather than for how recent it is — the files it has
 * replaced were called "latest", "new" and "last final", and a fourth adjective
 * would not have helped anyone find it. A revised certificate overwrites this
 * path.
 *
 * Cropped from the supplied artwork, which arrives as the document floating in
 * the middle of a 1414x2000 transparent sheet: the size below is the opaque box
 * read off its alpha channel — 998x1413 at (220, 459) — flattened onto white,
 * since the section it sits in is white and the ring and shadow the component
 * draws want a real edge to sit against rather than a soft one.
 */
const CERTIFICATE = {
  // WebP rather than PNG: the same crop is 146KB here against 1.24MB as a PNG,
  // and this is a document — flat paper, fine type — which is the case that
  // survives it. Delivery goes through next/image either way, so what this
  // decides is what the repository carries.
  src: "/images/sophic-20th-anniversary-certificate.webp",
  width: 998,
  height: 1413,
};

/**
 * The second screen of the home page: the medal, and the certificate it
 * belongs to.
 *
 * White, against the hero's dark. The two are meant to read as separate
 * things, and here that break does real work: the medal is lowered from above
 * this section's top edge, so the colour change is what the ribbon appears to
 * come out from behind. On a shared background the same clip is an invisible
 * line the ribbon simply stops at.
 *
 * The clip that hides the medal before it drops is in Awards.css rather than
 * on the element, because which kind of clip it is decides whether the medal
 * can stick at all. See the note there.
 */
export function Awards() {
  return (
    <section className="awards relative isolate bg-white pb-20 sm:pb-28">
      <Container>
        {/* The section's picture is a medal and a certificate, and neither is
            a heading. This is here so the page still has an outline to
            navigate by; what it says is on the certificate below. */}
        <h2 className="sr-only">Awards and certifications</h2>

        {/* The medal's column is left to stretch to the row while the rig
            inside it sticks. Sticking the grid item itself would do nothing:
            a `self-start` item is only as tall as its contents, and a sticky
            element with no room left to travel in its parent never moves. */}
        {/* The medal's column is sized by the medal, not by a number kept in
            step with it. It used to be a fixed 20rem, which the rig had very
            nearly outgrown — and widening it to a fixed 24rem instead took 64px
            off the certificate at 1024px whether the medal was using them or
            not, because at that width the medal is capped by 28vw and is
            narrower than its own ceiling. `auto` hands the certificate back
            everything the medal is not actually occupying, at every width, and
            leaves one number to tune instead of two. See --disc-w in
            MedalDrop.css. */}
        <div className="grid gap-x-14 lg:grid-cols-[auto_minmax(0,1fr)]">
          {/* Flex at every width, including where it only holds one thing.
              A block parent would collapse the rig's negative top margin out
              into itself and the grid item above it, which moves the clip the
              margin exists to create; a flex container does not collapse its
              items' margins, so the offset stays where it was measured. */}
          {/* items-start is not decoration. A flex container stretches its
              items to its own height by default, and this one is a grid item
              stretched to the full row — so the sticky child would be as tall
              as the space it is meant to move around in, and stick to
              nothing. */}
          <div className="flex items-start justify-center lg:justify-start">
            {/* The offset is negative so that the ribbon's cut top edge is
                held above the window rather than stopping in clear white a
                little below the header — which is the same gap this is all
                about, just in the pinned state instead of the parked one.
                Below lg the two stack, so there is no second column for the
                medal to stay beside: it simply leads the section. */}
            <div className="lg:sticky lg:-top-8">
              <MedalDrop />
            </div>
          </div>

          <Reveal className="mt-14 lg:mt-24">
            {/* The page under it is white and so is most of the certificate,
                so it needs an edge of its own or it dissolves into the page.
                A hairline and a low, wide shadow — the document sitting on the
                page rather than a framed picture of one. */}
            <Image
              src={CERTIFICATE.src}
              alt="Commemorative certificate: Sophic Automation Sdn. Bhd., industrial automation solutions, established 2007, Penang, Malaysia. Celebrating 20 years of innovation and excellence. For twenty years Sophic Automation has been driving industrial progress through innovative automation solutions, engineering expertise, and a steadfast commitment to excellence — from manufacturing and assembly to smart factory integration."
              width={CERTIFICATE.width}
              height={CERTIFICATE.height}
              sizes="(min-width: 1024px) 46rem, 100vw"
              className="mx-auto h-auto w-full max-w-[46rem] rounded-sm shadow-[0_22px_60px_-24px_rgb(15_23_42/0.4)] ring-1 ring-slate-900/10"
            />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
