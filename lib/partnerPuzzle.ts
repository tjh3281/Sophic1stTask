import { PARTNER_NETWORK } from "@/lib/partners";

/**
 * The partner network, as one finished jigsaw.
 *
 * The section's whole argument is in the brief's own words — "In I4.0 journey,
 * we're not alone… we need partners to make it a success" — so the diagram is a
 * puzzle that is *complete*: Sophic is the piece in the middle, the twenty-six
 * partners are every remaining piece, and there are no gaps and no spares. That
 * only reads if the arithmetic actually works out, which is what most of this
 * file is about.
 *
 * A board is a plain rectangle of cells. Sophic takes a rectangle of them in the
 * middle; the partners take one each; the count has to land exactly. With a
 * centred Sophic that is a real constraint rather than a matter of taste:
 *
 *   cols × rows − (sophic cols × sophic rows) = 26
 *
 * and centring forces `cols` and `sophic cols` to share a parity, and likewise
 * the rows — otherwise the middle piece sits half a cell off, which the eye
 * catches immediately. Search that and only three boards come out with sensible
 * proportions, which is why there are exactly three below rather than one per
 * breakpoint on a whim:
 *
 *   9 × 4, Sophic 5 × 2   — 2.25:1, wide screens
 *   7 × 5, Sophic 3 × 3   — 1.4:1, tablets
 *   5 × 7, Sophic 3 × 3   — 0.71:1, phones
 *
 * All three carry the same twenty-seven pieces. Nothing is dropped on a small
 * screen and nothing is duplicated in the markup: one set of elements, three
 * sets of coordinates and clip paths, switched in the stylesheet. See
 * PartnerPuzzle.css.
 */

export const BOARD_KEYS = ["narrow", "medium", "wide"] as const;
export type BoardKey = (typeof BOARD_KEYS)[number];

type BoardSpec = {
  map: string[];
  /** The run of columns each group's name hangs over, chosen to sit directly
   *  against that group's own cells. Which edge it hangs off is LABEL_SIDE
   *  below — a property of the group rather than of the board, so a name cannot
   *  move from one edge to another between breakpoints. */
  labels: Record<string, { from: number; to: number }>;
};

/* --- The boards ------------------------------------------------------------
   Written as pictures, because that is what they are. One character per cell:

     E  Ecosystem Liaisons        O  OT2IT, Cloud and Apps
     T  Things of Internet        .  Sophic

   The counts a map has to hit are 8 / 4 / 14 — the three groups, exactly as
   lib/partners lists them — around a solid rectangle of dots in the middle.
   Edit one of these and count the letters; `buildPieces` throws if a group's
   cells and its partners disagree, which is the only check there is.

   Each group is one connected run in every map. That is the part that is easy
   to break and hard to see: a group split in two by Sophic's block reads as two
   groups however carefully it is tinted.
-------------------------------------------------------------------------- */

const BOARDS: Record<BoardKey, BoardSpec> = {
  wide: {
    map: [
      "EEEEOOOOT",
      "EE.....TT",
      "EE.....TT",
      "TTTTTTTTT",
    ],
    labels: {
      "ecosystem-liaisons": { from: 0, to: 3 },
      "ot2it-cloud-and-apps": { from: 4, to: 7 },
      "things-of-internet": { from: 0, to: 8 },
    },
  },
  medium: {
    map: [
      "EEOOOOT",
      "EE...TT",
      "EE...TT",
      "EE...TT",
      "TTTTTTT",
    ],
    labels: {
      "ecosystem-liaisons": { from: 0, to: 1 },
      "ot2it-cloud-and-apps": { from: 2, to: 5 },
      "things-of-internet": { from: 0, to: 6 },
    },
  },
  narrow: {
    map: [
      "EEEOO",
      "EEEEO",
      "E...O",
      "T...T",
      "T...T",
      "TTTTT",
      "TTTTT",
    ],
    labels: {
      "ecosystem-liaisons": { from: 0, to: 2 },
      "ot2it-cloud-and-apps": { from: 3, to: 4 },
      "things-of-internet": { from: 0, to: 4 },
    },
  },
};

