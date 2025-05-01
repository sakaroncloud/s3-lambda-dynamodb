/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['sakararyals3bucket.s3.ap-southeast-1.amazonaws.com'],
  },
 output:"standalone"
}

module.exports = nextConfig
