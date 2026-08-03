/**
 * Header navigation config.
 *
 * Only "Solution" resolves to real routes. Every other item is an inert
 * prototype button — styled like a link, but it deliberately goes nowhere.
 */
export type HeaderNavItem = {
  label: string;
  /** Opens the solutions mega menu instead of acting as a plain button. */
  hasMenu?: boolean;
  /** Rendered as the filled call-to-action at the end of the bar. */
  cta?: boolean;
};

export const HEADER_NAV: HeaderNavItem[] = [
  { label: "Company" },
  { label: "Solution", hasMenu: true },
  { label: "Partners" },
  { label: "Careers" },
  { label: "Community" },
  { label: "Contact", cta: true },
];
