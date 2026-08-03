import { Container } from "@/components/ui/Container";

/**
 * Stands in for page copy until the content pass. Every solution and
 * sub-solution page renders one of these so the routing can be reviewed first.
 */
export function ContentPlaceholder({ note }: { note?: string }) {
  return (
    <Container>
      <div className="my-12 rounded-xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
        <p className="text-sm font-semibold text-foreground">
          Content coming soon
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
          {note ?? "This page is a routing placeholder. Copy, benefits, functions and imagery land in the content pass."}
        </p>
      </div>
    </Container>
  );
}
