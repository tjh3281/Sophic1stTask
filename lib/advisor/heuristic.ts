import { equipmentFor, type EquipmentEnum, type MatchedCategory } from "./categories";
import { parseClassifierResult, vagueResult, type ClassifierResult } from "./contract";

/**
 * Keyword classifier, used when there is no model to call.
 *
 * It runs in two situations: no API key is configured, and the model call
 * failed or timed out. Both matter — an advisor that shows an error is worth
 * less than one that routes a little more bluntly, because the point of the
 * tool is to hand over a qualified lead, and a lead lost to a 500 is lost for
 * good.
 *
 * It is deliberately conservative. Scoring nothing means vague, which asks the
 * reader again, rather than guessing a category and sending them to a page
 * about the wrong machine.
 *
 * Terms match at word boundaries, never as bare substrings. The first version
 * used String.includes and it was badly wrong: "hr" matched inside "three",
 * "mes" inside "sometimes", "app" inside "happens", so any sentence containing
 * an ordinary word like those was ruled outside our scope and every reader got
 * the same "that's outside what our equipment covers" reply.
 *
 * A trailing "*" makes a term a stem, matching the start of a word only:
 * "assembl*" covers assembly and assembler, while plain "app" matches the word
 * app and not approach, apply or appear.
 */

type Term = { pattern: RegExp; weight: number };

function compile(terms: string[]): Term[] {
  return terms.map((raw) => {
    const isStem = raw.endsWith("*");
    const body = (isStem ? raw.slice(0, -1) : raw).replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
    return {
      // Always anchored at the start of a word. A stem leaves the end open;
      // anything else has to be the whole word.
      pattern: new RegExp(`\\b${body}${isStem ? "" : "\\b"}`),
      // Phrases count double. "final test" or "bed of nails" can only be about
      // one thing, where "test" or "board" could be about several.
      weight: raw.includes(" ") ? 2 : 1,
    };
  });
}

/** Puts the problem outside anything we make. Checked first: someone describing
 *  an ERP rollout may well say "inventory", and the fact that they said ERP
 *  matters more. */
const OFF_SCOPE = compile([
  "software", "app", "apps", "applicat*", "website", "web site", "erp", "mes",
  "crm", "sap", "hr", "human resource*", "payroll", "hiring", "recruit*",
  "marketing", "seo", "advertis*", "accounting", "finance", "invoice*",
  "billing", "tax", "email", "e-mail", "network*", "wifi", "server*",
  "database*", "cyber*", "it support", "helpdesk", "spreadsheet*", "excel",
  "training course*",
]);

const KEYWORDS: Record<MatchedCategory, Term[]> = {
  ASSEMBLY: compile([
    "assembl*", "build*", "pack*", "seal*", "carton*", "box", "boxes",
    "label*", "mark", "marking", "marked", "engrav*", "etch*", "serial*",
    "laser", "sort*",
    "by hand", "manual*", "handler*", "handling", "tray*", "pick and place",
    "screw*", "fasten*", "glue", "dispens*", "operator*",
  ]),
  INSPECTION: compile([
    "defect*", "visual*", "inspect*", "quality", "qc", "scratch*", "crack*",
    "chip*", "contamina*", "camera*", "vision", "aoi", "cosmetic*", "escap*",
    "reject*", "false call*", "misprint*", "solder bridge", "missing component*",
    "naked eye", "look at", "looking at",
  ]),
  MATERIAL_HANDLING: compile([
    "material*", "move", "moves", "moving", "transport*", "trolley*",
    "forklift*", "pallet*", "warehouse*", "storage", "stock", "stocks",
    "inventory", "wip", "logistic*", "amr", "agv", "racking", "kitting",
    "lost", "misplac*", "track*", "traceab*", "walk*", "fetch*", "shortage*",
    "stock take", "stocktake", "reel*",
  ]),
  ICT_FCT: compile([
    // "board" on its own is deliberate. It is the word both sides of the
    // classic overlap use — "bad boards ship out" and "defects on the board" —
    // so scoring it here puts inspection and test in a tie, which is what
    // raises the one question that actually separates them.
    "board*", "ict", "fct", "functional test*", "final test*", "board test*",
    "in-circuit", "powered", "power on", "power-on", "electrical", "voltage",
    "fixture*", "bed of nails", "pogo", "probe*", "firmware", "pcba",
    "pcb test*", "burn in", "burn-in", "dead board*", "no boot", "programming",
  ]),
};

