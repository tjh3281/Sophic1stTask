import Image from "next/image";
import { Breadcrumbs } from "@/components/solutions/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { OPENINGS_HREF, type JobOpening } from "@/lib/careers";

/**
 * Cover for one role.
 *
 * The role pages used to open on a flat pale band — the one branch of the site
 * whose deepest pages looked like a different site from the two above them. Now
 * each carries its own photograph, which is also the only thing that tells nine
 * otherwise identically-shaped pages apart at a glance: three of the roles are
 * called Software Engineer and differ by a word in brackets.
 *
 * Built like OpeningsCover next door, at a slightly greater height because
 * this one carries three lines rather than one — the title, and the facts a
 * reader checks before deciding whether to read the ad at all.
 *
 * The scrim is firmer than the covers further up the site, and deliberately.
 * Those sit on one known photograph each and are tuned to it; this sits on
 * whichever picture a role happens to have, so it has to hold white type over
 * an image nobody has looked at yet. Nothing is left below 30%.
 */
export function OpeningCover({ job }: { job: JobOpening }) {
  return (
    // -mt-16 pt-16 cancels the layout's clearance for the fixed header so the
    // photograph runs behind it, then restores the spacing inside.
    <section className="relative isolate -mt-16 flex min-h-[19rem] flex-col overflow-hidden bg-slate-950 pt-16 sm:min-h-[22rem]">
      <Image
        src={job.image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Bottom-heavy, because that is where the copy is, and never fully clear
          at the top because that is where the header is. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/62 via-45% to-slate-950/35"
      />
      {/* Firmer again through the top quarter. The header goes transparent on
          this route, so its white links sit on whatever this photograph happens
          to have in its top-right corner — which, across nine pictures nobody
          has cropped for the purpose, is sooner or later something pale. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/45 via-22% to-transparent to-50%"
      />

      <Container className="relative flex flex-1 flex-col">
        <div className="pt-6 sm:pt-8">
          <Breadcrumbs
            tone="dark"
            trail={[
              { label: "Home", href: "/" },
              { label: "Careers", href: "/careers" },
              { label: "Job Openings", href: OPENINGS_HREF },
              { label: job.title },
            ]}
          />
        </div>

        {/* mt-auto pins the block to the foot; the photograph takes whatever
            height is left above it. */}
        <div className="mt-auto max-w-3xl pb-9 pt-12 sm:pb-11">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-9 shrink-0 bg-accent" />
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-white/80">
              Job opening
            </p>
          </div>

          <h1 className="mt-4 text-[1.75rem] font-bold leading-[1.12] tracking-[-0.03em] text-white sm:text-[2.5rem]">
            {job.title}
          </h1>

          {/* Boxed here, where they are the first thing a reader checks —
              unlike the listing, where the same facts repeat down every row and
              chips would be all you saw. Glass rather than the listing's white
              boxes: on a photograph a solid chip is a hole cut in the picture. */}
          <ul className="mt-6 flex flex-wrap gap-2">
            <Fact>{job.hiringType}</Fact>
            <Fact>{job.location}</Fact>
            {job.salary && <Fact>{job.salary}</Fact>}
          </ul>
        </div>
      </Container>
    </section>
  );
}

function Fact({ children }: { children: React.ReactNode }) {
  return (
    <li className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-sm text-white backdrop-blur-[6px]">
      {children}
    </li>
  );
}
