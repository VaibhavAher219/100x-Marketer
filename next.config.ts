import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove console statements in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'] // Keep console.error for critical issues
    } : false,
    styledComponents: true,
  },

  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    domains: ['cdn.sanity.io'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://widget.intercom.io https://js.intercomcdn.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "connect-src 'self' https://*.supabase.co https://api-iam.intercom.io https://nexus-websocket-a.intercom.io",
              "frame-src https://widget.intercom.io",
              "font-src 'self' data:",
            ].join('; ')
          }
        ]
      }
    ]
  },

  // Exclude debug pages from production builds
  async redirects() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/debug-user',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/debug-state',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/debug-auth',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/test-connection',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/setup-check',
          destination: '/404',
          permanent: false,
        },
      ]
    }
    return []
  },

  // Production optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-accordion']
  },

  // Bundle analyzer (only in development)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      if (process.env.NODE_ENV === 'development') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            openAnalyzer: true,
          })
        )
      }
      return config
    }
  })
};

export default nextConfig;
