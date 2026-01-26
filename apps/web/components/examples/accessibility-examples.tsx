/* eslint-disable react/prop-types */
'use client';

/**
 * Accessibility Theme Example Components
 * 
 * Demonstrates how to use the accessibility theme system with real components.
 * Shows multiple dimensions active simultaneously without conflicts.
 * 
 * NOTE: This file contains example code for features not yet implemented.
 * Many of the imported hooks and components are placeholders for future development.
 */

import React, { useState } from 'react';
import Link from 'next/link';
// import {
//   useBehavioralFlags,
//   useComponentProps,
//   usePresetControls,
//   useDimensionControls,
//   ScreenReaderOnly,
//   SkipLink,
//   ConditionalMotion,
// } from '@repo/ui';
import type { PresetId } from '@repo/ui';

// Temporary stubs for unimplemented features
const useBehavioralFlags = () => ({
  disableAnimations: false,
  disableTransitions: false,
  keyboardFirstMode: false,
  screenReaderMode: false,
  simpleLanguage: false,
  disableFlashing: true,
  emergencyMode: false,
  confirmDestructive: true,
  explicitLabels: false,
  showProgress: false,
});

const useComponentProps = () => ({
  fontFamily: 'system-ui, sans-serif',
  disableItalics: false,
  disableAllCaps: false,
  touchTargetMinSize: 44,
  focusIndicatorWidth: 2,
  transitionDuration: 150,
  animationDuration: 300,
  alertDelay: 0,
  maxLineLength: '80ch',
  disclosureMode: 'all-at-once' as 'all-at-once' | 'progressive' | 'step-by-step',
});

const usePresetControls = () => ({
  activePreset: null as PresetId | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setPreset: (_preset: PresetId | null) => { },
});

const useDimensionControls = () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  updateDimensions: (_dims: any) => { },
});

const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

const SkipLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} className="sr-only focus:not-sr-only">{children}</a>
);

const ConditionalMotion: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

// ============================================================================
// EXAMPLE 1: Button Component with Full Accessibility Support
// ============================================================================

interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
}

export function AccessibleButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
}: AccessibleButtonProps) {
  const flags = useBehavioralFlags();
  const props = useComponentProps();

  // Confirm destructive actions if flag is set
  const handleClick = () => {
    if (variant === 'destructive' && flags.confirmDestructive) {
      const confirmed = window.confirm('Are you sure you want to perform this action?');
      if (!confirmed) return;
    }
    onClick?.();
  };

  const buttonClass = `a11y-button a11y-touch-target ${variant === 'destructive' ? 'destructive' : ''}`;

  return (
    <button
      type="button"
      className={buttonClass}
      onClick={handleClick}
      disabled={disabled || loading}
      style={{
        fontFamily: props.fontFamily,
        minWidth: props.touchTargetMinSize,
        minHeight: props.touchTargetMinSize,
        transition: flags.disableTransitions ? 'none' : undefined,
      }}
      aria-busy={loading}
      aria-disabled={disabled}
    >
      {loading && (
        <>
          <ConditionalMotion fallback={<span aria-hidden="true">...</span>}>
            <span className="spinner" aria-hidden="true" />
          </ConditionalMotion>
          <ScreenReaderOnly>Loading...</ScreenReaderOnly>
        </>
      )}
      {children}
    </button>
  );
}

// ============================================================================
// EXAMPLE 2: Alert Component with Sensory Sensitivity Support
// ============================================================================

