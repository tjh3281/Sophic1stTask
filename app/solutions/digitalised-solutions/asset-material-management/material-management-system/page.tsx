import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata("asset-material-management", "material-management-system");

export default function Page() {
  return <SubSolutionPage solutionSlug="asset-material-management" subSlug="material-management-system" />;
}
