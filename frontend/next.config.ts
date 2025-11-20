import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8081',
      },
      {
        protocol: 'https',
        hostname: 'seirotan.desa.id',
      },
    ],
    // Disable image optimization for localhost to avoid 400 errors
    unoptimized: process.env.NODE_ENV === 'development',
  },
  /* config options here */
};

export default nextConfig;
