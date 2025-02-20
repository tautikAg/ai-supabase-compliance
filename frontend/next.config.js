/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  typescript: {
    // This will not fail the build even if there are TypeScript errors
    ignoreBuildErrors: true,
  },
  experimental: {
    appDir: true,
    serverActions: true,
  },
}

module.exports = nextConfig 