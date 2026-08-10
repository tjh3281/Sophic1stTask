import type { Metadata } from "next";
import Link from "next/link";
import { CareersPageHeader } from "@/components/careers/CareersPageHeader";
import { PlaceholderNotice } from "@/components/careers/PlaceholderNotice";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ENQUIRY_EMAIL } from "@/lib/contact";
import { JOB_OPENINGS } from "@/lib/careers";

export const metadata: Metadata = {
  title: "Job Openings",
  description:
    "Open roles at Sophic Automation across engineering, software and field" +
    " service in Penang, Selangor and Singapore.",
};

/**
 * The vacancy list.
 *
 * Rows, not cards. A grid of tiles is the right shape for four things you are
 * choosing between on their pictures, and the wrong one for a job board: what
 * a reader does here is run down a column of titles until one of them is their
 * own, and a row keeps the title, the location and the summary on one line of
 * sight while the column of titles stays a column.
 */
export default function OpeningsPage() {
  const departments = [...new Set(JOB_OPENINGS.map((job) => job.department))];

  return (
    <>
      <CareersPageHeader
        trail={[
          { label: "Home", href: "/" },
          { label: "Careers", href: "/careers" },
          { label: "Job Openings" },
        ]}
        eyebrow="Careers"
        title="Job openings"
        lead={`${JOB_OPENINGS.length} roles across ${departments.length} teams, in Penang, Selangor and Singapore.`}
      />

      <Container>
        <section className="py-10 sm:py-14">
          <Reveal>
            <PlaceholderNotice />
          </Reveal>

          {/* divide-y rather than a border per row: one hairline between any
              two rows, and none stranded above the first or below the last. */}
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {JOB_OPENINGS.map((job, index) => (
              <li key={job.slug}>
                <Reveal delay={Math.min(index, 4) * 50}>
                  {/* The whole row is the link. A separate "View role" control
                      would put a 40px target inside a 120px row that already
                      looks clickable, and be the only part of it that was. */}
                  <Link
                    href={job.href}
                    className="group flex flex-col gap-3 py-6 transition-colors duration-200 ease-gentle sm:flex-row sm:items-center sm:gap-6"
                  >
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold tracking-[-0.015em] text-foreground transition-colors duration-200 ease-gentle group-hover:text-brand">
                        {job.title}
                      </h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">
                        {job.summary}
                      </p>

                      <ul className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-muted">
                        <Meta>{job.department}</Meta>
                        <Meta>{job.location}</Meta>
                        <Meta>{job.employmentType}</Meta>
                        <Meta>{job.experience}</Meta>
                      </ul>
                    </div>

                    {/* Circle rather than a caret on its own: at the right edge
                        of a wide row a bare arrow reads as decoration, and a
                        ring around it reads as the button it is. */}
                    <span
                      aria-hidden="true"
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-[transform,color,border-color,background-color] duration-200 ease-gentle group-hover:translate-x-0.5 group-hover:border-brand group-hover:bg-brand group-hover:text-white motion-reduce:group-hover:translate-x-0"
                    >
                      →
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>

          {/* Nothing on the list is a fit — the alternative, rather than a
              dead end. Points at the published address instead of the contact
              form, which routes enquiries by machine and has no field for a CV. */}
          <Reveal className="mt-10">
            <div className="rounded-xl border border-line bg-surface px-6 py-7 sm:px-8">
              <h2 className="text-lg font-bold tracking-[-0.015em] text-foreground">
                Nothing here yet?
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                We hire ahead of the list when somebody is right. Send your CV
                and a line about the work you want to be doing.
              </p>
              <a
                href={`mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent("Speculative application")}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand transition-colors duration-200 ease-gentle hover:text-brand-dark"
              >
                {ENQUIRY_EMAIL}
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </Reveal>
        </section>
      </Container>
    </>
  );
}

/** One fact about a role, separated from the next by a dot rather than boxed —
 *  four chips per row across six rows is a lot of borders for four short
 *  words each. */
function Meta({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 after:text-muted/40 after:content-['·'] last:after:hidden">
      {children}
    </li>
  );
}
