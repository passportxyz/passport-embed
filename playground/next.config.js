const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  webpack: (config) => {
    // Use local source for both dev and production
    config.resolve.alias['@human.tech/passport-embed'] = path.resolve(__dirname, '../src');

    // Mock the Human ID SDK to avoid dependency conflicts in playground
    config.resolve.alias['@holonym-foundation/human-id-sdk'] = path.resolve(__dirname, 'src/mocks/humanIdSdkMock.ts');

    // Resolve modules from both playground and root node_modules
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../node_modules'),
      'node_modules',
    ];

    return config;
  },
};

module.exports = nextConfig;
