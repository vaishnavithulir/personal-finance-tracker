import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    // Standard property supported by Next.js
    buildActivityPosition: "bottom-right",
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
