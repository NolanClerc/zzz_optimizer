import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enable React Strict Mode for better development debugging
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "exemple.com", // Replace with your actual domain
      },
    ],
  },
};

export default nextConfig;