/** Which group each letter in a map stands for. */
const LETTERS: Record<string, string | undefined> = {
  E: "ecosystem-liaisons",
  O: "ot2it-cloud-and-apps",
  T: "things-of-internet",
};

/**
 * Which edge of the board each name hangs off.
 *
 * Two above and one below, on every board, because that is how the three
 * regions fall out of the maps: the small two take a run of the top edge each,
 * and the fourteen take the whole bottom. A name is against its own pieces on
 * all three boards, which is what makes a leader line unnecessary — there is
 * nothing to point at that the name is not already touching.
 */
const LABEL_SIDE: Record<string, "top" | "bottom"> = {
  "ecosystem-liaisons": "top",
  "ot2it-cloud-and-apps": "top",
  "things-of-internet": "bottom",
};

/** The three values the orbit diagram used for its tracks, kept: they are the
 *  whole of the mapping between a name and a region, and the rest of the page
 *  is already tuned against them. */
export const GROUP_TINT: Record<string, string> = {
  "ot2it-cloud-and-apps": "#0b3a63",
  "ecosystem-liaisons": "#1d8fa0",
  "things-of-internet": "#5b83b0",
};

/* --- One edge of one piece -------------------------------------------------
   A jigsaw joint, drawn in the edge's own coordinates: `u` runs 0 to 1 from the
   start of the edge to its end, `v` runs outward from the piece.

   Symmetric about u = 0.5, and that is load-bearing rather than tidy. Two
   pieces meet along one edge and walk it in opposite directions — clockwise
   around each of them means one goes left to right and the other right to left.
   A profile that mirrors onto itself comes out identical either way, so a tab
   and the socket it drops into are the same curve with `v` negated, and the two
   cannot drift apart however the board is rearranged.

   The undercut is the other half of reading as a jigsaw: the neck (u 0.44 to
   0.56) is half the width of the bulb (0.38 to 0.62), so the knob has a waist
   and cannot be mistaken for a bump.
-------------------------------------------------------------------------- */

/** How far a tab reaches past its edge, in cells. Also the depth a socket bites
 *  *into* a piece — which is what caps how large a logo can sit on one, since a
 *  socket in the middle of an edge is exactly where a wide mark wants to be. */
const KNOB = 0.18;

/** The piece's element box overhang, in cells: enough to hold a tab, no more.
 *  The stylesheet reads this as --over; the two have to agree, or the clip and
 *  the box it is measured against part company. */
export const OVER = 0.22;

/** [c1u, c1v, c2u, c2v, u, v] per cubic, starting from (0.44, 0). */
const PROFILE: readonly (readonly number[])[] = [
  [0.44, 0.22, 0.38, 0.32, 0.38, 0.56],
  [0.38, 0.86, 0.43, 1.0, 0.5, 1.0],
  [0.57, 1.0, 0.62, 0.86, 0.62, 0.56],
  [0.62, 0.32, 0.56, 0.22, 0.56, 0.0],
];

type Edge = "flat" | "out" | "in";

/**
 * Which side of a shared edge the tab sticks out of.
 *
 * Deterministic, so the board comes out the same on the server and in the
 * browser and the same on every reload — a jigsaw that reshuffled its own
 * joints between renders would hydrate into a different picture. Hashed rather
 * than alternated, because a strict checkerboard of tabs is visible as a
 * pattern and stops reading as a puzzle.
 */
function tabOwnedByFirst(a: number, b: number, salt: number) {
  let h =
    (Math.imul(a, 374761393) +
      Math.imul(b, 668265263) +
      Math.imul(salt, 2246822519)) >>>
    0;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) & 1) === 0;
}

const round = (n: number) => Number(n.toFixed(4));

/**
 * The outline of one piece, as an SVG path in objectBoundingBox units.
 *
 * Walked clockwise from the piece's top-left corner. In screen coordinates —
 * y downwards — the outward normal of a clockwise walk is (d.y, −d.x), which is
 * the one line that lets all four sides share a single piece of joint-drawing
 * code instead of four transposed copies of it.
 *
 * Emitted in the box's own 0..1 space so it can be used as a clip path with
 * `clipPathUnits="objectBoundingBox"`: one path then fits a piece at any size,
 * on any of the three boards, with no transform anywhere.
 */
