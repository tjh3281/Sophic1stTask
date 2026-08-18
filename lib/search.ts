import type { Route } from "next";
import {
  CAREERS_HERO,
  JOB_OPENINGS,
  OPENINGS_HREF,
  PILLARS,
} from "./careers";
import { COMMUNITY_HERO, COMMUNITY_SCENES } from "./community";
import {
  PARTNER_NETWORK,
  PARTNER_WITH_SOPHIC,
  PARTNERS_HERO,
} from "./partners";
import { SOLUTIONS } from "./solutions";

/**
 * Site search, over a flat index built from the solutions tree.
 *
 * Page-level on purpose: every route in the prototype is one screen of content,
 * so a result is always "the page you wanted" rather than a fragment of one.
 * The whole index is a dozen entries, so it is built once at module scope and
 * matched synchronously on every keystroke — no async, no network, no worker.
 *
 * Only real routes are indexed — which, now that Community has a page, is every
 * item on the header bar.
 *
 * The individual vacancies under /careers/openings are deliberately left out,
 * real though they now are. Five of the nine carry the word "engineer" and
 * three are the same title with a different division in brackets — indexing
 * them would bury the equipment catalogue under near-duplicates on the query
 * most likely to be typed here. The openings page that lists them is indexed
 * instead, with their locations and hiring types as keywords, so "penang" or
 * "contract" still lands you on the list.
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

/** Which level of the tree a result sits at. Picks the icon beside it.
 *  "page" is for the routes that sit outside the tree entirely. */
