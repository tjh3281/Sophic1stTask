import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { COMPANY, ENQUIRY_EMAIL, OFFICES } from "@/lib/contact";
import { SOLUTIONS } from "@/lib/solutions";

/**
 * Site footer: who we are on the left, where we are on the right.
 *
 * Four addresses is a lot of small print, so the shape of this is chosen to
 * spend as little height on it as possible — the offices run as columns across
 * the page rather than down it, which is what turns four stacked blocks into
 * one band. Below lg they fall to two columns, and only on a phone do they
 * stack, where there is nothing to be done about it and vertical space is
 * cheap anyway.
 *
 * Everything factual comes from lib/contact, which the contact page also
 * reads. Nothing about the company is typed twice.
 */
/**
 * Turns a printed number into one a phone can dial.
 *
 * Sophic prints these with the country code already folded into the bracket —
 * "(604)" is Malaysia's 60 plus Penang's area code 4, not an area code of its
 * own. So the digits are already the full international number and only need a
 * plus in front. Prefixing another 60, or a 6, would dial another country
 * entirely: +6 604… reaches Thailand.
 */
function dial(printed: string) {
  return `tel:+${printed.replace(/\D/g, "")}`;
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <Container>
        <div className="grid gap-x-10 gap-y-9 py-10 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
          {/* Identity */}
          <div>
            <Image
              src="/images/sophic-logo-dark.png"
              alt="Sophic Digital Solutions"
              width={480}
              height={267}
              className="h-11 w-auto object-contain object-left"
            />
            <p className="mt-3 text-sm font-bold tracking-tight text-foreground">
              {COMPANY.legalName}
            </p>
            {/* Set quieter than the name it belongs to: it has to be on the
                page for a company of this kind, and nobody reads it twice. */}
            <p className="mt-0.5 text-xs text-muted">
              ({COMPANY.registration})
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              {COMPANY.blurb}
            </p>
            <p className="mt-3 text-xs">
              <span className="text-muted">Email: </span>
              <a
                href={`mailto:${ENQUIRY_EMAIL}`}
                className="break-all font-medium text-brand transition-colors hover:text-brand-dark"
              >
                {ENQUIRY_EMAIL}
              </a>
            </p>
          </div>

          {/* Addresses */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Address
            </h2>
            <ul className="mt-4 grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
              {OFFICES.map((office) => (
                <li key={office.alias}>
                  <p className="text-xs font-bold text-foreground">
                    {office.name}{" "}
                    {/* The building name in the quieter weight — it labels the
                        office rather than naming a second one. */}
                    <span className="font-medium text-muted">
                      ({office.alias})
                    </span>
                  </p>
                  <address className="mt-1.5 text-xs not-italic leading-relaxed text-muted">
                    {office.lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                    {office.phones && (
                      <span className="mt-1 block">
                        Tel:{" "}
                        {office.phones.map((phone, index) => (
                          <span key={phone}>
                            {index > 0 && " / "}
                            <a
                              href={dial(phone)}
                              className="transition-colors hover:text-brand"
                            >
                              {phone}
                            </a>
                          </span>
                        ))}
                      </span>
                    )}
                  </address>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Solution links and the copyright share the last line, so the four
            routes stay reachable from the foot of any page without costing a
            row of their own. */}
        <div className="flex flex-col gap-3 border-t border-line py-5 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {SOLUTIONS.map((solution) => (
              <li key={solution.slug}>
                <Link
                  href={solution.href}
                  className="text-xs text-muted transition-colors hover:text-brand"
                >
                  {solution.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted sm:shrink-0">
            © {new Date().getFullYear()} Sophic Automation — prototype.
          </p>
        </div>
      </Container>
    </footer>
  );
}
