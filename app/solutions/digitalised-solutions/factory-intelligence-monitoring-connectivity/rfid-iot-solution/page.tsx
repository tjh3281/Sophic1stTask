import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata("factory-intelligence-monitoring-connectivity", "rfid-iot-solution");

export default function Page() {
  return <SubSolutionPage solutionSlug="factory-intelligence-monitoring-connectivity" subSlug="rfid-iot-solution" />;
}
