import type { Route } from "next";

/**
 * Single source of truth for the solutions tree.
 *
 * Drives the header mega menu, the home page cards, the breadcrumbs and the
 * page titles — so a new solution only ever needs editing here plus its route
 * folder under app/solutions/.
 */

/**
 * One headline figure from a machine's spec sheet.
 *
 * Kept as numbers rather than a pre-formatted string so the display can count
 * them up. Ranges are just two values with a separator between them.
 */
export type Metric = {
  /** A newline forces a line break, for labels too long to sit on one line. */
  label: string;
  /** Counted up from zero, in order. One value, or two for a range. */
  values: number[];
  /** Drawn between a pair of values. */
  separator?: string;
  /** Drawn before the first value, e.g. a tolerance sign. */
  prefix?: string;
  /** Unit, set small beside the figure. */
  suffix?: string;
  /** Decimal places to hold while counting, so the digits do not flicker. */
  decimals?: number;
};

/** Line-art marks drawn in Glyph. Named for what they depict, not what they
 *  are used for, since the same mark can suit several sections. */
export type GlyphName =
  | "package"
  | "barcode"
  | "tune"
  | "gauge"
  | "tag"
  | "cycle"
  | "laser"
  | "durable"
  | "arm"
  | "trays"
  | "sort"
  | "lens"
  | "chart"
  // The three added for the Solution menu, where each line needs a mark. Named
  // for what they depict like the rest, so nothing stops a machine using one.
  | "screen"
  | "compass"
  | "wrench";

/** One thing the machine does, as listed under Function in the brief. */
export type SolutionFunction = {
  icon: GlyphName;
  title: string;
  description: string;
};

/**
 * A selling point for a single machine, as listed under Benefit in the brief.
 *
 * Richer than the category-level Benefit: it carries a photograph and breaks
 * into separate points, so it can fill a card on its own.
 */
export type SubBenefit = {
  icon: GlyphName;
  title: string;
  image: string;
  points: string[];
};

/**
 * One variant of a machine, for the tabbed capability breakdown.
 *
 * Built for lists that are long and comparable — the point of the tabs is that
 * you can flick between variants and see what each one adds.
 */
export type CapabilityGroup = {
  name: string;
  /** Prose, where the brief provides any. Most groups are just their list. */
  summary?: string;
  /** Heading above the list. */
  itemsLabel: string;
  items: string[];
};

/** One frame of a sub-solution's rotating hero. */
export type HeroSlide = {
  /** Named on screen, so the reader knows which machine they are looking at. */
  title: string;
  image: string;
};

export type SubSolution = {
  slug: string;
  title: string;
  /** Short menu-level description. Full page content comes later. */
  summary: string;
  href: Route;
  /** Equipment shot for the category page's card. Without one the card falls
   *  back to a text-only tile, so categories can be filled in one at a time. */
  image?: string;
  /** What kind of picture `image` is, which decides how the hero presents it.
   *  A machine cut out on white is floated whole on the wash. A "photo" is a
   *  full-frame scene with edges of its own, so it is cropped to fill and given
   *  a frame — floated, it letterboxes inside the hero and a drop shadow on its
   *  hard rectangle reads as an unstyled screenshot. Defaults to "cutout".
   *  The category card ignores this and fills its panel from every source. */
  imageFraming?: "cutout" | "photo";
  /** Turns the hero into a full-bleed rotating stage instead of a product
   *  shot. Takes precedence over `image`, which stays the card photo. */
  heroSlides?: HeroSlide[];
  /** Spec-sheet figures. Omit and the metrics band is left out entirely. */
  metrics?: Metric[];
  /** Why to buy it. Omit and the section is left out entirely. */
  benefits?: SubBenefit[];
  /** What the machine does. Omit and the section is left out entirely. */
  functions?: SolutionFunction[];
  /** Tabbed breakdown, for a machine that comes in several variants. */
  capabilityGroups?: CapabilityGroup[];
};

/** Named after the artwork, not a meaning — the same animated icons are reused
 *  across categories, so each solution picks whichever reads best.
 *  Names with no artwork yet are listed in PENDING_ICONS in BenefitIcon.tsx and
 *  render a placeholder until the source GIF arrives. */
export type BenefitIconName =
  | "rocket"
  | "verified"
  | "handshake"
  | "shield"
  | "target"
  | "connection"
  | "settings"
  | "customer"
  | "speed"
  | "protection"
  | "savings"
  | "document"
  | "user"
  | "money-bag";

export type Benefit = {
  icon: BenefitIconName;
  title: string;
  description: string;
};

export type Solution = {
  slug: string;
  title: string;
  oneLiner: string;
  href: Route;
  subSolutions: SubSolution[];
  /** Full-bleed background for the page cover. Falls back to the plain header. */
  coverImage?: string;
  /** Rendered as cards over the cover image. */
  benefits?: Benefit[];
};

/* --- Placeholder content ---------------------------------------------------
   Stand-in sections for the equipment added from the Automated Equipment
   sitemap, none of which came with a brief.

   There is no spec sheet, no function list and no benefit copy for any of it.
   The pages that do have copy carry invented figures in two or three places
   already, each flagged where it sits, and twelve more machines' worth would
   turn a marketing site into fiction. So these fill the same sections with
   numbered stand-ins instead: the page is laid out exactly as a finished one,
   and which pages are still waiting on words is obvious at a glance rather
   than something you have to know.

   The counts are the written pages' counts, not the smallest thing that would
   render. Six metrics because that band is a marquee and a track shorter than
   the window leaves a gap as it loops; three functions and three benefits
   because that is what fills their grids to the row.

   Every one of these is meant to be deleted. Replace a section with real
   content and the stand-in goes with it; a page that keeps the whole set is a
   page nobody has written yet.
-------------------------------------------------------------------------- */

/**
 * Six numbered figures for the metrics band.
 *
 * The values are the labels' own numbers, so nothing here can be mistaken for
 * a measurement: a spec sheet does not read 1, 2, 3, 4, 5, 6.
 */
const PLACEHOLDER_METRICS: Metric[] = [1, 2, 3, 4, 5, 6].map((n) => ({
  label: `Technical Metric ${n}`,
  values: [n],
}));

const PLACEHOLDER_FUNCTIONS: SolutionFunction[] = [
  {
    icon: "tune",
    title: "Function 1",
    description: "What the equipment does. First of three, to be written.",
  },
  {
    icon: "arm",
    title: "Function 2",
    description: "The second thing it does, to be written.",
  },
  {
    icon: "chart",
    title: "Function 3",
    description: "The third thing it does, to be written.",
  },
];

/**
 * Three benefit cards.
 *
 * The pictures are shared across every placeholder page rather than generated
 * per machine, and deliberately: three plates that recur on twelve pages read
 * as scaffolding, where twelve distinct sets of invented photography would
 * read as a finished catalogue.
 */
const PLACEHOLDER_BENEFITS: SubBenefit[] = [
  {
    icon: "gauge",
    title: "Benefit 1",
    image: "/images/placeholder-benefit-1.webp",
    points: [
      "Why this equipment is worth having. First of three, to be written.",
      "The second line of the same point, to be written.",
    ],
  },
  {
    icon: "durable",
    title: "Benefit 2",
    image: "/images/placeholder-benefit-2.webp",
    points: [
      "The second reason, to be written.",
      "The second line of the same point, to be written.",
    ],
  },
  {
    icon: "cycle",
    title: "Benefit 3",
    image: "/images/placeholder-benefit-3.webp",
    points: [
      "The third reason, to be written.",
      "The second line of the same point, to be written.",
    ],
  },
];

