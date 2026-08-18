import Image from "next/image";
import type { CommunitySlot } from "@/lib/community";

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
      <Image
        src={slot.src}
        alt={slot.alt ?? ""}
        fill
        className="community-slot__media"
        sizes="(min-width: 48rem) 30vw, 60vw"
      />
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
