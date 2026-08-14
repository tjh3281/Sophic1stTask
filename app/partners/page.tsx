import type { Metadata } from "next";
import { PartnerNetwork } from "@/components/partners/PartnerNetwork";
import { PartnerPillars } from "@/components/partners/PartnerPillars";
import { PartnersCover } from "@/components/partners/PartnersCover";
import { PARTNERS_HERO } from "@/lib/partners";

export const metadata: Metadata = {
  title: "Partners",
  description: `${PARTNERS_HERO.headline} ${PARTNERS_HERO.lead}`,
};

/**
 * The partners page.
 *
 * Dark the whole way down, and the only page here that is. The two sections
 * carry different fields — the cover's stars are a shader, the section below is
 * a cloud of GL points — but they share a ground, and the join between them is
 * faded rather than cut so it reads as one sky with two weathers in it.
 *
 * The cover deliberately stops short of a full screen so the statement below is
 * already breaking the top of the fold. It is a page about partnership; opening
 * on a screen that says only "we're not alone" and makes you scroll to find out
 * who "we" is would be the wrong first move.
 */
export default function PartnersPage() {
  return (
    <>
      <PartnersCover />
      <PartnerPillars />
      {/* No -mb-24 here, unlike the other pages that end on a dark band. That
          margin exists to close the strip of bare page a dark section leaves
          above the near-white footer; this section is pale itself, so the
          footer's own margin is doing the job it was written for. */}
      <PartnerNetwork />
    </>
  );
}
