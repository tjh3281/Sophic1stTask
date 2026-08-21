import type { Metadata } from "next";
import { CommunityCover } from "@/components/community/CommunityCover";
import { CommunityGlobe } from "@/components/community/CommunityGlobe";
import { COMMUNITY_HERO } from "@/lib/community";
import "./community.css";

export const metadata: Metadata = {
  title: "Community",
  description: COMMUNITY_HERO.description,
};

/**
 * The community page.
 *
 * Two sections and nothing after them: a cover, and the globe sequence the whole
 * page exists for. Nothing has been invented to pad it out — see the note at the
 * top of lib/community for why the captions say as little as they do.
 *
 * It ends on the last drawing, deliberately. There used to be a closing band
 * here carrying the first of Sophic's own values — the one about the community
 * being one of the three parties that has to win — on the reasoning that a page
 * should hand the reader back to the site rather than stop. It does not need to.
 * The sequence ends on a held frame in a fixed sky, and a band of type under it
 * was the one thing on the page that broke that. The sentence itself is not
 * lost: it is on the company page's values board, which is where it was
 * transcribed from.
 *
 * The whole of it is in space. The four drawings are cut-outs with nothing
 * behind them, and the field they were drawn on is laid under the page rather
 * than under any one section — see community.css. That is what carries through
 * the transitions: the globe leaves, the next one arrives, and the sky they are
 * both in never moves.
 */
export default function CommunityPage() {
  return (
    <div className="community-page">
      {/* Fixed to the window, under everything on this page. Decorative, and
          the only element here that is not content.

          `data-sky` is the handle the globe sequence drives it by: it grows
          with the approach so that flying at the world reads as travelling
          rather than as zooming. The sequence looks for this and does without
          it if it is not here — see SKY_APPROACH in CommunityGlobe. */}
      <div aria-hidden="true" data-sky className="community-page__sky" />

      <CommunityCover />
      <CommunityGlobe />
    </div>
  );
}
