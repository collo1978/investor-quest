import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Default output directory `.next` — required for standard Vercel Next.js deployments.
  // Avoid picking a parent-folder lockfile as the tracing root (fixes dev/build warnings).
  outputFileTracingRoot: path.join(__dirname)
};

export default nextConfig;
