/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  webpack: (config) => {
    // Use local source for both dev and production
    config.resolve.alias['@human.tech/passport-embed'] = require('path').resolve(__dirname, '../src');
    return config;
  },
};

module.exports = nextConfig;
