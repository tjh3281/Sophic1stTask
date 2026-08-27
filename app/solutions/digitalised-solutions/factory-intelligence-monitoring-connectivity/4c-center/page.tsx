import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata("factory-intelligence-monitoring-connectivity", "4c-center");

export default function Page() {
  return <SubSolutionPage solutionSlug="factory-intelligence-monitoring-connectivity" subSlug="4c-center" />;
}
