import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    // wagmi v3 tempo connectors do `import('accounts').catch(...)` — webpack can't
    // resolve it at build time. Stub it out so the catch branch runs as intended.
    config.resolve.alias = {
      ...config.resolve.alias,
      accounts: false,
    };
    return config;
  },
};

export default nextConfig;
