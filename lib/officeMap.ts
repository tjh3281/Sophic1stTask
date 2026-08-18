import { OFFICES, officeByAlias, type Office } from "@/lib/contact";

/**
 * The dot map behind the careers cover: where Sophic actually is.
 *
 * Everything on it is derived. The offices come from lib/contact — the same
 * four the footer prints on every page — so an office that moves, is renamed or
 * is added takes its pin with it rather than leaving a second, staler copy of
 * the company's addresses hidden in a background graphic. The only thing kept
 * here that is not already in lib/contact is a coordinate per office, because a
 * street address is not a position and nothing else on the site needs one.
 *
 * The land is drawn as a grid of dots rather than as an outline, and that is
 * what makes the coastlines below good enough. A dot lands on the grid or it
 * does not; at 0.15° — call it seventeen kilometres — a coastline traced from
 * a few dozen points quantises to exactly the same dots a survey-grade one
 * would. So this is a coarse silhouette on purpose, and it is decorative: it
 * says "peninsula, strait, island" at a glance and it is not a reference for
 * anything. Do not read a border off it.
 */

/* --- The window ------------------------------------------------------------
   Peninsular Malaysia and Singapore, with as much of southern Thailand,
   Sumatra and the Riau islands as it takes for the peninsula to read as a
   peninsula. Sabah and Sarawak are off the east edge, and pulling the window
   out to reach them would put every office in the left third of the frame at
   half the size — this is a map of where the jobs are, not of the country.

   Wider than tall, and wider than the offices need. The map is the cover's
   background, so the west end is deliberately a stretch of open Andaman Sea
   and the top of Sumatra: something for the left edge to dissolve into behind
   the headline, rather than a coastline stopping dead under the words.
-------------------------------------------------------------------------- */

const WEST = 96.6;
const EAST = 106.5;
const NORTH = 7.05;
const SOUTH = -0.6;

/** Degrees between dots. Also the map's unit: the SVG viewBox is one unit per
 *  cell, so the lattice is square by construction rather than by arithmetic. */
const STEP = 0.15;

export const COLS = Math.round((EAST - WEST) / STEP) + 1;
export const ROWS = Math.round((NORTH - SOUTH) / STEP) + 1;

/** Half a cell wide, so a dot fills a little over half the gap to its
 *  neighbour — dense enough to read as a surface, open enough to read as dots. */
export const DOT_RADIUS = 0.26;

/** [longitude, latitude], the order SVG wants them in. */
type Point = readonly [number, number];

type Landmass = {
  name: string;
  ring: readonly Point[];
  /** "home" is Malaysia or Singapore and is drawn at full strength; "near" is
   *  a neighbour and is drawn faint. "split" is the one landmass that is both —
   *  see MALAYSIA_BORDER. */
  tone: "home" | "near" | "split";
};

/**
 * The Malaysia–Thailand border, as the two ends of a straight line.
 *
 * The real one wanders through the Titiwangsa foothills between these points;
 * this is the chord. At dot resolution the difference is a handful of dots
 * around Betong, and the one place it is visibly wrong is the Satun coast west
 * of Perlis, where a couple of Thai dots come out in the Malaysian tone.
 */
const BORDER_WEST: Point = [100.19, 6.68];
const BORDER_EAST: Point = [102.1, 6.22];

