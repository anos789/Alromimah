import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "mrium-mexc-trial",
  slug: "mrium-mexc-trial",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.alromimah.mriummexctrial"
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router"
  ],
  experiments: {
    typedRoutes: true
  },
  owner: "alromimah",
  
  // 🚀 أضف هذا الجزء هنا بالرقم الذي استخرجناه من الـ Terminal
  extra: {
    eas: {
    let projectId;
if (process.env.APP === 'app1') {
  projectId = '23847707-bf15-424c-b1dc-7a57fc34a23d';
} else if (process.env.APP === 'app2') {
  projectId = 'db096609-2c67-431d-b83d-88cabf8511b1';
}
export default {
  name: 'testapp',
  slug: process.env.APP,
  extra: {
    eas:  {
      projectId
    }
  }
}
