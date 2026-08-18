"use client";

import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Select, Text, TextArea } from "@/components/ui/Field";
import { ENQUIRY_EMAIL, ENQUIRY_GROUPS, enquiryLabel } from "@/lib/contact";
import { BoardTraces, type TraceLink } from "./BoardTraces";
import "./ContactBoard.css";

/**
 * The contact page as a board.
 *
 * Two blocks feed one part. Who is writing goes into the left block, what they
 * want into the right, and every field is tracked down to its own pin on the
 * Send Enquiry chip in the middle, which feeds the three ways of reaching us
 * underneath. It is the layout of a circuit because the thing being described
 * is a circuit: nothing is sent until both inputs are good, and the page says
 * so by not lighting up.
 *
 * The board is always running. Current moves along every track from the moment
 * the page loads, including the two that go nowhere — what completing a field
 * changes is that its track *lights*: the colour comes up, the pill fills in,
 * and the group picks up a glow. Only the part itself is held back until
 * everything is answered, and its glow is the one thing on the page that says
 * the form is ready to send.
 *
 * So the reader is told what is still missing by which tracks are dark, before
 * they have pressed anything and before a single red message has appeared.
 *
 * Validity is deliberately stricter than "not empty". An address without an @
 * and a phone number of three digits both fill a field and neither is a way to
 * reply to somebody, and a form that lights up for them has lied about the
 * only thing this page is for.
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ NOT WIRED TO ANYTHING. Submitting shows the confirmation and sends   │
 * │ no request — there is no handler behind this and no database, which  │
 * │ is what the prototype was asked for. The address it names is real,   │
 * │ so before this goes near a customer, either deliver the payload to   │
 * │ enquiry@sophicautomation.com or take the confirmation wording down.  │
 * └──────────────────────────────────────────────────────────────────────┘
 */

type Fields = {
  name: string;
  company: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
};

type FieldName = keyof Fields;

/**
 * Good enough to reply to, and no stricter.
 *
 * Deliberately not one of the thousand-character RFC 5322 patterns. Those
 * exist to decide whether an address is *legal*, which is a different question
 * from whether somebody has finished typing one — and they accept plenty that
 * bounces while rejecting real addresses at new top-level domains. Something
 * before an @, something after it, and a dot in the domain is the most that
 * can be told from the string alone; anything past that needs a message sent
 * to it.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Digits, and the punctuation people put between them.
 *
 * Seven is the floor because a Malaysian landline without its area code is
 * seven, and this form is filled in by people in fifteen countries whose
 * numbers are of different lengths. Counting digits rather than characters is
 * what lets "+60 4-508 9737" and "0045089737" both pass.
 */
const PHONE_SHAPE = /^[+()\-.\s\d]+$/;
const PHONE_DIGITS = 7;

/** Two characters, so a single stray keystroke does not read as an answer. */
const NAME_MIN = 2;

/**
 * Whether a field is answered.
 *
 * Used for two different things and the difference matters: it decides whether
 * a track lights, and — for the fields in REQUIRED below — whether the form
 * can be sent. The message is in the first set only. It is optional, so
 * anything at all in it lights its track, and nothing in it holds nothing up.
 */
function ok(fields: Fields, field: FieldName): boolean {
  const value = fields[field].trim();
  switch (field) {
    case "name":
    case "company":
      return value.length >= NAME_MIN;
    case "email":
      return EMAIL.test(value);
    case "phone":
      return (
        PHONE_SHAPE.test(value) &&
        (value.match(/\d/g)?.length ?? 0) >= PHONE_DIGITS
      );
    case "interest":
      return enquiryLabel(value) !== null;
    case "message":
      return value.length > 0;
  }
}

/**
 * The board's palette.
 *
 * One colour per track rather than one ramp across all of them. A board where
 * every track is the same blue reads as a diagram of one thing happening;
 * giving each field its own means the reader can follow a single line from the
 * box they are typing in down to the pin it lands on, which is the whole
 * reason the tracks are drawn at all.
 *
 * Kept inside a cool range — the site's own blue and teal, with an indigo, a
 * violet and a sky between them. Warm colours were tried and are wrong here:
 * on a page where red means a field is broken, an amber track is a warning
 * nobody issued.
 */
const TRACK = {
  name: "#0b5fa5",
  company: "#6366f1",
  email: "#29a8b8",
  phone: "#8b5cf6",
  interest: "#0ea5e9",
  message: "#14b8a6",
  out: ["#0b5fa5", "#29a8b8", "#6366f1"],
  /** The tracks to nowhere. Grey, because nothing is at the other end. */
  none: "#94a3b8",
} as const;

