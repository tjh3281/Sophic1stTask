import Image from "next/image";
import Link from "next/link";
import type { CommunityCaption, CommunitySlot } from "@/lib/community";

/**
 * A frame with a photograph or a clip in it — or, until those exist, the mark
 * that says one belongs there.
 *
 * The two marks are drawn the way they were drawn in the layout: photographs
 * get the heavy black picture glyph, and the clip gets a black plate with
 * VIDEO across it in amber. They are loud on purpose. A subtle placeholder on a
 * page like this reads as a design choice and survives to production; one this
 * blunt cannot be mistaken for anything but a gap waiting to be filled.
 *
 * Both are decorative — `aria-hidden` — because an empty frame is not content.
 * The moment a slot gets a `src` it stops being decorative and starts carrying
 * the `alt` it was given.
 */

function PhotoMark() {
  return (
    <svg
      className="community-slot__glyph"
      viewBox="0 0 100 82"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="5"
        width="90"
        height="72"
        rx="10"
        stroke="currentColor"
        strokeWidth="10"
      />
      <circle cx="32" cy="30" r="9.5" fill="currentColor" />
      {/* Two peaks rather than one: a single triangle reads as a warning sign,
          and this has to read as a picture at a glance. */}
      <path
        d="M14 68 L41 36 L56 53 L68 41 L88 68 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Where and when, over the bottom of the frame, on hover.
 *
 * Hidden with `opacity` rather than `display` or `visibility` on purpose. Those
 * two take the text out of the accessibility tree along with the picture, and
 * then the only route to where and when a photograph was taken is a mouse — no
 * good to a screen reader, and no good on a touch screen either. At zero opacity
 * it is still read out in its place, straight after the `alt` of the photograph
 * it belongs to, which is exactly the order somebody would want it in.
 *
 * See the stylesheet for the rest of that argument: pointer devices get it on
 * hover, and anything without hover is simply shown it.
 */
function SlotCaption({ caption }: { caption: CommunityCaption }) {
  return (
    <span className="community-slot__caption">
      <CaptionLines caption={caption} />
    </span>
  );
}

function CaptionLines({ caption }: { caption: CommunityCaption }) {
  return (
    <>
      <span className="community-slot__caption-place">{caption.place}</span>
      <time className="community-slot__caption-date" dateTime={caption.iso}>
        {caption.date}
      </time>
    </>
  );
}

/**
 * The one frame that leads somewhere.
 *
 * Three layers rather than the plain caption's one, and the split is the whole
 * point of it: a frame that is a link has to say so while nobody is pointing at
 * it. A cue that appears on hover is not a cue — it is a confirmation, and it
 * confirms something the reader had already guessed by the time they see it.
 *
 *   veil   the darkening, on hover only. Nothing to say at rest.
 *   panel  the stack, always at full opacity, so it can hold a child that is
 *          visible when the veil is not — a child cannot out-opacity its
 *          parent, which is why this is not simply the plain caption with one
 *          more line in it.
 *   text   where and when, on hover. It keeps its space at rest even while
 *          invisible, so the button below does not jump when the veil arrives.
 *
 * The button is the standing cue and the reason for the restructure. It sits
 * just below the middle of the picture — near enough to the midline that the
 * frame's tilt barely moves it sideways, which is what keeps it clear of the
 * window edge the flank is clipped against. See the stylesheet.
 */
function SlotLink({
  href,
  caption,
}: {
  href: string;
  caption: CommunityCaption;
}) {
  return (
    <Link href={href} className="community-slot__link">
      <span aria-hidden="true" className="community-slot__veil" />
      <span className="community-slot__panel">
        <span className="community-slot__panel-text">
          <CaptionLines caption={caption} />
        </span>
        <span className="community-slot__cue">
          Read the story
          <span aria-hidden="true" className="community-slot__cue-arrow">
            →
          </span>
        </span>
      </span>
    </Link>
  );
}

export function MediaSlot({ slot }: { slot: CommunitySlot }) {
  if (slot.src) {
    return slot.kind === "video" ? (
      <video
        className="community-slot__media"
        src={slot.src}
        muted
        loop
        autoPlay
        playsInline
        preload="metadata"
        disablePictureInPicture
        tabIndex={-1}
      />
    ) : (
      <>
        <Image
          src={slot.src}
          alt={slot.alt ?? ""}
          fill
          className="community-slot__media"
          sizes="(min-width: 48rem) 30vw, 60vw"
        />
        {/* A frame that leads somewhere puts its caption inside the link, so
            the two are one target and the link has a name worth reading out.
            A frame that does not simply carries the caption. */}
        {slot.href && slot.caption ? (
          <SlotLink href={slot.href} caption={slot.caption} />
        ) : (
          slot.caption && <SlotCaption caption={slot.caption} />
        )}
      </>
    );
  }

  return slot.kind === "video" ? (
    <span aria-hidden="true" className="community-slot__video">
      VIDEO
    </span>
  ) : (
    <span aria-hidden="true" className="community-slot__photo">
      <PhotoMark />
    </span>
  );
}
