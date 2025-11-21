/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Cloudflare Pages最適化
  trailingSlash: true,
  // 開発時は出力を無効化
  ...(process.env.NODE_ENV === 'development' && {
    output: undefined,
  }),
}

module.exports = nextConfig
