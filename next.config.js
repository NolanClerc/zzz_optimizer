/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Only add these if deploying to GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/zzz_optimizer' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/zzz_optimizer' : '',
}

module.exports = nextConfig
