import type { Metadata } from "next";
import { Awards } from "@/components/home/Awards";
import { Hero } from "@/components/home/Hero";

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
 * Two screens so far, and they share a background on purpose: the awards
 * section carries on the hero's dark rather than starting a new one, so the
 * medal it lowers has somewhere above the fold to be lowered from.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Awards />
    </>
  );
}
