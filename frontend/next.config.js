/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/processed/**',
      },
      // Add your production backend when ready
      // {
      //   protocol: 'https',
      //   hostname: 'your-production-backend.com',
      //   pathname: '/processed/**',
      // },
    ],
    domains: ['localhost'],
    unoptimized: true,
  },
  // Add a custom webpack configuration to fix WebSocket connection issues
  webpack: (config, { isServer, dev }) => {
    // Only apply in development mode
    if (dev && !isServer) {
      // Modify client-side webpack config to improve WebSocket handling
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,        // Check for changes every second
        aggregateTimeout: 300, // Delay before rebuilding
      };
    }
    return config;
  },
}

module.exports = nextConfig 