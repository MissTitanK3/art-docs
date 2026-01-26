/**
 * Accessibility Preset Definitions
 *
 * Presets are pre-configured combinations of dimension values optimized for
 * specific accessibility needs. Users can apply presets and then override
 * individual dimensions as needed.
 */

import type { AccessibilityPreset } from "@repo/ui";

// ============================================================================
// PRESET DEFINITIONS
// ============================================================================

/**
 * Low Vision Preset
 * Optimizes for users with reduced visual acuity or field of vision
 */
export const lowVisionPreset: AccessibilityPreset = {
  id: "low-vision",
  name: "Low Vision",
  description:
    "Large text, high contrast, clear borders, and enhanced focus indicators",
  wcagLevel: "AAA",
  allowOverrides: true,
  dimensions: {
    colorContrast: {
      colorScheme: "light",
      contrastLevel: "ultra-high",
      colorBlindMode: "none",
      colorIndependentState: true,
      forceBorders: true,
    },
    typographyReading: {
      fontScale: "extra-large",
      dyslexiaFont: false,
      monospaceReading: false,
      lineHeight: "relaxed",
      paragraphSpacing: "increased",
      maxLineLength: "reduced",
      highCharacterDistinction: true,
      disableItalics: true,
      disableAllCaps: true,
      letterSpacing: 0.05,
      wordSpacing: 0.16,
    },
    focusNavigationInput: {
      focusIndicatorSize: "extra-large",
      alwaysShowFocus: true,
      keyboardFirstNavigation: true,
      screenReaderOptimized: false,
      switchNavigation: false,
      touchTargetSize: "enlarged",
      handedness: "neutral",
      stickyPrimaryActions: true,
      sequentialNavigation: false,
      alwaysVisibleSkipLinks: true,
      increaseInteractiveSpacing: true,
    },
    cognitive: {
      simpleLanguageMode: false,
      noJargonMode: false,
      disclosureMode: "all-at-once",
      chunkedInformation: true,
      explicitStateLabels: true,
      confirmDestructiveActions: true,
      noSurpriseChanges: true,
      layoutConsistencyLock: true,
      decisionReductionMode: false,
      visualHierarchyBoost: true,
      alwaysShowProgress: true,
      universalUndo: true,
    },
  },
};

/**
 * Photosensitive Preset
 * Removes flashing, reduces motion, and provides calm visuals
 */
export const photosensitivePreset: AccessibilityPreset = {
  id: "photosensitive",
  name: "Photosensitive",
  description:
    "No flashing, reduced motion, calm animations, and low stimulation",
  wcagLevel: "AAA",
  allowOverrides: true,
  dimensions: {
    motionAnimation: {
      motionPreference: "none",
      disableParallax: true,
      disableAutoPlay: true,
      instantTransitions: true,
      staticLoadingIndicators: true,
      textOnlyFeedback: true,
      maxAnimationDuration: 0,
    },
    sensorySensitivity: {
      lowStimulationMode: true,
      visualDensity: "reduced",
      disableFlashing: true,
      disableHighFrequencyPatterns: true,
      calmIdleStates: true,
      alertTiming: "debounced",
      disableAlertStacking: true,
      maxAlertsPerMinute: 10,
      disableAmbientSounds: true,
    },
    colorContrast: {
      colorScheme: "light",
      contrastLevel: "standard",
      colorBlindMode: "none",
      colorIndependentState: true,
      forceBorders: false,
    },
  },
};

/**
 * Dyslexia Preset
 * Optimizes typography for dyslexic readers
 */
export const dyslexiaPreset: AccessibilityPreset = {
  id: "dyslexia",
  name: "Dyslexia",
  description:
    "Dyslexia-friendly font, increased spacing, shorter lines, clear hierarchy",
  wcagLevel: "AAA",
  allowOverrides: true,
  dimensions: {
    typographyReading: {
      fontScale: "large",
      dyslexiaFont: true,
      monospaceReading: false,
      lineHeight: "loose",
      paragraphSpacing: "double",
      maxLineLength: "narrow",
      highCharacterDistinction: true,
      disableItalics: true,
      disableAllCaps: true,
      letterSpacing: 0.12,
      wordSpacing: 0.16,
    },
    colorContrast: {
      colorScheme: "warm-bias",
      contrastLevel: "high",
      colorBlindMode: "none",
      colorIndependentState: true,
      forceBorders: false,
    },
    cognitive: {
      simpleLanguageMode: true,
      noJargonMode: true,
      disclosureMode: "progressive",
      chunkedInformation: true,
      explicitStateLabels: true,
      confirmDestructiveActions: true,
      noSurpriseChanges: true,
      layoutConsistencyLock: true,
      decisionReductionMode: false,
      visualHierarchyBoost: true,
      alwaysShowProgress: true,
      universalUndo: true,
    },
  },
};

