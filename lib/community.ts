/**
 * The community page.
 *
 * The brief for this page is four drawings and nothing else: a globe with a
 * crowd of small scenes standing on it, and three close-ups of that same globe
 * with one of those scenes on the horizon. So the page is built as a reading of
 * the pictures rather than around copy that does not exist yet.
 *
 * The one line here that is not new is the headline. It is Sophic's own sixth
 * value, transcribed from the company board — see COMPANY_VALUES in lib/company
 * — and it is the closest thing the brief has to a statement of what this page
 * is for. Everything else below is a caption: short, and deliberately making no
 * claim that could be wrong. None of it names a programme, a partner, a place
 * or a number, because the brief supplies none of those, and a community page
 * that invents them is worse than one that waits for them.
 *
 * When the real programme copy arrives it belongs in `line` — the field is
 * sized for a sentence, and the layout holds room for two.
 */

/** The cover, over the generated gradient. */
export const COMMUNITY_HERO = {
  eyebrow: "Community",
  /** Verbatim from the values board. */
  headline: "We make a difference in the communities we serve.",
  /**
   * Never rendered. The cover is the headline alone — a second sentence under it
   * was saying in the vaguest possible terms what the page below then shows, and
   * the page shows it better. This survives because a page still owes a search
   * engine and the site's own palette a description of itself, and the headline
   * on its own is a claim rather than a summary.
   */
  description:
    "How Sophic Automation shows up in the communities around it — our elders, our planet and our neighbours.",
};

/**
 * Where and when a frame was taken, shown over it on hover.
 *
 * `date` is the text as it should read; `iso` is the same day for the `time`
 * element to carry, and is the only one of the two a machine ever sees. Keeping
 * both means the displayed format is a free choice rather than something a
 * parser has to be able to read back.
 */
export type CommunityCaption = {
  place: string;
  /** As printed, e.g. "01 Feb 2024". */
  date: string;
  /** The same day as YYYY-MM-DD. */
  iso: string;
};

/**
 * A frame waiting for a photograph or a clip.
 *
 * Empty until the media for a scene exists, and empty on purpose rather than
 * filled with stand-ins pulled from elsewhere on the site — a careers
 * photograph captioned as community work would be a small lie that nobody would
 * ever go back and correct. All three visits are photographed now; the clips at
 * the centre of each scene are still frames waiting.
 *
 * To fill one, give it a `src`: an image renders in the frame, a video plays
 * muted and looping in it. Until then it draws the placeholder mark it was
 * designed with.
 */
export type CommunitySlot = {
  kind: "photo" | "video";
  /** Absent until real media exists. */
  src?: string;
  /** What the media shows. Required once `src` is set. */
  alt?: string;
  /**
   * Optional. A frame without one simply never reveals anything on hover — and
   * never becomes a hover target in the first place, which matters because
   * these sit in stacked scenes and a frame that can be pointed at is a frame
   * that can steal the pointer from the scene in front of it.
   */
  caption?: CommunityCaption;
  /**
   * Where this frame leads, if it leads anywhere.
   *
   * At most one frame per visit carries this. Six ways into the same story is
   * not six times as useful — it is a wall of photographs that all do the same
   * thing, and the reader has to discover that by trying them. One framed,
   * ringed, obviously-clickable picture says what it is without being tried.
   */
  href?: string;
};

/* --- The visits, written up ----------------------------------------------
   A scene on the globe is a picture with a caption. A story is the visit
   itself: who went, where, when, and what happened — the page the caption is
   the spine of.

   The two are deliberately one record rather than two. The title over the
   story page, the line that appears over a frame on hover, and the alt text on
   the photographs in both places all come from here, so a visit cannot end up
   dated one way on the globe and another way on its own page.
-------------------------------------------------------------------------- */

export type CommunityPhoto = {
  src: string;
  /** What the photograph shows, for a reader who cannot see it. */
  alt: string;
};

