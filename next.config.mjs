/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for improved error handling
  reactStrictMode: true,
  // Automatically minify and optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Improve production performance
  swcMinify: true,
  // Enable experimental features
  experimental: {
    // Enable modern bundling features
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
