import { Breadcrumbs, type Crumb } from "@/components/solutions/Breadcrumbs";
import { Container } from "@/components/ui/Container";

/**
 * Page header for the careers routes that do not get the photographic cover.
 *
 * A near-copy of the solutions PageHeader, and a copy on purpose rather than a
 * prop added to that one: the two differ in exactly the thing this section is
 * trying to differ in. The label is a drawn rule and wide-tracked caps instead
 * of a small bright word, and the title is bold and tightened rather than
 * medium — the same setting the careers cover uses, so the openings pages look
 * like they came from the page that linked to them.
 *
 * Anything after the lead goes in `children`; a role page hangs its facts there.
 */
export function CareersPageHeader({
  trail,
  eyebrow,
  title,
  lead,
  children,
}: {
  trail: Crumb[];
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-line bg-surface">
      <Container>
        <div className="py-10 sm:py-16">
          <Breadcrumbs trail={trail} />

          {eyebrow && (
            <div className="mt-7 flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-9 shrink-0 bg-brand" />
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-brand">
                {eyebrow}
              </p>
            </div>
          )}

          <h1 className="mt-4 max-w-3xl text-[2rem] font-bold leading-[1.12] tracking-[-0.03em] text-foreground sm:text-[2.75rem]">
            {title}
          </h1>

          {lead && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              {lead}
            </p>
          )}

          {children}
        </div>
      </Container>
    </div>
  );
}
