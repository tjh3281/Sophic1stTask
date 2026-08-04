import { Poppins } from "next/font/google";

/**
 * Solution pages get their own display face — a wide geometric sans, where the
 * rest of the site runs on Geist. Scoped to this route segment so the font only
 * downloads for the pages that use it, and so the header, footer and home page
 * keep the existing type.
 *
 * Poppins is not a variable font, so the weights have to be listed. Only the
 * four actually in use are requested; each unused weight is another file.
 */
const display = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // `contents` removes this wrapper's box, so it changes inherited font-family
  // without adding a containing block — the cover's negative top margin still
  // resolves against <main> exactly as before.
  return (
    <div className={`contents ${display.className}`}>{children}</div>
  );
}
