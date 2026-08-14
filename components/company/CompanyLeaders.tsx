import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { LEADERSHIP, type Leader } from "@/lib/company";
import "./CompanyDark.css";
import "./CompanyLeaders.css";

/**
 * The two founders, and what each of them says.
 *
 * Read as a row rather than a card: portrait, then who, then what they said,
 * with the quote given the width because it is the only part of this that is
 * not on the business card already. Below lg the three stack and centre.
 *
 * The quote wears an open corner frame — two marks, top left and bottom right,
 * navy over mint — instead of quotation marks or a box. A box would make two
 * founders into two tiles; the corners hold the words without enclosing them,
 * which is the mark the board itself uses.
 */
export function CompanyLeaders() {
  return (
    <section className="company-leaders bg-background py-16 sm:py-24">
      <Container>
        <Reveal>
          <h2 className="text-[1.75rem] font-bold leading-[1.15] tracking-[-0.03em] text-brand-dark sm:text-[2.25rem]">
            {LEADERSHIP.heading}
          </h2>
          {/* Thicker and squarer than the site's usual hairline rule: the board
              underlines this heading rather than labelling it. */}
          <span
            aria-hidden="true"
            className="mt-3 block h-1 w-36 bg-[var(--mint)]"
          />
        </Reveal>

        <ul className="mt-12 space-y-14 sm:mt-14 sm:space-y-16">
          {LEADERSHIP.people.map((person, index) => (
            <li key={person.name}>
              <Reveal delay={index * 90}>
                <LeaderRow person={person} />
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function LeaderRow({ person }: { person: Leader }) {
  return (
    <article className="grid items-center gap-6 text-center sm:gap-8 lg:grid-cols-[auto_minmax(0,13rem)_minmax(0,1fr)] lg:gap-10 lg:text-left">
      <div className="justify-self-center lg:justify-self-start">
        <Portrait person={person} />
      </div>

      <div>
        {/* The name is not a heading. The section has one, and six of these
            would put two people at the same level as the section they are in;
            what these are is a list of two. */}
        <p className="text-[1.0625rem] uppercase tracking-[0.02em] text-foreground sm:text-[1.1875rem]">
          {person.name}
        </p>
        <p className="mt-2 text-[0.9375rem] font-bold text-brand-dark sm:text-base">
          {person.role}
        </p>
      </div>

      {/* The frame is drawn on this box, so it sits against the quote's own
          edges rather than the column's — a short quote gets a small frame. */}
      <blockquote className="company-leaders__quote">
        <p className="text-[0.9375rem] italic leading-relaxed text-foreground sm:text-[1.0625rem] sm:leading-[1.7]">
          &ldquo;{person.quote}&rdquo;
        </p>
      </blockquote>
    </article>
  );
}

/**
 * The portrait.
 *
 * The ring is on the frame rather than on the image, so the circle is the
 * frame's own and a replacement photograph cannot change its size.
 *
 * Both files are already square and framed to each other, so object-cover has
 * nothing to crop — it is here to keep a mis-sized replacement inside the
 * circle rather than to do the framing.
 */
function Portrait({ person }: { person: Leader }) {
  return (
    <div className="company-leaders__portrait">
      <Image
        src={person.portrait}
        alt={`${person.name}, ${person.role} at Sophic Automation.`}
        width={400}
        height={400}
        sizes="(min-width: 640px) 11rem, 9rem"
        className="h-full w-full rounded-full object-cover"
      />
    </div>
  );
}
