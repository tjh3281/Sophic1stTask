import {
  SolutionOverviewPage,
  solutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = solutionMetadata("ict-fct");

export default function Page() {
  return <SolutionOverviewPage slug="ict-fct" />;
}
