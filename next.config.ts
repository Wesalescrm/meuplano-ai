import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["maps.googleapis.com", "lh3.googleusercontent.com"],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