/** The "Why <category>?" cards on a cover. Three, so the row fills. */
const PLACEHOLDER_CATEGORY_BENEFITS: Benefit[] = [
  {
    icon: "rocket",
    title: "Benefit 1",
    description:
      "What this category is worth to a production line. First of three, to be written.",
  },
  {
    icon: "verified",
    title: "Benefit 2",
    description: "The second reason, to be written.",
  },
  {
    icon: "handshake",
    title: "Benefit 3",
    description: "The third reason, to be written.",
  },
];

/**
 * One machine with every section still to be written.
 *
 * `href` is passed rather than built from the slugs, so each one stays a
 * literal that can be checked against the route folder that has to exist for
 * it — a template string would type-check happily against a page that was
 * never created.
 *
 * Framed as a photo because the generated plate is a full-frame picture with
 * edges of its own. A cut-out floats on the wash and needs a machine on white
 * to do it with.
 */
function placeholderSub(
  slug: string,
  title: string,
  summary: string,
  href: Route,
): SubSolution {
  return {
    slug,
    title,
    summary,
    href,
    image: `/images/placeholder-${slug}.webp`,
    imageFraming: "photo",
    metrics: PLACEHOLDER_METRICS,
    functions: PLACEHOLDER_FUNCTIONS,
    benefits: PLACEHOLDER_BENEFITS,
  };
}

/**
 * The catalogue, in the order of the Automated Equipment sitemap.
 *
 * Seven categories now rather than four: three of them (Automation & Assembly,
 * Robotics, Specialised Process Equipment) are new, and the other four kept
 * their content and changed their names — see the note on each.
 */
