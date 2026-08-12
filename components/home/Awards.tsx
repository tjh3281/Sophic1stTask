import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { MedalDrop } from "./MedalDrop";
import "./Awards.css";

/**
 * What is stamped on the face of the medal, set again as text.
 *
 * The disc is 268px of artwork carrying four credentials in type a couple of
 * pixels tall. It is a picture of the awards, not a statement of them — so the
 * statement lives here, where it can be read, indexed, translated and heard.
 */
const CREDENTIALS = [
  {
    name: "ISO 9001:2015",
    detail: "Quality Management System — certified",
  },
  {
    name: "ISO/IEC 27001:2022",
    detail: "Information Security Management System",
  },
  {
    name: "Business Eminence Awards 2024",
    detail: "Dun & Bradstreet Malaysia",
  },
  {
    name: "Intel Partner",
    detail: "Gold tier",
  },
];

/**
 * The second screen of the home page: the awards, hanging.
 *
 * Dark, and the same dark the hero ends on, so the two read as one stage
 * rather than as a dark page followed by another one. That is not only mood —
 * the medal is lowered from above the section's top edge, and a seam there
 * would turn "arriving from off-screen" into "sliding out from behind a line".
 * It also gives the silver something to be silver against; on white the disc
 * and the ribbon's white stripe both wash out.
 *
 * The clip is load-bearing. `overflow-hidden` is what holds the rig off-screen
 * before it drops, and it is the only thing doing so — the rig's own box sits
 * at the top of this section with the pieces translated up out of it.
 */
export function Awards() {
  return (
    <section className="awards relative isolate overflow-hidden bg-[#04101c] pb-20 text-white sm:pb-28">
      <Container>
        {/* Two columns from lg, and the medal's column is deliberately the
            narrow one: it hangs from the top of the section, so it sets where
            the section starts rather than how wide it is. The copy is centred
            against it rather than pinned to the top, which keeps the whole
            composition inside one screen — stacked, the rig alone is most of a
            viewport tall and the heading ends up below the fold. */}
        <div className="grid items-start gap-x-14 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <div className="flex items-start justify-center lg:justify-start">
            <MedalDrop />
          </div>

          <Reveal className="lg:self-center">
            <div className="mx-auto mt-12 max-w-2xl text-center lg:mx-0 lg:mt-0 lg:text-left">
              <div className="flex items-center justify-center gap-3 lg:justify-start">
                <span
                  aria-hidden="true"
                  className="h-px w-9 shrink-0 bg-[#5ec8e0]"
                />
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[#5ec8e0]">
                  Recognition
                </p>
              </div>

              <h2 className="mt-4 text-[2rem] font-bold leading-[1.12] tracking-[-0.03em] sm:text-[2.75rem]">
                Awards &amp; Certifications
              </h2>

              <p className="mt-5 text-base leading-relaxed text-white/65 sm:text-lg">
                Quality and security you can check rather than take on trust.
                Every line below is an independent audit or a partner programme,
                each held current and re-examined on its own schedule.
              </p>

              <ul className="mt-8 grid gap-3 text-left sm:grid-cols-2">
                {CREDENTIALS.map((credential) => (
                  <li
                    key={credential.name}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3.5"
                  >
                    <p className="text-sm font-semibold tracking-tight">
                      {credential.name}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/55">
                      {credential.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
