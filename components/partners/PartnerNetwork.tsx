import Image from "next/image";
import type { CSSProperties } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import {
  PARTNER_LOGO_BOX,
  PARTNER_NETWORK,
  type PartnerLogo,
} from "@/lib/partners";
import "./PartnerNetwork.css";

/**
 * The partner wall: three groups of hexagons around Sophic's own.
 *
 * On a wide screen the groups take the three positions the brief asks for —
 * one left of Sophic, one right, one below — and which group goes where is
 * decided by how many are in it rather than by rank. "Things of Internet" has
 * fourteen partners against eight and four, so it is the one that goes below,
 * where there is a full page width to lay five tiles across. Put it in a side
 * column and it would be four rows deep and taller than the map.
 *
 * Below lg the map stacks and the comb gives way to a plain wrapping grid, for
 * the reason in the stylesheet: five tiles across does not fit a phone.
 *
 * There is no visible heading. The three group labels are the headings a
 * reader needs, and a fourth over the top of them would be a title for a wall
 * of logos that already says what it is — so the section's name is carried
 * screen-reader-only, the same arrangement the home page's awards section uses.
 */
export function PartnerNetwork() {
  return (
    // Light, and the only light band on this page. The wall is twenty-six white
    // hexagons: on the near-black the sections above it use, twenty-six white
    // shapes are twenty-six lamps, and the logos stop being a list and become a
    // glare. On a pale ground they are paper on a table, which is also what
    // lets the shadows under them read as height.
    <section className="partner-net pb-24 pt-16 sm:pb-28 sm:pt-20">
      <Container>
        <h2 className="sr-only">{PARTNER_NETWORK.heading}</h2>

        <Reveal>
          <div className="partner-net__map">
            {PARTNER_NETWORK.groups.map((group) => (
              <div
                key={group.slug}
                className="partner-net__group"
                data-slug={group.slug}
                data-shifted={group.shifts ? "" : undefined}
              >
                <h3 className="partner-net__label">{group.label}</h3>

                {/* Wraps the rows so that below lg, where the rows become
                    `display: contents`, their tiles have a flex container of
                    their own to wrap inside. */}
                <div className="partner-net__group-tiles">
                  {group.rows.map((row, index) => (
                    <div
                      key={index}
                      className="partner-net__row"
                      // Half-tiles from the group's left edge, for the two
                      // groups that lie on their side. Unset elsewhere, and the
                      // stylesheet falls back to centring the row.
                      style={
                        group.shifts
                          ? ({ "--shift": group.shifts[index] } as CSSProperties)
                          : undefined
                      }
                    >
                      {row.map((partner) => (
                        <Tile key={partner.name} partner={partner} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="partner-net__centre">
              <div className="partner-net__cell partner-net__cell--centre">
                <div className="partner-net__tile partner-net__tile--centre">
                  <Image
                    src={PARTNER_NETWORK.centre.logo}
                    alt={PARTNER_NETWORK.centre.name}
                    width={PARTNER_NETWORK.centre.width}
                    height={PARTNER_NETWORK.centre.height}
                    sizes="(min-width: 64rem) 16rem, 11rem"
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
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
 * of dimensions for all of them. That is what makes the wall even: the tile
 * gives each image an identical box, and the artwork inside was already
 * trimmed and fitted to that box before it got here.
 */
function Tile({ partner }: { partner: PartnerLogo }) {
  return (
    <div className="partner-net__cell">
      {partner.logo ? (
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
      )}
    </div>
  );
}