export const SOLUTIONS: Solution[] = [
  {
    // Renamed from "Inspection & Testing", which now names the category below
    // that holds the electrical test equipment. Same content, same cover; the
    // photograph's filename still says inspection-testing and is left alone,
    // since renaming an asset only moves the staleness to a different file.
    slug: "vision-automation",
    title: "Vision & Automation",
    oneLiner:
      "Cameras and vision software that check every part for defects — faster and more consistent than the human eye.",
    href: "/solutions/automated-equipment/vision-automation",
    coverImage: "/images/inspection-testing-cover.webp",
    // NOTE: the README leaves this section's Benefits list blank. Drafted from
    // the Machine Vision "What is" and Functions text — replace with the real
    // marketing copy when it exists.
    benefits: [
      {
        icon: "target",
        title: "Faster Than Manual Checks",
        description:
          "High-speed vision software drives multi-camera systems in parallel, checking every part at line speed.",
      },
      {
        icon: "connection",
        title: "Consistent Every Time",
        description:
          "Automated inspection applies identical criteria to every unit, so results never drift with operator fatigue or judgement.",
      },
      {
        icon: "settings",
        title: "Defects Caught In-House",
        description:
          "Super high resolution imaging identifies chipping, cracks, contamination and misalignment before a unit moves on.",
      },
      {
        icon: "customer",
        title: "One Platform, Every Product",
        description:
          "IC, PCB, LED and wafer inspection run on the same vision system, from die presence and BGA to OCR and 3D lead measurement.",
      },
    ],
    subSolutions: [
      {
        slug: "machine-vision",
        title: "Machine Vision",
        summary: "Automated visual inspection and defect detection systems.",
        href: "/solutions/automated-equipment/vision-automation/machine-vision",
        image: "/images/machine-vision-cover.webp",
        heroSlides: [
          { title: "PCB Inspection", image: "/images/vision-pcb.webp" },
          { title: "LED Inspection", image: "/images/vision-led.webp" },
          {
            title: "Lead Frame Inspection",
            image: "/images/vision-lead-frame.webp",
          },
          {
            title: "Post-Seal Inspection",
            image: "/images/vision-post-seal.webp",
          },
          { title: "Filling Inspection", image: "/images/vision-filling.webp" },
          { title: "Wafer Inspection", image: "/images/vision-wafer.webp" },
        ],
        // NOTE: the brief leaves this section's Benefits blank, so the copy is
        // drafted. Each point is an ordinary consequence of automated optical
        // inspection, but none of it is Sophic's own wording — replace it
        // before this goes near a customer.
        //
        // Deliberately kept off the ground the Functions tabs already cover:
        // no defect names, and no "multi-camera" or "super high resolution",
        // both of which appear verbatim in the Sophic AOI panel above.
        benefits: [
          {
            icon: "lens",
            title: "Caught Early",
            image: "/images/vision-benefit-1.webp",
            points: [
              "Every unit is imaged at the station that made it, not at final test.",
              "Faults are corrected while the part is still cheap to fix.",
            ],
          },
          {
            icon: "gauge",
            title: "Full Line Speed",
            image: "/images/vision-benefit-3.webp",
            points: [
              "Cameras work side by side, so checking never becomes a queue in front of the next station.",
              "Volume rises without adding inspectors.",
            ],
          },
          {
            icon: "chart",
            title: "Auditable Results",
            image: "/images/vision-benefit-2.webp",
            points: [
              "Every pass and fail is backed by the image that produced it.",
              "Defect trends surface early, so the process gets fixed rather than the parts.",
            ],
          },
        ],
        // Straight from the brief's Function list. Only the platform entry has
        // prose there; the rest are lists of what each variant checks, so they
        // are shown as lists rather than being padded out into paragraphs.
        capabilityGroups: [
          {
            name: "Sophic AOI",
            summary:
              "Scans super high resolution image data to identify anomalies and defects.",
            itemsLabel: "Platform",
            items: [
              "Kabowd vision software",
              "High speed, precise inspection",
              "Multi-camera systems in parallel",
            ],
          },
          {
            name: "IC AOI",
            itemsLabel: "Able to detect",
            items: [
              "Orientation",
              "Die absence / presence",
              "Chipping",
              "Crack",
              "Contamination",
              "BGA inspection",
              "Marking inspection",
              "OCR",
              "Tape quality inspection",
              "Post seal inspection",
              "2D lead measurement",
              "3D lead measurement",
              "SWIR inspection",
            ],
          },
          {
            name: "PCB AOI",
            itemsLabel: "Able to detect",
            items: [
              "Wrong component",
              "Missing component",
              "Component shifting",
              "Component breakage",
              "Missing solder",
              "Extra / insufficient solder",
              "Solder bridge",
              "2D matrix",
              "OCR",
            ],
          },
          {
            name: "LED AOI",
            itemsLabel: "Able to detect",
            items: [
              "Contamination",
              "Resin overflow / underflow",
              "Colour inspection",
              "Chipping",
              "Crack",
            ],
          },
          {
            name: "Wafer AOI",
            itemsLabel: "Able to detect",
            items: [
              "Die absence / presence",
              "Chipping",
              "Crack",
              "BGA inspection",
              "Marking inspection",
              "OCR",
              "Wafer skeleton inspection",
            ],
          },
        ],
      },
    ],
  },
  {
    // NOTE: new category, and everything in it is a stand-in — the cover
    // photograph included. Descriptions here and on the two machines below are
    // drafted from their names and nothing else.
    slug: "automation-assembly",
    title: "Automation & Assembly",
    oneLiner:
      "Automated cells that put the product together and finish it, in place of a pair of hands at every station.",
    href: "/solutions/automated-equipment/automation-assembly",
    coverImage: "/images/placeholder-cover-automation-assembly.webp",
    benefits: PLACEHOLDER_CATEGORY_BENEFITS,
    subSolutions: [
      placeholderSub(
        "assembly-automation",
        "Assembly Automation",
        "Automated assembly cells built around your product and its takt time.",
        "/solutions/automated-equipment/automation-assembly/assembly-automation",
      ),
      placeholderSub(
        "printing-automation",
        "Printing Automation",
        "Printing and coding applied inline, as a step in the assembly flow.",
        "/solutions/automated-equipment/automation-assembly/printing-automation",
      ),
    ],
  },
  {
    // Renamed from "ICT & FCT", which is now the name of one of the machines
    // inside it. The one-liner widens with the category: it used to describe
    // electrical test alone, and this now covers the inspection equipment
    // beside it.
    slug: "inspection-testing",
    title: "Inspection & Testing",
    oneLiner:
      "Inspection and electrical test that prove a finished board is built right and actually works — before it ever ships to the customer.",
    href: "/solutions/automated-equipment/inspection-testing",
    coverImage: "/images/ict-fct-cover.webp",
    benefits: [
      {
        icon: "document",
        title: "Higher Efficiency",
        description:
          "ICT removes the simple errors first, so FCT only tests the boards that are worth testing.",
      },
      {
        icon: "user",
        title: "Better Coverage",
        description:
          "Catches both physical build defects and functional or software defects.",
      },
      {
        icon: "money-bag",
        title: "Lower Total Costs",
        description:
          "Fewer boards reach expensive late-stage debugging.",
      },
    ],
    subSolutions: [
      placeholderSub(
        "inspection-testing-equipment",
        "Inspection & Testing",
        "Inspection and test stations for finished boards and assemblies.",
        "/solutions/automated-equipment/inspection-testing/inspection-testing-equipment",
      ),
      // This was the Automated Functional Test Equipment page, which the
      // Automated Equipment sitemap does not list. Rather than keep it beside
      // an empty ICT & FCT stub or throw it away, the two were merged: the name
      // is the sitemap's, everything below it is the written page's.
      //
      // The content carries over honestly, which is the only reason this was
      // worth doing. A bed-of-nails press is in-circuit test's own mechanism
      // and the powered sequence beside it is functional test's, so a page
      // built around those two is a page about ICT and FCT — it was only ever
      // filed under the narrower of the two names.
      {
        slug: "ict-fct",
        title: "ICT & FCT",
        summary: "Verifies every finished unit against your exact specifications.",
        href: "/solutions/automated-equipment/inspection-testing/ict-fct",
        image: "/images/automated-functional-test-equipment.webp",
        imageFraming: "photo",
        // Unlike the other pages, these are not invented. They are the figures
        // published for functional test rigs generally, and each one measures
        // a function listed below rather than sitting on its own:
        //
        //   Test Cycle           30-120s per board          FixturFab
        //   Boards per Press     4-8 up, panelised fixture  APTPCB
        //   Fixture Life         50k-100k cycles before
        //                        pogo pin maintenance       FixturFab
        //   Record Retention     2-5 years, standard        APTPCB
        //   Program Development  2-4 weeks, moderate board  FixturFab
        //
        //   https://www.fixturfab.com/articles/functional-test-system-overview
        //   https://aptpcb.com/en/blog/pcba-functional-test-fct-planning-guide
        //
        // They describe the class of equipment, not a Sophic model. Warranty is
        // the one commercial term here and carries over from the other pages.
        // Swap the lot for the real spec sheet when there is one.
        metrics: [
          {
            label: "Test Cycle",
            values: [30, 120],
            separator: "–",
            suffix: "s",
          },
          {
            label: "Boards per Press",
            values: [4, 8],
            separator: "–",
            suffix: "boards",
          },
          {
            label: "Fixture Life",
            values: [50, 100],
            separator: "–",
            suffix: "k cycles",
          },
          {
            label: "Record Retention",
            values: [2, 5],
            separator: "–",
            suffix: "years",
          },
          { label: "Warranty", values: [1], suffix: "year" },
          {
            label: "Program\nDevelopment",
            values: [2, 4],
            separator: "–",
            suffix: "weeks",
          },
        ],
        // The three subsystems every functional tester is built from — fixture,
        // instrumentation, test software — named for what each one does to the
        // board rather than for its own hardware.
        functions: [
          {
            icon: "barcode",
            title: "Bed-of-Nails Contact",
            description:
              "Spring-loaded pogo pins meet every test point at once, so a single press wires the whole board to the instruments.",
          },
          {
            icon: "gauge",
            title: "Powered Test Sequence",
            description:
              "Programmable supplies bring the board up, then meters, scopes and bus interfaces read it back against set limits — and flash memory is written in the same run.",
          },
          {
            icon: "chart",
            title: "Logged Pass and Fail",
            description:
              "Every reading is kept against the unit's serial number, timestamp and station, as a record the line can go back to.",
          },
        ],
        // The brief's three benefits. Images are matched to what each one
        // shows, which is not their upload order: the probe head belongs to
        // the first, the scope trace to the second, the logged results table
        // to the third.
        benefits: [
          {
            icon: "package",
            title: "Ship Only Good Units",
            image: "/images/afte-1.webp",
            points: [
              "Every finished product is verified against your exact specifications before it leaves the line.",
              "Defects are caught in-house, never by your customer.",
            ],
          },
          {
            icon: "durable",
            title: "Real-World Confidence",
            image: "/images/afte-3.webp",
            points: [
              "The rig can simulate the product's actual operating environment, not just a bench check.",
              "Each unit is proven to perform under real conditions rather than on paper.",
            ],
          },
          {
            icon: "tag",
            title: "Consistent and Traceable",
            image: "/images/afte-2.webp",
            points: [     
              "The same checks are applied to every unit, in the same order, to the same limits.",
              "Results are logged as you go, leaving reliable pass/fail records and a clear quality trail.",
            ],
          },
        ],
      },
    ],
  },
  {
    // Renamed to widen it: storage is now half of what the category holds, and
    // "Automated Material Handling System" has become the name of one machine
    // inside it (AMHS) rather than the heading over all of them. The slug is
    // left alone — nothing else on the site claims "material handling", so
    // there is no confusion to fix and no URL worth breaking.
    slug: "material-handling",
    title: "Automated Storage & Material Handling",
    oneLiner:
      "Systems that store, track, and move materials around the factory — without workers carrying or pushing them.",
    href: "/solutions/automated-equipment/material-handling",
    coverImage: "/images/material-handling-cover.webp",
    benefits: [
      {
        icon: "speed",
        title: "Higher Speed",
        description:
          "Systems process and move large volumes of inventory much faster than manual labour.",
      },
      {
        icon: "protection",
        title: "Less Damage",
        description:
          "Consistent machine handling protects fragile and sensitive products from drops or crashes.",
      },
      {
        icon: "savings",
        title: "Long-Term Saving",
        description:
          "Reduced waste, fewer errors and an optimised workflow save money over time.",
      },
    ],
    subSolutions: [
      placeholderSub(
        "smarter-storage",
        "SMARTer Storage (ASRS & Pallet Shuttle)",
        "Automated storage and retrieval, with pallet shuttles working the racking.",
        "/solutions/automated-equipment/material-handling/smarter-storage",
      ),
      {
        slug: "autonomous-mobile-robot",
        title: "Autonomous Mobile Robot (AMR)",
        summary: "Self-navigating robots that move materials between stations.",
        href: "/solutions/automated-equipment/material-handling/autonomous-mobile-robot",
        image: "/images/amr-cover.webp",
        // A shop-floor photograph rather than a machine cut out on white.
        imageFraming: "photo",
        // NOTE: invented figures — the brief supplies Functions and Benefits
        // for this machine but no spec sheet. Sized for a mid-payload indoor
        // AMR and matched to the shape and count the other pages use. Replace
        // before this goes near a customer.
        metrics: [
          {
            label: "Payload",
            values: [100, 500],
            separator: "–",
            suffix: "kg",
          },
          {
            label: "Travel Speed",
            values: [1.5, 2.0],
            separator: "~",
            suffix: "m/s",
            decimals: 1,
          },
          {
            label: "Battery Runtime",
            values: [8, 12],
            separator: "–",
            suffix: "hours",
          },
          {
            label: "Docking Accuracy",
            values: [10],
            prefix: "±",
            suffix: "mm",
          },
          { label: "Warranty", values: [1], suffix: "year" },
          {
            label: "Fleet\nDeployment",
            values: [1, 2],
            separator: "–",
            suffix: "weeks",
          },
        ],
        // Functions are the brief's own three, kept in its order and wording.
        functions: [
          {
            icon: "tune",
            title: "Easy Setup & Configuration",
            description:
              "Layouts, stopping points and task templates are mapped once on the Fleet Management System, and left alone after that.",
          },
          {
            icon: "sort",
            title: "Comprehensive Fleet Management System",
            description:
              "Path settings are controlled across multiple AMRs at once, preventing collisions and misrouting.",
          },
          {
            icon: "chart",
            title: "Task Planning & Execution",
            description:
              "Machines raise tasks to the dispatcher, which distributes them according to the assignment policy you set.",
          },
        ],
        benefits: [
          {
            icon: "tag",
            // The brief's first two benefits, titles kept verbatim.
            title: "Reduced Long Term Operating Cost",
            image: "/images/amr-benefit-1.webp",
            points: [
              "A one-time investment that returns over the long term, rather than a wage paid every month.",
              "No overtime, insurance, injury leave or the other hidden costs of hiring for floor transport.",
            ],
          },
          {
            icon: "durable",
            title: "Reduce Work Injury",
            image: "/images/amr-benefit-2.webp",
            points: [
              "A Ministry of Health Malaysia study (2002–2006) recorded 249,904 non-fatal occupational injuries, 53% of them attributed to transporting and lifting equipment.",
              "Taking repetitive heavy lifting off people lowers that risk and lifts productivity at the same time.",
            ],
          },
          {
            // NOTE: third benefit written here — the brief gives two. Chosen as
            // the one thing an AMR does that an AGV cannot, so it adds to the
            // pair above instead of restating them.
            icon: "cycle",
            title: "No Rails to Lay",
            image: "/images/amr-benefit-3.webp",
            points: [
              "Routes are held as a map, so there is no wire or tape to cut into the floor before the first run.",
              "Move a station and the route is redrawn the same day — the building itself is never touched.",
            ],
          },
        ],
      },
      placeholderSub(
        "smarter-logistic",
        "SMARTer Logistic",
        "Movement planned and dispatched across the floor as one flow.",
        "/solutions/automated-equipment/material-handling/smarter-logistic",
      ),
      placeholderSub(
        "robotic-cart-thouzer",
        "Robotic Cart Thouzer",
        "A follow-and-carry cart for the loads a person would otherwise push.",
        "/solutions/automated-equipment/material-handling/robotic-cart-thouzer",
      ),
      // This was the Material Management System page, which the Automated
      // Equipment sitemap does not list. Rather than keep it beside an empty
      // AMHS stub or throw it away, the two were merged: the name is the
      // sitemap's, everything below it is the written page's.
      //
      // NOTE: the fit is looser than the ICT & FCT merge in the category above,
      // and worth knowing about. What follows is written about knowing where
      // material is — item tracking, storage routing, live stock counts — where
      // AMHS usually names the transport that moves it, overhead hoists and
      // inter-bay track. Neither is wrong about an automated material handling
      // system and the two are halves of one job, but if a reader arrives here
      // looking for the transport side, this page does not describe it yet.
      {
        slug: "amhs",
        title: "AMHS (Automated Material Handling System)",
        summary: "Storage and tracking of materials across the factory floor.",
        href: "/solutions/automated-equipment/material-handling/amhs",
        image: "/images/mms-cover.webp",
        // A warehouse interior, not a machine on white like the assembly
        // pages — so the hero frames it rather than floating it.
        imageFraming: "photo",
        // NOTE: invented figures. The brief lists this sub-solution by name
        // only, with no spec sheet, so these follow the shape and count used on
        // the assembly pages. Replace before this goes near a customer.
        //
        // Deployment deliberately breaks from the "3 days plug-and-play" the
        // machine pages carry: this is a system wired into existing racking and
        // stock records, not a unit wheeled onto a line, and a three-day claim
        // here would not survive a customer asking about it.
        metrics: [
          {
            label: "Inventory Accuracy",
            values: [99.5, 99.9],
            separator: "~",
            suffix: "%",
            decimals: 1,
          },
          {
            label: "Stock Movements",
            values: [600, 1200],
            separator: "–",
            suffix: "/hour",
          },
          {
            label: "Stock-Take Time",
            values: [2, 4],
            separator: "–",
            suffix: "hours",
          },
          { label: "Data Refresh", values: [1, 3], separator: "~", suffix: "s" },
          { label: "Warranty", values: [1], suffix: "year" },
          {
            label: "System\nDeployment",
            values: [2, 4],
            separator: "–",
            suffix: "weeks",
          },
        ],
        // NOTE: the brief gives neither Functions nor Benefits for this
        // sub-solution. Both sets are drafted from the category line — "store,
        // track, and move materials" — and split the way the other pages split
        // theirs: Functions are the mechanism, Benefits are the consequence,
        // with no word shared between the two sets of titles.
        functions: [
          {
            icon: "barcode",
            title: "Item Tracking",
            description:
              "Every pallet, bin and carton carries a scannable ID that is read at each move.",
          },
          {
            icon: "sort",
            title: "Storage Routing",
            description:
              "Assigns each incoming load a location, and calls it back when the line asks for it.",
          },
          {
            icon: "chart",
            title: "Live Stock Records",
            description:
              "Counts update as goods move, so the figure on screen matches the figure on the floor.",
          },
        ],
        benefits: [
          {
            icon: "gauge",
            title: "Faster Retrieval",
            image: "/images/mms-benefit-1.webp",
            points: [
              "Drivers are sent straight to a location instead of walking the racks to find one.",
              "Material reaches the line in minutes, so machines are not left waiting on parts.",
            ],
          },
          {
            icon: "package",
            title: "No Surprise Shortages",
            image: "/images/mms-benefit-2.webp",
            points: [
              "A shortfall shows up before it stops a line, not when a picker reaches an empty bay.",
              "Buying is based on what is actually held, so cash is not tied up in surplus.",
            ],
          },
          {
            icon: "lens",
            title: "Visible Across Sites",
            image: "/images/mms-benefit-3.webp",
            points: [
              "Stock in every store and staging area is read from one screen, wherever you are.",
              "Incoming and outgoing loads are planned against real numbers rather than a phone call.",
            ],
          },
        ],
      },
    ],
  },
  {
    // NOTE: new category, one machine in it, everything a stand-in.
    slug: "robotics",
    title: "Robotics",
    oneLiner:
      "Robots that work next to your operators rather than behind a fence.",
    href: "/solutions/automated-equipment/robotics",
    coverImage: "/images/placeholder-cover-robotics.webp",
    benefits: PLACEHOLDER_CATEGORY_BENEFITS,
    subSolutions: [
      placeholderSub(
        "cobot",
        "Cobot",
        "A collaborative arm that shares a bench with the person using it.",
        "/solutions/automated-equipment/robotics/cobot",
      ),
    ],
  },
  {
    // Renamed from "Assembly Automation", which is now a machine in the
    // Automation & Assembly category above. The slug moved with the name —
    // leaving /solutions/assembly-automation pointing at this page while a
    // different page is called Assembly Automation is the one rename here that
    // would have been worth breaking a URL to avoid.
    //
    // The one-liner widens to take in the two additions below: the category is
    // no longer only machines off a catalogue, it is also the ones built to a
    // customer's drawing.
    slug: "production-custom-equipment",
    title: "Production & Custom Equipment",
    oneLiner:
      "Machines that build, mark, sort and pack — off the shelf where one fits, built to your print where none does.",
    href: "/solutions/automated-equipment/production-custom-equipment",
    coverImage: "/images/assembly-automation-3.avif",
    benefits: [
      {
        icon: "rocket",
        title: "Higher Productivity",
        description:
          "Systems operate around the clock, 24/7, without fatigue, drastically cutting cycle times and boosting output volumes.",
      },
      {
        icon: "verified",
        title: "Consistent Quality",
        description:
          "Precise, repeatable actions eliminate human error, ensuring every part matches exact specifications with fewer defects.",
      },
      {
        icon: "handshake",
        title: "Lower Labor Costs",
        description:
          "Routine work shifts to machines, reducing direct staffing needs and freeing workers for higher-value programming or oversight roles.",
      },
      {
        icon: "shield",
        title: "Improved Safety",
        description:
          "Moving hazardous or repetitive physical tasks away from human operators lowers workplace accidents.",
      },
    ],
    subSolutions: [
      {
        slug: "automated-packing-equipment",
        title: "Automated Packing Equipment",
        summary: "Product transferring, sealing, and barcode labelling.",
        href: "/solutions/automated-equipment/production-custom-equipment/automated-packing-equipment",
        image: "/images/automated-packing-equipment-cutout.webp",
        metrics: [
          {
            label: "Speed",
            values: [50, 80],
            separator: "–",
            suffix: "bags/h",
          },
          {
            label: "Weighing",
            values: [100, 600],
            separator: "–",
            suffix: "kg",
          },
          {
            label: "Error",
            values: [2, 5],
            separator: "–",
            prefix: "±",
            suffix: "‰",
          },
          {
            label: "Air Supply Pressure",
            values: [0.5, 0.8],
            separator: "~",
            suffix: "MPa",
            decimals: 1,
          },
          { label: "Warranty", values: [1], suffix: "year" },
          {
            // The newline is honoured: a label this long would otherwise
            // stretch its slot in the marquee far wider than its figure.
            label: "Plug-and-Play\nDeployment",
            values: [3],
            suffix: "days",
          },
        ],
        // NOTE: the brief writes each benefit as one sentence. Split here at
        // its own comma so the card reads as a list like the reference design;
        // no claim has been added or changed.
        benefits: [
          {
            icon: "gauge",
            title: "Faster, Consistent Packing",
            image: "/images/packing-benefit-1.webp",
            points: [
              "Automated sealing and packaging handle every unit at line speed with the same precision.",
              "Keeps your output steady and throughput high.",
            ],
          },
          {
            icon: "tag",
            title: "Built-in Traceability",
            image: "/images/packing-benefit-2.webp",
            points: [
              "Barcode labelling is applied directly to each package.",
              "Every product can be tracked and identified from packing through to shipment.",
            ],
          },
          {
            icon: "cycle",
            title: "Reduced Manual Handling",
            image: "/images/packing-benefit-3.webp",
            points: [
              "Product transfer, case closing, and sealing are automated.",
              "Cuts labour effort and lowers the risk of packing errors or damage.",
            ],
          },
        ],
        functions: [
          {
            icon: "package",
            title: "Handling and Sealing",
            description:
              "Manages physical product transport, case closing, and package sealing.",
          },
          {
            icon: "barcode",
            title: "Barcode Labelling",
            description:
              "Applies tracking and identification codes directly to packaged goods.",
          },
          {
            icon: "tune",
            title: "Custom Integration",
            description:
              "Tailored through Sophic Automation to match specific factory floor requirements and line speeds.",
          },
        ],
      },
      {
        slug: "laser-marking-equipment",
        title: "Laser Marking Equipment",
        summary: "1D and 2D laser tracking codes on electronics.",
        href: "/solutions/automated-equipment/production-custom-equipment/laser-marking-equipment",
        image: "/images/laser-marking-equipment-cutout.webp",
        // NOTE: unlike the packing equipment, these figures are NOT from a
        // spec sheet — the brief gives none for this machine. They are
        // plausible values for a fibre marking laser, matched to the shape and
        // count of the packing figures. Replace before this goes near a
        // customer.
        metrics: [
          {
            label: "Marking Speed",
            values: [2000, 7000],
            separator: "–",
            suffix: "mm/s",
          },
          {
            label: "Laser Power",
            values: [20, 50],
            separator: "–",
            suffix: "W",
          },
          {
            label: "Repeatability",
            values: [5, 10],
            separator: "–",
            prefix: "±",
            suffix: "µm",
          },
          {
            label: "Minimum Line Width",
            values: [0.02, 0.05],
            separator: "~",
            suffix: "mm",
            decimals: 2,
          },
          { label: "Warranty", values: [1], suffix: "year" },
          {
            label: "Plug-and-Play\nDeployment",
            values: [3],
            suffix: "days",
          },
        ],
        // NOTE: the brief's Function and Benefit lists for this machine say
        // almost the same three things in the same words, headings included.
        // Rewritten so the two sections earn their place: Functions describe
        // the mechanism — what the machine physically does — and Benefits
        // describe the consequence of having it. Same substance as the brief,
        // different angle, and no word shared between the two sets of titles.
        functions: [
          {
            icon: "barcode",
            title: "Code Marking",
            description:
              "Writes 1D barcodes and 2D data matrix codes straight onto sensitive electronic components — no contact, no consumables.",
          },
          {
            icon: "cycle",
            title: "Line Integration",
            description:
              "Sits inline with product handling and quality tracking, so marking is a step in the flow rather than a station of its own.",
          },
          {
            icon: "laser",
            title: "Surface Etching",
            description:
              "Etches serial numbers, part numbers and logos into the surface itself instead of printing on top of it.",
          },
        ],
        benefits: [
          {
            icon: "tag",
            title: "Full Traceability",
            image: "/images/laser-benefit-2.webp",
            points: [
              "Any unit can be traced back to its batch, shift and date long after it has left the factory.",
              "A recall narrows to the parts actually affected, not the whole run.",
            ],
          },
          {
            icon: "durable",
            title: "Built to Last",
            image: "/images/laser-benefit-3.webp",
            points: [
              "Marks survive reflow, cleaning and years of wear without fading or peeling off.",
              "Nothing to reprint, relabel or reapply later.",
            ],
          },
          {
            icon: "gauge",
            title: "Reliable Reads",
            image: "/images/laser-benefit-1.webp",
            points: [
              "Every unit gets the same code in the same place, so downstream scanners read it first time.",
              "No operator to schedule, and no misread labels to rework.",
            ],
          },
        ],
      },
      {
        slug: "automated-handler-equipment",
        title: "Automated Handler Equipment",
        summary: "Robotic assembly, tray switching, and quality sorting.",
        href: "/solutions/automated-equipment/production-custom-equipment/automated-handler-equipment",
        image: "/images/automated-handler-equipment-cutout.webp",
        // NOTE: invented figures, as for the laser marker — the brief gives
        // none for this machine. Plausible for a pick-and-place test handler,
        // matched to the shape and count used on the other two pages. Replace
        // before this goes near a customer.
        metrics: [
          {
            label: "Handling Rate",
            values: [3000, 8000],
            separator: "–",
            suffix: "UPH",
          },
          {
            label: "Placement Accuracy",
            values: [20, 50],
            separator: "–",
            prefix: "±",
            suffix: "µm",
          },
          {
            label: "Cycle Time",
            values: [0.4, 0.8],
            separator: "~",
            suffix: "s",
            decimals: 1,
          },
          {
            label: "Sorting Outputs",
            values: [4, 8],
            separator: "–",
            suffix: "bins",
          },
          { label: "Warranty", values: [1], suffix: "year" },
          {
            label: "Plug-and-Play\nDeployment",
            values: [3],
            suffix: "days",
          },
        ],
        // NOTE: the brief's Function and Benefit lists overlap here the same
        // way they did for the laser marker — both revolve around switching
        // trays and sorting by quality. Split the same way: Functions are the
        // mechanism, Benefits are the consequence, and no word is shared
        // between the two sets of titles.
        functions: [
          {
            icon: "arm",
            title: "Part Transfer",
            description:
              "Robotic arms pick and place components at high speed, from infeed through to placement.",
          },
          {
            icon: "trays",
            title: "Tray Switching",
            description:
              "Transfers product between process trays so each one reaches the test it needs.",
          },
          {
            icon: "sort",
            title: "Grade Sorting",
            description:
              "Reads the result carried by each part and routes it to the matching output bin.",
          },
        ],
        benefits: [
          {
            icon: "gauge",
            title: "Higher Throughput",
            image: "/images/handler-benefit-1.webp",
            points: [
              "Loading and unloading run at machine pace instead of waiting on a pair of hands.",
              "The line keeps moving through breaks and shift changes.",
            ],
          },
          {
            icon: "durable",
            title: "No Mix-Ups",
            image: "/images/handler-benefit-2.webp",
            points: [
              "Every unit is judged against the same rule, so passes and failures never get confused.",
              "Nothing ships that should have been held back.",
            ],
          },
          {
            icon: "cycle",
            title: "Freed-Up Operators",
            image: "/images/handler-benefit-3.webp",
            points: [
              "Repetitive station work no longer needs a person standing at it.",
              "Staff move to higher-value tasks, and handling damage falls with them.",
            ],
          },
        ],
      },
      placeholderSub(
        "gold-wire-management-system",
        "Gold Wire Management System (GWMS)",
        "Tracks and accounts for bonding wire from store to machine.",
        "/solutions/automated-equipment/production-custom-equipment/gold-wire-management-system",
      ),
      placeholderSub(
        "build-to-print",
        "Build-to-Print",
        "Equipment built to your drawing, where nothing off the shelf fits.",
        "/solutions/automated-equipment/production-custom-equipment/build-to-print",
      ),
    ],
  },
  {
    // NOTE: new category, one machine in it, everything a stand-in.
    slug: "specialised-process-equipment",
    title: "Specialised Process Equipment",
    oneLiner:
      "Process equipment for the steps a standard line has no station for.",
    href: "/solutions/automated-equipment/specialised-process-equipment",
    coverImage: "/images/placeholder-cover-specialised-process-equipment.webp",
    benefits: PLACEHOLDER_CATEGORY_BENEFITS,
    subSolutions: [
      placeholderSub(
        "vacuum-solutions",
        "Vacuum Solutions",
        "Vacuum handling and process stations for parts that cannot be gripped.",
        "/solutions/automated-equipment/specialised-process-equipment/vacuum-solutions",
      ),
    ],
  },
];

