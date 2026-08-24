import {
  SolutionOverviewPage,
  solutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = solutionMetadata("automation-assembly");

export default function Page() {
  return <SolutionOverviewPage slug="automation-assembly" />;
}
