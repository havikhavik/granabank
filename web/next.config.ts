import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sin el header "X-Powered-By: Next.js": no hace falta anunciar el stack.
  poweredByHeader: false,
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