/* --- Digitalised Solutions -------------------------------------------------
   The software line, three categories deep, and every page of it a stand-in.

   It arrived as a sitemap and nothing else — sixteen product names under three
   headings, with no copy for any of them — so it is built out of exactly the
   same placeholder parts as the newer equipment categories above. See the note
   on those: the point is that a page waiting on words looks like a page
   waiting on words, rather than looking finished and being empty.

   The summaries below are the one place this departs from the equipment
   catalogue, and deliberately. Most of these names are industry-standard terms
   — a CMMS, an Andon system, OEE monitoring — and a plain definition of one is
   a fact rather than a claim, so those carry a real sentence. Three are
   Sophic's own product names (InnoLocker SMARTer, OPENdot, TofI Data Bridge)
   and nothing in the sitemap says what they do, so they say exactly that.
   Nothing here invents a capability for a product nobody has described yet.
-------------------------------------------------------------------------- */

/** Stand-in for a product only Sophic can describe. */
const UNDESCRIBED = "Sophic's own. Description to be written.";

export const DIGITALISED_CATEGORIES: Solution[] = [
  {
    slug: "asset-material-management",
    title: "Asset & Material Management",
    oneLiner:
      "Systems that keep track of what a plant owns and what it consumes — spares, maintenance, stock and the machines themselves.",
    href: "/solutions/digitalised-solutions/asset-material-management",
    coverImage: "/images/placeholder-cover-asset-material-management.webp",
    benefits: PLACEHOLDER_CATEGORY_BENEFITS,
    subSolutions: [
      placeholderSub(
        "material-management-system",
        "Material Management System (MMS)",
        "Tracks material through the plant, from goods-in to the point it is consumed.",
        "/solutions/digitalised-solutions/asset-material-management/material-management-system",
      ),
      placeholderSub(
        "computerized-maintenance-management-system",
        "Computerized Maintenance Management System (CMMS)",
        "Maintenance schedules, work orders and asset history in one place.",
        "/solutions/digitalised-solutions/asset-material-management/computerized-maintenance-management-system",
      ),
      placeholderSub(
        "innolocker-smarter",
        "InnoLocker SMARTer",
        UNDESCRIBED,
        "/solutions/digitalised-solutions/asset-material-management/innolocker-smarter",
      ),
      placeholderSub(
        "conditional-monitoring-system",
        "Conditional Monitoring System",
        "Watches equipment condition, so a failing machine is caught before it stops the line.",
        "/solutions/digitalised-solutions/asset-material-management/conditional-monitoring-system",
      ),
      placeholderSub(
        "inventory-management-system",
        "Inventory Management System (SIMS)",
        "Stock levels, movements and reorder points across the stores.",
        "/solutions/digitalised-solutions/asset-material-management/inventory-management-system",
      ),
    ],
  },
  {
    slug: "workforce-process-digitalisation",
    title: "Workforce & Process Digitalisation",
    oneLiner:
      "The instructions, checks and paperwork a shift runs on, moved off paper and onto the floor's own screens.",
    href: "/solutions/digitalised-solutions/workforce-process-digitalisation",
    coverImage:
      "/images/placeholder-cover-workforce-process-digitalisation.webp",
    benefits: PLACEHOLDER_CATEGORY_BENEFITS,
    subSolutions: [
      placeholderSub(
        "remote-assistance",
        "Remote Assistance (RA)",
        "Puts a remote expert on the line, through the eyes of whoever is standing at it.",
        "/solutions/digitalised-solutions/workforce-process-digitalisation/remote-assistance",
      ),
      placeholderSub(
        "task-management-system",
        "Task Management System (TMS)",
        "Issues, assigns and tracks the jobs a shift has to get through.",
        "/solutions/digitalised-solutions/workforce-process-digitalisation/task-management-system",
      ),
      placeholderSub(
        "paperless-manufacturing",
        "Paperless Manufacturing",
        "Work instructions, checklists and records on screen instead of on paper.",
        "/solutions/digitalised-solutions/workforce-process-digitalisation/paperless-manufacturing",
      ),
      placeholderSub(
        "safety-technology",
        "Safety Technology",
        "Monitoring and alerting for the hazards a working floor carries.",
        "/solutions/digitalised-solutions/workforce-process-digitalisation/safety-technology",
      ),
    ],
  },
  {
    slug: "factory-intelligence-monitoring-connectivity",
    title: "Factory Intelligence, Monitoring & Connectivity",
    oneLiner:
      "Live plant data gathered off the machines, tied together, and put in front of the people who act on it.",
    href: "/solutions/digitalised-solutions/factory-intelligence-monitoring-connectivity",
    coverImage:
      "/images/placeholder-cover-factory-intelligence-monitoring-connectivity.webp",
    benefits: PLACEHOLDER_CATEGORY_BENEFITS,
    subSolutions: [
      placeholderSub(
        "rfid-iot-solution",
        "RFID IoT Solution",
        "Tagged assets and materials, read automatically as they move.",
        "/solutions/digitalised-solutions/factory-intelligence-monitoring-connectivity/rfid-iot-solution",
      ),
      placeholderSub(
        "oee-monitoring",
        "Overall Equipment Effectiveness (OEE) Monitoring",
        "Availability, performance and quality, measured on the machine itself.",
        "/solutions/digitalised-solutions/factory-intelligence-monitoring-connectivity/oee-monitoring",
      ),
      placeholderSub(
        "4c-center",
        "Command, Control, Collaborate and Cognitive Center (4C Center)",
        "One room where the plant's live data is brought together and acted on.",
        "/solutions/digitalised-solutions/factory-intelligence-monitoring-connectivity/4c-center",
      ),
      placeholderSub(
        "andon-system",
        "Andon System",
        "Calls for help from the line, raised where the problem is and escalated until it is answered.",
        "/solutions/digitalised-solutions/factory-intelligence-monitoring-connectivity/andon-system",
      ),
      placeholderSub(
        "opendot",
        "OPENdot",
        UNDESCRIBED,
        "/solutions/digitalised-solutions/factory-intelligence-monitoring-connectivity/opendot",
      ),
      placeholderSub(
        "tofi-data-bridge",
        "TofI Data Bridge",
        UNDESCRIBED,
        "/solutions/digitalised-solutions/factory-intelligence-monitoring-connectivity/tofi-data-bridge",
      ),
      placeholderSub(
        "wireless-energy-monitoring-system",
        "Wireless Energy Monitoring System",
        "Energy drawn per machine and per line, metered without running new cable.",
        "/solutions/digitalised-solutions/factory-intelligence-monitoring-connectivity/wireless-energy-monitoring-system",
      ),
    ],
  },
];

