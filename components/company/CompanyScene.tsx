"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { officeByAlias, officeMapsUrl } from "@/lib/contact";
import "./CompanyScene.css";

/**
 * The two offices, built out of the ground when the reader reaches them — and
 * each one a link to where it actually is.
 *
 * Five separate pieces rather than one flat picture, which is the whole point:
 * the grass comes up first, then the shophouse, then the plant, and each of
 * them grows upward from the ground line rather than fading in or sliding
 * down. A single composed image could only ever do the last of those, and none
 * of it could be pointed at.
 *
 * The growth is a bottom-up clip wipe, not a slide. The difference matters and
 * it is not a detail: sliding a building up behind a mask shows the roof first
 * and the doorstep last, which reads as the building descending from the sky
 * however you time it. Wiping the clip open from the bottom edge keeps the base
 * planted where it will stand and grows the walls up out of it.
 *
 * Everything is placed as a percentage of one box with a fixed aspect ratio, so
 * the whole scene scales as a unit and the buildings never drift off the grass.
 * The numbers come from the reference artwork and are noted in the stylesheet.
 *
 * This component only decides *when* the build runs, the same arrangement
 * MedalDrop uses: an observer that fires once, disconnects, and writes a data
 * attribute the stylesheet keys off. There is no per-frame JavaScript here.
 */

/**
 * How far into view the scene has to come before it starts building.
 *
 * The negative bottom margin shrinks the observer's idea of the viewport from
 * below, so this waits until the scene has properly arrived rather than firing
 * on the first pixel of it — the sequence runs for about two seconds, and
 * starting it at the very bottom of the screen means most of it has played
 * before there is anything to look at.
 */
const TRIGGER_ROOT_MARGIN = "0px 0px -18% 0px";

/**
 * A building: a picture of an office, and a link to it.
 *
 * The address is not written here. It comes from lib/contact, which the footer
 * and the contact page also read, so there is one copy of where Sophic is and
 * these pins cannot drift away from the addresses printed at the foot of every
 * page. `label` is the only string that belongs to this component, because it
 * is the name on the drawing rather than a fact about the company — Sophic's
 * own material calls the buildings Theta and Beta.
 */
type Site = {
  key: string;
  src: string;
  width: number;
  height: number;
  delay: number;
  duration: number;
  /** The internal building name, matched against lib/contact. */
  alias: string;
  label: string;
  /**
   * Where the label sits, as a percentage of *this building's* height rather
   * than the scene's — so it stays put against its own roofline at any size.
   * Negative floats it above the roof, which only the low, wide plant has room
   * for; the shophouse is nearly the full height of the scene and its label
   * has to sit on the building itself.
   */
  labelY: string;
};

// Each building waits for the group before it to have all but finished. The
// overlap is a hundred milliseconds or so — enough that the sequence flows
// rather than stopping between steps, little enough that the order still reads
// as ground, then shophouse, then plant.
const SITES: Site[] = [
  {
    key: "building-1",
    src: "/images/company-building-1.png",
    width: 497,
    height: 658,
    delay: 640,
    duration: 900,
    alias: "Theta Office",
    label: "Theta Office (HQ)",
    labelY: "7%",
  },
  {
    key: "building-2",
    src: "/images/company-building-2.png",
    width: 716,
    height: 404,
    delay: 1180,
    duration: 900,
    alias: "Beta Office",
    label: "Beta Office (Png branch)",
    labelY: "-26%",
  },
];

/** The bushes. Decorative, and painted in front of the buildings — the
 *  reference has them overlapping the plinths. They go up together, 80ms
 *  apart: close enough to read as one movement, far enough that the ground
 *  does not snap into existence all at once. */
const DECOR = [
  { key: "grass-2", src: "/images/company-grass-2.png", width: 609, height: 55, delay: 80 },
  { key: "grass-1", src: "/images/company-grass-1.png", width: 536, height: 79, delay: 0 },
  { key: "grass-3", src: "/images/company-grass-3.png", width: 509, height: 56, delay: 160 },
];

const DECOR_DURATION = 560;

export function CompanyScene({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // No observer means no way to know where the reader is, and a scene that
    // never builds is worse than one that was already standing.
    if (typeof IntersectionObserver === "undefined") {
      root.dataset.state = "build";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          // Once. A skyline that rebuilds itself every time you scroll past
          // stops being an arrival and becomes a loop.
          observer.disconnect();
          root.dataset.state = "build";
        }
      },
      { rootMargin: TRIGGER_ROOT_MARGIN },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    // Not aria-hidden, unlike most of the site's illustrations. Two of the five
    // pieces are links now, and a link inside a hidden subtree is a control
    // nobody using a screen reader or a keyboard can reach — the whole picture
    // has to be in the tree for those two to be.
    <div
      ref={rootRef}
      data-state="idle"
      className={`company-scene${className ? ` ${className}` : ""}`}
    >
      {SITES.map((site) => {
        const office = officeByAlias(site.alias);
        return (
          <a
            key={site.key}
            className={`company-scene__site company-scene__${site.key}`}
            style={{ "--label-y": site.labelY } as React.CSSProperties}
            // A new tab, because this leaves for a map and the reader is in the
            // middle of reading about the company.
            href={office ? officeMapsUrl(office) : "https://www.google.com/maps"}
            target="_blank"
            rel="noopener noreferrer"
            // The picture inside carries no alt text and the label is hidden
            // until hover, so without this the link would announce as nothing
            // at all. It opens with the visible label so that what is said and
            // what is shown are the same name.
            aria-label={`${site.label} — open in Google Maps`}
          >
            <Image
              className="company-scene__piece"
              src={site.src}
              alt=""
              width={site.width}
              height={site.height}
              sizes="(min-width: 1024px) 26rem, 46vw"
              style={
                {
                  "--delay": `${site.delay}ms`,
                  "--duration": `${site.duration}ms`,
                } as React.CSSProperties
              }
            />
            <span aria-hidden="true" className="company-scene__label">
              {site.label}
              <span className="company-scene__label-hint">*Click for Maps</span>
            </span>
          </a>
        );
      })}

      {DECOR.map((piece) => (
        <Image
          key={piece.key}
          className={`company-scene__piece company-scene__decor company-scene__${piece.key}`}
          src={piece.src}
          alt=""
          width={piece.width}
          height={piece.height}
          sizes="(min-width: 1024px) 20rem, 40vw"
          style={
            {
              "--delay": `${piece.delay}ms`,
              "--duration": `${DECOR_DURATION}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
