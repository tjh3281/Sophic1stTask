/**
 * The floor plan the culture section is laid out on.
 *
 * Geometry only: where the blocks stand, where the aisles run, and the exact
 * route a robot drives between them. Nothing here knows what a pillar is —
 * CultureFloor.tsx puts the copy on the plan and CultureFloor.css decides how
 * it is painted.
 *
 * One coordinate space for all of it. The SVG carries FLOOR as its viewBox and
 * every HTML block is positioned as a percentage of the same two numbers, which
 * is the whole reason a button ends up sitting exactly on the road that leads to
 * it. Nothing may pad the frame those two share: padding would put the drawing
 * and the blocks on different rectangles and the robot would dock beside its
 * station rather than at it.
 *
 * The plan runs left to right, not top to bottom, and that is the one decision
 * everything else here follows from. A page is wide and a screen is short, so a
 * route drawn down the page needs a floor taller than the window it is read in —
 * the reader picks a stop, the robot delivers, and the paragraph is somewhere
 * below the fold. Turned on its side the same three moves fit: the headings
 * across the top, their stops in a column under them, and the answer read in the
 * clear half of the floor beside it. Heading, stop and paragraph are on screen
 * together, which is what the section is for.
 */

type Point = { x: number; y: number };

/** Where the robot is and which way it is pointing. Angles are degrees; 0 is
 *  along +x and 90 is straight down the page — SVG's y grows downwards. */
export type Pose = { x: number; y: number; angle: number };

export const FLOOR = { width: 1000, height: 450 } as const;

/** The main aisle. Every station stands on it and it runs the full floor, so
 *  the three read as stops on one line rather than three loose boxes. */
export const AISLE = { y: 52, from: 40, to: 960 } as const;

export const STATION = { width: 244, height: 50 } as const;

/** Typed as plain numbers rather than `as const`. These are coordinates, and a
 *  literal type on a coordinate makes the compiler reject the guards below that
 *  ask whether a station happens to stand over the junction — a question that is
 *  false today and would silently stop being asked the day one is moved. */
export const STATION_X: readonly number[] = [172, 500, 828];

/**
 * How far short of a block the robot stops.
 *
 * Half its own length plus a few units, so it noses up to the edge of the block
 * rather than parking on top of the words. Both ends of every route are set
 * back by this, which is also why a route never has to know how big the robot
 * is: it stops where the road stops.
 */
const APPROACH = 34;

const stationFoot = AISLE.y + STATION.height / 2;

/** The one cross-aisle, running under the three stations. Every route starts on
 *  it, which is why it sits exactly one approach below their feet: the robot
 *  parks on the road it is about to drive rather than on a spur leading to it,
 *  and the first move of every journey is already a move towards the junction. */
const TRUNK_AISLE_Y = stationFoot + APPROACH;

/**
 * The turntable the three routes meet on, and where the load is picked up.
 *
 * Held over at the left-hand wall, under the end of the cross-aisle. It is the
 * one point every route passes through, so putting it at the head of the column
 * of stops means the spine below it *is* the route to all of them — no road on
 * this floor is drawn that some journey does not use.
 */
export const JUNCTION = { x: 84, y: 180, radius: 26 } as const;

/**
 * The stops, as a column rather than a row.
 *
 * A row of stops needs the floor's whole width and leaves the paragraph
 * nowhere to go but underneath it. Stacked, they take a quarter of the width,
 * the spine down from the junction serves all of them off one road, and
 * everything to the right of them is clear floor to read in.
 */
export const DOCK = {
  /** Left edge — fixed, because the column is what makes them a column. Only
   *  the lane down the page changes from stop to stop.
   *
   * Stood this far off the spine on purpose. A road is 58 units wide, and a
   * spur shorter than the road is wide does not read as a spur — it reads as a
   * bulge on the side of the spine. The gap here is a little over twice that,
   * which is the least that still looks like a turning. */
  left: 250,
  /** Wide enough for the longest stop name to hold one line at the narrowest
   *  width the plan is drawn at. A name that wraps puts its icon beside the
   *  middle of two lines, which reads as a bullet rather than as a mark on a
   *  block. */
  width: 234,
  height: 52,
} as const;

/** Where the robot waits with its nose at a dock's mouth. */
const dockApproachX = DOCK.left - APPROACH;

