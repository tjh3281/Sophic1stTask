import Image from "next/image";
import {
  PENANG_ISLAND_SITE,
  officeByAlias,
  officeMapsUrl,
} from "@/lib/contact";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The other three offices, as photographs, under the drawn two.
 *
 * The scene above this is an illustration and covers the two Sophic draws:
 * Theta and Beta. These are the rest — the Penang island site, Kuala Lumpur and
 * Singapore — and they are photographs because that is what exists for them.
 * The change of medium is the point of putting them here rather than adding
 * them to the drawing: five buildings in one style would read as one skyline
 * and invite the reader to count, where a drawing and then a strip of
 * photographs reads as the map first and the places second.
 *
 * Every one of the five is a link to where it is, so the section answers "where
 * are you" in full rather than for the two that happened to be drawn.
 */

/**
 * Where each link goes is not written here. Two of the three are offices in
 * lib/contact and are asked for their own pin; the third is not in that list
 * because its address is not published, and lib/contact holds it separately —
 * see PENANG_ISLAND_SITE. Either way the URL lives with the addresses rather
 * than in a component, which is what stops these three drifting away from the
 * links the drawing above uses.
 */
type OfficePhoto = {
  src: string;
  width: number;
  height: number;
  label: string;
  href: string;
};

/** The office in lib/contact with this internal name, or a thrown error.
 *
 *  At module scope, so an office that is renamed or dropped fails the build.
 *  A photograph of a building that silently loses its link is worse than a
 *  broken build: it still looks finished. */
function linkTo(alias: string): string {
  const office = officeByAlias(alias);
  if (!office) {
    throw new Error(`No office aliased "${alias}" to link the company photos to`);
  }
  return officeMapsUrl(office);
}

const PHOTOS: OfficePhoto[] = [
  {
    src: "/images/office-penang-island.png",
    width: 422,
    height: 439,
    label: PENANG_ISLAND_SITE.name,
    href: PENANG_ISLAND_SITE.mapsUrl,
  },
  {
    src: "/images/office-sigma.png",
    width: 420,
    height: 438,
    label: "Sigma Office (KL branch)",
    href: linkTo("Sigma Office"),
  },
  {
    src: "/images/office-alpha.png",
    width: 422,
    height: 439,
    label: "Alpha Office (Sg branch)",
    href: linkTo("Alpha Office"),
  },
];

export function CompanyOffices({ className }: { className?: string }) {
  return (
    // Held well inside the container rather than run to its edges. The sources
    // are a little over 400px wide, which is all there is of them: at the full
    // width of this page each one would be drawn larger than it exists and go
    // soft. The cap is where they are still sharp on an ordinary screen.
    <ul
      className={`mx-auto grid max-w-sm grid-cols-1 gap-6 sm:max-w-5xl sm:grid-cols-3 sm:gap-7${
        className ? ` ${className}` : ""
      }`}
    >
      {PHOTOS.map((photo, index) => (
        <li key={photo.src}>
          <Reveal delay={index * 70} className="h-full">
            {/* The glow is drawn outside the card, which is overflow-hidden and
                would clip it. Same pairing the solution cards use. */}
            <div className="float-glow float-glow-card h-full">
              <a
                href={photo.href}
                // A new tab: this leaves for a map, and the reader is partway
                // through the page about the company.
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-background transition-[border-color,box-shadow] duration-200 ease-out hover:border-brand hover:shadow-lg hover:shadow-slate-900/5"
              >
                {/* Square, against sources that are a hair taller than they are
                    wide. Cover takes about eight pixels off the top and bottom
                    of each, which is pavement and sky, and in exchange the three
                    are exactly the same shape — the alternative is a row that
                    goes ragged by a pixel or two for no gain. */}
                <div className="relative aspect-square w-full overflow-hidden bg-surface">
                  <Image
                    // The caption below is inside the link and names the place,
                    // so the link already announces itself. An alt repeating
                    // that name would say it twice; these are establishing
                    // shots and carry nothing the caption does not.
                    alt=""
                    src={photo.src}
                    width={photo.width}
                    height={photo.height}
                    sizes="(min-width: 1024px) 20rem, (min-width: 640px) 31vw, 24rem"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>

                <div className="flex flex-1 flex-col px-4 py-3.5">
                  <p className="text-[0.9375rem] font-semibold leading-snug text-foreground transition-colors duration-150 ease-gentle group-hover:text-brand">
                    {photo.label}
                  </p>
                  {/* mt-auto pins this to the foot of the card, so the cue sits
                      on one line across all three however their names wrap. */}
                  <span className="mt-auto flex items-center gap-1.5 pt-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand">
                    Open in Maps
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    >
                      →
                    </span>
                  </span>
                </div>
              </a>
            </div>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
