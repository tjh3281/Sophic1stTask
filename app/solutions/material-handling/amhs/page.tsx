import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "material-handling",
  "amhs",
);

export default function Page() {
  return (
    <SubSolutionPage solutionSlug="material-handling" subSlug="amhs" />
  );
}
