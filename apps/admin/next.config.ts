import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@resto-hub/ui", "@resto-hub/types", "@resto-hub/utils"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
