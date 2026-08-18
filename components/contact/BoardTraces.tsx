"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The copper between the cards.
 *
 * One SVG laid under the whole board, drawing a track from each field down to
 * the pin it feeds, with a pad at each end — the arrangement the reference
 * hero uses for its globe, where every point is a dot with a thin leader line
 * running off it.
 *
 * Every track carries current from the moment the page loads. That is
 * deliberate and it is the one thing to understand before changing anything
 * here: the board is always running, and completing a field does not start the
 * animation, it *lights* the track — the colour comes up, the pill fills in,
 * and the whole group picks up a glow. A dark board with nothing moving on it
 * looks broken rather than empty, which is the opposite of what an empty form
 * should say.
 *
 * The geometry is measured rather than authored. The obvious alternative — a
 * fixed viewBox with the paths written by hand — needs `preserveAspectRatio:
 * none` to fill a box whose proportions change with the text in it, and that
 * scales x and y unequally: the corner radii turn into ellipses and the track
 * widths change with the window. Measuring the real boxes means the tracks
 * land on the cards at every width, and the layout below `lg` — where the
 * cards stack into one column — needs no separate set of paths at all, because
 * the same rule produces a straight vertical drop when two boxes are already
 * in line.
 *
 * Nothing here reads or writes anything but geometry. Which tracks are lit is
 * decided by the form and arrives as a prop — and deliberately does not go
 * into the measured state below, because that state is only recomputed when
 * something moves. Stored there, a field going valid between two resizes would
 * not light up until the next one.
 */

/** Anything with a `.current` that may or may not be mounted yet. */
type ElementRef = { current: HTMLElement | null };

export type TraceLink = {
  id: string;
  /** Leaves the bottom edge of this element — or a side edge, for a stub. */
  from: ElementRef;
  /** Enters the top edge of this element. Omitted for a stub. */
  to?: ElementRef;
  /** Where along the source's bottom edge to leave, 0 (left) to 1 (right). */
  fromAt?: number;
  /** Where along the target's top edge to arrive. */
  toAt?: number;
  /**
   * Runs off the side of the part and ends in a pad, wired to nothing.
   *
   * Every board has them — tracks to a test point, or to a footprint that was
   * never populated. They carry current like the rest, which is the point:
   * they say the part is doing more than the two things the form asks about.
   */
  side?: "left" | "right";
  /** This track's own colour, so the board is not one blue. */
  colour: string;
  /** Lit: full colour, filled pill, and a glow around the group. */
  live: boolean;
};

/** Where one track runs, and its pads. */
type Geometry = {
  d: string;
  /** The pad it leaves from. */
  x: number;
  y: number;
  /** The pad it ends on — stubs only, where nothing is there to receive it. */
  ex?: number;
  ey?: number;
};

/**
 * How much of a corner to round off.
 *
 * Real tracks on a board are mitred rather than square, for reasons of etching
 * that do not apply here — but the eye reads a hard 90° corner on a thin line
 * as an artefact, and this is small enough to stay a corner rather than
 * becoming a curve.
 */
const CORNER = 12;

/** Below this the two boxes are in line and the track is a straight drop. */
const STRAIGHT_WITHIN = 1.5;

/** How far a stub runs out from the part, and how far it then drops. */
const STUB_RUN = 54;
const STUB_DROP = 34;

/**
 * One track, as an SVG path.
 *
 * Down out of the source, across at the midpoint, then down into the target —
 * the routing a board actually uses, and the one the reader can follow with
 * their eye because every segment is either vertical or horizontal.
 *
 * The corner radius is clamped to half of each leg so the two curves can never
 * overlap and turn the elbow inside out, which is what a fixed radius does as
 * soon as the boxes come close together on a narrow screen.
 */
function route(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (Math.abs(dx) < STRAIGHT_WITHIN) return { d: `M ${x1} ${y1} V ${y2}` };

  const midY = y1 + dy / 2;
  const r = Math.min(CORNER, Math.abs(dx) / 2, Math.abs(dy) / 2);
  // Sign, not magnitude — the radius above is already the distance.
  const sx = Math.sign(dx);
  const sy = Math.sign(dy);

  return {
    d: [
      `M ${x1} ${y1}`,
      `V ${midY - r * sy}`,
      `Q ${x1} ${midY} ${x1 + r * sx} ${midY}`,
      `H ${x2 - r * sx}`,
      `Q ${x2} ${midY} ${x2} ${midY + r * sy}`,
      `V ${y2}`,
    ].join(" "),
  };
}

/** A track off the side of the part, ending nowhere. */
function stub(x1: number, y1: number, side: "left" | "right") {
  const sx = side === "left" ? -1 : 1;
  const x2 = x1 + STUB_RUN * sx;
  const y2 = y1 + STUB_DROP;
  const r = Math.min(CORNER, STUB_RUN / 2, STUB_DROP / 2);

  return {
    d: [
      `M ${x1} ${y1}`,
      `H ${x2 - r * sx}`,
      `Q ${x2} ${y1} ${x2} ${y1 + r}`,
      `V ${y2}`,
    ].join(" "),
    ex: x2,
    ey: y2,
  };
}

