import type { Route } from "next";

/**
 * Single source of truth for the Careers section.
 *
 * Same arrangement as lib/solutions.ts: the copy lives here, the routes under
 * app/careers/ are thin, and the search index is built from this rather than
 * from a second transcription of the same words.
 */

/* --- Hero ----------------------------------------------------------------- */

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
  pillars: Pillar[];
};

/**
 * Derived, so a pillar only ever has to be filed once. Order is fixed here
 * rather than taken from PILLARS, which runs in the brief's own order.
 *
 * No tagline under the three headings. They used to carry one each — "how the
 * place feels to work in", and so on — and every one of them said out loud what
 * the pillars filed underneath were about to demonstrate. Which bucket a pillar
 * falls in is the claim; a line explaining the bucket is the claim made twice.
 */
export const PILLAR_GROUPS: PillarGroup[] = (
  ["Culture", "Values", "Environment"] as const
).map((name) => ({
  name,
  pillars: PILLARS.filter((pillar) => pillar.group === name),
}));

/* --- Job openings ---------------------------------------------------------- */

export const OPENINGS_HREF = "/careers/openings" as Route;

/**
 * Sophic's open roles, as Sophic wrote them.
 *
 * Every line below is transcribed from the company's own postings and nothing
 * has been added to them — no summaries, no rewritten bullets, no invented
 * "nice to have". That is why the shape here is the shape of a Sophic ad
 * rather than the shape a job board would prefer: title, hiring type, location,
 * a description and a list of requirements, and a salary on the one role that
 * quotes one.
 *
 * Where the source reads oddly it still reads oddly here. Fixing its typography
 * would mean guessing at what it meant, and a careers page is the last place on
 * a site to start paraphrasing the employer.
 */
export type JobOpening = {
  slug: string;
  title: string;
  href: Route;
  /** "Permanent", or "Contract & Permanent" — the posting's own wording. */
  hiringType: string;
  /** Verbatim, several sites and all: which office you would sit at is part of
   *  what the ad is telling you, and shortening it to one city drops that. */
  location: string;
  /**
   * The photograph behind the role's own cover.
   *
   * Required rather than optional, so a role added without one fails the build
   * instead of shipping a cover that is a rectangle of near-black — which is
   * what an optional field here would eventually produce, on the one page a
   * candidate reaches from a link somebody sent them.
   *
   * Filenames are the uploads' own, spaces and mixed case and all. They are
   * only ever written here, and Next encodes them on the way into the URL.
   */
  image: string;
  /** Quoted on one role only, so absent everywhere else rather than blank. */
  salary?: string;
  description: string[];
  requirements: string[];
};

function opening(job: Omit<JobOpening, "href">): JobOpening {
  return { ...job, href: `${OPENINGS_HREF}/${job.slug}` as Route };
}

/* The strings below repeat word for word across several of the postings. They
   are named once so the roles that share them cannot drift apart in a later
   edit — not to shorten anything. Every list still reads out in full. */

const PENANG_KEDAH =
  "Bukit Minyak, Pulau Pinang (HQ)/ Batu Kawan, Pulau Pinang/ Kulim, Kedah";

const HQ = "Sophic Automation HQ, Bukit Minyak";

/** The opening of all three Software Engineer ads. Each one carries on with
 *  its own bullets from here, so this is only the part they share. */
const SOFTWARE_ENGINEER_CORE = [
  "Develops information systems by designing, developing, and installing software solutions.",
  "Determines operational feasibility by evaluating analysis, problem definition, requirements, solution development, and proposed solutions.",
  "Develops software solutions by studying information needs, conferring with users, and studying systems flow, data usage, and work processes.",
  "Investigates problem areas.",
  "Follows the software development lifecycle.",
  "Documents and demonstrates solutions by developing documentation, flowcharts, layouts, diagrams, charts, code comments and clear code.",
  "Prepares and installs solutions by determining and designing system specifications, standards, and programming.",
];

/** Everything after the qualification line, which is the only requirement the
 *  two business-development ads word differently. */
const BD_REQUIREMENTS = [
  "Open to fresh graduates or candidates with experience in Industry Automation Engineering Sales.",
  "Demonstrated proficiency in both written and spoken English and Bahasa Malaysia.",
  "Proven ability to lead sales teams effectively, exhibiting dynamic and aggressive leadership qualities.",
  "Mature, self-motivated, and results-oriented professional with a proactive attitude towards problem-solving.",
  "Strong interpersonal, communication, and presentation skills, with the ability to engage effectively with diverse stakeholders.",
  "Professional, energetic, and a strong team player who thrives in a collaborative environment.",
  "Excellent planning and organizational skills, with meticulous attention to detail and the ability to manage competing priorities.",
  "Exposure to manufacturing environments, with a keen interest in exploring and applying new technologies.",
  "Own a reliable mode of transport, possess a valid driver's license, and be willing to travel as required.",
];

