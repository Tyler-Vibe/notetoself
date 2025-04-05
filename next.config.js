/** @type {import('next').NextConfig} */
const nextConfig = {
  // Valid Next.js configuration options
  reactStrictMode: true,
  
  // Move packages from experimental to serverExternalPackages
  serverExternalPackages: [
    'sharp', 
    'prisma', 
    '@prisma/client'
  ],
  
  // Configure images
  images: {
    domains: ['localhost'],
  },
  
  // Configure file size limits for API routes
  experimental: {
    serverActions: {
      bodySizeLimit: '1gb',
    },
  },
}

module.exports = nextConfig 