interface AccessibleAlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function AccessibleAlert({
  type,
  title,
  children,
  onDismiss,
  autoClose = false,
  autoCloseDelay = 5000,
}: AccessibleAlertProps) {
  const [dismissed, setDismissed] = useState(false);
  const flags = useBehavioralFlags();
  const props = useComponentProps();

  React.useEffect(() => {
    if (!autoClose || dismissed) return;

    // Respect alert timing preference
    const delay = Math.max(autoCloseDelay, props.alertDelay);
    const timer = setTimeout(() => {
      setDismissed(true);
      onDismiss?.();
    }, delay);

    return () => clearTimeout(timer);
  }, [autoClose, dismissed, autoCloseDelay, props.alertDelay, onDismiss]);

  if (dismissed) return null;

  // ARIA role based on type
  const role = type === 'error' ? 'alert' : 'status';
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

  // Never use color alone - include icon text
  const iconText = {
    info: 'ℹ️ Info',
    success: '✓ Success',
    warning: '⚠ Warning',
    error: '✗ Error',
  }[type];

  return (
    <div
      role={role}
      aria-live={ariaLive}
      className={`a11y-alert a11y-alert-${type}`}
      style={{
        fontFamily: props.fontFamily,
        transition: flags.disableTransitions ? 'none' : undefined,
      }}
    >
      <div className="alert-header">
        <span aria-label={iconText}>
          {flags.explicitLabels && <strong>{iconText}: </strong>}
        </span>
        {title && <strong>{title}</strong>}
      </div>
      <div className="alert-content">{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            onDismiss();
          }}
          className="a11y-button"
          aria-label="Dismiss alert"
        >
          <span aria-hidden="true">×</span>
          {flags.explicitLabels && <span>Dismiss</span>}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Form Input with Typography and Focus Support
// ============================================================================

interface AccessibleInputProps {
  label: string;
  id: string;
  type?: 'text' | 'email' | 'password' | 'number';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helpText?: string;
  required?: boolean;
}

export function AccessibleInput({
  label,
  id,
  type = 'text',
  value,
  onChange,
  error,
  helpText,
  required = false,
}: AccessibleInputProps) {
  const flags = useBehavioralFlags();
  const props = useComponentProps();

  const helpTextId = helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpTextId, errorId].filter(Boolean).join(' ');

  return (
    <div className="form-field">
      <label
        htmlFor={id}
        style={{
          fontFamily: props.fontFamily,
          fontStyle: props.disableItalics ? 'normal' : undefined,
        }}
      >
        {label}
        {required && (
          <>
            <span aria-hidden="true"> *</span>
            <ScreenReaderOnly>(required)</ScreenReaderOnly>
          </>
        )}
      </label>

      {helpText && (
        <div
          id={helpTextId}
          className="help-text"
          style={{
            fontFamily: props.fontFamily,
            maxWidth: props.maxLineLength || undefined,
          }}
        >
          {helpText}
        </div>
      )}

      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="a11y-input a11y-focus-enhanced"
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : undefined}
        aria-required={required}
        required={required}
        style={{
          fontFamily: props.fontFamily,
          minHeight: props.touchTargetMinSize,
          transition: flags.disableTransitions ? 'none' : undefined,
        }}
      />

      {error && (
        <div
          id={errorId}
          role="alert"
          className="error-text"
          style={{ fontFamily: props.fontFamily }}
        >
          {flags.explicitLabels && <strong>Error: </strong>}
          {error}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Preset Selector UI
// ============================================================================

export function PresetSelector() {
  const { activePreset, setPreset } = usePresetControls();
  const flags = useBehavioralFlags();

  const presets: { id: PresetId; name: string; description: string }[] = [
    { id: 'default', name: 'Default', description: 'System preferences' },
    { id: 'low-vision', name: 'Low Vision', description: 'Large text, high contrast' },
    { id: 'photosensitive', name: 'Photosensitive', description: 'No flashing or motion' },
    { id: 'dyslexia', name: 'Dyslexia', description: 'Optimized typography' },
    { id: 'adhd-cognitive-load', name: 'ADHD/Cognitive', description: 'Reduced distractions' },
    { id: 'screen-reader-first', name: 'Screen Reader', description: 'Keyboard navigation' },
    { id: 'elder-friendly', name: 'Elder Friendly', description: 'Simple, large interface' },
    { id: 'crisis-emergency', name: 'Emergency', description: 'Critical information only' },
  ];

  return (
    <div className="preset-selector" role="group" aria-labelledby="preset-selector-label">
      <h2 id="preset-selector-label">Accessibility Presets</h2>

      {flags.showProgress && activePreset && (
        <div role="status" aria-live="polite">
          Current preset: <strong>{activePreset}</strong>
        </div>
      )}

      <div className="preset-grid">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => setPreset(preset.id)}
            className={`preset-card a11y-button ${activePreset === preset.id ? 'active' : ''
              }`}
            aria-pressed={activePreset === preset.id}
            style={{ transition: flags.disableTransitions ? 'none' : undefined }}
          >
            <div className="preset-name">{preset.name}</div>
            <div className="preset-description">{preset.description}</div>
            {activePreset === preset.id && <ScreenReaderOnly>(Currently active)</ScreenReaderOnly>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Multi-Step Form with Disclosure Mode Support
// ============================================================================

interface StepProps {
  title: string;
  children: React.ReactNode;
  stepNumber: number;
  totalSteps: number;
}

function FormStep({ title, children, stepNumber, totalSteps }: StepProps) {
  const props = useComponentProps();
  const flags = useBehavioralFlags();

  return (
    <div className="form-step" role="group" aria-labelledby={`step-${stepNumber}-title`}>
      <h3 id={`step-${stepNumber}-title`}>
        {flags.showProgress && (
          <span className="step-indicator">
            Step {stepNumber} of {totalSteps}:{' '}
          </span>
        )}
        {title}
      </h3>
      <div style={{ maxWidth: props.maxLineLength || undefined }}>{children}</div>
    </div>
  );
}

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const props = useComponentProps();
  const flags = useBehavioralFlags();
  const { updateDimensions } = useDimensionControls();

  const totalSteps = 3;

  // Respect disclosure mode
  const showAllSteps = props.disclosureMode === 'all-at-once';
  const showProgressiveSteps = props.disclosureMode === 'progressive';
  const showStepByStep = props.disclosureMode === 'step-by-step';

  const renderStep = (step: number) => {
    if (showStepByStep && step !== currentStep) return null;
    if (showProgressiveSteps && step > currentStep) return null;

    switch (step) {
      case 1:
        return (
          <FormStep title="Personal Information" stepNumber={1} totalSteps={totalSteps}>
            <AccessibleInput
              label="Name"
              id="name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              required
            />
          </FormStep>
        );
      case 2:
        return (
          <FormStep title="Contact Details" stepNumber={2} totalSteps={totalSteps}>
            <AccessibleInput
              label="Email"
              id="email"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              required
            />
          </FormStep>
        );
      case 3:
        return (
          <FormStep title="Your Message" stepNumber={3} totalSteps={totalSteps}>
            <AccessibleInput
              label="Message"
              id="message"
              value={formData.message}
              onChange={(value) => setFormData({ ...formData, message: value })}
              required
            />
          </FormStep>
        );
      default:
        return null;
    }
  };

  return (
    <div className="multi-step-form">
      <SkipLink href="#form-actions">Skip to form actions</SkipLink>

      {flags.showProgress && (
        <div
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label="Form progress"
          className="progress-bar"
        >
          <div
            className="progress-fill"
            style={{
              width: `${(currentStep / totalSteps) * 100}%`,
              transition: flags.disableTransitions ? 'none' : undefined,
            }}
          />
          <ScreenReaderOnly>
            Step {currentStep} of {totalSteps}
          </ScreenReaderOnly>
        </div>
      )}

      <form>
        {showAllSteps ? (
          <>
            {renderStep(1)}
            {renderStep(2)}
            {renderStep(3)}
          </>
        ) : (
          renderStep(currentStep)
        )}

        <div id="form-actions" className="form-actions a11y-interactive-group">
          {currentStep > 1 && !showAllSteps && (
            <AccessibleButton onClick={() => setCurrentStep(currentStep - 1)}>
              Previous
            </AccessibleButton>
          )}

          {currentStep < totalSteps && !showAllSteps && (
            <AccessibleButton onClick={() => setCurrentStep(currentStep + 1)}>
              Next
            </AccessibleButton>
          )}

          {(currentStep === totalSteps || showAllSteps) && (
            <AccessibleButton variant="primary" onClick={() => alert('Form submitted!')}>
              Submit
            </AccessibleButton>
          )}
        </div>
      </form>

      {/* Example: Temporary override toggle */}
      <div className="developer-controls" style={{ marginTop: '2rem', padding: '1rem', border: '1px dashed' }}>
        <h4>Developer Controls (Example)</h4>
        <button
          type="button"
          onClick={() =>
            updateDimensions({
              cognitive: {
                simpleLanguageMode: true,
                noJargonMode: true,
                disclosureMode: 'step-by-step',
                chunkedInformation: true,
                explicitStateLabels: true,
                confirmDestructiveActions: true,
                noSurpriseChanges: true,
                layoutConsistencyLock: false,
                decisionReductionMode: true,
                visualHierarchyBoost: true,
                alwaysShowProgress: true,
                universalUndo: true,
              },
            })
          }
        >
          Enable Cognitive Support
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Full Page Layout with Skip Links
// ============================================================================

export function AccessiblePageLayout({ children }: { children: React.ReactNode }) {
  const flags = useBehavioralFlags();

  return (
    <>
      {/* Skip links always at the top */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#main-navigation">Skip to navigation</SkipLink>

      <div className="page-layout">
        <nav id="main-navigation" aria-label="Main navigation">
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/settings">Settings</Link></li>
          </ul>
        </nav>

        <main
          id="main-content"
          className="a11y-typography a11y-constrained-width"
          aria-label="Main content"
        >
          {children}
        </main>

        {flags.emergencyMode && (
          <aside role="complementary" aria-label="Emergency help">
            <AccessibleAlert type="info" title="Emergency Mode Active">
              Interface simplified. Only essential features are shown.
            </AccessibleAlert>
          </aside>
        )}
      </div>
    </>
  );
}
