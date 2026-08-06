import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { Container } from "@/components/ui/Container";
import { ENQUIRY_EMAIL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Talk to Sophic Automation about assembly, inspection, material handling and board test.",
};

/**
 * The contact page.
 *
 * Reached two ways, and the difference between them is one query parameter:
 * the header's Contact arrives bare, while a solution page's Contact Us brings
 * `?solution=<slug>` and the form opens with that machine already chosen.
 *
 * The slug is the only thing that travels in the URL. It says which page
 * somebody came from, which is not private and survives being shared — unlike
 * anything they type into the form below, which stays in the component.
 */
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ solution?: string | string[] }>;
}) {
  const { solution } = await searchParams;
  // Repeating the parameter is not an error worth a page for; take the first.
  const preset = Array.isArray(solution) ? (solution[0] ?? "") : (solution ?? "");

  return (
    <section className="bg-surface py-14 sm:py-20">
      <Container>
        {/* The heading column is fixed-ish and the form takes the rest, so the
            form keeps its two columns at the widths that matter. Below lg they
            stack and the contact card sits above the fields. */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Contact Us
            </h1>

            {/* One email card, not the two the reference has. Sophic publishes
                a single address, and splitting it into "sales" and "support"
                boxes that both said the same thing would invent a routing that
                does not exist.

                Full width above the other two because an address is long and a
                wrapped email is hard to read back; the phone number and the
                opening hours are both short enough to sit side by side. */}
            <div className="mt-8 space-y-3">
              <Card icon={<EnvelopeIcon />} label="Email">
                <a
                  href={`mailto:${ENQUIRY_EMAIL}`}
                  className="break-all transition-colors hover:text-brand"
                >
                  {ENQUIRY_EMAIL}
                </a>
              </Card>

              <div className="grid gap-3 sm:grid-cols-2">
                <Card icon={<PhoneIcon />} label="Phone">
                  {/* Linked so a phone can dial it. The international form is
                      derived from the printed one — 604 is Penang, so the
                      national 04-508 9737 becomes +60 4 508 9737. */}
                  <a
                    href="tel:+6045089737"
                    className="transition-colors hover:text-brand"
                  >
                    Tel: (604) 508 9737
                  </a>
                </Card>

                <Card icon={<CalendarIcon />} label="Hours">
                  {/* Two lines, days above times, so the pair reads as one
                      answer rather than a sentence to parse. */}
                  <span className="block">Mon &ndash; Fri</span>
                  <span className="block">08:30 &ndash; 17:30</span>
                </Card>
              </div>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-muted">
              Tell us where your line hurts and an engineer will come back to
              you — not a form letter.
            </p>
          </div>

          <ContactForm preset={preset} />
        </div>
      </Container>
    </section>
  );
}

/**
 * One contact detail: a light mark and its name on top, the value under it in
 * the weight that makes it the thing you actually read.
 *
 * The label is the quiet half on purpose — somebody scanning this column is
 * looking for a number or an address, and already knows what a phone number
 * looks like.
 */
function Card({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-background px-4 py-4 shadow-sm shadow-slate-900/[0.03]">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </div>
      <div className="mt-2.5 text-[0.9375rem] font-semibold leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  );
}

/* Drawn at one weight and one size, so the three read as a set. */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[1.15rem] w-[1.15rem] shrink-0">
      {children}
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <Icon>
      <rect x="3" y="5.5" width="18" height="13" rx="2" {...STROKE} />
      <path d="m3.9 6.8 8.1 6.2 8.1-6.2" {...STROKE} />
    </Icon>
  );
}

function PhoneIcon() {
  return (
    <Icon>
      <path
        d="M8.1 3.6H5.3c-.9 0-1.7.8-1.6 1.7.3 3.6 1.9 7 4.4 9.5 2.5 2.5 5.9 4.1 9.5 4.4.9.1 1.7-.7 1.7-1.6v-2.8c0-.8-.6-1.5-1.4-1.6l-2-.3c-.6-.1-1.2.2-1.5.7l-.7 1.3a12.4 12.4 0 0 1-5.6-5.6l1.3-.7c.5-.3.8-.9.7-1.5l-.3-2c-.1-.8-.8-1.4-1.6-1.4Z"
        {...STROKE}
      />
    </Icon>
  );
}

function CalendarIcon() {
  return (
    <Icon>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" {...STROKE} />
      <path d="M3.5 10h17M8.5 3.5V7M15.5 3.5V7" {...STROKE} />
    </Icon>
  );
}
