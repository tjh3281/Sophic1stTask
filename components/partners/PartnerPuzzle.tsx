import Image from "next/image";
import { Fragment, type CSSProperties } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { PARTNER_LOGO_BOX, PARTNER_NETWORK } from "@/lib/partners";
import {
  BOARD_KEYS,
  OVER,
  PUZZLE,
  type BoardKey,
  type PuzzleLabel,
  type PuzzlePiece,
} from "@/lib/partnerPuzzle";
import "./PartnerPuzzle.css";

/**
 * The partner network, as a finished jigsaw with Sophic in the middle of it.
 *
 * Twenty-seven pieces and no gaps. That is the whole argument the section makes,
 * and it is the reason this is a puzzle rather than a grid: a grid of logos says
 * "here are some partners", and a completed puzzle says the thing the brief
 * actually says, which is that the picture is not finished without them. Sophic
 * is the largest piece and the only dark one, so it stays the subject however
 * the board is shaped.
 *
 * Where every piece stands, and the shape it is cut to, is worked out in
 * lib/partnerPuzzle. This file is the markup and nothing else.
 *
 * Three things about the markup are load-bearing rather than incidental:
 *
 *   One set of pieces, three boards. Each piece carries its column, row and
 *   clip path for all three, as custom properties; the stylesheet picks a set
 *   per breakpoint. Rendering three boards would mean three copies of every
 *   logo in the document.
 *
 *   The clip is on the face, and the shadow is on the link around it. A filter
 *   applies before clipping on the same element, so a drop shadow drawn on the
 *   clipped face would be cut away with the piece's own tabs.
 *
 *   The link is `pointer-events: none` and the face inside it is not. Twenty-
 *   seven absolutely positioned boxes overlap — they have to, since a tab
 *   reaches into its neighbour's box — and hit-testing reads boxes, not pixels.
 *   Taking the link out of hit-testing leaves the clipped face as the only
 *   target, and a clip *does* cut hit-testing, so a click lands on the piece
 *   the pointer is actually over. The click still reaches the anchor by
 *   bubbling, and focus is untouched.
 */

/** The measurements a board hands down. --over has to match OVER in
 *  lib/partnerPuzzle: the clip paths are drawn in a box that size, and the
 *  stylesheet is what gives the box that size. */
const boardVars = { "--over": OVER } as CSSProperties;

/**
 * The board's reading order: each name followed by its own pieces, then Sophic.
 *
 * Where a piece *stands* is decided entirely by its coordinates, so the markup
 * is free to be ordered for the reader instead — and a heading followed by the
 * links it names is a structure every screen reader already knows how to work
 * with. Flat, the section announced three headings and then twenty-six links
 * with nothing joining them up.
 *
 * Sophic goes last for a second reason: among positioned siblings, later means
 * on top. Rendered first, the largest piece on the board is the only one with
 * every neighbour's shadow falling across it and none of its own showing.
 */
const READING_ORDER = PUZZLE.labels.map((label) => ({
  label,
  pieces: PUZZLE.partners.filter((piece) => piece.group === label.group),
}));

