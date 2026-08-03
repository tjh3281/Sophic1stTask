import {
  SolutionOverviewPage,
  solutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = solutionMetadata("material-handling");

export default function Page() {
  return <SolutionOverviewPage slug="material-handling" />;
}
