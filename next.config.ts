import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'technosolutions.sy',
        pathname: '/barbell-api/storage/**',
      },
    ],
  },
};

export default nextConfig;
