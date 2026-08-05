import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Sophic Automation — Solutions Prototype",
    template: "%s — Sophic Automation",
  },
  description:
    "Prototype for the four Sophic Automation solution categories: Assembly Automation, Inspection & Testing, Automated Material Handling System, and ICT & FCT.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Reveal starts its children hidden and shows them from JS. Without
            JS there is no observer to run, so opt out of the motion entirely. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html:
                ".reveal,.reveal-settle{opacity:1;transform:none;transition:none}",
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
      </body>
    </html>
  );
}
