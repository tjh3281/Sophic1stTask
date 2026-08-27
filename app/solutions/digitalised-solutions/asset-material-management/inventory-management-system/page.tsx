import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata("asset-material-management", "inventory-management-system");

export default function Page() {
  return <SubSolutionPage solutionSlug="asset-material-management" subSlug="inventory-management-system" />;
}
