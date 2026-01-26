// Re-export UI components from the library
export * from "./components/ui/index";
export { cn } from "./lib/utils";

// Re-export reusable components
export { default as ThemeToggle } from "./components/ThemeToggle";
export { AccessibilitySettingsSheet } from "./components/AccessibilitySettingsSheet";

// Re-export providers
export { ThemeProvider } from "./providers/ThemeProvider";
export {
  AccessibilityThemeProvider,
  useAccessibilityTheme,
  useActiveDimensions,
} from "./providers/AccessibilityThemeProvider";

// Re-export types
export type * from "./types/accessibility-theme";
