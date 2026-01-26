/**
 * Accessibility Theme Engine
 *
 * Core runtime logic for:
 * - Merging dimensions from multiple sources (preset, user overrides, temporary overrides)
 * - Resolving conflicts deterministically
 * - Generating CSS tokens, behavioral flags, and component props
 * - Validating dimension values
 */

import type {
  AccessibilityDimensions,
  AccessibilityUserSettings,
  ThemeTokens,
  CSSTokens,
  BehavioralFlags,
  ComponentProps,
  ValidationResult,
  ColorScheme,
  ContrastLevel,
  FontScale,
  LineHeight,
  FocusIndicatorSize,
  TouchTargetSize,
  MotionPreference,
} from "../types/accessibility-theme";

import {
  getSystemAwareDefaults,
  detectSystemDefaults,
  dimensionConstraints,
} from "../config/accessibility-dimensions";

import { getPreset } from "../config/accessibility-presets";

// ============================================================================
// DIMENSION MERGING AND PRIORITY
// ============================================================================

/**
 * Deep merge helper that preserves nested structure
 */
function deepMerge<T>(target: T, ...sources: Partial<T>[]): T {
  const result = { ...target };

  for (const source of sources) {
    for (const key in source) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (sourceValue === undefined) continue;

      if (
        sourceValue &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === "object"
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result[key] = deepMerge(targetValue, sourceValue as any) as any;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result[key] = sourceValue as any;
      }
    }
  }

  return result;
}

/**
 * Merge dimensions from all sources according to priority
 */
export function mergeDimensions(
  userSettings: AccessibilityUserSettings,
  workspaceId?: string
): AccessibilityDimensions {
  // Start with system-aware defaults
  let merged = getSystemAwareDefaults();

  // Apply preset if specified
  if (userSettings.activePreset) {
    const preset = getPreset(userSettings.activePreset);
    if (preset?.dimensions) {
      merged = deepMerge(merged, preset.dimensions);
    }
  }

  // Apply workspace-specific settings
  if (workspaceId && userSettings.workspaceSettings?.[workspaceId]) {
    merged = deepMerge(merged, userSettings.workspaceSettings[workspaceId]);
  }

  // Apply user overrides
  if (userSettings.dimensionOverrides) {
    merged = deepMerge(merged, userSettings.dimensionOverrides);
  }

  // Apply temporary overrides (highest priority)
  if (userSettings.temporaryOverrides) {
    merged = deepMerge(merged, userSettings.temporaryOverrides);
  }

  return merged;
}

// ============================================================================
// CSS TOKEN GENERATION
// ============================================================================

/**
 * Color palette definitions for each scheme and contrast level
 */
