import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "assembly-automation",
  "laser-marking-equipment",
);

export default function Page() {
  return (
    <SubSolutionPage
      solutionSlug="assembly-automation"
      subSlug="laser-marking-equipment"
    />
  );
}