/**
 * ADHD / Cognitive Load Preset
 * Reduces distractions and cognitive overhead
 */
export const adhdCognitiveLoadPreset: AccessibilityPreset = {
  id: "adhd-cognitive-load",
  name: "ADHD / Cognitive Load",
  description:
    "Reduced distractions, clear hierarchy, step-by-step guidance, minimal choices",
  wcagLevel: "AAA",
  allowOverrides: true,
  dimensions: {
    cognitive: {
      simpleLanguageMode: true,
      noJargonMode: true,
      disclosureMode: "step-by-step",
      chunkedInformation: true,
      explicitStateLabels: true,
      confirmDestructiveActions: true,
      noSurpriseChanges: true,
      layoutConsistencyLock: true,
      decisionReductionMode: true,
      visualHierarchyBoost: true,
      alwaysShowProgress: true,
      universalUndo: true,
    },
    sensorySensitivity: {
      lowStimulationMode: true,
      visualDensity: "minimal",
      disableFlashing: true,
      disableHighFrequencyPatterns: true,
      calmIdleStates: true,
      alertTiming: "rate-limited",
      disableAlertStacking: true,
      maxAlertsPerMinute: 5,
      disableAmbientSounds: true,
    },
    motionAnimation: {
      motionPreference: "reduced",
      disableParallax: true,
      disableAutoPlay: true,
      instantTransitions: false,
      staticLoadingIndicators: false,
      textOnlyFeedback: false,
      maxAnimationDuration: 200,
    },
    focusNavigationInput: {
      focusIndicatorSize: "enhanced",
      alwaysShowFocus: true,
      keyboardFirstNavigation: true,
      screenReaderOptimized: false,
      switchNavigation: false,
      touchTargetSize: "enlarged",
      handedness: "neutral",
      stickyPrimaryActions: true,
      sequentialNavigation: true,
      alwaysVisibleSkipLinks: true,
      increaseInteractiveSpacing: true,
    },
  },
};

/**
 * Screen Reader First Preset
 * Optimizes for screen reader users
 */
export const screenReaderFirstPreset: AccessibilityPreset = {
  id: "screen-reader-first",
  name: "Screen Reader First",
  description:
    "Optimized for screen reader navigation with keyboard-first controls",
  wcagLevel: "AAA",
  allowOverrides: true,
  dimensions: {
    focusNavigationInput: {
      focusIndicatorSize: "extra-large",
      alwaysShowFocus: true,
      keyboardFirstNavigation: true,
      screenReaderOptimized: true,
      switchNavigation: false,
      touchTargetSize: "standard",
      handedness: "neutral",
      stickyPrimaryActions: false,
      sequentialNavigation: true,
      alwaysVisibleSkipLinks: true,
      increaseInteractiveSpacing: false,
    },
    cognitive: {
      simpleLanguageMode: false,
      noJargonMode: false,
      disclosureMode: "all-at-once",
      chunkedInformation: false,
      explicitStateLabels: true,
      confirmDestructiveActions: true,
      noSurpriseChanges: true,
      layoutConsistencyLock: true,
      decisionReductionMode: false,
      visualHierarchyBoost: false,
      alwaysShowProgress: true,
      universalUndo: true,
    },
    motionAnimation: {
      motionPreference: "none",
      disableParallax: true,
      disableAutoPlay: true,
      instantTransitions: true,
      staticLoadingIndicators: true,
      textOnlyFeedback: true,
      maxAnimationDuration: 0,
    },
  },
};

/**
 * Elder Friendly Preset
 * Larger text, simple interface, clear actions
 */