function getColorTokens(
  scheme: ColorScheme,
  contrastLevel: ContrastLevel,
  forceBorders: boolean
): Partial<CSSTokens> {
  // Base color values (these would be expanded in production)
  const palettes = {
    light: {
      standard: {
        "--a11y-bg-base": "hsl(0 0% 100%)",
        "--a11y-bg-elevated": "hsl(0 0% 98%)",
        "--a11y-bg-sunken": "hsl(0 0% 96%)",
        "--a11y-text-primary": "hsl(240 10% 3.9%)",
        "--a11y-text-secondary": "hsl(240 5% 26%)",
        "--a11y-text-tertiary": "hsl(240 4% 46%)",
        "--a11y-border-default": "hsl(240 6% 90%)",
        "--a11y-interactive-primary": "hsl(240 6% 10%)",
        "--a11y-interactive-hover": "hsl(240 6% 20%)",
        "--a11y-interactive-active": "hsl(240 6% 30%)",
      },
      high: {
        "--a11y-bg-base": "hsl(0 0% 100%)",
        "--a11y-bg-elevated": "hsl(0 0% 100%)",
        "--a11y-bg-sunken": "hsl(0 0% 98%)",
        "--a11y-text-primary": "hsl(0 0% 0%)",
        "--a11y-text-secondary": "hsl(0 0% 15%)",
        "--a11y-text-tertiary": "hsl(0 0% 30%)",
        "--a11y-border-default": "hsl(0 0% 60%)",
        "--a11y-interactive-primary": "hsl(0 0% 0%)",
        "--a11y-interactive-hover": "hsl(0 0% 15%)",
        "--a11y-interactive-active": "hsl(0 0% 30%)",
      },
      "ultra-high": {
        "--a11y-bg-base": "hsl(0 0% 100%)",
        "--a11y-bg-elevated": "hsl(0 0% 100%)",
        "--a11y-bg-sunken": "hsl(0 0% 100%)",
        "--a11y-text-primary": "hsl(0 0% 0%)",
        "--a11y-text-secondary": "hsl(0 0% 0%)",
        "--a11y-text-tertiary": "hsl(0 0% 20%)",
        "--a11y-border-default": "hsl(0 0% 0%)",
        "--a11y-interactive-primary": "hsl(0 0% 0%)",
        "--a11y-interactive-hover": "hsl(0 0% 10%)",
        "--a11y-interactive-active": "hsl(0 0% 20%)",
      },
      low: {
        "--a11y-bg-base": "hsl(30 20% 97%)",
        "--a11y-bg-elevated": "hsl(30 20% 98%)",
        "--a11y-bg-sunken": "hsl(30 20% 95%)",
        "--a11y-text-primary": "hsl(30 10% 30%)",
        "--a11y-text-secondary": "hsl(30 10% 45%)",
        "--a11y-text-tertiary": "hsl(30 10% 55%)",
        "--a11y-border-default": "hsl(30 10% 85%)",
        "--a11y-interactive-primary": "hsl(30 10% 35%)",
        "--a11y-interactive-hover": "hsl(30 10% 40%)",
        "--a11y-interactive-active": "hsl(30 10% 45%)",
      },
    },
    dark: {
      standard: {
        "--a11y-bg-base": "hsl(240 10% 3.9%)",
        "--a11y-bg-elevated": "hsl(240 10% 6%)",
        "--a11y-bg-sunken": "hsl(240 10% 1%)",
        "--a11y-text-primary": "hsl(0 0% 98%)",
        "--a11y-text-secondary": "hsl(0 0% 80%)",
        "--a11y-text-tertiary": "hsl(0 0% 65%)",
        "--a11y-border-default": "hsl(240 4% 16%)",
        "--a11y-interactive-primary": "hsl(0 0% 98%)",
        "--a11y-interactive-hover": "hsl(0 0% 90%)",
        "--a11y-interactive-active": "hsl(0 0% 80%)",
      },
      high: {
        "--a11y-bg-base": "hsl(0 0% 0%)",
        "--a11y-bg-elevated": "hsl(0 0% 5%)",
        "--a11y-bg-sunken": "hsl(0 0% 0%)",
        "--a11y-text-primary": "hsl(0 0% 100%)",
        "--a11y-text-secondary": "hsl(0 0% 90%)",
        "--a11y-text-tertiary": "hsl(0 0% 75%)",
        "--a11y-border-default": "hsl(0 0% 50%)",
        "--a11y-interactive-primary": "hsl(0 0% 100%)",
        "--a11y-interactive-hover": "hsl(0 0% 95%)",
        "--a11y-interactive-active": "hsl(0 0% 85%)",
      },
      "ultra-high": {
        "--a11y-bg-base": "hsl(0 0% 0%)",
        "--a11y-bg-elevated": "hsl(0 0% 0%)",
        "--a11y-bg-sunken": "hsl(0 0% 0%)",
        "--a11y-text-primary": "hsl(0 0% 100%)",
        "--a11y-text-secondary": "hsl(0 0% 100%)",
        "--a11y-text-tertiary": "hsl(0 0% 90%)",
        "--a11y-border-default": "hsl(0 0% 100%)",
        "--a11y-interactive-primary": "hsl(0 0% 100%)",
        "--a11y-interactive-hover": "hsl(0 0% 95%)",
        "--a11y-interactive-active": "hsl(0 0% 90%)",
      },
    },
    monochrome: {
      standard: {
        "--a11y-bg-base": "hsl(0 0% 100%)",
        "--a11y-bg-elevated": "hsl(0 0% 95%)",
        "--a11y-bg-sunken": "hsl(0 0% 90%)",
        "--a11y-text-primary": "hsl(0 0% 0%)",
        "--a11y-text-secondary": "hsl(0 0% 25%)",
        "--a11y-text-tertiary": "hsl(0 0% 50%)",
        "--a11y-border-default": "hsl(0 0% 70%)",
        "--a11y-interactive-primary": "hsl(0 0% 0%)",
        "--a11y-interactive-hover": "hsl(0 0% 15%)",
        "--a11y-interactive-active": "hsl(0 0% 30%)",
      },
    },
  };

  // Map scheme to palette (simplified - in production would handle all schemes)
  let schemeKey: "light" | "dark" | "monochrome" = "light";
  if (scheme === "dark" || scheme === "dim-dark") {
    schemeKey = "dark";
  } else if (scheme === "monochrome") {
    schemeKey = "monochrome";
  }

  // Get palette with fallback to standard light
  const schemePalette = palettes[schemeKey];
  const palette =
    (schemeKey === "monochrome"
      ? schemePalette.standard
      : (schemePalette as typeof palettes.light)[contrastLevel] ||
        schemePalette.standard) || palettes.light.standard;

  return {
    ...palette,
    "--a11y-border-focus": palette["--a11y-interactive-primary"],
    "--a11y-interactive-disabled": "hsl(0 0% 70%)",
    "--a11y-success":
      contrastLevel === "ultra-high" ? "hsl(0 0% 0%)" : "hsl(142 76% 36%)",
    "--a11y-warning":
      contrastLevel === "ultra-high" ? "hsl(0 0% 0%)" : "hsl(38 92% 50%)",
    "--a11y-error":
      contrastLevel === "ultra-high" ? "hsl(0 0% 0%)" : "hsl(0 84% 60%)",
    "--a11y-info":
      contrastLevel === "ultra-high" ? "hsl(0 0% 0%)" : "hsl(221 83% 53%)",
    "--a11y-border-width": forceBorders ? "2px" : "1px",
  };
}

