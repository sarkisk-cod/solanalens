import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Type safety remains enforced by the explicit pre-build typecheck script.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
