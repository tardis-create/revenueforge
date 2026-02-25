import type { NextConfig } from "next";
import { nextJsSecurityHeaders } from "./lib/security";

const nextConfig: NextConfig = {
  async headers() {
    return nextJsSecurityHeaders;
  },
};

export default nextConfig;