/* --- The services lines ----------------------------------------------------
   Lines 03 and 04, and the two smallest things on the site: one category each,
   three machines under one and a single one under the other.

   That shape is the sitemap's, not a stage they are passing through, and it is
   kept rather than flattened. Collapsing a one-category line into its own
   landing page would make these two read differently from the two above them
   — a reader who has learned that a line opens onto categories and a category
   opens onto its work should not find that rule broken on the short ones. It
   also means a second category arriving under either is a row in an array
   rather than a page that has to be rebuilt.

   Everything here is a stand-in, on the same terms as Digitalised Solutions
   above: the sitemap gave names and nothing else.
-------------------------------------------------------------------------- */

export const PRODUCT_ENGINEERING_CATEGORIES: Solution[] = [
  {
    slug: "product-engineering",
    title: "Product Engineering",
    oneLiner:
      "Engineering a product through the stages between a working design and a shipping part.",
    href: "/solutions/product-engineering-services/product-engineering",
    coverImage: "/images/placeholder-cover-product-engineering.webp",
    benefits: PLACEHOLDER_CATEGORY_BENEFITS,
    subSolutions: [
      placeholderSub(
        "post-silicon-validation",
        "Post-Silicon Validation",
        "Testing real silicon against what the design promised, once it exists to test.",
        "/solutions/product-engineering-services/product-engineering/post-silicon-validation",
      ),
      placeholderSub(
        "software-engineering",
        "Software Engineering",
        "The software a product needs around it, written to the same schedule as the hardware.",
        "/solutions/product-engineering-services/product-engineering/software-engineering",
      ),
      placeholderSub(
        "new-product-introduction",
        "New Product Introduction (NPI)",
        "Taking a new product from a validated design to a line that can build it repeatably.",
        "/solutions/product-engineering-services/product-engineering/new-product-introduction",
      ),
    ],
  },
];

