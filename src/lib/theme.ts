import type { CSSProperties } from "react";

type ThemeSettings = {
  primaryColor?: string | null;
  accentColor?: string | null;
  backgroundColor?: string | null;
  buttonStyle?: string | null;
};

const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function normalizeHexColor(value: string | null | undefined, fallback: string) {
  return value && HEX_COLOR_PATTERN.test(value.trim()) ? value.trim() : fallback;
}

export function getButtonRadius(buttonStyle?: string | null) {
  switch (buttonStyle) {
    case "rounded":
      return "1rem";
    case "soft":
      return "1.5rem";
    case "pill":
    default:
      return "9999px";
  }
}

export function buildSiteThemeVariables(settings: ThemeSettings): CSSProperties {
  return {
    ["--primary-color" as string]: normalizeHexColor(settings.primaryColor, "#ff6a00"),
    ["--accent-color" as string]: normalizeHexColor(settings.accentColor, "#ff6a00"),
    ["--background-color" as string]: normalizeHexColor(settings.backgroundColor, "#ffffff"),
    ["--button-radius" as string]: getButtonRadius(settings.buttonStyle),
  };
}
