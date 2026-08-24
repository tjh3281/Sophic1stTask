import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "inspection-testing",
  "inspection-testing-equipment",
);

export default function Page() {
  return (
    <SubSolutionPage solutionSlug="inspection-testing" subSlug="inspection-testing-equipment" />
  );
}
