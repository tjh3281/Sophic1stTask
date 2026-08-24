import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "production-custom-equipment",
  "laser-marking-equipment",
);

export default function Page() {
  return (
    <SubSolutionPage
      solutionSlug="production-custom-equipment"
      subSlug="laser-marking-equipment"
    />
  );
}
