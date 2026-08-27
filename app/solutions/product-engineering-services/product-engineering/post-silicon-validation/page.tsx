import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata("product-engineering", "post-silicon-validation");

export default function Page() {
  return <SubSolutionPage solutionSlug="product-engineering" subSlug="post-silicon-validation" />;
}
