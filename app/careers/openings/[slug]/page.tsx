import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CareersPageHeader } from "@/components/careers/CareersPageHeader";
import { PlaceholderNotice } from "@/components/careers/PlaceholderNotice";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ENQUIRY_EMAIL } from "@/lib/contact";
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
    description: `${job.title} — ${job.employmentType}, ${job.location}. ${job.summary}`,
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

  const applyHref = `mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent(
    `Application: ${job.title}`,
  )}`;

  return (
    <>
      <CareersPageHeader
        trail={[
          { label: "Home", href: "/" },
          { label: "Careers", href: "/careers" },
          { label: "Job Openings", href: OPENINGS_HREF },
          { label: job.title },
        ]}
        eyebrow={job.department}
        title={job.title}
      >
        {/* Boxed here, where there are three of them and they are the first
            thing a reader checks — unlike the listing, where the same facts
            repeat down every row and chips would be all you saw. Department is
            missing on purpose: it is the eyebrow above. */}
        <ul className="mt-7 flex flex-wrap gap-2">
          <Fact>{job.location}</Fact>
          <Fact>{job.employmentType}</Fact>
          <Fact>{job.experience}</Fact>
        </ul>
      </CareersPageHeader>

      <Container>
        <div className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-14">
          <div>
            <Reveal>
              <PlaceholderNotice />
            </Reveal>

            <Reveal className="mt-8">
              <h2 className="text-lg font-bold tracking-[-0.015em] text-foreground">
                About the role
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted">
                {job.about}
              </p>
            </Reveal>

            <Section title="What you will be doing" items={job.responsibilities} />
            <Section title="What we are looking for" items={job.requirements} />
            <Section title="Nice to have" items={job.niceToHave} />

            <Reveal className="mt-12">
              {/* Repeats the action at the natural end of the read, for
                  anybody below lg who never saw the sidebar as a sidebar. */}
              <div className="border-t border-line pt-8">
                <span className="float-glow">
                  <a
                    href={applyHref}
                    className="btn-brand group inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium text-white transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none"
                  >
                    Apply for this role
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </a>
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
                  <Row label="Department" value={job.department} />
                  <Row label="Location" value={job.location} />
                  <Row label="Type" value={job.employmentType} />
                  <Row label="Experience" value={job.experience} />
                </dl>

                {/* No float-glow wrapper on this one, unlike the button at the
                    foot of the description. .float-glow is display:inline-block
                    in an unlayered rule, so it beats a `block` utility on the
                    same element and shrink-wraps — which would take the w-full
                    off the button inside it. The card already sits on its own
                    glow; a second one inside it would be light on light. */}
                <a
                  href={applyHref}
                  className="btn-brand mt-6 flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-medium text-white transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none"
                >
                  Apply for this role
                </a>

                <p className="mt-3 text-center text-xs text-muted">
                  Opens your mail client
                </p>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}

/** One headed list of bullets. Three of these make up the body of the ad, so
 *  the heading level, spacing and marker are set once. */
function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <Reveal className="mt-10">
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

function Fact({ children }: { children: React.ReactNode }) {
  return (
    <li className="rounded-full border border-line bg-background px-3.5 py-1.5 text-sm text-foreground">
      {children}
    </li>
  );
}
