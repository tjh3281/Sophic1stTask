import {
  SolutionOverviewPage,
  solutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = solutionMetadata("assembly-automation");

export default function Page() {
  return <SolutionOverviewPage slug="assembly-automation" />;
}
