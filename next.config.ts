/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/grupo/:path*',
        destination: '/grupo.html',
      },
      {
        source: '/especie/:path*',
        destination: '/especie.html',
      },
    ];
  },
};

export default nextConfig;