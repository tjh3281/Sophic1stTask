import { SOLUTIONS } from "@/lib/solutions";

/**
 * What the contact form offers, and where it would go.
 *
 * The solution list is derived from SOLUTIONS rather than restated, for the
 * same reason the advisor derives its own: a second copy of the catalogue goes
 * stale, and here it would go stale in the one place a reader is telling us
 * what they want. Rename a machine and this list renames with it.
 */

/** The single address in the brief. Sales and service are not split. */
export const ENQUIRY_EMAIL = "enquiry@sophicautomation.com";

/* --- The company ----------------------------------------------------------
   Kept here rather than inline in the footer, because the contact page wants
   some of the same facts and two copies of a phone number is one copy that
   goes out of date without anyone noticing.
-------------------------------------------------------------------------- */

export const COMPANY = {
  legalName: "SOPHIC AUTOMATION SDN BHD",
  /** Companies Commission number, as printed on the letterhead. */
  registration: "200701036965 (794994-D)",
  blurb:
    "A pure play technology company, we have delivered proven automation solutions and engineering services to more than 50 MNCs & SMEs in Southeast Asia.",
};

export type Office = {
  /** What it is — headquarters, or which branch. */
  name: string;
  /** The internal name for the building. Kept because Sophic's own material
   *  leads with it, and somebody who has been told to visit "Beta" needs to
   *  find Beta on the page. */
  alias: string;
  /** One line per line of the address, so the footer never has to guess where
   *  a break belongs. */
  lines: string[];
  phones?: string[];
  /**
   * What to type into Google Maps to land on this exact pin, where the printed
   * address does not find it on its own.
   *
   * Kept apart from `lines` rather than folded into it, because the two are
   * answering different questions. `lines` is what Sophic prints on its own
   * material and is the address as the company writes it; this is whatever
   * string Google happens to index the place under. They are allowed to differ
   * and here they do — see the headquarters below.
   */
  mapsQuery?: string;
  /**
   * A link to Google's own entry for this office, used verbatim.
   *
   * The last resort, below `mapsQuery`: a search string is still a description
   * of the place and re-resolves if Google re-indexes it, whereas this is an
   * identifier and lands on whatever Google has decided the place is. Set it
   * only where somebody has opened the link and seen the right pin, and record
   * in a comment what they saw — nothing in this file can check it.
   *
   * The `?cid=` form is the identifier out of a Maps URL and nothing else. The
   * links Google hands you carry the session that produced them as well, and
   * those parameters are noise that goes stale.
   */
  mapsUrl?: string;
};

export const OFFICES: Office[] = [
  {
    name: "Headquarter",
    alias: "Theta Office",
    lines: [
      "9, Jln Industri Tangkas 1, Taman Industri Tangkas,",
      "14000 Bukit Mertajam, Penang.",
    ],
    phones: ["(604) 202 3305", "(604) 508 9737"],
    // The printed address alone lands on the wrong place. The listing name and
    // the state are both taken verbatim from the Google entry — note "Pulau
    // Pinang" where the line above says "Penang", which is the same state in
    // the other language and is what Google indexes it under.
    mapsQuery:
      "Sophic Automation Sdn Bhd (Headquarter | BM -Tangkas), 9, Jln Industri" +
      " Tangkas 1, Taman Industri Tangkas, 14000 Bukit Mertajam, Pulau Pinang",
  },
  {
    name: "Penang Branch",
    alias: "Beta Office",
    lines: [
      "6 & 8, Lorong Perindustrian Bukit Minyak 1/1,",
      "Kawasan Perindustrian Bukit Minyak,",
      "14100 Simpang Ampat, Pulau Pinang.",
    ],
  },
  {
    name: "KL Branch",
    alias: "Sigma Office",
    lines: [
      "21-13A & 21-16, Stellar Suites, Jalan Puteri 4/7,",
      "Bandar Puteri, 47100 Puchong, Selangor.",
    ],
    phones: ["(603) 8604 7311"],
    // Supplied and opened: Google's entry for "SOPHIC MSC SDN BHD", which is
    // the company name this office is registered under rather than the one at
    // the top of this file — so the address alone is not what finds it.
    mapsUrl: "https://www.google.com/maps?cid=17218557954181652313",
  },
  {
    name: "Singapore Branch",
    alias: "Alpha Office",
    lines: ["28 Sin Ming Lane, #03-146,", "Midview City, Singapore 573972."],
    // Supplied and opened: "#06-131 Midview City, 28 Sin Ming Ln, Singapore
    // 573972". Google has no Sophic listing here, so this is the unit rather
    // than the company.
    //
    // Note the unit: the pin is #06-131 and the address printed above is
    // #03-146. Same building, different floor, and one of the two is out of
    // date — the link is the one that was supplied most recently, so it is
    // what is followed here, but the printed address is what the footer and
    // the contact page show and it has not been changed to match. Confirm
    // which is current and correct the other.
    mapsUrl: "https://www.google.com/maps?cid=12965869097820914399",
  },
];

