import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'seirotan.desa.id',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
