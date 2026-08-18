"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import { HEADER_NAV, isCurrentSection } from "@/lib/nav";
import { SOLUTIONS } from "@/lib/solutions";
import { useScrolled } from "@/lib/useScrolled";
import { MobileNav } from "./MobileNav";
import { NavButton } from "./NavButton";
import { SearchDialog } from "./SearchDialog";
import { SearchTrigger } from "./SearchTrigger";

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
  ...SOLUTIONS.filter((s) => s.coverImage).map((s) => s.href),
  "/",
  // /careers is deliberately absent. Its cover is a dot map on a near-white
  // panel rather than a photograph, and white nav links over that would be
  // white on white — see the note in components/careers/CareersCover.
  "/careers/openings",
  "/community",
  "/company",
  "/partners",
]);

/**
 * Whole branches whose pages all have covers.
 *
 * One entry, for the nine role pages: every one of them opens on its own
 * photograph, and the alternative to a prefix is either nine hard-coded paths
 * or importing lib/careers here — which would put the full text of nine job
 * ads into the bundle of every page on the site, for a list of slugs.
 *
 * Trailing slash on purpose. Without it this would also match the listing page
 * it is named after, which is already in the set above, and any future route
 * that merely starts with the same letters.
 */
const COVER_PREFIXES = ["/careers/openings/"];

/**
 * The logo, in the two states the bar has: on its own solid background, and
 * over a cover it has gone transparent for.
 *
 * Two pairs, because the home page did not move. Everywhere else wears Sophic's
 * current logo — black script on the solid bar, and the white-lettered cut of
 * the same artwork over a cover. Same drawing, same globe, so the mark does not
 * appear to change as the bar solidifies on scroll; only the lettering does,
 * which is what it is for.
 *
 * The white one is derived rather than uploaded. The file that arrived was
 * flattened onto opaque black with no alpha channel at all, which over a
 * photograph is a black rectangle in the corner — so its alpha was recovered
 * from the fact that it had been composited over black, and the result trimmed
 * to the artwork. See public/images/sophic-logo-normal(white wording).png for
 * the original.
 *
 * Dimensions are each file's own. The box is object-contain regardless, so they
 * only decide which widths Next generates — but asking for 686 of a 480px file
 * is asking for an upscale.
 */
const MARKS = {
  home: [
    { src: "/images/sophic-logo-dark.png", w: 480, h: 267 },
    { src: "/images/sophic-logo-light.png", w: 480, h: 267 },
  ],
  rest: [
    { src: "/images/sophic-logo-normal.png", w: 686, h: 363 },
    { src: "/images/sophic-logo-normal-white.png", w: 1565, h: 856 },
  ],
} as const;

export function Header() {
  const pathname = usePathname();
  const scrolled = useScrolled(24);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Site-wide shortcuts. Registered here rather than on the trigger, which is
  // rendered twice — once per breakpoint — and would bind the keys twice with it.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
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
  const hasCover =
    COVER_ROUTES.has(pathname) ||
    COVER_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const overlay = hasCover && !scrolled && !menuOpen;

  // Always a pair: the mark for the solid bar, and the mark for a cover the bar
  // is transparent over. Which pair depends only on whether this is the home
  // page — see MARKS.
  const [solidMark, coverMark] =
    pathname === "/" ? MARKS.home : MARKS.rest;

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
                    {/* Every item on the bar is the same thing now, including
                        Solution. It used to open a mega menu on hover, which
                        meant the one nav item that had somewhere to go was the
                        one you could not simply click. */}
                    <NavButton
                      label={item.label}
                      href={item.href}
                      cta={item.cta}
                      overlay={overlay}
                      current={isCurrentSection(item, pathname)}
                    />
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
