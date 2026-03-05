import type { NextConfig } from "next";
import { nextJsSecurityHeaders } from "./lib/security";

const nextConfig: NextConfig = {
  eslint: {
    // Pre-existing lint issues in legacy code; don't block production builds
    ignoreDuringBuilds: true,
  },
  async headers() {
    return nextJsSecurityHeaders;
  },
};

export default nextConfig;
