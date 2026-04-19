import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
