/**
 * Accessibility-First Theme System
 *
 * This system implements independent accessibility dimensions that can be composed
 * together without conflict. It prioritizes WCAG 2.2 AA/AAA compliance and supports
 * cognitive, sensory, motor, and situational accessibility needs.
 */

// ============================================================================
// DIMENSION VALUE TYPES
// ============================================================================

/** Color scheme variants */
export type ColorScheme =
  | "light"
  | "dark"
  | "dim-dark"
  | "warm-bias"
  | "cool-bias"
  | "monochrome";

/** Contrast levels aligned with WCAG */
export type ContrastLevel =
  | "standard" // WCAG AA
  | "high" // WCAG AAA
  | "ultra-high" // Beyond AAA
  | "low"; // Reduced contrast for light sensitivity

/** Color blindness adaptations */
export type ColorBlindMode =
  | "none"
  | "deuteranopia" // Red-green (most common)
  | "protanopia" // Red-green
  | "tritanopia"; // Blue-yellow

/** Font scaling */
export type FontScale =
  | "normal" // 100%
  | "large" // 125%
  | "extra-large" // 150%
  | "maximum"; // 200%

/** Line height adjustments */
export type LineHeight =
  | "normal" // 1.5
  | "relaxed" // 1.75
  | "loose"; // 2.0

/** Paragraph spacing */
export type ParagraphSpacing =
  | "normal" // 1em
  | "increased" // 1.5em
  | "double"; // 2em

/** Reading line length constraints */
export type MaxLineLength =
  | "none"
  | "standard" // 80ch
  | "reduced" // 60ch
  | "narrow"; // 45ch

/** Motion preferences */
export type MotionPreference = "full" | "reduced" | "none";

/** Focus indicator sizes */
export type FocusIndicatorSize =
  | "standard" // 2px
  | "enhanced" // 3px
  | "extra-large"; // 5px

/** Touch target sizing */
export type TouchTargetSize =
  | "standard" // 44px minimum
  | "enlarged" // 56px minimum
  | "maximum"; // 72px minimum

/** Layout handedness for one-handed use */
export type Handedness = "neutral" | "left" | "right";

/** Information disclosure patterns */
export type DisclosureMode = "all-at-once" | "progressive" | "step-by-step";

/** Visual density for cognitive load */
export type VisualDensity = "normal" | "reduced" | "minimal";

/** Alert presentation timing */
export type AlertTiming =
  | "immediate"
  | "debounced" // 500ms
  | "rate-limited"; // Max 1 per 3s

// ============================================================================
// DIMENSION DEFINITIONS
// ============================================================================

/** A. Color and Contrast Dimensions */
export interface ColorContrastDimensions {
  /** Primary color scheme */
  colorScheme: ColorScheme;

  /** Contrast level for text and UI elements */
  contrastLevel: ContrastLevel;

  /** Color blindness accommodation */
  colorBlindMode: ColorBlindMode;

  /** Never use color alone to convey state or meaning */
  colorIndependentState: boolean;

  /** Force borders on all interactive elements */
  forceBorders: boolean;
}

/** B. Typography and Reading Dimensions */
export interface TypographyReadingDimensions {
  /** Font size scaling */
  fontScale: FontScale;

  /** Use dyslexia-friendly font (OpenDyslexic, Comic Sans, etc.) */
  dyslexiaFont: boolean;

  /** Use monospace font for all text */
  monospaceReading: boolean;

  /** Line height adjustment */
  lineHeight: LineHeight;

  /** Paragraph spacing */
  paragraphSpacing: ParagraphSpacing;

  /** Maximum line length */
  maxLineLength: MaxLineLength;

  /** Emphasize character distinction (disable ambiguous glyphs) */
  highCharacterDistinction: boolean;

  /** Never render italics (replace with bold or underline) */
  disableItalics: boolean;

  /** Never render all-caps (convert to sentence case) */
  disableAllCaps: boolean;

  /** Letter spacing adjustment (0 = normal, 0.05 = increased) */
  letterSpacing: number;

  /** Word spacing adjustment (0 = normal, 0.16 = increased) */
  wordSpacing: number;
}

/** C. Motion and Animation Dimensions */
export interface MotionAnimationDimensions {
  /** Overall motion preference */
  motionPreference: MotionPreference;

