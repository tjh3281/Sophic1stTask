import type { Route } from "next";
import { getSolution, getSubSolution } from "@/lib/solutions";

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

/* --- Equipment ------------------------------------------------------------
   One level below the category: the actual machine, and the page that
   describes it.

   A category is the right unit for a diagnosis and the wrong unit for an
   answer. "Assembly Automation" is true but it is not a recommendation —
   it covers three machines that solve three different problems, and a reader
   sent to the category page has to work out which of them they came for. The
   advisor already knows enough to say, so it says it.

   Two of the four categories hold a single machine, which means the specific
   answer costs nothing there: naming the category names the machine. Only
   assembly and material handling need the extra question below.
-------------------------------------------------------------------------- */

export const EQUIPMENT_ENUMS = [
  "PACKING",
  "LASER_MARKING",
  "HANDLER",
  "MACHINE_VISION",
  "MMS",
  "AMR",
  "FCT",
] as const;

export type EquipmentEnum = (typeof EQUIPMENT_ENUMS)[number];

type EquipmentCopy = {
  category: MatchedCategory;
  /** Sub-solution slug inside that category's solution. */
  slug: string;
  /** The job it takes over, in the buyer's words rather than the machine's
   *  own name. Doubles as the label on the refine buttons, where a reader is
   *  choosing between jobs they recognise, not products they don't. */
  job: string;
};

const EQUIPMENT_COPY: Record<EquipmentEnum, EquipmentCopy> = {
  PACKING: {
    category: "ASSEMBLY",
    slug: "automated-packing-equipment",
    job: "Packing, sealing and labelling finished goods",
  },
  LASER_MARKING: {
    category: "ASSEMBLY",
    slug: "laser-marking-equipment",
    job: "Marking serial numbers or codes onto parts",
  },
  HANDLER: {
    category: "ASSEMBLY",
    slug: "automated-handler-equipment",
    job: "Loading, sorting and moving parts between stations",
  },
  MACHINE_VISION: {
    category: "INSPECTION",
    slug: "machine-vision",
    job: "Checking parts for defects with cameras",
  },
  MMS: {
    category: "MATERIAL_HANDLING",
    slug: "material-management-system",
    job: "Knowing where stock is and what is left",
  },
  AMR: {
    category: "MATERIAL_HANDLING",
    slug: "autonomous-mobile-robot",
    job: "Carrying material across the floor",
  },
  FCT: {
    category: "ICT_FCT",
    slug: "automated-functional-test-equipment",
    job: "Testing finished boards before they ship",
  },
};

export type AdvisorEquipment = {
  id: EquipmentEnum;
  category: MatchedCategory;
  label: string;
  summary: string;
  href: Route;
  job: string;
};

function buildEquipment(id: EquipmentEnum): AdvisorEquipment {
  const copy = EQUIPMENT_COPY[id];
  const { subSolution } = getSubSolution(COPY[copy.category].slug, copy.slug);
  return {
    id,
    category: copy.category,
    label: subSolution.title,
    summary: subSolution.summary,
    href: subSolution.href,
    job: copy.job,
  };
}

/** Declaration order is category order, then the order the machines appear on
 *  their category page — so a reader who sees both lists sees the same
 *  sequence twice. */
export const ADVISOR_EQUIPMENT: AdvisorEquipment[] =
  EQUIPMENT_ENUMS.map(buildEquipment);

export function getEquipment(id: EquipmentEnum): AdvisorEquipment {
  const equipment = ADVISOR_EQUIPMENT.find((e) => e.id === id);
  if (!equipment) throw new Error(`Unknown advisor equipment: ${id}`);
  return equipment;
}

export function equipmentFor(category: MatchedCategory): AdvisorEquipment[] {
  return ADVISOR_EQUIPMENT.filter((e) => e.category === category);
}

export function isEquipment(value: unknown): value is EquipmentEnum {
  return (
    typeof value === "string" &&
    (EQUIPMENT_ENUMS as readonly string[]).includes(value)
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

/* --- Refine question ------------------------------------------------------
   Asked after the category is settled, only when that category holds more
   than one machine and nothing in the reader's words picked one.

   It is a different question from the splitter above. The splitter asks which
   problem the reader has; this asks which machine solves the one they have
   already named. So it is never a dead end: every option resolves, and the
   worst case is one more tap.
-------------------------------------------------------------------------- */

export type Refiner = {
  question: string;
  options: { label: string; resolvesTo: EquipmentEnum }[];
};

/** Written per category, because the useful question depends on what the
 *  machines actually differ by. Material handling splits cleanly in two —
 *  knowing where material is versus getting it there — the way inspection and
 *  test split on visible versus powered. Assembly has no such single axis, so
 *  it asks the reader to point at the job instead of pretending there is one. */
const REFINE_QUESTIONS: Partial<Record<MatchedCategory, string>> = {
  ASSEMBLY:
    "That covers a few machines. Which job would you hand over first?",
  MATERIAL_HANDLING:
    "Is the problem knowing where material is, or getting it where it's needed?",
};

/** Null when the category holds a single machine — there is nothing to ask. */
export function getRefiner(category: MatchedCategory): Refiner | null {
  const options = equipmentFor(category);
  if (options.length < 2) return null;

  return {
    question:
      REFINE_QUESTIONS[category] ?? "Which of these is closest to the job?",
    options: options.map((equipment) => ({
      label: equipment.job,
      resolvesTo: equipment.id,
    })),
  };
}
