import type { PartnerGlyphName } from "@/components/partners/PartnerGlyph";

/**
 * The partners page.
 *
 * The brief gives this page one piece of copy — the header statement — and
 * nothing else. It arrives as two sentences and is set as two: the first is
 * six words and carries the idea, so it takes the headline; the second names
 * who "we" means, so it reads under it as the lead. Nothing has been added to
 * bridge them, and nothing invented to fill the page out.
 *
 * One character is not verbatim. The brief spells it "sucess"; it is set here
 * as "success". That is a misspelling in a line of display type, not a house
 * style, and the rest of the sentence — "In I4.0 journey", the comma splice
 * before "this includes" — is left exactly as written, because that is voice
 * rather than error.
 */
export const PARTNERS_HERO = {
  /** Sits above the headline as a tracked label, the way "About us" does on
   *  the company cover. It is the page's own name rather than a claim. */
  eyebrow: "Partners",
  headline: "In I4.0 journey, we're not alone.",
  lead: "We need partners to make it a success, this includes our customers, principals and you.",
};

/**
 * "Partner with Sophic", verbatim.
 *
 * Every string below is transcribed exactly, including "End-To-End Support"
 * with its capital T — the other four titles capitalise every word too, so it
 * is house style rather than a slip, and it is not this file's job to decide
 * that either way.
 *
 * The second paragraph names all five pillars in order, in a sentence, before
 * the reader meets them as five discs. Which is the whole reason the two are
 * one section: the paragraph is the sentence and the row underneath is that
 * sentence taken apart.
 */
export type PartnerPillar = {
  name: string;
  icon: PartnerGlyphName;
  /**
   * Shown in the board's panel when this pillar is the active one.
   *
   * Verbatim, and left in the first person the brief writes it in — these
   * paragraphs slide between "we" meaning Sophic and "we" meaning both parties
   * ("committed to working with us to achieve our strategic goals"), which
   * reads as the voice of the partnership rather than of the vendor. Fixing
   * that would be rewriting, not correcting.
   */
  detail: string;
};

export const PARTNER_WITH_SOPHIC = {
  heading: "Partner with Sophic",
  paragraphs: [
    "As your trusted partner, we are committed to strong partnerships and collaborating with you every step of the way to achieve your goals.",
    "We believe that strategic alignment, end-to-end support, co-creation and innovation, shared expertise, and an agile and adaptive approach are the cornerstones of successful partnerships in the digital transformation age.",
  ],
  pillars: [
    {
      name: "Strategic Alignment",
      icon: "alignment",
      detail:
        "Our partnership is committed to working with us to achieve our strategic goals. We have a deep understanding of our business and our industry, and together, we are able to provide great insights and recommendations that help us to stay ahead of the curve.",
    },
    {
      name: "End-To-End Support",
      icon: "support",
      detail:
        "As your partner, we are committed to providing comprehensive support throughout your Industry 4.0 journey. From strategy development and solution design to implementation and post-deployment support, we are with you at every stage. Our dedicated team is always available to address your concerns, answer your questions, and provide guidance to ensure a seamless and successful transformation.",
    },
    {
      name: "Co-Creation & Innovation",
      icon: "co-creation",
      detail:
        "Our partnership is not just as a vendor. We are a partner who works together to co-create solutions that meet specific needs. We are not afraid to challenge our assumptions, which helps us think outside the box. This co-creation approach has helped us develop innovative solutions that have transformed our business.",
    },
    {
      name: "Shared Expertise",
      icon: "expertise",
      detail:
        "Our partnership brings a wealth of expertise to the table. We have a team of experienced consultants who are experts in digital transformation, cloud computing, data analytics, and other areas. This expertise allows us to accelerate our transformation journey and achieve our goals more quickly.",
    },
    {
      name: "Agile & Adaptive Approach",
      icon: "agile",
      detail:
        "Industry 4.0 demands agility and adaptability. Our partnership embraces these principles. We work with you in an iterative and flexible manner, continuously evaluating and refining our strategies and solutions. By staying agile, we ensure that we can quickly respond to changing market dynamics, technological advancements, and evolving business needs.",
    },
  ] satisfies PartnerPillar[],
};

/* --- The partner network ------------------------------------------------- */