export function BoardTraces({
  containerRef,
  links,
}: {
  containerRef: ElementRef;
  links: TraceLink[];
}) {
  const [geometry, setGeometry] = useState<Map<string, Geometry>>(
    () => new Map(),
  );
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Held in a ref as well as read as a prop, so the measuring effect does not
  // have to re-run on every keystroke: remeasuring the whole board because a
  // character was typed is wasted layout.
  //
  // Written in an effect rather than during render. Both are correct here —
  // nothing renders from it — but a ref assigned while rendering is invisible
  // to React and the rule against it exists because that is nearly always a
  // bug. This effect is declared first so it has already run by the time the
  // measuring one below fires on mount.
  const linksRef = useRef(links);
  useEffect(() => {
    linksRef.current = links;
  });

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const box = container.getBoundingClientRect();
    const next = new Map<string, Geometry>();

    for (const link of linksRef.current) {
      const from = link.from.current;
      if (!from) continue;
      const a = from.getBoundingClientRect();

      if (link.side) {
        // Leaves the side of the part at its vertical middle.
        const x1 =
          (link.side === "left" ? a.left : a.right) - box.left;
        const y1 = a.top - box.top + a.height / 2;
        next.set(link.id, { x: x1, y: y1, ...stub(x1, y1, link.side) });
        continue;
      }

      const to = link.to?.current;
      if (!to) continue;
      const b = to.getBoundingClientRect();

      // Relative to the container, which is what the SVG's own coordinates
      // are. Both rects are viewport-based, so one subtraction does it and
      // scroll position cancels out.
      const x1 = a.left - box.left + a.width * (link.fromAt ?? 0.5);
      const y1 = a.bottom - box.top;
      const x2 = b.left - box.left + b.width * (link.toAt ?? 0.5);
      const y2 = b.top - box.top;

      // A target above its source cannot be routed downhill, and drawing it
      // anyway produces a track that doubles back through the card it came
      // from. It happens for a frame or two while the grid settles; skipping
      // is what keeps that off the screen.
      if (y2 < y1) continue;

      next.set(link.id, { x: x1, y: y1, ...route(x1, y1, x2, y2) });
    }

    setSize({ width: box.width, height: box.height });
    setGeometry(next);
  }, [containerRef]);

  useEffect(() => {
    measure();

    // Observing the endpoints and not only the container. A card growing by
    // one line of validation text moves every pin under it without changing
    // the board's own height, and a container-only observer sleeps through
    // exactly the case these tracks have to follow.
    const observer = new ResizeObserver(measure);
    const container = containerRef.current;
    if (container) observer.observe(container);
    for (const link of linksRef.current) {
      if (link.from.current) observer.observe(link.from.current);
      if (link.to?.current) observer.observe(link.to.current);
    }

    // A resize can move the board without resizing anything observed above —
    // the page's own margins are a function of the window.
    window.addEventListener("resize", measure);

    // Web fonts land after first paint and reflow every card on the board.
    // Typed loosely because the API is not in every engine this has to render
    // in, and a bare access there would throw inside the effect.
    const fonts = document.fonts as FontFaceSet | undefined;
    void fonts?.ready.then(measure).catch(() => {
      // Nothing to do: the observers above still catch the reflow itself.
    });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
    // links.length rather than links: the array identity changes on every
    // render, and what this effect actually depends on — which elements are
    // wired up — only changes when one is added or removed.
  }, [measure, containerRef, links.length]);

  // Nothing measured yet. An SVG with no viewBox takes an intrinsic 300x150,
  // which is a visible box on the page for the frame before the first effect.
  if (size.width === 0 || size.height === 0) return null;

  return (
    <svg
      aria-hidden="true"
      className="board-traces"
      width={size.width}
      height={size.height}
      viewBox={`0 0 ${size.width} ${size.height}`}
      fill="none"
    >
      {/* Mapped over the live prop rather than over the measured geometry, so
          a field going valid repaints on the same render that decided it. */}
      {links.map((link) => {
        const g = geometry.get(link.id);
        if (!g) return null;
        return (
          <g
            key={link.id}
            data-live={link.live}
            // The one place a track's colour is set. Everything in the
            // stylesheet — stroke, pad fill, pill fill, glow — reads it from
            // here, so a track is one colour by construction rather than by
            // four rules agreeing with each other.
            style={{ "--trace": link.colour } as React.CSSProperties}
          >
            <path className="board-trace__base" d={g.d} />
            <path className="board-trace__flow" d={g.d} />
            {/* pathLength normalises every track to 1 unit long, whatever its
                real geometry. That is what lets one stylesheet dash both a
                short drop and a long dog-leg identically — without it each
                would need its own dasharray measured with getTotalLength(). */}
            <path className="board-trace__pulse" d={g.d} pathLength={1} />

            <circle className="board-trace__pad" cx={g.x} cy={g.y} r={3.5} />
            {g.ex !== undefined && g.ey !== undefined && (
              // The terminal a stub ends on. Hollow, because there is nothing
              // under it — a filled pad would look like a connection made.
              <circle
                className="board-trace__pad board-trace__pad--open"
                cx={g.ex}
                cy={g.ey}
                r={4}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
