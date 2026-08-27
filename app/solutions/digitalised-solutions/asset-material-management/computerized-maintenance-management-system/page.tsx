import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata("asset-material-management", "computerized-maintenance-management-system");

export default function Page() {
  return <SubSolutionPage solutionSlug="asset-material-management" subSlug="computerized-maintenance-management-system" />;
}
