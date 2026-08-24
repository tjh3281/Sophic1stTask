import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "vision-automation",
  "machine-vision",
);

export default function Page() {
  return (
    <SubSolutionPage solutionSlug="vision-automation" subSlug="machine-vision" />
  );
}
