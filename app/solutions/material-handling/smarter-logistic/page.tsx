import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "material-handling",
  "smarter-logistic",
);

export default function Page() {
  return (
    <SubSolutionPage solutionSlug="material-handling" subSlug="smarter-logistic" />
  );
}
