/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  distDir: 'dist',
  env: {
    NEXT_PUBLIC_API_URL: 'https://task.agudo.net/api',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3020/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
