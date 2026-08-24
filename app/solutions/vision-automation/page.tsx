import {
  SolutionOverviewPage,
  solutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = solutionMetadata("vision-automation");

export default function Page() {
  return <SolutionOverviewPage slug="vision-automation" />;
}
