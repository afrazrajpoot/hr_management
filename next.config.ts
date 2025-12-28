import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // ⚠️ Warning: This allows production builds to complete
    // even if your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Warning: This allows production builds to complete
    // even if your project has type errors.
    ignoreBuildErrors: true,
  },
  // Increase timeout for API routes to prevent 504 errors
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Note: API route timeouts are configured per-route using the maxDuration export
  // Example: export const maxDuration = 60; in your route.ts files
};

export default nextConfig;
