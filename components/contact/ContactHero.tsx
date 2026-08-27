"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Container } from "@/components/ui/Container";
import "./ContactHero.css";

/**
 * The contact page's hero.
 *
 * Half a screen, carrying one word at a time: hello in the four languages you
 * would actually be greeted in walking into the Penang office. The form starts
 * in the other half, so the page opens on both — a greeting and the thing the
 * reader came to do — rather than making them scroll past one to reach the
 * other.
 *
 * It replaces a ten-second film that covered the whole window and held the page
 * still underneath it. Everything that arrangement needed — the scroll lock, the
 * Skip control, the Escape handler, the watchdogs against a clip that never
 * started — is gone with it, because none of it is needed by a section that just
 * sits on the page and scrolls like everything else.
 *
 * The greeting loops for as long as it is on screen. A hero is not an intro: it
 * is still there when the reader scrolls back up, and a sequence that ran once
 * and froze would be a permanent "Selamat Datang" for everybody who did.
 */

/**
 * The greetings, in the order they arrive.
 *
 * English, Mandarin, Tamil, Malay — Malaysia's four, and the order a Malaysian
 * company would list them in. `lang` is on each one for real reasons rather than
 * for tidiness: it is what lets a screen reader pronounce 你好 and வணக்கம்
 * rather than spelling them, and it is what the stylesheet keys the per-script
 * letter-spacing off.
 *
 * `size` multiplies the one type size the sequence is built from — see --type in
 * the stylesheet — and the four exist because the words are wildly different
 * lengths. Set at one size, "Selamat Datang" runs three times the width of
 * 你好 and the hero reads as type jumping about rather than as one line changing
 * language.
 *
 * They are not a full correction, and that is the decision rather than a
 * shortfall. Measured in the faces each script actually falls back to, the
 * natural widths are 245 : 200 : 570 : 750 — so setting all four to one width
 * would need a type size range of nearly four to one, and a hero whose height
 * quadruples between words is a worse problem than one whose width varies.
 * These damp it instead: the widths land inside 1.9 to 1 and the type sizes
 * inside 2 to 1, close enough that the four read as a set and far enough that
 * the long ones are not set in small print.
 *
 * 你好 is the one that is not simply arithmetic. Han characters fill their em
 * box where Latin spends a third of it on ascenders and descenders, so two of
 * them set to the same *width* as "Hello" carry half again its visual mass. Its
 * figure is pulled back from what the widths alone would ask for, and sits
 * between matching the width and matching what the eye reads as the height.
 */
const GREETINGS = [
  { text: "Hello", lang: "en", size: 1.15 },
  { text: "你好", lang: "zh", size: 1.25 },
  { text: "வணக்கம்", lang: "ta", size: 0.78 },
  { text: "Selamat Datang", lang: "ms", size: 0.62 },
] as const;

/**
 * How long each greeting holds, in milliseconds.
 *
 * Slower than an intro would run, because this one never stops. A title card
 * that plays once can afford to move at the pace of something being said; a
 * band that is on the page the whole time a form is being filled in has to sit
 * at the pace of something being ambient. Four words at this rate is a turn
 * every nine seconds, which reads as a change noticed rather than a change
 * happening.
 */
const WORD_MS = 2200;

export function ContactHero() {
  const ref = useRef<HTMLElement>(null);
  const [said, setSaid] = useState(0);

  /**
   * The loop, and only while the hero is on screen.
   *
   * A hero is at the top of the page and spends most of the session scrolled
   * past. A timer left running behind it costs a re-render of four spans every
   * couple of seconds for a band nobody can see — small, and exactly the kind
   * of small that a page never idling is made of.
   */
  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    let timer = 0;
    const start = () => {
      if (timer) return;
      timer = window.setInterval(() => {
        setSaid((index) => (index + 1) % GREETINGS.length);
      }, WORD_MS);
    };
    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
    };

    // Without an observer, run it. A hero that never changes because a browser
    // is missing an API is worse than one that keeps a timer it did not need.
    if (typeof IntersectionObserver === "undefined") {
      start();
      return stop;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    });
    observer.observe(section);

    return () => {
      observer.disconnect();
      stop();
    };
  }, []);

  /**
   * The word that has just gone, tracked rather than inferred from "everything
   * before the current one".
   *
   * That inference is what breaks a loop. On the wrap from the last greeting to
   * the first, the one leaving is *after* the one arriving, so a rule reading
   * "before it has been said, after it is waiting" would send it straight to
   * the bottom of the stack without ever animating out of the middle.
   */
  const gone = (said + GREETINGS.length - 1) % GREETINGS.length;

  return (
    // -mt-16 pt-16 cancels the layout's clearance for the fixed header so the
    // band runs up underneath it — the same arrangement every other cover on the
    // site uses. /contact is in COVER_ROUTES for the other half of it: the bar
    // goes transparent over this, which it can because the ground is dark from
    // edge to edge.
    <section
      ref={ref}
      className="contact-hero relative isolate -mt-16 flex min-h-[50svh] flex-col justify-center overflow-hidden pt-16"
    >
      <Container>
        {/* All four are in the markup and in the accessibility tree from the
            start, rather than one being swapped in as its turn comes. A screen
            reader then reads the four greetings once, each in its own language —
            which is what the `lang` attributes buy — instead of interrupting
            itself every couple of seconds with a live region nobody asked
            for. */}
        <p className="contact-hero__stage">
          {GREETINGS.map((greeting, index) => (
            <span
              key={greeting.lang}
              className="contact-hero__word"
              lang={greeting.lang}
              data-state={
                index === said ? "now" : index === gone ? "gone" : "waiting"
              }
              style={{ "--size": greeting.size } as CSSProperties}
            >
              {greeting.text}
            </span>
          ))}
        </p>
      </Container>
    </section>
  );
}
