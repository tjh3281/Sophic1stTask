"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, type CSSProperties } from "react";
import { Reveal } from "@/components/ui/Reveal";
import {
  PARTNER_LOGO_BOX,
  PARTNER_NETWORK,
  type PartnerLogo,
} from "@/lib/partners";
import "./PartnerNetwork.css";

/**
 * The partner network, as a system in orbit around Sophic.
 *
 * Sophic is the centre and the three groups are three tracks around it, ordered
 * by how many partners are in them: OT2IT, Cloud and Apps has four and takes the
 * innermost, Ecosystem Liaisons has eight and takes the middle, Things of
 * Internet has fourteen and takes the outermost — which it needs, because
 * fourteen tiles want a long way round to sit on without touching. The radii are
 * chosen from those counts rather than from rank, the same way the old wall put
 * the biggest group underneath for the same reason.
 *
 * The tiles are the hexagons they always were. Nothing about the tile itself has
 * changed — the mask, the shadow, the logo box, the entrance — only where they
 * stand and the fact that they no longer stand still.
 *
 * Everything turns, slowly, and the inner tracks turn faster than the outer
 * ones. That is not decoration for its own sake: a ring of evenly spaced tiles
 * all moving at the same angular rate reads as a wheel, and three wheels at
 * different rates read as a system. A full turn of the innermost takes just
 * under two minutes and the outermost a little over four, which is slow enough
 * that nothing is ever chasing the reader's eye.
 *
 * The pointer tips the whole system. See the note on `follow` below.
 */

/* --- The tracks -------------------------------------------------------------
   Radius and period per group. Radii are multiples of a tile's width, so the
   system scales as one thing — change --hex-w in the stylesheet and every orbit
   follows it rather than the tiles growing into each other.

   `depth` is how far this track slides when the pointer moves: the outer one
   moves most. That is what turns a flat diagram into something with front and
   back, and it is the reason the three are not simply tipped together.
-------------------------------------------------------------------------- */

type Orbit = {
  slug: string;
  /** In tile widths, to the centre of the tiles standing on it. */
  radius: number;
  /** Seconds for one full turn. */
  period: number;
  /** Where on the track the first tile stands, in degrees clockwise from the
   *  top. Different per ring so the three do not line up into spokes. */
  from: number;
  /**
   * Which way this track's label comes in from, in the same degrees.
   *
   * Three different bearings on purpose. The labels all end up on one circle
   * just outside the system, so each one's leader is a different length — long
   * for the innermost, short for the outermost — and it is that difference,
   * read together with the colour, that says which ring a name belongs to. Put
   * them all on one side and they become a key that has to be cross-referenced
   * instead of a label that points.
   */
  label: number;
  /** How strongly this track answers the pointer, 0 to 1. */
  depth: number;
  /** The dashes of the track and the rule under its label, which are the same
   *  value on purpose — it is the whole of the mapping between a name in the
   *  key and a ring on the stage. */
  tint: string;
};

const ORBITS: readonly Orbit[] = [
  {
    slug: "ot2it-cloud-and-apps",
    radius: 1.85,
    period: 104,
    // On the diagonals, not at twelve, three, six and nine o'clock. A hexagon is
    // taller than it is wide, so a tile parked directly above the middle is the
    // one thing standing between Sophic's own tile and being any bigger — moved
    // a corner round, the nearest of the four is off to the side where the
    // stretch has already pushed it clear.
    from: 45,
    depth: 0.34,
    tint: "#0b3a63",
    label: 302,
  },
  {
    slug: "ecosystem-liaisons",
    radius: 2.66,
    period: 168,
    from: 22,
    depth: 0.66,
    tint: "#1d8fa0",
    label: 48,
  },
  {
    slug: "things-of-internet",
    radius: 3.58,
    period: 252,
    from: 11,
    depth: 1,
    tint: "#5b83b0",
    // Out to the side rather than under the system. Straight down put the name
    // below the whole diagram, where it read as a caption for all three rings
    // instead of a label on one — and it was the furthest thing on the page
    // from the track it belongs to.
    label: 112,
  },
];

/**
 * Each track paired with its group and the partners standing on it.
 *
 * Resolved once at module scope rather than during render, and thrown rather
 * than skipped: a group renamed in lib/partners should fail the build, not
 * quietly leave a ring empty.
 */
const RINGS = ORBITS.map((orbit) => {
  const group = PARTNER_NETWORK.groups.find((one) => one.slug === orbit.slug);
  if (!group) {
    throw new Error(`No partner group "${orbit.slug}" to put in orbit`);
  }
  return { orbit, group, partners: group.rows.flat() };
});

