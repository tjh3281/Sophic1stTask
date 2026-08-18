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
 * A frame waiting for a photograph or a clip.
 *
 * Empty on purpose. The brief has no media for this page yet, so these are the
 * frames it will arrive into rather than stand-ins pulled from elsewhere on the
 * site — a careers photograph captioned as community work would be a small lie
 * that nobody would ever go back and correct.
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
};

/** Six flanking frames per visit: three down the left, three down the right. */
const FLANK: CommunitySlot[] = Array.from({ length: 6 }, () => ({
  kind: "photo",
}));

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
    photos: FLANK,
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
    photos: FLANK,
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
    photos: FLANK,
    feature: { kind: "video" },
    bg: "/images/community-bg-life.webp",
    src: "/images/Transition 3 (cpr).png",
    alt: "Close on the curve of the globe: a heart at the top with a pulse trace across it.",
    width: 699,
    height: 420,
    art: { ...CLOSE_UP, cy: 0.546557 },
  },
];
