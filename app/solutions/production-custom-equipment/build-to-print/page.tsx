import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "production-custom-equipment",
  "build-to-print",
);

export default function Page() {
  return (
    <SubSolutionPage solutionSlug="production-custom-equipment" subSlug="build-to-print" />
  );
}
