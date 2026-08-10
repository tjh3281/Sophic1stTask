import type { Route } from "next";

/**
 * Single source of truth for the Careers section.
 *
 * Same arrangement as lib/solutions.ts: the copy lives here, the routes under
 * app/careers/ are thin, and the search index is built from this rather than
 * from a second transcription of the same words.
 */

/* --- Hero ----------------------------------------------------------------- */

export const CAREERS_COVER = "/images/careers hero image.webp";

export const CAREERS_HERO = {
  eyebrow: "Careers",
  title: "Talent as catalyst for digital innovation",
  /**
   * The headline, drawn rather than set: StrokeText outlines it a letter at a
   * time and then floods the fill in behind. Kept here with the rest of the
   * hero copy so the wording is edited in one place, not in the component that
   * happens to animate it.
   */
  wordmark: "Join Our Team",
  /**
   * The first paragraph carries the hero; the other two are the argument
   * underneath it and are set as body copy further down the page. Three
   * paragraphs of this length over a photograph is a wall, not a hero.
   */
  lead:
    "In Sophic Automation, we believe that talent plays a pivotal role in" +
    " driving digital innovation within a company. They possess the skills," +
    " creativity, and expertise necessary to propel technological advancements" +
    " and transform traditional processes.",
  body: [
    "To us, employees are the driving force behind the successful" +
      " implementation of digital strategies and initiatives. Their abilities" +
      " to adapt to emerging technologies, think critically, and collaborate" +
      " enable businesses to stay competitive in the digital landscape." +
      " Investing in talent development and nurturing a culture of innovation" +
      " empowers employees to harness their potential and drive transformative" +
      " change, leading to enhanced productivity, customer satisfaction, and" +
      " sustainable growth.",
    "Recognizing the importance of talents and empowering employees as digital" +
      " innovators is vital for Sophic Automation, striving to thrive in" +
      " today's rapidly evolving digital age.",
  ],
};

/* --- What it is like to work here ----------------------------------------- */

/** Line-art marks drawn in CareerGlyph, on the same grid as the solution set. */
export type CareerGlyphName =
  | "network"
  | "team"
  | "dialogue"
  | "growth"
  | "diversity"
  | "spark"
  | "balance"
  | "chip";

/** The three headings the brief files every pillar under. */
export type PillarGroupName = "Culture" | "Values" | "Environment";

export type Pillar = {
  name: string;
  group: PillarGroupName;
  icon: CareerGlyphName;
  /** One line for the overview grid — what the pillar means, in the fewest
   *  words that still say something. The paragraph below is the real answer. */
  gist: string;
  body: string;
  /** Illustration for the cube's backdrop. Optional on the type because only
   *  the six that sit on the cube have one; required of those six, which
   *  CUBE_PILLARS checks. */
  image?: string;
};

/**
 * The eight pillars, in the order the brief lists them under "Why work with
 * us?" — which is not the order they are grouped in.
 *
 * One array rather than three, with the group as a field: these appear twice on
 * the page — six of them on the cube, all of them grouped under Culture /
 * Values / Environment — and two hand-kept lists of the same content is how the
 * two fall out of step.
 *
 * Changing which six the cube carries means editing the heading in
 * PillarCube.tsx too: it says "Six things we hold ourselves to", and a number
 * spelled as a word is the one thing the page cannot derive from CUBE_PILLARS.
 */
