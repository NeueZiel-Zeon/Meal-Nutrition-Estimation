/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    serverActions: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, "encoding"];
    }
    return config;
  },
  output: "standalone",
};

module.exports = nextConfig;
