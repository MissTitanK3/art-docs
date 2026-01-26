/**
 * Accessibility Dimension Default Values
 *
 * Provides system defaults for all accessibility dimensions.
 * These are the baseline values before any presets or user overrides.
 */

import type {
  AccessibilityDimensions,
  ColorContrastDimensions,
  TypographyReadingDimensions,
  MotionAnimationDimensions,
  FocusNavigationInputDimensions,
  CognitiveDimensions,
  SensorySensitivityDimensions,
  SituationalEnvironmentalDimensions,
  SystemDefaults,
} from "@repo/ui";

// ============================================================================
// SYSTEM DETECTION
// ============================================================================

/**
 * Detect system-level accessibility preferences
 */
export function detectSystemDefaults(): SystemDefaults {
  if (typeof window === "undefined") {
    return {
      prefersDarkMode: false,
      prefersReducedMotion: false,
      prefersHighContrast: false,
      prefersReducedTransparency: false,
      systemFontSize: 16,
    };
  }

  return {
    prefersDarkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
    prefersHighContrast: window.matchMedia("(prefers-contrast: more)").matches,
    prefersReducedTransparency: window.matchMedia(
      "(prefers-reduced-transparency: reduce)"
    ).matches,
    systemFontSize:
      parseFloat(getComputedStyle(document.documentElement).fontSize) || 16,
  };
}

// ============================================================================
// DEFAULT DIMENSION VALUES
// ============================================================================

/**
 * Default values for color and contrast dimensions
 */
export const defaultColorContrastDimensions: ColorContrastDimensions = {
  colorScheme: "light",
  contrastLevel: "standard",
  colorBlindMode: "none",
  colorIndependentState: true, // Always true by default for safety
  forceBorders: false,
};

/**
 * Default values for typography and reading dimensions
 */
export const defaultTypographyReadingDimensions: TypographyReadingDimensions = {
  fontScale: "normal",
  dyslexiaFont: false,
  monospaceReading: false,
  lineHeight: "normal",
  paragraphSpacing: "normal",
  maxLineLength: "standard",
  highCharacterDistinction: false,
  disableItalics: false,
  disableAllCaps: false,
  letterSpacing: 0,
  wordSpacing: 0,
};

/**
 * Default values for motion and animation dimensions
 */
export const defaultMotionAnimationDimensions: MotionAnimationDimensions = {
  motionPreference: "full",
  disableParallax: false,
  disableAutoPlay: false,
  instantTransitions: false,
  staticLoadingIndicators: false,
  textOnlyFeedback: false,
  maxAnimationDuration: 500,
};

/**
 * Default values for focus, navigation, and input dimensions
 */
export const defaultFocusNavigationInputDimensions: FocusNavigationInputDimensions =
  {
    focusIndicatorSize: "standard",
    alwaysShowFocus: false,
    keyboardFirstNavigation: false,
    screenReaderOptimized: false,
    switchNavigation: false,
    touchTargetSize: "standard",
    handedness: "neutral",
    stickyPrimaryActions: false,
    sequentialNavigation: false,
    alwaysVisibleSkipLinks: false,
    increaseInteractiveSpacing: false,
  };

/**
 * Default values for cognitive dimensions
 */
export const defaultCognitiveDimensions: CognitiveDimensions = {
  simpleLanguageMode: false,
  noJargonMode: false,
  disclosureMode: "all-at-once",
  chunkedInformation: false,
  explicitStateLabels: false,
  confirmDestructiveActions: true, // Always true by default for safety
  noSurpriseChanges: true, // Always true by default for safety
  layoutConsistencyLock: false,
  decisionReductionMode: false,
  visualHierarchyBoost: false,
  alwaysShowProgress: false,
  universalUndo: false,
};

/**
 * Default values for sensory sensitivity dimensions
 */
export const defaultSensorySensitivityDimensions: SensorySensitivityDimensions =
  {
    lowStimulationMode: false,
    visualDensity: "normal",
    disableFlashing: true, // Always true by default for safety (WCAG 2.3.1)
    disableHighFrequencyPatterns: false,
    calmIdleStates: false,
    alertTiming: "immediate",
    disableAlertStacking: false,
    maxAlertsPerMinute: 60,
    disableAmbientSounds: false,
  };

/**
 * Default values for situational and environmental dimensions
 */
