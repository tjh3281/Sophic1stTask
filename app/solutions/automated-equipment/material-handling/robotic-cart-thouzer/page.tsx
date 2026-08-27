import {
  SubSolutionPage,
  subSolutionMetadata,
} from "@/components/solutions/SolutionOverviewPage";

export const metadata = subSolutionMetadata(
  "material-handling",
  "robotic-cart-thouzer",
);

export default function Page() {
  return (
    <SubSolutionPage solutionSlug="material-handling" subSlug="robotic-cart-thouzer" />
  );
}
