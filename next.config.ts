import type { NextConfig } from "next";
import { nextJsSecurityHeaders } from "./lib/security";

const nextConfig: NextConfig = {
  // Ignore TypeScript errors in API routes (they're Cloudflare Workers, not Next.js routes)
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return nextJsSecurityHeaders;
  },
};

export default nextConfig;
