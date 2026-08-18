"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * The site's form fields.
 *
 * Underlined controls with labels that lift out of the way once a field has
 * something in it — so an empty form reads as a list of what it wants, and a
 * filled one reads as the answers. The labels never disappear, which is the
 * failure of a plain placeholder: somebody checking their work before sending
 * can still see what each line is.
 *
 * The float is driven from React state rather than :placeholder-shown, because
 * that pseudo-class does not apply to a <select> and the two would otherwise
 * animate differently.
 *
 * Shared by the contact form and the job application, which is the whole point
 * of them living here — two forms on one site that answer the keyboard and
 * animate differently is a thing readers notice without being able to say why.
 */

function Shell({
  id,
  label,
  required,
  floated,
  focused,
  invalid,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  floated: boolean;
  focused: boolean;
  invalid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative pt-5">
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-0 origin-left transition-all duration-200 ease-gentle",
          "motion-reduce:transition-none",
          floated
            ? "top-0 text-[0.6875rem] tracking-[0.04em]"
            : "top-5 text-sm",
          // Focus wins over the fault. Somebody who has come back to fix a
          // field already knows it is wrong, and a red label under a cursor
          // that is trying to correct it is telling them off while they do.
          focused
            ? "text-brand"
            : invalid
              ? "text-red-600"
              : floated
                ? "text-muted"
                : "text-foreground",
        )}
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-red-600">
            *
          </span>
        )}
      </label>
      {children}
      {/* The rule under the field, drawn here rather than as the control's own
          border so the select's chevron can sit above it without a notch. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 bottom-0 transition-colors duration-200",
          // Two pixels rather than one when it is wrong. A hairline in red is
          // the same weight as the rule under every other field on the page,
          // and colour alone is not something everyone can read.
          invalid && !focused ? "h-0.5 bg-red-600" : "h-px",
          focused ? "bg-brand" : invalid ? "" : "bg-line",
        )}
      />
    </div>
  );
}

const CONTROL =
  "peer block w-full appearance-none border-0 bg-transparent pb-2 text-sm text-foreground outline-none";

export function Text({
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  required = false,
  autoComplete,
  invalid = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  /** Answered wrong, and the reader has already left the field. */
  invalid?: boolean;
  /** What is wrong with it. Shown only while `invalid`. */
  hint?: string;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const [focused, setFocused] = useState(false);

  return (
    <Shell
      id={id}
      label={label}
      required={required}
      focused={focused}
      invalid={invalid}
      floated={focused || value !== ""}
    >
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && hint ? hintId : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        onChange={(event) => onChange(event.target.value)}
        className={CONTROL}
      />
      {invalid && hint && (
        // Absolute, so a message appearing does not push the field below it
        // down the card — which on a form this short moves everything the
        // reader is still working through.
        <span
          id={hintId}
          className="absolute left-0 top-full mt-1 text-[0.6875rem] text-red-600"
        >
          {hint}
        </span>
      )}
    </Shell>
  );
}

type Option = { value: string; label: string };

export function Select({
  label,
  value,
  onChange,
  required = false,
  options,
  groups,
  invalid = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  /** A flat list, or `groups` for one broken up under headings. */
  options?: Option[];
  groups?: { label: string; options: Option[] }[];
  invalid?: boolean;
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);

  return (
    <Shell
      id={id}
      label={label}
      required={required}
      focused={focused}
      invalid={invalid}
      floated={focused || value !== ""}
    >
      <select
        id={id}
        value={value}
        required={required}
        aria-invalid={invalid || undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => onChange(event.target.value)}
        // pr-8 keeps a long machine name clear of the chevron.
        className={cn(CONTROL, "pr-8")}
      >
        {/* Empty and unlabelled: the floating label is already saying what this
            field is, and a "Please select" option would sit under it repeating
            the question in different words. */}
        <option value="" />
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {groups?.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute bottom-2.5 right-0 h-4 w-4 transition-colors",
          focused ? "text-brand" : "text-foreground",
        )}
      >
        <path
          d="M5 7.5 10 12.5 15 7.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Shell>
  );
}

/** A boxed control rather than an underlined one, because a rule under five
 *  lines of text reads as a divider between paragraphs. */
export function TextArea({
  label,
  value,
  onChange,
  rows = 5,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-foreground">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="mt-2 w-full resize-y rounded-sm border border-line bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-brand"
      />
    </label>
  );
}
