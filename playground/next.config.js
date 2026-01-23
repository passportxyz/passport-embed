/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  transpilePackages: ['@human.tech/passport-embed'],
  webpack: (config) => {
    // In development, alias to local source for hot reload
    // In production, use the npm package
    if (process.env.NODE_ENV === 'development') {
      config.resolve.alias['@human.tech/passport-embed'] = require('path').resolve(__dirname, '../src');
    }
    return config;
  },
};

module.exports = nextConfig;
