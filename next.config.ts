import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      },
      {
        protocol: "https",
        hostname: "api.cloudinary.com"
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "zaahkhmnqcczswxrcuhw.supabase.co",
        pathname: "/**",
      }
    ]
  },
  async rewrites() {
    // Expose public site-media bucket via a friendly URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zaahkhmnqcczswxrcuhw.supabase.co";
    return [
      {
        source: "/site-media/:path*",
        destination: `${supabaseUrl}/storage/v1/object/public/site-media/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on"
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)"
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://images.unsplash.com https://res.cloudinary.com https://api.cloudinary.com https://*.supabase.co; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.cloudinary.com; frame-src 'self' https://www.youtube.com; media-src 'self' https://res.cloudinary.com https://api.cloudinary.com https://*.supabase.co;"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
