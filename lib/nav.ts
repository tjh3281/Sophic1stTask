import type { Route } from "next";

/**
 * Header navigation config.
 *
 * Every item here now has a page. The type keeps `href` optional all the same:
 * it is what NavButton reads to decide between a link and an inert button, and
 * the next item added to this bar will very likely arrive before its page does.
 */
export type HeaderNavItem = {
  label: string;
  /**
   * The item opens into what sits beneath it: a dropdown on the bar, and an
   * accordion inside the mobile drawer.
   *
   * The item stays a real link in both. An earlier mega menu took the click
   * for itself, which made the one item with somewhere to go the one item you
   * could not simply go to; this flag adds a panel and changes nothing about
   * the link. See components/layout/SolutionMenu.
   */
  hasMenu?: boolean;
  /** Rendered as the filled call-to-action at the end of the bar. */
  cta?: boolean;
  /** Where it goes. Absent means the item is still inert. Kept separate from
   *  `cta`, which only says how the item is drawn — the two happen to coincide
   *  on Contact, and reading style as behaviour is how that quietly breaks the
   *  day someone makes a different item the call to action. */
  href?: Route;
};

export const HEADER_NAV: HeaderNavItem[] = [
  { label: "Company", href: "/company" },
  { label: "Solution", hasMenu: true, href: "/solutions" },
  { label: "Partners", href: "/partners" },
  { label: "Careers", href: "/careers" },
  { label: "Community", href: "/community" },
  { label: "Contact", cta: true, href: "/contact" },
];

/**
 * Whether a bar item is the page the reader is on.
 *
 * Prefix match, not equality: /solutions/inspection-testing/machine-vision is
 * three levels below the item that led there, and a reader four clicks into a
 * section still wants the bar to tell them which section it is. The same rule
 * puts /careers/openings and every role page under Careers.
 *
 * Nothing in HEADER_NAV points at "/", which is what makes the prefix safe —
 * an item for the home page would match every route on the site.
 */
export function isCurrentSection(
  item: HeaderNavItem,
  pathname: string,
): boolean {
  if (!item.href) return false;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
