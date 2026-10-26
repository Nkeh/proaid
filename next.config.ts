import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* This app has no server data fetching - everything is client-rendered against
   * localStorage-backed Zustand state - so Cache Components / PPR add nothing here
   * and were causing instant-navigation validation to drop client-only route
   * segments, breaking router.push() redirects. Keep it off. */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