export type CommunityStory = {
  /** The last part of the URL: /community/<slug>. */
  slug: string;
  title: string;
  /** As printed, e.g. "01 Feb 2024". */
  date: string;
  /** The same day as YYYY-MM-DD. */
  iso: string;
  /** One line under the title on the cover, and the page's meta description. */
  summary: string;
  /** The write-up, a paragraph per entry. */
  body: string[];
  /**
   * The photographs, in reading order. The globe's flank hangs the same set in
   * an order of its own — see ELDERS_ORDER — but this is the order they were
   * meant to be read in, and the one the story page uses.
   */
  photos: CommunityPhoto[];
};

/** Where a story lives. One place, so nothing hard-codes the path. */
export const storyHref = (story: CommunityStory) => `/community/${story.slug}`;

export const THEAN_OON: CommunityStory = {
  slug: "thean-oon-senior-home",
  title: "Thean Oon Senior Home Visitation",
  date: "01 Feb 2024",
  iso: "2024-02-01",
  summary:
    "Twenty Sophic volunteers spent an afternoon at Thean Oon Senior Home, bringing food, music and company ahead of Chinese New Year.",
  body: [
    "As part of our commitment to community outreach and social responsibility, 20 of Sophic's volunteers visited Thean Oon Senior Home on February 1, 2024. Thean Oon Senior Home, a semi-charity-run senior home, has been around since 2014. They focus on caring for the elderly from low-income families who struggle to support their elders, with low charges that vary depending on the family's financial situation, and are assisted by NGOs with meals and pampers. The home's 10 workers currently take care of 80 elders ranging from 41 to 93 years of age, some with serious illnesses. With most being physically impaired and 15% being bedridden. Songs and cheer filled the air as we brought food and compassion, celebrating the coming of Chinese New Year, to the Thean Oon Senior Home.",
    "The visit began with volunteers serving food and drinks to each of the residents of the home. This was followed by a fun and easy sing-along session with the guitarist, starting with Chinese New Year songs to bring in the joy of the new year, before moving on to the songs of other languages to the elders' delight. The afternoon ended with the volunteers taking the opportunity to talk to and meet the elders. Making them feel heard and cared for. By working together and showing compassion, it not only grew our volunteers as people but strengthened their bonds to be a better team.",
  ],
  photos: [
    {
      src: "/images/Senior home 1.jpg",
      alt: "Volunteers in Sophic polo shirts standing with home staff behind a 'we care' banner, boxes of supplies and trays of food on the table in front of them.",
    },
    {
      src: "/images/senior home 5.jpg",
      alt: "Lunch being served from a long table lined with bowls and plates of fruit, residents waiting in chairs alongside it.",
    },
    {
      src: "/images/senior home 3.jpg",
      alt: "Volunteers gathered around a care bed in the home's front room while a member of staff talks them through it.",
    },
    {
      src: "/images/senior home 2.jpg",
      alt: "Volunteers crouched in among the residents for a group photograph in the hall, one of them holding a guitar.",
    },
    {
      src: "/images/senior home 4.jpg",
      alt: "A volunteer sitting beside a resident at a dining table, going through a printed chart with him page by page.",
    },
  ],
};

