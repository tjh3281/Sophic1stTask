import {
  SolutionOverviewPage,
  solutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = solutionMetadata("inspection-testing");

export default function Page() {
  return <SolutionOverviewPage slug="inspection-testing" />;
}
