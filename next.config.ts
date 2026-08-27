import type { NextConfig } from "next";

/**
 * The seven equipment categories, as they were spelled when they sat directly
 * under /solutions.
 *
 * Written out rather than derived from lib/solutions.ts on purpose. This list
 * is a record of URLs that once existed, not of categories that currently do —
 * so it has to keep saying "robotics" even on the day the Robotics category is
 * renamed or dropped, which is exactly when a derived list would stop saying it
 * and quietly break every link ever written to the old address.
 */
const MOVED_CATEGORIES = [
  "automation-assembly",
  "inspection-testing",
  "material-handling",
  "production-custom-equipment",
  "robotics",
  "specialised-process-equipment",
  "vision-automation",
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // The home page was briefly built at /home before moving to the root.
        // Kept as a permanent redirect so any link written against that URL —
        // a bookmark, a message, a draft — still lands somewhere real.
        source: "/home",
        destination: "/",
        permanent: true,
      },

      /* --- Machines that moved on their own ---------------------------------
         Everything in this group is a single path rather than a wildcard, and
         every one of them has to be listed before the category rules further
         down. Next takes the first rule that matches and stops, so a specific
         path placed after the wildcard covering its category is a rule that can
         never fire.

         The first two are the same destination reached from two different
         eras of the same URL. Automated Functional Test Equipment was folded
         into the ICT & FCT page, and the category holding it was called
         ict-fct before it was called inspection-testing — so both spellings
         are carried, each in one hop rather than chained through the category
         rules, which would land them on a machine slug that no longer exists.
      --------------------------------------------------------------------- */
      {
        source: "/solutions/ict-fct/automated-functional-test-equipment",
        destination:
          "/solutions/automated-equipment/inspection-testing/ict-fct",
        permanent: true,
      },
      {
        source: "/solutions/inspection-testing/automated-functional-test-equipment",
        destination:
          "/solutions/automated-equipment/inspection-testing/ict-fct",
        permanent: true,
      },
      {
        // Machine Vision left Inspection & Testing with the category that was
        // renamed to Vision & Automation. /solutions/inspection-testing is a
        // real category again under new management, which is why this is one
        // path and not a wildcard — a wildcard here would swallow the three
        // machines that legitimately live there now.
        source: "/solutions/inspection-testing/machine-vision",
        destination:
          "/solutions/automated-equipment/vision-automation/machine-vision",
        permanent: true,
      },
      {
        // Material Management System was folded into the AMHS page, which is
        // the name the sitemap uses for the same thing.
        source: "/solutions/material-handling/material-management-system",
        destination: "/solutions/automated-equipment/material-handling/amhs",
        permanent: true,
      },

      /* --- Categories that were renamed ------------------------------------
         Two of the seven changed their slugs as well as their names, and both
         had to: "Assembly Automation" became a machine inside Automation &
         Assembly, and "Inspection & Testing" became the category that used to
         be called ICT & FCT. Leaving the old slugs in place would have meant
         /solutions/assembly-automation serving a page called something else
         while a different page answered to that name.

         Wildcards, because each category moved as one piece — :path* matches
         the category on its own and every machine beneath it, so nothing needs
         listing twice.

         Automated Storage & Material Handling is deliberately absent. It was
         renamed too, but nothing else on the site claims "material handling",
         so its slug stayed and there is no URL to repair.
      --------------------------------------------------------------------- */
      {
        source: "/solutions/assembly-automation/:path*",
        destination:
          "/solutions/automated-equipment/production-custom-equipment/:path*",
        permanent: true,
      },
      {
        source: "/solutions/ict-fct/:path*",
        destination:
          "/solutions/automated-equipment/inspection-testing/:path*",
        permanent: true,
      },

      /* --- The Automated Equipment nesting ----------------------------------
         Automated Equipment used to be /solutions itself. It is now one line of
         business under a Solutions page that lists them, so the whole catalogue
         dropped a level: every category and every machine gained
         /automated-equipment in front of it.

         These come last because they are the broadest rules here. Each one is
         the identity move for a category — same slug, one segment deeper — so
         anything above that needed to reach a *different* category had to have
         already fired.

         Nothing loops. Every destination begins /solutions/automated-equipment,
         and no source in this file matches that prefix.
      --------------------------------------------------------------------- */
      ...MOVED_CATEGORIES.map((slug) => ({
        source: `/solutions/${slug}/:path*`,
        destination: `/solutions/automated-equipment/${slug}/:path*`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