export const PILLARS: Pillar[] = [
  {
    name: "Collaboration",
    group: "Culture",
    icon: "network",
    gist: "Collective intelligence over individual heroics.",
    image: "/images/careers-collaboration.webp",
    body:
      "Collaboration lies at the heart of our company culture as we recognize" +
      " the immense value it brings to our organization. We promote a" +
      " collaborative environment where teamwork, communication, and collective" +
      " problem-solving are highly valued. By embracing collaboration, we" +
      " harness the collective intelligence of our teams, capitalize on our" +
      " collective strengths, and achieve exceptional results.",
  },
  {
    name: "Teamwork",
    group: "Values",
    icon: "team",
    gist: "Shared ideas, shared skills, shared result.",
    body:
      "We understand that collaboration and collective effort are essential to" +
      " achieving goals and driving growth. By fostering a culture that" +
      " promotes teamwork, we actively encourage employees to work together," +
      " share ideas, and leverage their diverse skills and perspectives." +
      " Teamwork is not just a value we uphold; it is a key driver in our" +
      " pursuit of excellence and ensuring the success of our organization.",
  },
  {
    name: "Engagement",
    group: "Culture",
    icon: "dialogue",
    gist: "Mutual respect, and decisions made for the whole company.",
    body:
      "There is mutual respect and friendliness with all employees, as the" +
      " energized work environment inspires employees to make work decisions" +
      " that are for the overall good of the company. Every task they perform" +
      " is productive in nature, as employees are motivated to seek out the" +
      " highest levels of success.",
  },
  {
    name: "Growth Mindset",
    group: "Values",
    icon: "growth",
    gist: "Failures read as openings, not verdicts.",
    image: "/images/careers-growth mindset.png",
    body:
      "Embracing a growth mindset empowers our employees to embrace challenges," +
      " persist in the face of obstacles, and see failures as opportunities for" +
      " growth. By promoting a growth mindset, we create an environment where" +
      " individuals are inspired to stretch their capabilities, embrace change," +
      " and continuously strive for personal and professional advancement.",
  },
  {
    name: "Diversity",
    group: "Values",
    icon: "diversity",
    gist: "A broader range of perspectives makes better decisions.",
    image: "/images/careers-diversity.jpg",
    body:
      "We embrace diversity in all its forms, including but not limited to" +
      " race, gender, age, ethnicity, and background. We believe that a diverse" +
      " workforce fosters creativity, innovation, and a broader range of" +
      " perspectives. This diverse tapestry of experiences and perspectives" +
      " enhances our problem-solving abilities, promotes better decision-making," +
      " and drives our overall success.",
  },
  {
    name: "Motivation",
    group: "Culture",
    icon: "spark",
    gist: "Meaningful work, room to grow, and credit where it is due.",
    image: "/images/careers-motivation.webp",
    body:
      "In Sophic Automation, we prioritize creating an environment that fosters" +
      " motivation by providing meaningful work, opportunities for growth, and" +
      " recognition for achievements. We believe that when employees feel" +
      " valued, supported, and empowered, they are more likely to go above and" +
      " beyond in their roles. Our leaders actively engage with their teams," +
      " providing clear goals, regular feedback, and opportunities for skill" +
      " development.",
  },
  {
    name: "Work-Life Balance",
    group: "Environment",
    icon: "balance",
    gist: "A pool table, darts, a console and a karaoke set — open until midnight.",
    image: "/images/careers-worklifebalance.jfif",
    body:
      "In our ongoing commitment to supporting the work-life balance of our" +
      " valued employees, we understand that, despite our best efforts, they" +
      " may occasionally find themselves deeply engrossed in their job" +
      " responsibilities. In recognition of this, we have taken proactive" +
      " measures to alleviate potential stress and provide opportunities for" +
      " relaxation and rejuvenation. As part of our initiative, employees have" +
      " access to amenities such as a pool, dart boards, PlayStation gaming" +
      " consoles, and a karaoke setup, all available until midnight. By offering" +
      " these recreational facilities, we aim to create an environment where our" +
      " employees can unwind and recharge, ensuring their well-being and" +
      " fostering a positive work atmosphere.",
  },
  {
    name: "Workplace Technologies",
    group: "Environment",
    icon: "chip",
    gist: "The tooling to ship, and the tooling to work together.",
    image: "/images/careers-workplacetechnologies.webp",
    body:
      "At Sophic Automation, we rely on technology to develop, deploy, and" +
      " maintain our products and services. Advanced software, hardware, and" +
      " infrastructure enable efficient coding, testing, and deployment" +
      " processes, leading to faster time-to-market and improved product" +
      " quality. Workplace technology also supports collaboration among teams" +
      " of developers, engineers, and project managers, enabling seamless" +
      " communication and knowledge sharing.",
  },
];

/**
 * The six pillars the cube carries, in the order its faces come round.
 *
 * A cube has six sides and the brief has eight pillars, so two have to sit
 * this one out. The two dropped are the ones with a near neighbour already on
 * it: Teamwork, whose own paragraph opens by talking about collaboration, and
 * Engagement, which covers the same ground as Motivation. Losing either costs
 * the reader nothing — every one of the eight is spelled out in full in the
 * Culture / Values / Environment panels further down the page, which is where
 * the cube sends them.
 *
 * The order alternates Culture → Values → Environment twice, so no two
 * consecutive faces come from the same group and the cube works through all
 * three as it turns.
 */
const CUBE_FACE_NAMES = [
  "Collaboration", // Culture
  "Growth Mindset", // Values
  "Work-Life Balance", // Environment
  "Motivation", // Culture
  "Diversity", // Values
  "Workplace Technologies", // Environment
] as const;

/** A pillar that has earned a side of the cube, and so is guaranteed the
 *  illustration the backdrop crossfades between. */
export type CubePillar = Pillar & { image: string };

export const CUBE_PILLARS: CubePillar[] = CUBE_FACE_NAMES.map((name) => {
  const pillar = PILLARS.find((entry) => entry.name === name);
  // Both thrown at module scope, so a renamed pillar or a missing illustration
  // fails the build rather than quietly leaving a side of the cube blank or the
  // backdrop stuck on the previous image.
  if (!pillar) throw new Error(`No pillar named "${name}" to put on the cube`);
  if (!pillar.image) {
    throw new Error(`"${name}" is on the cube but has no image for the backdrop`);
  }
  return { ...pillar, image: pillar.image };
});