/**
 * Get font size multiplier for scale
 */
function getFontScaleMultiplier(scale: FontScale): number {
  const multipliers: Record<FontScale, number> = {
    normal: 1.0,
    large: 1.25,
    "extra-large": 1.5,
    maximum: 2.0,
  };
  return multipliers[scale];
}

/**
 * Get line height value
 */
function getLineHeightValue(lineHeight: LineHeight): number {
  const values: Record<LineHeight, number> = {
    normal: 1.5,
    relaxed: 1.75,
    loose: 2.0,
  };
  return values[lineHeight];
}

/**
 * Get focus indicator width
 */
function getFocusIndicatorWidth(size: FocusIndicatorSize): number {
  const widths: Record<FocusIndicatorSize, number> = {
    standard: 2,
    enhanced: 3,
    "extra-large": 5,
  };
  return widths[size];
}

/**
 * Get touch target minimum size
 */
function getTouchTargetSize(size: TouchTargetSize): number {
  const sizes: Record<TouchTargetSize, number> = {
    standard: 44,
    enlarged: 56,
    maximum: 72,
  };
  return sizes[size];
}

/**
 * Get animation duration based on motion preference
 */
function getAnimationDuration(
  motionPreference: MotionPreference,
  maxDuration: number
): number {
  if (motionPreference === "none") return 0;
  if (motionPreference === "reduced") return Math.min(maxDuration, 200);
  return maxDuration;
}

/**
 * Generate complete CSS tokens from dimensions
 */
