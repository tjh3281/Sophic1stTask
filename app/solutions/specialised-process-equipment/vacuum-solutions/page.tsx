import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "specialised-process-equipment",
  "vacuum-solutions",
);

export default function Page() {
  return (
    <SubSolutionPage solutionSlug="specialised-process-equipment" subSlug="vacuum-solutions" />
  );
}
