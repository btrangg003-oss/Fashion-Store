/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['images.unsplash.com', 'ui-avatars.com'],
  },
  experimental: {
    forceSwcTransforms: true,
  },
}

module.exports = nextConfig
