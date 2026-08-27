import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata("workforce-process-digitalisation", "remote-assistance");

export default function Page() {
  return <SubSolutionPage solutionSlug="workforce-process-digitalisation" subSlug="remote-assistance" />;
}
