import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SOLUTIONS } from "@/lib/solutions";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <Container>
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="text-lg font-bold tracking-tight text-brand">SOPHIC</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              Automation solutions prototype. Navigation outside the Solution
              menu is not wired up yet.
            </p>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Solutions
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {SOLUTIONS.map((solution) => (
                <li key={solution.slug}>
                  <Link
                    href={solution.href}
                    className="text-sm text-foreground hover:text-brand"
                  >
                    {solution.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-line py-6">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Sophic Automation — prototype.
          </p>
        </div>
      </Container>
    </footer>
  );
}
