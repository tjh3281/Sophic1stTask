import type { Metadata } from "next";
import { Archivo_Black, Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Sophie } from "@/components/advisor/Sophie";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Display face, used only for the "er" in the home hero.
 *
 * Stands in for Chase Grotesk, which is a commercial licence rather than
 * something that can be pulled from a font CDN. Archivo Black is the nearest
 * thing that ships free: a single-weight grotesque drawn for display, with the
 * same very heavy strokes, tight counters and slightly squared bowls. Swap the
 * real face in here if the licence is bought — nothing else has to change,
 * since everything downstream goes through --font-display.
 *
 * It carries one weight and that weight is already black, so anything setting
 * it must ask for 400. A font-weight of 700 against a family that has no bold
 * makes the browser smear the outlines into a fake one.
 */
const archivoBlack = Archivo_Black({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  /**
   * Where relative metadata URLs resolve from.
   *
   * Without this Next has no way to turn app/opengraph-image.png into the
   * absolute URL that og:image requires, and link previews fall back to the
   * favicon — which is the globe out of the logo, and on its own reads as a
   * stock world map rather than as Sophic.
   *
   * Netlify sets URL to the site's own address at build time, so this follows
   * the site rather than pinning a hostname that goes stale the day it is
   * renamed. Locally there is no such variable and the dev server fills in.
   */
  metadataBase: new URL(process.env.URL ?? "http://localhost:3000"),
  title: {
    default: "Sophic Automation — Solutions Prototype",
    template: "%s — Sophic Automation",
  },
  description:
    "Prototype for the Sophic Automation equipment catalogue: vision, assembly, inspection and test, storage and material handling, robotics, and production and custom equipment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // Tells Next the smooth scrolling in globals.css is deliberate, so it
      // suppresses it during route transitions rather than animating those too.
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${archivoBlack.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Reveal starts its children hidden and shows them from JS; the home
            page's medal starts parked above its section, the company page's
            buildings start clipped into the ground, and the partner puzzle's
            pieces start scattered for the same reason. Without JS there is no
            observer to run, so opt out of the motion entirely and show all four
            where they were going to end up.

            The two scroll runways need more than that. Both are a tall section
            holding a sticky frame that only one thing is visible in at a time,
            and with nothing to advance them they are several screens of the
            same picture. The values board collapses in place, into the grid it
            is underneath; the community globe cannot — its captions are a
            separate stack from its artwork, so unpicking it here would leave
            four pictures followed by four unattached labels. That one carries
            its own <noscript> reading instead, and all this has to do is take
            the runway away so it can show. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html:
                ".reveal,.reveal-settle{opacity:1;transform:none;transition:none}.medal-hang__arm{translate:none}.company-scene__piece{clip-path:none;translate:none;opacity:1}.partner-puzzle__piece{opacity:1}.company-values{height:auto}.company-values__stage{position:static;height:auto;padding:4rem 0}.company-values__deck{grid-template-areas:none;gap:3rem}.company-values__card{grid-area:auto;opacity:1;transform:none}.partner-pillars__panel[hidden]{display:block}.partner-pillars__panel+.partner-pillars__panel{margin-top:2rem}.partner-pillars__panels{min-height:0}.community-globe{height:auto}.community-globe__stage{display:none}",
            }}
          />
        </noscript>
        {/* Takes over the wheel for the whole document. Mounted above the
            header so it is running before anything reads scroll position. */}
        <SmoothScroll />
        <Header />
        {/* The header is fixed, so it no longer reserves space. Pages clear it
            with this padding; a full-bleed cover cancels it out to run
            underneath. */}
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        {/* Floats over every page from the bottom-right, outside <main> so it
            is never caught by a page's own layout or overflow. */}
        <Sophie />
      </body>
    </html>
  );
}
