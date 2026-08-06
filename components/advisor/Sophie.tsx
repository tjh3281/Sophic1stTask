"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  ADVISOR_CATEGORIES,
  getCategory,
  getSplitter,
  isMatchedCategory,
  type MatchedCategory,
  type Splitter,
} from "@/lib/advisor/categories";
import { MAX_INPUT_LENGTH, type ClassifierResult } from "@/lib/advisor/contract";
import { LeadForm } from "./LeadForm";
import { SophieMark } from "./SophieMark";

/**
 * Sophie — the automation solution advisor.
 *
 * A lead qualifier wearing a friendly face, not a chatbot. It has one job: turn
 * "our line is slow" into "INSPECTION — defects escaping final visual check",
 * and hand that to a human with the problem already written down.
 *
 * The rule that shapes every branch below: the contact button is a reward for a
 * diagnosed problem, never an escape from a vague one. Somebody who types
 * "help" is asked what hurts, not handed a form — a lead that arrives saying
 * "help" is a lead the sales team cannot act on, so collecting it is worse than
 * collecting nothing.
 */

type Stage =
  | { name: "entry" }
  | { name: "thinking" }
  | { name: "splitter"; splitter: Splitter; problem: string }
  | { name: "result"; category: MatchedCategory; words: string; problem: string }
  /** Carries the reader's own words, so the one screen that turns someone away
   *  still shows it read what they wrote. */
  | { name: "nofit"; words: string }
  /** `attempts` counts unclear answers so far; the second one earns a way out. */
  | { name: "vague"; attempts: number };

