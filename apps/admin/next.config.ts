import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  ...(process.env.VERCEL === "1" || process.env.NODE_ENV === "production"
    ? { basePath: "/admin" }
    : {}),
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

export default withNextIntl(nextConfig);