export type PartnerLogo = {
  /** The company, as it is written. Also the alt text, and the tile's face
   *  when there is no logo file yet. */
  name: string;
  /**
   * The company's own site. Absent leaves the tile inert rather than guessing.
   *
   * Every one of these was checked by fetching it and confirming the page
   * names the company — a 200 proves nothing on its own, since parked and
   * squatted domains answer too. Four are deliberately missing: see the note
   * on PARTNER_NETWORK.
   */
  href?: string;
  /**
   * Path under /images. Absent means the tile falls back to the name.
   *
   * No dimensions here, deliberately. Every file is written to one canvas —
   * PARTNER_LOGO_BOX below — with its own artwork trimmed to its ink and fitted
   * inside, so the tile renders exactly the same box whichever logo is in it.
   * A per-logo size is the thing that makes a wall of these look uneven, and
   * leaving the field out means it cannot come back by accident.
   */
  logo?: string;
};

/**
 * The canvas every logo is normalised onto.
 *
 * Its proportion is the tile's, not an average of the logos'. A hexagon's
 * straight-sided middle is the only part of it that is full width, and with
 * this tile's padding that usable box works out near 1.9:1 — so a canvas cut
 * to the same shape lands every mark as large as the tile can hold. An earlier
 * 2.4:1 canvas left a band of empty space above and below each logo and made
 * the squarer marks, the Intel badge worst of all, render a third smaller than
 * they needed to.
 */
export const PARTNER_LOGO_BOX = { width: 480, height: 280 };

export type PartnerGroup = {
  slug: string;
  label: string;
  /** The honeycomb, one array per row. */
  rows: PartnerLogo[][];
  /**
   * Where each row starts, in half-tiles, for the groups that lie on their
   * side. One entry per row; omit the field entirely and the rows are simply
   * centred.
   *
   * Centred rows are always symmetric about the vertical axis, so a group can
   * only come to a point at the top or the bottom — which is all the pyramid
   * below Sophic needs. A group that points *sideways* has to place its rows
   * itself.
   *
   * The one rule these have to keep: consecutive rows must differ by an odd
   * number. Pointy-top hexagons tessellate by rows offset half a tile, so two
   * rows an even number apart sit directly above one another and overlap.
   */
  shifts?: number[];
};

/**
 * The partners, in the three groups the brief supplies, in the order given.
 *
 * All twenty-six have a logo. The name-only tile the type still allows is kept
 * for the next partner who arrives before their artwork does — it renders the
 * company written out, on a tile tinted a shade off white, which is a normal
 * way to list a partner and cannot be mistaken for their mark.
 *
 * Every logo is normalised onto PARTNER_LOGO_BOX before it reaches this file —
 * trimmed to its own ink, then fitted into one canvas — so no tile is
 * optically larger than its neighbours and none of them carry a size.
 *
 * Twenty-two of the twenty-six link to the company's own site. Each was checked
 * by fetching it and confirming the page names the company, because a 200 on
 * its own proves nothing — parked domains answer too.
 *
 * Four deliberately do not link, and should stay that way until someone who
 * knows the relationship supplies the address:
 *
 *   ADVO       advo.com.my does not resolve. advotech.com.my is a live
 *              automation distributor, but the mark here reads ADVO, not
 *              Advotech, and they are not evidently the same company.
 *   MEX        mex.com.my resolves — to Maju Expressway, a toll road operator.
 *              Plainly not an automation ecosystem body.
 *   MiSi 4.0   misi.my answers but serves no readable content, so there is
 *              nothing to confirm it is this MiSi.
 *   SafeGuard  safeguard.com.my is "Safeguard Equipment Traders", a safety
 *              equipment supplier. Possible, but it does not obviously belong
 *              in a group of IoT device makers.
 *
 * A wrong link on a partner page sends a reader to a stranger under the
 * partner's name, which is worse than a tile that does nothing.
 */
