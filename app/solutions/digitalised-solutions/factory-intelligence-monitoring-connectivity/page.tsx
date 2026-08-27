import {
  SolutionOverviewPage,
  solutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = solutionMetadata("factory-intelligence-monitoring-connectivity");

export default function Page() {
  return <SolutionOverviewPage slug="factory-intelligence-monitoring-connectivity" />;
}
