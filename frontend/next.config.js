/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/zzz_optimizer' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/zzz_optimizer' : '',
}

module.exports = nextConfig