  /** Disable parallax scrolling effects */
  disableParallax: boolean;

  /** Disable auto-playing content */
  disableAutoPlay: boolean;

  /** Use instant transitions (0ms) */
  instantTransitions: boolean;

  /** Use static loading indicators (no spinners) */
  staticLoadingIndicators: boolean;

  /** Provide text alternatives to all animated feedback */
  textOnlyFeedback: boolean;

  /** Maximum animation duration in milliseconds */
  maxAnimationDuration: number;
}

/** D. Focus, Navigation, and Input Dimensions */
export interface FocusNavigationInputDimensions {
  /** Focus indicator size */
  focusIndicatorSize: FocusIndicatorSize;

  /** Force focus indicators to always be visible (not just :focus-visible) */
  alwaysShowFocus: boolean;

  /** Optimize for keyboard-first navigation */
  keyboardFirstNavigation: boolean;

  /** Optimize for screen reader usage */
  screenReaderOptimized: boolean;

  /** Enable switch/single-input navigation mode */
  switchNavigation: boolean;

  /** Touch target sizing */
  touchTargetSize: TouchTargetSize;

  /** Layout handedness */
  handedness: Handedness;

  /** Keep primary actions visible and fixed */
  stickyPrimaryActions: boolean;

  /** Force sequential navigation (disable spatial navigation) */
  sequentialNavigation: boolean;

  /** Always show skip links (don't hide until focus) */
  alwaysVisibleSkipLinks: boolean;

  /** Increase spacing between interactive elements */
  increaseInteractiveSpacing: boolean;
}

/** E. Cognitive Load and Comprehension Dimensions */
export interface CognitiveDimensions {
  /** Use simple, plain language */
  simpleLanguageMode: boolean;

  /** Remove or explain jargon */
  noJargonMode: boolean;

  /** Information disclosure pattern */
  disclosureMode: DisclosureMode;

  /** Break information into smaller chunks */
  chunkedInformation: boolean;

  /** Always show explicit state labels (not just icons) */
  explicitStateLabels: boolean;

  /** Require confirmation for destructive actions */
  confirmDestructiveActions: boolean;

  /** Disable surprising UI changes (no auto-redirects, sudden modals, etc.) */
  noSurpriseChanges: boolean;

  /** Lock layout consistency (disable adaptive/responsive changes mid-session) */
  layoutConsistencyLock: boolean;

  /** Reduce number of choices shown at once */
  decisionReductionMode: boolean;

  /** Enhance visual hierarchy (more prominent headings, clearer sections) */
  visualHierarchyBoost: boolean;

  /** Show progress indicators for multi-step processes */
  alwaysShowProgress: boolean;

  /** Provide undo for all actions */
  universalUndo: boolean;
}

/** F. Sensory Sensitivity Dimensions */
export interface SensorySensitivityDimensions {
  /** Low stimulation mode (muted colors, minimal animation, reduced density) */
  lowStimulationMode: boolean;

  /** Visual density */
  visualDensity: VisualDensity;

  /** Disable all flashing content (3 flashes per second or more) */
  disableFlashing: boolean;

  /** Disable high-frequency patterns (stripes, checkerboards) */
  disableHighFrequencyPatterns: boolean;

  /** Calm idle states (no pulsing, breathing, or attention-seeking animations) */
  calmIdleStates: boolean;

  /** Alert timing behavior */
  alertTiming: AlertTiming;

  /** Disable alert stacking (show one at a time) */
  disableAlertStacking: boolean;

  /** Maximum alerts per minute */
  maxAlertsPerMinute: number;

  /** Disable ambient sounds */
  disableAmbientSounds: boolean;
}

/** G. Situational and Environmental Dimensions */
export interface SituationalEnvironmentalDimensions {
  /** Sunlight/high-brightness mode (maximum contrast, no subtle shades) */
  sunlightMode: boolean;

  /** Night mode (true dark, OLED-friendly) */
  nightMode: boolean;

  /** One-hand mode (optimize for single-hand use) */
  oneHandMode: boolean;

  /** Gloves mode (larger touch targets, reduced precision requirements) */
  glovesMode: boolean;