export const PARTNER_NETWORK = {
  /** Never rendered visibly. The groups carry the headings a reader sees; this
   *  is here so the section has a name in the document outline, the way the
   *  home page's awards section does. */
  heading: "Our partner network",
  centre: {
    name: "Sophic Automation",
    logo: "/images/sophic-logo-light.png",
    width: 480,
    height: 267,
  },
  groups: [
    {
      slug: "things-of-internet",
      label: "Things of Internet",
      // A pyramid, widening by one a row, with Sophic's own tile as its apex —
      // the two at the top sit under it and everything below fans out from
      // there. Fourteen partners is exactly 2 + 3 + 4 + 5, so the shape takes
      // the whole group with nothing left over and no row half empty.
      rows: [
        [
          { name: "ADVFIT", logo: "/images/logo-advfit-color.webp", href: "https://www.advfit.com/" },
          { name: "Beckhoff", logo: "/images/logo-beckhoff-color.webp", href: "https://www.beckhoff.com/" },
        ],
        [
          { name: "Han's Laser", logo: "/images/logo-hanslaser-color.webp", href: "https://www.hanslaser.com/" },
          { name: "Monnit", logo: "/images/logo-monnit-color.webp", href: "https://www.monnit.com/" },
          // No href — could not be identified. See the note on PARTNER_NETWORK.
          { name: "ADVO", logo: "/images/logo-advo-color.webp" },
        ],
        [
          { name: "Indpro", logo: "/images/logo-indpro-color.webp", href: "https://www.indpro.com.my/" },
          { name: "RealWear", logo: "/images/logo-realwear-color.webp", href: "https://www.realwear.com/" },
          { name: "iPlusMobot", logo: "/images/logo-iplusmobot-color.webp", href: "https://www.iplusmobot.com/" },
          { name: "JAKA", logo: "/images/logo-jaka-color.webp", href: "https://www.jaka.com/" },
        ],
        [
          // Soft Robot Tech of Beijing, who make the soft grippers — not one of
          // the several unrelated firms also trading as "SRT".
          { name: "SRT", logo: "/images/logo-srt-color.webp", href: "https://www.softrobottech.com/web/en/" },
          { name: "Zebra", logo: "/images/logo-zebra-color.webp", href: "https://www.zebra.com/" },
          { name: "Doog", logo: "/images/logo-doog-color.webp", href: "https://doog-inc.com/" },
          { name: "Keyence", logo: "/images/logo-keyence-color.webp", href: "https://www.keyence.com/" },
          // No href — could not be identified. See the note on PARTNER_NETWORK.
          { name: "SafeGuard", logo: "/images/logo-safeguard-color.webp" },
        ],
      ],
    },
    {
      slug: "ot2it-cloud-and-apps",
      label: "OT2IT, Cloud and Apps",
      // The same pyramid on its side, apex pointing back at Sophic: the middle
      // row reaches a tile and a half further left than the two around it, and
      // the group is pushed up against Sophic so that reach lands on it.
      rows: [
        [{ name: "Dell Technologies", logo: "/images/logo-dell-color.webp", href: "https://www.dell.com/" }],
        [
          { name: "AWS", logo: "/images/logo-aws-color.webp", href: "https://aws.amazon.com/" },
          { name: "Exiatec Solutions", logo: "/images/logo-exiatec-color.webp", href: "https://exiatec.com/" },
        ],
        [{ name: "Siemens", logo: "/images/logo-siemens-color.webp", href: "https://www.siemens.com/" }],
      ],
      shifts: [3, 0, 3],
    },
    {
      slug: "ecosystem-liaisons",
      label: "Ecosystem Liaisons",
      // Lying down the other way, apex pointing right at Sophic. Eight is
      // 2 + 4 + 2, and the middle row is set half a tile left of the other two
      // so its extra length is spent entirely on the side facing Sophic.
      rows: [
        [
          // The gold "Intel Partner — Gold, IoT Solutions" badge, which is what
          // the brief shows, rather than the plain corporate mark the home
          // page's client strip carries.
          {
            name: "Intel Partner — Gold, IoT Solutions",
            logo: "/images/logo-intel-color.webp",
            href: "https://www.intel.com/",
          },
          // No href — could not be identified. See the note on PARTNER_NETWORK.
          { name: "MiSi 4.0", logo: "/images/logo-misi-color.webp" },
        ],
        [
          // No href — could not be identified. See the note on PARTNER_NETWORK.
          { name: "MEX", logo: "/images/logo-mex-color.webp" },
          { name: "PSDC", logo: "/images/logo-psdc-color.webp", href: "https://psdc.org.my/" },
          { name: "NSCB Systems", logo: "/images/logo-nscb-color.webp", href: "https://nscb.com.my/" },
          { name: "MTDC", logo: "/images/logo-mtdc-color.webp", href: "https://www.mtdc.com.my/" },
        ],
        [
          { name: "MDEC", logo: "/images/logo-mdec-color.webp", href: "https://mdec.my/" },
          { name: "MSIA", logo: "/images/logo-msia-color.webp", href: "https://msia.org.my/" },
        ],
      ],
      // Normalised so the smallest is zero. Shifts are the row's left edge, so
      // a set that never reaches zero leaves a strip of empty box down the
      // group's left side — width the layout pays for and the reader only sees
      // as a gap.
      shifts: [1, 0, 1],
    },
  ] satisfies PartnerGroup[],
};
