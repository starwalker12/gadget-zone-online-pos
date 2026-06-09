export const COLOR_THEME_STORAGE_KEY = "saledock-color-theme-v1";

export const COLOR_THEME_VALUES = ["ocean", "slate", "forest"] as const;

export type ColorTheme = (typeof COLOR_THEME_VALUES)[number];

export const DEFAULT_COLOR_THEME: ColorTheme = "ocean";

export type ColorThemeOption = {
  value: ColorTheme;
  labelKey: string;
  sidebarBg: string;
  activeBg: string;
  accent: string;
  primaryBg: string;
};

export const COLOR_THEME_OPTIONS: ColorThemeOption[] = [
  {
    value: "ocean",
    labelKey: "ocean",
    sidebarBg: "#0F2A43",
    activeBg: "#1E4A6B",
    accent: "#38BDF8",
    primaryBg: "#2563EB",
  },
  {
    value: "slate",
    labelKey: "slateAmber",
    sidebarBg: "#1E293B",
    activeBg: "#334155",
    accent: "#FBBF24",
    primaryBg: "#B45309",
  },
  {
    value: "forest",
    labelKey: "forest",
    sidebarBg: "#14532D",
    activeBg: "#166534",
    accent: "#4ADE80",
    primaryBg: "#15803D",
  },
];

export function isColorTheme(value: string | null | undefined): value is ColorTheme {
  return COLOR_THEME_VALUES.includes(value as ColorTheme);
}
