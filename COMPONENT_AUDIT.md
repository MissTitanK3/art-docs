# Component Audit: apps/web/components

**Date:** January 26, 2026  
**Objective:** Identify components that should be moved to `packages/ui` for reusability across the monorepo.

---

## Current State

### In `apps/web/components/`

- **UI Components (shadcn):** `ui/` folder with 8 components
  - `button.tsx`
  - `card.tsx`
  - `drawer.tsx`
  - `input.tsx`
  - `popover.tsx`
  - `select.tsx`
  - `sheet.tsx`
  - `sonner.tsx` (toast provider)

- **App-Specific Components:** 15 files
  - Form components
  - Providers
  - Feature-specific components

### In `packages/ui/src/components/ui/`

- Currently only: `button.tsx`, `card.tsx`, `index.ts`
- Intended as shared UI library

---

## Audit Results & Recommendations

### ✅ MOVE to `packages/ui` (Shared UI Components)

These are generic, reusable UI primitives that should be available across the entire monorepo:

1. **`ui/sonner.tsx`** ⭐ HIGH PRIORITY
   - **Reason:** Configured toast provider, can be used in docs app, mobile, admin panel
   - **Status:** Currently only in web app
   - **Action:** Move to `packages/ui/src/components/ui/`, re-export in index.ts

2. **`ui/input.tsx`** ⭐ HIGH PRIORITY
   - **Reason:** Generic shadcn input component
   - **Status:** Duplicate opportunity (already moved from web to packages)
   - **Action:** Consolidate to `packages/ui`

3. **`ui/drawer.tsx`**, `ui/popover.tsx`, `ui/select.tsx`, `ui/sheet.tsx`
   - **Reason:** Standard shadcn components, non-app-specific
   - **Status:** All candidates for shared library
   - **Action:** Move to `packages/ui/src/components/ui/`

4. **`ThemeProvider.tsx`** ⭐ MEDIUM PRIORITY
   - **Reason:** Wraps `next-themes`, reusable across Next.js apps
   - **Dependencies:** `next-themes`
   - **Status:** App-agnostic
   - **Action:** Move to `packages/ui/src/providers/ThemeProvider.tsx`
   - **Note:** Create `/providers` folder in packages/ui

5. **`ThemeToggle.tsx`** ⭐ MEDIUM PRIORITY
   - **Reason:** Generic theme switcher UI, reusable in any Next.js app
   - **Dependencies:** Only UI components and `next-themes`
   - **Status:** Can be shared
   - **Action:** Move to `packages/ui/src/components/ThemeToggle.tsx`

6. **`accessibility-theme-provider.tsx`** ⭐ MEDIUM PRIORITY
   - **Reason:** Provides accessibility context for all apps
   - **Dependencies:** Custom accessibility types only
   - **Status:** Should be in docs app too
   - **Action:** Move to `packages/ui/src/providers/AccessibilityThemeProvider.tsx`

7. **`AccessibilitySettingsSheet.tsx`** ⭐ MEDIUM PRIORITY
   - **Reason:** Generic accessibility control panel
   - **Dependencies:** UI components + accessibility provider
   - **Status:** Reusable in multiple apps
   - **Action:** Move to `packages/ui/src/components/AccessibilitySettingsSheet.tsx`

---

### ⚠️ KEEP in `apps/web/components` (App-Specific)

These are tied to the web app's business logic and should remain local:

1. **`AuthProvider.tsx`**
   - **Reason:** Web app-specific authentication context
   - **Status:** May need app-specific variants for docs/mobile apps
   - **Note:** Consider extracting base auth types to `packages/ui/types` if needed

2. **`AuthBanner.tsx`**
   - **Reason:** Web app-specific UI for auth status
   - **Status:** Tightly coupled to web app layout
   - **Keep in:** apps/web/components

3. **`LoginForm.tsx`, `RegisterForm.tsx`**
   - **Reason:** Web app-specific authentication flows
   - **Dependencies:** AuthProvider, app-specific API endpoints
   - **Keep in:** apps/web/components

4. **`DispatchForm.tsx`, `DispatchList.tsx`, `DispatchDetail.tsx`**
   - **Reason:** Domain-specific crisis dispatch components
   - **Status:** Tied to crisis mode, region isolation, etc.
   - **Keep in:** apps/web/components
   - **Note:** Could eventually move business logic to `packages/` if extracted

