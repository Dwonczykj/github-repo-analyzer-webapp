/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: ['./src/styles'],
    prependData: `@import "variables.scss"; @import "mixins.scss";`,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
