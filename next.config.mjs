/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true
  },
  images: {
    domains: [
      // allow common e‑commerce CDNs; update as needed
      'cdn.shopify.com',
      'images.pexels.com',
      'images.unsplash.com'
    ]
  }
};

export default nextConfig;