5. **`RequireAuth.tsx`**
   - **Reason:** Web app-specific route protection
   - **Status:** Depends on AuthProvider context
   - **Keep in:** apps/web/components

6. **`msw-provider.tsx`**
   - **Reason:** Mock service worker for web app testing
   - **Status:** Dev/test artifact
   - **Keep in:** apps/web/components

---

### 🔍 DOCUMENTATION ONLY (Keep As-Is)

1. **`accessibility-examples.tsx`**
   - **Reason:** Educational component showcasing accessibility patterns
   - **Keep in:** apps/web/components for reference

2. **`accessibility-integration-guide.tsx`**
   - **Reason:** Documentation/reference
   - **Keep in:** apps/web/components for reference

---

## Migration Plan

### Phase 1: UI Components (This Sprint) - ✅ COMPLETE

```bash
✅ Moved to packages/ui/src/components/ui/:
- input.tsx          ✅ DONE
- sonner.tsx         ✅ DONE
- drawer.tsx         ✅ DONE
- popover.tsx        ✅ DONE
- select.tsx         ✅ DONE
- sheet.tsx          ✅ DONE

✅ Updated all imports in apps/web to use @repo/ui
✅ Removed duplicate files from apps/web/components/ui
✅ Added required dependencies to packages/ui
```

### Phase 2: Providers (Next Sprint) - ✅ COMPLETE

```bash
✅ Created packages/ui/src/providers/ and moved:
- ThemeProvider.tsx                    ✅ DONE
- AccessibilityThemeProvider.tsx       ✅ DONE

✅ Moved supporting files:
- types/accessibility-theme.ts         ✅ DONE
- lib/accessibility-theme-engine.ts    ✅ DONE

✅ Updated all imports in apps/web to use @repo/ui
✅ Removed old files from apps/web
✅ Updated packages/ui/src/index.ts to export providers and types
```

### Phase 3: Reusable Components (Sprint after) - ✅ COMPLETE

```bash
✅ Moved to packages/ui/src/components/:
- ThemeToggle.tsx                      ✅ DONE
- AccessibilitySettingsSheet.tsx       ✅ DONE

✅ Updated all imports in apps/web to use @repo/ui
✅ Removed old files from apps/web/components/
✅ Updated packages/ui/src/index.ts to export new components
```

### Phase 4: Update Imports

```bash
After each file is moved:
- Update packages/ui/src/index.ts to re-export
- Update apps/web imports to use @repo/ui
- Update apps/docs imports if needed
```

---

## Summary Table

| Component | Type | Current | Recommendation | Priority | Status |
| ----------- | ------ | --------- | ----------------- | ---------- | -------- |
| sonner | Provider | ui/ | packages/ui | 🔴 HIGH | ✅ MOVED |
| input | UI | ui/ | packages/ui | 🔴 HIGH | ✅ MOVED |
| drawer, popover, select, sheet | UI | ui/ | packages/ui | 🟠 MED | ✅ MOVED |
| ThemeProvider | Provider | root | packages/ui/providers | 🟠 MED | ✅ MOVED |
| ThemeToggle | UI | root | packages/ui | 🟠 MED | ✅ MOVED |
| accessibility-theme-provider | Provider | root | packages/ui/providers | 🟠 MED | ✅ MOVED |
| AccessibilitySettingsSheet | UI | root | packages/ui | 🟠 MED | ✅ MOVED |
| AuthProvider | Logic | root | apps/web | ✅ GREEN | KEEP |
| AuthBanner | Feature | root | apps/web | ✅ GREEN | KEEP |
| LoginForm, RegisterForm | Feature | root | apps/web | ✅ GREEN | KEEP |
| DispatchForm, DispatchList, DispatchDetail | Feature | root | apps/web | ✅ GREEN | KEEP |
| RequireAuth | Logic | root | apps/web | ✅ GREEN | KEEP |
| msw-provider | Test | root | apps/web | ✅ GREEN | KEEP |
| accessibility-examples | Docs | root | apps/web | ✅ GREEN | KEEP |
| accessibility-integration-guide | Docs | root | apps/web | ✅ GREEN | KEEP |

---

## Benefits of Migration

✅ **Code Reuse:** Accessibility, theme, and UI components available in docs app, mobile app, and future apps  
✅ **Consistency:** Single source of truth for UI patterns  
✅ **Maintenance:** Updates to shared components benefit all apps  
✅ **Scalability:** Cleaner separation of concerns  
✅ **Testing:** Centralized component testing in packages/ui  
