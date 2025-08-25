import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Performance optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Bundle analysis and optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle in production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Bundle recharts separately since it's large
          recharts: {
            name: 'recharts',
            test: /[\\/]node_modules[\\/](recharts|d3-*)[\\/]/,
            chunks: 'all',
            priority: 10,
          },
          // Bundle lucide icons separately
          icons: {
            name: 'icons',
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            chunks: 'all',
            priority: 8,
          },
        },
      };
    }
    return config;
  },

  // File tracing for deployment
  outputFileTracingRoot: path.join(__dirname),
  outputFileTracingIncludes: {
    '/': ['./public/**/*'],
  },
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },
  
  // Security headers and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Cache static assets
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/',
        headers: [
          // Cache homepage for shorter time
          {
            key: 'Cache-Control', 
            value: 'public, max-age=300, s-maxage=3600',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