/**
 * The Penang island site.
 *
 * Not in OFFICES, and deliberately: that list is the addresses Sophic
 * publishes — the footer prints every one of them on every page — and this
 * site's address is not among them. What exists for it is a Google entry and
 * nothing more, so a link is all this can be.
 *
 * lib/officeMap.ts counts it. Its Penang pin says three sites against the two
 * addresses in the list, with a note saying the third is this one.
 *
 * Supplied and opened: "Sophic Automation Sdn Bhd (Product Engineering
 * Services) @ SPICE". Give this site a published address and it becomes an
 * ordinary entry in OFFICES with a `mapsUrl`, and this constant goes away.
 */
export const PENANG_ISLAND_SITE = {
  name: "Png Island Branch",
  mapsUrl: "https://www.google.com/maps?cid=3296899467050832034",
};

/**
 * A Google Maps link for one office.
 *
 * Built from the office above rather than a pasted map URL, so an office that
 * moves takes its pin with it — a hard-coded place ID or a set of coordinates
 * is a second copy of the address that nothing on the page can keep honest.
 *
 * The default is the address alone, with the company name deliberately left
 * out: Google resolves a business name to its primary listing, so "Sophic
 * Automation" plus a branch address can land every pin on the headquarters,
 * which is exactly the distinction these links exist to make. A full street
 * address usually resolves to itself.
 *
 * Usually. The headquarters is the case where it does not, and `mapsQuery` is
 * the escape hatch for it — a verified string that finds the right place,
 * used verbatim. Anything set there should be read off Google's own entry
 * rather than composed here, because the whole reason it exists is that what
 * Google indexes and what the company prints are not the same words.
 *
 * Where even a verified string will not do it, `mapsUrl` names the place
 * outright and is taken as given. It wins because it is the only one of the
 * three that is not a guess about how Google reads an address, and an office
 * that has one has been looked at by somebody — see the field.
 *
 * Otherwise `search/?api=1` rather than a maps.google.com path: it is Google's
 * supported URL contract, and it opens the app rather than the website where
 * one is installed.
 */
export function officeMapsUrl(office: Office): string {
  if (office.mapsUrl) return office.mapsUrl;
  const query = office.mapsQuery ?? office.lines.join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** The office with this internal building name, or undefined. */
export function officeByAlias(alias: string): Office | undefined {
  return OFFICES.find((office) => office.alias === alias);
}

export type EnquiryOption = { value: string; label: string };
export type EnquiryGroup = { label: string; options: EnquiryOption[] };

/**
 * Enquiries that are not about one machine.
 *
 * Deliberately short. Every extra generic word here is a lead that arrives
 * saying less than "Machine Vision" would have, so the list stops at the three
 * that genuinely cannot be expressed as a solution.
 */
const OTHER_OPTIONS: EnquiryOption[] = [
  { value: "support", label: "Service & support" },
  { value: "partnership", label: "Partnership" },
  { value: "others", label: "Others" },
];

/**
 * One group per category, holding that category's machines.
 *
 * Grouped rather than flat because seven machine names in a row read as an
 * undifferentiated list — the category headings are what let someone find the
 * area they are in before reading the options under it.
 */
export const ENQUIRY_GROUPS: EnquiryGroup[] = [
  ...SOLUTIONS.map((solution) => ({
    label: solution.title,
    options: solution.subSolutions.map((sub) => ({
      // The sub-solution slug, which is unique across all four categories, so
      // a value identifies a machine without needing its parent alongside it.
      value: sub.slug,
      label: sub.title,
    })),
  })),
  { label: "Other", options: OTHER_OPTIONS },
];

const BY_VALUE = new Map(
  ENQUIRY_GROUPS.flatMap((group) =>
    group.options.map((option) => [option.value, option.label] as const),
  ),
);

/** The label for a value, or null if it names nothing we offer. Used to turn a
 *  sub-solution slug from a page into a pre-selected option, and to ignore one
 *  that no longer exists rather than pre-selecting a blank. */
export function enquiryLabel(value: string): string | null {
  return BY_VALUE.get(value) ?? null;
}

/* --- Supporting fields ----------------------------------------------------
   Both lists are prototype content, not Sophic's own. They are short on
   purpose: a country list of two hundred entries and an industry list of forty
   are what a real form needs and what a demo does not, and picking from a long
   list is the slowest part of filling one in.
-------------------------------------------------------------------------- */

/** Malaysia first — it is where Sophic is, so it is the most common answer
 *  rather than the alphabetical one. The rest follow the region outward. */
export const COUNTRIES = [
  "Malaysia",
  "Singapore",
  "Thailand",
  "Vietnam",
  "Indonesia",
  "Philippines",
  "China-Mainland",
  "Hong Kong",
  "Taiwan",
  "Japan",
  "South Korea",
  "India",
  "Australia",
  "United States",
  "Germany",
  "Other",
];

export const INDUSTRIES = [
  "Semiconductor",
  "Electronics / EMS",
  "Medical Devices",
  "Automotive",
  "Food & Beverage",
  "Pharmaceutical",
  "Rubber & Gloves",
  "Logistics & Warehousing",
  "Other",
];