export const ENGINEERING_SUPPORT_CATEGORIES: Solution[] = [
  {
    slug: "engineering-support",
    title: "Engineering Support",
    oneLiner:
      "Engineers embedded alongside a customer's own, on the equipment already running.",
    href: "/solutions/engineering-support-services/engineering-support",
    coverImage: "/images/placeholder-cover-engineering-support.webp",
    benefits: PLACEHOLDER_CATEGORY_BENEFITS,
    subSolutions: [
      placeholderSub(
        "ic-assembly-test-engineering-support",
        "IC Assembly / Test Engineering Support",
        "Engineering support across IC assembly and test, on the customer's own floor.",
        "/solutions/engineering-support-services/engineering-support/ic-assembly-test-engineering-support",
      ),
    ],
  },
];

/**
 * A line of business under /solutions.
 *
 * A layer above the catalogue rather than a part of it. Automated Equipment is
 * the whole of it today and the seven categories above all sit inside that one
 * line, which is precisely why this is its own list: the day a second line
 * arrives it is a row here plus a folder under app/solutions/, and nothing in
 * the equipment tree has to learn about it.
 */
export type SolutionLine = {
  slug: string;
  title: string;
  href: Route;
  /** One sentence. Used on the landing page card and in the header menu. */
  summary: string;
  /**
   * The line-art mark for this line, drawn in the header's Solution menu.
   *
   * Carried here rather than mapped from the slug in the menu, so a new line
   * cannot reach the bar without someone having chosen what it looks like —
   * a lookup keyed on slug would silently fall back to a default, and four
   * identical marks is worse than none.
   */
  icon: GlyphName;
  /**
   * The photograph the line is introduced by: full-bleed behind its own cover,
   * and again as the panel on its block on /solutions.
   *
   * One field for both on purpose. They are the two places a reader meets this
   * line — one click apart — and a line that arrives on a landing block showing
   * one picture and opens onto a different one reads as two different things.
   *
   * Optional, so a line can exist before its photography does; both readers
   * fall back to type on their own ground rather than a broken frame.
   */
  image?: string;
  /**
   * The categories inside the line.
   *
   * Carried on the line rather than read from SOLUTIONS at each point of use.
   * Every reader would otherwise reach for the equipment categories no matter
   * which line it was drawing, and the second line to be added would silently
   * inherit the first one's contents.
   *
   * Full Solution objects rather than a name and a link, because the mobile
   * drawer goes one level deeper than the other two readers and needs the
   * sub-solutions to build its accordion from.
   */
  children: Solution[];
};

