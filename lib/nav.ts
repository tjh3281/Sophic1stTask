import type { Route } from "next";

/**
 * Header navigation config.
 *
 * "Solution" resolves to real routes; "Careers" and "Contact" have pages. Every
 * other item is an inert prototype button — styled like a link, but it
 * deliberately goes nowhere.
 */
export type HeaderNavItem = {
  label: string;
  /**
   * Expands into the category list inside the mobile drawer.
   *
   * Only the drawer reads this. On the bar the item is an ordinary link like
   * every other one: it used to open a mega menu on hover, which put a panel
   * between the reader and a page they were already pointing at.
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
  { label: "Company" },
  { label: "Solution", hasMenu: true, href: "/solutions" },
  { label: "Partners" },
  { label: "Careers", href: "/careers" },
  { label: "Community" },
  { label: "Contact", cta: true, href: "/contact" },
];
