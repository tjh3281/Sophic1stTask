import {
  SolutionOverviewPage,
  solutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = solutionMetadata("specialised-process-equipment");

export default function Page() {
  return <SolutionOverviewPage slug="specialised-process-equipment" />;
}
