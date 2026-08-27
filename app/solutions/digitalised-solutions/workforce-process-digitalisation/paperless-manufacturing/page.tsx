import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata("workforce-process-digitalisation", "paperless-manufacturing");

export default function Page() {
  return <SubSolutionPage solutionSlug="workforce-process-digitalisation" subSlug="paperless-manufacturing" />;
}
