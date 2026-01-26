'use client';

/**
 * Accessibility Theme Provider
 * 
 * React context and hooks for managing accessibility theme state.
 * Handles persistence, runtime token application, and dimension updates.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type {
  AccessibilityUserSettings,
  AccessibilityDimensions,
  ThemeTokens,
  PresetId,
} from '../types/accessibility-theme';
import {
  generateThemeTokens,
  validateDimensions,
  detectSystemDefaults,
} from '../lib/accessibility-theme-engine';

// ============================================================================
// STORAGE
// ============================================================================

const STORAGE_KEY = 'accessibility-theme-settings';
const STORAGE_VERSION = 1;

/**
 * Load settings from localStorage
 */
function loadSettings(): AccessibilityUserSettings | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Version check for migrations
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('Accessibility settings version mismatch, resetting to defaults');
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load accessibility settings:', error);
    return null;
  }
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings: AccessibilityUserSettings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save accessibility settings:', error);
  }
}

/**
 * Get default user settings
 */
function getDefaultUserSettings(): AccessibilityUserSettings {
  return {
    activePreset: null,
    dimensionOverrides: {},
    temporaryOverrides: {},
    syncSettings: false,
    lastModified: Date.now(),
    version: STORAGE_VERSION,
  };
}

function toHslValue(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith('hsl(') && value.endsWith(')')) {
    return value.slice(4, -1);
  }
  return value;
}

function hasUserCustomizations(settings: AccessibilityUserSettings): boolean {
  return Boolean(
    settings.activePreset ||
    (settings.dimensionOverrides &&
      Object.keys(settings.dimensionOverrides).length > 0) ||
    (settings.temporaryOverrides &&
      Object.keys(settings.temporaryOverrides).length > 0)
  );
}

// ============================================================================
// CONTEXT
// ============================================================================

interface AccessibilityThemeContextValue {
  /** Current user settings */
  settings: AccessibilityUserSettings;

  /** Generated theme tokens */
  tokens: ThemeTokens;

  /** Set active preset */
  setPreset: (presetId: PresetId | null) => void;

  /** Update dimension overrides */
  updateDimensions: (dimensions: Partial<AccessibilityDimensions>) => void;

  /** Set temporary overrides (cleared on unmount) */
  setTemporaryOverrides: (dimensions: Partial<AccessibilityDimensions>) => void;

  /** Clear temporary overrides */
  clearTemporaryOverrides: () => void;

  /** Reset to system defaults */
  resetToDefaults: () => void;

  /** Check if a preset is active */
  isPresetActive: (presetId: PresetId) => boolean;
}

const AccessibilityThemeContext = createContext<AccessibilityThemeContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface AccessibilityThemeProviderProps {
  children: React.ReactNode;

  /** Optional workspace ID for workspace-specific settings */
  workspaceId?: string;

  /** Optional initial settings (overrides localStorage) */
  initialSettings?: Partial<AccessibilityUserSettings>;

  /** Disable persistence to localStorage */
  disablePersistence?: boolean;
}

