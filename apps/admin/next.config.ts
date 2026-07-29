import type { NextConfig } from "next";
import path from "path";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  ...(process.env.VERCEL === "1" || process.env.NODE_ENV === "production"
    ? { basePath: "/admin" }
    : {}),
  transpilePackages: ["@resto-hub/ui", "@resto-hub/types", "@resto-hub/utils", "@resto-hub/db"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias["next-intl"] = path.resolve(__dirname, "./src/lib/next-intl-shim.ts");
    return config;
  },
};

export default nextConfig;
