import {
  SolutionOverviewPage,
  solutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = solutionMetadata("engineering-support");

export default function Page() {
  return <SolutionOverviewPage slug="engineering-support" />;
}
