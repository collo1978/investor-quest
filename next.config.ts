import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // `next dev` and `next build` must not share the same distDir; concurrent runs corrupt
  // `.next` (missing routes-manifest.json, broken webpack cache). Dev uses default `.next`;
  // production `npm run build` / `npm run start` set NEXT_DIST_DIR=.next-build via package.json.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // Avoid picking a parent-folder lockfile as the tracing root (fixes dev/build warnings).
  outputFileTracingRoot: path.join(__dirname)
};

export default nextConfig;
