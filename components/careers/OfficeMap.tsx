import type { CSSProperties } from "react";
import {
  COLS,
  DOTS,
  DOT_RADIUS,
  MAP_LINKS,
  MAP_NODES,
  ROWS,
  SETTLED_AT,
} from "@/lib/officeMap";
import "./OfficeMap.css";

/**
 * Where Sophic is, as a dot map — the careers cover's backdrop.
 *
 * The whole thing is static markup and CSS animations. No "use client", no
 * canvas, no measuring: the dots are generated on the server and shipped in the
 * HTML, and the sequence over the top of them is a set of delays. That matters
 * more here than anywhere else on the site, because this is the first thing on
 * the page and the last thing that should be waiting on a hydration pass.
 *
 * It runs once and then holds. The map settles in, Penang lights up, a line
 * travels down to Kuala Lumpur and on to Singapore — and once all three are
 * connected the intro is over and what is left is the resting state: the pins
 * breathing, particles running the routes. Nothing replays. An entrance that
 * loops is a thing that keeps demanding to be looked at, and this one sits
 * behind a headline that is trying to be read.
 *
 * Decorative, and marked so. A dot at 48.8, 38.5 is not information, and the
 * three city labels on it are a picture of a fact the cover states in words
 * directly underneath — see the line under the buttons in CareersCover.
 *
 * The element carries no size of its own. Where it goes and how big it is are
 * the cover's business, in CareersCover.css; all this fixes is the shape, via
 * the aspect ratio it takes from the grid.
 */
export function OfficeMap() {
  return (
    <div
      className="office-map"
      aria-hidden="true"
      style={{ "--om-cols": COLS, "--om-rows": ROWS } as CSSProperties}
    >
      <svg className="office-map__svg" viewBox={`0 0 ${COLS} ${ROWS}`}>
        {/* Two passes over the same lattice. Malaysia and Singapore are drawn
            at full strength and their neighbours at a third of it — southern
            Thailand, Sumatra and the Riau islands are only here so that the
            Strait of Malacca has two sides and the peninsula stops looking
            like a shape floating in space. */}
        <g className="office-map__field">
          <g className="office-map__land office-map__land--near">
            {DOTS.filter((dot) => !dot.home).map((dot) => (
              <circle
                key={`${dot.x}-${dot.y}`}
                cx={dot.x}
                cy={dot.y}
                r={DOT_RADIUS}
              />
            ))}
          </g>
          <g className="office-map__land office-map__land--home">
            {DOTS.filter((dot) => dot.home).map((dot) => (
              <circle
                key={`${dot.x}-${dot.y}`}
                cx={dot.x}
                cy={dot.y}
                r={DOT_RADIUS}
              />
            ))}
          </g>
        </g>

        {MAP_LINKS.map((link) => (
          <g key={link.key}>
            <path
              className="office-map__link"
              d={link.d}
              style={
                {
                  "--om-len": link.length.toFixed(2),
                  "--om-in": `${link.at}s`,
                } as CSSProperties
              }
            />

            {/* The same curve again, once per particle, wearing a dash pattern
                of one short mark and a gap the length of the whole path — so
                exactly one mark is ever on it, and moving the dash offset by
                one period walks that mark from end to end. A round cap on a
                mark this short is what makes it a dot rather than a streak. */}
            {link.particles.map((delay, slot) => (
              <path
                key={slot}
                className="office-map__particle"
                d={link.d}
                style={
                  {
                    "--om-len": link.length.toFixed(2),
                    "--om-travel": (-link.length - 0.01).toFixed(2),
                    "--om-travel-time": `${link.travel.toFixed(2)}s`,
                    "--om-in": `${(SETTLED_AT + delay).toFixed(2)}s`,
                  } as CSSProperties
                }
              />
            ))}
          </g>
        ))}

        {MAP_NODES.map((node) => (
          <g
            key={node.key}
            className="office-map__pin"
            style={
              {
                "--om-in": `${node.at}s`,
                "--om-settled": `${SETTLED_AT}s`,
              } as CSSProperties
            }
          >
            {/* Expands and fades out from under the pin, on repeat. It starts
                the moment the pin lands, so the ripple that announces a city
                and the ripple that keeps it alive are the same animation
                rather than two that have to be handed over between. */}
            <circle className="office-map__ripple" cx={node.x} cy={node.y} r={0.9} />
            <circle className="office-map__halo" cx={node.x} cy={node.y} r={1.5} />
            <circle
              className="office-map__dot"
              cx={node.x}
              cy={node.y}
              r={node.headquarters ? 0.6 : 0.48}
            />
          </g>
        ))}
      </svg>

      {/* Real text rather than SVG <text>: the labels have to stay legible at
          whatever size the cover gives the map, and glyphs scaled by a viewBox
          would be four pixels tall on a phone. Both are placed off the same
          grid — this box carries the viewBox's aspect ratio, so a percentage
          here and a viewBox unit in there land in the same place. */}
      {MAP_NODES.map((node) => (
        <p
          key={node.key}
          className="office-map__label"
          style={
            {
              left: `${((node.x / COLS) * 100).toFixed(2)}%`,
              top: `${((node.y / ROWS) * 100).toFixed(2)}%`,
              // A beat behind the pin, so the dot lands and the name follows it
              // rather than the two arriving as one block.
              "--om-in": `${(node.at + 0.15).toFixed(2)}s`,
            } as CSSProperties
          }
        >
          {node.label}
        </p>
      ))}
    </div>
  );
}
