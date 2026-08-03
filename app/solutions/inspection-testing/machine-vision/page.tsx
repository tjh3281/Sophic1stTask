import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "inspection-testing",
  "machine-vision",
);

export default function Page() {
  return (
    <SubSolutionPage solutionSlug="inspection-testing" subSlug="machine-vision" />
  );
}
