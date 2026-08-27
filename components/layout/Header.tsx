"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import { useCoverOverlay } from "@/lib/coverOverlay";
import { HEADER_NAV, isCurrentSection } from "@/lib/nav";
import { ALL_SOLUTIONS, SOLUTION_LINES } from "@/lib/solutions";
import { useScrolled } from "@/lib/useScrolled";
import { MobileNav } from "./MobileNav";
import { NavButton } from "./NavButton";
import { SearchDialog } from "./SearchDialog";
import { SearchTrigger } from "./SearchTrigger";
import { SolutionMenu } from "./SolutionMenu";

/**
 * Pages whose cover runs underneath the header.
 *
 * The solution categories derive theirs from the tree — a category has a cover
 * exactly when it has a cover image. The rest are listed by hand because their
 * covers are components rather than rows of data, so there is nothing to derive
 * it from; the alternative is a route that looks like every other cover page
 * and wears an opaque bar over the top of its artwork.
 *
 * A route added here owes its cover a top scrim dark enough for white nav links
 * across the full width — including the right-hand end, where the bar is at its
 * busiest and a cover's artwork is often at its lightest.
 */
const COVER_ROUTES = new Set<string>([
  // Every category with a cover, on either line — not just the equipment one.
  ...ALL_SOLUTIONS.filter((s) => s.coverImage).map((s) => s.href),
  // And the two line covers above them, which are the same treatment one level
  // up. See SolutionLineCover: both photographs are light, and both are why
  // that component's top scrim is the heaviest on the site.
  ...SOLUTION_LINES.filter((l) => l.image).map((l) => l.href),
  "/",
  // /careers is deliberately absent. Its cover is a dot map on a near-white
  // panel rather than a photograph, and white nav links over that would be
  // white on white — see the note in components/careers/CareersCover.
  "/careers/openings",
  "/community",
  "/company",
  "/contact",
  "/partners",
]);

/**
 * Whole branches whose pages all have covers.
 *
 * The first is the nine role pages: every one of them opens on its own
 * photograph, and the alternative to a prefix is either nine hard-coded paths
 * or importing lib/careers here — which would put the full text of nine job
 * ads into the bundle of every page on the site, for a list of slugs.
 *
 * The second is the community write-ups, which open on a photograph from the
 * visit they describe, for the same reason and on the same terms.
 *
 * Trailing slashes on purpose. Without them these would also match the pages
 * they are named after — both of which are already in the set above — and any
 * future route that merely starts with the same letters.
 */
const COVER_PREFIXES = ["/careers/openings/", "/community/"];

/**
 * The logo, in the two states the bar has: on its own solid background, and
 * over a cover it has gone transparent for.
 *
 * One pair, for every page: the current logo, black script on the solid bar and
 * the white-lettered cut of the same artwork over a cover. Same drawing, same
 * globe, so the mark does not appear to change as the bar solidifies on scroll;
 * only the lettering does, which is what it is for.
 *
 * Both files are the "DESIGN 2" artwork — the anniversary cut, with the small
 * "th" over the globe — trimmed to its ink and fitted onto one canvas. The two
 * were normalised on the *same* crop rather than each on its own: the white
 * cut's S is a hairline outline that reads 38px narrower at source, and left to
 * itself it would land the mark a per cent off the black one and make the swap
 * on scroll look like a nudge.
 *
 * They are named sophic-mark-* rather than sophic-logo-*, and the rename is the
 * point rather than tidying. This artwork first went in by overwriting the old
 * files in place, which changes the bytes and not the URL — and /_next/image
 * caches on the URL, so every browser and CDN that had already fetched the old
 * mark went on serving it. A new name is a new URL, which is the only version
 * of "the logo changed" that a cache can see. Replace this artwork the same
 * way: new file, new name, never in place.
 *
 * There were two pairs. The home page kept this artwork while every other page
 * wore the flatter cut in public/images/sophic-logo-normal*.png — a different
 * drawing, brighter globe and no aerial above it — and moving between the two
 * changed Sophic's mark halfway through the site. This is the current logo, so
 * it is now the one on every page and the split is gone. Nothing references the
 * normal files any more; they are still in public/images.
 *
 * Dimensions are the mark's proportion, not the files' pixel size — the PNGs
 * are this tripled, so Next has real pixels to build the 2x entry of the srcset
 * from. The box is object-contain regardless, so these only decide which widths
 * are generated and what aspect the box is reserved at.
 */
const MARKS = [
  { src: "/images/sophic-mark-dark.png", w: 480, h: 267 },
  { src: "/images/sophic-mark-light.png", w: 480, h: 267 },
] as const;

