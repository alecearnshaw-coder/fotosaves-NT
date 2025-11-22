import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // All Aves group pages (orders, families, Passeriformes families, etc.)
      {
        source: '/aves/:path*',
        destination: '/grupo.html',
      },
      // All species detail pages
      {
        source: '/especie/:path*',
        destination: '/especie.html',
      },
    ];
  },
};

export default nextConfig;