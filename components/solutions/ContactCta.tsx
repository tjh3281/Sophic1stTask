import { ContactCtaButton } from "@/components/contact/ContactCtaButton";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Closing call to action, at the foot of every sub-solution page.
 *
 * Opens the site's contact form with this page's machine already chosen. That
 * pre-selection is the whole difference between this button and the header's
 * Contact: somebody who has just read a page about the laser marker should not
 * have to tell us that is what they were reading.
 *
 * Still a Server Component. The click lives in ContactCtaButton, which is all
 * the "use client" boundary this needs — the slug crosses it as a string.
 */
export function ContactCta({ preset }: { preset: string }) {
  return (
    <Container>
      {/* Asymmetric: tight above so the button sits close under the rule, with
          the usual breathing room kept below it before the footer. */}
      <section className="border-t border-line pb-14 pt-8 text-center sm:pb-16 sm:pt-10">
        {/* Inverted for a light page: the sweep darkens the edge instead of
            lighting it.
            Both colours are black on purpose. The shader premultiplies —
            `col = baseColor * base + lineColor * hi` with alpha `base + hi` —
            so a black lineColor contributes no colour, only coverage, and the
            arc ends up whatever baseColor is. Black in both slots gives a grey
            hairline at rest (45% coverage) deepening to solid black under the
            sweep. */}
        <Reveal>
          <ContactCtaButton preset={preset}>Contact Us</ContactCtaButton>
        </Reveal>
      </section>
    </Container>
  );
}
