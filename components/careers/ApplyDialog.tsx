"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Text, TextArea } from "@/components/ui/Field";
import { ENQUIRY_EMAIL } from "@/lib/contact";
import "./ApplyDialog.css";

/**
 * Applying for a role.
 *
 * One dialog per page, opened from either "Apply for this role" button. They
 * are two triggers on one form rather than two forms — a second copy would
 * duplicate every label's id along with it, and a reader who started typing in
 * the sidebar and then scrolled to the button at the foot of the ad would find
 * an empty form waiting for them.
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ NOT WIRED TO ANYTHING. Submitting shows the confirmation and sends   │
 * │ no request — no handler, no upload, no database, which is what the   │
 * │ prototype was asked for. The résumé never leaves the browser: the    │
 * │ File is read for its name, type and size and nothing else.           │
 * │                                                                      │
 * │ Deliberately unlabelled on the page, by request. Before this goes    │
 * │ near a real applicant it needs somewhere to post to, or the          │
 * │ confirmation is telling people their application was received when   │
 * │ it was not.                                                          │
 * └──────────────────────────────────────────────────────────────────────┘
 */

/** Comfortably above a design-heavy CV, well below anything that would stall
 *  an upload on a phone connection. */
const MAX_BYTES = 5 * 1024 * 1024;

const ApplyContext = createContext<(() => void) | null>(null);

type Fields = {
  name: string;
  email: string;
  phone: string;
  address: string;
  note: string;
};

const EMPTY: Fields = {
  name: "",
  email: "",
  phone: "",
  address: "",
  note: "",
};