export function generateCSSTokens(
  dimensions: AccessibilityDimensions
): CSSTokens {
  const {
    colorContrast,
    typographyReading,
    focusNavigationInput,
    situationalEnvironmental,
  } = dimensions;

  const colorTokens = getColorTokens(
    colorContrast.colorScheme,
    colorContrast.contrastLevel,
    colorContrast.forceBorders
  );

  const fontScaleMultiplier = getFontScaleMultiplier(
    typographyReading.fontScale
  );
  const lineHeight = getLineHeightValue(typographyReading.lineHeight);
  const focusWidth = getFocusIndicatorWidth(
    focusNavigationInput.focusIndicatorSize
  );
  const touchTargetMin = getTouchTargetSize(
    focusNavigationInput.touchTargetSize
  );

  // Visual density multiplier
  const densityMultiplier =
    dimensions.sensorySensitivity.visualDensity === "minimal"
      ? 1.5
      : dimensions.sensorySensitivity.visualDensity === "reduced"
        ? 1.25
        : 1.0;

  // Max line length
  let maxLineLength = "none";
  if (typographyReading.maxLineLength === "standard") maxLineLength = "80ch";
  else if (typographyReading.maxLineLength === "reduced")
    maxLineLength = "60ch";
  else if (typographyReading.maxLineLength === "narrow") maxLineLength = "45ch";

  // Paragraph spacing
  const paragraphSpacingMap = {
    normal: "1em",
    increased: "1.5em",
    double: "2em",
  };

  const transitionDuration = getAnimationDuration(
    dimensions.motionAnimation.motionPreference,
    150
  );
  const animationDuration = getAnimationDuration(
    dimensions.motionAnimation.motionPreference,
    dimensions.motionAnimation.maxAnimationDuration
  );

  return {
    ...colorTokens,

    // Spacing
    "--a11y-spacing-xs": `${0.25 * densityMultiplier}rem`,
    "--a11y-spacing-sm": `${0.5 * densityMultiplier}rem`,
    "--a11y-spacing-md": `${1 * densityMultiplier}rem`,
    "--a11y-spacing-lg": `${1.5 * densityMultiplier}rem`,
    "--a11y-spacing-xl": `${2 * densityMultiplier}rem`,
    "--a11y-touch-target-min": `${touchTargetMin}px`,
    "--a11y-interactive-spacing":
      focusNavigationInput.increaseInteractiveSpacing
        ? `${1 * densityMultiplier}rem`
        : `${0.5 * densityMultiplier}rem`,

    // Typography
    "--a11y-font-family-base": typographyReading.dyslexiaFont
      ? 'OpenDyslexic, "Comic Sans MS", sans-serif'
      : typographyReading.monospaceReading
        ? "ui-monospace, monospace"
        : "system-ui, sans-serif",
    "--a11y-font-family-mono": "ui-monospace, monospace",
    "--a11y-font-size-base": "1rem",
    "--a11y-font-size-scale": fontScaleMultiplier.toString(),
    "--a11y-line-height": lineHeight.toString(),
    "--a11y-letter-spacing": `${typographyReading.letterSpacing}em`,
    "--a11y-word-spacing": `${typographyReading.wordSpacing}em`,
    "--a11y-paragraph-spacing":
      paragraphSpacingMap[typographyReading.paragraphSpacing],
    "--a11y-max-line-length": maxLineLength,

    // Borders
    "--a11y-border-radius": situationalEnvironmental.emergencyMode
      ? "0px"
      : "0.375rem",
    "--a11y-focus-ring-width": `${focusWidth}px`,
    "--a11y-focus-ring-offset": "2px",

    // Timing
    "--a11y-transition-duration": `${transitionDuration}ms`,
    "--a11y-animation-duration": `${animationDuration}ms`,

    // Shadows (remove in emergency or high contrast)
    "--a11y-shadow-sm":
      situationalEnvironmental.emergencyMode ||
      colorContrast.contrastLevel === "ultra-high"
        ? "none"
        : "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "--a11y-shadow-md":
      situationalEnvironmental.emergencyMode ||
      colorContrast.contrastLevel === "ultra-high"
        ? "none"
        : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    "--a11y-shadow-lg":
      situationalEnvironmental.emergencyMode ||
      colorContrast.contrastLevel === "ultra-high"
        ? "none"
        : "0 10px 15px -3px rgb(0 0 0 / 0.1)",

    // Density
    "--a11y-density-multiplier": densityMultiplier.toString(),
  } as CSSTokens;
}

// ============================================================================
// BEHAVIORAL FLAGS GENERATION
// ============================================================================

/**
 * Generate behavioral flags from dimensions
 */
export function generateBehavioralFlags(
  dimensions: AccessibilityDimensions
): BehavioralFlags {
  const {
    motionAnimation,
    focusNavigationInput,
    cognitive,
    sensorySensitivity,
    situationalEnvironmental,
  } = dimensions;

  return {
    // Motion
    disableAnimations: motionAnimation.motionPreference === "none",
    disableTransitions: motionAnimation.instantTransitions,
    disableParallax: motionAnimation.disableParallax,
    disableAutoPlay: motionAnimation.disableAutoPlay,

    // Navigation
    keyboardFirstMode: focusNavigationInput.keyboardFirstNavigation,
    screenReaderMode: focusNavigationInput.screenReaderOptimized,
    switchNavigationMode: focusNavigationInput.switchNavigation,
    alwaysShowSkipLinks: focusNavigationInput.alwaysVisibleSkipLinks,

    // Cognitive
    simpleLanguage: cognitive.simpleLanguageMode,
    noJargon: cognitive.noJargonMode,
    explicitLabels: cognitive.explicitStateLabels,
    confirmDestructive: cognitive.confirmDestructiveActions,
    showProgress: cognitive.alwaysShowProgress,

    // Sensory
    disableFlashing: sensorySensitivity.disableFlashing,
    calmMode:
      sensorySensitivity.calmIdleStates ||
      sensorySensitivity.lowStimulationMode,
    oneAlertAtATime: sensorySensitivity.disableAlertStacking,
    quietMode: situationalEnvironmental.quietMode,

    // Situational
    emergencyMode: situationalEnvironmental.emergencyMode,
    privacyMode: situationalEnvironmental.publicSpacePrivacy,
    lowBandwidth: situationalEnvironmental.lowBandwidthMode,
    batterySaver: situationalEnvironmental.batterySaverMode,
  };
}

// ============================================================================
// COMPONENT PROPS GENERATION
// ============================================================================

/**
 * Generate component-level props from dimensions
 */