export type PillarGroup = {
  name: PillarGroupName;
  /** Sits under the tab name in the panel, so the three groups are told apart
   *  by what they mean rather than only by which pillars landed in them. */
  tagline: string;
  pillars: Pillar[];
};

const GROUP_TAGLINES: Record<PillarGroupName, string> = {
  Culture: "How the place feels to work in, day to day.",
  Values: "What we hold each other to.",
  Environment: "What we put around you while you do the work.",
};

/** Derived, so a pillar only ever has to be filed once. Tab order is fixed
 *  here rather than taken from PILLARS, which runs in the brief's own order. */
export const PILLAR_GROUPS: PillarGroup[] = (
  ["Culture", "Values", "Environment"] as const
).map((name) => ({
  name,
  tagline: GROUP_TAGLINES[name],
  pillars: PILLARS.filter((pillar) => pillar.group === name),
}));

/* --- Job openings ---------------------------------------------------------- */

export const OPENINGS_HREF = "/careers/openings" as Route;

/**
 * Placeholder roles.
 *
 * Sophic has not supplied a live vacancy list, so these exist to give the
 * listing and the detail page something real-shaped to lay out. The titles and
 * locations are plausible for the company; every word of the descriptions is
 * filler. Both pages say so on the page, in a banner — an unlabelled sample
 * vacancy is the one kind of placeholder somebody can act on by mistake.
 *
 * Replacing them means editing this array and nothing else.
 */
export type JobOpening = {
  slug: string;
  title: string;
  href: Route;
  department: string;
  /** Mirrors the offices in lib/contact.ts, shortened to the city. */
  location: string;
  employmentType: string;
  /** Years, as printed on the card. */
  experience: string;
  /** One line, shown on the listing card. */
  summary: string;
  /** Opening paragraph of the detail page. */
  about: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
};

function opening(job: Omit<JobOpening, "href">): JobOpening {
  return { ...job, href: `${OPENINGS_HREF}/${job.slug}` as Route };
}