export type SearchEntryKind = "home" | "category" | "equipment" | "page";

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
      summary: "Transforming your business.",
      lower: {
        title: "home",
        breadcrumb: "sophic automation",
        summary: "transforming your business",
        // The awards and the company statement both live on this page and
        // nowhere else, so what they say has to be findable from here or it is
        // not findable at all.
        keywords:
          "start landing index main page front sophic automation " +
          "awards certifications certified accreditation recognition " +
          "iso 9001 2015 quality management system " +
          "iso iec 27001 2022 information security management system " +
          "dun bradstreet business eminence awards 2024 malaysia " +
          "intel partner gold " +
          "why choose sophic single destination for success about us " +
          "founded 2007 mission industrial automation solutions " +
          "outsourcing mechanism develop supply manage customized " +
          "engineering services 20th anniversary ebook book " +
          "20 years one team one vision celebration milestone people " +
          "powered by its people honor our journey future of automation",
      },
    },
    {
      // Its own entry since the overview moved off the root. It keeps the
      // "four categories" line, which is what somebody typing "solutions" or
      // "overview" is actually looking for — and which used to be filed under
      // Home purely because that is where the page happened to live.
      id: "solutions",
      kind: "category",
      title: "Solutions",
      href: "/solutions",
      breadcrumb: "Sophic Automation",
      summary: "Four solution categories, one automation partner.",
      lower: {
        title: "solutions",
        breadcrumb: "sophic automation",
        summary: "four solution categories, one automation partner",
        keywords: lower(
          "overview all solutions capabilities what we do services catalogue",
          ...SOLUTIONS.map((solution) => solution.title),
        ),
      },
    },
    {
      id: "company",
      kind: "page",
      title: "Company",
      href: "/company",
      breadcrumb: "Sophic Automation",
      summary: "Founded in 2007, in Penang, Malaysia.",
      lower: {
        title: "company",
        breadcrumb: "sophic automation",
        summary: "founded in 2007 in penang malaysia",
        keywords:
          "about us who we are background history story profile " +
          "sophic automation sdn bhd founded 2007 mission innovative " +
          "effective industrial automation solutions cutting edge " +
          "technology technical competency growth business solutions " +
          "outsourcing mechanism develop supply manage customized " +
          "automation projects office offices building headquarters " +
          // The values board lives on this page and nowhere else, so what it
          // says has to be findable from here or it is not findable at all.
          "our leadership founders dim kuan dk ceo co-founder " +
          "lee chee hoo cdo management team who runs sophic " +
          "our vision and mission global specialist smart manufacturing " +
          "implementations factories worldwide integrated digitalization " +
          "world class solutions services products satisfying customers " +
          "employees partners suppliers " +
          "our values win win win diversity innovation integrity " +
          "quality excellence social responsibility inclusive collaborative " +
          "fearless of failures doing what is right take ownership " +
          "communities we serve",
      },
    },
    {
      id: "partners",
      kind: "page",
      title: "Partners",
      href: "/partners",
      breadcrumb: "Sophic Automation",
      summary: PARTNERS_HERO.headline,
      lower: {
        title: "partners",
        breadcrumb: "sophic automation",
        summary: PARTNERS_HERO.headline.toLowerCase(),
        // "Principals" earns its place in the hand-written list: it is the
        // word a supplier would search for and it appears nowhere else on the
        // site. The rest of the page's own copy is folded in after it, so the
        // five pillars are findable by name.
        keywords: lower(
          "partner partnership alliance ecosystem collaborate collaboration" +
            " principals suppliers distributors customers work with us" +
            " industry 4.0 i4.0 industrial revolution smart manufacturing" +
            " journey together digital transformation trusted",
          PARTNERS_HERO.lead,
          PARTNER_WITH_SOPHIC.heading,
          ...PARTNER_WITH_SOPHIC.paragraphs,
          ...PARTNER_WITH_SOPHIC.pillars.map((pillar) => pillar.name),
          // Every partner by name, and the group each sits in. Somebody
          // typing "Beckhoff" or "Keyence" is looking for this page and it is
          // the only place either word appears.
          ...PARTNER_NETWORK.groups.flatMap((group) => [
            group.label,
            ...group.rows.flat().map((partner) => partner.name),
          ]),
        ),
      },
    },
    {
      id: "community",
      kind: "page",
      title: "Community",
      href: "/community",
      breadcrumb: "Sophic Automation",
      summary: COMMUNITY_HERO.headline,
      lower: {
        title: "community",
        breadcrumb: "sophic automation",
        summary: COMMUNITY_HERO.headline.toLowerCase(),
        // The hand-written half is the vocabulary this page is filed under
        // everywhere else — "CSR", "sustainability", "giving back" — none of
        // which appears in its own copy, which is four captions long.
        keywords: lower(
          "community social responsibility csr giving back outreach" +
            " volunteering charity donation sustainability environment green" +
            " recycling elderly care welfare health safety first aid cpr" +
            " neighbours society people planet",
          COMMUNITY_HERO.description,
          ...COMMUNITY_SCENES.map((scene) => `${scene.name} ${scene.line}`),
        ),
      },
    },
    {
      id: "contact",
      kind: "page",
      title: "Contact Us",
      href: "/contact",
      breadcrumb: "Sophic Automation",
      summary: "Talk to an engineer about your line.",
      lower: {
        title: "contact us",
        breadcrumb: "sophic automation",
        summary: "talk to an engineer about your line",
        // The words somebody actually types when they are looking for this:
        // how to reach a company, not what the page is called.
        keywords:
          "contact enquiry inquiry email get in touch talk to sales support" +
          " quote quotation reach us message form enquiry@sophicautomation.com",
      },
    },
    {
      id: "careers",
      kind: "page",
      title: "Careers",
      href: "/careers",
      breadcrumb: "Sophic Automation",
      summary: CAREERS_HERO.title,
      lower: {
        title: "careers",
        breadcrumb: "sophic automation",
        summary: CAREERS_HERO.title.toLowerCase(),
        // The pillar names carry most of this: somebody searching "work life
        // balance" or "culture" is looking for exactly this page.
        keywords: lower(
          "career jobs join us hiring work with us people talent employee" +
            " life at sophic benefits perks",
          ...PILLARS.map((pillar) => pillar.name),
        ),
      },
    },
    {
      id: "careers-openings",
      kind: "page",
      title: "Job Openings",
      href: OPENINGS_HREF,
      breadcrumb: "Careers",
      summary: "Open roles across software, engineering, sales and finance.",
      lower: {
        title: "job openings",
        breadcrumb: "careers",
        summary: "open roles across software engineering sales and finance",
        keywords: lower(
          "vacancy vacancies position role apply application recruitment" +
            " hiring now",
          // Locations and hiring types, so "penang" or "contract" finds the
          // list. The role titles stay out — see the note at the top.
          ...JOB_OPENINGS.map((job) => `${job.location} ${job.hiringType}`),
        ),
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
