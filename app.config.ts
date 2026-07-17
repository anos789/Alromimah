import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "mrium-mexc-trial",
  slug: "alromimah", // 🎯 تم التعديل هنا ليطابق قاعدة البيانات السحابية
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
    package: "com.alromimah.mriummexctrial",
    permissions: [
      "INTERNET",
      "SYSTEM_ALERT_WINDOW"
    ]
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
    [
      "expo-build-properties",
      {
        "android": {
          "enableProguardInReleaseBuilds": true,
          "enableShrinkResourcesInReleaseBuilds": true
        }
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  owner: "alromimah",
  extra: {
    eas: {
      projectId: "843ed5f1-e136-48a1-b5e2-c61e26022cf3"
    }
  }
});
