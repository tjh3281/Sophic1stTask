import {
  SolutionOverviewPage,
  solutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = solutionMetadata("robotics");

export default function Page() {
  return <SolutionOverviewPage slug="robotics" />;
}
