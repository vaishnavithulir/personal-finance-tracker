import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  experimental: {
    // @ts-ignore
    toolbar: false,
    // @ts-ignore
    nextScriptWorkers: true,
  },
  // Ensure no dev logs or indicators are injected
  productionBrowserSourceMaps: false,
};

export default nextConfig;
