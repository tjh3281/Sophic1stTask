import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "assembly-automation",
  "automated-packing-equipment",
);

export default function Page() {
  return (
    <SubSolutionPage
      solutionSlug="assembly-automation"
      subSlug="automated-packing-equipment"
    />
  );
}