export const elderFriendlyPreset: AccessibilityPreset = {
  id: "elder-friendly",
  name: "Elder Friendly",
  description:
    "Large text, simple language, clear buttons, confirmations, and undo",
  wcagLevel: "AAA",
  allowOverrides: true,
  dimensions: {
    typographyReading: {
      fontScale: "extra-large",
      dyslexiaFont: false,
      monospaceReading: false,
      lineHeight: "loose",
      paragraphSpacing: "increased",
      maxLineLength: "reduced",
      highCharacterDistinction: true,
      disableItalics: false,
      disableAllCaps: false,
      letterSpacing: 0.02,
      wordSpacing: 0,
    },
    colorContrast: {
      colorScheme: "light",
      contrastLevel: "high",
      colorBlindMode: "none",
      colorIndependentState: true,
      forceBorders: true,
    },
    focusNavigationInput: {
      focusIndicatorSize: "extra-large",
      alwaysShowFocus: true,
      keyboardFirstNavigation: false,
      screenReaderOptimized: false,
      switchNavigation: false,
      touchTargetSize: "maximum",
      handedness: "neutral",
      stickyPrimaryActions: true,
      sequentialNavigation: false,
      alwaysVisibleSkipLinks: false,
      increaseInteractiveSpacing: true,
    },
    cognitive: {
      simpleLanguageMode: true,
      noJargonMode: true,
      disclosureMode: "step-by-step",
      chunkedInformation: true,
      explicitStateLabels: true,
      confirmDestructiveActions: true,
      noSurpriseChanges: true,
      layoutConsistencyLock: true,
      decisionReductionMode: true,
      visualHierarchyBoost: true,
      alwaysShowProgress: true,
      universalUndo: true,
    },
    motionAnimation: {
      motionPreference: "reduced",
      disableParallax: true,
      disableAutoPlay: true,
      instantTransitions: false,
      staticLoadingIndicators: false,
      textOnlyFeedback: false,
      maxAnimationDuration: 300,
    },
  },
};

/**
 * Crisis / Emergency Preset
 * Minimal, direct, large, fast
 */
export const crisisEmergencyPreset: AccessibilityPreset = {
  id: "crisis-emergency",
  name: "Crisis / Emergency",
  description:
    "Maximum readability, minimal interface, large controls, immediate actions",
  wcagLevel: "AAA",
  allowOverrides: false,
  dimensions: {
    situationalEnvironmental: {
      sunlightMode: false,
      nightMode: false,
      oneHandMode: false,
      glovesMode: false,
      offlineModeVisuals: false,
      lowBandwidthMode: true,
      batterySaverMode: false,
      emergencyMode: true,
      publicSpacePrivacy: false,
      quietMode: true,
    },
    typographyReading: {
      fontScale: "maximum",
      dyslexiaFont: false,
      monospaceReading: false,
      lineHeight: "loose",
      paragraphSpacing: "double",
      maxLineLength: "reduced",
      highCharacterDistinction: true,
      disableItalics: true,
      disableAllCaps: false,
      letterSpacing: 0,
      wordSpacing: 0,
    },
    colorContrast: {
      colorScheme: "light",
      contrastLevel: "ultra-high",
      colorBlindMode: "none",
      colorIndependentState: true,
      forceBorders: true,
    },
    focusNavigationInput: {
      focusIndicatorSize: "extra-large",
      alwaysShowFocus: true,
      keyboardFirstNavigation: true,
      screenReaderOptimized: false,
      switchNavigation: false,
      touchTargetSize: "maximum",
      handedness: "neutral",
      stickyPrimaryActions: true,
      sequentialNavigation: false,
      alwaysVisibleSkipLinks: true,
      increaseInteractiveSpacing: true,
    },
    cognitive: {
      simpleLanguageMode: true,
      noJargonMode: true,
      disclosureMode: "all-at-once",
      chunkedInformation: false,
      explicitStateLabels: true,
      confirmDestructiveActions: false,
      noSurpriseChanges: true,
      layoutConsistencyLock: true,
      decisionReductionMode: true,
      visualHierarchyBoost: true,
      alwaysShowProgress: false,
      universalUndo: false,
    },
    sensorySensitivity: {
      lowStimulationMode: true,
      visualDensity: "minimal",
      disableFlashing: true,
      disableHighFrequencyPatterns: true,
      calmIdleStates: true,
      alertTiming: "immediate",
      disableAlertStacking: true,
      maxAlertsPerMinute: 60,
      disableAmbientSounds: true,
    },
    motionAnimation: {
      motionPreference: "none",
      disableParallax: true,
      disableAutoPlay: true,
      instantTransitions: true,
      staticLoadingIndicators: true,
      textOnlyFeedback: true,
      maxAnimationDuration: 0,
    },
  },
};

