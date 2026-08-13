import type { Metadata } from "next";
import { Anniversary } from "@/components/home/Anniversary";
import { Awards } from "@/components/home/Awards";
import { Hero } from "@/components/home/Hero";
import { WhySophic } from "@/components/home/WhySophic";

export const metadata: Metadata = {
  // Absolute, so the root of the site is not titled "Home — Sophic
  // Automation". Every other page takes the layout's "%s — Sophic Automation"
  // template; this one is the thing being named.
  title: { absolute: "Sophic Automation — Transforming Your Business" },
  description:
    "Assembly, inspection, material handling and electrical test automation, engineered into your production line.",
};

/**
 * The home page, and the site's front door.
 *
 * It lives at the root rather than at a /home of its own because the whole site
 * already assumed that: every breadcrumb trail on every solution and careers
 * page opens with Home pointing here, and the header's logo goes here from
 * anywhere. The solutions overview that used to occupy this route moved to
 * /solutions, at the head of the four category pages that were already under
 * it.
 *
 * Four screens, and only one change of ground between the first and the last.
 * The hero is dark; the awards section and the company statement under it are
 * both white, so the middle of the page reads as one light body rather than as
 * a stack of alternating bands; and the anniversary band closes on the dark the
 * page opened in. Two bookends around a white centre — which is also why the
 * fireworks can be where they are, since they need a night to go off in.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Awards />
      <WhySophic />
      <Anniversary />
    </>
  );
}
