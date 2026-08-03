import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "material-handling",
  "material-management-system",
);

export default function Page() {
  return (
    <SubSolutionPage
      solutionSlug="material-handling"
      subSlug="material-management-system"
    />
  );
}
