import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Eksplisit output untuk Vercel
  output: "standalone",

  // Izinkan server actions dari semua origin
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
};

export default nextConfig;
