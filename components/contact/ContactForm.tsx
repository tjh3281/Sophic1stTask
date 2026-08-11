"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Select, Text, TextArea } from "@/components/ui/Field";
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
          <TextArea
            label="Message:"
            value={fields.message}
            onChange={(v) => set("message", v)}
          />
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

/* The fields themselves live in components/ui/Field.tsx, shared with the job
   application form. */
