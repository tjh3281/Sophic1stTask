"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import { HEADER_NAV } from "@/lib/nav";
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
 * Matched exactly, which is what keeps the individual role pages out: they open
 * on a flat band rather than a cover, and a transparent bar over that would be
 * white type on the page's own background.
 *
 * A route added here owes its cover a top scrim dark enough for white nav links
 * across the full width — including the right-hand end, where the bar is at its
 * busiest and a cover's artwork is often at its lightest.
 */
const COVER_ROUTES = new Set<string>([
  ...SOLUTIONS.filter((s) => s.coverImage).map((s) => s.href),
  "/",
  "/careers",
  "/careers/openings",
  "/company",
  "/partners",
]);

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
  const overlay = COVER_ROUTES.has(pathname) && !scrolled && !menuOpen;

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
            {/* Both variants stay mounted and cross-fade, so switching does
                not flash while the other file loads. */}
            <Image
              src="/images/sophic-logo-dark.png"
              alt=""
              width={480}
              height={267}
              priority
              className={cn(
                "absolute inset-0 h-full w-full object-contain object-left transition-opacity duration-300",
                overlay ? "opacity-0" : "opacity-100",
              )}
            />
            <Image
              src="/images/sophic-logo-light.png"
              alt=""
              width={480}
              height={267}
              priority
              className={cn(
                "absolute inset-0 h-full w-full object-contain object-left transition-opacity duration-300",
                overlay ? "opacity-100" : "opacity-0",
              )}
            />
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