export const TZU_CHI: CommunityStory = {
  slug: "tzu-chi-recycle-centre",
  title: "Volunteer at Tzu Chi Environmental Protection & Recycle Centre",
  date: "24 Apr 2024",
  iso: "2024-04-24",
  summary:
    "Nineteen Sophic staff returned to the Tzu Chi Environmental Protection & Recycle Centre to sort recyclables and dig in a water tank for the garden.",
  body: [
    "On 24th April 2024, team Sophic (19 staffs) returned to volunteer for the 2nd time at Tzu Chi Environmental Protection & Recycle centre. This rewarding experience highlighted the ongoing commitment to promote recycling and waste reduction efforts and inspiring continued staff engagement in the environmental conservation initiatives now and into the future. We developed practical skills in sorting recyclable materials such as plastics, glass, paper, and metals. The segregated items based on their type and quality will facilitate efficient recycling processes.",
    "Besides that, we also utilized shovels, pick axes, and other digging tools to excavate a right size hole to enable the fitting of a big water tank to ease the storage of water at the ground level for use of the garden. This offered us a hands-on opportunity to contribute to green garden infrastructure development and provided a sustainable solution for water storage. Engaging in hands-on volunteering activities fostered a sense of friendship, trust and collaboration among our team member. We look forward to continuing our partnership with Tzu Chi and making even greater strides towards environmental sustainability together.",
  ],
  /* In the order the afternoon went: arriving, sorting, what the centre does
     with what it is given, then the digging and the garden it was for. */
  photos: [
    {
      src: "/images/recycle 1.jpg",
      alt: "The Sophic team in grey polo shirts grouped together for a photograph under the centre's Chinese environmental-protection sign.",
    },
    {
      src: "/images/recycle 5.jpg",
      alt: "Volunteers walking through the centre's sorting bays, past bulk sacks of collected material.",
    },
    {
      src: "/images/recycle 3.jpg",
      alt: "Volunteers seated around a table stripping small parts and sorting screws and fittings into glass jars.",
    },
    {
      src: "/images/recycle 6.jpg",
      alt: "The centre's display wall: posters against ocean plastic and single-use plastic, beside shelves of bottles packed tight with sorted plastic waste.",
    },
    {
      src: "/images/recycle 7.jpg",
      alt: "The centre's book room, its shelves filled end to end with donated Chinese-language books.",
    },
    {
      src: "/images/recycle 4.jpg",
      alt: "Volunteers with shovels standing around a freshly dug hole, the large black water tank waiting beside it.",
    },
    {
      src: "/images/recycle 2.jpg",
      alt: "Volunteers in the centre's garden under a shade net, beside a bench of white seedling pots.",
    },
  ],
};

export const CPR_AED: CommunityStory = {
  slug: "cpr-aed-lifesaver-course",
  title: "Program on CPR & AED",
  date: "11 Mar 2024",
  iso: "2024-03-11",
  summary:
    "St John Ambulance Pulau Pinang brought their two-hour CPR and AED lifesaver course to twenty Sophic staff at the PES SPICE office.",
  body: [
    "As part of our belief in upgrading our employees' knowledge in health sector, we invited St John Ambulance Pulau Pinang (SJAPP) to give their signature 2-hour CPR + AED lifesaver course to our 20 staffs located at Sophic PES SPICE office. The course covered fundamental aspects of CPR, including chest compressions, the use of AED devices and first aid technique for choking in theory by slides and video by Mr Ricky Chan from SJAPP. Ms Mei Jing and Ms Li Lynn from SJAPP provided hands-on training sessions for participants with practical experience in performing CPR techniques on mannequins. They guided individuals through the correct compression depth, rate, and hand placement, ensuring proficiency in delivering effective chest compressions.",
    "Every participant also received comprehensive instruction on AED operation, including how to keep calm and apply primary assessment (DRSABC). Practical demonstrations allowed all attendees to familiarize themselves with AED devices and gain confidence in their ability to use them in real-life scenarios. They also demonstrated practical method on what to do if someone is choking. Overall, we found the demonstration and practical session were very useful. The trainers from SJAPP had a good sense of humour as well as giving clear and sensible explanation to all the questions raised. We thank SJAPP for this key life saving practical training and the active participation from the Sophic team.",
  ],
  /* In the order the morning went: the room assembled, the theory, the
     trainers' demonstration, then the floor doing it themselves. */
  photos: [
    {
      src: "/images/aed 1.jpg",
      alt: "The Sophic team and the SJAPP trainers grouped together behind a 'we care' VoluntEARs Club banner, an AED trainer and a practice mannequin held among them.",
    },
    {
      src: "/images/aed 2.jpg",
      alt: "The theory session: an SJAPP trainer at the front of a room of seated staff, the screen beside him showing an air ambulance.",
    },
    {
      src: "/images/aed3.jpg",
      alt: "Two SJAPP trainers kneeling over a mannequin on the floor, one placing the AED pads while the other keeps up chest compressions.",
    },
    {
      src: "/images/aed4.jpg",
      alt: "Participants paired off across the floor of the room, each pair working on a mannequin with an AED trainer unit open beside it.",
    },
    {
      src: "/images/aed5.jpg",
      alt: "An SJAPP trainer watching as one participant fits a pocket mask over a mannequin's face and another keeps the compressions going.",
    },
  ],
};

