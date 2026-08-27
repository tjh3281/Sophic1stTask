import {
  SolutionOverviewPage,
  solutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = solutionMetadata("product-engineering");

export default function Page() {
  return <SolutionOverviewPage slug="product-engineering" />;
}
