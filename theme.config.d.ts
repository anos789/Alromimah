export {};

declare global {
  namespace NativeWind {
    interface ThemeColors {
      primary: string;
      background: string;
      surface: string;
      'surface-secondary': string;
      foreground: string;
      muted: string;
      border: string;
      success: string;
      warning: string;
      error: string;
      'accent-blue': string;
      'card-bg': string;
    }
  }
}