const LANDMASSES: Landmass[] = [
  {
    name: "Thai–Malay peninsula",
    tone: "split",
    // Down the west coast from the Andaman side of southern Thailand, round
    // Johor, and back up the east coast to the Gulf of Thailand.
    ring: [
      [99.55, 7.5],
      [99.3, 7.05],
      [99.85, 6.7],
      [100.13, 6.4],
      [100.29, 6.1],
      [100.35, 5.65],
      [100.36, 5.4],
      [100.48, 5.16],
      [100.42, 5.01],
      [100.63, 4.84],
      [100.63, 4.23],
      [100.78, 3.98],
      [100.99, 3.77],
      [101.25, 3.34],
      [101.39, 3.0],
      [101.44, 2.75],
      [101.7, 2.6],
      [101.8, 2.52],
      [102.25, 2.19],
      [102.57, 2.04],
      [102.93, 1.85],
      [103.39, 1.48],
      [103.51, 1.26],
      [103.76, 1.46],
      [104.1, 1.42],
      [104.27, 1.55],
      [103.84, 2.43],
      [103.62, 2.65],
      [103.5, 2.81],
      [103.39, 3.49],
      [103.33, 3.82],
      [103.42, 4.23],
      [103.42, 4.78],
      [103.14, 5.33],
      [102.8, 5.6],
      [102.47, 5.9],
      [102.25, 6.13],
      [101.82, 6.43],
      [101.25, 6.87],
      [100.6, 7.2],
      [100.35, 7.5],
    ],
  },
  {
    name: "Penang Island",
    tone: "home",
    ring: [
      [100.17, 5.28],
      [100.19, 5.42],
      [100.28, 5.47],
      [100.34, 5.4],
      [100.35, 5.3],
      [100.28, 5.22],
    ],
  },
  {
    name: "Langkawi",
    tone: "home",
    ring: [
      [99.63, 6.3],
      [99.65, 6.44],
      [99.88, 6.45],
      [99.9, 6.31],
      [99.78, 6.24],
    ],
  },
  {
    name: "Singapore",
    tone: "home",
    ring: [
      [103.61, 1.24],
      [103.63, 1.47],
      [104.03, 1.46],
      [104.05, 1.25],
    ],
  },
  {
    name: "Sumatra",
    tone: "near",
    // East coast north-west to south-east, then back up the west coast. Both
    // ends run past the window; the grid clips them.
    ring: [
      [97.9, 4.35],
      [98.4, 3.9],
      [98.75, 3.7],
      [99.45, 3.2],
      [99.85, 2.95],
      [100.3, 2.55],
      [100.85, 2.15],
      [101.45, 1.68],
      [102.1, 1.45],
      [102.6, 0.95],
      [103.25, 0.6],
      [103.6, 0.05],
      [104.1, -0.55],
      [104.6, -1.3],
      [100.9, -1.6],
      [100.35, -0.95],
      [99.9, -0.2],
      [99.2, 1.0],
      [98.78, 1.74],
      [98.2, 2.4],
      [97.3, 3.27],
      [96.3, 4.1],
      // Round the top of Aceh and back down its north coast. Without these the
      // ring closes on a straight line from Meulaboh to Langsa and takes the
      // whole northern tip off with it.
      [95.6, 4.9],
      [95.3, 5.55],
      [96.2, 5.3],
      [97.0, 5.05],
      [97.6, 4.7],
    ],
  },
  {
    name: "Karimun",
    tone: "near",
    ring: [
      [103.28, 0.93],
      [103.29, 1.15],
      [103.55, 1.14],
      [103.56, 0.94],
    ],
  },
  {
    name: "Batam",
    tone: "near",
    ring: [
      [103.83, 0.98],
      [103.83, 1.2],
      [104.15, 1.19],
      [104.16, 0.99],
    ],
  },
  {
    name: "Bintan",
    tone: "near",
    ring: [
      [104.2, 0.85],
      [104.19, 1.2],
      [104.65, 1.18],
      [104.66, 0.86],
    ],
  },
  {
    name: "Lingga",
    tone: "near",
    ring: [
      [104.3, -0.35],
      [104.28, 0.22],
      [104.75, 0.2],
      [104.78, -0.33],
    ],
  },
  {
    name: "Anambas",
    tone: "near",
    ring: [
      [105.6, 2.7],
      [105.62, 3.35],
      [106.35, 3.32],
      [106.33, 2.72],
    ],
  },
];

/* --- Projection ------------------------------------------------------------ */

/** Degrees to viewBox units. The half-cell offset centres a position in its
 *  own cell, which is where the dots are drawn, so a pin and the dots around
 *  it share one lattice instead of sitting half a dot apart. */
function project(lon: number, lat: number) {
  return {
    x: (lon - WEST) / STEP + 0.5,
    y: (NORTH - lat) / STEP + 0.5,
  };
}

/** Latitude of the border at this longitude, held at the terminal value
 *  outside the two ends rather than extrapolated off into the sea. */
function borderAt(lon: number): number {
  const span = BORDER_EAST[0] - BORDER_WEST[0];
  const t = Math.min(1, Math.max(0, (lon - BORDER_WEST[0]) / span));
  return BORDER_WEST[1] + t * (BORDER_EAST[1] - BORDER_WEST[1]);
}

/** Ray casting, the standard even-odd test. Rings are closed implicitly. */
function contains(ring: readonly Point[], lon: number, lat: number): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

export type Dot = {
  x: number;
  y: number;
  /** Malaysia or Singapore, as against a neighbour drawn for context. */
  home: boolean;
};

