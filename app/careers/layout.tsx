import { Plus_Jakarta_Sans } from "next/font/google";

/**
 * Careers gets its own display face, the same way /solutions does.
 *
 * Three faces on one site sounds like one too many until you look at what each
 * branch is for. Geist runs the chrome; Poppins — wide, circular, mechanical —
 * suits pages about machines. Neither is right for the one page selling the
 * company to a person, so this branch runs Plus Jakarta Sans: humanist rather
 * than geometric, with a double-storey 'a' and a slight warmth Poppins does not
 * have. Different enough that the careers pages read as their own place, close
 * enough in proportion that the header above them still belongs.
 *
 * Variable font, so unlike Poppins there is no weight list to keep in step with
 * what the pages actually use.
 *
 * Scoped here rather than in the root layout, so nothing else on the site pays
 * to download it.
 */
const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // `contents` removes this wrapper's box, so it changes the inherited
  // font-family without adding a containing block — the cover's negative top
  // margin still resolves against <main> exactly as before.
  return <div className={`contents ${display.className}`}>{children}</div>;
}
