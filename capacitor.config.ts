import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hicvenditur.app',
  appName: 'Hic Venditur',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