function buildDots(): Dot[] {
  const dots: Dot[] = [];

  for (let row = 0; row < ROWS; row++) {
    const lat = NORTH - row * STEP;
    for (let col = 0; col < COLS; col++) {
      const lon = WEST + col * STEP;
      const land = LANDMASSES.find((mass) => contains(mass.ring, lon, lat));
      if (!land) continue;

      dots.push({
        x: col + 0.5,
        y: row + 0.5,
        home:
          land.tone === "home" ||
          (land.tone === "split" && lat <= borderAt(lon)),
      });
    }
  }

  return dots;
}

/** Built once at module scope, on the server, and rendered straight into the
 *  HTML. Nothing about the map needs JavaScript in the browser. */
export const DOTS: Dot[] = buildDots();

/* --- The offices -----------------------------------------------------------
   Keyed by the internal building name, which is the one field in lib/contact
   guaranteed unique and stable — the printed address is what changes when an
   office moves, and it is the thing this table is here to complement.

   Coordinates are the industrial estate or building each address names, to
   about a hundred metres. The map is a country wide, so that is roughly six
   thousand times finer than one dot.
-------------------------------------------------------------------------- */

const SITES: Record<string, Point> = {
  // Taman Industri Tangkas, Bukit Mertajam.
  "Theta Office": [100.454, 5.365],
  // Kawasan Perindustrian Bukit Minyak, Simpang Ampat.
  "Beta Office": [100.462, 5.318],
  // Stellar Suites, Bandar Puteri Puchong.
  "Sigma Office": [101.617, 3.024],
  // Midview City, Sin Ming Lane.
  "Alpha Office": [103.84, 1.357],
};

/**
 * One pin per city, not one per office.
 *
 * The Penang offices are a few kilometres apart, which is a fraction of a dot:
 * drawn separately they would be one pin with three labels fighting over it. So
 * the pin is the city and the caption carries the count, which is also the
 * thing a reader actually wants off a map like this — not which building, but
 * how many places there are and where they are.
 *
 * `sites` is that count, and it is stated rather than derived on purpose.
 * Everywhere else on this page the number of offices is however many addresses
 * lib/contact holds, and for Kuala Lumpur and Singapore it still is. Penang is
 * three against the two addresses the footer prints, on instruction: there is a
 * third Penang site whose address is not in the published list. Give it an
 * entry in OFFICES and this line should come straight back out.
 */
const CITIES = [
  {
    key: "penang",
    label: "Penang",
    aliases: ["Theta Office", "Beta Office"],
    sites: 3,
  },
  { key: "kuala-lumpur", label: "Kuala Lumpur", aliases: ["Sigma Office"] },
  { key: "singapore", label: "Singapore", aliases: ["Alpha Office"] },
] as const satisfies readonly {
  key: string;
  label: string;
  aliases: readonly string[];
  sites?: number;
}[];

/* --- Timing ----------------------------------------------------------------
   When each thing happens, in seconds. How long each thing takes is in
   OfficeMap.css, with the animation it belongs to — this file owns the running
   order and nothing else.

   The order is here rather than in the stylesheet because it is a function of
   how many cities there are, and a hand-written list of delays is what goes
   out of step the day a fourth one opens.
-------------------------------------------------------------------------- */

/** Seconds from one city lighting up to the next. */
const LEG = 1.55;

/** When the first pin lands — just before the map has finished arriving, so
 *  the two overlap rather than queueing. */
const FIRST_PIN = 0.85;

/** Units per second for the particles, so a long hop takes proportionally
 *  longer and every particle on the map moves at the same speed. */
const PARTICLE_SPEED = 5;

/** Particles in flight per connection. More than two reads as traffic. */
const PARTICLE_COUNT = 2;

/** Every delay below is written into a style attribute, so it is rounded here
 *  rather than in the markup — 0.85 + 2 × 1.55 is 4.000000000000001 in binary
 *  floating point, and that is not something to ship in the HTML. */
const seconds = (value: number) => Number(value.toFixed(2));

export type MapNode = {
  key: string;
  label: string;
  /** Viewbox units. */
  x: number;
  y: number;
  /** The addresses lib/contact publishes for this city. */
  offices: Office[];
  /** How many offices are here, which is `offices.length` unless a city says
   *  otherwise — see the note on CITIES. */
  sites: number;
  /** True where one of this city's offices is the headquarters. */
  headquarters: boolean;
  /** Seconds into the sequence at which this pin lands. */
  at: number;
};