/**
 * The six input tracks, in the order their pins sit on the part.
 *
 * `at` is where along its block's bottom edge the track leaves, which is what
 * fans them out instead of stacking six lines on one point.
 */
const INPUTS: {
  field: FieldName;
  label: string;
  colour: string;
  at: number;
}[] = [
  { field: "name", label: "NAME", colour: TRACK.name, at: 0.16 },
  { field: "company", label: "COMPANY", colour: TRACK.company, at: 0.38 },
  { field: "email", label: "EMAIL", colour: TRACK.email, at: 0.62 },
  { field: "phone", label: "PHONE", colour: TRACK.phone, at: 0.84 },
  { field: "interest", label: "CATEGORY", colour: TRACK.interest, at: 0.34 },
  { field: "message", label: "MESSAGE", colour: TRACK.message, at: 0.66 },
];

/**
 * What each block counts as its own, and what it insists on.
 *
 * The message is deliberately absent from the enquiry block's required list:
 * somebody who has picked the machine they are asking about has told us enough
 * to route the enquiry, and demanding a paragraph on top of it is the form
 * asking for work it does not need. Its track still lights when there is
 * something in it — that is feedback, not a gate.
 */
const DETAILS_FIELDS: FieldName[] = ["name", "company", "email", "phone"];
const ENQUIRY_FIELDS: FieldName[] = ["interest"];
const REQUIRED: FieldName[] = [...DETAILS_FIELDS, ...ENQUIRY_FIELDS];

/**
 * The three ways to reach us, under the part's three output pins.
 *
 * One entry per pin, in the order they are wired. Kept as data rather than
 * three hand-written cards so the pairing between a pin and the card it feeds
 * is positional and cannot drift.
 */
const OUTPUTS: { label: string; value: React.ReactNode }[] = [
  {
    label: "Email",
    value: (
      <a
        href={`mailto:${ENQUIRY_EMAIL}`}
        className="break-all transition-colors hover:text-brand"
      >
        {ENQUIRY_EMAIL}
      </a>
    ),
  },
  {
    label: "Phone",
    value: (
      // The international form is derived from the printed one — 604 is
      // Penang, so the national 04-508 9737 becomes +60 4 508 9737.
      <a href="tel:+6045089737" className="transition-colors hover:text-brand">
        (604) 508 9737
      </a>
    ),
  },
  {
    label: "Working hours",
    value: (
      <>
        <span className="block">Mon &ndash; Fri</span>
        <span className="block">08:30 &ndash; 17:30</span>
      </>
    ),
  },
];

/* No entry for the message: it cannot be wrong, so there is nothing to say. */
const HINTS: Partial<Record<FieldName, string>> = {
  name: "Please give us a name to reply to.",
  company: "Which company are you writing from?",
  email: "That does not look like an email address.",
  phone: "A number we can call — area code included.",
};