export const defaultSituationalEnvironmentalDimensions: SituationalEnvironmentalDimensions =
  {
    sunlightMode: false,
    nightMode: false,
    oneHandMode: false,
    glovesMode: false,
    offlineModeVisuals: false,
    lowBandwidthMode: false,
    batterySaverMode: false,
    emergencyMode: false,
    publicSpacePrivacy: false,
    quietMode: true, // Always true by default (never rely on sound)
  };

/**
 * Complete default dimension set
 */
export const defaultAccessibilityDimensions: AccessibilityDimensions = {
  colorContrast: defaultColorContrastDimensions,
  typographyReading: defaultTypographyReadingDimensions,
  motionAnimation: defaultMotionAnimationDimensions,
  focusNavigationInput: defaultFocusNavigationInputDimensions,
  cognitive: defaultCognitiveDimensions,
  sensorySensitivity: defaultSensorySensitivityDimensions,
  situationalEnvironmental: defaultSituationalEnvironmentalDimensions,
};

// ============================================================================
// SYSTEM-AWARE DEFAULTS
// ============================================================================

/**
 * Get default dimensions that respect system preferences
 */
export function getSystemAwareDefaults(): AccessibilityDimensions {
  const system = detectSystemDefaults();
  const defaults = { ...defaultAccessibilityDimensions };

  // Apply system preferences
  if (system.prefersDarkMode) {
    defaults.colorContrast = {
      ...defaults.colorContrast,
      colorScheme: "dark",
    };
  }

  if (system.prefersReducedMotion) {
    defaults.motionAnimation = {
      ...defaults.motionAnimation,
      motionPreference: "reduced",
      disableParallax: true,
      disableAutoPlay: true,
    };
  }

  if (system.prefersHighContrast) {
    defaults.colorContrast = {
      ...defaults.colorContrast,
      contrastLevel: "high",
      forceBorders: true,
    };
  }

  return defaults;
}

// ============================================================================
// DIMENSION CONSTRAINTS AND VALIDATION
// ============================================================================

/**
 * Valid ranges for numeric dimensions
 */
export const dimensionConstraints = {
  letterSpacing: { min: 0, max: 0.2, step: 0.01 },
  wordSpacing: { min: 0, max: 0.5, step: 0.01 },
  maxAnimationDuration: { min: 0, max: 5000, step: 50 },
  maxAlertsPerMinute: { min: 1, max: 60, step: 1 },
} as const;

/**
 * Dependencies between dimensions (for conflict detection)
 */
export const dimensionDependencies = {
  // If emergency mode is on, certain other dimensions should be forced
  emergencyMode: [
    "fontScale", // Should be at least 'large'
    "touchTargetSize", // Should be at least 'enlarged'
    "visualDensity", // Should be 'minimal'
    "disclosureMode", // Should be 'all-at-once'
  ],

  // If screen reader optimized, certain dimensions should be set
  screenReaderOptimized: [
    "keyboardFirstNavigation", // Should be true
    "alwaysVisibleSkipLinks", // Should be true
    "explicitStateLabels", // Should be true
  ],

  // If low stimulation mode is on, related dimensions should be adjusted
  lowStimulationMode: [
    "motionPreference", // Should be 'reduced' or 'none'
    "visualDensity", // Should be 'reduced' or 'minimal'
    "calmIdleStates", // Should be true
  ],
} as const;

/**
 * Incompatible dimension combinations (mutually exclusive)
 */
export const incompatibleDimensions = [
  // Can't have both monochrome and color-blind modes active
  [
    "colorContrast.colorScheme:monochrome",
    "colorContrast.colorBlindMode:deuteranopia",
  ],
  [
    "colorContrast.colorScheme:monochrome",
    "colorContrast.colorBlindMode:protanopia",
  ],
  [
    "colorContrast.colorScheme:monochrome",
    "colorContrast.colorBlindMode:tritanopia",
  ],

  // Can't have both full motion and instant transitions
  [
    "motionAnimation.motionPreference:full",
    "motionAnimation.instantTransitions:true",
  ],

  // Can't have both left and right handedness
  [
    "focusNavigationInput.handedness:left",
    "focusNavigationInput.handedness:right",
  ],
] as const;

/**
 * Safety-critical dimensions that should never be disabled without explicit user action
 */