export function AccessibilityThemeProvider({
  children,
  workspaceId,
  initialSettings,
  disablePersistence = false,
}: AccessibilityThemeProviderProps) {
  // Initialize settings
  const [settings, setSettings] = useState<AccessibilityUserSettings>(() => {
    const loaded = !disablePersistence ? loadSettings() : null;
    const defaults = getDefaultUserSettings();

    if (initialSettings) {
      return { ...defaults, ...initialSettings };
    }

    return loaded || defaults;
  });

  // Generate tokens from settings
  const tokens = useMemo(
    () => generateThemeTokens(settings, workspaceId),
    [settings, workspaceId]
  );

  // Save settings when they change (unless persistence is disabled)
  useEffect(() => {
    if (!disablePersistence) {
      saveSettings(settings);
    }
  }, [settings, disablePersistence]);

  // Apply CSS tokens to document root
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const { cssTokens } = tokens;
    const shouldBridgeThemeVars = hasUserCustomizations(settings);
    const themeClass = root.classList.contains('dark')
      ? 'dark'
      : root.classList.contains('light')
        ? 'light'
        : null;
    const scheme = tokens.activeDimensions.colorContrast.colorScheme;
    const tokenColorScheme = scheme === 'dark' || scheme === 'dim-dark' ? 'dark' : 'light';

    // Apply all CSS custom properties
    Object.entries(cssTokens).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Allow font scaling and line-height to affect the document baseline
    const fontScale = cssTokens['--a11y-font-size-scale'] ?? '1';
    const fontBase = cssTokens['--a11y-font-size-base'] ?? '1rem';
    root.style.fontSize = `calc(${fontBase} * ${fontScale})`;
    root.style.lineHeight = cssTokens['--a11y-line-height'] ?? '1.5';

    // Bridge into base theme variables when the user explicitly opts in via preset or overrides
    if (shouldBridgeThemeVars) {
      // Align the root theme class to the chosen accessibility color scheme
      if (themeClass !== tokenColorScheme) {
        root.classList.remove('light', 'dark');
        root.classList.add(tokenColorScheme);
      }

      const bgBase = toHslValue(cssTokens['--a11y-bg-base']);
      const bgElevated = toHslValue(cssTokens['--a11y-bg-elevated']);
      const textPrimary = toHslValue(cssTokens['--a11y-text-primary']);
      const textMuted = toHslValue(cssTokens['--a11y-text-secondary']);
      const border = toHslValue(cssTokens['--a11y-border-default']);
      const interactive = toHslValue(cssTokens['--a11y-interactive-primary']);

      if (bgBase) {
        root.style.setProperty('--background', bgBase);
        root.style.setProperty('--card', bgBase);
        root.style.setProperty('--popover', bgBase);
      }
      if (bgElevated) {
        root.style.setProperty('--card', bgElevated);
        root.style.setProperty('--popover', bgElevated);
      }
      if (textPrimary) {
        root.style.setProperty('--foreground', textPrimary);
        root.style.setProperty('--card-foreground', textPrimary);
        root.style.setProperty('--popover-foreground', textPrimary);
        root.style.setProperty('--primary-foreground', textPrimary);
      }
      if (textMuted) {
        root.style.setProperty('--muted-foreground', textMuted);
        root.style.setProperty('--secondary-foreground', textMuted);
        root.style.setProperty('--accent-foreground', textMuted);
      }
      if (border) {
        root.style.setProperty('--border', border);
        root.style.setProperty('--input', border);
        root.style.setProperty('--ring', border);
      }
      if (interactive) {
        root.style.setProperty('--primary', interactive);
        root.style.setProperty('--accent', interactive);
        root.style.setProperty('--secondary', bgElevated ?? bgBase ?? interactive);
      }

    } else {
      // Clear any overrides so the base theme toggle works as before
      ['--background', '--foreground', '--card', '--card-foreground', '--popover', '--popover-foreground', '--primary', '--primary-foreground', '--secondary', '--secondary-foreground', '--accent', '--accent-foreground', '--muted-foreground', '--border', '--input', '--ring'].forEach(
        (key) => root.style.removeProperty(key)
      );
      root.style.fontSize = '';
      root.style.lineHeight = '';
    }

    // Respect the resolved scheme for native controls
    root.style.colorScheme = shouldBridgeThemeVars
      ? tokenColorScheme
      : (themeClass ?? tokenColorScheme);

    // Apply body classes based on behavioral flags
    const { behavioralFlags } = tokens;

    if (behavioralFlags.disableAnimations || behavioralFlags.disableTransitions) {
      root.classList.add('a11y-no-motion');
    } else {
      root.classList.remove('a11y-no-motion');
    }

    if (behavioralFlags.emergencyMode) {
      root.classList.add('a11y-emergency-mode');
    } else {
      root.classList.remove('a11y-emergency-mode');
    }

    if (behavioralFlags.privacyMode) {
      root.classList.add('a11y-privacy-mode');
    } else {
      root.classList.remove('a11y-privacy-mode');
    }
  }, [tokens, settings]);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueries = [
      window.matchMedia('(prefers-color-scheme: dark)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: more)'),
    ];

    const handleChange = () => {
      // Only react to system changes if no preset is active
      if (settings.activePreset === null && Object.keys(settings.dimensionOverrides).length === 0) {
        // Trigger re-render by updating lastModified
        setSettings(prev => ({
          ...prev,
          lastModified: Date.now(),
        }));
      }
    };

    mediaQueries.forEach(mq => mq.addEventListener('change', handleChange));

    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', handleChange));
    };
  }, [settings.activePreset, settings.dimensionOverrides]);

  // Set preset
  const setPreset = useCallback((presetId: PresetId | null) => {
    setSettings(prev => ({
      ...prev,
      activePreset: presetId,
      lastModified: Date.now(),
    }));
  }, []);

  // Update dimension overrides
  const updateDimensions = useCallback((dimensions: Partial<AccessibilityDimensions>) => {
    // Validate before applying
    const validation = validateDimensions(dimensions);
    if (!validation.valid) {
      console.error('Invalid dimensions:', validation.errors);
      return;
    }

    if (validation.warnings.length > 0) {
      console.warn('Dimension warnings:', validation.warnings);
    }

    setSettings(prev => ({
      ...prev,
      dimensionOverrides: {
        ...prev.dimensionOverrides,
        ...dimensions,
      },
      lastModified: Date.now(),
    }));
  }, []);

  // Set temporary overrides
  const setTemporaryOverrides = useCallback((dimensions: Partial<AccessibilityDimensions>) => {
    setSettings(prev => ({
      ...prev,
      temporaryOverrides: {
        ...prev.temporaryOverrides,
        ...dimensions,
      },
    }));
  }, []);

  // Clear temporary overrides
  const clearTemporaryOverrides = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      temporaryOverrides: {},
    }));
  }, []);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setSettings(getDefaultUserSettings());
  }, []);

  // Check if preset is active
  const isPresetActive = useCallback(
    (presetId: PresetId) => settings.activePreset === presetId,
    [settings.activePreset]
  );

  const value: AccessibilityThemeContextValue = {
    settings,
    tokens,
    setPreset,
    updateDimensions,
    setTemporaryOverrides,
    clearTemporaryOverrides,
    resetToDefaults,
    isPresetActive,
  };

  return (
    <AccessibilityThemeContext.Provider value={value}>
      {children}
    </AccessibilityThemeContext.Provider>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Access the accessibility theme context
 */
export function useAccessibilityTheme() {
  const context = useContext(AccessibilityThemeContext);

  if (!context) {
    throw new Error('useAccessibilityTheme must be used within AccessibilityThemeProvider');
  }

  return context;
}

/**
 * Get current theme tokens
 */
export function useThemeTokens() {
  const { tokens } = useAccessibilityTheme();
  return tokens;
}

/**
 * Get behavioral flags
 */
export function useBehavioralFlags() {
  const { tokens } = useAccessibilityTheme();
  return tokens.behavioralFlags;
}

/**
 * Get component props
 */
export function useComponentProps() {
  const { tokens } = useAccessibilityTheme();
  return tokens.componentProps;
}

/**
 * Get active dimensions
 */
export function useActiveDimensions() {
  const { tokens } = useAccessibilityTheme();
  return tokens.activeDimensions;
}

/**
 * Get preset controls
 */
export function usePresetControls() {
  const { setPreset, isPresetActive, settings } = useAccessibilityTheme();

  return {
    setPreset,
    isPresetActive,
    activePreset: settings.activePreset,
  };
}

/**
 * Get dimension controls
 */
export function useDimensionControls() {
  const { updateDimensions, setTemporaryOverrides, clearTemporaryOverrides } =
    useAccessibilityTheme();

  return {
    updateDimensions,
    setTemporaryOverrides,
    clearTemporaryOverrides,
  };
}

/**
 * Hook for conditional rendering based on behavioral flags
 */
export function useConditionalRender() {
  const flags = useBehavioralFlags();

  return {
    shouldShowAnimations: !flags.disableAnimations,
    shouldUseTransitions: !flags.disableTransitions,
    shouldAutoPlay: !flags.disableAutoPlay,
    isEmergencyMode: flags.emergencyMode,
    isPrivacyMode: flags.privacyMode,
    isLowBandwidth: flags.lowBandwidth,
    isKeyboardFirstMode: flags.keyboardFirstMode,
    isScreenReaderMode: flags.screenReaderMode,
  };
}

/**
 * Hook for system preference detection
 */
export function useSystemPreferences() {
  const [preferences, setPreferences] = useState(detectSystemDefaults);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueries = {
      prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)'),
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      prefersHighContrast: window.matchMedia('(prefers-contrast: more)'),
      prefersReducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)'),
    };

    const handleChange = () => {
      setPreferences(detectSystemDefaults());
    };

    Object.values(mediaQueries).forEach(mq =>
      mq.addEventListener('change', handleChange)
    );

    return () => {
      Object.values(mediaQueries).forEach(mq =>
        mq.removeEventListener('change', handleChange)
      );
    };
  }, []);

  return preferences;
}

/**
 * Hook for focus management
 */
export function useFocusManagement() {
  const flags = useBehavioralFlags();

  return {
    isKeyboardFirstMode: flags.keyboardFirstMode,
    isScreenReaderMode: flags.screenReaderMode,
    isSwitchNavigationMode: flags.switchNavigationMode,
    shouldAlwaysShowSkipLinks: flags.alwaysShowSkipLinks,
  };
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

/**
 * Skip link component with accessibility support
 */
export function SkipLink({ href, children }: { href: string; children: React.ReactNode }) {
  const flags = useBehavioralFlags();

  return (
    <a
      href={href}
      className={`a11y-skip-link ${flags.alwaysShowSkipLinks ? 'a11y-always-visible' : ''}`}
    >
      {children}
    </a>
  );
}

/**
 * Conditional renderer based on motion preferences
 */
export function ConditionalMotion({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { shouldShowAnimations } = useConditionalRender();

  return <>{shouldShowAnimations ? children : (fallback || children)}</>;
}

/**
 * Screen reader only text
 */
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return <span className="a11y-sr-only">{children}</span>;
}
