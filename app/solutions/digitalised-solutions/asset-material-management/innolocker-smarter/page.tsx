import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata("asset-material-management", "innolocker-smarter");

export default function Page() {
  return <SubSolutionPage solutionSlug="asset-material-management" subSlug="innolocker-smarter" />;
}