/**
 * The lit rectangle the words are read on, and the lamp that throws at it.
 *
 * Both are fixed now. They used to move from bay to bay with the heading,
 * because on the old plan a route came down whichever half of the floor the
 * heading stood over and would otherwise have been driven straight through the
 * words. Here every road is on the left of the floor whatever is chosen, so the
 * right of it is always clear and the answer always appears in the same place —
 * which is the better behaviour anyway. A paragraph that moves across the floor
 * between one reading and the next makes the reader hunt for it.
 *
 * The depth is not a look, it is a measurement: the longest of the eight
 * paragraphs, set at the size the plan gives it, at the narrowest width the plan
 * is drawn at. Change the copy and this number is the one to check.
 */
export const SCREEN = { x: 610, y: 150, width: 360, height: 278 } as const;

/** Stood in the corridor between the stops and the screen, facing right, and
 *  square with the middle of what it lights. The corridor is only there for the
 *  throw: a lamp with its lens against the thing it is lighting is a lamp
 *  nobody reads as a projector. */
export const PROJECTOR = { x: 547, y: SCREEN.y + SCREEN.height / 2 } as const;

/* --- Which lane each stop stands in ---------------------------------------- */

/**
 * Written out for the counts the content actually has rather than derived.
 * Two stops spread evenly across the full column leave a hole down the middle
 * of it exactly where the reader is looking, so two are set close about the
 * centre instead. `spread` catches anything else.
 */
const BAND = { top: 208, bottom: 428 } as const;

const DOCK_LANES: Record<number, readonly number[]> = {
  1: [(BAND.top + BAND.bottom) / 2],
  2: [268, 368],
  3: [234, 318, 402],
};

function spread(count: number): number[] {
  const first = BAND.top + DOCK.height / 2;
  const last = BAND.bottom - DOCK.height / 2;
  if (count <= 1) return [(first + last) / 2];
  const step = (last - first) / (count - 1);
  return Array.from({ length: count }, (_, index) => first + index * step);
}

/** The lane — a y down the page — each stop stands in. */
export function dockLanes(count: number): readonly number[] {
  return DOCK_LANES[count] ?? spread(count);
}

export function dockY(index: number, count: number): number {
  return dockLanes(count)[index];
}

/* --- The routes ------------------------------------------------------------ */

const round = (value: number) => Number(value.toFixed(2));

const between = (from: Point, to: Point, distance: number): Point => {
  const span = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  const t = distance / span;
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
};

/** Corner radius on the route. About half the road, so the robot leans through
 *  a turn rather than pivoting on the spot at a right angle — and no wider, or
 *  the plan stops reading as aisles and starts reading as loops. */
const CORNER = 26;

/**
 * A polyline with its corners taken off.
 *
 * Straight `L` commands would give the robot a heading that flips in one frame
 * at every turn. Backing off each corner and running a quadratic through it
 * costs one control point and buys a tangent that turns continuously — which is
 * what the robot reads to know which way it is facing.
 */
function route(points: Point[]): string {
  if (points.length < 2) return "";

  let d = `M ${round(points[0].x)} ${round(points[0].y)}`;

  for (let i = 1; i < points.length - 1; i += 1) {
    const previous = points[i - 1];
    const corner = points[i];
    const next = points[i + 1];
    const radius = Math.min(
      CORNER,
      Math.hypot(corner.x - previous.x, corner.y - previous.y) / 2,
      Math.hypot(next.x - corner.x, next.y - corner.y) / 2,
    );
    const enter = between(corner, previous, radius);
    const leave = between(corner, next, radius);
    d += ` L ${round(enter.x)} ${round(enter.y)}`;
    d += ` Q ${round(corner.x)} ${round(corner.y)} ${round(leave.x)} ${round(leave.y)}`;
  }

  const last = points[points.length - 1];
  return `${d} L ${round(last.x)} ${round(last.y)}`;
}

/** Station → junction: along the cross-aisle, then down onto the turntable.
 *  One corner, and for a station standing over the junction, none. */
