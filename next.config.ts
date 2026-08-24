import type { NextConfig } from "next";

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

      /* --- The Automated Equipment rename ---------------------------------
         Three of the solution categories changed their names, and two of them
         had to change their URLs with them: "Assembly Automation" is now a
         machine inside Automation & Assembly, and "Inspection & Testing" is now
         the category that used to be called ICT & FCT. Leaving the old slugs in
         place would have meant /solutions/assembly-automation serving a page
         called something else while a different page answered to that name.

         So the folders moved, and these carry the old URLs to the new ones.
         Every page under each of them moved as one piece, which is why the two
         category rules are wildcards: :path* matches the category on its own
         and every machine beneath it, so nothing needs listing twice.

         Automated Storage & Material Handling is deliberately absent. It was
         renamed too, but nothing else on the site claims "material handling",
         so its slug stayed and there is no URL to repair.
      --------------------------------------------------------------------- */
      {
        source: "/solutions/assembly-automation/:path*",
        destination: "/solutions/production-custom-equipment/:path*",
        permanent: true,
      },
      {
        source: "/solutions/ict-fct/:path*",
        destination: "/solutions/inspection-testing/:path*",
        permanent: true,
      },
      {
        // The one machine that moved on its own: Machine Vision went with the
        // category renamed to Vision & Automation, and /solutions/inspection-
        // testing is now a real page again under new management — so this is a
        // single path rather than a wildcard, which would swallow the three
        // machines that legitimately live there now.
        source: "/solutions/inspection-testing/machine-vision",
        destination: "/solutions/vision-automation/machine-vision",
        permanent: true,
      },

      /* --- Two pages folded into their sitemap names ------------------------
         Material Management System and Automated Functional Test Equipment are
         not in the sitemap, and each sat beside a stub describing the same
         thing under the name the sitemap does use. So the content moved across
         and the two old pages went. These carry their URLs to where the words
         now live, which is the whole point of a merge rather than a delete —
         the page a reader bookmarked still answers, under its new name.

         The ICT & FCT one takes two hops from the oldest form of that URL:
         /solutions/ict-fct/automated-functional-test-equipment lands on the
         category rule above first, and on this one second. Browsers follow
         both; it is only worth knowing if you are reading a redirect log.
      --------------------------------------------------------------------- */
      {
        source: "/solutions/material-handling/material-management-system",
        destination: "/solutions/material-handling/amhs",
        permanent: true,
      },
      {
        source: "/solutions/inspection-testing/automated-functional-test-equipment",
        destination: "/solutions/inspection-testing/ict-fct",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
