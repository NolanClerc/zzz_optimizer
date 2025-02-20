import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'exemple.com', // Remplace par ton domaine
      },
    ],
  },
};

export default nextConfig;
