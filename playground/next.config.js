/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@human.tech/passport-embed'],
  webpack: (config) => {
    // Add alias for local passport-embed source
    config.resolve.alias['@human.tech/passport-embed'] = require('path').resolve(__dirname, '../src');
    return config;
  },
};

module.exports = nextConfig;
