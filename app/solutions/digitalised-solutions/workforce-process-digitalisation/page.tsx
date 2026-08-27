import {
  SolutionOverviewPage,
  solutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = solutionMetadata("workforce-process-digitalisation");

export default function Page() {
  return <SolutionOverviewPage slug="workforce-process-digitalisation" />;
}
