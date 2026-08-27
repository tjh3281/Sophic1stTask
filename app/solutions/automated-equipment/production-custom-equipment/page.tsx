import {
  SolutionOverviewPage,
  solutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = solutionMetadata("production-custom-equipment");

export default function Page() {
  return <SolutionOverviewPage slug="production-custom-equipment" />;
}