/**
 * The equipment catalogue, as seen from the level above it.
 *
 * Exported on its own as well as in the list below because breadcrumbs need
 * this crumb by name: five components build a trail through it, and the
 * alternative to importing it is the same string typed five times.
 */
export const AUTOMATED_EQUIPMENT: SolutionLine = {
  slug: "automated-equipment",
  title: "Automated Equipment",
  href: "/solutions/automated-equipment",
  summary:
    "Vision, assembly, inspection and test, storage and material handling, robotics and custom-built equipment — engineered into your production line.",
  image: "/images/automated-equipment-cover.jpg",
  icon: "arm",
  children: SOLUTIONS,
};

/**
 * The software line.
 *
 * Exported by name for the same reason AUTOMATED_EQUIPMENT is: its own route
 * folder names it, and a crumb built from a string typed twice is a crumb that
 * goes stale.
 */
export const DIGITALISED_SOLUTIONS: SolutionLine = {
  slug: "digitalised-solutions",
  title: "Digitalised Solutions",
  href: "/solutions/digitalised-solutions",
  summary:
    "Asset and material management, workforce and process digitalisation, factory intelligence and connectivity — the software layer over a working plant.",
  // The one real photograph on this line; everything under it is still a
  // stand-in. Supplied as "digitalised hero.jfif" and converted to a plain JPEG
  // under the name every other referenced image here uses.
  //
  // NOTE: the source is 655 x 468, against 1480 x 870 for the equipment line's.
  // The block on /solutions asks for about 416px of it and is fine; the cover
  // is full-bleed and will upscale past 2x on a desktop, where it goes soft.
  // Replace it with a larger original if one exists.
  image: "/images/digitalised-solutions-cover.jpg",
  icon: "screen",
  children: DIGITALISED_CATEGORIES,
};

