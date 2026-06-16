import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD ? 'standalone' : undefined,
  devIndicators: false,
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
