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
  // The pitch demo moved from the app root to /demo (see docs/ITERATION_0.md). These
  // permanent redirects keep every pre-move URL shared before this change working.
  async redirects() {
    return [
      { source: "/login", destination: "/demo/login", permanent: true },
      { source: "/employer", destination: "/demo/employer", permanent: true },
      { source: "/wallet", destination: "/demo/wallet", permanent: true },
      { source: "/provider-dashboard", destination: "/demo/provider-dashboard", permanent: true },
      { source: "/admin", destination: "/demo/admin", permanent: true },
      { source: "/search", destination: "/demo/search", permanent: true },
      { source: "/provider/:id", destination: "/demo/provider/:id", permanent: true },
      { source: "/book/:id", destination: "/demo/book/:id", permanent: true },
      { source: "/booking/:id", destination: "/demo/booking/:id", permanent: true },
      { source: "/booking/:id/contract", destination: "/demo/booking/:id/contract", permanent: true },
    ];
  },
};

export default nextConfig;
