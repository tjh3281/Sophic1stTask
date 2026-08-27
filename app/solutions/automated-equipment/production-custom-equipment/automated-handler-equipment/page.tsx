import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "production-custom-equipment",
  "automated-handler-equipment",
);

export default function Page() {
  return (
    <SubSolutionPage
      solutionSlug="production-custom-equipment"
      subSlug="automated-handler-equipment"
    />
  );
}