/**
 * Machine-level terms, scored only inside the category that already won.
 *
 * Narrower than the category lists above and deliberately so: these are the
 * words that name one machine and no other. "pack" belongs to assembly as a
 * whole, but "carton" and "shrink wrap" belong to the packer specifically, so
 * only the second kind is listed here.
 *
 * The four single-machine categories are absent. Their machine is settled by
 * arithmetic — one candidate — long before any keyword is read.
 */
const EQUIPMENT_KEYWORDS: Partial<Record<EquipmentEnum, Term[]>> = {
  PACKING: compile([
    "pack*", "seal*", "carton*", "box", "boxes", "bag*", "shrink wrap",
    "wrapping", "case clos*", "palletis*", "palletiz*", "weigh*",
  ]),
  LASER_MARKING: compile([
    "laser", "mark", "marking", "marked", "engrav*", "etch*", "serial*",
    "barcode*", "data matrix", "2d code*", "traceability code*", "part number*",
  ]),
  HANDLER: compile([
    "handler*", "pick and place", "pick-and-place", "robot*", "arm", "arms",
    "tray*", "sort*", "bin*", "load*", "unload*", "infeed", "gantry",
  ]),
  MMS: compile([
    "stock", "stocks", "inventory", "warehouse*", "storage", "racking",
    "stock take", "stocktake", "count*", "kitting", "shortage*", "wip",
    "traceab*", "misplac*", "lost",
  ]),
  AMR: compile([
    "amr", "agv", "robot*", "trolley*", "forklift*", "cart*", "push*",
    "carry*", "walk*", "transport*", "deliver*", "fetch*", "between station*",
    "point to point", "navigat*",
  ]),
};

/**
 * Picks the machine inside a settled category, or nothing.
 *
 * Nothing is the common case and the safe one — it hands the reader the refine
 * question, which is one tap. A tie counts as nothing for the same reason: two
 * machines scoring equally is the classifier saying it cannot tell, and
 * breaking that tie by declaration order would dress a coin flip up as an
 * answer.
 */
function pickEquipment(text: string, category: MatchedCategory) {
  const candidates = equipmentFor(category);
  if (candidates.length === 1) return candidates[0].id;

  const ranked = candidates
    .map((item) => ({ id: item.id, points: score(text, EQUIPMENT_KEYWORDS[item.id] ?? []) }))
    .filter((entry) => entry.points > 0)
    .sort((a, b) => b.points - a.points);

  if (ranked.length === 0) return null;
  if (ranked[1] && ranked[1].points === ranked[0].points) return null;
  return ranked[0].id;
}

function score(text: string, terms: Term[]) {
  let total = 0;
  for (const term of terms) if (term.pattern.test(text)) total += term.weight;
  return total;
}

export function classifyByKeyword(input: string): ClassifierResult {
  const text = input.toLowerCase();

  // Too short to hold a problem. "help", "we have issues", "hi".
  if (text.trim().split(/\s+/).filter(Boolean).length < 3) {
    return vagueResult("heuristic");
  }

  if (score(text, OFF_SCOPE) > 0) {
    return (
      parseClassifierResult(
        {
          primary: "NONE",
          secondary: null,
          equipment: null,
          confidence: "high",
          user_words: quote(input),
        },
        "heuristic",
      ) ?? vagueResult("heuristic")
    );
  }

  const ranked = (Object.keys(KEYWORDS) as MatchedCategory[])
    .map((id) => ({ id, points: score(text, KEYWORDS[id]) }))
    .filter((entry) => entry.points > 0)
    .sort((a, b) => b.points - a.points);

  if (ranked.length === 0) return vagueResult("heuristic");

  const [best, runnerUp] = ranked;
  // A runner-up within one point of the leader is not a runner-up, it is a
  // tie — and a tie is exactly what the splitter question exists to break.
  const contested = runnerUp && best.points - runnerUp.points <= 1;

  return (
    parseClassifierResult(
      {
        primary: best.id,
        secondary: contested ? runnerUp.id : null,
        // Left null while two categories are still in play. The machine is
        // scored inside one category, so naming it before the splitter has
        // chosen which category that is would be answering the second question
        // before the first — and the validator would drop it anyway if the
        // reader then picked the other branch.
        equipment: contested ? null : pickEquipment(text, best.id),
        confidence: best.points >= 2 && !contested ? "high" : "low",
        user_words: quote(input),
      },
      "heuristic",
    ) ?? vagueResult("heuristic")
  );
}

/** The reflect line quotes the reader back to themselves, so this has to be
 *  their words. Without a model to summarise, the opening clause is the
 *  closest thing available. */
function quote(input: string) {
  const trimmed = input.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 80) return trimmed.replace(/[.!?]+$/, "");
  return `${trimmed.slice(0, 77).trimEnd()}…`;
}