function outline(w: number, h: number, edges: Edge[]) {
  const boxW = w + OVER * 2;
  const boxH = h + OVER * 2;
  // A point in cell coordinates, normalised into the element's box.
  const nx = (x: number) => round((x + OVER) / boxW);
  const ny = (y: number) => round((y + OVER) / boxH);

  // The four sides, clockwise: where each starts, which way it runs, and how
  // many unit edges long it is.
  const sides = [
    { x: 0, y: 0, dx: 1, dy: 0, steps: w },
    { x: w, y: 0, dx: 0, dy: 1, steps: h },
    { x: w, y: h, dx: -1, dy: 0, steps: w },
    { x: 0, y: h, dx: 0, dy: -1, steps: h },
  ];

  const d: string[] = [`M${nx(0)} ${ny(0)}`];
  let e = 0;

  for (const side of sides) {
    for (let i = 0; i < side.steps; i += 1) {
      const x0 = side.x + side.dx * i;
      const y0 = side.y + side.dy * i;
      const kind = edges[e];
      e += 1;

      if (kind === "flat") {
        d.push(`L${nx(x0 + side.dx)} ${ny(y0 + side.dy)}`);
        continue;
      }

      // Outward normal of a clockwise walk, and the sign that turns the one
      // profile into either a tab or the socket that receives it.
      const ox = side.dy;
      const oy = -side.dx;
      const s = (kind === "out" ? 1 : -1) * KNOB;
      const at = (u: number, v: number) =>
        [
          nx(x0 + side.dx * u + ox * v * s),
          ny(y0 + side.dy * u + oy * v * s),
        ] as const;

      const [sx, sy] = at(0.44, 0);
      d.push(`L${sx} ${sy}`);
      for (const [c1u, c1v, c2u, c2v, pu, pv] of PROFILE) {
        const [ax, ay] = at(c1u, c1v);
        const [bx, by] = at(c2u, c2v);
        const [px, py] = at(pu, pv);
        d.push(`C${ax} ${ay} ${bx} ${by} ${px} ${py}`);
      }
      d.push(`L${nx(x0 + side.dx)} ${ny(y0 + side.dy)}`);
    }
  }

  d.push("Z");
  return d.join("");
}

/* --- Building the three boards --------------------------------------------- */

export type PiecePlacement = {
  col: number;
  row: number;
  w: number;
  h: number;
  /** The id of the clip path in <defs> that cuts this piece on this board. */
  clip: string;
  /** How wide the logo is drawn, as a percentage of the piece's element box.
   *  Worked out here rather than in the stylesheet because the box is the
   *  piece plus its overhang, and only this file knows the overhang. */
  logo: number;
};

/**
 * How wide a mark is allowed to be drawn, in cells.
 *
 * A socket bites KNOB into the middle of an edge, which is exactly where a wide
 * mark wants to sit — so anything up to 1 − 2·KNOB = 0.64 cells clears every
 * socket a one-cell piece can have, whichever edges happen to carry them. 0.62
 * is that with a hair of air, and it is one figure for all twenty-six: the
 * files were normalised onto a single canvas before they got here, so the tiles
 * do not need a table of exceptions.
 *
 * Sophic's is capped by its smallest board — 3 × 3, where the clear width is
 * 3 − 2·KNOB = 2.64 — rather than by the 5 × 2 it gets on a wide screen. One
 * figure again, so the mark is the same size relative to its own piece however
 * the board is shaped.
 */
const PARTNER_MARK = 0.62;
const SOPHIC_MARK = 2.4;

export type PuzzlePiece = {
  /** Stable across boards — the same element is being moved, not replaced. */
  id: string;
  name: string;
  href?: string;
  logo?: string;
  /** Absent on Sophic, which belongs to no group. */
  group?: string;
  tint: string;
  at: Record<BoardKey, PiecePlacement>;
  /** Its place in the assembly, in milliseconds. */
  delay: number;
};

export type PuzzleLabel = {
  group: string;
  text: string;
  tint: string;
  side: "top" | "bottom";
  at: Record<BoardKey, { from: number; to: number }>;
};

/** Between one piece dropping into place and the next. */
const STEP = 42;

