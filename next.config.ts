import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    // In Next.js 15+, this property is renamed to 'position'
    position: "bottom-right",
  },
  experimental: {},
  // nextScriptWorkers: true,
  // Ensure no dev logs or indicators are injected
  productionBrowserSourceMaps: false,
};

export default nextConfig;
