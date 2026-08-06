import { isMatchedCategory } from "@/lib/advisor/categories";

/**
 * Receives a qualified lead from the advisor's contact step.
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ NOT WIRED TO ANYTHING YET. This handler validates the lead and logs  │
 * │ it. It does not email, and it does not reach a CRM — so on a         │
 * │ deployed site every lead submitted here is lost, silently, which is  │
 * │ the exact failure the advisor exists to prevent.                     │
 * │                                                                      │
 * │ Before this goes live, send the payload somewhere durable: the sales │
 * │ inbox, HubSpot, whatever the team already reads. One fetch call.     │
 * └──────────────────────────────────────────────────────────────────────┘
 */

type Lead = {
  name: string;
  company: string;
  email: string;
  phone: string;
  category: string;
  problem: string;
};

/** Deliberately loose: enough to catch a typo, not enough to argue with a
 *  valid address. Rejecting a real buyer's email costs more than accepting a
 *  malformed one. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readLead(body: Record<string, unknown>): Lead | string {
  const text = (key: keyof Lead, max: number) =>
    typeof body[key] === "string" ? (body[key] as string).trim().slice(0, max) : "";

  const lead: Lead = {
    name: text("name", 120),
    company: text("company", 160),
    email: text("email", 254),
    phone: text("phone", 40),
    category: text("category", 60),
    problem: text("problem", 2_000),
  };

  if (!lead.name) return "Enter your name.";
  if (!lead.company) return "Enter your company.";
  if (!EMAIL.test(lead.email)) return "Enter a valid work email.";
  // The category comes from our own enum, never from the reader, so anything
  // else means the payload was assembled by hand. UNDIAGNOSED is the exception:
  // it is what the advisor sends when two attempts failed to place the problem,
  // and it is deliberately not one of the four — whoever picks this lead up
  // needs to know it arrived unclassified rather than trust a wrong label.
  if (lead.category !== "UNDIAGNOSED" && !isMatchedCategory(lead.category)) {
    return "Unrecognised category.";
  }

  return lead;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) return Response.json({ error: "Malformed request." }, { status: 400 });

  const lead = readLead(body);
  if (typeof lead === "string") {
    return Response.json({ error: lead }, { status: 400 });
  }

  // The one place the lead currently exists. Grep this marker when wiring the
  // real destination.
  console.info("[advisor] LEAD (not yet delivered anywhere):", {
    ...lead,
    receivedAt: new Date().toISOString(),
  });

  return Response.json({ ok: true });
}
