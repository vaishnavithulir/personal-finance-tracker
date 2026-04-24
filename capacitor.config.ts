import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dumbofinance.app', // Aligned with mobile project
  appName: 'Wealth Central',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#000000",
      showSpinner: true,
      spinnerColor: "#ffffff"
    }
  }
};

export default config;
