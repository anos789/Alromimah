// eslint-disable-next-line @typescript-eslint/no-require-imports
const themeConfig = require("../../theme.config");
const themeTokens: Record<string, { light: string; dark: string }> =
  themeConfig.themeColors;

export type ColorScheme = "light" | "dark";

export type ThemeColors = Record<string, { light: string; dark: string }>;

export type ThemeColorPalette = Record<string, string>;

export type SchemeColors = Record<string, string>;

/**
 * Build color palette for a given scheme from theme tokens.
 */
export function buildColorPalette(scheme: ColorScheme): ThemeColorPalette {
  const palette: ThemeColorPalette = {};
  for (const [name, swatch] of Object.entries(themeTokens)) {
    const s = swatch as { light: string; dark: string };
    palette[name] = scheme === "dark" ? s.dark : s.light;
  }
  return palette;
}

/**
 * Build CSS variable map for a given scheme.
 */
export function buildThemeCSSVariables(
  scheme: ColorScheme,
): Record<string, string> {
  const vars: Record<string, string> = {};
  const palette = buildColorPalette(scheme);
  for (const [name, value] of Object.entries(palette)) {
    vars[`--color-${name}`] = value;
  }
  return vars;
}

/**
 * Pre-built scheme colors for light and dark.
 */
export const Colors: Record<ColorScheme, ThemeColorPalette> = {
  light: buildColorPalette("light"),
  dark: buildColorPalette("dark"),
};

export const SchemeColors: Record<ColorScheme, ThemeColorPalette> = Colors;

// Fonts placeholder
export const Fonts = {
  regular: "System",
  medium: "System",
  bold: "System",
};