export const PRODUCT_ENGINEERING_SERVICES: SolutionLine = {
  slug: "product-engineering-services",
  title: "Product Engineering Services",
  href: "/solutions/product-engineering-services",
  summary:
    "Post-silicon validation, software engineering and new product introduction — the engineering between a design that works and a product that ships.",
  // Supplied as "Product engineering hero.jfif", converted to a plain JPEG
  // under the name every other referenced image here uses. 1085 x 720, so it
  // holds up better than the two below it but still upscales on a wide cover.
  image: "/images/product-engineering-services-cover.jpg",
  icon: "compass",
  children: PRODUCT_ENGINEERING_CATEGORIES,
};

export const ENGINEERING_SUPPORT_SERVICES: SolutionLine = {
  slug: "engineering-support-services",
  title: "Engineering Support Services",
  href: "/solutions/engineering-support-services",
  summary:
    "Engineering support for IC assembly and test, working alongside a customer's own team on the equipment already running.",
  // Supplied as "engineering support.jfif", converted as above.
  //
  // NOTE: 739 x 415 — the smallest cover on the site, and the one that will
  // soften most on a desktop. See the note on DIGITALISED_SOLUTIONS.
  image: "/images/engineering-support-services-cover.jpg",
  icon: "wrench",
  children: ENGINEERING_SUPPORT_CATEGORIES,
};

/**
 * Everything directly under /solutions, in the order the landing page lists it.
 *
 * Read by that page, the header's Solution menu and the mobile drawer, so none
 * of the three can drift. The order is the order the sitemap numbers them, and
 * the landing page draws that number off the position — so this array is what
 * decides which line is 01 and changing it renumbers the page.
 */
export const SOLUTION_LINES: SolutionLine[] = [
  DIGITALISED_SOLUTIONS,
  AUTOMATED_EQUIPMENT,
  PRODUCT_ENGINEERING_SERVICES,
  ENGINEERING_SUPPORT_SERVICES,
];

/**
 * Every category on the site, whichever line it belongs to.
 *
 * Derived from the lines rather than written out, so a third line is picked up
 * by every lookup below without touching any of them.
 */
export const ALL_SOLUTIONS: Solution[] = SOLUTION_LINES.flatMap(
  (line) => line.children,
);

/* Slugs are unique across the whole site, not merely within the thing that
   holds them, and both checks run at module scope so a collision fails the
   build rather than surfacing as a page that quietly shows the wrong content.

   Categories, because getSolution looks one up by slug alone and a second
   category with the same slug would resolve to the first — including from a
   route folder that was created for the second.

   Machines, because the contact form uses a bare sub-slug as the value that
   pre-selects an enquiry (see ENQUIRY_GROUPS in lib/contact), so two machines
   sharing one would put a reader on the wrong product. Two lines are free to
   hold a category or a machine with the same *name*; the slug is the identity
   and has to be its own. */
{
  const seenCategory = new Set<string>();
  const seenMachine = new Set<string>();
  for (const solution of ALL_SOLUTIONS) {
    if (seenCategory.has(solution.slug)) {
      throw new Error(`Two categories share the slug "${solution.slug}"`);
    }
    seenCategory.add(solution.slug);

    for (const sub of solution.subSolutions) {
      if (seenMachine.has(sub.slug)) {
        throw new Error(`Two machines share the slug "${sub.slug}"`);
      }
      seenMachine.add(sub.slug);
    }
  }
}

/**
 * The line a category belongs to.
 *
 * Breadcrumbs and the search index both need it, and both used to reach for
 * AUTOMATED_EQUIPMENT directly — which was correct exactly as long as there was
 * one line, and would have put every Digitalised Solutions page under the
 * equipment line's name on the day the second one arrived.
 */
export function lineOf(solution: Solution): SolutionLine {
  const line = SOLUTION_LINES.find((l) => l.children.includes(solution));
  if (!line) {
    throw new Error(`Category "${solution.slug}" belongs to no line`);
  }
  return line;
}

export function getSolution(slug: string): Solution {
  const solution = ALL_SOLUTIONS.find((s) => s.slug === slug);
  if (!solution) throw new Error(`Unknown solution slug: ${slug}`);
  return solution;
}

export function getSubSolution(
  solutionSlug: string,
  subSlug: string,
): { solution: Solution; subSolution: SubSolution } {
  const solution = getSolution(solutionSlug);
  const subSolution = solution.subSolutions.find((s) => s.slug === subSlug);
  if (!subSolution) {
    throw new Error(`Unknown sub-solution slug: ${solutionSlug}/${subSlug}`);
  }
  return { solution, subSolution };
}