/**
 * Outdoor / Sunlight Preset
 * Maximum contrast for bright environments
 */
export const outdoorSunlightPreset: AccessibilityPreset = {
  id: "outdoor-sunlight",
  name: "Outdoor / Sunlight",
  description: "Maximum contrast, no subtle shades, large touch targets",
  wcagLevel: "AAA",
  allowOverrides: true,
  dimensions: {
    situationalEnvironmental: {
      sunlightMode: true,
      nightMode: false,
      oneHandMode: false,
      glovesMode: false,
      offlineModeVisuals: false,
      lowBandwidthMode: false,
      batterySaverMode: false,
      emergencyMode: false,
      publicSpacePrivacy: false,
      quietMode: true,
    },
    colorContrast: {
      colorScheme: "light",
      contrastLevel: "ultra-high",
      colorBlindMode: "none",
      colorIndependentState: true,
      forceBorders: true,
    },
    focusNavigationInput: {
      focusIndicatorSize: "extra-large",
      alwaysShowFocus: true,
      keyboardFirstNavigation: false,
      screenReaderOptimized: false,
      switchNavigation: false,
      touchTargetSize: "enlarged",
      handedness: "neutral",
      stickyPrimaryActions: false,
      sequentialNavigation: false,
      alwaysVisibleSkipLinks: false,
      increaseInteractiveSpacing: true,
    },
    typographyReading: {
      fontScale: "large",
      dyslexiaFont: false,
      monospaceReading: false,
      lineHeight: "relaxed",
      paragraphSpacing: "increased",
      maxLineLength: "standard",
      highCharacterDistinction: true,
      disableItalics: false,
      disableAllCaps: false,
      letterSpacing: 0,
      wordSpacing: 0,
    },
  },
};

/**
 * Low Power / Offline Preset
 * Battery efficient, works offline, reduced visual complexity
 */
export const lowPowerOfflinePreset: AccessibilityPreset = {
  id: "low-power-offline",
  name: "Low Power / Offline",
  description:
    "Battery efficient, reduced animations, offline-optimized visuals",
  wcagLevel: "AA",
  allowOverrides: true,
  dimensions: {
    situationalEnvironmental: {
      sunlightMode: false,
      nightMode: false,
      oneHandMode: false,
      glovesMode: false,
      offlineModeVisuals: true,
      lowBandwidthMode: true,
      batterySaverMode: true,
      emergencyMode: false,
      publicSpacePrivacy: false,
      quietMode: true,
    },
    motionAnimation: {
      motionPreference: "none",
      disableParallax: true,
      disableAutoPlay: true,
      instantTransitions: true,
      staticLoadingIndicators: true,
      textOnlyFeedback: true,
      maxAnimationDuration: 0,
    },
    sensorySensitivity: {
      lowStimulationMode: false,
      visualDensity: "reduced",
      disableFlashing: true,
      disableHighFrequencyPatterns: false,
      calmIdleStates: true,
      alertTiming: "debounced",
      disableAlertStacking: false,
      maxAlertsPerMinute: 30,
      disableAmbientSounds: true,
    },
  },
};

/**
 * Public / Shared Device Preset
 * Privacy-focused, clear actions, no personalization
 */
export const publicSharedDevicePreset: AccessibilityPreset = {
  id: "public-shared-device",
  name: "Public / Shared Device",
  description:
    "Privacy mode, reduced readability distance, clear logout, no saved data",
  wcagLevel: "AA",
  allowOverrides: true,
  dimensions: {
    situationalEnvironmental: {
      sunlightMode: false,
      nightMode: false,
      oneHandMode: false,
      glovesMode: false,
      offlineModeVisuals: false,
      lowBandwidthMode: false,
      batterySaverMode: false,
      emergencyMode: false,
      publicSpacePrivacy: true,
      quietMode: true,
    },
    cognitive: {
      simpleLanguageMode: true,
      noJargonMode: false,
      disclosureMode: "all-at-once",
      chunkedInformation: false,
      explicitStateLabels: true,
      confirmDestructiveActions: true,
      noSurpriseChanges: true,
      layoutConsistencyLock: false,
      decisionReductionMode: false,
      visualHierarchyBoost: false,
      alwaysShowProgress: false,
      universalUndo: true,
    },
  },
};

/**
 * Motor Impairment Preset
 * Large touch targets, reduced precision requirements, sticky actions
 */
