import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  transpilePackages: ["@resto-hub/ui", "@resto-hub/types", "@resto-hub/utils"],
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/api/feed",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" }],
      },
    ];
  },
  async rewrites() {
    if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
      return [];
    }
    const ADMIN_URL = process.env.ADMIN_URL || "https://sdmtsd-resto-admin.vercel.app";
    return [
      {
        source: "/admin",
        destination: `${ADMIN_URL}/admin`,
      },
      {
        source: "/admin/:path*",
        destination: `${ADMIN_URL}/admin/:path*`,
      },
      {
        source: "/:locale(ja|en)/admin",
        destination: `${ADMIN_URL}/admin/:locale`,
      },
      {
        source: "/:locale(ja|en)/admin/:path*",
        destination: `${ADMIN_URL}/admin/:locale/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
