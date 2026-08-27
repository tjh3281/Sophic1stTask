import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata("product-engineering", "new-product-introduction");

export default function Page() {
  return <SubSolutionPage solutionSlug="product-engineering" subSlug="new-product-introduction" />;
}
