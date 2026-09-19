import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the tracing root to this project; a stray lockfile in the parent
  // directory otherwise makes Next infer the wrong workspace root.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
