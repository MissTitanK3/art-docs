'use client';

import { Accessibility } from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '../components/ui/sheet';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  useAccessibilityTheme,
  useActiveDimensions,
} from '../providers/AccessibilityThemeProvider';
import type {
  PresetId,
  ContrastLevel,
  FontScale,
  MotionPreference,
  TouchTargetSize,
} from '../types/accessibility-theme';

const PRESET_OPTIONS: Array<{ id: PresetId; label: string }> = [
  { id: 'default', label: 'Default (System-Aware)' },
  { id: 'low-vision', label: 'Low Vision' },
  { id: 'photosensitive', label: 'Photosensitive' },
  { id: 'dyslexia', label: 'Dyslexia-Friendly' },
  { id: 'adhd-cognitive-load', label: 'ADHD / Reduced Cognitive Load' },
  { id: 'screen-reader-first', label: 'Screen Reader First' },
  { id: 'elder-friendly', label: 'Elder Friendly' },
  { id: 'crisis-emergency', label: 'Crisis / Emergency' },
  { id: 'outdoor-sunlight', label: 'Outdoor / Sunlight' },
  { id: 'low-power-offline', label: 'Low Power / Offline' },
  { id: 'public-shared-device', label: 'Public / Shared Device' },
  { id: 'motor-impairment', label: 'Motor Impairment' },
  { id: 'vestibular-disorders', label: 'Vestibular Disorders' },
];

const CONTRAST_OPTIONS: Array<{ value: ContrastLevel; label: string }> = [
  { value: 'standard', label: 'Standard (AA)' },
  { value: 'high', label: 'High (AAA)' },
  { value: 'ultra-high', label: 'Ultra High' },
  { value: 'low', label: 'Low (Light Sensitivity)' },
];

const FONT_SCALE_OPTIONS: Array<{ value: FontScale; label: string }> = [
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: '+25%' },
  { value: 'extra-large', label: '+50%' },
  { value: 'maximum', label: '+100%' },
];

const MOTION_OPTIONS: Array<{ value: MotionPreference; label: string }> = [
  { value: 'full', label: 'Full Motion' },
  { value: 'reduced', label: 'Reduced Motion' },
  { value: 'none', label: 'No Motion' },
];

const TOUCH_TARGET_OPTIONS: Array<{ value: TouchTargetSize; label: string }> = [
  { value: 'standard', label: 'Standard (44px)' },
  { value: 'enlarged', label: 'Enlarged (56px)' },
  { value: 'maximum', label: 'Maximum (72px)' },
];

export function AccessibilitySettingsSheet() {
  const { settings, setPreset, updateDimensions, resetToDefaults } = useAccessibilityTheme();
  const activeDimensions = useActiveDimensions();

  const currentPreset = settings.activePreset ?? 'custom';

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Accessibility settings"
        >
          <Accessibility className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col max-h-[100vh] overflow-hidden"
      >
        <SheetTitle>Accessibility Settings</SheetTitle>
        <SheetHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefaults}
              >
                Reset all
              </Button>
              <SheetDescription>
                Adjust presets and fine-tune motion, text, and control settings.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6 overflow-y-auto pr-1 flex-1">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Preset</label>
              <span className="text-xs text-muted-foreground">Applies a bundled profile</span>
            </div>
            <Select value={currentPreset} onValueChange={(value) => setPreset(value === 'custom' ? null : (value as PresetId))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom (no preset)</SelectItem>
                {PRESET_OPTIONS.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Contrast level</label>
              <span className="text-xs text-muted-foreground">Text and UI contrast</span>
            </div>
            <Select value={activeDimensions.colorContrast?.contrastLevel ?? 'standard'} onValueChange={(value) => updateDimensions({ colorContrast: { ...(activeDimensions.colorContrast ?? {}), contrastLevel: value as ContrastLevel } })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTRAST_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Font scale</label>
              <span className="text-xs text-muted-foreground">Base text size</span>
            </div>
            <Select value={activeDimensions.typographyReading?.fontScale ?? 'normal'} onValueChange={(value) => updateDimensions({ typographyReading: { ...(activeDimensions.typographyReading ?? {}), fontScale: value as FontScale } })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_SCALE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Motion preference</label>
              <span className="text-xs text-muted-foreground">Animation level</span>
            </div>
            <Select value={activeDimensions.motionAnimation?.motionPreference ?? 'full'} onValueChange={(value) => updateDimensions({ motionAnimation: { ...(activeDimensions.motionAnimation ?? {}), motionPreference: value as MotionPreference } })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOTION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Touch target size</label>
              <span className="text-xs text-muted-foreground">Minimum tap area</span>
            </div>
            <Select value={activeDimensions.focusNavigationInput?.touchTargetSize ?? 'standard'} onValueChange={(value) => updateDimensions({ focusNavigationInput: { ...(activeDimensions.focusNavigationInput ?? {}), touchTargetSize: value as TouchTargetSize } })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TOUCH_TARGET_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Force borders on interactive elements</p>
                <p className="text-xs text-muted-foreground">Helpful for low-contrast UIs</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={Boolean(activeDimensions.colorContrast?.forceBorders)}
                onChange={(e) =>
                  updateDimensions({
                    colorContrast: {
                      ...(activeDimensions.colorContrast ?? {}),
                      forceBorders: e.target.checked,
                    },
                  })
                }
                aria-label="Force borders on interactive elements"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Disable autoplay</p>
                <p className="text-xs text-muted-foreground">Stop videos/animations from auto-starting</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={Boolean(activeDimensions.motionAnimation?.disableAutoPlay)}
                onChange={(e) =>
                  updateDimensions({
                    motionAnimation: {
                      ...(activeDimensions.motionAnimation ?? {}),
                      disableAutoPlay: e.target.checked,
                    },
                  })
                }
                aria-label="Disable autoplay"
              />
            </div>
          </div>
        </div>

        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button variant="secondary" className="w-full sm:w-auto">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default AccessibilitySettingsSheet;