/** The beat after Sophic lands before the first partner does — long enough to
 *  read as "and then the rest" rather than Sophic being merely the first of
 *  twenty-seven. */
const AFTER_SOPHIC = 260;

const GROUPS = PARTNER_NETWORK.groups.map((group) => ({
  slug: group.slug,
  label: group.label,
  partners: group.rows.flat(),
}));

type Board = {
  key: BoardKey;
  cols: number;
  rows: number;
  /** Whose cell this is, or null off the board. Only ever asked "same piece or
   *  not", which is all a joint needs to know. */
  owner: (string | null)[][];
  /** Each group's cells, in reading order — so the partners land in the order
   *  lib/partners lists them. */
  cells: Record<string, { col: number; row: number }[]>;
  sophic: { c0: number; r0: number; c1: number; r1: number };
};

function readBoard(key: BoardKey): Board {
  const { map } = BOARDS[key];
  const rows = map.length;
  const cols = map[0].length;

  const owner: (string | null)[][] = [];
  const cells: Record<string, { col: number; row: number }[]> = {};
  let sophic = { c0: Infinity, r0: Infinity, c1: -Infinity, r1: -Infinity };

  for (let row = 0; row < rows; row += 1) {
    if (map[row].length !== cols) {
      throw new Error(`Row ${row} of the ${key} board is not ${cols} cells wide`);
    }
    owner[row] = [];
    for (let col = 0; col < cols; col += 1) {
      const letter = map[row][col];
      if (letter === ".") {
        owner[row][col] = "sophic";
        sophic = {
          c0: Math.min(sophic.c0, col),
          r0: Math.min(sophic.r0, row),
          c1: Math.max(sophic.c1, col),
          r1: Math.max(sophic.r1, row),
        };
        continue;
      }
      const group = LETTERS[letter];
      if (!group) throw new Error(`Unknown cell "${letter}" on the ${key} board`);
      const held = (cells[group] ??= []);
      owner[row][col] = `${group}:${held.length}`;
      held.push({ col, row });
    }
  }

  return { key, cols, rows, owner, cells, sophic };
}

/** Whether there is a cell at all at (col, row). */
function onBoard(board: Board, col: number, row: number) {
  return col >= 0 && row >= 0 && col < board.cols && row < board.rows;
}

/**
 * The edges around one piece, clockwise from its top-left corner.
 *
 * A side of the board is flat, the way a real jigsaw's border pieces are. Every
 * other unit edge is a joint, and which of the two pieces gets the tab is
 * decided by the *grid line* rather than by either piece — so the two always
 * agree without ever consulting one another.
 */
function edgesOf(board: Board, c0: number, r0: number, w: number, h: number): Edge[] {
  const edges: Edge[] = [];
  /** `mine` says whether this piece is the first-named side of the line: above
   *  it for a horizontal one, left of it for a vertical one. */
  const joint = (mine: boolean, a: number, b: number, salt: number): Edge =>
    tabOwnedByFirst(a, b, salt) === mine ? "out" : "in";

  // Top: the horizontal line at y = r0. This piece is below it.
  for (let c = c0; c < c0 + w; c += 1) {
    edges.push(onBoard(board, c, r0 - 1) ? joint(false, c, r0, 1) : "flat");
  }
  // Right: the vertical line at x = c0 + w. This piece is left of it.
  for (let r = r0; r < r0 + h; r += 1) {
    edges.push(onBoard(board, c0 + w, r) ? joint(true, c0 + w, r, 2) : "flat");
  }
  // Bottom, walked right to left. This piece is above the line.
  for (let c = c0 + w - 1; c >= c0; c -= 1) {
    edges.push(onBoard(board, c, r0 + h) ? joint(true, c, r0 + h, 1) : "flat");
  }
  // Left, walked bottom to top. This piece is right of the line.
  for (let r = r0 + h - 1; r >= r0; r -= 1) {
    edges.push(onBoard(board, c0 - 1, r) ? joint(false, c0, r, 2) : "flat");
  }

  return edges;
}

/**
 * Every distinct piece shape across the three boards, once each.
 *
 * A 1 × 1 piece is fully described by its four edges, and there are only so
 * many ways to arrange three kinds of edge — so the same shape turns up over
 * and over across seventy-eight partner cells. Keying the clip paths by that
 * signature takes the inline <defs> from eighty-odd paths down to a couple of
 * dozen, which is most of the weight this section puts in the document.
 */
