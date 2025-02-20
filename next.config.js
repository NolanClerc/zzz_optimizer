/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  sassOptions: {
    includePaths: ['./frontend/src'],
  },
}

module.exports = nextConfig
