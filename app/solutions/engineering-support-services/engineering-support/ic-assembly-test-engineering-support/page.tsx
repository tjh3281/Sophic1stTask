import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata("engineering-support", "ic-assembly-test-engineering-support");

export default function Page() {
  return <SubSolutionPage solutionSlug="engineering-support" subSlug="ic-assembly-test-engineering-support" />;
}
