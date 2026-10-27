import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: no `output: "standalone"` — that is for self-hosting/Docker and
  // breaks Vercel's managed build output. Plain build deploys cleanly.
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
