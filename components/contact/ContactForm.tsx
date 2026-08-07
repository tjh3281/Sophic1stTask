"use client";

import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import {
  COUNTRIES,
  ENQUIRY_EMAIL,
  ENQUIRY_GROUPS,
  INDUSTRIES,
  enquiryLabel,
} from "@/lib/contact";

/**
 * The contact form.
 *
 * Underlined fields with labels that lift out of the way once a field has
 * something in it — so an empty form reads as a list of what it wants, and a
 * filled one reads as the answers. The labels never disappear, which is the
 * failure of a plain placeholder: somebody checking their work before sending
 * can still see what each line is.
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
  firstName: string;
  lastName: string;
  country: string;
  email: string;
  company: string;
  phone: string;
  industry: string;
  jobTitle: string;
  interest: string;
  message: string;
};

export function ContactForm() {
  // Read here rather than passed down from the page. Doing it in the page
  // would make the whole route server-rendered per request; doing it here
  // keeps the page static and costs one Suspense boundary above this
  // component. Requires "use client", which this already is.
  const preset = useSearchParams().get("solution") ?? "";

  const [fields, setFields] = useState<Fields>(() => ({
    firstName: "",
    lastName: "",
    country: "",
    email: "",
    company: "",
    phone: "",
    industry: "",
    jobTitle: "",
    // Ignored when it names nothing we offer, so a stale or hand-typed slug in
    // the URL leaves the field empty and required rather than pre-selecting
    // something meaningless.
    interest: enquiryLabel(preset) ? preset : "",
    message: "",
  }));
  const [sent, setSent] = useState(false);

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  if (sent) {
    return (
      <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-lg border border-line bg-background px-6 py-16 text-center">
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
        setSent(true);
      }}
    >
      {/* Two columns from sm up. The pairing follows the fields themselves —
          the two halves of a name, the two ways to reach someone — so the eye
          reads across a row rather than having to hunt down a column. */}
      <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
        <Text
          label="First Name"
          required
          autoComplete="given-name"
          value={fields.firstName}
          onChange={(v) => set("firstName", v)}
        />
        <Text
          label="Last Name"
          required
          autoComplete="family-name"
          value={fields.lastName}
          onChange={(v) => set("lastName", v)}
        />

        <Select
          label="Country/Region"
          required
          value={fields.country}
          onChange={(v) => set("country", v)}
          options={COUNTRIES.map((c) => ({ value: c, label: c }))}
        />
        <Text
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={fields.email}
          onChange={(v) => set("email", v)}
        />

        <Text
          label="Company"
          required
          autoComplete="organization"
          value={fields.company}
          onChange={(v) => set("company", v)}
        />
        <Text
          label="Phone"
          type="tel"
          autoComplete="tel"
          value={fields.phone}
          onChange={(v) => set("phone", v)}
        />

        <Select
          label="Industry"
          required
          value={fields.industry}
          onChange={(v) => set("industry", v)}
          options={INDUSTRIES.map((i) => ({ value: i, label: i }))}
        />
        <Text
          label="Job Title"
          autoComplete="organization-title"
          value={fields.jobTitle}
          onChange={(v) => set("jobTitle", v)}
        />

        {/* Full width, because the options are machine names rather than single
            words and half a row would truncate them. */}
        <div className="sm:col-span-2">
          <Select
            label="I am looking for solutions in"
            required
            value={fields.interest}
            onChange={(v) => set("interest", v)}
            groups={ENQUIRY_GROUPS}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block">
            <span className="text-sm text-foreground">Message:</span>
            <textarea
              value={fields.message}
              onChange={(event) => set("message", event.target.value)}
              rows={5}
              className="mt-2 w-full resize-y rounded-sm border border-line bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none transition-colors focus:border-brand"
            />
          </label>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* The address, kept in reach of the button. Somebody who would rather
            write their own email should not have to go back up the page. */}
        <p className="text-xs text-muted">
          Or email us directly at{" "}
          <a
            href={`mailto:${ENQUIRY_EMAIL}`}
            className="font-medium text-brand transition-colors hover:text-brand-dark"
          >
            {ENQUIRY_EMAIL}
          </a>
        </p>
        <button
          type="submit"
          className="btn-brand rounded-md px-8 py-3 text-sm font-medium text-white sm:shrink-0"
        >
          Send enquiry
        </button>
      </div>
    </form>
  );
}

/* --- Fields ---------------------------------------------------------------
   Both controls share one shell: a label that sits on the line until the field
   has a value or the caret, then rises and shrinks above it. Driven from React
   state rather than :placeholder-shown, because that pseudo-class does not
   apply to a <select> and the two would otherwise animate differently.
-------------------------------------------------------------------------- */

function Shell({
  id,
  label,
  required,
  floated,
  focused,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  floated: boolean;
  focused: boolean;
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
          focused ? "text-brand" : floated ? "text-muted" : "text-foreground",
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
          "absolute inset-x-0 bottom-0 h-px transition-colors duration-200",
          focused ? "bg-brand" : "bg-line",
        )}
      />
    </div>
  );
}

const CONTROL =
  "peer block w-full appearance-none border-0 bg-transparent pb-2 text-sm text-foreground outline-none";

function Text({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);

  return (
    <Shell
      id={id}
      label={label}
      required={required}
      focused={focused}
      floated={focused || value !== ""}
    >
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => onChange(event.target.value)}
        className={CONTROL}
      />
    </Shell>
  );
}

type Option = { value: string; label: string };

function Select({
  label,
  value,
  onChange,
  required = false,
  options,
  groups,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  /** A flat list, or `groups` for one broken up under headings. */
  options?: Option[];
  groups?: { label: string; options: Option[] }[];
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);

  return (
    <Shell
      id={id}
      label={label}
      required={required}
      focused={focused}
      floated={focused || value !== ""}
    >
      <select
        id={id}
        value={value}
        required={required}
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