  /** Optimize visuals for offline mode */
  offlineModeVisuals: boolean;

  /** Low-bandwidth mode (reduce visual complexity, no decorative images) */
  lowBandwidthMode: boolean;

  /** Battery saver mode (reduce repaints, disable non-essential animations) */
  batterySaverMode: boolean;

  /** Emergency mode (large text, minimal interface, direct actions) */
  emergencyMode: boolean;

  /** Public space privacy mode (blur sensitive content, reduce readability distance) */
  publicSpacePrivacy: boolean;

  /** Quiet mode (no reliance on sound for feedback) */
  quietMode: boolean;
}

// ============================================================================
// COMPLETE DIMENSION SET
// ============================================================================

/** Complete set of all accessibility dimensions */
export interface AccessibilityDimensions {
  colorContrast: ColorContrastDimensions;
  typographyReading: TypographyReadingDimensions;
  motionAnimation: MotionAnimationDimensions;
  focusNavigationInput: FocusNavigationInputDimensions;
  cognitive: CognitiveDimensions;
  sensorySensitivity: SensorySensitivityDimensions;
  situationalEnvironmental: SituationalEnvironmentalDimensions;
}

// ============================================================================
// PRESET DEFINITIONS
// ============================================================================

/** Available preset identifiers */
export type PresetId =
  | "low-vision"
  | "photosensitive"
  | "dyslexia"
  | "adhd-cognitive-load"
  | "screen-reader-first"
  | "elder-friendly"
  | "crisis-emergency"
  | "outdoor-sunlight"
  | "low-power-offline"
  | "public-shared-device"
  | "motor-impairment"
  | "vestibular-disorders"
  | "default";

/** Preset definition */
export interface AccessibilityPreset {
  /** Unique preset identifier */
  id: PresetId;

  /** Human-readable name */
  name: string;

  /** Description of what this preset optimizes for */
  description: string;

  /** Dimension values to apply */
  dimensions: Partial<AccessibilityDimensions>;

  /** Whether user can override individual dimensions */
  allowOverrides: boolean;

  /** WCAG level this preset targets */
  wcagLevel: "A" | "AA" | "AAA";
}

// ============================================================================
// USER SETTINGS
// ============================================================================

/** User's complete accessibility configuration */
export interface AccessibilityUserSettings {
  /** Active preset (if any) */
  activePreset: PresetId | null;

  /** User's dimension overrides (merged with preset) */
  dimensionOverrides: Partial<AccessibilityDimensions>;

  /** Temporary dimension overrides (not persisted, expire on session end) */
  temporaryOverrides: Partial<AccessibilityDimensions>;

  /** Per-workspace settings (optional) */
  workspaceSettings?: Record<string, Partial<AccessibilityDimensions>>;

  /** Whether to sync settings across devices */
  syncSettings: boolean;

  /** Last modified timestamp */
  lastModified: number;

  /** Settings version for migration */
  version: number;
}

// ============================================================================
// THEME TOKENS (Output of dimension evaluation)
// ============================================================================

/** Behavioral flags that control component behavior */
export interface BehavioralFlags {
  // Motion flags
  disableAnimations: boolean;
  disableTransitions: boolean;
  disableParallax: boolean;
  disableAutoPlay: boolean;

  // Navigation flags
  keyboardFirstMode: boolean;
  screenReaderMode: boolean;
  switchNavigationMode: boolean;
  alwaysShowSkipLinks: boolean;

  // Cognitive flags
  simpleLanguage: boolean;
  noJargon: boolean;
  explicitLabels: boolean;
  confirmDestructive: boolean;
  showProgress: boolean;

  // Sensory flags
  disableFlashing: boolean;
  calmMode: boolean;
  oneAlertAtATime: boolean;
  quietMode: boolean;

  // Situational flags
  emergencyMode: boolean;
  privacyMode: boolean;
  lowBandwidth: boolean;
  batterySaver: boolean;
}

/** Component-level props that should be passed down */
export interface ComponentProps {
  // Typography
  fontFamily: string;
  disableItalics: boolean;
  disableAllCaps: boolean;

  // Interaction
  touchTargetMinSize: number;
  focusIndicatorWidth: number;
  interactiveSpacing: number;

