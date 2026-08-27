import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { SolutionLine } from "@/lib/solutions";
import { Breadcrumbs } from "./Breadcrumbs";
import "./SolutionLineCover.css";

/**
 * Full-bleed cover for a line of business: its photograph, its name, and the
 * button into what it holds.
 *
 * This replaced the scroll-driven assembly cell that used to open Automated
 * Equipment. That hero now belongs to /solutions alone, which is the better
 * place for it — the arm swinging onto the chip is the site's one piece of
 * theatre, and a reader should meet it once at the front door rather than
 * twice on the way in.
 *
 * What stands in for the motion here is a photograph given room. The type is
 * anchored to the foot of the frame rather than centred in it, so the picture
 * is read first and the words arrive underneath it, and the composition holds
 * at any height — which a centred block does not, because it fights the
 * subject of the photograph for the middle of the screen.
 *
 * The scrim is four layers and every one of them earns its place; see the
 * comments on each. It is heavy at the top because it has to be: this route is
 * in COVER_ROUTES, so the header goes transparent over it, and the top right of
 * this photograph — bright ceiling, white arm — is exactly where white nav
 * links would otherwise vanish.
 */
export function SolutionLineCover({
  line,
  eyebrow,
  lead,
  jump,
}: {
  line: SolutionLine;
  /** Names the section the reader is in, above the heading that names the page. */
  eyebrow: string;
  /**
   * What the line is, in a sentence or two.
   *
   * Defaults to the line's own summary, which is what keeps this cover and the
   * block linking to it on /solutions saying the same thing. Override it where
   * a page wants to open on something fuller than a signpost needs — the
   * summary is written to sit in a header menu as well, and a cover has room
   * for a sentence that does not.
   */
  lead?: string;
  /**
   * The button under the copy. A same-page jump, so a plain `<a>` rather than
   * next/link — there is no route to prefetch, and the arrow points down
   * because the thing it goes to is further down this page.
   */
  jump: { href: string; label: string };
}) {
  return (
    // -mt-16 pt-16 cancels the layout's header clearance so the photo runs
    // behind the transparent header, then restores the spacing inside.
    <section className="relative isolate -mt-16 overflow-hidden bg-slate-950 pt-16">
      {line.image && (
        <div aria-hidden="true" className="line-cover__photo">
          <Image
            src={line.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      {/* A flat floor first, so every layer above it is working against a known
          value rather than against whatever the photograph happens to be doing
          at that point in the frame. */}
      <div aria-hidden="true" className="absolute inset-0 bg-slate-950/45" />
      {/* Deep at both ends and open through the middle: the top carries the
          nav, the bottom carries the type, and the band between them is where
          the photograph is left alone to be a photograph. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/20 to-slate-950/90"
      />
      {/* And once more from the left, because the type is set against that
          edge and a vertical gradient alone leaves the end of a long line
          sitting on bright metal. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/10 to-transparent"
      />
      {/* Brand light, on top of the scrims rather than under them — it is
          putting colour back into what they just took out. See the CSS. */}
      <div aria-hidden="true" className="line-cover__light" />

      <Container className="relative">
        {/* The section's pt-16 already clears the fixed header, so the top only
            needs a small gap under it. Tall enough to be the whole screen on a
            desktop and merely generous on a phone, where a full-height cover is
            a screen the reader has to scroll past before the page starts. */}
        <div className="flex min-h-[30rem] flex-col pb-16 pt-6 sm:min-h-[34rem] sm:pb-20 sm:pt-8 lg:min-h-[calc(100vh-8rem)] lg:pb-24">
          <Breadcrumbs
            tone="dark"
            trail={[
              { label: "Home", href: "/" },
              { label: "Solutions", href: "/solutions" },
              { label: line.title },
            ]}
          />

          {/* mt-auto is what anchors the copy to the foot of the frame while
              the breadcrumbs stay at the head of it. */}
          <div className="mt-auto max-w-2xl pt-16">
            <Reveal>
              <span aria-hidden="true" className="line-cover__rule" />
            </Reveal>
            <Reveal delay={70} className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                {eyebrow}
              </p>
            </Reveal>
            <Reveal delay={140} className="mt-3">
              {/* Medium, not bold. Poppins is a wide geometric face and carries
                  far more weight than Geist at the same value; the restraint is
                  what makes a large headline read as considered. */}
              <h1 className="text-4xl font-medium tracking-tight text-white sm:text-5xl xl:text-6xl">
                {line.title}
              </h1>
            </Reveal>
            <Reveal delay={210} className="mt-5">
              <p className="max-w-xl text-base leading-relaxed text-white/85">
                {lead ?? line.summary}
              </p>
            </Reveal>
            <Reveal delay={280} className="mt-9">
              {/* The wrapper carries the glow — .btn-brand has already spent
                  its own ::before on the hover face. */}
              <span className="float-glow">
                <a
                  href={jump.href}
                  className="btn-brand group inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium text-white transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none"
                >
                  {jump.label}
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 ease-out group-hover:translate-y-0.5"
                  >
                    ↓
                  </span>
                </a>
              </span>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
