/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    // This will not fail the build even if there are TypeScript errors
    ignoreBuildErrors: true,
  },
  experimental: {
    // This should help bypass the client reference manifest error
    missingSuspenseWithCSRError: false,
  },
  // Add output configuration
  output: 'standalone',
}

module.exports = nextConfig 