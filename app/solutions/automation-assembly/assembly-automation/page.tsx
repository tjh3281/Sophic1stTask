import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "automation-assembly",
  "assembly-automation",
);

export default function Page() {
  return (
    <SubSolutionPage solutionSlug="automation-assembly" subSlug="assembly-automation" />
  );
}
