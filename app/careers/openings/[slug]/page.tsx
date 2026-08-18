import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ApplyButton,
  ApplyProvider,
} from "@/components/careers/ApplyDialog";
import { OpeningCover } from "@/components/careers/OpeningCover";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { JOB_OPENINGS, OPENINGS_HREF, findOpening } from "@/lib/careers";

/** Every role is known at build time, so all six prerender and the route never
 *  wakes a function on Netlify. Anything else 404s. */
export async function generateStaticParams() {
  return JOB_OPENINGS.map((job) => ({ slug: job.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/careers/openings/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const job = findOpening(slug);
  if (!job) return { title: "Job Opening" };

  return {
    title: job.title,
    description: `${job.title} — ${job.hiringType}. ${job.location}.`,
  };
}

/**
 * One role.
 *
 * Two columns from lg: the description reads down the left, and everything
 * somebody needs in order to decide — the facts and the apply button — is
 * pinned in a card on the right that follows them down the page. On a job ad
 * the call to action cannot live only at the bottom, because the reader who
 * has decided by the second bullet should not have to scroll past the other
 * twelve to act on it.
 */
export default async function OpeningPage({
  params,
}: PageProps<"/careers/openings/[slug]">) {
  const { slug } = await params;
  const job = findOpening(slug);
  if (!job) notFound();

  return (
    <>
      <OpeningCover job={job} />

      {/* Both apply buttons open one dialog, so it is hoisted to the level
          that contains the pair of them. */}
      <ApplyProvider role={job.title}>
      <Container>
        <div className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-14">
          <div>
            {/* The posting's own two headings, in the posting's own order.
                There is no lead paragraph above them because the ads do not
                have one, and writing one would mean putting words in Sophic's
                mouth about a job they are hiring for. */}
            <Section title="Job Description" items={job.description} first />
            <Section title="Job Requirements" items={job.requirements} />

            <Reveal className="mt-12">
              {/* Repeats the action at the natural end of the read, for
                  anybody below lg who never saw the sidebar as a sidebar. */}
              <div className="border-t border-line pt-8">
                <span className="float-glow">
                  <ApplyButton className="btn-brand group inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium text-white transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none">
                    Apply for this role
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </ApplyButton>
                </span>
                <p className="mt-4 text-sm text-muted">
                  Or go back to{" "}
                  <Link
                    href={OPENINGS_HREF}
                    className="font-medium text-brand transition-colors duration-200 ease-gentle hover:text-brand-dark"
                  >
                    all job openings
                  </Link>
                  .
                </p>
              </div>
            </Reveal>
          </div>

          {/* top-28 clears the fixed 64px header plus the breathing room the
              rest of the page keeps above a heading. */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="float-glow float-glow-tile">
              <div className="rounded-xl border border-line bg-background p-6 shadow-sm shadow-slate-900/[0.03]">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                  At a glance
                </p>

                <dl className="mt-4 space-y-3 text-sm">
                  <Row label="Hiring type" value={job.hiringType} />
                  <Row label="Location" value={job.location} />
                  {job.salary && <Row label="Salary" value={job.salary} />}
                </dl>

                {/* No float-glow wrapper on this one, unlike the button at the
                    foot of the description. .float-glow is display:inline-block
                    in an unlayered rule, so it beats a `block` utility on the
                    same element and shrink-wraps — which would take the w-full
                    off the button inside it. The card already sits on its own
                    glow; a second one inside it would be light on light. */}
                <ApplyButton className="btn-brand mt-6 flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-medium text-white transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none">
                  Apply for this role
                </ApplyButton>

                {/* Says what to have ready, which is the one thing worth
                    knowing before the dialog opens. */}
                <p className="mt-3 text-center text-xs text-muted">
                  Résumé as a PDF
                </p>
              </div>
            </div>
          </aside>
        </div>
      </Container>
      </ApplyProvider>
    </>
  );
}

/** One headed list of bullets. Both halves of the ad are one of these, so the
 *  heading level, spacing and marker are set once. */
function Section({
  title,
  items,
  first,
}: {
  title: string;
  items: string[];
  /** The first section sits under the page header, which brings its own space,
   *  so it does not need the gap that separates one section from the next. */
  first?: boolean;
}) {
  return (
    <Reveal className={first ? undefined : "mt-10"}>
      <h2 className="text-lg font-bold tracking-[-0.015em] text-foreground">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-base leading-relaxed text-muted"
          >
            {/* A rule, not a bullet: a disc at this text size sits low and
                reads as a full stop that got loose. */}
            <span
              aria-hidden="true"
              className="mt-[0.6875rem] h-px w-3 shrink-0 bg-brand"
            />
            {item}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