/** Every visit with a page of its own. */
export const COMMUNITY_STORIES: CommunityStory[] = [
  THEAN_OON,
  TZU_CHI,
  CPR_AED,
];

export const findStory = (slug: string) =>
  COMMUNITY_STORIES.find((story) => story.slug === slug);

/**
 * Hangs six frames from one story.
 *
 * `order` is six indices into the story's own photographs, so the pictures and
 * their alt text stay in one place and this only decides where they go. Always
 * six, and that is not negotiable from here: the flanks are three frames each
 * and the stack has to overrun the window for the bottom frame to be cut, which
 * is the whole mechanic. A story with five photographs therefore repeats one; a
 * story with seven leaves one out, and the one left out still appears on the
 * story's own page.
 *
 * Every frame carries the same caption, built from the story's own title and
 * date rather than a second copy of them, so the line over a frame and the
 * heading on the page it leads to cannot drift apart.
 */
function flankFrom(story: CommunityStory, order: number[]): CommunitySlot[] {
  const caption: CommunityCaption = {
    place: story.title,
    date: story.date,
    iso: story.iso,
  };

  return order.map((n, frame) => ({
    kind: "photo",
    src: story.photos[n].src,
    alt: story.photos[n].alt,
    caption,
    /* Only the first frame — top of the left flank — is a way in. See the note
       on CommunitySlot.href. */
    href: frame === 0 ? storyHref(story) : undefined,
  }));
}

/**
 * Five photographs in six frames, so the group shot appears twice — first on
 * the left and last on the right: opposite sides of the screen, and opposite
 * ends of the travel, which is as far apart as two frames in this layout can
 * be. A sixth photograph added to the story retires the duplicate; change the
 * last entry to 5 and nothing else.
 */
const ELDERS_PHOTOS = flankFrom(THEAN_OON, [0, 4, 2, 1, 3, 0]);

/**
 * Seven photographs and six frames, so one stays off the wall: the shot of the
 * team walking in, which is the only one of the seven that is mostly backs of
 * heads and so the only one that loses nothing by not being hung at this size.
 * It is still the second picture on the story's own page.
 */
const PLANET_PHOTOS = flankFrom(TZU_CHI, [0, 5, 2, 3, 6, 4]);

/**
 * Five photographs in six frames again, and handled the way the elders visit
 * handles it: the group shot opens the left flank and closes the right, as far
 * apart as this layout can put two frames. A sixth photograph retires the
 * duplicate; change the last entry and nothing else.
 */
const LIFE_PHOTOS = flankFrom(CPR_AED, [0, 2, 4, 1, 3, 0]);

/**
 * A scene on the globe.
 *
 * `name` and `line` are the caption under the stage; `alt` is what the picture
 * says to somebody who cannot see it, and is written to describe the drawing
 * rather than to repeat the caption above it.
 */
export type CommunityScene = {
  slug: string;
  /**
   * Neither of these is drawn on the moving stage — that carries the artwork and
   * nothing else. They are the whole of the plain reading further down this
   * file's component, they feed the search index, and they are what a screen
   * reader is given for the section.
   */
  name: string;
  line: string;
  src: string;
  alt: string;
  /** Native pixel size of the file, for next/image. */
  width: number;
  height: number;
  /**
   * The six frames flanking the globe — the first three go down the left, the
   * rest down the right. Empty on the opening scene, which is the globe on its
   * own at full size and nothing else.
   */
  photos: CommunitySlot[];
  /**
   * The clip the scene is built around, projected at the centre of the stage.
   * Absent on the opening scene, which is the world on its own.
   */
  feature?: CommunitySlot;
  /**
   * The field this scene stands in — full bleed, behind everything in it, and
   * the thing the rest of the scene falls into when the scene changes.
   *
   * Trimmed from the supplied `transition N.png`. Those are A4-shaped pages
   * with the artwork sitting in the middle of a transparent sheet, so most of
   * each file is nothing; the bounds used are the opaque box read off each
   * file's alpha channel rather than eyeballed:
   *
   *   1   854x569 at (329, 570)
   *   2   891x596 at (251, 410)
   *   3   764x510 at (290, 585)
   *
   * Absent on the opening scene, which stands in the page's own sky.
   */
  bg?: string;
  /**
   * Where the globe sits inside this drawing, as a multiple of the globe's own
   * diameter. See GLOBE_GEOMETRY below — these three numbers are what let four
   * differently-cropped files be laid over one another on the same sphere.
   */
  art: { w: number; cx: number; cy: number };
};