export const safetyCriticalDimensions = [
  "colorContrast.colorIndependentState", // Never use color alone
  "sensorySensitivity.disableFlashing", // Never flash (photosensitivity)
  "cognitive.confirmDestructiveActions", // Always confirm destructive actions
  "cognitive.noSurpriseChanges", // Never surprise the user
  "situationalEnvironmental.quietMode", // Never rely on sound
] as const;

// ============================================================================
// DIMENSION METADATA
// ============================================================================

export interface DimensionMetadata {
  path: string;
  label: string;
  description: string;
  wcagCriteria: string[];
  impactAreas: ("visual" | "cognitive" | "motor" | "auditory" | "vestibular")[];
  safetyCritical: boolean;
}

/**
 * Metadata for all dimensions (for UI generation and documentation)
 */
export const dimensionMetadata: DimensionMetadata[] = [
  // Color and Contrast
  {
    path: "colorContrast.colorScheme",
    label: "Color Scheme",
    description: "Base color palette for the interface",
    wcagCriteria: ["1.4.3", "1.4.6"],
    impactAreas: ["visual"],
    safetyCritical: false,
  },
  {
    path: "colorContrast.contrastLevel",
    label: "Contrast Level",
    description: "Minimum contrast ratio for text and UI elements",
    wcagCriteria: ["1.4.3", "1.4.6", "1.4.11"],
    impactAreas: ["visual"],
    safetyCritical: false,
  },
  {
    path: "colorContrast.colorBlindMode",
    label: "Color Blindness Adaptation",
    description:
      "Optimize colors for specific types of color vision deficiency",
    wcagCriteria: ["1.4.1"],
    impactAreas: ["visual"],
    safetyCritical: false,
  },
  {
    path: "colorContrast.colorIndependentState",
    label: "Color-Independent State",
    description: "Never use color alone to convey information",
    wcagCriteria: ["1.4.1"],
    impactAreas: ["visual"],
    safetyCritical: true,
  },

  // Typography and Reading
  {
    path: "typographyReading.fontScale",
    label: "Font Size",
    description: "Base font size scaling",
    wcagCriteria: ["1.4.4", "1.4.8"],
    impactAreas: ["visual", "cognitive"],
    safetyCritical: false,
  },
  {
    path: "typographyReading.dyslexiaFont",
    label: "Dyslexia-Friendly Font",
    description: "Use fonts designed for dyslexic readers",
    wcagCriteria: ["1.4.8"],
    impactAreas: ["visual", "cognitive"],
    safetyCritical: false,
  },
  {
    path: "typographyReading.lineHeight",
    label: "Line Height",
    description: "Spacing between lines of text",
    wcagCriteria: ["1.4.8", "1.4.12"],
    impactAreas: ["visual", "cognitive"],
    safetyCritical: false,
  },

  // Motion and Animation
  {
    path: "motionAnimation.motionPreference",
    label: "Motion Preference",
    description: "Amount of motion and animation",
    wcagCriteria: ["2.2.2", "2.3.3"],
    impactAreas: ["visual", "vestibular", "cognitive"],
    safetyCritical: false,
  },
  {
    path: "sensorySensitivity.disableFlashing",
    label: "Disable Flashing",
    description: "Remove all flashing content",
    wcagCriteria: ["2.3.1", "2.3.2"],
    impactAreas: ["visual", "vestibular"],
    safetyCritical: true,
  },

  // Focus and Navigation
  {
    path: "focusNavigationInput.focusIndicatorSize",
    label: "Focus Indicator Size",
    description: "Thickness of focus outlines",
    wcagCriteria: ["2.4.7", "2.4.11"],
    impactAreas: ["visual", "motor"],
    safetyCritical: false,
  },
  {
    path: "focusNavigationInput.touchTargetSize",
    label: "Touch Target Size",
    description: "Minimum size for interactive elements",
    wcagCriteria: ["2.5.5", "2.5.8"],
    impactAreas: ["motor"],
    safetyCritical: false,
  },

  // Cognitive
  {
    path: "cognitive.simpleLanguageMode",
    label: "Simple Language",
    description: "Use plain, clear language",
    wcagCriteria: ["3.1.5"],
    impactAreas: ["cognitive"],
    safetyCritical: false,
  },
  {
    path: "cognitive.confirmDestructiveActions",
    label: "Confirm Destructive Actions",
    description: "Require confirmation before destructive operations",
    wcagCriteria: ["3.3.4", "3.3.6"],
    impactAreas: ["cognitive"],
    safetyCritical: true,
  },
];
