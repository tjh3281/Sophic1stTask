import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactBoard } from "@/components/contact/ContactBoard";
import { ContactHero } from "@/components/contact/ContactHero";
import { Container } from "@/components/ui/Container";
import "./contact.css";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Talk to Sophic Automation about assembly, inspection, material handling and board test.",
};

/**
 * The contact page.
 *
 * Laid out as a board: who is writing and what they want are two blocks
 * feeding one part, and the part feeds the three ways of reaching us. The
 * whole of that — the routing, and what lights when — is ContactBoard. This
 * file is the heading above it and the boundary around it.
 *
 * Reached two ways, and the difference between them is one query parameter:
 * the header's Contact arrives bare, while a solution page's Contact Us brings
 * `?solution=<slug>` and the form opens with that machine already chosen.
 *
 * The slug is the only thing that travels in the URL. It says which page
 * somebody came from, which is not private and survives being shared — unlike
 * anything they type into the form below, which stays in the component.
 *
 * That parameter is read in the board, on the client, rather than here — and
 * the page is deliberately kept free of it. Awaiting `searchParams` in a page
 * makes the whole route dynamic, which on Netlify means every visit wakes a
 * serverless function and an idle one cold-starts first. This was the only
 * route on the site paying that cost, and the wait was plainly visible on the
 * Contact Us button. Nothing here depends on the request, so the page
 * prerenders at build time and comes off the CDN instead.
 */
export default function ContactPage() {
  return (
    <>
      {/* Half a screen: hello in the four languages you would be greeted in
          walking into the Penang office, one at a time, on a loop. The section
          below starts in the other half, so the page opens on the greeting and
          the form at once rather than on a cover to be got past. See
          ContactHero. */}
      <ContactHero />

      <section className="contact-page bg-surface py-14 sm:py-20">
        <Container>
          {/* Small, and out of the way at the top left. The board underneath is
              the page — six fields converging on a part — and it wants the
              height. A centred title with a paragraph under it spent the whole
              of the first screen saying what the board says better by being
              looked at. */}
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Contact Us
          </h1>

          {/* Required: a client component reading the query string cannot be
              prerendered, and without a boundary the build refuses the page
              rather than silently making it dynamic again.

              The fallback is only ever seen on a cold page load — someone
              opening or sharing the URL directly. Arriving by clicking Contact
              Us is a client navigation, where the router already holds the
              params and the hook resolves without suspending. It reserves the
              board's height so neither path shifts the layout. */}
          <div className="mt-6 sm:mt-8">
            <Suspense fallback={<div className="min-h-[48rem]" />}>
              <ContactBoard />
            </Suspense>
          </div>
        </Container>
      </section>
    </>
  );
}