/** The measurements a track hands down to the stylesheet. Written once and used
 *  by both layers below, so the drawn ring and the tiles standing on it cannot
 *  drift apart. */
const ringVars = (orbit: Orbit) =>
  ({
    "--radius": `calc(var(--hex-w) * ${orbit.radius})`,
    "--period": `${orbit.period}s`,
    "--depth": orbit.depth,
    "--track": orbit.tint,
    "--label-angle": `${orbit.label}deg`,
  }) as CSSProperties;

/* --- The build --------------------------------------------------------------
   The system assembles from the middle out when it scrolls into view: Sophic,
   then the inner track, then the next. Same pace and the same pop the wall
   used — only the order is new, and it is the order the diagram is read in.
-------------------------------------------------------------------------- */

/** Between one tile arriving and the next. */
const TILE_STEP = 60;

/** The beat after Sophic lands before the first partner does — long enough to
 *  read as "and then the rest" rather than Sophic being merely the first of
 *  twenty-seven. */
const AFTER_SOPHIC = 300;

/* --- Answering the pointer --------------------------------------------------
   The disc flattens towards the cursor, and the tracks slide by different
   amounts underneath it.

   Two things happen and they are doing different jobs. The squash is what turns
   the circular tracks into ellipses, so the system reads as a disc being tipped
   rather than a picture being nudged. The slide is per-track and proportional to
   `depth`, so the outer ring travels furthest and the middle one lags it — the
   parallax that says the three are at different distances rather than printed on
   one sheet. It is also the half that carries the *direction*: a squash is the
   same whichever way a disc tips, and the slide is what says which way.

   Both are plain 2-D. That is a correctness requirement, not a preference. This
   was a real 3-D rotation with a perspective on it, which looked better and was
   unshippable: inside a `preserve-3d` context the browser paints siblings in
   depth order rather than document order, and it takes that depth from each
   element's *origin*. A leader is one long element sorted as a single point, so
   a tile on the far side of the tilt sorted behind a leader whose origin sat on
   the near side, and the line drew straight over the logo. Nothing about the
   markup order can fix that — the ordering is simply not consulted. Flat, it
   always is.

   The tiles take neither. Every one of them cancels the squash and the turn of
   its own track, so a logo is always square to the reader and the right way up
   however far round it has travelled. Without that the marks stretch and tumble
   as they orbit.
-------------------------------------------------------------------------- */

/** How far the disc flattens, as a fraction, at the very edge of the section.
 *  Kept small: past about a tenth the hexagons on a track start visibly
 *  disagreeing with the circle they are standing on. */
const SQUASH = 0.09;

/** How far the outermost track slides, in pixels, at the edge of the section. */
const SLIDE = 30;

/** Fraction of the remaining distance covered each frame. Low, so the system
 *  answers a flick of the mouse with a long glide rather than snapping to it —
 *  the same weight the page's momentum scrolling has. */
const EASE = 0.06;

