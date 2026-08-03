import type { Route } from "next";

/**
 * Single source of truth for the solutions tree.
 *
 * Drives the header mega menu, the home page cards, the breadcrumbs and the
 * page titles — so a new solution only ever needs editing here plus its route
 * folder under app/solutions/.
 */

export type SubSolution = {
  slug: string;
  title: string;
  /** Short menu-level description. Full page content comes later. */
  summary: string;
  href: Route;
};

/** Named after the artwork, not a meaning — the same four animated icons are
 *  reused across categories, so each solution picks whichever reads best. */
export type BenefitIconName =
  | "rocket"
  | "verified"
  | "handshake"
  | "shield"
  | "target"
  | "connection"
  | "settings"
  | "customer";

export type Benefit = {
  icon: BenefitIconName;
  title: string;
  description: string;
};

export type Solution = {
  slug: string;
  title: string;
  oneLiner: string;
  href: Route;
  subSolutions: SubSolution[];
  /** Full-bleed background for the page cover. Falls back to the plain header. */
  coverImage?: string;
  /** Rendered as cards over the cover image. */
  benefits?: Benefit[];
};

export const SOLUTIONS: Solution[] = [
  {
    slug: "assembly-automation",
    title: "Assembly Automation",
    oneLiner:
      "Machines and robots that build, sort, mark, and pack products automatically — replacing slow, error-prone manual handling.",
    href: "/solutions/assembly-automation",
    coverImage: "/images/assembly-automation-3.avif",
    benefits: [
      {
        icon: "rocket",
        title: "Higher Productivity",
        description:
          "Systems operate around the clock, 24/7, without fatigue, drastically cutting cycle times and boosting output volumes.",
      },
      {
        icon: "verified",
        title: "Consistent Quality",
        description:
          "Precise, repeatable actions eliminate human error, ensuring every part matches exact specifications with fewer defects.",
      },
      {
        icon: "handshake",
        title: "Lower Labor Costs",
        description:
          "Routine work shifts to machines, reducing direct staffing needs and freeing workers for higher-value programming or oversight roles.",
      },
      {
        icon: "shield",
        title: "Improved Safety",
        description:
          "Moving hazardous or repetitive physical tasks away from human operators lowers workplace accidents.",
      },
    ],
    subSolutions: [
      {
        slug: "automated-packing-equipment",
        title: "Automated Packing Equipment",
        summary: "Product transferring, sealing, and barcode labelling.",
        href: "/solutions/assembly-automation/automated-packing-equipment",
      },
      {
        slug: "laser-marking-equipment",
        title: "Laser Marking Equipment",
        summary: "1D and 2D laser tracking codes on electronics.",
        href: "/solutions/assembly-automation/laser-marking-equipment",
      },
      {
        slug: "automated-handler-equipment",
        title: "Automated Handler Equipment",
        summary: "Robotic assembly, tray switching, and quality sorting.",
        href: "/solutions/assembly-automation/automated-handler-equipment",
      },
    ],
  },
  {
    slug: "inspection-testing",
    title: "Inspection & Testing",
    oneLiner:
      "Cameras and vision software that check every part for defects — faster and more consistent than the human eye.",
    href: "/solutions/inspection-testing",
    coverImage: "/images/inspection-testing-cover.webp",
    // NOTE: the README leaves this section's Benefits list blank. Drafted from
    // the Machine Vision "What is" and Functions text — replace with the real
    // marketing copy when it exists.
    benefits: [
      {
        icon: "target",
        title: "Faster Than Manual Checks",
        description:
          "High-speed vision software drives multi-camera systems in parallel, checking every part at line speed.",
      },
      {
        icon: "connection",
        title: "Consistent Every Time",
        description:
          "Automated inspection applies identical criteria to every unit, so results never drift with operator fatigue or judgement.",
      },
      {
        icon: "settings",
        title: "Defects Caught In-House",
        description:
          "Super high resolution imaging identifies chipping, cracks, contamination and misalignment before a unit moves on.",
      },
      {
        icon: "customer",
        title: "One Platform, Every Product",
        description:
          "IC, PCB, LED and wafer inspection run on the same vision system, from die presence and BGA to OCR and 3D lead measurement.",
      },
    ],
    subSolutions: [
      {
        slug: "machine-vision",
        title: "Machine Vision",
        summary: "Automated visual inspection and defect detection systems.",
        href: "/solutions/inspection-testing/machine-vision",
      },
    ],
  },
  {
    slug: "material-handling",
    title: "Automated Material Handling System",
    oneLiner:
      "Systems that store, track, and move materials around the factory — without workers carrying or pushing them.",
    href: "/solutions/material-handling",
    subSolutions: [
      {
        slug: "material-management-system",
        title: "Material Management System (MMS)",
        summary: "Storage and tracking of materials across the factory floor.",
        href: "/solutions/material-handling/material-management-system",
      },
      {
        slug: "autonomous-mobile-robot",
        title: "Autonomous Mobile Robot (AMR)",
        summary: "Self-navigating robots that move materials between stations.",
        href: "/solutions/material-handling/autonomous-mobile-robot",
      },
    ],
  },
  {
    slug: "ict-fct",
    title: "ICT & FCT",
    oneLiner:
      "Electrical tests that prove a finished board actually works — before it ever ships to the customer.",
    href: "/solutions/ict-fct",
    subSolutions: [
      {
        slug: "automated-functional-test-equipment",
        title: "Automated Functional Test Equipment",
        summary: "Verifies every finished unit against your exact specifications.",
        href: "/solutions/ict-fct/automated-functional-test-equipment",
      },
    ],
  },
];

export function getSolution(slug: string): Solution {
  const solution = SOLUTIONS.find((s) => s.slug === slug);
  if (!solution) throw new Error(`Unknown solution slug: ${slug}`);
  return solution;
}

export function getSubSolution(
  solutionSlug: string,
  subSlug: string,
): { solution: Solution; subSolution: SubSolution } {
  const solution = getSolution(solutionSlug);
  const subSolution = solution.subSolutions.find((s) => s.slug === subSlug);
  if (!subSolution) {
    throw new Error(`Unknown sub-solution slug: ${solutionSlug}/${subSlug}`);
  }
  return { solution, subSolution };
}
