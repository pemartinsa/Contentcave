/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
}
module.exports = nextConfig