const placed = new Set<string>();

export const MAP_NODES: MapNode[] = CITIES.map((city, index) => {
  const offices = city.aliases.map((alias) => {
    const office = officeByAlias(alias);
    // Thrown at module scope, so a renamed office fails the build rather than
    // quietly dropping a pin off the careers page.
    if (!office) {
      throw new Error(`No office aliased "${alias}" to put on the careers map`);
    }
    placed.add(alias);
    return office;
  });

  const sites = city.aliases.map((alias) => {
    const site = SITES[alias];
    if (!site) throw new Error(`No coordinates for "${alias}"`);
    return site;
  });

  const lon = sites.reduce((sum, [x]) => sum + x, 0) / sites.length;
  const lat = sites.reduce((sum, [, y]) => sum + y, 0) / sites.length;

  return {
    key: city.key,
    label: city.label,
    ...project(lon, lat),
    offices,
    sites: "sites" in city ? city.sites : offices.length,
    headquarters: offices.some((office) => /headquarter/i.test(office.name)),
    at: seconds(FIRST_PIN + index * LEG),
  };
});

// The map is a claim about where the whole company is, so an office nobody
// filed under a city has to be an error rather than an omission.
if (placed.size !== OFFICES.length) {
  const missing = OFFICES.filter((office) => !placed.has(office.alias));
  throw new Error(
    `Offices missing from the careers map: ${missing
      .map((office) => office.alias)
      .join(", ")}`,
  );
}

/* --- The connections ------------------------------------------------------- */

export type MapLink = {
  key: string;
  /** A quadratic curve, in viewBox units. */
  d: string;
  /** Its arc length, which the dash animations are measured in. */
  length: number;
  /** Seconds into the sequence at which it starts drawing. */
  at: number;
  /** Seconds a particle takes to run its length. */
  travel: number;
  /** One start delay per particle, in seconds. */
  particles: number[];
};

/** How far the curve bows off the straight line, as a fraction of its length.
 *  Enough to read as a route rather than a ruler; the perpendicular is taken
 *  on the seaward side, so neither hop is drawn across the peninsula. */
const BOW = 0.12;

function quadLength(
  ax: number,
  ay: number,
  cx: number,
  cy: number,
  bx: number,
  by: number,
): number {
  const steps = 48;
  let length = 0;
  let px = ax;
  let py = ay;

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    const x = u * u * ax + 2 * u * t * cx + t * t * bx;
    const y = u * u * ay + 2 * u * t * cy + t * t * by;
    length += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }

  return length;
}

export const MAP_LINKS: MapLink[] = MAP_NODES.slice(0, -1).map(
  (from, index) => {
    const to = MAP_NODES[index + 1];
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // Control point: the midpoint, pushed along the left-hand normal. Both
    // hops run south-east, so the left-hand side is the Strait of Malacca and
    // the curves stay off the land dots.
    const cx = (from.x + to.x) / 2 - dy * BOW;
    const cy = (from.y + to.y) / 2 + dx * BOW;

    const length = quadLength(from.x, from.y, cx, cy, to.x, to.y);
    const travel = length / PARTICLE_SPEED;

    return {
      key: `${from.key}-${to.key}`,
      d: `M${from.x.toFixed(2)} ${from.y.toFixed(2)} Q${cx.toFixed(2)} ${cy.toFixed(2)} ${to.x.toFixed(2)} ${to.y.toFixed(2)}`,
      length,
      at: seconds(from.at + 0.65),
      travel,
      particles: Array.from(
        { length: PARTICLE_COUNT },
        // Evenly spaced along the line, and the two links offset against each
        // other by half a gap so the map never has every particle setting off
        // at once.
        (_, slot) => seconds(((slot + index / 2) * travel) / PARTICLE_COUNT),
      ),
    };
  },
);

/** When the intro is over and the map settles into the loop it holds
 *  indefinitely: the pins breathing, particles running the connections. */
export const SETTLED_AT = MAP_NODES[MAP_NODES.length - 1].at + 0.7;

/** "3 in Penang, 1 in Kuala Lumpur, 1 in Singapore" — the caption, taken off
 *  the pins so it cannot contradict them. */
export const OFFICE_SUMMARY = MAP_NODES.map(
  (node) => `${node.sites} in ${node.label}`,
).join(", ");
