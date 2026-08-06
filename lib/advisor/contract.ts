import {
  CATEGORY_ENUMS,
  EQUIPMENT_ENUMS,
  getEquipment,
  type CategoryEnum,
  type EquipmentEnum,
} from "./categories";

/**
 * The classifier's wire format, and the only thing the UI is allowed to act on.
 *
 * The model is never trusted. Whatever comes back is parsed and narrowed here
 * before it reaches a component, so an unknown category, a missing field or a
 * page of apologetic prose all land in the same place as an unclassifiable
 * answer: the vague path, where the reader is asked again.
 */

export type ClassifierResult = {
  /** null when the input was too vague to place. */
  primary: CategoryEnum | null;
  secondary: CategoryEnum | null;
  /**
   * The specific machine, when the reader's words named one; null when they
   * only named the area. Always belongs to `primary` — see below.
   *
   * Null is a perfectly good answer here and costs the reader one extra tap.
   * A wrong one costs them a page about a machine they did not ask about, so
   * nothing downstream is allowed to fill this in by guessing.
   */
  equipment: EquipmentEnum | null;
  confidence: "high" | "low";
  /** A short quote of the reader's own words, for the reflect line. */
  user_words: string;
  /** Which path produced this. Not shown to the reader; used for logging and
   *  to tell a real classification from a fallback during development. */
  source: "model" | "heuristic";
};

/** What a request that could not be placed looks like. */
export function vagueResult(source: ClassifierResult["source"]): ClassifierResult {
  return {
    primary: null,
    secondary: null,
    equipment: null,
    confidence: "low",
    user_words: "",
    source,
  };
}

function asCategory(value: unknown): CategoryEnum | null {
  // Gemini's schema cannot express "either an enum or null", so the prompt
  // allows the string "null" as well. Both spellings mean the same thing.
  if (value === null || value === undefined || value === "null") return null;
  if (typeof value !== "string") return null;
  return (CATEGORY_ENUMS as readonly string[]).includes(value)
    ? (value as CategoryEnum)
    : null;
}

/**
 * Narrows anything at all into a ClassifierResult.
 *
 * Returns null only when the input is so far from the shape that treating it
 * as an answer would be a lie — the caller turns that into the vague path.
 */
export function parseClassifierResult(
  input: unknown,
  source: ClassifierResult["source"],
): ClassifierResult | null {
  if (typeof input !== "object" || input === null) return null;
  const raw = input as Record<string, unknown>;

  const primary = asCategory(raw.primary);
  let secondary = asCategory(raw.secondary);

  // A model that returns the same category twice has not found two candidates,
  // and letting it through would raise a splitter question with one answer.
  if (secondary === primary) secondary = null;
  // NONE is an outcome, not a runner-up. As a secondary it would offer the
  // reader "or maybe we don't sell anything for this", which is not a choice.
  if (secondary === "NONE") secondary = null;

  const userWords =
    typeof raw.user_words === "string" ? raw.user_words.trim().slice(0, 160) : "";

  return {
    primary,
    secondary,
    equipment: asEquipment(raw.equipment, primary),
    confidence: raw.confidence === "high" ? "high" : "low",
    user_words: userWords,
    source,
  };
}

/**
 * A machine is only kept if it sits inside the category it was returned with.
 *
 * The two answers are one judgement made twice, and a model that says
 * "assembly" and then names an AMR has contradicted itself. The category is
 * the safer half — it is the coarser call, and it is what the splitter and the
 * symptom buttons agree on — so the machine is the half that gets dropped.
 * Dropping it costs one question; trusting it costs a page about the wrong
 * machine.
 */
function asEquipment(
  value: unknown,
  primary: CategoryEnum | null,
): EquipmentEnum | null {
  if (value === null || value === undefined || value === "null") return null;
  if (typeof value !== "string") return null;
  if (!(EQUIPMENT_ENUMS as readonly string[]).includes(value)) return null;

  const equipment = value as EquipmentEnum;
  return getEquipment(equipment).category === primary ? equipment : null;
}

/**
 * Verbatim from the brief. Kept as one string with no interpolation — the
 * reader's text is sent as a separate user turn, so nothing they type can
 * reach the part of the prompt that sets the rules.
 */
export const CLASSIFIER_SYSTEM_PROMPT = `You classify a manufacturing user's problem into one of our fixed automation
categories. You may ONLY use these categories:

- ASSEMBLY: building, sorting, marking, or packing products by hand; slow or
  error-prone manual handling on the line.
- INSPECTION: visual defects escaping to customers; human inspectors miss
  defects or cannot keep up; quality-check bottleneck found by LOOKING at parts.
- MATERIAL_HANDLING: time wasted moving materials around the factory; lost or
  untracked stock/inventory on the floor; parts not arriving at stations.
- ICT_FCT: final electrical testing of finished boards is a bottleneck, or
  faulty boards ship out; problems found only when a board is POWERED ON.
- NONE: the problem is outside physical factory equipment (software, IT, HR,
  ERP, website, marketing, finance, etc.).

Rules:
- Return JSON ONLY. No prose, no markdown, no backticks.
- Never invent a category outside the list above.
- If the input is too vague to classify, set primary to null and confidence low.
- If two categories genuinely fit, put the stronger one in "primary" and the
  other in "secondary".
- NONE means the work belongs to another trade entirely: software, IT, ERP,
  websites, marketing, finance, or HR administration. A complaint about people
  is NOT NONE. If someone says their workers are slow, careless, inattentive or
  will not follow instructions, they are describing manual work that automation
  replaces. Classify the work those people do. If they name no process at all,
  it is too vague to place: set primary to null, not NONE.
- "user_words" must quote the user's own phrasing, never your paraphrase.

Then name the specific machine in "equipment", but ONLY if the user's own words
point at one. The machine MUST belong to the category you put in "primary":

- ASSEMBLY -> PACKING (transferring, sealing, cartoning or labelling finished
  goods), LASER_MARKING (serial numbers, barcodes or 2D codes onto parts),
  HANDLER (robotic pick-and-place, tray switching, sorting by grade)
- INSPECTION -> MACHINE_VISION
- MATERIAL_HANDLING -> MMS (storing, tracking and counting stock),
  AMR (self-driving robots carrying material between stations)
- ICT_FCT -> FCT

Set "equipment" to null whenever the user named only the area and not the job.
Null is a good answer: it costs the user one extra question. A wrong machine
sends them to the wrong page, so never guess to avoid a null.

Return exactly this shape:
{"primary": "ASSEMBLY|INSPECTION|MATERIAL_HANDLING|ICT_FCT|NONE|null",
 "secondary": "same set or null",
 "equipment": "PACKING|LASER_MARKING|HANDLER|MACHINE_VISION|MMS|AMR|FCT|null",
 "confidence": "high|low",
 "user_words": "<short phrase quoting the user's own pain, for the reflect step>"}`;

/** Longest input the classifier will look at. Past this a reader is pasting a
 *  document rather than describing a bottleneck, and every extra token is cost
 *  and prompt-injection surface for no better answer. */
export const MAX_INPUT_LENGTH = 500;
