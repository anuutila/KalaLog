import bundleAnalyzer from '@next/bundle-analyzer';
import path from 'node:path';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer({
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  // sassOptions: {
  //   implementation: 'sass-embedded',
  //   additionalData: `@use "${path.join(process.cwd(), '_mantine')}" as mantine;`,
  // },
});
