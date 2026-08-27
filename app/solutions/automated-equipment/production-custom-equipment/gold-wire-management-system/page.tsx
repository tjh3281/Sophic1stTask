import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "production-custom-equipment",
  "gold-wire-management-system",
);

export default function Page() {
  return (
    <SubSolutionPage solutionSlug="production-custom-equipment" subSlug="gold-wire-management-system" />
  );
}