const clips = new Map<string, string>();

function clipFor(w: number, h: number, edges: Edge[]) {
  const signature = `${w}x${h}-${edges.map((edge) => edge[0]).join("")}`;
  if (!clips.has(signature)) clips.set(signature, outline(w, h, edges));
  return signature;
}

function place(
  board: Board,
  col: number,
  row: number,
  w: number,
  h: number,
  mark: number,
): PiecePlacement {
  return {
    col,
    row,
    w,
    h,
    clip: clipFor(w, h, edgesOf(board, col, row, w, h)),
    logo: round((mark / (w + OVER * 2)) * 100),
  };
}

function buildPieces(): {
  centre: PuzzlePiece;
  partners: PuzzlePiece[];
  labels: PuzzleLabel[];
} {
  const boards = Object.fromEntries(
    BOARD_KEYS.map((key) => [key, readBoard(key)]),
  ) as Record<BoardKey, Board>;

  for (const key of BOARD_KEYS) {
    for (const group of GROUPS) {
      const held = boards[key].cells[group.slug]?.length ?? 0;
      if (held !== group.partners.length) {
        throw new Error(
          `The ${key} board holds ${held} cells for ${group.slug}, but ${group.partners.length} partners are in it`,
        );
      }
    }
  }

  const centre: PuzzlePiece = {
    id: "sophic",
    name: PARTNER_NETWORK.centre.name,
    logo: PARTNER_NETWORK.centre.logo,
    tint: "#0b3a63",
    delay: 0,
    at: Object.fromEntries(
      BOARD_KEYS.map((key) => {
        const { c0, r0, c1, r1 } = boards[key].sophic;
        return [
          key,
          place(boards[key], c0, r0, c1 - c0 + 1, r1 - r0 + 1, SOPHIC_MARK),
        ];
      }),
    ) as Record<BoardKey, PiecePlacement>,
  };

  // Group by group rather than cell by cell. The section exists to say that
  // these twenty-six fall into three kinds, and a build that fills one region
  // at a time says it before a single label has been read.
  const partners: PuzzlePiece[] = [];
  let arriving = 0;
  for (const group of GROUPS) {
    group.partners.forEach((partner, index) => {
      partners.push({
        id: `${group.slug}:${index}`,
        name: partner.name,
        href: partner.href,
        logo: partner.logo,
        group: group.slug,
        tint: GROUP_TINT[group.slug],
        delay: AFTER_SOPHIC + arriving * STEP,
        at: Object.fromEntries(
          BOARD_KEYS.map((key) => {
            const cell = boards[key].cells[group.slug][index];
            return [key, place(boards[key], cell.col, cell.row, 1, 1, PARTNER_MARK)];
          }),
        ) as Record<BoardKey, PiecePlacement>,
      });
      arriving += 1;
    });
  }

  const labels: PuzzleLabel[] = GROUPS.map((group) => ({
    group: group.slug,
    text: group.label,
    tint: GROUP_TINT[group.slug],
    side: LABEL_SIDE[group.slug],
    at: Object.fromEntries(
      BOARD_KEYS.map((key) => [key, BOARDS[key].labels[group.slug]]),
    ) as PuzzleLabel["at"],
  }));

  return { centre, partners, labels };
}

const built = buildPieces();

export const PUZZLE = {
  heading: PARTNER_NETWORK.heading,
  size: Object.fromEntries(
    BOARD_KEYS.map((key) => [
      key,
      { cols: BOARDS[key].map[0].length, rows: BOARDS[key].map.length },
    ]),
  ) as Record<BoardKey, { cols: number; rows: number }>,
  /** Sophic's, kept apart from the rest so nothing has to go looking for it by
   *  id — it is the only piece the markup treats differently. */
  centre: built.centre,
  partners: built.partners,
  /** All twenty-seven, in the order they assemble. */
  pieces: [built.centre, ...built.partners],
  labels: built.labels,
  /** Every distinct outline, for one <defs> at the top of the section. */
  clips: [...clips].map(([id, d]) => ({ id, d })),
};
