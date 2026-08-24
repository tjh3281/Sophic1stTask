import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "automation-assembly",
  "printing-automation",
);

export default function Page() {
  return (
    <SubSolutionPage solutionSlug="automation-assembly" subSlug="printing-automation" />
  );
}
