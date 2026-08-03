import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { SubSolution } from "@/lib/solutions";

export function SubSolutionList({ items }: { items: SubSolution[] }) {
  return (
    <Container>
      <section className="pt-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Solutions in this category
        </h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.slug}>
              <Link
                href={item.href}
                className="group flex h-full flex-col rounded-xl border border-line bg-background p-5 transition-colors hover:border-brand hover:bg-brand-light/40"
              >
                <span className="text-base font-semibold text-foreground group-hover:text-brand">
                  {item.title}
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted">
                  {item.summary}
                </span>
                <span
                  aria-hidden="true"
                  className="mt-4 text-sm font-medium text-brand"
                >
                  Learn more →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