/**
 * The globe, measured.
 *
 * The four drawings are crops of the same sphere at two distances, and the
 * whole scroll sequence depends on knowing exactly where that sphere is in each
 * file. Laying them out by eye does not survive the first person who nudges a
 * margin: the horizon jumps by a few pixels between scenes and the illusion —
 * one world, turning — goes with it.
 *
 * So the circle was fitted rather than guessed. The top edge of each arc was
 * sampled column by column and a least-squares circle fitted through it, with
 * the middle third excluded because that is where the figure stands and it
 * would drag the fit off the arc it is standing on. The three close-ups came
 * back as the same circle to within a tenth of a pixel — centre x 355.45,
 * radius 293.40 — which is the fact this whole component is built on. Only the
 * vertical offset differs between them, because each file is cropped to its own
 * figure's height. The wide globe is a different, smaller circle: centre
 * (335.02, 282.21), radius 221.82 in a 610-wide file.
 *
 * Every number below is that measurement divided by the circle's *diameter*, so
 * it can be multiplied by whatever diameter the stage is currently drawing at:
 *
 *   w  — the file's width
 *   cx — the globe's centre, from the file's left edge
 *   cy — the globe's centre, from the file's top edge
 *
 * The stylesheet does the multiplying. Re-measure if any of the four files is
 * ever re-exported, and note that the three close-ups deliberately share one
 * `w` and one `cx`: they are the same circle, and letting a tenth of a pixel of
 * fitting noise separate them is how the horizon would come to shift as the
 * scenes change.
 */
const CLOSE_UP = { w: 1.191207, cx: 0.605743 };

export const COMMUNITY_SCENES: CommunityScene[] = [
  {
    slug: "world",
    name: "One world",
    line: "The whole of it, and every part we are standing on together.",
    // Nothing beside it and nothing under it. This scene is the whole world at
    // the size of the screen, and anything else on it is in the way.
    photos: [],
    src: "/images/Rotating earth.png",
    alt: "A globe seen from space with small scenes standing around its edge — a school, a tree, a wheelchair, a heart, a teacher at a board, clasped hands.",
    width: 610,
    height: 567,
    art: { w: 1.375, cx: 0.755164, cy: 0.636125 },
  },
  {
    slug: "elders",
    name: "Our elders",
    line: "The generation that built what the rest of us are standing on.",
    photos: ELDERS_PHOTOS,
    feature: { kind: "video" },
    bg: "/images/community-bg-elders.webp",
    src: "/images/Transition 1 (elderly).png",
    alt: "Close on the curve of the globe: an older man in a wheelchair at the top, one arm raised.",
    width: 699,
    height: 559,
    art: { ...CLOSE_UP, cy: 0.598755 },
  },
  {
    slug: "planet",
    name: "Our planet",
    line: "The only ground any of this is happening on.",
    photos: PLANET_PHOTOS,
    feature: { kind: "video" },
    bg: "/images/community-bg-planet.webp",
    src: "/images/Transition 2 (recycle).png",
    alt: "Close on the curve of the globe: a tree standing at the top holding a recycling sign.",
    width: 699,
    height: 232,
    art: { ...CLOSE_UP, cy: 0.610259 },
  },
  {
    slug: "life",
    name: "Our neighbours",
    line: "The training that means somebody nearby knows what to do.",
    photos: LIFE_PHOTOS,
    feature: { kind: "video" },
    bg: "/images/community-bg-life.webp",
    src: "/images/Transition 3 (cpr).png",
    alt: "Close on the curve of the globe: a heart at the top with a pulse trace across it.",
    width: 699,
    height: 420,
    art: { ...CLOSE_UP, cy: 0.546557 },
  },
];
