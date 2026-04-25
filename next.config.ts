import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    // @wagmi/connectors lists several optional peer deps that aren't always installed.
    // Stub them out so webpack falls through to the catch() branch as intended.
    config.resolve.alias = {
      ...config.resolve.alias,
      accounts: false,
      porto: false,
      'porto/internal': false,
      '@coinbase/wallet-sdk': false,
      '@base-org/account': false,
      '@safe-global/safe-apps-provider': false,
      '@safe-global/safe-apps-sdk': false,
    };
    return config;
  },
};

export default nextConfig;
