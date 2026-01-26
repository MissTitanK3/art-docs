# Accessibility Theme System - Component Audit Checklist

## Purpose

This checklist ensures that components are compatible with the accessibility theme system and can handle extreme dimension combinations without breaking.

## How to Use

1. For each new component, go through this checklist
2. Test the component with multiple presets active
3. Document any limitations or special handling required
4. Update components that fail any critical checks

---

## 1. Color and Contrast Compliance

### Critical Checks

- [ ] **Color Independence**: Component never uses color alone to convey state, information, or action
  - All states have non-color indicators (icons, text labels, patterns, borders)
  - Error states include text description, not just red color
  - Success states include confirmation text, not just green color
  - Interactive states are distinguishable without color

- [ ] **Contrast Ratios**: Component maintains WCAG AA contrast in all color schemes
  - Text has minimum 4.5:1 contrast ratio (normal text)
  - Large text (18pt+ or 14pt+ bold) has minimum 3:1 contrast
  - UI components (borders, icons) have minimum 3:1 contrast
  - Test in: light, dark, monochrome, high-contrast, ultra-high-contrast modes

- [ ] **Forced Borders**: Component remains usable when `forceBorders` is enabled
  - All interactive elements have visible borders
  - Borders don't cause layout shifts or overflow
  - Border colors meet contrast requirements

### Test Combinations

- [ ] Ultra-high contrast + monochrome
- [ ] Low contrast + warm bias (light sensitivity)
- [ ] Color-blind modes (deuteranopia, protanopia, tritanopia)

---

## 2. Typography and Reading Support

### Critical Checks T&S

- [ ] **Font Scaling**: Component remains functional at 200% font scale
  - No text truncation or overlap
  - No horizontal scrolling (unless intentional)
  - Touch targets remain accessible
  - Layout doesn't break

- [ ] **Font Substitution**: Component works with dyslexia-friendly and monospace fonts
  - No hardcoded font families that override system settings
  - No reliance on specific font metrics for layout
  - Line height adjustments don't break layout

- [ ] **Text Transforms**: Component respects `disableItalics` and `disableAllCaps`
  - No critical information conveyed only through italics
  - No `text-transform: uppercase` on user-facing text without fallback
  - Emphasis uses alternatives (bold, underline, color + pattern)

- [ ] **Line Length**: Component respects `maxLineLength` constraint
  - Long-form text doesn't exceed configured maximum
  - Appropriate for readability (45-80 characters)
  - Doesn't force narrow widths on non-text content

### Test Combinations T&S

- [ ] Maximum font scale + dyslexia font
- [ ] Maximum font scale + loose line height + double paragraph spacing
- [ ] Narrow line length + high character distinction + increased spacing

---

## 3. Motion and Animation Safety

### Critical Checks M&A

- [ ] **Motion Preference**: Component respects all motion levels (full/reduced/none)
  - Animations disabled when `motionPreference: 'none'`
  - Animations shortened when `motionPreference: 'reduced'`
  - Instant transitions when `instantTransitions: true`
  - No layout shift when animations are disabled

- [ ] **No Flashing**: Component NEVER flashes more than 3 times per second
  - No strobe effects
  - No rapidly alternating colors
  - Alert animations respect `disableFlashing`
  - This is a **safety-critical requirement** (WCAG 2.3.1)

- [ ] **Parallax and Auto-play**: Component respects related flags
  - Parallax disabled when `disableParallax: true`
  - No auto-playing content when `disableAutoPlay: true`
  - Videos/carousels have manual controls

- [ ] **Static Alternatives**: Component provides static alternatives
  - Loading indicators work as static when required
  - Progress is shown via text, not only animation
  - State changes are announced for screen readers

### Test Combinations M&A

- [ ] Motion preference: none + instant transitions
- [ ] Photosensitive preset (no motion, no flashing, calm mode)
- [ ] Battery saver mode (animations off, reduced repaints)

---

## 4. Focus, Navigation, and Input

### Critical Checks FNI

- [ ] **Focus Indicators**: Component has visible focus states
  - Focus indicators scale with `focusIndicatorSize`
  - Focus indicators always visible when `alwaysShowFocus: true`
  - Focus order is logical and predictable
  - Focus is never trapped without escape mechanism

- [ ] **Touch Targets**: Component meets minimum touch target size
  - Interactive elements meet `touchTargetSize` minimum
  - Touch targets at 44px (standard), 56px (enlarged), or 72px (maximum)
  - Adequate spacing between targets (respects `increaseInteractiveSpacing`)
  - No overlapping touch areas