export const JOB_OPENINGS: JobOpening[] = [
  opening({
    slug: "automation-engineer",
    title: "Automation Engineer",
    department: "Engineering",
    location: "Bukit Mertajam, Penang",
    employmentType: "Full-time",
    experience: "2 – 5 years",
    summary:
      "Placeholder role. Build and commission assembly and handling equipment" +
      " on customer lines.",
    about:
      "Placeholder description. This paragraph is where the role would be" +
      " introduced — the team it sits in, the kind of equipment it touches, and" +
      " what the first six months would look like.",
    responsibilities: [
      "Placeholder responsibility — the day-to-day work of the role.",
      "Placeholder responsibility — what this role owns end to end.",
      "Placeholder responsibility — who it works alongside.",
      "Placeholder responsibility — what it is measured on.",
    ],
    requirements: [
      "Placeholder requirement — the qualification or degree expected.",
      "Placeholder requirement — years and kind of relevant experience.",
      "Placeholder requirement — the core technical skill.",
      "Placeholder requirement — languages, travel or shift expectations.",
    ],
    niceToHave: [
      "Placeholder — an adjacent skill that would help.",
      "Placeholder — exposure to a particular industry or standard.",
    ],
  }),
  opening({
    slug: "machine-vision-software-engineer",
    title: "Machine Vision Software Engineer",
    department: "Software",
    location: "Bukit Mertajam, Penang",
    employmentType: "Full-time",
    experience: "3 – 6 years",
    summary:
      "Placeholder role. Develop inspection and defect-detection software for" +
      " high-speed vision systems.",
    about:
      "Placeholder description. This paragraph is where the role would be" +
      " introduced — the products it contributes to, the stack it works in, and" +
      " how it fits alongside the hardware teams.",
    responsibilities: [
      "Placeholder responsibility — the day-to-day work of the role.",
      "Placeholder responsibility — what this role owns end to end.",
      "Placeholder responsibility — who it works alongside.",
      "Placeholder responsibility — what it is measured on.",
    ],
    requirements: [
      "Placeholder requirement — the qualification or degree expected.",
      "Placeholder requirement — years and kind of relevant experience.",
      "Placeholder requirement — the core technical skill.",
      "Placeholder requirement — languages, travel or shift expectations.",
    ],
    niceToHave: [
      "Placeholder — an adjacent skill that would help.",
      "Placeholder — exposure to a particular industry or standard.",
    ],
  }),
  opening({
    slug: "mechanical-design-engineer",
    title: "Mechanical Design Engineer",
    department: "Engineering",
    location: "Simpang Ampat, Penang",
    employmentType: "Full-time",
    experience: "2 – 5 years",
    summary:
      "Placeholder role. Design tooling, fixtures and machine frames from" +
      " concept through to build.",
    about:
      "Placeholder description. This paragraph is where the role would be" +
      " introduced — the projects it takes on, the tools it designs in, and how" +
      " a design moves from concept to the shop floor.",
    responsibilities: [
      "Placeholder responsibility — the day-to-day work of the role.",
      "Placeholder responsibility — what this role owns end to end.",
      "Placeholder responsibility — who it works alongside.",
      "Placeholder responsibility — what it is measured on.",
    ],
    requirements: [
      "Placeholder requirement — the qualification or degree expected.",
      "Placeholder requirement — years and kind of relevant experience.",
      "Placeholder requirement — the core technical skill.",
      "Placeholder requirement — languages, travel or shift expectations.",
    ],
    niceToHave: [
      "Placeholder — an adjacent skill that would help.",
      "Placeholder — exposure to a particular industry or standard.",
    ],
  }),
  opening({
    slug: "test-development-engineer",
    title: "Test Development Engineer (ICT & FCT)",
    department: "Engineering",
    location: "Puchong, Selangor",
    employmentType: "Full-time",
    experience: "3 – 6 years",
    summary:
      "Placeholder role. Develop in-circuit and functional test programs and" +
      " the fixtures they run on.",
    about:
      "Placeholder description. This paragraph is where the role would be" +
      " introduced — the platforms it develops against, the customers it" +
      " supports, and what a typical programme looks like.",
    responsibilities: [
      "Placeholder responsibility — the day-to-day work of the role.",
      "Placeholder responsibility — what this role owns end to end.",
      "Placeholder responsibility — who it works alongside.",
      "Placeholder responsibility — what it is measured on.",
    ],
    requirements: [
      "Placeholder requirement — the qualification or degree expected.",
      "Placeholder requirement — years and kind of relevant experience.",
      "Placeholder requirement — the core technical skill.",
      "Placeholder requirement — languages, travel or shift expectations.",
    ],
    niceToHave: [
      "Placeholder — an adjacent skill that would help.",
      "Placeholder — exposure to a particular industry or standard.",
    ],
  }),
  opening({
    slug: "field-service-engineer",
    title: "Field Service Engineer",
    department: "Service & Support",
    location: "Singapore",
    employmentType: "Full-time",
    experience: "1 – 4 years",
    summary:
      "Placeholder role. Install, commission and support equipment on customer" +
      " sites across the region.",
    about:
      "Placeholder description. This paragraph is where the role would be" +
      " introduced — the accounts it covers, the travel it involves, and the" +
      " support structure behind it.",
    responsibilities: [
      "Placeholder responsibility — the day-to-day work of the role.",
      "Placeholder responsibility — what this role owns end to end.",
      "Placeholder responsibility — who it works alongside.",
      "Placeholder responsibility — what it is measured on.",
    ],
    requirements: [
      "Placeholder requirement — the qualification or degree expected.",
      "Placeholder requirement — years and kind of relevant experience.",
      "Placeholder requirement — the core technical skill.",
      "Placeholder requirement — languages, travel or shift expectations.",
    ],
    niceToHave: [
      "Placeholder — an adjacent skill that would help.",
      "Placeholder — exposure to a particular industry or standard.",
    ],
  }),
  opening({
    slug: "engineering-internship",
    title: "Engineering & Software Internship",
    department: "Early Careers",
    location: "Bukit Mertajam, Penang",
    employmentType: "Internship",
    experience: "Undergraduate",
    summary:
      "Placeholder role. A structured internship across the automation," +
      " vision and test teams.",
    about:
      "Placeholder description. This paragraph is where the programme would be" +
      " introduced — its length, the teams an intern rotates through, and what" +
      " they take away from it.",
    responsibilities: [
      "Placeholder responsibility — the day-to-day work of the placement.",
      "Placeholder responsibility — the project an intern would own.",
      "Placeholder responsibility — who they would work alongside.",
    ],
    requirements: [
      "Placeholder requirement — the course and year of study expected.",
      "Placeholder requirement — the minimum placement length.",
      "Placeholder requirement — the core technical skill.",
    ],
    niceToHave: [
      "Placeholder — an adjacent skill that would help.",
      "Placeholder — prior project or society experience.",
    ],
  }),
];

/** The role for a slug, or undefined if the URL names nothing we list. */
export function findOpening(slug: string): JobOpening | undefined {
  return JOB_OPENINGS.find((job) => job.slug === slug);
}

/** Shown on both openings pages. Stated once so the two cannot disagree about
 *  how provisional the list is. */
export const PLACEHOLDER_NOTICE =
  "Sample vacancies. These roles are placeholder content for the prototype —" +
  " titles, locations and descriptions are not live openings.";
