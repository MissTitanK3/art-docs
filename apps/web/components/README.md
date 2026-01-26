# App-Specific Components

This directory contains components that are **specific to the web application** and should NOT be moved to `packages/ui`.

## Directory Structure

```bash
components/
├── auth/              # Authentication & authorization
│   ├── AuthProvider.tsx          - Authentication context provider
│   ├── AuthBanner.tsx            - Auth status banner UI
│   ├── LoginForm.tsx             - Login form
│   ├── RegisterForm.tsx          - Registration form
│   └── RequireAuth.tsx           - Route protection wrapper
│
├── dispatches/        # Crisis dispatch features
│   ├── DispatchForm.tsx          - Create/edit dispatch form
│   ├── DispatchList.tsx          - List view of dispatches
│   └── DispatchDetail.tsx        - Single dispatch detail view
│
├── examples/          # Documentation & reference components
│   ├── accessibility-examples.tsx           - A11y pattern examples
│   └── accessibility-integration-guide.tsx  - A11y integration guide
│
└── test/              # Testing utilities
    └── msw-provider.tsx          - Mock Service Worker provider
```

---

## What Belongs Here?

### ✅ Keep in `apps/web/components/`

1. **Domain-Specific Components**
   - Components tied to crisis dispatch business logic
   - Features specific to this application (dispatches, incidents, responders)
   - Components that consume app-specific API endpoints

2. **App-Specific Logic**
   - Authentication providers tied to your auth implementation
   - Route protection and authorization logic
   - App-specific data fetching and state management

3. **Feature Modules**
   - Complete features that won't be reused elsewhere
   - Components with complex interdependencies within the web app
   - Compositions of shared UI components for specific use cases

4. **Documentation & Examples**
   - Educational components for developers
   - Implementation guides specific to this app
   - Testing utilities and mock providers

---

## What Does NOT Belong Here?

### ❌ Move to `packages/ui/`

1. **Generic UI Components**
   - Buttons, cards, inputs, sheets, drawers, popovers
   - Any shadcn/ui component
   - Theme and styling utilities

2. **Reusable Providers**
   - Theme providers
   - Accessibility providers
   - Any context that could be used in docs app, mobile app, etc.

3. **Shared Utilities**
   - Pure functions
   - Type definitions used across apps
   - Configuration utilities

---

## Guidelines

### Naming Conventions

- Use **PascalCase** for component files: `AuthProvider.tsx`
- Use **kebab-case** for utility files: `auth-utils.ts`
- Add `.test.tsx` suffix for test files
- Co-locate related files in the same folder

### File Organization

```tsx
// ✅ Good: Feature-based organization
components/
├── auth/
│   ├── AuthProvider.tsx
│   ├── LoginForm.tsx
│   └── hooks/
│       └── useAuth.ts

// ❌ Bad: Flat structure
components/
├── AuthProvider.tsx
├── LoginForm.tsx
├── useAuth.ts
```

### Import Patterns

```tsx
// ✅ Good: Import from packages/ui for shared components
import { Button, Card, Input } from "@repo/ui";

// ✅ Good: Import from local feature folder
import { useAuth } from "@/components/auth/AuthProvider";

// ❌ Bad: Don't recreate UI components locally
import { Button } from "@/components/ui/button"; // Wrong! Use @repo/ui
```

---

## When to Create a New Folder

Create a new folder when:

1. **New Feature Domain**: Adding a new major feature (e.g., `reports/`, `notifications/`)
2. **Related Components**: You have 3+ components that work together
3. **Domain Logic**: Components share business logic or data models
4. **Clear Boundary**: The folder represents a cohesive unit of functionality

### Example: Adding a Reports Feature

```bash
components/
├── reports/
│   ├── ReportList.tsx
│   ├── ReportDetail.tsx
│   ├── ReportFilters.tsx
│   └── hooks/
│       └── useReports.ts
```

---

## Migration Checklist

When moving a component FROM here TO `packages/ui`:

- [ ] Remove all app-specific imports (e.g., `@/components/AuthProvider`)
- [ ] Update to use relative imports within packages/ui
- [ ] Add to `packages/ui/src/index.ts` exports
- [ ] Update all consumers to import from `@repo/ui`
- [ ] Add any new dependencies to `packages/ui/package.json`
- [ ] Delete the old file from `apps/web/components`
- [ ] Update `COMPONENT_AUDIT.md`

---

## Questions?

- **Is this component used elsewhere?** → Consider moving to `packages/ui`
- **Does it contain business logic?** → Keep it here
- **Is it a pure UI primitive?** → Move to `packages/ui`
- **Does it depend on app routes/API?** → Keep it here

For architectural decisions, refer to `/docs/COMPONENT_AUDIT.md`.
