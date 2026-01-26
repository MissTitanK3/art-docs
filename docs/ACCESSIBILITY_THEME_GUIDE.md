# Accessibility-First Theme System - Implementation Guide

## Overview

This is a production-ready, dimension-based accessibility theme system that prioritizes WCAG 2.2 AA/AAA compliance and supports visual, cognitive, motor, sensory, and situational accessibility needs.

**Key Principles:**

- **Composable**: Dimensions are independent and can be combined
- **Deterministic**: Conflicts resolve via explicit priority rules
- **Auditable**: All decisions are traceable and documented
- **Extensible**: New dimensions and presets can be added without redesign
- **Offline-First**: Works without network connectivity

---

## Architecture

The system consists of three layers:

### 1. Dimensions (Independent Accessibility Controls)

Dimensions represent specific accessibility concerns:

- **Color/Contrast**: Schemes, contrast levels, color-blind modes
- **Typography/Reading**: Font scaling, dyslexia support, line spacing
- **Motion/Animation**: Motion preferences, flashing protection
- **Focus/Navigation**: Focus indicators, touch targets, keyboard navigation
- **Cognitive**: Simple language, step-by-step disclosure, confirmations
- **Sensory**: Visual density, alert management, calm states
- **Situational**: Emergency mode, sunlight mode, battery saver

### 2. Tokens (Rendering Controls)

Tokens translate dimensions into concrete values:

- **CSS Tokens**: Custom properties (`--a11y-*` variables)
- **Behavioral Flags**: Boolean controls for component logic
- **Component Props**: Values passed to React components

### 3. Presets (Predefined Combinations)

Presets are mappings from use cases to dimension values:

- `low-vision`: Large text, high contrast, enhanced focus
- `photosensitive`: No flashing, reduced motion, calm interface
- `dyslexia`: Optimized typography, increased spacing
- `adhd-cognitive-load`: Minimal distractions, step-by-step guidance
- `screen-reader-first`: Keyboard navigation, explicit labels
- `elder-friendly`: Simple language, large controls, confirmations
- `crisis-emergency`: Maximum readability, minimal interface
- And more...

---

## Quick Start

### 1. Install Dependencies

This system requires React 18+ and Next.js 13+ (or any React framework).

```bash
pnpm install
```

### 2. Import CSS Tokens

In your root layout or globals.css:

```css
@import './app/accessibility-tokens.css';
```

