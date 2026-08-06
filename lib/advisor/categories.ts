import type { Route } from "next";
import { getSolution } from "@/lib/solutions";

/**
 * The fixed set the advisor is allowed to return, and nothing else.
 *
 * Everything the result screen shows — the name, the one-line description, the
 * equipment, the link — is read from SOLUTIONS rather than restated here. The
 * spec listed all of it inline, but a second copy of the catalogue is a copy
 * that goes stale: rename a machine in SOLUTIONS and the advisor would go on
 * naming the old one, then link to a page that disagrees with it.
 *
 * What is declared here is only what the advisor adds: the symptom wording,
 * which is written from the buyer's side of the problem rather than ours.
 */

export const CATEGORY_ENUMS = [
  "ASSEMBLY",
  "INSPECTION",
  "MATERIAL_HANDLING",
  "ICT_FCT",
  "NONE",
] as const;

export type CategoryEnum = (typeof CATEGORY_ENUMS)[number];

/** Everything except NONE — the values that resolve to something we sell. */
export type MatchedCategory = Exclude<CategoryEnum, "NONE">;

type CategoryCopy = {
  /** Slug in SOLUTIONS. The link, name, blurb and equipment all come from it. */
  slug: string;
  /** Entry button: the pain in the buyer's words, not the product's name. */
  symptom: string;
  /** Two or three words, for the re-prompt buttons where space is tight. */
  shortLabel: string;
};

const COPY: Record<MatchedCategory, CategoryCopy> = {
  ASSEMBLY: {
    slug: "assembly-automation",
    symptom:
      "We still build, mark, or pack by hand — it's slow and errors slip through.",
    shortLabel: "Building it",
  },
  INSPECTION: {
    slug: "inspection-testing",
    symptom: "Defects reach our customers, or inspectors can't keep up.",
    shortLabel: "Checking it",
  },
  MATERIAL_HANDLING: {
    slug: "material-handling",
    symptom: "Workers waste time moving materials, or we lose track of stock.",
    shortLabel: "Moving materials",
  },
  ICT_FCT: {
    slug: "ict-fct",
    symptom: "Board testing is a bottleneck, or bad boards ship out.",
    shortLabel: "Final testing",
  },
};

export type AdvisorCategory = {
  id: MatchedCategory;
  label: string;
  oneLine: string;
  equipment: string[];
  href: Route;
  symptom: string;
  shortLabel: string;
};

function build(id: MatchedCategory): AdvisorCategory {
  const solution = getSolution(COPY[id].slug);
  return {
    id,
    label: solution.title,
    oneLine: solution.oneLiner,
    equipment: solution.subSolutions.map((sub) => sub.title),
    href: solution.href,
    symptom: COPY[id].symptom,
    shortLabel: COPY[id].shortLabel,
  };
}

/** Order is the order the entry buttons are shown in: the sequence a part
 *  actually travels through a line, which is how a production manager thinks
 *  about where their bottleneck sits. */
export const ADVISOR_CATEGORIES: AdvisorCategory[] = [
  build("ASSEMBLY"),
  build("INSPECTION"),
  build("MATERIAL_HANDLING"),
  build("ICT_FCT"),
];

export function getCategory(id: MatchedCategory): AdvisorCategory {
  const category = ADVISOR_CATEGORIES.find((c) => c.id === id);
  if (!category) throw new Error(`Unknown advisor category: ${id}`);
  return category;
}

export function isMatchedCategory(value: unknown): value is MatchedCategory {
  return (
    typeof value === "string" &&
    value !== "NONE" &&
    (CATEGORY_ENUMS as readonly string[]).includes(value)
  );
}

/* --- Splitter questions ---------------------------------------------------
   Asked once, when two categories both fit or the classifier is unsure.

   The brief supplies the inspection/test pair, which is the overlap that
   actually comes up: both are "we find bad boards", and the thing that tells
   them apart is whether the fault is visible or only shows up under power.
   The other pairs are generated, because there is no equivalent single
   question that separates, say, packing from stock control — naming the two
   and letting the reader choose is more honest than inventing a test.
-------------------------------------------------------------------------- */

export type SplitterOption = {
  label: string;
  /** null sends the reader back to the four buttons instead of a category. */
  resolvesTo: MatchedCategory | null;
};

export type Splitter = {
  question: string;
  options: SplitterOption[];
};

export function getSplitter(
  primary: MatchedCategory,
  secondary: MatchedCategory | null,
): Splitter {
  // No competing category, just an unsure classifier: confirm rather than
  // guess, and leave a door back to the full list.
  if (!secondary || secondary === primary) {
    return {
      // Labels are never lower-cased anywhere in the advisor: two of the four
      // are acronyms, and "ict & fct" reads as a typo.
      question: `Just to be sure — is ${getCategory(primary).label} where the problem sits?`,
      options: [
        { label: "Yes, that's it", resolvesTo: primary },
        { label: "Not quite", resolvesTo: null },
      ],
    };
  }

  const pair = [primary, secondary];
  if (pair.includes("INSPECTION") && pair.includes("ICT_FCT")) {
    return {
      question:
        "Are the defects found by looking at the board, or only when it's powered on and tested?",
      options: [
        { label: "By looking", resolvesTo: "INSPECTION" },
        { label: "When powered on", resolvesTo: "ICT_FCT" },
      ],
    };
  }

  return {
    question: "Both could fit. Which is closer to the real bottleneck?",
    options: [
      { label: getCategory(primary).label, resolvesTo: primary },
      { label: getCategory(secondary).label, resolvesTo: secondary },
    ],
  };
}
