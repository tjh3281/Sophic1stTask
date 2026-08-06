"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { getCategory, getEquipment, type EquipmentEnum } from "@/lib/advisor/categories";

/**
 * The handoff. Everything the advisor learned is already in the form when it
 * opens, so the reader confirms a diagnosis instead of retyping one.
 *
 * The problem text is carried in component state, never in the URL — it is a
 * sentence about the reader's factory, and sentences about someone's factory do
 * not belong in a link they might paste into a chat with a colleague.
 */
export function LeadForm({
  equipment,
  problem,
  onClose,
}: {
  /** null when the advisor never managed a diagnosis. */
  equipment: EquipmentEnum | null;
  problem: string;
  onClose: () => void;
}) {
  const machine = equipment ? getEquipment(equipment) : null;
  // Both go over. The machine is what the reader was shown and what an engineer
  // should quote against; the category is the coarser label the sales side
  // already sorts by, and deriving it here means the two can never disagree.
  const solution = machine ? getCategory(machine.category) : null;
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    problem,
  });

  function set(key: keyof typeof fields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/advisor/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...fields,
          category: solution?.id ?? "UNDIAGNOSED",
          equipment: equipment ?? "",
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Could not send that. Try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Could not reach us just now. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-heading"
        className="search-panel w-full max-w-md overflow-hidden rounded-xl border border-line bg-background shadow-2xl shadow-slate-900/25"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id="lead-heading" className="text-base font-semibold text-foreground">
              {sent ? "Thanks — that's with our team" : "Talk to our team"}
            </h2>
            {!sent && (
              <p className="mt-1 text-xs text-muted">
                {machine
                  ? `We'll come back with the ${machine.label} options that fit your line.`
                  : "Tell us what's happening and an engineer will work out which way to take it."}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 shrink-0 rounded-md p-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
              <path
                d="m5 5 10 10M15 5 5 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm leading-relaxed text-muted">
              An engineer will read this and reply to{" "}
              <span className="font-medium text-foreground">{fields.email}</span>.
              They already have your problem and the category it falls under, so
              you won&rsquo;t be asked again.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-brand mt-6 rounded-md px-5 py-2.5 text-sm font-medium text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 px-5 py-5">
            {/* Shown, not hidden. The reader should see that the advisor is
                passing their problem on, and be able to correct it — a field
                they cannot see is one they cannot trust. */}
            <div className="rounded-lg border border-line bg-surface px-3 py-2.5">
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-muted">
                Matched solution
              </p>
              <p
                className={cn(
                  "mt-1 text-sm font-medium",
                  machine ? "text-foreground" : "text-muted",
                )}
              >
                {machine ? machine.label : "Not identified yet"}
              </p>
              {solution && (
                <p className="mt-0.5 text-xs text-muted">{solution.label}</p>
              )}
            </div>

            <Field label="Name" value={fields.name} onChange={(v) => set("name", v)} required autoComplete="name" />
            <Field label="Company" value={fields.company} onChange={(v) => set("company", v)} required autoComplete="organization" />
            <Field label="Work email" type="email" value={fields.email} onChange={(v) => set("email", v)} required autoComplete="email" />
            <Field label="Phone (optional)" type="tel" value={fields.phone} onChange={(v) => set("phone", v)} autoComplete="tel" />

            <label className="block">
              <span className="text-xs font-medium text-foreground">
                The problem
              </span>
              <textarea
                value={fields.problem}
                onChange={(event) => set("problem", event.target.value)}
                rows={3}
                className="mt-1.5 w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand"
              />
            </label>

            {error && (
              <p role="alert" className="text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className={cn(
                "btn-brand w-full rounded-md px-5 py-2.5 text-sm font-medium text-white",
                busy && "opacity-60",
              )}
            >
              {busy ? "Sending…" : "Send to our team"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
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
  return (
    <label className="block">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand"
      />
    </label>
  );
}
