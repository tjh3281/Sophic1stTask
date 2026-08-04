import { Container } from "@/components/ui/Container";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

export function PageHeader({
  trail,
  eyebrow,
  title,
  lead,
}: {
  trail: Crumb[];
  eyebrow?: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="border-b border-line bg-surface">
      <Container>
        <div className="py-10 sm:py-14">
          <Breadcrumbs trail={trail} />
          {eyebrow && (
            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-brand">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-2 max-w-3xl text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {lead && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
              {lead}
            </p>
          )}
        </div>
      </Container>
    </div>
  );
}
