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
  | "chart";

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

export const SOLUTIONS: Solution[] = [
  {
    slug: "assembly-automation",
    title: "Assembly Automation",
    oneLiner:
      "Machines and robots that build, sort, mark, and pack products automatically — replacing slow, error-prone manual handling.",
    href: "/solutions/assembly-automation",
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
        href: "/solutions/assembly-automation/automated-packing-equipment",
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
        href: "/solutions/assembly-automation/laser-marking-equipment",
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
            image: "/images/laser-benefit-1.webp",
            points: [
              "Any unit can be traced back to its batch, shift and date long after it has left the factory.",
              "A recall narrows to the parts actually affected, not the whole run.",
            ],
          },
          {
            icon: "durable",
            title: "Built to Last",
            image: "/images/laser-benefit-2.webp",
            points: [
              "Marks survive reflow, cleaning and years of wear without fading or peeling off.",
              "Nothing to reprint, relabel or reapply later.",
            ],
          },
          {
            icon: "gauge",
            title: "Reliable Reads",
            image: "/images/laser-benefit-3.webp",
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
        href: "/solutions/assembly-automation/automated-handler-equipment",
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
    ],
  },
  {
    slug: "inspection-testing",
    title: "Inspection & Testing",
    oneLiner:
      "Cameras and vision software that check every part for defects — faster and more consistent than the human eye.",
    href: "/solutions/inspection-testing",
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
        href: "/solutions/inspection-testing/machine-vision",
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
    slug: "material-handling",
    title: "Automated Material Handling System",
    oneLiner:
      "Systems that store, track, and move materials around the factory — without workers carrying or pushing them.",
    href: "/solutions/material-handling",
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
      {
        slug: "material-management-system",
        title: "Material Management System (MMS)",
        summary: "Storage and tracking of materials across the factory floor.",
        href: "/solutions/material-handling/material-management-system",
        image: "/images/mms-cover.webp",
        // A warehouse interior, not a machine on white like the assembly
        // pages — so the hero frames it rather than floating it.
        imageFraming: "photo",
        // NOTE: invented figures. The brief lists this sub-solution by name
        // only, with no spec sheet, so these follow the shape and count used on
        // the assembly pages. Replace before this goes near a customer.
        //
        // Deployment deliberately breaks from the "3 days plug-and-play" the
        // machine pages carry: an MMS is a system wired into existing racking
        // and stock records, not a unit wheeled onto a line, and a three-day
        // claim here would not survive a customer asking about it.
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
      {
        slug: "autonomous-mobile-robot",
        title: "Autonomous Mobile Robot (AMR)",
        summary: "Self-navigating robots that move materials between stations.",
        href: "/solutions/material-handling/autonomous-mobile-robot",
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
    ],
  },
  {
    slug: "ict-fct",
    title: "ICT & FCT",
    oneLiner:
      "Electrical tests that prove a finished board actually works — before it ever ships to the customer.",
    href: "/solutions/ict-fct",
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
      {
        slug: "automated-functional-test-equipment",
        title: "Automated Functional Test Equipment",
        summary: "Verifies every finished unit against your exact specifications.",
        href: "/solutions/ict-fct/automated-functional-test-equipment",
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
];

export function getSolution(slug: string): Solution {
  const solution = SOLUTIONS.find((s) => s.slug === slug);
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