export function PartnerPuzzle() {
  return (
    // Light, and the only light band on this page. Twenty-six white pieces on
    // the near-black the sections above use would be twenty-six lamps; on a pale
    // ground they are card on a table, which is also what lets the shadows under
    // them read as thickness.
    <section className="partner-puzzle">
      <div className="partner-puzzle__frame">
        <h2 className="sr-only">{PUZZLE.heading}</h2>

        {/* Every distinct piece outline, once. Deduplicated by shape in
            lib/partnerPuzzle — seventy-eight partner cells across the three
            boards come out of a couple of dozen shapes, because a one-cell
            piece is fully described by its four edges.

            objectBoundingBox units, so one path fits a piece at any size on any
            board with no transform. Zero-sized and aria-hidden: it is a
            definitions block, not a picture. */}
        <svg className="partner-puzzle__defs" aria-hidden="true" focusable="false">
          <defs>
            {PUZZLE.clips.map(({ id, d }) => (
              <clipPath key={id} id={`jig-${id}`} clipPathUnits="objectBoundingBox">
                <path d={d} />
              </clipPath>
            ))}
          </defs>
        </svg>

        {/* Reveal is the trigger and nothing else. It writes the attribute the
            assembly keys off, and its own fade is turned off in the stylesheet:
            twenty-seven pieces landing behind one block-wide fade is the same
            entrance played twice, and the pieces are the version worth
            watching. `once`, because a puzzle that takes itself apart every time
            you scroll past is a loop rather than an arrival. */}
        <Reveal once>
          <div className="partner-puzzle__stage">
            <div className="partner-puzzle__board" style={boardVars}>
              {READING_ORDER.map(({ label, pieces }) => (
                <Fragment key={label.group}>
                  <Label label={label} />
                  {pieces.map((piece) => (
                    <Piece key={piece.id} piece={piece} />
                  ))}
                </Fragment>
              ))}
              <Piece piece={PUZZLE.centre} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Suffixes the three sets of per-board custom properties are written under. */
const SUFFIX: Record<BoardKey, string> = {
  narrow: "n",
  medium: "m",
  wide: "w",
};

function pieceVars(piece: PuzzlePiece): CSSProperties {
  const vars: Record<string, string> = {
    "--tint": piece.tint,
    "--delay": `${piece.delay}ms`,
  };
  for (const key of BOARD_KEYS) {
    const at = piece.at[key];
    const s = SUFFIX[key];
    vars[`--col-${s}`] = String(at.col);
    vars[`--row-${s}`] = String(at.row);
    vars[`--pw-${s}`] = String(at.w);
    vars[`--ph-${s}`] = String(at.h);
    vars[`--mark-${s}`] = `${at.logo}%`;
    vars[`--clip-${s}`] = `url(#jig-${at.clip})`;
  }
  return vars as CSSProperties;
}

/**
 * One piece.
 *
 * Sophic's is the same element as everybody else's — same clip, same box, same
 * arithmetic — carrying a different mark on a dark face and standing on more
 * cells. Making it a separate component would be two copies of the placement
 * rules that could quietly disagree.
 */
function Piece({ piece }: { piece: PuzzlePiece }) {
  const isSophic = piece.id === "sophic";
  const style = pieceVars(piece);

  const face = (
    <span
      className="partner-puzzle__face"
      data-sophic={isSophic ? "true" : undefined}
    >
      {piece.logo ? (
        <Image
          className="partner-puzzle__mark"
          src={piece.logo}
          alt={isSophic ? PARTNER_NETWORK.centre.name : piece.name}
          width={isSophic ? PARTNER_NETWORK.centre.width : PARTNER_LOGO_BOX.width}
          height={isSophic ? PARTNER_NETWORK.centre.height : PARTNER_LOGO_BOX.height}
          // The mark is 2.4 cells across for Sophic and 0.62 for a partner, and
          // a cell is the board's width over its column count — so these follow
          // the three boards rather than being guessed at.
          sizes={
            isSophic
              ? "(min-width: 64rem) 26rem, (min-width: 48rem) 16rem, 10rem"
              : "(min-width: 64rem) 7rem, (min-width: 48rem) 4.5rem, 3rem"
          }
        />
      ) : (
        // The company written out, not a stand-in drawing of a logo — a normal
        // way to list a partner, and one that cannot be mistaken for their mark.
        <span className="partner-puzzle__name">{piece.name}</span>
      )}
    </span>
  );

  // A partner without a confirmed address stays a plain piece rather than
  // becoming a link to a guess — see the note in lib/partners.
  if (!piece.href) {
    return (
      <div
        className="partner-puzzle__piece"
        data-sophic={isSophic ? "true" : undefined}
        style={style}
      >
        {face}
      </div>
    );
  }

  return (
    <a
      className="partner-puzzle__piece"
      style={style}
      href={piece.href}
      target="_blank"
      rel="noreferrer"
    >
      {face}
      {/* The mark's alt names the company; this adds what the link does, so a
          screen reader announces "Beckhoff, opens in a new tab" rather than
          leaving the new window as a surprise. */}
      <span className="sr-only"> — opens in a new tab</span>
    </a>
  );
}

/**
 * One group's name, hung off the edge of the board along its own run of
 * columns.
 *
 * A rule the width of that run does the pointing, which is why there are no
 * leader lines here: the name is already touching its own pieces, on all three
 * boards, so there is nothing left to point at.
 */
function Label({ label }: { label: PuzzleLabel }) {
  const vars: Record<string, string> = { "--tint": label.tint };
  for (const key of BOARD_KEYS) {
    const s = SUFFIX[key];
    vars[`--from-${s}`] = String(label.at[key].from);
    vars[`--span-${s}`] = String(label.at[key].to - label.at[key].from + 1);
  }

  return (
    <h3
      className="partner-puzzle__label"
      data-side={label.side}
      style={vars as CSSProperties}
    >
      {label.text}
    </h3>
  );
}
