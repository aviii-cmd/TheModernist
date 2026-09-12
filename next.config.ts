import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cover images / media uploaded to Supabase Storage
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      // Seed / placeholder imagery used until real photography is uploaded
      { protocol: "https" as const, hostname: "picsum.photos" },
      { protocol: "https" as const, hostname: "i.pravatar.cc" },
    ],
  },
};

export default nextConfig;
