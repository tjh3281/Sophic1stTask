import {
  SolutionOverviewPage,
  solutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = solutionMetadata("asset-material-management");

export default function Page() {
  return <SolutionOverviewPage slug="asset-material-management" />;
}
