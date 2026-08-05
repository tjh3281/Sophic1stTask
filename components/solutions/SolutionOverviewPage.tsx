import type { Metadata } from "next";
import { getSolution, getSubSolution } from "@/lib/solutions";
import { CapabilitySection } from "./CapabilitySection";
import { ContactCta } from "./ContactCta";
import { FunctionList } from "./FunctionList";
import { PageHeader } from "./PageHeader";
import { SolutionCover } from "./SolutionCover";
import { SubSolutionBenefits } from "./SubSolutionBenefits";
import { SubSolutionHero } from "./SubSolutionHero";
import { SubSolutionShowcaseHero } from "./SubSolutionShowcaseHero";
import { SubSolutionList } from "./SubSolutionList";
import { TechnicalMetrics } from "./TechnicalMetrics";

/**
 * Shared shell for the four category overview pages.
 *
 * A solution with a coverImage gets the full-bleed cover with its benefits;
 * the rest fall back to the plain header until their content is written. Each
 * route file stays a one-liner either way.
 */
export function SolutionOverviewPage({ slug }: { slug: string }) {
  const solution = getSolution(slug);
  const hasCover = Boolean(solution.coverImage);

  return (
    <>
      {hasCover ? (
        <SolutionCover solution={solution} />
      ) : (
        <PageHeader
          trail={[{ label: "Home", href: "/" }, { label: solution.title }]}
          eyebrow="Solution"
          title={solution.title}
          lead={solution.oneLiner}
        />
      )}
      <SubSolutionList items={solution.subSolutions} />
    </>
  );
}

/** Shared shell for the third-level sub-solution pages. */
export function SubSolutionPage({
  solutionSlug,
  subSlug,
}: {
  solutionSlug: string;
  subSlug: string;
}) {
  const { solution, subSolution } = getSubSolution(solutionSlug, subSlug);

  return (
    <>
      {subSolution.heroSlides && subSolution.heroSlides.length > 0 ? (
        <SubSolutionShowcaseHero
          solution={solution}
          subSolution={subSolution}
          slides={subSolution.heroSlides}
        />
      ) : subSolution.image ? (
        <SubSolutionHero solution={solution} subSolution={subSolution} />
      ) : (
        <PageHeader
          trail={[
            { label: "Home", href: "/" },
            { label: solution.title, href: solution.href },
            { label: subSolution.title },
          ]}
          eyebrow={solution.title}
          title={subSolution.title}
          lead={subSolution.summary}
        />
      )}
      {subSolution.metrics && subSolution.metrics.length > 0 && (
        <TechnicalMetrics metrics={subSolution.metrics} />
      )}
      {/* Functions before benefits, on every sub-solution: what the machine
          does has to be established before why it is worth having. */}
      {subSolution.functions && subSolution.functions.length > 0 && (
        <FunctionList items={subSolution.functions} />
      )}
      {/* The other form of the same section: cards where a machine does a few
          distinct things, tabs where it comes in variants with long, comparable
          lists. Sits in the same slot in the order. */}
      {subSolution.capabilityGroups &&
        subSolution.capabilityGroups.length > 0 && (
          <CapabilitySection groups={subSolution.capabilityGroups} />
        )}
      {subSolution.benefits && subSolution.benefits.length > 0 && (
        <SubSolutionBenefits items={subSolution.benefits} />
      )}
      {/* Unconditional: every sub-solution page ends on the same ask, whether
          or not its content has been written yet. */}
      <ContactCta />
    </>
  );
}

export function solutionMetadata(slug: string): Metadata {
  const solution = getSolution(slug);
  return { title: solution.title, description: solution.oneLiner };
}

export function subSolutionMetadata(
  solutionSlug: string,
  subSlug: string,
): Metadata {
  const { subSolution } = getSubSolution(solutionSlug, subSlug);
  return { title: subSolution.title, description: subSolution.summary };
}
