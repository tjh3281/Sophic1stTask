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
    ];
  },
};

export default nextConfig;
