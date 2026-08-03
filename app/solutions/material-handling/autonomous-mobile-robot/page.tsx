import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "material-handling",
  "autonomous-mobile-robot",
);

export default function Page() {
  return (
    <SubSolutionPage
      solutionSlug="material-handling"
      subSlug="autonomous-mobile-robot"
    />
  );
}
