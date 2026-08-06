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
  },
  {
    name: "Singapore Branch",
    alias: "Alpha Office",
    lines: ["28 Sin Ming Lane, #03-146,", "Midview City, Singapore 573972."],
  },
];

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
