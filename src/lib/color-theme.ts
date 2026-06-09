export const COLOR_THEME_STORAGE_KEY = "saledock-color-theme-v1";
export const CUSTOM_THEME_STORAGE_KEY = "saledock-custom-theme-v1";

export const COLOR_THEME_VALUES = ["ocean", "slate", "forest", "custom"] as const;

export type ColorTheme = (typeof COLOR_THEME_VALUES)[number];

export const DEFAULT_COLOR_THEME: ColorTheme = "ocean";

export const CUSTOM_THEME_FIELDS = [
  {
    key: "sidebarBg",
    labelKey: "sidebarBg",
    cssVariable: "--sidebar-bg",
    defaultValue: "#0F2A43",
  },
  {
    key: "sidebarInactive",
    labelKey: "sidebarInactive",
    cssVariable: "--sidebar-inactive",
    defaultValue: "#CBD5E1",
  },
  {
    key: "sidebarActiveBg",
    labelKey: "sidebarActiveBg",
    cssVariable: "--sidebar-active-bg",
    defaultValue: "#1E4A6B",
  },
  {
    key: "sidebarActiveText",
    labelKey: "sidebarActiveText",
    cssVariable: "--sidebar-active-text",
    defaultValue: "#FFFFFF",
  },
  {
    key: "sidebarActiveAccent",
    labelKey: "sidebarActiveAccent",
    cssVariable: "--sidebar-active-accent",
    defaultValue: "#38BDF8",
  },
  {
    key: "primaryAccentBg",
    labelKey: "primaryAccentBg",
    cssVariable: "--primary-accent-bg",
    defaultValue: "#2563EB",
  },
  {
    key: "primaryAccentText",
    labelKey: "primaryAccentText",
    cssVariable: "--primary-accent-text",
    defaultValue: "#FFFFFF",
  },
] as const;

export type CustomThemeFieldKey = (typeof CUSTOM_THEME_FIELDS)[number]["key"];
export type CustomThemeColors = Record<CustomThemeFieldKey, string>;

export const DEFAULT_CUSTOM_THEME_COLORS = CUSTOM_THEME_FIELDS.reduce(
  (colors, field) => {
    colors[field.key] = field.defaultValue;
    return colors;
  },
  {} as CustomThemeColors,
);

export const CUSTOM_THEME_BASE_CSS_VARIABLES = CUSTOM_THEME_FIELDS.map(
  (field) => field.cssVariable,
);

export const CUSTOM_THEME_DERIVED_CSS_VARIABLES = [
  "--sidebar-popover-bg",
  "--sidebar-count-bg",
  "--sidebar-confirm-text",
  "--primary-accent-hover",
  "--primary-accent-soft",
] as const;

export const CUSTOM_THEME_CSS_VARIABLES = [
  ...CUSTOM_THEME_BASE_CSS_VARIABLES,
  ...CUSTOM_THEME_DERIVED_CSS_VARIABLES,
] as const;

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
  {
    value: "custom",
    labelKey: "custom",
    sidebarBg: DEFAULT_CUSTOM_THEME_COLORS.sidebarBg,
    activeBg: DEFAULT_CUSTOM_THEME_COLORS.sidebarActiveBg,
    accent: DEFAULT_CUSTOM_THEME_COLORS.sidebarActiveAccent,
    primaryBg: DEFAULT_CUSTOM_THEME_COLORS.primaryAccentBg,
  },
];

export function isColorTheme(value: string | null | undefined): value is ColorTheme {
  return COLOR_THEME_VALUES.includes(value as ColorTheme);
}

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value);
}

export function normalizeCustomThemeColors(value: unknown): CustomThemeColors | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const source = value as Partial<Record<CustomThemeFieldKey, unknown>>;
  const colors = { ...DEFAULT_CUSTOM_THEME_COLORS };

  for (const field of CUSTOM_THEME_FIELDS) {
    const color = source[field.key];
    if (!isHexColor(color)) return null;
    colors[field.key] = color.toUpperCase();
  }

  return colors;
}

export function mergeCustomThemeColors(value: unknown): CustomThemeColors {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...DEFAULT_CUSTOM_THEME_COLORS };
  }

  const source = value as Partial<Record<CustomThemeFieldKey, unknown>>;
  const colors = { ...DEFAULT_CUSTOM_THEME_COLORS };

  for (const field of CUSTOM_THEME_FIELDS) {
    const color = source[field.key];
    if (isHexColor(color)) colors[field.key] = color.toUpperCase();
  }

  return colors;
}
