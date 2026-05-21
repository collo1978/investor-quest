import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Default output directory `.next` — required for standard Vercel Next.js deployments.
  // Avoid picking a parent-folder lockfile as the tracing root (fixes dev/build warnings).
  outputFileTracingRoot: path.join(__dirname),
  images: {
    // Static assets under public/ — omit `search` to allow cache-bust query strings.
    localPatterns: [
      { pathname: "/screens/**" },
      { pathname: "/logos/**" }
    ]
  },
  async headers() {
    const hubSceneAssets = [
      "biz-quest.webp",
      "biz-quest.avif",
      "financial-quest.webp",
      "financial-quest.avif",
      "management-quest.webp",
      "management-quest.avif",
      "forces-quest.webp",
      "forces-quest.avif",
      "final-quest-map.webp",
      "final-quest-map.avif",
      "mission-brief-image.webp",
      "mission-brief-image.avif"
    ] as const;
    return hubSceneAssets.map((filename) => ({
      source: `/screens/${filename}`,
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable"
        }
      ]
    }));
  }
};

export default nextConfig;
