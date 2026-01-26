# Accessibility-First Theme System

A production-ready, composable accessibility theme system for React/Next.js applications.

## 🎯 What This Is

A dimension-based accessibility system that allows users to combine multiple accessibility needs simultaneously without conflicts. Instead of fixed "themes," this system provides independent toggles (dimensions) that can be composed together, with presets built on top for common use cases.

## ✨ Key Features

- **🧩 Composable**: Any preset can combine with any other
- **♿ Comprehensive**: Visual, cognitive, motor, sensory, and situational needs
- **🛡️ Safe**: WCAG 2.2 AA/AAA compliant with safety-critical protections
- **⚡ Performant**: Memoized token generation, efficient updates
- **📱 Universal**: Web, PWA, and desktop (Tauri) compatible
- **🔒 Offline-First**: Works without network connectivity
- **🔧 Extensible**: Easy to add new dimensions and presets

## 📦 What's Included

- **630 lines** of TypeScript type definitions
- **13 presets** covering major accessibility needs
- **50+ dimensions** across 7 categories
- **40+ CSS utility classes**
- **10+ React hooks**
- **Complete documentation** with examples and audit checklist

## 🚀 Quick Start

### 1. Import CSS Tokens

In your root layout or globals.css:

```css
@import './accessibility-tokens.css';
```

### 2. Wrap Your App

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

### 3. Use in Components

```tsx
import { useBehavioralFlags, useComponentProps } from '@/components/accessibility-theme-provider';

function MyButton({ children, onClick }) {
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
      className="a11y-button"
    >
      {children}
    </button>
  );
}
```

## 📚 Documentation

- **[Implementation Guide](./ACCESSIBILITY_THEME_GUIDE.md)** - Complete API reference and usage examples
- **[Audit Checklist](./accessibility-audit-checklist.md)** - Component validation checklist
- **[Implementation Summary](./ACCESSIBILITY_IMPLEMENTATION_SUMMARY.md)** - What was built and why

## 🎨 Available Presets

