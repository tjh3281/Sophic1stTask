import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "robotics",
  "cobot",
);

export default function Page() {
  return (
    <SubSolutionPage solutionSlug="robotics" subSlug="cobot" />
  );
}
