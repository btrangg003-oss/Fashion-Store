/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['images.unsplash.com', 'ui-avatars.com', 'i.pravatar.cc', 'res.cloudinary.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Use pages from root instead of src/pages to avoid Windows EISDIR bug
  experimental: {
    externalDir: true,
  },
}

module.exports = nextConfig