export function Header() {
  const pathname = usePathname();
  const scrolled = useScrolled(24);
  // A cover that is a film rather than a photograph, asking for the bar while
  // it runs and handing it back when it lands. See lib/coverOverlay.
  const asked = useCoverOverlay();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Site-wide shortcuts. Registered here rather than on the trigger, which is
  // rendered twice — once per breakpoint — and would bind the keys twice with it.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // Not every keydown arrives with a key on it, and the one below is the
      // only line on the site that calls a method on one rather than comparing
      // it. Chrome fires keydown events of its own while it autofills a field —
      // which is exactly what it offers to do on a contact form it has an
      // address saved for — and so do some IMEs and a good number of
      // extensions. None of them are typing anything.
      //
      // Nothing warned about this: `key` is a plain `string` in the DOM types,
      // never optional, so the call type-checked and then threw the first time
      // somebody filled in the form.
      if (typeof event.key !== "string") return;

      const inField =
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName));

      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setMenuOpen(false);
        setSearchOpen((open) => !open);
        return;
      }
      // The bare "/" only works away from a text field, where it is a character
      // the reader is trying to type rather than a shortcut.
      if (event.key === "/" && !inField && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setMenuOpen(false);
        setSearchOpen(true);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Close the mobile drawer on navigation. Adjusted during render rather than
  // in an effect so the open drawer never paints over the new page.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  // Transparent only while sitting at the top of a page that has a cover, and
  // never while the drawer is open — a see-through bar above a solid drawer
  // reads as a glitch.
  //
  // Two ways to have a cover. The first is the route: a cover that is the same
  // picture the whole time it is on screen is safe to put a transparent bar
  // over, and the path is enough to know that.
  //
  // The second is a cover asking for the bar while it needs it, for the case
  // the path cannot answer — a cover that changes under the bar, so whether it
  // is dark enough is a question about *when* rather than about *where*. The
  // contact page used to be exactly that, a film ending on a near-white board;
  // it is now a plain dark band and is in the set above like everything else.
  // Nothing asks at the moment. See lib/coverOverlay.
  const hasCover =
    COVER_ROUTES.has(pathname) ||
    COVER_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const overlay = (hasCover || asked) && !scrolled && !menuOpen;

  // A pair: the mark for the solid bar, and the mark for a cover the bar is
  // transparent over — see MARKS.
  const [solidMark, coverMark] = MARKS;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300 ease-out",
        overlay
          ? "border-transparent bg-transparent"
          : "border-line bg-background/90 backdrop-blur",
      )}
    >
      <Container>
        <div className="relative flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            aria-label="Sophic Digital Solutions — home"
            className="relative h-10 w-[72px] shrink-0 sm:h-11 sm:w-20"
          >
            {/* Both stay mounted and cross-fade, so switching does not flash
                while the other file loads. */}
            {[
              { ...solidMark, on: !overlay },
              { ...coverMark, on: overlay },
            ].map((mark) => (
              <Image
                key={mark.src}
                src={mark.src}
                alt=""
                width={mark.w}
                height={mark.h}
                priority
                className={cn(
                  "absolute inset-0 h-full w-full object-contain object-left transition-opacity duration-300",
                  mark.on ? "opacity-100" : "opacity-0",
                )}
              />
            ))}
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {HEADER_NAV.map((item) => (
                // Search sits just before the call to action, so the bar reads
                // links → search → Contact rather than putting an icon after
                // the one filled button.
                <Fragment key={item.label}>
                  {item.cta && (
                    <li className="mr-2">
                      <SearchTrigger
                        overlay={overlay}
                        open={searchOpen}
                        onToggle={() => setSearchOpen((open) => !open)}
                      />
                    </li>
                  )}
                  <li>
                    {/* Solution is the one item with a menu, because it is the
                        one item whose page is a signpost rather than a
                        destination — see SolutionMenu. It stays a real link
                        either way: the old mega menu's mistake was swallowing
                        the click, not having a panel. */}
                    {item.hasMenu ? (
                      <SolutionMenu
                        label={item.label}
                        href={item.href}
                        overlay={overlay}
                        current={isCurrentSection(item, pathname)}
                      />
                    ) : (
                      <NavButton
                        label={item.label}
                        href={item.href}
                        cta={item.cta}
                        overlay={overlay}
                        current={isCurrentSection(item, pathname)}
                      />
                    )}
                  </li>
                </Fragment>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1 lg:hidden">
            <SearchTrigger
              variant="icon"
              overlay={overlay}
              open={searchOpen}
              onToggle={() => {
                // The drawer and the panel both hang off the same edge of the
                // bar below lg, so only one of them is ever out at a time.
                setMenuOpen(false);
                setSearchOpen((open) => !open);
              }}
            />
            <MobileNav
              overlay={overlay}
              open={menuOpen}
              onOpenChange={(open) => {
                setMenuOpen(open);
                if (open) setSearchOpen(false);
              }}
            />
          </div>

          {/* Inside the row, which is the positioned ancestor it hangs from. */}
          <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        </div>
      </Container>
    </header>
  );
}
