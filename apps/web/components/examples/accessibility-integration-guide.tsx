'use client';

/**
 * Accessibility Integration Guide
 * 
 * This component demonstrates the 10 key patterns for using the accessibility theme system.
 * It serves as a reference guide for developers integrating accessibility features into components.
 * 
 * IMPORTANT: To use the actual hooks in your components, import from:
 * import { useAccessibilityTheme, useThemeTokens, useComponentProps } from '@repo/ui';
 */

export function AccessibilityIntegrationGuide() {
  return (
    <div className="a11y-typography" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Accessibility Theme Integration Patterns</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Pattern 1: Access Current Theme Settings</h2>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '0.5rem',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto'
        }}>
          {`const { settings, setPreset, updateDimensions } = useAccessibilityTheme();

// Access specific dimension
const colorContrast = settings.colorContrast?.level;

// Get active preset
const activePreset = settings.activePreset;`}
        </div>
        <p style={{ marginTop: '1rem' }}>
          <strong>Use Case:</strong> When you need to read the current accessibility settings to make component decisions.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Pattern 2: Switch Between Presets</h2>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '0.5rem',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto'
        }}>
          {`const { setPreset } = useAccessibilityTheme();

<button onClick={() => setPreset('lowVision')}>
  Switch to Low Vision Mode
</button>

<button onClick={() => setPreset('photosensitive')}>
  Switch to Photosensitive Mode
</button>`}
        </div>
        <p style={{ marginTop: '1rem' }}>
          <strong>Use Case:</strong> Quick access buttons to preset configurations for specific disabilities.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Pattern 3: Get Computed CSS Tokens</h2>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '0.5rem',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto'
        }}>
          {`const tokens = useThemeTokens();

// These are already computed CSS variable values
const fontSize = tokens.typography?.baseSize;
const lineHeight = tokens.typography?.lineHeight;
const buttonPadding = tokens.button?.padding;

// Use in component
<button style={{ 
  padding: buttonPadding,
  fontSize: fontSize 
}}>
  Click me
</button>`}
        </div>
        <p style={{ marginTop: '1rem' }}>
          <strong>Use Case:</strong> Access pre-computed design tokens to apply consistent spacing, sizing, and typography.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Pattern 4: Use Behavioral Flags</h2>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '0.5rem',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto'
        }}>
          {`const flags = useBehavioralFlags();

// Disable animations if user prefers reduced motion
const animationDuration = flags.reduceMotion ? '0ms' : '300ms';

// Use high contrast colors if needed
const borderColor = flags.highContrast ? '#000' : '#ccc';

// Increase touch targets for motor disabilities
const minTouchSize = flags.enlargeClickTargets ? '48px' : '32px';`}
        </div>
        <p style={{ marginTop: '1rem' }}>
          <strong>Use Case:</strong> Conditionally apply behavior changes based on accessibility flags.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Pattern 5: Get Component-Aware Props</h2>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '0.5rem',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto'
        }}>
          {`const props = useComponentProps();

// These are pre-computed props for common component types
<input
  type="text"
  aria-label={props.input?.ariaLabel}
  style={{
    fontSize: props.input?.fontSize,
    padding: props.input?.padding,
    borderWidth: props.input?.borderWidth,
  }}
/>

<button
  style={{
    minHeight: props.button?.minHeight,
    padding: props.button?.padding,
  }}
>
  Accessible Button
</button>`}
        </div>
        <p style={{ marginTop: '1rem' }}>
          <strong>Use Case:</strong> Get pre-validated component props that are already accessibility-aware.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Pattern 6: Create a Custom Dimension Control</h2>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '0.5rem',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto'
        }}>
          {`const { updateDimensions } = useAccessibilityTheme();

// Update a single dimension
const handleContrastChange = (level) => {
  updateDimensions({
    colorContrast: { level }
  });
};

// Update multiple dimensions at once
const handleMultiUpdate = () => {
  updateDimensions({
    colorContrast: { level: 'AAA' },
    typographyReading: { fontFamily: 'dyslexia-friendly' },
    temporalMotion: { reduceMotion: true }
  });
};`}
        </div>
        <p style={{ marginTop: '1rem' }}>
          <strong>Use Case:</strong> Build custom controls for individual users to fine-tune their accessibility settings.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Pattern 7: Build a Settings Panel</h2>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '0.5rem',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto'
        }}>
          {`export function AccessibilitySettings() {
  const { settings, updateDimensions, setPreset } = useAccessibilityTheme();
  
  return (
    <div>
      <h3>Accessibility Settings</h3>
      
      <div>
        <label>Preset:</label>
        <select value={settings.activePreset || ''} 
                onChange={(e) => setPreset(e.target.value || null)}>
          <option value="">Custom</option>
          <option value="lowVision">Low Vision</option>
          <option value="photosensitive">Photosensitive</option>
          <option value="dyslexia">Dyslexia-Friendly</option>
        </select>
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.temporalMotion?.reduceMotion}
            onChange={(e) => updateDimensions({
              temporalMotion: { reduceMotion: e.target.checked }
            })}
          />
          Reduce Motion
        </label>
      </div>
    </div>
  );
}`}
        </div>
        <p style={{ marginTop: '1rem' }}>
          <strong>Use Case:</strong> Create a comprehensive settings UI where users can customize their preferences.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Pattern 8: Apply Dimensions to Typography</h2>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '0.5rem',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto'
        }}>
          {`const tokens = useThemeTokens();

export function AccessibleHeading({ children }) {
  return (
    <h2 style={{
      fontSize: tokens.typography?.largeSize,
      fontFamily: tokens.typography?.fontFamily,
      lineHeight: tokens.typography?.lineHeight,
      fontWeight: 600,
      marginBottom: tokens.spacing?.large,
    }}>
      {children}
    </h2>
  );
}

export function AccessibleBody({ children }) {
  return (
    <p style={{
      fontSize: tokens.typography?.baseSize,
      fontFamily: tokens.typography?.fontFamily,
      lineHeight: tokens.typography?.lineHeight,
      maxWidth: tokens.typography?.maxLineLength,
      marginBottom: tokens.spacing?.medium,
    }}>
      {children}
    </p>
  );
}`}
        </div>
        <p style={{ marginTop: '1rem' }}>
          <strong>Use Case:</strong> Consistently apply typography settings across text components.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Pattern 9: Detect System Preferences</h2>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '0.5rem',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto'
        }}>
          {`// This is automatically detected during provider initialization
// Access via useAccessibilityTheme().settings

const { settings } = useAccessibilityTheme();

// System detection fills these on first load:
// - reduceMotion (from prefers-reduced-motion)
// - prefersLightMode/prefersDarkMode (from prefers-color-scheme)
// - screenReaderActive (best effort detection)

// Use these to initialize defaults
if (settings.temporalMotion?.reduceMotion) {
  // User system-wide prefers reduced motion
}`}
        </div>
        <p style={{ marginTop: '1rem' }}>
          <strong>Use Case:</strong> Respect operating system accessibility settings on first load.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Pattern 10: Persist Preferences</h2>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '0.5rem',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto'
        }}>
          {`// The AccessibilityThemeProvider automatically handles persistence!
// No additional code needed.

// Settings are stored in localStorage under 'accessibility-theme-v1'
// Format: { version: 1, dimensions: {...}, activePreset: '...' }

// Settings are automatically loaded on page reload
// Settings sync across browser tabs in real-time

// To manually clear settings:
// localStorage.removeItem('accessibility-theme-v1');`}
        </div>
        <p style={{ marginTop: '1rem' }}>
          <strong>Use Case:</strong> User preferences persist across sessions and browser windows automatically.
        </p>
      </section>

      <section style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#e8f5e9', borderRadius: '0.5rem' }}>
        <h2>Quick Integration Steps</h2>
        <ol style={{ marginLeft: '1.5rem' }}>
          <li>Import hooks from the provider component</li>
          <li>Call hooks in your component</li>
          <li>Apply tokens to your JSX styles</li>
          <li>Use behavioral flags for conditional rendering</li>
          <li>Settings persist automatically!</li>
        </ol>
      </section>
    </div>
  );
}

export default AccessibilityIntegrationGuide;
