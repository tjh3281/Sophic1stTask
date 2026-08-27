import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata("asset-material-management", "conditional-monitoring-system");

export default function Page() {
  return <SubSolutionPage solutionSlug="asset-material-management" subSlug="conditional-monitoring-system" />;
}
