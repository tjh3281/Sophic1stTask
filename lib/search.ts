import type { Route } from "next";
import { SOLUTIONS } from "./solutions";

/**
 * Site search, over a flat index built from the solutions tree.
 *
 * Page-level on purpose: every route in the prototype is one screen of content,
 * so a result is always "the page you wanted" rather than a fragment of one.
 * The whole index is a dozen entries, so it is built once at module scope and
 * matched synchronously on every keystroke — no async, no network, no worker.
 *
 * Only real routes are indexed. The other header items (Company, Partners,
 * Careers, Community, Contact) are inert prototype buttons with nowhere to go,
 * and a result that lands on nothing is worse than no result at all.
 */

/** Lower-cased mirrors of the fields we match against, so a keystroke does not
 *  re-case the whole index. Never rendered — display uses the original text. */
type Haystack = {
  title: string;
  breadcrumb: string;
  summary: string;
  /** Everything else on the page worth finding by — benefit copy, function
   *  copy, spec-sheet labels, capability lists — flattened into one blob. */
  keywords: string;
};

/** Which level of the tree a result sits at. Picks the icon beside it. */
export type SearchEntryKind = "home" | "category" | "equipment";

export type SearchEntry = {
  id: string;
  kind: SearchEntryKind;
  title: string;
  href: Route;
  /** Where the page sits in the tree, shown under the title in results. */
  breadcrumb: string;
  /** One line of description, shown under the title. */
  summary: string;
  lower: Haystack;
};

function lower(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function buildIndex(): SearchEntry[] {
  const home: Route = "/";
  const entries: SearchEntry[] = [
    {
      id: "home",
      kind: "home",
      title: "Home",
      href: home,
      breadcrumb: "Sophic Automation",
      summary: "Four solution categories, one automation partner.",
      lower: {
        title: "home",
        breadcrumb: "sophic automation",
        summary: "four solution categories, one automation partner",
        keywords: "overview start landing index main page",
      },
    },
  ];

  for (const solution of SOLUTIONS) {
    entries.push({
      id: solution.slug,
      kind: "category",
      title: solution.title,
      href: solution.href,
      breadcrumb: "Solutions",
      summary: solution.oneLiner,
      lower: {
        title: solution.title.toLowerCase(),
        breadcrumb: "solutions",
        summary: solution.oneLiner.toLowerCase(),
        keywords: lower(
          solution.slug.replace(/-/g, " "),
          ...(solution.benefits ?? []).flatMap((b) => [b.title, b.description]),
          // The category page lists its machines, so searching for one should
          // surface the category too — just below the machine's own page.
          ...solution.subSolutions.map((sub) => sub.title),
        ),
      },
    });

    for (const sub of solution.subSolutions) {
      entries.push({
        id: `${solution.slug}/${sub.slug}`,
        kind: "equipment",
        title: sub.title,
        href: sub.href,
        breadcrumb: `Solutions · ${solution.title}`,
        summary: sub.summary,
        lower: {
          title: sub.title.toLowerCase(),
          breadcrumb: `solutions ${solution.title}`.toLowerCase(),
          summary: sub.summary.toLowerCase(),
          keywords: lower(
            sub.slug.replace(/-/g, " "),
            ...(sub.metrics ?? []).map((m) => m.label.replace(/\n/g, " ")),
            ...(sub.functions ?? []).flatMap((f) => [f.title, f.description]),
            ...(sub.benefits ?? []).flatMap((b) => [b.title, ...b.points]),
            ...(sub.capabilityGroups ?? []).flatMap((g) => [
              g.name,
              g.summary,
              g.itemsLabel,
              ...g.items,
            ]),
            ...(sub.heroSlides ?? []).map((slide) => slide.title),
          ),
        },
      });
    }
  }

  return entries;
}

export const SEARCH_INDEX = buildIndex();

/** Splits a query the way a reader means it: whitespace, no punctuation. */
export function tokenize(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * How much one field contributes for one token.
 *
 * A hit at the start of a word counts double a hit inside one, so "mark" ranks
 * Laser Marking above a page that only says "benchmark".
 */
function fieldScore(field: string, token: string, weight: number) {
  const index = field.indexOf(token);
  if (index === -1) return 0;
  const atWordStart = index === 0 || !/[a-z0-9]/.test(field[index - 1]);
  return atWordStart ? weight * 2 : weight;
}

/** A token scores on its best field, not the sum — a word repeated through one
 *  page's body copy should not outrank the page actually named after it. */
function tokenScore(entry: SearchEntry, token: string) {
  return Math.max(
    fieldScore(entry.lower.title, token, 10),
    fieldScore(entry.lower.summary, token, 5),
    fieldScore(entry.lower.breadcrumb, token, 4),
    fieldScore(entry.lower.keywords, token, 2),
  );
}

/**
 * Ranked matches for a query. Every token has to hit something, so adding a
 * word always narrows the list rather than widening it.
 *
 * Ties break on index order, which runs home → category → its machines. That
 * keeps the shallower page first when both match equally well.
 */
export function searchPages(query: string, limit = 8): SearchEntry[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const hits: Array<{ entry: SearchEntry; score: number; order: number }> = [];

  SEARCH_INDEX.forEach((entry, order) => {
    let total = 0;
    for (const token of tokens) {
      const score = tokenScore(entry, token);
      if (score === 0) return;
      total += score;
    }
    hits.push({ entry, score: total, order });
  });

  hits.sort((a, b) => b.score - a.score || a.order - b.order);
  return hits.slice(0, limit).map((hit) => hit.entry);
}
