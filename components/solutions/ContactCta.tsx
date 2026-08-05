import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SpecularButton } from "@/components/ui/SpecularButton";

/**
 * Closing call to action, at the foot of every sub-solution page.
 *
 * No onClick is passed. This is a Server Component, and a function cannot cross
 * into a Client Component from here — but it is also the behaviour we want: the
 * site has no contact route yet, and the header's Contact entry is an inert
 * button too. Wiring it up is one `href` once that page exists.
 */
export function ContactCta() {
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
          <SpecularButton
            size="lg"
            radius={18}
            tint="#ffffff"
            tintOpacity={0}
            blur={0}
            textColor="#0f172a"
            lineColor="#000000"
            baseColor="#000000"
            intensity={1}
            shineSize={10}
            shineFade={40}
            thickness={1}
            speed={0.35}
            followMouse
            proximity={250}
            autoAnimate={false}
          >
            Contact Us
          </SpecularButton>
        </Reveal>
      </section>
    </Container>
  );
}
