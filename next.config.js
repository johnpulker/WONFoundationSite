/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['www.wonfoundation.net'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
    ],
    unoptimized: false,
  },
  // Fix for Netlify plugin compatibility with Next.js 15
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Fix for multiple lockfiles warning and Netlify build traces
  outputFileTracingRoot: require('path').join(__dirname),
  // Ensure output directory is set correctly for Netlify
  distDir: '.next',
  // Don't fail build on ESLint warnings
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Security headers for admin routes
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // CSP: Report-only mode (won't break PayPal, but will warn about issues)
          // Update to enforce mode once PayPal integration is confirmed working
          {
            key: 'Content-Security-Policy-Report-Only',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.paypal.com https://www.paypalobjects.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.paypal.com https://api-m.paypal.com;",
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig

