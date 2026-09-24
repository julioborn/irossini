import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@irossini/core", "@irossini/database", "@irossini/ui"],
};

export default nextConfig;