Or in [globals.css](cci:1://file:///home/misstitank3/art/turbo/apps/web/app/globals.css:0:0-0:0):

```css
@import './accessibility-tokens.css';
```

### 3. Wrap Your App with Provider

```tsx
import { AccessibilityThemeProvider } from '@/components/accessibility-theme-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AccessibilityThemeProvider>
          {children}
        </AccessibilityThemeProvider>
      </body>
    </html>
  );
}
```

### 4. Use Hooks in Components

```tsx
import { useBehavioralFlags, useComponentProps } from '@/components/accessibility-theme-provider';

export function MyButton({ children, onClick }) {
  const flags = useBehavioralFlags();
  const props = useComponentProps();

  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: props.fontFamily,
        minHeight: props.touchTargetMinSize,
        transition: flags.disableTransitions ? 'none' : '150ms',
      }}
    >
      {children}
    </button>
  );
}
```

---

## Core Files

### Type Definitions

- **[types/accessibility-theme.ts](cci:1://file:///home/misstitank3/art/turbo/apps/web/types/accessibility-theme.ts:0:0-0:0)**: Complete TypeScript schema for dimensions, presets, tokens, and settings

### Configuration

- **[config/accessibility-dimensions.ts](cci:1://file:///home/misstitank3/art/turbo/apps/web/config/accessibility-dimensions.ts:0:0-0:0)**: Default values, system detection, dimension metadata
- **[config/accessibility-presets.ts](cci:1://file:///home/misstitank3/art/turbo/apps/web/config/accessibility-presets.ts:0:0-0:0)**: All preset definitions with dimension mappings

### Runtime Logic

- **[lib/accessibility-theme-engine.ts](cci:1://file:///home/misstitank3/art/turbo/apps/web/lib/accessibility-theme-engine.ts:0:0-0:0)**: Token generation, dimension merging, validation

### Styling

- **[app/accessibility-tokens.css](cci:1://file:///home/misstitank3/art/turbo/apps/web/app/accessibility-tokens.css:0:0-0:0)**: CSS custom properties and utility classes

### React Components

- **[components/accessibility-theme-provider.tsx](cci:1://file:///home/misstitank3/art/turbo/apps/web/components/accessibility-theme-provider.tsx:0:0-0:0)**: Provider, hooks, persistence
- **[components/accessibility-examples.tsx](cci:1://file:///home/misstitank3/art/turbo/apps/web/components/accessibility-examples.tsx:0:0-0:0)**: Example components

### Documentation

- **[docs/accessibility-audit-checklist.md](cci:1://file:///home/misstitank3/art/turbo/docs/accessibility-audit-checklist.md:0:0-0:0)**: Component validation checklist

---

## Usage Examples

### Setting a Preset

```tsx
import { usePresetControls } from '@/components/accessibility-theme-provider';

function PresetSelector() {
  const { setPreset, activePreset } = usePresetControls();

  return (
    <button onClick={() => setPreset('low-vision')}>
      Enable Low Vision Mode
    </button>
  );
}
```

### Overriding Individual Dimensions

```tsx
import { useDimensionControls } from '@/components/accessibility-theme-provider';

function Settings() {
  const { updateDimensions } = useDimensionControls();

  return (
    <button
      onClick={() =>
        updateDimensions({
          typographyReading: {
            fontScale: 'extra-large',
            lineHeight: 'loose',
          },
        })
      }
    >
      Increase Text Size
    </button>
  );
}
```

### Temporary Overrides (Session-Only)

```tsx
function EmergencyButton() {
  const { setTemporaryOverrides, clearTemporaryOverrides } = useDimensionControls();

  return (
    <button
      onClick={() =>
        setTemporaryOverrides({
          situationalEnvironmental: {
            emergencyMode: true,
          },
        })
      }
    >
      Enable Emergency Mode
    </button>
  );
}
```

### Conditional Rendering Based on Flags

```tsx
import { useBehavioralFlags } from '@/components/accessibility-theme-provider';

function AnimatedComponent() {
  const flags = useBehavioralFlags();

  return (
    <div>
      {flags.disableAnimations ? (
        <StaticVersion />
      ) : (
        <AnimatedVersion />
      )}
    </div>
  );
}
```

### Using Component Props

```tsx
import { useComponentProps } from '@/components/accessibility-theme-provider';

function TextBlock({ children }) {
  const props = useComponentProps();

  return (
    <div
      style={{
        fontFamily: props.fontFamily,
        maxWidth: props.maxLineLength || 'none',
        fontStyle: props.disableItalics ? 'normal' : undefined,
      }}
    >
      {children}
    </div>
  );
}
```

---

## Dimension Reference

### Color and Contrast

```typescript
{
  colorScheme: 'light' | 'dark' | 'dim-dark' | 'warm-bias' | 'cool-bias' | 'monochrome',
  contrastLevel: 'standard' | 'high' | 'ultra-high' | 'low',
  colorBlindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia',
  colorIndependentState: boolean, // NEVER use color alone
  forceBorders: boolean,
}
```

### Typography and Reading

```typescript
{
  fontScale: 'normal' | 'large' | 'extra-large' | 'maximum',
  dyslexiaFont: boolean,
  monospaceReading: boolean,
  lineHeight: 'normal' | 'relaxed' | 'loose',
  paragraphSpacing: 'normal' | 'increased' | 'double',
  maxLineLength: 'none' | 'standard' | 'reduced' | 'narrow',
  highCharacterDistinction: boolean,
  disableItalics: boolean,
  disableAllCaps: boolean,
  letterSpacing: number, // 0-0.2
  wordSpacing: number, // 0-0.5
}
```

### Motion and Animation

```typescript
{
  motionPreference: 'full' | 'reduced' | 'none',
  disableParallax: boolean,
  disableAutoPlay: boolean,
  instantTransitions: boolean,
  staticLoadingIndicators: boolean,
  textOnlyFeedback: boolean,
  maxAnimationDuration: number, // 0-5000ms
}
```

### Focus, Navigation, and Input

```typescript
{
  focusIndicatorSize: 'standard' | 'enhanced' | 'extra-large',
  alwaysShowFocus: boolean,
  keyboardFirstNavigation: boolean,
  screenReaderOptimized: boolean,
  switchNavigation: boolean,
  touchTargetSize: 'standard' | 'enlarged' | 'maximum',
  handedness: 'neutral' | 'left' | 'right',
  stickyPrimaryActions: boolean,
  sequentialNavigation: boolean,
  alwaysVisibleSkipLinks: boolean,
  increaseInteractiveSpacing: boolean,
}
```

### Cognitive

```typescript
{
  simpleLanguageMode: boolean,
  noJargonMode: boolean,
  disclosureMode: 'all-at-once' | 'progressive' | 'step-by-step',
  chunkedInformation: boolean,
  explicitStateLabels: boolean,
  confirmDestructiveActions: boolean, // Safety critical
  noSurpriseChanges: boolean, // Safety critical
  layoutConsistencyLock: boolean,
  decisionReductionMode: boolean,
  visualHierarchyBoost: boolean,
  alwaysShowProgress: boolean,
  universalUndo: boolean,
}
```

### Sensory Sensitivity

```typescript
{
  lowStimulationMode: boolean,
  visualDensity: 'normal' | 'reduced' | 'minimal',
  disableFlashing: boolean, // Safety critical (WCAG 2.3.1)
  disableHighFrequencyPatterns: boolean,
  calmIdleStates: boolean,
  alertTiming: 'immediate' | 'debounced' | 'rate-limited',
  disableAlertStacking: boolean,
  maxAlertsPerMinute: number, // 1-60
  disableAmbientSounds: boolean,
}
```

### Situational and Environmental

```typescript
{
  sunlightMode: boolean,
  nightMode: boolean,
  oneHandMode: boolean,
  glovesMode: boolean,
  offlineModeVisuals: boolean,
  lowBandwidthMode: boolean,
  batterySaverMode: boolean,
  emergencyMode: boolean,
  publicSpacePrivacy: boolean,
  quietMode: boolean, // Safety critical (never rely on sound)
}
```

---

## Available Presets

| Preset ID | WCAG Level | Description |
| ----------- | ------------ | ------------- |
| `default` | AA | System-aware defaults |
| `low-vision` | AAA | Large text, high contrast, enhanced focus |
| `photosensitive` | AAA | No flashing, reduced motion, calm interface |
| `dyslexia` | AAA | Optimized typography, increased spacing |
| `adhd-cognitive-load` | AAA | Minimal distractions, step-by-step guidance |
| `screen-reader-first` | AAA | Keyboard navigation, explicit labels |
| `elder-friendly` | AAA | Simple language, large controls, confirmations |
| `crisis-emergency` | AAA | Maximum readability, minimal interface |
| `outdoor-sunlight` | AAA | Maximum contrast for bright environments |
| `low-power-offline` | AA | Battery efficient, works offline |
| `public-shared-device` | AA | Privacy mode, clear actions |
| `motor-impairment` | AAA | Large targets, increased spacing, undo |
| `vestibular-disorders` | AAA | No motion, no parallax, calm interface |

---

## CSS Utility Classes

The system provides utility classes for common patterns:

```css
.a11y-typography          /* Apply base typography settings */
.a11y-scaled-text         /* Apply font scaling */
.a11y-constrained-width   /* Apply max line length */
.a11y-touch-target        /* Ensure minimum touch target size */
.a11y-focus-enhanced      /* Apply enhanced focus styles */
.a11y-no-motion           /* Disable all animations */
.a11y-reduced-motion      /* Reduce animation duration */
.a11y-sr-only             /* Screen reader only content */
.a11y-skip-link           /* Skip link styling */
.a11y-button              /* Accessible button base */
.a11y-input               /* Accessible input base */
.a11y-alert               /* Alert/notification styling */
```

---

## Conflict Resolution

When multiple sources specify the same dimension, priority order is:

1. **Temporary Overrides** (highest priority)
2. **User Overrides**
3. **Workspace Settings**
4. **Preset**
5. **System Defaults** (lowest priority)

Example:

```typescript
// If preset sets fontScale: 'large'
// And user sets fontScale: 'extra-large'
// Result: 'extra-large' (user override wins)
```

---

## Safety-Critical Dimensions

These dimensions protect user safety and must never be violated:

1. **`colorIndependentState`**: Never use color alone to convey information
2. **`disableFlashing`**: Never flash 3+ times per second (seizure risk)
3. **`confirmDestructiveActions`**: Always confirm destructive operations
4. **`noSurpriseChanges`**: Never surprise the user with unexpected changes
5. **`quietMode`**: Never rely on sound alone for feedback

---

## Testing Strategy

### 1. Preset Testing

Test each preset individually and in combination:

```bash
# Test with low-vision preset
# Test with low-vision + dyslexia combined
# Test with all extreme settings active
```

### 2. Dimension Validation

Use the validation function:

```typescript
import { validateDimensions } from '@/lib/accessibility-theme-engine';

const result = validateDimensions({
  typographyReading: {
    letterSpacing: 0.15,
  },
});

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

### 3. Component Auditing

Use the [accessibility audit checklist](cci:1://file:///home/misstitank3/art/turbo/docs/accessibility-audit-checklist.md:0:0-0:0) for each component.

### 4. Automated Testing

Run accessibility tests in your CI pipeline:

```bash
# Example with Playwright and axe-core
pnpm test:a11y
```

---

## Extending the System

### Adding a New Dimension

1. **Add type definition** in [types/accessibility-theme.ts](cci:1://file:///home/misstitank3/art/turbo/apps/web/types/accessibility-theme.ts:0:0-0:0)
2. **Add default value** in [config/accessibility-dimensions.ts](cci:1://file:///home/misstitank3/art/turbo/apps/web/config/accessibility-dimensions.ts:0:0-0:0)
3. **Update token generator** in [lib/accessibility-theme-engine.ts](cci:1://file:///home/misstitank3/art/turbo/apps/web/lib/accessibility-theme-engine.ts:0:0-0:0)
4. **Add CSS variables** in [app/accessibility-tokens.css](cci:1://file:///home/misstitank3/art/turbo/apps/web/app/accessibility-tokens.css:0:0-0:0)
5. **Update audit checklist** in [docs/accessibility-audit-checklist.md](cci:1://file:///home/misstitank3/art/turbo/docs/accessibility-audit-checklist.md:0:0-0:0)

### Adding a New Preset

Add to [config/accessibility-presets.ts](cci:1://file:///home/misstitank3/art/turbo/apps/web/config/accessibility-presets.ts:0:0-0:0):

```typescript
export const myCustomPreset: AccessibilityPreset = {
  id: 'my-custom-preset',
  name: 'My Custom Preset',
  description: 'Optimized for specific needs',
  wcagLevel: 'AA',
  allowOverrides: true,
  dimensions: {
    // Your dimension values
  },
};

// Add to registry
export const allPresets = {
  // ... existing presets
  'my-custom-preset': myCustomPreset,
};
```

---

## Performance Considerations

### Local Storage

Settings are persisted to `localStorage` automatically. Disable with:

```tsx
<AccessibilityThemeProvider disablePersistence={true}>
  {children}
</AccessibilityThemeProvider>
```

### CSS Token Updates

CSS tokens are applied via `style.setProperty()`. This triggers one repaint per update, not per token.

### Memoization

All token generation is memoized via `useMemo`. Updates only occur when settings change.

---

## WCAG 2.2 Compliance

This system supports:

- **WCAG 2.2 Level A**: All success criteria
- **WCAG 2.2 Level AA**: All success criteria
- **WCAG 2.2 Level AAA**: Many success criteria (where technically feasible)

Specific criteria addressed:

- **1.4.1** Use of Color (color independence)
- **1.4.3** Contrast Minimum (AA contrast ratios)
- **1.4.4** Resize Text (200% scaling)
- **1.4.6** Contrast Enhanced (AAA contrast ratios)
- **1.4.8** Visual Presentation (line spacing, line length, etc.)
- **1.4.11** Non-text Contrast (UI component contrast)
- **1.4.12** Text Spacing (user text spacing overrides)
- **2.2.2** Pause, Stop, Hide (motion controls)
- **2.3.1** Three Flashes or Below Threshold (flashing protection)
- **2.4.7** Focus Visible (enhanced focus indicators)
- **2.5.5** Target Size (touch target minimums)
- **3.3.4** Error Prevention (destructive action confirmations)

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

**Required Features:**

- CSS Custom Properties
- `matchMedia` API
- ES2020+ JavaScript

---

## Migration from Existing Systems

If you have an existing theme system:

1. Map your themes to presets
2. Identify which dimensions each theme controls
3. Create preset definitions with those mappings
4. Gradually adopt the provider in your component tree
5. Update components to use hooks instead of direct theme access

---

## Troubleshooting

### Settings Not Persisting

Check if `localStorage` is available and not blocked by browser settings.

### CSS Tokens Not Applying

Ensure [accessibility-tokens.css](cci:1://file:///home/misstitank3/art/turbo/apps/web/app/accessibility-tokens.css:0:0-0:0) is imported before other styles.

### Component Breaks with Extreme Settings

Use the [audit checklist](cci:1://file:///home/misstitank3/art/turbo/docs/accessibility-audit-checklist.md:0:0-0:0) to identify issues.

### Preset Not Loading

Verify preset ID matches exactly (case-sensitive).

---

## License

This implementation is provided as-is for use in your project.

---

## Support and Contributions

For issues, questions, or contributions, refer to your team's standard processes.

---

## Version History

- **v1.0** (2026-01-23): Initial implementation
  - Complete dimension system
  - 13 presets covering major use cases
  - React provider and hooks
  - CSS token system
  - Comprehensive audit checklist