export function trunkPath(station: number): string {
  const x = STATION_X[station];
  const start = { x, y: TRUNK_AISLE_Y };
  const end = { x: JUNCTION.x, y: JUNCTION.y };
  if (x === JUNCTION.x) return route([start, end]);
  return route([start, { x: JUNCTION.x, y: TRUNK_AISLE_Y }, end]);
}

/** Junction → stop: down the spine, then in off it. The same two moves
 *  mirrored — out along, then in. */
export function branchPath(dock: number, count: number): string {
  const y = dockY(dock, count);
  const start = { x: JUNCTION.x, y: JUNCTION.y };
  const end = { x: dockApproachX, y };
  if (y === JUNCTION.y) return route([start, end]);
  return route([start, { x: JUNCTION.x, y }, end]);
}

/**
 * Stop → stop, without going back to the junction.
 *
 * The spine joins every stop to every other one, so a machine already standing
 * at one has a road straight to the next: out, along, in. The junction is where
 * a load is picked up, not a roundabout everything has to touch on the way past.
 */
export function dockToDockPath(from: number, to: number, count: number): string {
  const a = dockY(from, count);
  const b = dockY(to, count);
  const out = { x: dockApproachX, y: a };
  const into = { x: dockApproachX, y: b };
  if (a === b) return route([out, into]);
  return route([
    out,
    { x: JUNCTION.x, y: a },
    { x: JUNCTION.x, y: b },
    into,
  ]);
}

/**
 * The roads below the junction, as a network rather than as one route per stop.
 *
 * A stop apiece would mean the same spine drawn once for every one of them, each
 * over the last — and a kerb drawn across the middle of another road is the line
 * that makes a plan look like pipes stacked on pipes. Here the tarmac is laid
 * once: the spine runs from the junction down to the far stop and turns in, and
 * every stop above it is a stub off the side. Nothing is drawn twice, so nothing
 * covers anything, and every crossing comes out a plain T.
 */
export function roadNetwork(count: number): string[] {
  const lanes = dockLanes(count);
  const last = lanes[lanes.length - 1];

  const paths = [
    route([
      { x: JUNCTION.x, y: JUNCTION.y },
      { x: JUNCTION.x, y: last },
      { x: dockApproachX, y: last },
    ]),
  ];

  lanes.forEach((y, index) => {
    if (index === lanes.length - 1) return;
    paths.push(route([{ x: JUNCTION.x, y }, { x: dockApproachX, y }]));
  });

  return paths;
}

/**
 * The cone of light, as a polygon from the lamp to the near edge of the screen.
 *
 * It stops where the lit rectangle starts rather than covering it: the screen
 * is the light landing, and drawing the beam over the top of it would put a
 * wash between the reader and the words.
 */
export function beam(): string {
  /** Half the lamp's mouth, and how far the lens stands off its centre. */
  const throat = 14;
  const nose = 12;

  const from = PROJECTOR.x + nose;
  const points: Point[] = [
    { x: from, y: PROJECTOR.y - throat },
    { x: from, y: PROJECTOR.y + throat },
    { x: SCREEN.x, y: SCREEN.y + SCREEN.height },
    { x: SCREEN.x, y: SCREEN.y },
  ];

  return points.map((point) => `${round(point.x)},${round(point.y)}`).join(" ");
}

/* --- Where the robot rests -------------------------------------------------
   Every pose faces the way the next leg sets off, so nothing ever has to spin
   on the spot before it can start moving. At a station that is along the
   cross-aisle towards the junction, at the junction it is down the spine, and
   at a stop it is into the stop.
-------------------------------------------------------------------------- */

export function stationPose(station: number): Pose {
  const x = STATION_X[station];
  return { x, y: TRUNK_AISLE_Y, angle: x < JUNCTION.x ? 0 : 180 };
}

export const junctionPose: Pose = {
  x: JUNCTION.x,
  y: JUNCTION.y,
  angle: 90,
};

export function dockPose(dock: number, count: number): Pose {
  return { x: dockApproachX, y: dockY(dock, count), angle: 0 };
}

/* --- Putting HTML on the plan ---------------------------------------------- */

/** A floor x as a percentage of the frame's width. */
export const across = (x: number) => `${((x / FLOOR.width) * 100).toFixed(3)}%`;

/** A floor y as a percentage of the frame's height. */
export const down = (y: number) => `${((y / FLOOR.height) * 100).toFixed(3)}%`;