export function ApplyProvider({
  role,
  children,
}: {
  /** The job title, so the dialog and the confirmation both name it. */
  role: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();

  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [sent, setSent] = useState(false);

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  // Opening starts a fresh application rather than resuming whatever was left
  // in the box last time — including, deliberately, the résumé, since a file
  // still attached from a previous role is the one mistake here nobody would
  // notice themselves making.
  function openDialog() {
    setFields(EMPTY);
    setFile(null);
    setFileError("");
    setDragging(false);
    setSent(false);
    setOpen(true);
  }

  // showModal cannot be set as a prop — a <dialog> is opened by calling it.
  // Driving that from state rather than from the click handler keeps the
  // element and the flag from disagreeing when Escape closes it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // The page behind a modal is inert but still scrolls, which reads as the
  // dialog having come loose from the page.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /** Everything a PDF has to be before it is worth keeping. */
  function attach(next: File | undefined | null) {
    if (!next) return;

    // Both, because a file renamed to .pdf reports no type at all in some
    // browsers, and a file dragged from a zip can arrive with the right type
    // and a wrong name.
    const looksPdf =
      next.type === "application/pdf" ||
      next.name.toLowerCase().endsWith(".pdf");

    if (!looksPdf) {
      setFile(null);
      setFileError("That is not a PDF. Please attach your résumé as a PDF.");
      return;
    }
    if (next.size > MAX_BYTES) {
      setFile(null);
      setFileError(`That file is ${size(next.size)}. The limit is 5 MB.`);
      return;
    }
    setFileError("");
    setFile(next);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    // Checked here rather than with `required` on the input: the input is
    // visually hidden, and the browser cannot show its "please fill this in"
    // bubble against a control it cannot scroll to — it refuses to submit at
    // all and says nothing.
    if (!file) {
      setFileError("Attach your résumé as a PDF.");
      return;
    }
    setSent(true);
  }

  return (
    <ApplyContext.Provider value={openDialog}>
      {children}

      <dialog
        ref={dialogRef}
        className="apply-dialog"
        aria-labelledby={headingId}
        // Fires for Escape and for close() alike, so this is the one place the
        // flag has to come back down.
        onClose={() => setOpen(false)}
        // On the backdrop, the click lands on the dialog element itself —
        // anything inside the panel reports the panel.
        onClick={(event) => {
          if (event.target === dialogRef.current) setOpen(false);
        }}
      >
        <div className="apply-dialog__head flex items-start justify-between gap-4 border-b border-line px-6 py-5">
            <div className="min-w-0">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-brand">
                {sent ? "Application sent" : "Apply"}
              </p>
              <h2
                id={headingId}
                className="mt-1.5 text-lg font-bold tracking-[-0.015em] text-foreground"
              >
                {role}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="-mr-1.5 -mt-1 shrink-0 rounded-md p-2 text-muted transition-colors duration-200 ease-gentle hover:bg-surface hover:text-foreground"
            >
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
              >
                <path d="m5 5 10 10M15 5 5 15" />
              </svg>
            </button>
        </div>

        <div className="apply-dialog__body">
          {sent ? (
            <div className="px-6 py-12 text-center">
              <span
                aria-hidden="true"
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 13 4 4 10-10" />
                </svg>
              </span>
              <h3 className="mt-5 text-xl font-bold tracking-[-0.02em] text-foreground">
                Thanks, {firstName(fields.name)}
              </h3>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
                Your application for{" "}
                <span className="font-medium text-foreground">{role}</span> is
                in, with{" "}
                <span className="font-medium text-foreground">
                  {file?.name}
                </span>
                . We will reply to{" "}
                <span className="font-medium text-foreground">
                  {fields.email}
                </span>
                .
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-brand mt-7 rounded-md px-6 py-2.5 text-sm font-medium text-white"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="px-6 pb-6 pt-2">
              <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Text
                    label="Full name"
                    required
                    autoComplete="name"
                    value={fields.name}
                    onChange={(v) => set("name", v)}
                  />
                </div>
                <Text
                  label="Email"
                  type="email"
                  required
                  autoComplete="email"
                  value={fields.email}
                  onChange={(v) => set("email", v)}
                />
                <Text
                  label="Phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={fields.phone}
                  onChange={(v) => set("phone", v)}
                />

                {/* Full width and one line. Several of these roles ask for own
                    transport and work on customer sites, so where somebody is
                    travelling from is part of the application rather than an
                    afterthought — but it is still an address, not a postal
                    form, so it stays one field the way the rest of the site
                    writes them. */}
                <div className="sm:col-span-2">
                  <Text
                    label="Address"
                    required
                    autoComplete="street-address"
                    value={fields.address}
                    onChange={(v) => set("address", v)}
                  />
                </div>
              </div>

              {/* --- The résumé ------------------------------------------- */}
              <div className="mt-7">
                <p className="text-sm text-foreground">
                  Résumé
                  <span aria-hidden="true" className="ml-1 text-red-600">
                    *
                  </span>
                </p>

                {file ? (
                  <div className="mt-2 flex items-center gap-3 rounded-[0.625rem] border border-line bg-surface px-4 py-3">
                    <PdfIcon />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {file.name}
                      </span>
                      <span className="block text-xs text-muted">
                        PDF · {size(file.size)}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setFileError("");
                      }}
                      className="shrink-0 rounded px-2 py-1 text-xs font-medium text-muted transition-colors duration-200 ease-gentle hover:text-brand"
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  /* A label, so the whole panel is the file picker's own click
                     target and no JavaScript is needed to open it. */
                  <label
                    className="apply-drop mt-2"
                    data-dragging={dragging}
                    data-error={fileError !== ""}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragging(false);
                      attach(event.dataTransfer.files?.[0]);
                    }}
                  >
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="sr-only"
                      onChange={(event) => attach(event.target.files?.[0])}
                    />
                    <PdfIcon className="mx-auto" />
                    <span className="mt-2 block text-sm text-foreground">
                      <span className="font-medium text-brand">
                        Choose a file
                      </span>{" "}
                      or drop it here
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      PDF only, up to 5 MB
                    </span>
                  </label>
                )}

                {fileError && (
                  // Announced, because a reader who dropped the wrong file is
                  // looking at the file, not at the line under the box.
                  <p role="alert" className="mt-2 text-xs text-red-600">
                    {fileError}
                  </p>
                )}
              </div>

              <div className="mt-7">
                <TextArea
                  label="Anything you would like us to know (optional)"
                  rows={4}
                  value={fields.note}
                  onChange={(v) => set("note", v)}
                />
              </div>

              <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* The address, kept in reach of the button — the same move the
                    contact form makes, for the applicant who would rather send
                    their own email with their own attachments. */}
                <p className="text-xs text-muted">
                  Or email us at{" "}
                  <a
                    href={`mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent(
                      `Application: ${role}`,
                    )}`}
                    className="font-medium text-brand transition-colors hover:text-brand-dark"
                  >
                    {ENQUIRY_EMAIL}
                  </a>
                </p>
                <button
                  type="submit"
                  className="btn-brand rounded-md px-7 py-3 text-sm font-medium text-white sm:shrink-0"
                >
                  Send application
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </ApplyContext.Provider>
  );
}

/**
 * Either of the two triggers. Takes its own classes, because the one at the
 * foot of the ad and the one in the sidebar card are the same action wearing
 * different clothes.
 */
export function ApplyButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const open = useContext(ApplyContext);
  return (
    <button type="button" onClick={() => open?.()} className={className}>
      {children}
    </button>
  );
}

/** Whole KB under a megabyte, one decimal above — nobody needs "1126 KB". */
function size(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** What somebody would answer to "thanks, —?". Falls back to the whole string,
 *  which covers mononyms and anyone who typed their name back to front. */
function firstName(full: string) {
  return full.trim().split(/\s+/)[0] || full.trim();
}

function PdfIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-8 w-8 shrink-0 text-brand ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 3H7a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V7.5z" />
      <path d="M14 3v4.5h4.5" />
      <path d="M9 13.5h6M9 16.5h4" />
    </svg>
  );
}
