import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { CapabilityGroup } from "@/lib/solutions";
import { CapabilityTabs } from "./CapabilityTabs";

/** Wrapper so the tabbed breakdown matches the other sections' framing. */
export function CapabilitySection({ groups }: { groups: CapabilityGroup[] }) {
  return (
    <Container>
      <section className="py-14 sm:py-16">
        <Reveal>
          <h2 className="text-2xl font-medium tracking-tight text-brand sm:text-3xl">
            Functions
          </h2>
        </Reveal>
        <Reveal delay={70}>
          <CapabilityTabs groups={groups} />
        </Reveal>
      </section>
    </Container>
  );
}
