import type { Route } from "next";

/**
 * Header navigation config.
 *
 * "Solution" resolves to real routes and "Contact" has a page. Every other
 * item is an inert prototype button — styled like a link, but it deliberately
 * goes nowhere.
 */
export type HeaderNavItem = {
  label: string;
  /** Opens the solutions mega menu instead of acting as a plain button. */
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
  { label: "Solution", hasMenu: true },
  { label: "Partners" },
  { label: "Careers" },
  { label: "Community" },
  { label: "Contact", cta: true, href: "/contact" },
];