| Preset | Description |
| ------ | ----------- |
| Low Vision | Large text, high contrast, enhanced focus |
| Photosensitive | No flashing, reduced motion, calm interface |
| Dyslexia | Optimized typography, increased spacing |
| ADHD/Cognitive | Minimal distractions, step-by-step guidance |
| Screen Reader | Keyboard navigation, explicit labels |
| Elder Friendly | Simple language, large controls, confirmations |
| Emergency | Maximum readability, minimal interface |
| Outdoor/Sunlight | Maximum contrast for bright environments |
| And more... | See [presets documentation](./ACCESSIBILITY_THEME_GUIDE.md#available-presets) |

## 🔧 Key Components

### File Structure

```text
apps/web/
├── types/
│   └── accessibility-theme.ts       # Complete TypeScript definitions
├── config/
│   ├── accessibility-dimensions.ts  # Default values and metadata
│   └── accessibility-presets.ts     # Preset definitions
├── lib/
│   └── accessibility-theme-engine.ts # Token generation logic
├── app/
│   └── accessibility-tokens.css     # CSS custom properties
└── components/
    ├── accessibility-theme-provider.tsx  # React provider & hooks
    └── accessibility-examples.tsx        # Example components

docs/
├── ACCESSIBILITY_THEME_GUIDE.md              # Complete implementation guide
├── accessibility-audit-checklist.md          # Component validation
└── ACCESSIBILITY_IMPLEMENTATION_SUMMARY.md   # What was built
```

## 💡 Examples

### Setting a Preset

```tsx
import { usePresetControls } from '@/components/accessibility-theme-provider';

function PresetSelector() {
  const { setPreset } = usePresetControls();
  return <button onClick={() => setPreset('low-vision')}>Low Vision Mode</button>;
}
```

### Overriding Dimensions

```tsx
import { useDimensionControls } from '@/components/accessibility-theme-provider';

function FontSizeControl() {
  const { updateDimensions } = useDimensionControls();
  return (
    <button
      onClick={() =>
        updateDimensions({
          typographyReading: { fontScale: 'extra-large' },
        })
      }
    >
      Increase Font Size
    </button>
  );
}
```

### Conditional Rendering

```tsx
import { useBehavioralFlags } from '@/components/accessibility-theme-provider';

function AnimatedComponent() {
  const { disableAnimations } = useBehavioralFlags();
  return disableAnimations ? <StaticVersion /> : <AnimatedVersion />;
}
```

## ♿ Accessibility Dimensions

The system supports 7 dimension categories:

1. **Color & Contrast**: Schemes, contrast levels, color-blind modes
2. **Typography & Reading**: Font scaling, dyslexia support, line spacing
3. **Motion & Animation**: Motion preferences, flashing protection
4. **Focus & Navigation**: Focus indicators, touch targets, keyboard navigation
5. **Cognitive**: Simple language, step-by-step disclosure, confirmations
6. **Sensory**: Visual density, alert management, calm states
7. **Situational**: Emergency mode, sunlight mode, battery saver

See [complete dimension reference](./ACCESSIBILITY_THEME_GUIDE.md#dimension-reference).

## 🧪 Testing

Use the [component audit checklist](./accessibility-audit-checklist.md) to validate components:

1. Color independence (never use color alone)
2. Font scaling (works at 200%)
3. Motion safety (no flashing, respects preferences)
4. Focus visibility (always visible when needed)
5. Touch targets (minimum 44px)
6. Keyboard navigation (fully accessible)
7. Screen reader support (proper ARIA)
8. Cognitive load (clear, step-by-step when needed)

## 📊 WCAG 2.2 Compliance

This system supports:

- ✅ **WCAG 2.2 Level A** - All success criteria
- ✅ **WCAG 2.2 Level AA** - All success criteria
- ✅ **WCAG 2.2 Level AAA** - Many success criteria

Key criteria addressed:

- 1.4.3 Contrast (Minimum)
- 1.4.6 Contrast (Enhanced)
- 1.4.8 Visual Presentation
- 2.2.2 Pause, Stop, Hide
- 2.3.1 Three Flashes or Below Threshold
- 2.4.7 Focus Visible
- 2.5.5 Target Size
- 3.3.4 Error Prevention

## 🔒 Safety-Critical Features

The system protects users through:

1. **Color Independence**: Never uses color alone to convey state
2. **Flashing Protection**: Prevents seizure-inducing content
3. **Destructive Action Confirmation**: Requires confirmation for dangerous actions
4. **No Surprise Changes**: Never redirects or changes layout unexpectedly
5. **Quiet Mode**: Never relies on sound alone for feedback

## 🛠️ Extending the System

### Add a New Dimension

1. Define type in `types/accessibility-theme.ts`
2. Add default in `config/accessibility-dimensions.ts`
3. Update generator in `lib/accessibility-theme-engine.ts`
4. Add CSS in `app/accessibility-tokens.css`

### Add a New Preset

Add to `config/accessibility-presets.ts`:

```typescript
export const myPreset: AccessibilityPreset = {
  id: 'my-preset',
  name: 'My Preset',
  description: 'Optimized for specific needs',
  wcagLevel: 'AA',
  allowOverrides: true,
  dimensions: {
    // Your dimension values
  },
};
```

## 📈 Performance

- **O(1)** preset lookup
- **Memoized** token generation
- **Single repaint** per update
- **Efficient** localStorage operations

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

As per project license.

## 🤝 Contributing

When adding new components:

1. Use the hooks provided
2. Run through the [audit checklist](./accessibility-audit-checklist.md)
3. Test with multiple presets
4. Document any limitations

## 📞 Support

- See [Implementation Guide](./ACCESSIBILITY_THEME_GUIDE.md) for detailed docs
- Check [Audit Checklist](./accessibility-audit-checklist.md) for testing
- Review [Example Components](../apps/web/components/accessibility-examples.tsx) for patterns

---

**Built with accessibility first. No user left behind.**
