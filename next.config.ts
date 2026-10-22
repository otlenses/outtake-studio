import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lets a phone on the same Wi-Fi open the dev site by this computer's address (e.g. 192.168.0.28:3000)
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