export function PartnerNetwork() {
  const stageRef = useRef<HTMLDivElement>(null);

  /** Where the pointer is asking the system to be, and where it currently is.
   *  Both normalised to -1..1 across the section; the stylesheet turns them
   *  into a squash and a slide. */
  const wantRef = useRef({ x: 0, y: 0 });
  const atRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);
  const runningRef = useRef(false);

  /**
   * The glide. Writes the two custom properties the stylesheet reads and stops
   * itself once there is nothing left to travel — a rAF that runs forever to
   * write the same two numbers is a page that never lets the CPU idle.
   */
  const glide = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const want = wantRef.current;
    const at = atRef.current;
    at.x += (want.x - at.x) * EASE;
    at.y += (want.y - at.y) * EASE;

    // Magnitude, not sign: a disc tipping left and one tipping right flatten by
    // exactly the same amount. Which way it went is the slide's job.
    stage.style.setProperty(
      "--squash-x",
      (1 - SQUASH * Math.abs(at.x)).toFixed(4),
    );
    stage.style.setProperty(
      "--squash-y",
      (1 - SQUASH * Math.abs(at.y)).toFixed(4),
    );
    stage.style.setProperty("--slide-x", `${(at.x * SLIDE).toFixed(2)}px`);
    stage.style.setProperty("--slide-y", `${(at.y * SLIDE).toFixed(2)}px`);

    if (Math.abs(want.x - at.x) < 0.0005 && Math.abs(want.y - at.y) < 0.0005) {
      at.x = want.x;
      at.y = want.y;
      runningRef.current = false;
      return;
    }

    frameRef.current = requestAnimationFrame(glide);
  }, []);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    frameRef.current = requestAnimationFrame(glide);
  }, [glide]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // A reader who asked for less motion gets the diagram and none of this: the
    // orbits are stopped in the stylesheet, and a system that still tipped under
    // the cursor would be the same motion arriving by another route.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const follow = (event: PointerEvent) => {
      const box = stage.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;
      const nx = (event.clientX - (box.left + box.width / 2)) / (box.width / 2);
      const ny = (event.clientY - (box.top + box.height / 2)) / (box.height / 2);
      wantRef.current = {
        x: Math.max(-1, Math.min(1, nx)),
        y: Math.max(-1, Math.min(1, ny)),
      };
      start();
    };

    const release = () => {
      wantRef.current = { x: 0, y: 0 };
      start();
    };

    // Listened for on the window rather than the section. The system is a disc
    // seen from above and the reader is looking down at it — the interesting
    // part of the movement is the approach, and a listener that only wakes once
    // the cursor is already inside means the tip is always caught halfway.
    // Coarse pointers are left out entirely: a touch is a tap, there is no
    // hovering to answer, and binding this would only cost battery.
    const fine = window.matchMedia("(pointer: fine)");
    if (!fine.matches) return;

    window.addEventListener("pointermove", follow, { passive: true });
    window.addEventListener("pointerleave", release);
    document.addEventListener("pointerleave", release);

    return () => {
      window.removeEventListener("pointermove", follow);
      window.removeEventListener("pointerleave", release);
      document.removeEventListener("pointerleave", release);
      cancelAnimationFrame(frameRef.current);
      runningRef.current = false;
    };
  }, [start]);

  // The tiles, in the order they arrive: innermost track first. Counted here
  // rather than in the markup so the delay a tile is handed is its place in the
  // whole sequence and not its place in its own group.
  let arriving = 0;

  return (
    // Light, and the only light band on this page. The system is twenty-six
    // white hexagons: on the near-black the sections above use, twenty-six white
    // shapes are twenty-six lamps and the logos stop being a list and become a
    // glare. On a pale ground they are paper on a table, which is also what lets
    // the shadows under them read as height.
    // The wide layout's padding is tight on purpose, and it is the opposite of
    // the usual arrangement: every rem here is a rem off the stage's height
    // budget, and on most windows that budget is what caps the size of every
    // logo on the page. Stacked, there is no such trade — the section simply
    // runs down the page — so below lg it takes the spacing the rest of the site
    // uses.
    <section className="partner-net pb-20 pt-14 sm:pb-24 sm:pt-16 lg:pb-8 lg:pt-6">
      <div className="partner-net__frame">
        <h2 className="sr-only">{PARTNER_NETWORK.heading}</h2>

        {/* Reveal is the trigger and nothing else. It writes the attribute the
            build keys off when the system arrives, and its own fade is turned
            off in the stylesheet — twenty-seven tiles fading in behind one
            block-wide fade is the same entrance played twice, and the tiles are
            the version worth watching. `once`, because a system that rebuilds
            itself every time you scroll back to it is a loop rather than an
            arrival. */}
        <Reveal once>
          <div ref={stageRef} className="partner-net__galaxy">
            {/* The plane everything is drawn on, and the only thing the squash
                is applied to. */}
            <div className="partner-net__disc">
              {/* --- Everything that is drawn under the logos ---------------
                  Every track and every leader, for all three rings, in one
                  layer ahead of every tile.

                  This layer exists for the painting order and nothing else.
                  Members of a 3-D layer are painted in document order, so
                  "first" means "underneath" — and putting all of them first
                  makes a tile cover a line by construction rather than by
                  luck. It held when each leader lived inside its own ring
                  too, but only because a leader happens to run outward past
                  rings that come later in the document; change a bearing,
                  swap two radii, or let the pointer's parallax slide one ring
                  further than its neighbour, and that arrangement quietly
                  stops being true. Here it cannot. */}
              <div aria-hidden="true" className="partner-net__rails">
                {RINGS.map(({ orbit }) => (
                  <div
                    key={orbit.slug}
                    className="partner-net__rail"
                    style={ringVars(orbit)}
                  >
                    {/* The track: a drawn circle, holding still while the tiles
                        travel along it. Outside the turning layer for exactly
                        that reason — a dashed ring that rotated with its own
                        tiles would say the track was moving and the partners
                        were not. */}
                    <div className="partner-net__track" />

                    {/* The straight line from this ring out to its name, with a
                        filled dot where it lands on the track and the far end
                        exactly where the title is anchored. */}
                    <div className="partner-net__leader">
                      <div className="partner-net__leader-dot" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Sophic, under the tracks' tiles rather than over them.
                  A ring turns, so `from` only decides where its tiles *start* —
                  every one of them passes over the middle sooner or later, and
                  the innermost track runs close enough that a tile's lower point
                  reaches into the corner of this one. Painted last it would take
                  a bite out of whichever logo happened to be overhead; painted
                  first the tile passes in front instead, across a corner of dark
                  navy that carries nothing. The mark itself is never touched —
                  it sits in the middle 38% of the tile and the nearest a partner
                  gets is twice that out. */}
              <div className="partner-net__core">
                <div className="partner-net__cell partner-net__cell--centre">
                  <div className="partner-net__tile partner-net__tile--centre">
                    <Image
                      src={PARTNER_NETWORK.centre.logo}
                      alt={PARTNER_NETWORK.centre.name}
                      width={PARTNER_NETWORK.centre.width}
                      height={PARTNER_NETWORK.centre.height}
                      sizes="(min-width: 64rem) 20rem, 11rem"
                    />
                  </div>
                </div>
              </div>

              {RINGS.map(({ orbit, group, partners }) => {
                const step = 360 / partners.length;

                return (
                  <div
                    key={orbit.slug}
                    className="partner-net__orbit"
                    data-slug={orbit.slug}
                    style={ringVars(orbit)}
                  >
                    <div className="partner-net__ring">
                      {partners.map((partner, index) => {
                        const angle = orbit.from + index * step;
                        const delay = AFTER_SOPHIC + arriving * TILE_STEP;
                        arriving += 1;

                        return (
                          <div
                            key={partner.name}
                            className="partner-net__slot"
                            style={
                              { "--angle": `${angle}deg` } as CSSProperties
                            }
                          >
                            {/* Cancels the turn of the track and the squash of
                                the disc, so the tile inside keeps its own shape
                                and heading wherever it has travelled to. */}
                            <div className="partner-net__orbiter">
                              <Tile partner={partner} delay={delay} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* The title, hung on the far end of its own leader. It
                        stays with the tiles rather than going down into the
                        layer under them, because a name is the one thing here
                        that must never be occluded — and standing outside the
                        outermost track, it never has a tile over it anyway. */}
                    <div className="partner-net__lead">
                      <div className="partner-net__lead-end">
                        <h3 className="partner-net__label">{group.label}</h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * One partner.
 *
 * A logo when there is a file, the company's name when there is not. The name
 * is not a stand-in drawing of a logo — it is the company written out, which is
 * a normal way to list a partner and cannot be mistaken for their mark.
 *
 * Every logo is the same file size on the same canvas, so this passes one pair
 * of dimensions for all of them. That is what makes the system even: the tile
 * gives each image an identical box, and the artwork inside was already trimmed
 * and fitted to that box before it got here.
 */
function Tile({ partner, delay }: { partner: PartnerLogo; delay: number }) {
  // On the cell rather than the tile inside it, because the cell is what the
  // stylesheet animates — the tile is the masked face and cannot carry a
  // transform of its own without the mask going with it.
  const timing = { "--delay": `${delay}ms` } as CSSProperties;

  const face = partner.logo ? (
    <div className="partner-net__tile">
      <Image
        src={partner.logo}
        alt={partner.name}
        width={PARTNER_LOGO_BOX.width}
        height={PARTNER_LOGO_BOX.height}
        sizes="(min-width: 64rem) 7rem, 5rem"
        className="partner-net__logo"
      />
    </div>
  ) : (
    <div className="partner-net__tile partner-net__tile--pending">
      <span className="partner-net__name">{partner.name}</span>
    </div>
  );

  // A partner without a confirmed address stays a plain tile rather than
  // becoming a link to a guess — see the note in lib/partners.
  if (!partner.href) {
    return (
      <div className="partner-net__cell" style={timing}>
        {face}
      </div>
    );
  }

  return (
    // The anchor is the cell itself, not something inside it. The cell is what
    // carries the drop-shadow that gives these their lift, and a filter applies
    // before clipping — so a focus ring drawn on the masked tile inside would
    // be cut away with the hexagon's corners. Here focus lights the whole shape
    // instead, which the shadow already traces.
    <a
      className="partner-net__cell"
      style={timing}
      href={partner.href}
      target="_blank"
      rel="noreferrer"
    >
      {face}
      {/* The logo's alt names the company; this adds what the link does, so a
          screen reader announces "Beckhoff, opens in a new tab" rather than
          leaving the new window as a surprise. */}
      <span className="sr-only"> — opens in a new tab</span>
    </a>
  );
}
