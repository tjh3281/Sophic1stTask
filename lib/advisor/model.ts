import { CATEGORY_ENUMS, EQUIPMENT_ENUMS } from "./categories";
import {
  CLASSIFIER_SYSTEM_PROMPT,
  parseClassifierResult,
  type ClassifierResult,
} from "./contract";

/**
 * The model half of the classifier: Gemini, across however many keys are
 * configured.
 *
 * Swapping provider means rewriting this file and nothing else — the route, the
 * contract and the UI all deal in ClassifierResult and never see a vendor's
 * shape. This is the second such swap; the OpenRouter version lived here
 * briefly and was measured at 5–12s per call with roughly two requests in three
 * either timing out or rate-limited, against ~640ms here.
 *
 * Returns null on every failure — no key, a timeout, an HTTP error, unparseable
 * output — and the caller falls back to the keyword classifier. The reader
 * should never learn that a model was involved, least of all by seeing it break.
 *
 * Imported only from the route handler, so keys never reach the browser. There
 * is no "server-only" guard on it because the package is not installed and this
 * is not worth a dependency — but do not import this from a component.
 */

/**
 * Fastest of the models this project's keys can actually call: ~640ms, and it
 * absorbed 14 requests in 9 seconds without a rate limit where gemini-2.5-flash
 * stopped dead at 10. gemini-2.0-flash and -flash-lite both answer 429 to these
 * keys on every request, whatever the docs say about them being available.
 */
const DEFAULT_MODEL = "gemini-flash-lite-latest";

/**
 * Sized against the host, not the model.
 *
 * Netlify's free plan kills a synchronous function at 10 seconds. The model
 * answers in under a second when it is well, so the only thing a longer wait
 * buys is the chance of being killed mid-wait — and being killed takes the
 * keyword fallback with it, turning a slightly blunter answer into an error
 * page. Five seconds leaves room for a cold start ahead of it and the fallback
 * behind it.
 */
const TIMEOUT_MS = 5_000;

/** Structured output. The enum is the same list the validator enforces, so the
 *  model is constrained twice: once here, and once again on the way out — the
 *  schema is the provider's promise, and the validator is ours. */
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    primary: { type: "STRING", enum: [...CATEGORY_ENUMS, "null"] },
    secondary: { type: "STRING", enum: [...CATEGORY_ENUMS, "null"] },
    // The schema can hold the machine to the seven that exist, but not to the
    // ones that belong to `primary` — that pairing is checked in the validator.
    equipment: { type: "STRING", enum: [...EQUIPMENT_ENUMS, "null"] },
    confidence: { type: "STRING", enum: ["high", "low"] },
    user_words: { type: "STRING" },
  },
  required: ["primary", "secondary", "equipment", "confidence", "user_words"],
} as const;

/**
 * Every key available, in order.
 *
 * GEMINI_API_KEYS takes a comma-separated list; GEMINI_API_KEY is the
 * single-key spelling and is read as a fallback so one key still works with no
 * extra configuration.
 */
function apiKeys(): string[] {
  const raw = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
  return raw
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

/**
 * Where the next request starts in the key list.
 *
 * Round-robin rather than always-first: the free tier limits requests per
 * minute per key, so spreading calls across the keys adds their allowances
 * together, where draining key one until it complains would leave the rest idle
 * and still stall every time the first hits its ceiling.
 *
 * Per-process, so several server instances each keep their own cursor. That
 * costs nothing here — the goal is to spread load, not to account for it.
 */
let cursor = 0;

type Attempt =
  | { result: ClassifierResult }
  /** Whether a different key stands a chance. A 429 is that key's own ceiling;
   *  a timeout or a malformed request is not, and retrying only doubles the
   *  wait before the fallback that was always going to answer. */
  | { result: null; tryNextKey: boolean };

async function attempt(key: string, model: string, input: string): Promise<Attempt> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        // ASCII only, and no decorative headers. A header value is a ByteString:
        // one em dash in here throws before the request leaves the process, and
        // since every failure falls back to keywords, that silently disabled the
        // model on every call while looking perfectly configured.
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: CLASSIFIER_SYSTEM_PROMPT }] },
          // The reader's text is its own turn. Nothing they write is ever
          // concatenated into the instructions above it.
          contents: [{ role: "user", parts: [{ text: input }] }],
          generationConfig: {
            // Classification, not writing. The same sentence should reach the
            // same category every time it is asked.
            temperature: 0,
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
          // No thinkingConfig. The default model rejects it outright with a 400,
          // and it does not think unless asked. Point ADVISOR_MODEL at a 2.5
          // model and calls get slower rather than failing — the better of the
          // two ways to be wrong.
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );

    if (!response.ok) {
      return { result: null, tryNextKey: response.status === 429 };
    }

    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { result: null, tryNextKey: false };

    const parsed = parseClassifierResult(JSON.parse(text), "model");
    return parsed ? { result: parsed } : { result: null, tryNextKey: false };
  } catch (error) {
    console.error("[advisor] classifier call failed:", error);
    return { result: null, tryNextKey: false };
  }
}

export async function classifyWithModel(
  input: string,
): Promise<ClassifierResult | null> {
  const keys = apiKeys();
  if (keys.length === 0) return null;

  const model = process.env.ADVISOR_MODEL || DEFAULT_MODEL;
  const start = cursor++ % keys.length;

  for (let step = 0; step < keys.length; step++) {
    const index = (start + step) % keys.length;
    const outcome = await attempt(keys[index], model, input);

    if (outcome.result) return outcome.result;
    if (!outcome.tryNextKey) return null;

    console.error(
      `[advisor] key ${index + 1}/${keys.length} rate-limited (429)` +
        (step + 1 < keys.length ? "; trying the next one" : "; no keys left, serving keyword results"),
    );
  }

  return null;
}
