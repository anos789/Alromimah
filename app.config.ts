import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "MY-Alromimah",
  slug: "mrium-mexc-trial",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png", // تأكد من وجود المسار أو قم بتعديله
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash-icon.png", // تأكد من المسار
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png", // تأكد من المسار
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
  }
});
