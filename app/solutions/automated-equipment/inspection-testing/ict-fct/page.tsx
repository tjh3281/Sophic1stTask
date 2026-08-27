import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "inspection-testing",
  "ict-fct",
);

export default function Page() {
  return (
    <SubSolutionPage solutionSlug="inspection-testing" subSlug="ict-fct" />
  );
}