- [ ] **Keyboard Navigation**: Component is fully keyboard accessible
  - All interactive elements reachable via Tab
  - Logical tab order (matches visual order)
  - Custom keyboard shortcuts don't conflict with browser/screen reader
  - Keyboard shortcuts documented and remappable

- [ ] **Screen Reader Support**: Component provides proper ARIA
  - Meaningful labels on all interactive elements
  - Dynamic content changes announced (aria-live)
  - State changes communicated (aria-pressed, aria-expanded, etc.)
  - Images have alt text; decorative images use alt=""

- [ ] **Skip Links**: Component supports skip link navigation
  - Skip links visible when `alwaysVisibleSkipLinks: true`
  - Landmark regions properly defined (nav, main, aside, etc.)
  - Heading hierarchy is logical (no skipped levels)

### Test Combinations FNI

- [ ] Extra-large focus + enlarged touch targets + increased spacing
- [ ] Screen reader optimized + keyboard first + sequential navigation
- [ ] Switch navigation mode (single input device)

---

## 5. Cognitive Load and Comprehension

### Critical Checks CLC

- [ ] **Simple Language**: Component supports simple language mode
  - Can replace jargon with plain terms when `noJargonMode: true`
  - Explanations available for complex concepts
  - Instructions are clear and concise

- [ ] **Disclosure Mode**: Component respects information disclosure patterns
  - Supports "all-at-once", "progressive", and "step-by-step" modes
  - Multi-step processes adapt to user's cognitive preference
  - Progress indicators shown when `alwaysShowProgress: true`

- [ ] **Explicit Labels**: Component shows explicit state labels
  - Not just icons when `explicitStateLabels: true`
  - Button purposes are clear ("Submit Form" not just "Submit")
  - Loaded/loading/error states explicitly labeled

- [ ] **Confirmations**: Component confirms destructive actions
  - Delete/remove actions require confirmation when `confirmDestructiveActions: true`
  - Confirmation dialogs are clear and actionable
  - "Are you sure?" with clear Yes/No or Cancel options

- [ ] **No Surprises**: Component avoids unexpected changes
  - No auto-redirects without warning
  - No surprise modals or popups
  - Layout remains stable (`layoutConsistencyLock`)
  - Changes are user-initiated

- [ ] **Undo Support**: Component provides undo when possible
  - Reversible actions have undo mechanism
  - Recent actions can be undone
  - Undo timeframe is reasonable (not just 1 second)

### Test Combinations CLC

- [ ] ADHD/Cognitive Load preset (step-by-step + minimal + explicit labels)
- [ ] Elder Friendly preset (simple language + confirmations + undo)
- [ ] Decision reduction mode + visual hierarchy boost

---

## 6. Sensory Sensitivity

### Critical Checks SenSen

- [ ] **Visual Density**: Component adapts to density preferences
  - Respects `visualDensity: 'minimal'` with increased spacing
  - No information overload in low stimulation mode
  - Whitespace scales with density multiplier

- [ ] **Alert Management**: Component respects alert timing
  - Alerts respect `alertTiming` (immediate/debounced/rate-limited)
  - Only one alert shown when `disableAlertStacking: true`
  - Respects `maxAlertsPerMinute` limit
  - No notification spam

- [ ] **Calm Interface**: Component provides calm states
  - No pulsing/breathing animations in idle when `calmIdleStates: true`
  - No attention-seeking animations in low stimulation mode
  - Decorative animations can be disabled

- [ ] **Pattern Safety**: Component avoids high-frequency patterns
  - No striped patterns when `disableHighFrequencyPatterns: true`
  - No checkerboards or dense grids in sensory modes
  - Background patterns can be disabled

### Test Combinations SenSen

- [ ] Low stimulation + minimal density + calm states
- [ ] Photosensitive preset (all sensory protections active)
- [ ] Rate-limited alerts + no stacking + minimal density

---

## 7. Situational and Environmental

### Critical Checks S&E

- [ ] **Emergency Mode**: Component supports critical-use scenarios
  - Only essential features shown in emergency mode
  - Maximum readability (large text, high contrast, no decorations)
  - Actions are direct (no multi-step processes)
  - No non-essential animations or delays

- [ ] **Sunlight Mode**: Component is readable in bright environments
  - Maximum contrast for outdoor use
  - No subtle shades that disappear in sunlight
  - Borders and separators are strong

- [ ] **Low Bandwidth**: Component works with reduced assets
  - Decorative images can be hidden
  - Essential images have low-res fallbacks
  - No auto-loading of heavy content
  - Works offline when applicable

- [ ] **Privacy Mode**: Component protects user information
  - Content blurred or reduced in public space mode
  - Sensitive information masked by default
  - Easy toggle between private and normal mode