export const JOB_OPENINGS: JobOpening[] = [
  opening({
    slug: "software-validation-engineer",
    title: "Software Validation Engineer",
    hiringType: "Contract & Permanent",
    location: PENANG_KEDAH,
    image: "/images/software-validation-engineer.webp",
    description: [
      "Setting up Demo station and automation environment for remote debug.",
      "Create a GUI/Dashboard that provide one stop Intel validation tools service for customers.",
      "Using Machine Deep learning to handle offline customer queries in remote.",
      "Adding some Artificial Intelligence stuff to make the virtual remote lab comprehensive.",
      "Some debugging effort when necessary for customer issues.",
    ],
    requirements: [
      "Candidate must possess at least Bachelor's Degree/Post Graduate Diploma/Professional Degree in Computer -Science/Information Technology or equivalent",
      "At least 1 Year(s) of working experience in the related field is required for this position.",
      "Required Skill(s): Java, Linux, Python, Apache Tomcat, SQL Server, PHP, VMware, Framework",
      "Preferably Non-Executive specialized in IT/Computer -Software or equivalent.",
      "Good - Verbal and written communication skills",
    ],
  }),
  opening({
    slug: "software-engineer-web-division",
    title: "Software Engineer (Web Division)",
    hiringType: "Permanent",
    location: PENANG_KEDAH,
    image: "/images/software-engineer (web division).jpg",
    description: [
      ...SOFTWARE_ENGINEER_CORE,
      "Provides information by collecting, analyzing, and summarizing development and service issues.",
      "Accomplishes engineering and organization mission by completing related results as needed.",
    ],
    requirements: [
      "General programming skills (C#, SQL, ASP.NET, Web Development (Visual Studio))",
      "General programming knowledge about database (PostgreSQL, MSSQL, MySQL and Oracle)",
      "Familiar with Cloud based system (AWS, Microsoft Azure)",
      "Software interface design (UI/UX)",
      "Software testing & debugging, able to test the software and troubleshoot the software bugs and provide quick fix",
      "Software documentation (ERD diagram, flow chart, software user manual)",
      "Degree in Computer Science/Related field (Experienced / Fresh Grad)",
      "Possess own transport and able to work on customer site",
    ],
  }),
  opening({
    slug: "software-engineer-machine-division",
    title: "Software Engineer (Machine Division)",
    hiringType: "Permanent",
    location: PENANG_KEDAH,
    image: "/images/software-engineer (machine division).jpg",
    description: [
      ...SOFTWARE_ENGINEER_CORE,
      "Improves operations by conducting systems analysis and recommending changes in policies and procedures.",
      "Obtains and licenses software by obtaining required information from vendors, recommending purchases, and testing and approving products.",
      "Protects operations by keeping information confidential.",
      "Provides information by collecting, analyzing, and summarizing development and service issues.",
      "Accomplishes engineering and organization mission by completing related results as needed.",
    ],
    requirements: [
      "Degree in Computer Science/Related field (Experienced / Fresh Grad)",
      "Skill required: C#, Visual Studio, WPF and MSSQL / MYSQL / PostgreSQL database.",
      "Involve in designing, coding and modifying window application, from layout to function.",
      "Collect and analyze user requirement",
      "Familiar with electrical, I/O signal and motion control",
      "Good to have: PLC knowledge, Industry Machine knowledge",
      "Possess own transport and able to work on customer site",
      "Required language: English, Bahasa Malaysia and Mandarin",
    ],
  }),
  opening({
    slug: "software-engineer-iot-division",
    title: "Software Engineer (IoT Division)",
    hiringType: "Permanent",
    location: PENANG_KEDAH,
    image: "/images/software-engineer (iot division).jfif",
    description: [
      ...SOFTWARE_ENGINEER_CORE,
      "Provides information by collecting, analyzing, and summarizing development and service issues.",
      "Accomplishes engineering and organization mission by completing related results as needed.",
    ],
    requirements: [
      "General programming skills (C#, SQL, WPF, Web Development (Visual Studio))",
      "General programming knowledge about database (PostgreSQL, MSSQL, MySQL and Oracle)",
      "Good knowledge about Internet of Things (IoT), Industrial 4.0 (I4.0) and smart manufacturing process",
      "Familiar with Cloud based system (AWS, Microsoft Azure)",
      "Software interface design (UI/UX)",
      "Software testing & debugging, able to test the software and troubleshoot the software bugs and provide quick fix",
      "Software documentation (ERD diagram, flow chart, software user manual)",
      "Degree in Computer Science/Engineer/Related field (Experienced / Fresh Grad)",
      "Possess own transport and able to work on customer site",
      "Strong organizational skills",
    ],
  }),
  opening({
    slug: "validation-engineer-linux",
    title: "Validation Engineer (Linux)",
    hiringType: "Contract & Permanent",
    location: "Bayan Lepas, Pulau Pinang",
    image: "/images/linux-validation-engineer.jpg",
    description: [
      "Install, configure, deploy and monitor Linux OS.",
      "Troubleshoot applications and operating systems.",
      "Develop automation scripts for routine tasks.",
      "Proactively help debug issues to their root cause and develop recommended solutions.",
      "Able to set up a bench platform including power supplies, oscilloscope, validation board and other bench equipment to carry out the required validation testing.",
      "Develop disaster recovery plans and execute for validation.",
      "Conduct security risk assessments including the monitoring, investigation, remediation and reporting of security and access violations.",
      "Perform system updates, server installations and general monthly maintenance.",
      "Work with protocols such as FTP, SSH, SMTP, LDAP.",
      "Document platform configuration and associated processes.",
      "Respond within defined SLA requirements in relation to system issues.",
      "Participate in working closely with IT team to resolve issues.",
    ],
    requirements: [
      "Extensive Linux experience (Ubuntu/Red Hat/Debian/CentOS etc.)",
      "Automation or script creation experience with service side languages (Shell, Bash, Perl, Python, etc.)",
      "Strong middle ware experience",
      "Proven knowledge in the use of Laboratory measurement equipment such as high-speed oscilloscopes, multi-meters, and time-domain reflectometers to characterize the electrical performance of new silicon and platform interfaces",
      "Experience in navigating board design schematic and layout and performing board level component debugging",
    ],
  }),
  opening({
    slug: "technical-sales-engineer-bd",
    title: "Technical Sales Engineer (BD)",
    hiringType: "Permanent",
    location: HQ,
    image: "/images/technical-sales-engineer.jpg",
    description: [
      "Effectively manage multiple orders or projects, ensuring high-quality execution and timely delivery to meet customer expectations.",
      "Provide comprehensive sales and service support to existing customers within industry clusters such as distribution channels, engineering, OEMs, and end-users.",
      "Oversee sales collection activities by working closely with the Branch Administrative Officer to ensure timely and accurate collections.",
      "Carry out various duties and assignments as directed by management, demonstrating flexibility and adaptability in handling diverse tasks.",
      "Maintain accountability and responsibility for the successful delivery of orders or projects within the agreed timeline.",
      "Plan, organize, and execute daily sales activities strategically to achieve and exceed sales targets.",
      "Actively drive, manage, and accelerate the sales process by identifying and securing new accounts to expand the customer base.",
      "Develop and implement effective marketing strategies to meet sales targets, while continuously exploring opportunities to engage new customers within the related industry cluster.",
      "Prepare and provide quotations, proposals, tenders, and reports tailored to meet specific customer requirements.",
      "Attend and actively participate in sales meetings, product seminars, and industry events to stay updated and strengthen customer relationships.",
      "Deliver technical presentations that effectively communicate the features and benefits of products or services, ensuring alignment with customer needs.",
      "Address and resolve technical clarifications and evaluations promptly and professionally.",
      "Optimize support services, including training programs, to enhance customer satisfaction and product performance.",
      "Foster and maintain strong relationships with both existing and potential customers, ensuring high levels of engagement and loyalty.",
      "Regularly prepare and submit sales reports, detailing activities, progress, and project followups to management",
    ],
    requirements: [
      "Possess at least a Diploma or Degree in Electrical Engineering, Business Studies, or IT.",
      ...BD_REQUIREMENTS,
    ],
  }),
  opening({
    slug: "test-technician",
    title: "Test Technician",
    hiringType: "Contract & Permanent",
    salary: "RM1800",
    location: "Bayan Lepas, Pulau Pinang",
    image: "/images/test-technician.jfif",
    description: [
      "Diploma in Electronics/ Electrical/ Telecommunication Engineering with Debug/ ICT experience.",
      "Knowledge in circuit analysis of schematic diagrams (Digital and Analog).",
      "Strong knowledge in Functional Test (FT) and debug.",
      "Able to multi-task and/or willing to take on additional assignments.",
      "Adapts to changes (work plan, priority and management decision) in the work environment.",
      "Supports improvement initiatives and participates actively to improve work environment (example 5S).",
      "Competent in required job knowledge and skills to perform assigned tasks.",
      "Able to apply new work requirements with minimal supervision.",
      "Able to learn/develop new job knowledge or requirements quickly and to contribute at an effective level.",
      "Consistently completes assignments or work requirements on time without compromising on quality.",
      "Uses time effectively to manage workload/tasks.",
      "Looks for opportunities to improve work productivity and efficiency.",
      "Understands and follows Plexus quality policy guidelines, customer specifications and adheres to regulatory compliance.",
      "Monitors own work to ensure quality standard is met.",
      "Looks for opportunities to improve quality and eliminate waste at work.",
      "Able to work cooperatively in a team & cross functional team(s) as needed.",
      "Able to maintain a level temperament in a stressful environment.",
      "Openly and proactively shares information, knowledge & experience with co-workers.",
    ],
    requirements: [
      "Responsible for operating production test equipment, troubleshoot and repair defective products, maintain test equipment, monitor test performance and yield information, and provide technical support to other focus factory personnel.",
      "Assembly/system level troubleshooting to component level Field board debugging and analyzing failure boards.",
      "Debug WIP inventory control. Support implementation of engineering change orders Supervises Engineering Operator.",
    ],
  }),
  opening({
    slug: "sales-executive-bd",
    title: "Sales Executive (BD)",
    hiringType: "Permanent",
    location: HQ,
    image: "/images/sales-executive.jfif",
    description: [
      "Ability to handle multiple Order or Projects.",
      "Provide sales and service support to existing customers in related industry cluster (distribution channel, engineering, OEM, end-users)",
      "Handle sales collection and work closely with Branch Admin Officer in sales collection",
      "To carry out duties and assignments as assigned by the management from time to time",
      "Accountable and responsible for Order or Projects deliverable within timeline",
      "Plan and organize daily sales activities in order to achieve the sales target.",
      "Responsible for meeting revenue and customer growth by managing a of complex or strategic products from the concept, plan, define, development, production to sustaining phase, supported by the team",
      "Strategize, develop and maintain business relationship with customers to maximize customer satisfaction from sales, quality to fulfilment and develop new customers in related industry cluster",
      "Develop status report; maintain project plan documents, procedures and ensuring project deliverable within timeline and budgets.",
      "Provide quotation/proposal/tender/reports to meet customer's requirements. Attending and participating in sales meetings, product seminars and events. Prepare and deliver technical presentations that explain products or services to meet customer's requirements.",
      "Attending to all technical clarification and evaluation.",
      "Ensure the support services (including training) are optimized wherever possible.",
      "Liaise and maintain a good relationship with existing and new customers. Execute production and distribution plans to meet customers' requirements for product quality and delivery timeliness",
    ],
    requirements: [
      "Possess at least a Diploma/Degree in Business Studies/Management/Marketing or equivalent.",
      ...BD_REQUIREMENTS,
    ],
  }),
  opening({
    slug: "finance-executive",
    title: "Finance Executive",
    hiringType: "Permanent",
    location: HQ,
    image: "/images/Finance-Executive.avif",
    description: [
      "Oversee the accurate and timely preparation of monthly management accounts, ensuring all key aspects, including the general ledger, accounts receivables, and accounts payables, are properly managed.",
      "Perform and monitor daily account recording activities, including data entry and financial transactions.",
      "Support credit control processes by monitoring and collecting customer payments efficiently.",
      "Act as the primary liaison with external stakeholders such as auditors, company secretaries, tax agents, and bankers to facilitate financial operations and statutory compliance.",
      "Ensure compliance with all local regulations, taxation requirements, auditing standards, and statutory reporting obligations in Malaysia.",
      "Collaborate closely with other departments, providing financial expertise and strategic advice to support decision-making and organizational goals.",
    ],
    requirements: [
      "A Bachelor's degree in Accounting or Finance.",
      "A minimum of 5 years of relevant work experience in accounting functions, demonstrating proficiency in handling complex financial tasks.",
      "Proficiency in using accounting systems and software.",
      "Exceptional verbal and written communication skills, with the ability to convey financial concepts clearly to diverse audiences.",
      "Demonstrates a proactive, disciplined, and results-oriented approach, maintaining a positive attitude when facing challenges.",
      "Strong organizational skills with the ability to manage multiple tasks effectively in a dynamic, fast-paced environment.",
      "Capable of working independently as well as collaboratively with various teams, including management, technical, business development, and operations teams.",
    ],
  }),
];

/** The role for a slug, or undefined if the URL names nothing we list. */
export function findOpening(slug: string): JobOpening | undefined {
  return JOB_OPENINGS.find((job) => job.slug === slug);
}
