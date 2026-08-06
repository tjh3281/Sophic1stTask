import { MAX_INPUT_LENGTH, vagueResult } from "@/lib/advisor/contract";
import { classifyByKeyword } from "@/lib/advisor/heuristic";
import { classifyWithModel } from "@/lib/advisor/model";

/**
 * Classifies one description of a manufacturing problem.
 *
 * Always answers 200 with a valid ClassifierResult, including when the input is
 * junk — "could not place this" is a real outcome of the flow, not an error,
 * and the UI has a screen for it. The only non-200 is the rate limit.
 */

/** Requests allowed per IP per window. The endpoint spends money on someone
 *  else's API, so it cannot be left open; a real deployment behind more than
 *  one instance wants this in Redis, since this Map is per-process. */
const RATE_LIMIT = 20;
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function overRateLimit(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Keep the map from growing without bound on a long-lived process.
  if (hits.size > 5_000) {
    for (const [key, times] of hits) {
      if (times.every((at) => now - at >= WINDOW_MS)) hits.delete(key);
    }
  }

  return recent.length > RATE_LIMIT;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (overRateLimit(ip)) {
    return Response.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as { text?: unknown } | null;
  const text =
    typeof body?.text === "string" ? body.text.trim().slice(0, MAX_INPUT_LENGTH) : "";

  if (!text) return Response.json(vagueResult("heuristic"));

  // The model first, keywords when it is unavailable or unwell. Both come back
  // through the same validator, so the route cannot emit a category the UI has
  // never heard of whichever one answered.
  const result = (await classifyWithModel(text)) ?? classifyByKeyword(text);

  return Response.json(result);
}