  // Content
  maxLineLength: string | null;
  disclosureMode: DisclosureMode;

  // Timing
  transitionDuration: number;
  animationDuration: number;
  alertDelay: number;
}

/** CSS custom properties object */
export interface CSSTokens {
  // Color tokens
  "--a11y-bg-base": string;
  "--a11y-bg-elevated": string;
  "--a11y-bg-sunken": string;
  "--a11y-text-primary": string;
  "--a11y-text-secondary": string;
  "--a11y-text-tertiary": string;
  "--a11y-border-default": string;
  "--a11y-border-focus": string;
  "--a11y-interactive-primary": string;
  "--a11y-interactive-hover": string;
  "--a11y-interactive-active": string;
  "--a11y-interactive-disabled": string;
  "--a11y-success": string;
  "--a11y-warning": string;
  "--a11y-error": string;
  "--a11y-info": string;

  // Spacing tokens
  "--a11y-spacing-xs": string;
  "--a11y-spacing-sm": string;
  "--a11y-spacing-md": string;
  "--a11y-spacing-lg": string;
  "--a11y-spacing-xl": string;
  "--a11y-touch-target-min": string;
  "--a11y-interactive-spacing": string;

  // Typography tokens
  "--a11y-font-family-base": string;
  "--a11y-font-family-mono": string;
  "--a11y-font-size-base": string;
  "--a11y-font-size-scale": string;
  "--a11y-line-height": string;
  "--a11y-letter-spacing": string;
  "--a11y-word-spacing": string;
  "--a11y-paragraph-spacing": string;
  "--a11y-max-line-length": string;

  // Border tokens
  "--a11y-border-width": string;
  "--a11y-border-radius": string;
  "--a11y-focus-ring-width": string;
  "--a11y-focus-ring-offset": string;

  // Timing tokens
  "--a11y-transition-duration": string;
  "--a11y-animation-duration": string;

  // Shadow tokens
  "--a11y-shadow-sm": string;
  "--a11y-shadow-md": string;
  "--a11y-shadow-lg": string;

  // Visual density tokens
  "--a11y-density-multiplier": string;
}

/** Complete theme token output */
export interface ThemeTokens {
  /** CSS custom properties */
  cssTokens: CSSTokens;

  /** Behavioral flags for component logic */
  behavioralFlags: BehavioralFlags;

  /** Component-level props */
  componentProps: ComponentProps;

  /** Currently active dimensions (for debugging/auditing) */
  activeDimensions: AccessibilityDimensions;
}

// ============================================================================
// CONFLICT RESOLUTION
// ============================================================================

/** Priority order for dimension sources */
export type DimensionPriority =
  | "temporary-override" // Highest priority
  | "user-override"
  | "workspace-setting"
  | "preset"
  | "system-default"; // Lowest priority

/** Conflict resolution strategy */
export type ConflictResolutionStrategy =
  | "prioritized" // Use priority order
  | "most-accessible" // Choose most accessible option
  | "user-choice"; // Require explicit user choice

/** Conflict resolution rule */
export interface ConflictResolutionRule {
  /** Dimension paths that conflict */
  conflictingDimensions: string[];

  /** Strategy to use */
  strategy: ConflictResolutionStrategy;

  /** Custom resolver function (if strategy is 'user-choice') */
  resolver?: (values: unknown[]) => unknown;
}

// ============================================================================
// VALIDATION AND AUDITING
// ============================================================================

/** Validation result for a dimension value */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/** Audit result for a component */
export interface ComponentAuditResult {
  componentName: string;
  passed: boolean;
  wcagLevel: "A" | "AA" | "AAA" | null;
  issues: AuditIssue[];
  testedDimensions: string[];
}

/** Individual audit issue */
export interface AuditIssue {
  severity: "error" | "warning" | "info";
  dimension: string;
  message: string;
  wcagCriterion?: string;
  recommendation?: string;
}

// ============================================================================
// SYSTEM DEFAULTS
// ============================================================================

/** Get system-level defaults (respects OS preferences where applicable) */
export interface SystemDefaults {
  prefersDarkMode: boolean;
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  prefersReducedTransparency: boolean;
  systemFontSize: number;
}

// Types are exported inline via export interface/export type declarations
