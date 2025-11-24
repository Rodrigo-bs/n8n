/**
 * Example Next.js configuration for integrating n8n frontend
 * 
 * This configuration shows different approaches to integrate the n8n
 * frontend within a Next.js application.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Option 1: Proxy to Vite dev server during development
  async rewrites() {
    // Only proxy in development
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/workflow-editor/:path*',
          destination: 'http://localhost:8080/:path*',
        },
      ];
    }
    return [];
  },

  // Option 2: Configure headers for iframe embedding
  async headers() {
    return [
      {
        source: '/n8n-editor/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'",
          },
        ],
      },
    ];
  },

  // Configure webpack to handle any special requirements
  webpack: (config, { isServer }) => {
    // Add any custom webpack configurations here if needed
    return config;
  },

  // Environment variables exposed to the browser
  env: {
    // These will be replaced at build time
    N8N_BACKEND_URL: process.env.N8N_BACKEND_URL || 'http://localhost:5678',
  },
};

module.exports = nextConfig;