export const motorImpairmentPreset: AccessibilityPreset = {
  id: "motor-impairment",
  name: "Motor Impairment",
  description:
    "Large touch targets, increased spacing, sticky actions, undo support",
  wcagLevel: "AAA",
  allowOverrides: true,
  dimensions: {
    focusNavigationInput: {
      focusIndicatorSize: "extra-large",
      alwaysShowFocus: true,
      keyboardFirstNavigation: true,
      screenReaderOptimized: false,
      switchNavigation: false,
      touchTargetSize: "maximum",
      handedness: "neutral",
      stickyPrimaryActions: true,
      sequentialNavigation: false,
      alwaysVisibleSkipLinks: true,
      increaseInteractiveSpacing: true,
    },
    cognitive: {
      simpleLanguageMode: false,
      noJargonMode: false,
      disclosureMode: "all-at-once",
      chunkedInformation: false,
      explicitStateLabels: true,
      confirmDestructiveActions: true,
      noSurpriseChanges: true,
      layoutConsistencyLock: true,
      decisionReductionMode: false,
      visualHierarchyBoost: false,
      alwaysShowProgress: false,
      universalUndo: true,
    },
    motionAnimation: {
      motionPreference: "reduced",
      disableParallax: true,
      disableAutoPlay: true,
      instantTransitions: false,
      staticLoadingIndicators: false,
      textOnlyFeedback: false,
      maxAnimationDuration: 300,
    },
  },
};

/**
 * Vestibular Disorders Preset
 * No motion, no parallax, calm interface
 */
export const vestibularDisordersPreset: AccessibilityPreset = {
  id: "vestibular-disorders",
  name: "Vestibular Disorders",
  description: "No motion, no parallax, no autoplay, instant transitions",
  wcagLevel: "AAA",
  allowOverrides: true,
  dimensions: {
    motionAnimation: {
      motionPreference: "none",
      disableParallax: true,
      disableAutoPlay: true,
      instantTransitions: true,
      staticLoadingIndicators: true,
      textOnlyFeedback: true,
      maxAnimationDuration: 0,
    },
    sensorySensitivity: {
      lowStimulationMode: true,
      visualDensity: "normal",
      disableFlashing: true,
      disableHighFrequencyPatterns: true,
      calmIdleStates: true,
      alertTiming: "debounced",
      disableAlertStacking: true,
      maxAlertsPerMinute: 10,
      disableAmbientSounds: true,
    },
  },
};

/**
 * Default Preset (System-Aware)
 * Respects system preferences but otherwise uses defaults
 */
export const defaultPreset: AccessibilityPreset = {
  id: "default",
  name: "Default (System-Aware)",
  description:
    "Respects system accessibility preferences with sensible defaults",
  wcagLevel: "AA",
  allowOverrides: true,
  dimensions: {},
};

// ============================================================================
// PRESET REGISTRY
// ============================================================================

/**
 * All available presets
 */
export const allPresets: Record<string, AccessibilityPreset> = {
  "low-vision": lowVisionPreset,
  photosensitive: photosensitivePreset,
  dyslexia: dyslexiaPreset,
  "adhd-cognitive-load": adhdCognitiveLoadPreset,
  "screen-reader-first": screenReaderFirstPreset,
  "elder-friendly": elderFriendlyPreset,
  "crisis-emergency": crisisEmergencyPreset,
  "outdoor-sunlight": outdoorSunlightPreset,
  "low-power-offline": lowPowerOfflinePreset,
  "public-shared-device": publicSharedDevicePreset,
  "motor-impairment": motorImpairmentPreset,
  "vestibular-disorders": vestibularDisordersPreset,
  default: defaultPreset,
};

/**
 * Get preset by ID
 */
export function getPreset(id: string): AccessibilityPreset | undefined {
  return allPresets[id];
}

/**
 * Get all preset IDs
 */
export function getAllPresetIds(): string[] {
  return Object.keys(allPresets);
}

/**
 * Get presets by WCAG level
 */
export function getPresetsByWCAGLevel(
  level: "A" | "AA" | "AAA"
): AccessibilityPreset[] {
  return Object.values(allPresets).filter(
    (preset) => preset.wcagLevel === level
  );
}

/**
 * Search presets by keyword
 */
export function searchPresets(query: string): AccessibilityPreset[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(allPresets).filter(
    (preset) =>
      preset.name.toLowerCase().includes(lowerQuery) ||
      preset.description.toLowerCase().includes(lowerQuery)
  );
}
