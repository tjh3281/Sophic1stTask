import type { ValueGlyphName } from "@/components/company/ValueGlyph";

/**
 * The company values, transcribed from Sophic's own values board.
 *
 * The statements are the company's wording and are not to be edited — not for
 * length, not for punctuation, not to make two of them balance. "Be remarkable,
 * Take ownership, Be uncomfortable; Execution matters." has three sentence-case
 * clauses and a semicolon in it because that is how Sophic writes it.
 */

export type CompanyValue = {
  slug: string;
  /** As printed on the board. */
  name: string;
  /**
   * The name cut down for the progress rail, where six full titles will not
   * fit on one line at any width worth designing for. Kept as its own field
   * rather than derived, because "QUALITY & EXCELLENCE" and "SOCIAL
   * RESPONSIBILITY" do not shorten by the same rule.
   */
  short: string;
  statement: string;
  icon: ValueGlyphName;
  /**
   * The scene behind this value on the runway, and behind nothing else.
   *
   * Required rather than optional, because the six are read as a sequence: one
   * value on a bare navy ground between five that carry a photograph does not
   * look like a value without a picture, it looks like a picture that failed to
   * load. Adding a seventh value means finding it a scene.
   *
   * They are backdrops and are treated as such — held well back behind a scrim
   * so the statement in front of them stays the thing being read. See
   * .company-values__scrim for what that costs and why it is that heavy.
   */
  background: string;
};

export const COMPANY_VALUES: CompanyValue[] = [
  {
    slug: "win-win-win",
    name: "Win Win Win",
    short: "Win",
    statement:
      "Creating solutions for the company to win, the customer to win, and the community to win.",
    icon: "win",
    background: "/images/value-bg-win-win-win.jpg",
  },
  {
    slug: "diversity",
    name: "Diversity",
    short: "Diversity",
    statement:
      "Be inclusive and collaborative so that individuals with diverse backgrounds and talents can contribute and thrive.",
    icon: "diversity",
    background: "/images/value-bg-diversity.jpg",
  },
  {
    slug: "innovation",
    name: "Innovation",
    short: "Innovation",
    statement:
      "Embrace new knowledge and new thought processes, and be fearless of failures.",
    icon: "innovation",
    background: "/images/value-bg-innovation.jpg",
  },
  {
    slug: "integrity",
    name: "Integrity",
    short: "Integrity",
    statement:
      "We believe in doing what's right, complying with regulations, and adhering to laws, customers, and cultures.",
    icon: "integrity",
    background: "/images/value-bg-integrity.jpg",
  },
  {
    slug: "quality-excellence",
    name: "Quality & Excellence",
    short: "Quality",
    statement:
      "Be remarkable, Take ownership, Be uncomfortable; Execution matters.",
    icon: "quality",
    background: "/images/value-bg-quality-excellence.jpg",
  },
  {
    slug: "social-responsibility",
    name: "Social Responsibility",
    short: "Social",
    statement: "We make a difference in the communities we serve.",
    icon: "social",
    background: "/images/value-bg-social-responsibility.jpg",
  },
];

/** The section's own copy, kept beside the values it introduces. */
export const VALUES_INTRO = {
  heading: "Our Values",
};

export type Leader = {
  name: string;
  role: string;
  quote: string;
  /**
   * Square, 400×400, and framed to match its pair — see the note on LEADERSHIP.
   * Required rather than optional: a founder without a face is a gap in the
   * page, and the type is the only thing that will say so before it ships.
   */
  portrait: string;
};

/**
 * The two founders, transcribed from the leadership board.
 *
 * The quotes are theirs and are set as written, "customers pain points" and
 * all. Correcting a man's own words on his own portrait is not a typo fix.
 *
 * The portraits are built from two supplied files that had nothing in common —
 * DK a 200×200 studio thumbnail, Lee Chee Hoo a 1414×2000 cut-out on
 * transparency. DK's backdrop samples as a flat #474245 at every point, so the
 * cut-out sits on that exact colour and the pair reads as one shoot. DK is
 * cropped in and Lee Chee Hoo scaled down until the two heads match; both end
 * square at 400×400. Replacing either means re-framing it against the other,
 * not just dropping a file in.
 */
export const LEADERSHIP = {
  heading: "Our Leadership",
  people: [
    {
      name: "Dim Kuan (DK)",
      role: "CEO / Co-founder",
      quote:
        "Great leaders are almost always great simplifiers, who can cut through arguments, debates, and doubt to offer a solution that everybody can understand.",
      portrait: "/images/leader-dim-kuan.webp",
    },
    {
      name: "Lee Chee Hoo",
      role: "CDO / Co-founder",
      quote:
        "Solving customers pain points one by one to make living a happier experience.",
      portrait: "/images/leader-lee-chee-hoo.webp",
    },
  ] satisfies Leader[],
};

/**
 * The vision and the mission, verbatim.
 *
 * Two statements under one heading, and they are held as two rather than as a
 * block of prose because that is what they are: one says where Sophic is going
 * and the other says how. Nothing is added to label them — each opens by naming
 * itself, "Sophic's vision is…" and "Our mission is…", so a heading over each
 * would be the same word twice in two type sizes.
 */
export const VISION_MISSION = {
  heading: "Our Vision & Mission",
  statements: [
    "Sophic's vision is to become a global specialist in enabling Smart Manufacturing implementations in factories worldwide through our integrated automation, and digitalization solutions, and engineering services.",
    "Our mission is to continuously optimize our customers' businesses through our world-class solutions, services, and products. We ensure the success of our company by constantly and consistently satisfying our customers, employees, partners, & suppliers.",
  ],
};
