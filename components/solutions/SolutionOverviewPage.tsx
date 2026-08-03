import type { Metadata } from "next";
import { getSolution, getSubSolution } from "@/lib/solutions";
import { ContentPlaceholder } from "./ContentPlaceholder";
import { PageHeader } from "./PageHeader";
import { SolutionCover } from "./SolutionCover";
import { SubSolutionList } from "./SubSolutionList";

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
      <ContentPlaceholder
        note={
          hasCover
            ? "Each solution below still needs its own detail — what it is, its benefits and its functions."
            : undefined
        }
      />
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
      <ContentPlaceholder />
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
