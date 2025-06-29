/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Required for static export
  distDir: 'out', // Must match capacitor.config.ts webDir
  trailingSlash: true, // Needed for proper routing
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Required for static export
  },
  // Optional: If you need to rewrite API paths for mobile
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://your-lnd-node:port/:path*'
      }
    ]
  }
}

export default nextConfig