- [ ] **Battery Saver**: Component minimizes resource use
  - Reduced repaints when `batterySaverMode: true`
  - Animations off to save battery
  - Polling intervals increased
  - Heavy computations deferred

### Test Combinations S&E

- [ ] Emergency mode (all extremes active)
- [ ] Outdoor + sunlight mode
- [ ] Low bandwidth + battery saver + offline visuals

---

## 8. Cross-Cutting Concerns

### Critical Checks CCC

- [ ] **Multiple Presets**: Component works when multiple presets combine
  - Test any two presets together (e.g., low-vision + dyslexia)
  - No conflicts between dimension settings
  - Graceful degradation if conflicts occur
  - Priority system respected

- [ ] **Extreme Settings**: Component doesn't break under extreme values
  - 200% font scale + maximum touch targets + double spacing
  - Instant transitions (0ms) + static indicators
  - Ultra-high contrast + monochrome + forced borders
  - Minimal density + step-by-step + calm mode

- [ ] **Responsive Behavior**: Component adapts to viewport changes
  - Works on mobile, tablet, desktop
  - Touch targets appropriate for device
  - Layout doesn't break when resizing
  - Consistent behavior across breakpoints

- [ ] **Print Styles**: Component has appropriate print behavior
  - High contrast in print
  - No animations in print
  - Essential information visible
  - Unnecessary elements hidden with `.a11y-no-print`

---

## 9. Testing Procedure

### Manual Testing Steps

1. **Preset Testing**
   - [ ] Test component with each preset individually
   - [ ] Test component with 2-3 presets combined
   - [ ] Document any breaking combinations

2. **Dimension Testing**
   - [ ] Enable extreme values for each dimension category
   - [ ] Test all combinations of critical dimensions
   - [ ] Verify no visual overflow or layout breaks

3. **Device Testing**
   - [ ] Test on desktop (keyboard + mouse)
   - [ ] Test on mobile (touch)
   - [ ] Test on tablet (hybrid)
   - [ ] Test with screen reader (NVDA, JAWS, VoiceOver)

4. **Browser Testing**
   - [ ] Chrome/Edge
   - [ ] Firefox
   - [ ] Safari
   - [ ] Test with browser zoom (200%, 400%)

### Automated Testing

- [ ] Component has unit tests for dimension variations
- [ ] Component has integration tests with presets
- [ ] Visual regression tests capture dimension changes
- [ ] Accessibility tests run in CI (axe, pa11y, etc.)

---

## 10. Documentation Requirements

### Required Documentation

- [ ] **Dimension Support Matrix**
  - List all supported dimensions
  - Note any limitations or special behaviors
  - Document workarounds for unsupported cases

- [ ] **WCAG Conformance**
  - Document WCAG level (A, AA, AAA)
  - List relevant success criteria
  - Note any exceptions or partial conformance

- [ ] **Usage Examples**
  - Show component with different presets
  - Demonstrate dimension overrides
  - Include edge cases

- [ ] **Known Issues**
  - Document any known accessibility issues
  - Provide workarounds when available
  - Link to tracking issues for fixes

---

## Sign-Off

### Component Name: ____________________

### Reviewer: ____________________

### Date: ____________________

### WCAG Level Achieved: [ ] A  [ ] AA  [ ] AAA

### Critical Issues Found: ____________________

### Issues Resolved: [ ] Yes  [ ] No  [ ] Partially

### Approved for Production: [ ] Yes  [ ] No

---

## Quick Reference: Safety-Critical Dimensions

These dimensions must NEVER be violated:

1. ✅ `colorIndependentState` - Never use color alone
2. ✅ `disableFlashing` - Never flash 3+ times per second
3. ✅ `confirmDestructiveActions` - Always confirm destructive actions
4. ✅ `noSurpriseChanges` - Never surprise the user
5. ✅ `quietMode` - Never rely on sound alone

Violating these can cause:

- Confusion or data loss (color dependence)
- Seizures (flashing)
- Accidental destructive actions
- Disorientation (surprise changes)
- Inaccessibility (sound reliance)

---

## Resources

- **WCAG 2.2 Guidelines**: <https://www.w3.org/WAI/WCAG22/quickref/>
- **ARIA Authoring Practices**: <https://www.w3.org/WAI/ARIA/apg/>
- **Color Contrast Checker**: <https://webaim.org/resources/contrastchecker/>
- **Screen Reader Testing**: <https://www.accessibility-developer-guide.com/>

---

## Revision History

- v1.0 (2026-01-23): Initial checklist created