export function Sophie() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>({ name: "entry" });
  const [draft, setDraft] = useState("");
  /** `category: null` is the undiagnosed case — see the vague stage below. */
  const [lead, setLead] = useState<{
    category: MatchedCategory | null;
    problem: string;
  } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLTextAreaElement>(null);

  // Escape closes the panel, but not while the lead form is over it — there it
  // belongs to the form, which is the thing actually in front of the reader.
  useEffect(() => {
    if (!open || lead) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, lead]);

  useEffect(() => {
    if (open) firstFieldRef.current?.focus();
  }, [open]);

  function reset() {
    setStage({ name: "entry" });
    setDraft("");
  }

  /**
   * A symptom button is already a diagnosis — the reader picked the category by
   * naming their own pain. Sending it to the classifier would spend a round
   * trip to be told what we already know, and would let the model overrule a
   * person about their own factory.
   */
  function pickSymptom(category: MatchedCategory) {
    const { symptom } = getCategory(category);
    setStage({ name: "result", category, words: symptom, problem: symptom });
  }

  async function classify(text: string, attempts: number) {
    setStage({ name: "thinking" });

    let result: ClassifierResult;
    try {
      const response = await fetch("/api/advisor/classify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error(String(response.status));
      result = (await response.json()) as ClassifierResult;
    } catch {
      // Unreachable classifier is treated as an unclear answer rather than an
      // error screen: the reader is asked to point at a part of the line, which
      // needs no model at all.
      setStage({ name: "vague", attempts: attempts + 1 });
      return;
    }

    route(result, text, attempts);
  }

  /** The branch table from the brief, in the brief's order. */
  function route(result: ClassifierResult, problem: string, attempts: number) {
    if (result.primary === "NONE") {
      setStage({ name: "nofit", words: result.user_words || problem });
      return;
    }

    if (!isMatchedCategory(result.primary)) {
      setStage({ name: "vague", attempts: attempts + 1 });
      return;
    }

    const secondary = isMatchedCategory(result.secondary) ? result.secondary : null;

    if (result.confidence === "low" || secondary) {
      setStage({
        name: "splitter",
        splitter: getSplitter(result.primary, secondary),
        problem,
      });
      return;
    }

    setStage({
      name: "result",
      category: result.primary,
      words: result.user_words || problem,
      problem,
    });
  }

  /**
   * The splitter's answer settles it outright rather than going back to the
   * model. The reader has just told us, in our own words, which of two
   * categories they are in; asking a classifier to second-guess that can only
   * produce a third answer that contradicts them.
   */
  function answerSplitter(resolvesTo: MatchedCategory | null, problem: string) {
    if (!resolvesTo) {
      setStage({ name: "vague", attempts: 0 });
      return;
    }
    setStage({ name: "result", category: resolvesTo, words: problem, problem });
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
        {open && (
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Sophie, automation solution advisor"
            className="sophie-panel flex w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-xl border border-line bg-background shadow-2xl shadow-slate-900/20"
          >
            <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                <SophieMark className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">Sophie</p>
                <p className="truncate text-xs text-muted">
                  Finds the right automation for your line
                </p>
              </div>
              {stage.name !== "entry" && (
                <button
                  type="button"
                  onClick={reset}
                  className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
                >
                  Start over
                </button>
              )}
            </header>

            {/* Announced politely, so a screen reader hears each step instead of
                only the reader who can see the panel change.

                The 15rem reserve is what keeps the panel clear of the site
                header. It has to cover everything between the panel's scroll
                area and the top of the window: the fixed header (4rem), this
                panel's own title bar (~4rem), the launcher below it (3.5rem)
                and the two gaps (2rem). At 11rem it did not, and on any window
                shorter than about 660px the top of the panel slid underneath
                the header — which sits at z-50 and won, so Sophie's name
                disappeared behind the nav. */}
            <div
              data-lenis-prevent
              aria-live="polite"
              className="max-h-[min(28rem,calc(100vh-15rem))] overflow-y-auto overscroll-contain px-4 py-4"
            >
              {stage.name === "entry" && (
                <Entry
                  draft={draft}
                  setDraft={setDraft}
                  textareaRef={firstFieldRef}
                  onPick={pickSymptom}
                  onSubmit={(text) => classify(text, 0)}
                />
              )}

              {stage.name === "thinking" && <Thinking />}

              {stage.name === "splitter" && (
                <Bubble>
                  <p className="text-sm leading-relaxed text-foreground">
                    {stage.splitter.question}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {stage.splitter.options.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() =>
                          answerSplitter(option.resolvesTo, stage.problem)
                        }
                        className="rounded-md border border-line px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:border-brand hover:text-brand"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </Bubble>
              )}

              {stage.name === "result" && (
                <Result
                  category={stage.category}
                  words={stage.words}
                  onContact={() =>
                    setLead({ category: stage.category, problem: stage.problem })
                  }
                />
              )}

              {stage.name === "nofit" && (
                <Bubble>
                  <p className="text-sm leading-relaxed text-foreground">
                    {/* Their words first. This is the one screen that turns a
                        reader away, so it is the screen that can least afford
                        to read like a canned reply to something nobody looked
                        at. The classifier returns the quote; without one the
                        sentence simply starts itself. */}
                    {stage.words ? (
                      <>
                        <span className="font-medium">
                          &ldquo;{stripPeriod(stage.words)}&rdquo;
                        </span>{" "}
                        — that&rsquo;s outside what our equipment covers.
                      </>
                    ) : (
                      <>That&rsquo;s outside what our equipment covers.</>
                    )}{" "}
                    You&rsquo;d want a software/IT provider for that. But if
                    assembly, inspection, material handling, or board testing is
                    also a pain, that&rsquo;s exactly what we do.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ADVISOR_CATEGORIES.map((category) => (
                      <ShortButton
                        key={category.id}
                        label={category.shortLabel}
                        onClick={() => pickSymptom(category.id)}
                      />
                    ))}
                  </div>
                </Bubble>
              )}

              {stage.name === "vague" && (
                <Vague
                  attempts={stage.attempts}
                  onPick={pickSymptom}
                  onContact={() =>
                    // Two unclear tries in, and still no category. It goes over
                    // as undiagnosed rather than as a guess: a lead labelled
                    // with the wrong category costs the engineer who picks it
                    // up more than one labelled with none.
                    setLead({ category: null, problem: draft })
                  }
                />
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Close Sophie" : "Ask Sophie which solution fits"}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg shadow-slate-900/25",
            "transition-[background-color,transform] duration-200 ease-out active:scale-95",
            "motion-reduce:transition-none motion-reduce:active:scale-100",
            open ? "bg-brand-dark" : "bg-brand hover:bg-brand-dark",
          )}
        >
          {open ? (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
              <path
                d="m6 6 12 12M18 6 6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <SophieMark className="h-7 w-7" />
          )}
        </button>
      </div>

      {lead && (
        <LeadForm
          category={lead.category}
          problem={lead.problem}
          onClose={() => setLead(null)}
        />
      )}
    </>
  );
}

/* --- Stages -------------------------------------------------------------- */

function Entry({
  draft,
  setDraft,
  textareaRef,
  onPick,
  onSubmit,
}: {
  draft: string;
  setDraft: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onPick: (category: MatchedCategory) => void;
  onSubmit: (text: string) => void;
}) {
  const trimmed = draft.trim();

  return (
    <div className="space-y-4">
      <Bubble>
        <p className="text-sm leading-relaxed text-foreground">
          Tell me where your line hurts and I&rsquo;ll point you at the
          equipment that fixes it.
        </p>
      </Bubble>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (trimmed) onSubmit(trimmed);
        }}
      >
        <textarea
          ref={textareaRef}
          value={draft}
          maxLength={MAX_INPUT_LENGTH}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            // Enter sends; the box is one line of description, not a document.
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (trimmed) onSubmit(trimmed);
            }
          }}
          rows={2}
          placeholder="In one line — what's slowing your line down or costing you the most?"
          className="w-full resize-none rounded-lg border border-line bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted focus:border-brand"
        />
        <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-muted">
          e.g. &ldquo;too many defects escaping inspection&rdquo; · &ldquo;not
          enough people to move materials&rdquo; · &ldquo;final test is our
          bottleneck&rdquo;
        </p>
        <button
          type="submit"
          disabled={!trimmed}
          className={cn(
            "mt-2 w-full rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
            trimmed
              ? "bg-brand text-white hover:bg-brand-dark"
              : "cursor-not-allowed bg-surface text-muted",
          )}
        >
          Find my solution
        </button>
      </form>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-muted">
          or pick one
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <ul className="space-y-2">
        {ADVISOR_CATEGORIES.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              onClick={() => onPick(category.id)}
              className="w-full rounded-lg border border-line px-3 py-2.5 text-left text-[0.8125rem] leading-relaxed text-foreground transition-colors hover:border-brand hover:bg-brand-light/40"
            >
              {category.symptom}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Thinking() {
  return (
    <Bubble>
      <p className="flex items-center gap-2 text-sm text-muted">
        Reading that
        <span aria-hidden="true" className="sophie-dots">
          <i />
          <i />
          <i />
        </span>
      </p>
    </Bubble>
  );
}

function Result({
  category,
  words,
  onContact,
}: {
  category: MatchedCategory;
  words: string;
  onContact: () => void;
}) {
  const solution = getCategory(category);

  return (
    <div className="space-y-4">
      <Bubble>
        <p className="text-sm leading-relaxed text-foreground">
          Sounds like <span className="font-medium">{solution.label}</span> is
          your bottleneck{words ? ` — ${stripPeriod(words)}` : ""}. Here&rsquo;s
          what fits.
        </p>
      </Bubble>

      <div className="rounded-lg border border-line bg-surface p-4">
        <p className="text-sm font-semibold text-foreground">{solution.label}</p>
        <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">
          {solution.oneLine}
        </p>
        <ul className="mt-3 space-y-1 border-t border-line pt-3">
          {solution.equipment.map((item) => (
            <li
              key={item}
              className="font-mono text-[0.6875rem] leading-relaxed text-foreground/80"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Contact is the primary action and the deep link supports it — one
          link, never four, or the reader leaves to browse and never comes back
          to the form. */}
      <button
        type="button"
        onClick={onContact}
        className="w-full rounded-md bg-brand px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
      >
        Talk to our team →
      </button>
      <Link
        href={solution.href}
        className="block text-center text-xs font-medium text-brand transition-colors hover:text-brand-dark"
      >
        See how {solution.label} works →
      </Link>
    </div>
  );
}

function Vague({
  attempts,
  onPick,
  onContact,
}: {
  attempts: number;
  onPick: (category: MatchedCategory) => void;
  onContact: () => void;
}) {
  return (
    <div className="space-y-4">
      <Bubble>
        <p className="text-sm leading-relaxed text-foreground">
          Happy to help — which part of your line is the pain?
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ADVISOR_CATEGORIES.map((category) => (
            <ShortButton
              key={category.id}
              label={category.shortLabel}
              onClick={() => onPick(category.id)}
            />
          ))}
        </div>
      </Bubble>

      {attempts >= 2 && (
        // Only now. Two tries at naming the problem have not landed, so a
        // person will do better than another prompt — but this is the floor of
        // the flow, not its shortcut.
        <button
          type="button"
          onClick={onContact}
          className="w-full rounded-md border border-line px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-brand hover:text-brand"
        >
          Rather just talk to someone?
        </button>
      )}
    </div>
  );
}

/* --- Pieces -------------------------------------------------------------- */

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg rounded-tl-sm border border-line bg-surface px-3.5 py-3">
      {children}
    </div>
  );
}

function ShortButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-line bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-brand hover:text-brand"
    >
      {label}
    </button>
  );
}

/** The reflect line puts the quote mid-sentence, where a full stop of the
 *  reader's own would read as a stutter. */
function stripPeriod(value: string) {
  return value.trim().replace(/[.!?]+$/, "");
}
