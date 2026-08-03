import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "ict-fct",
  "automated-functional-test-equipment",
);

export default function Page() {
  return (
    <SubSolutionPage
      solutionSlug="ict-fct"
      subSlug="automated-functional-test-equipment"
    />
  );
}