export function ContactBoard() {
  // Read here rather than in the page. Awaiting searchParams in a page makes
  // the whole route dynamic, which on Netlify means a serverless function on
  // every visit; doing it on the client costs one Suspense boundary and keeps
  // the page on the CDN.
  const preset = useSearchParams().get("solution") ?? "";

  const [fields, setFields] = useState<Fields>(() => ({
    name: "",
    company: "",
    email: "",
    phone: "",
    // Ignored when it names nothing we offer, so a stale or hand-typed slug in
    // the URL leaves the field empty and required rather than pre-selecting
    // something meaningless.
    interest: enquiryLabel(preset) ? preset : "",
    message: "",
  }));

  /**
   * Fields the reader has finished with.
   *
   * Nothing is marked wrong until it is in here. Validating on the first
   * keystroke means the email field is red for the whole time somebody is
   * typing a correct address into it, which is a form arguing with someone who
   * is doing as they were asked.
   */
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  );
  const [sent, setSent] = useState(false);

  const set = (key: FieldName, value: string) =>
    setFields((current) => ({ ...current, [key]: value }));
  const leave = (key: FieldName) =>
    setTouched((current) => ({ ...current, [key]: true }));

  /** Wrong, and the reader has already moved on from it. */
  const bad = (key: FieldName) => Boolean(touched[key]) && !ok(fields, key);

  const detailsLive = DETAILS_FIELDS.every((f) => ok(fields, f));
  const enquiryLive = ENQUIRY_FIELDS.every((f) => ok(fields, f));
  const ready = detailsLive && enquiryLive;

  const boardRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const enquiryRef = useRef<HTMLDivElement>(null);

  /**
   * A bank of ref objects, made once and handed straight to React.
   *
   * The pins and the output cards are rows of identical things, so they get
   * one array each rather than a name each. What matters is that the objects
   * are created once and never replaced: the links below hold onto them, and
   * an object rebuilt each render — `{ current: pins[i] }` — is a snapshot
   * taken before React has attached anything, so it reads null forever and
   * the tracks to those pins are never drawn.
   *
   * Held in state rather than a ref, and the difference is only which rule it
   * has to answer to. These are handed out during render, and `useRef` exists
   * to be read outside it — reaching into `.current` while rendering is the
   * thing the hooks lint rule catches, and it is right to. A lazy initialiser
   * is the plain way to say "build this once and keep it"; nothing ever calls
   * the setter.
   */
  const [pins] = useState(() => {
    const bank = <T extends HTMLElement>(count: number) =>
      Array.from({ length: count }, () => ({ current: null as T | null }));
    return {
      in: bank<HTMLSpanElement>(INPUTS.length),
      out: bank<HTMLSpanElement>(OUTPUTS.length),
      side: bank<HTMLSpanElement>(2),
      cards: bank<HTMLDivElement>(OUTPUTS.length),
    };
  });

  /** What is wired to what. */
  const links: TraceLink[] = [
    // One track per field, from its own block down to its own pin.
    ...INPUTS.map((input, i) => ({
      id: input.field,
      from: DETAILS_FIELDS.includes(input.field) ? detailsRef : enquiryRef,
      to: pins.in[i],
      fromAt: input.at,
      label: input.label,
      colour: input.colour,
      live: ok(fields, input.field),
    })),
    // The outputs. They only light once the part has everything, which is the
    // same rule the chip's own glow follows.
    ...OUTPUTS.map((_, i) => ({
      id: `out-${i}`,
      from: pins.out[i],
      to: pins.cards[i],
      colour: TRACK.out[i],
      live: ready,
    })),
    // The two that go nowhere. Never lit, because there is nothing at the far
    // end to light — but running, like everything else on the board.
    ...(["left", "right"] as const).map((side, i) => ({
      id: `nc-${side}`,
      from: pins.side[i],
      side,
      label: "N/C",
      colour: TRACK.none,
      live: false,
    })),
  ];

  if (sent) {
    return (
      <div className="contact-board__sent">
        <h2 className="text-xl font-semibold text-foreground">
          Thanks — that&rsquo;s with our team
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          We&rsquo;ll reply to{" "}
          <span className="font-medium text-foreground">{fields.email}</span>
          {enquiryLabel(fields.interest) ? (
            <>
              {" "}
              about{" "}
              <span className="font-medium text-foreground">
                {enquiryLabel(fields.interest)}
              </span>
            </>
          ) : null}
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        // Not `disabled`. A button that cannot be pressed also cannot say why,
        // and somebody who has missed a field is left pressing nothing with no
        // idea which one. Pressing it while incomplete marks everything as
        // left, which is what turns the quiet fields red.
        if (!ready) {
          setTouched(Object.fromEntries(REQUIRED.map((f) => [f, true])));
          return;
        }
        setSent(true);
      }}
    >
      <div ref={boardRef} className="contact-board" data-ready={ready}>
        <BoardTraces containerRef={boardRef} links={links} />

        {/* --- The two inputs ------------------------------------------- */}
        <div className="contact-board__inputs">
          <Block
            ref={detailsRef}
            title="Details"
            step="01"
            live={detailsLive}
            done={DETAILS_FIELDS.filter((f) => ok(fields, f)).length}
            total={DETAILS_FIELDS.length}
          >
            <Text
              label="Name"
              required
              autoComplete="name"
              value={fields.name}
              onChange={(v) => set("name", v)}
              onBlur={() => leave("name")}
              invalid={bad("name")}
              hint={HINTS.name}
            />
            <Text
              label="Company"
              required
              autoComplete="organization"
              value={fields.company}
              onChange={(v) => set("company", v)}
              onBlur={() => leave("company")}
              invalid={bad("company")}
              hint={HINTS.company}
            />
            <Text
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={fields.email}
              onChange={(v) => set("email", v)}
              onBlur={() => leave("email")}
              invalid={bad("email")}
              hint={HINTS.email}
            />
            <Text
              label="Phone"
              type="tel"
              required
              autoComplete="tel"
              value={fields.phone}
              onChange={(v) => set("phone", v)}
              onBlur={() => leave("phone")}
              invalid={bad("phone")}
              hint={HINTS.phone}
            />
          </Block>

          <Block
            ref={enquiryRef}
            title="Enquiry Type"
            step="02"
            live={enquiryLive}
            done={ENQUIRY_FIELDS.filter((f) => ok(fields, f)).length}
            total={ENQUIRY_FIELDS.length}
          >
            <Select
              label="Choose a solution category"
              required
              value={fields.interest}
              onChange={(v) => {
                set("interest", v);
                // A select is answered by choosing, not by leaving — waiting
                // for blur would hold the track dark after the reader has
                // plainly finished with it.
                leave("interest");
              }}
              groups={ENQUIRY_GROUPS}
              invalid={bad("interest")}
            />
            {/* Optional, and not marked required. Nothing about it can be
                wrong, so it carries no validation state — the placeholder is
                the whole of the guidance. */}
            <TextArea
              label="What do you need?"
              rows={5}
              placeholder="Tell us — the line, the part, the throughput you are after."
              value={fields.message}
              onChange={(v) => set("message", v)}
            />
          </Block>
        </div>

        {/* --- The part -------------------------------------------------- */}
        <div className="contact-board__chip-row">
          <div className="contact-chip" data-ready={ready}>
            <span
              aria-hidden="true"
              className="contact-chip__pins contact-chip__pins--in"
            >
              {pins.in.map((ref, i) => (
                <span
                  key={i}
                  ref={ref}
                  className="contact-chip__pin"
                  style={
                    { "--pin": INPUTS[i].colour } as React.CSSProperties
                  }
                  data-live={ok(fields, INPUTS[i].field)}
                />
              ))}
            </span>

            {/* The two legs wired to nothing. */}
            {pins.side.map((ref, i) => (
              <span
                key={i}
                aria-hidden="true"
                ref={ref}
                className={`contact-chip__leg contact-chip__leg--${
                  i === 0 ? "left" : "right"
                }`}
              />
            ))}

            <button type="submit" className="contact-chip__button">
              Send Enquiry
            </button>

            <span
              aria-hidden="true"
              className="contact-chip__pins contact-chip__pins--out"
            >
              {pins.out.map((ref, i) => (
                <span
                  key={i}
                  ref={ref}
                  className="contact-chip__pin"
                  style={{ "--pin": TRACK.out[i] } as React.CSSProperties}
                  data-live={ready}
                />
              ))}
            </span>
          </div>
        </div>

        {/* --- The outputs ----------------------------------------------- */}
        {/* Walked over the ref bank rather than written out three times, so
            each card is handed its slot by position — there is one output pin
            per card and the pairing is the point. */}
        <div className="contact-board__outputs">
          {pins.cards.map((ref, i) => {
            const out = OUTPUTS[i];
            return (
              <OutCard key={out.label} ref={ref} label={out.label} live={ready}>
                {out.value}
              </OutCard>
            );
          })}
        </div>
      </div>
    </form>
  );
}

/**
 * One of the two input blocks.
 *
 * Carries its own completeness in the header — a count rather than a tick,
 * because "2 / 4" answers the question a tick raises, which is how much is
 * left.
 */
function Block({
  ref,
  title,
  step,
  live,
  done,
  total,
  children,
}: {
  ref: React.Ref<HTMLDivElement>;
  title: string;
  step: string;
  live: boolean;
  done: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div ref={ref} className="contact-block" data-live={live}>
      <div className="contact-block__head">
        <span className="contact-block__step">{step}</span>
        <h2 className="contact-block__title">{title}</h2>
        <span className="contact-block__count">
          {live ? "Ready" : `${done} / ${total}`}
        </span>
      </div>
      <div className="contact-block__fields">{children}</div>
    </div>
  );
}

/** One of the three ways to reach us, under the chip's output pins. */
function OutCard({
  ref,
  label,
  live,
  children,
}: {
  ref: React.Ref<HTMLDivElement>;
  label: string;
  live: boolean;
  children: React.ReactNode;
}) {
  return (
    <div ref={ref} className="contact-out" data-live={live}>
      <span className="contact-out__label">{label}</span>
      <div className="contact-out__value">{children}</div>
    </div>
  );
}
