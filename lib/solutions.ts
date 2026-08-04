import type { Route } from "next";

/**
 * Single source of truth for the solutions tree.
 *
 * Drives the header mega menu, the home page cards, the breadcrumbs and the
 * page titles — so a new solution only ever needs editing here plus its route
 * folder under app/solutions/.
 */

/**
 * One headline figure from a machine's spec sheet.
 *
 * Kept as numbers rather than a pre-formatted string so the display can count
 * them up. Ranges are just two values with a separator between them.
 */
export type Metric = {
  /** A newline forces a line break, for labels too long to sit on one line. */
  label: string;
  /** Counted up from zero, in order. One value, or two for a range. */
  values: number[];
  /** Drawn between a pair of values. */
  separator?: string;
  /** Drawn before the first value, e.g. a tolerance sign. */
  prefix?: string;
  /** Unit, set small beside the figure. */
  suffix?: string;
  /** Decimal places to hold while counting, so the digits do not flicker. */
  decimals?: number;
};

/** Line-art marks drawn in Glyph. Named for what they depict, not what they
 *  are used for, since the same mark can suit several sections. */
export type GlyphName =
  | "package"
  | "barcode"
  | "tune"
  | "gauge"
  | "tag"
  | "cycle";

/** One thing the machine does, as listed under Function in the brief. */
export type SolutionFunction = {
  icon: GlyphName;
  title: string;
  description: string;
};

/**
 * A selling point for a single machine, as listed under Benefit in the brief.
 *
 * Richer than the category-level Benefit: it carries a photograph and breaks
 * into separate points, so it can fill a card on its own.
 */
export type SubBenefit = {
  icon: GlyphName;
  title: string;
  image: string;
  points: string[];
};

export type SubSolution = {
  slug: string;
  title: string;
  /** Short menu-level description. Full page content comes later. */
  summary: string;
  href: Route;
  /** Equipment shot for the category page's card. Without one the card falls
   *  back to a text-only tile, so categories can be filled in one at a time. */
  image?: string;
  /** Spec-sheet figures. Omit and the metrics band is left out entirely. */
  metrics?: Metric[];
  /** Why to buy it. Omit and the section is left out entirely. */
  benefits?: SubBenefit[];
  /** What the machine does. Omit and the section is left out entirely. */
  functions?: SolutionFunction[];
};

/** Named after the artwork, not a meaning — the same animated icons are reused
 *  across categories, so each solution picks whichever reads best.
 *  Names with no artwork yet are listed in PENDING_ICONS in BenefitIcon.tsx and
 *  render a placeholder until the source GIF arrives. */
export type BenefitIconName =
  | "rocket"
  | "verified"
  | "handshake"
  | "shield"
  | "target"
  | "connection"
  | "settings"
  | "customer"
  | "speed"
  | "protection"
  | "savings"
  | "document"
  | "user"
  | "money-bag";

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
        image: "/images/automated-packing-equipment.webp",
        metrics: [
          {
            label: "Speed",
            values: [50, 80],
            separator: "–",
            suffix: "bags/h",
          },
          {
            label: "Weighing",
            values: [100, 600],
            separator: "–",
            suffix: "kg",
          },
          {
            label: "Error",
            values: [2, 5],
            separator: "–",
            prefix: "±",
            suffix: "‰",
          },
          {
            label: "Air Supply Pressure",
            values: [0.5, 0.8],
            separator: "~",
            suffix: "MPa",
            decimals: 1,
          },
          { label: "Warranty", values: [1], suffix: "year" },
          {
            // The newline is honoured: a label this long would otherwise
            // stretch its slot in the marquee far wider than its figure.
            label: "Plug-and-Play\nDeployment",
            values: [3],
            suffix: "days",
          },
        ],
        // NOTE: the brief writes each benefit as one sentence. Split here at
        // its own comma so the card reads as a list like the reference design;
        // no claim has been added or changed.
        benefits: [
          {
            icon: "gauge",
            title: "Faster, Consistent Packing",
            image: "/images/packing-benefit-1.webp",
            points: [
              "Automated sealing and packaging handle every unit at line speed with the same precision.",
              "Keeps your output steady and throughput high.",
            ],
          },
          {
            icon: "tag",
            title: "Built-in Traceability",
            image: "/images/packing-benefit-2.webp",
            points: [
              "Barcode labelling is applied directly to each package.",
              "Every product can be tracked and identified from packing through to shipment.",
            ],
          },
          {
            icon: "cycle",
            title: "Reduced Manual Handling",
            image: "/images/packing-benefit-3.webp",
            points: [
              "Product transfer, case closing, and sealing are automated.",
              "Cuts labour effort and lowers the risk of packing errors or damage.",
            ],
          },
        ],
        functions: [
          {
            icon: "package",
            title: "Handling and Sealing",
            description:
              "Manages physical product transport, case closing, and package sealing.",
          },
          {
            icon: "barcode",
            title: "Barcode Labelling",
            description:
              "Applies tracking and identification codes directly to packaged goods.",
          },
          {
            icon: "tune",
            title: "Custom Integration",
            description:
              "Tailored through Sophic Automation to match specific factory floor requirements and line speeds.",
          },
        ],
      },
      {
        slug: "laser-marking-equipment",
        title: "Laser Marking Equipment",
        summary: "1D and 2D laser tracking codes on electronics.",
        href: "/solutions/assembly-automation/laser-marking-equipment",
        image: "/images/laser-marking-equipment.webp",
      },
      {
        slug: "automated-handler-equipment",
        title: "Automated Handler Equipment",
        summary: "Robotic assembly, tray switching, and quality sorting.",
        href: "/solutions/assembly-automation/automated-handler-equipment",
        image: "/images/automated-handler-equipment.webp",
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
    coverImage: "/images/material-handling-cover.webp",
    benefits: [
      {
        icon: "speed",
        title: "Higher Speed",
        description:
          "Systems process and move large volumes of inventory much faster than manual labour.",
      },
      {
        icon: "protection",
        title: "Less Damage",
        description:
          "Consistent machine handling protects fragile and sensitive products from drops or crashes.",
      },
      {
        icon: "savings",
        title: "Long-Term Saving",
        description:
          "Reduced waste, fewer errors and an optimised workflow save money over time.",
      },
    ],
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
    coverImage: "/images/ict-fct-cover.webp",
    benefits: [
      {
        icon: "document",
        title: "Higher Efficiency",
        description:
          "ICT removes the simple errors first, so FCT only tests the boards that are worth testing.",
      },
      {
        icon: "user",
        title: "Better Coverage",
        description:
          "Catches both physical build defects and functional or software defects.",
      },
      {
        icon: "money-bag",
        title: "Lower Total Costs",
        description:
          "Fewer boards reach expensive late-stage debugging.",
      },
    ],
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