export function generateComponentProps(
  dimensions: AccessibilityDimensions
): ComponentProps {
  const {
    typographyReading,
    focusNavigationInput,
    motionAnimation,
    sensorySensitivity,
    cognitive,
  } = dimensions;

  const fontFamily = typographyReading.dyslexiaFont
    ? 'OpenDyslexic, "Comic Sans MS", sans-serif'
    : typographyReading.monospaceReading
      ? "ui-monospace, monospace"
      : "system-ui, sans-serif";

  const touchTargetMin = getTouchTargetSize(
    focusNavigationInput.touchTargetSize
  );
  const focusWidth = getFocusIndicatorWidth(
    focusNavigationInput.focusIndicatorSize
  );

  const densityMultiplier =
    sensorySensitivity.visualDensity === "minimal"
      ? 1.5
      : sensorySensitivity.visualDensity === "reduced"
        ? 1.25
        : 1.0;

  let maxLineLength: string | null = null;
  if (typographyReading.maxLineLength === "standard") maxLineLength = "80ch";
  else if (typographyReading.maxLineLength === "reduced")
    maxLineLength = "60ch";
  else if (typographyReading.maxLineLength === "narrow") maxLineLength = "45ch";

  const transitionDuration = getAnimationDuration(
    motionAnimation.motionPreference,
    150
  );

  const animationDuration = getAnimationDuration(
    motionAnimation.motionPreference,
    motionAnimation.maxAnimationDuration
  );

  const alertDelay =
    sensorySensitivity.alertTiming === "immediate"
      ? 0
      : sensorySensitivity.alertTiming === "debounced"
        ? 500
        : 3000; // rate-limited

  return {
    fontFamily,
    disableItalics: typographyReading.disableItalics,
    disableAllCaps: typographyReading.disableAllCaps,
    touchTargetMinSize: touchTargetMin,
    focusIndicatorWidth: focusWidth,
    interactiveSpacing: focusNavigationInput.increaseInteractiveSpacing
      ? densityMultiplier * 16
      : densityMultiplier * 8,
    maxLineLength,
    disclosureMode: cognitive.disclosureMode,
    transitionDuration,
    animationDuration,
    alertDelay,
  };
}

// ============================================================================
// COMPLETE THEME TOKEN GENERATION
// ============================================================================

/**
 * Generate complete theme tokens from user settings
 */
export function generateThemeTokens(
  userSettings: AccessibilityUserSettings,
  workspaceId?: string
): ThemeTokens {
  const dimensions = mergeDimensions(userSettings, workspaceId);

  return {
    cssTokens: generateCSSTokens(dimensions),
    behavioralFlags: generateBehavioralFlags(dimensions),
    componentProps: generateComponentProps(dimensions),
    activeDimensions: dimensions,
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate numeric dimension constraints
 */
export function validateDimensions(
  dimensions: Partial<AccessibilityDimensions>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate letter spacing
  if (dimensions.typographyReading?.letterSpacing !== undefined) {
    const { letterSpacing } = dimensions.typographyReading;
    const { min, max } = dimensionConstraints.letterSpacing;
    if (letterSpacing < min || letterSpacing > max) {
      errors.push(`Letter spacing must be between ${min} and ${max}`);
    }
  }

  // Validate word spacing
  if (dimensions.typographyReading?.wordSpacing !== undefined) {
    const { wordSpacing } = dimensions.typographyReading;
    const { min, max } = dimensionConstraints.wordSpacing;
    if (wordSpacing < min || wordSpacing > max) {
      errors.push(`Word spacing must be between ${min} and ${max}`);
    }
  }

  // Validate max animation duration
  if (dimensions.motionAnimation?.maxAnimationDuration !== undefined) {
    const { maxAnimationDuration } = dimensions.motionAnimation;
    const { min, max } = dimensionConstraints.maxAnimationDuration;
    if (maxAnimationDuration < min || maxAnimationDuration > max) {
      errors.push(
        `Max animation duration must be between ${min}ms and ${max}ms`
      );
    }
  }

  // Validate max alerts per minute
  if (dimensions.sensorySensitivity?.maxAlertsPerMinute !== undefined) {
    const { maxAlertsPerMinute } = dimensions.sensorySensitivity;
    const { min, max } = dimensionConstraints.maxAlertsPerMinute;
    if (maxAlertsPerMinute < min || maxAlertsPerMinute > max) {
      errors.push(`Max alerts per minute must be between ${min} and ${max}`);
    }
  }

  // Warning for potentially conflicting settings
  if (
    dimensions.motionAnimation?.motionPreference === "full" &&
    dimensions.motionAnimation?.instantTransitions
  ) {
    warnings.push("Full motion with instant transitions may be confusing");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export { deepMerge, detectSystemDefaults, getSystemAwareDefaults };
