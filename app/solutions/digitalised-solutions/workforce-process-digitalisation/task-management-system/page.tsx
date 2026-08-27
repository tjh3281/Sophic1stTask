import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata("workforce-process-digitalisation", "task-management-system");

export default function Page() {
  return <SubSolutionPage solutionSlug="workforce-process-digitalisation" subSlug="task-management-system" />;
}
