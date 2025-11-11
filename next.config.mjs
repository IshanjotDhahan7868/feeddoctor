/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'cdn.shopify.com',
      'images.pexels.com',
      'images.unsplash.com'
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ['skia-canvas']
  }
};

export default nextConfig;

