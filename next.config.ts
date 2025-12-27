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
};

export default nextConfig;
