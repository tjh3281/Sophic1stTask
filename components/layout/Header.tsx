"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import { HEADER_NAV } from "@/lib/nav";
import { SOLUTIONS } from "@/lib/solutions";
import { useScrolled } from "@/lib/useScrolled";
import { MobileNav } from "./MobileNav";
import { NavButton } from "./NavButton";
import { SolutionsMenu } from "./SolutionsMenu";

/** Pages whose cover runs underneath the header. */
const COVER_ROUTES = new Set<string>(
  SOLUTIONS.filter((s) => s.coverImage).map((s) => s.href),
);

export function Header() {
  const pathname = usePathname();
  const scrolled = useScrolled(24);
  const [menuOpen, setMenuOpen] = useState(false);

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
              width={184}
              height={102}
              priority
              className={cn(
                "absolute inset-0 h-full w-full object-contain object-left transition-opacity duration-300",
                overlay ? "opacity-0" : "opacity-100",
              )}
            />
            <Image
              src="/images/sophic-logo-light.png"
              alt=""
              width={184}
              height={102}
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
                <li key={item.label}>
                  {item.hasMenu ? (
                    <SolutionsMenu overlay={overlay} />
                  ) : (
                    <NavButton
                      label={item.label}
                      cta={item.cta}
                      overlay={overlay}
                    />
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <MobileNav
            overlay={overlay}
            open={menuOpen}
            onOpenChange={setMenuOpen}
          />
        </div>
      </Container>
    </header>
  );
}
