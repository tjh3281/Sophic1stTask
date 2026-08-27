import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata("product-engineering", "software-engineering");

export default function Page() {
  return <SubSolutionPage solutionSlug="product-engineering" subSlug="software-engineering" />;
}
