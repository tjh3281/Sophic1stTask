import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata("factory-intelligence-monitoring-connectivity", "wireless-energy-monitoring-system");

export default function Page() {
  return <SubSolutionPage solutionSlug="factory-intelligence-monitoring-connectivity" subSlug="wireless-energy-monitoring-system" />;
}
