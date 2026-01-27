# Success & Error States UX Guide

**Status:** ✅ Implemented  
**Date:** 2026-01-26  
**Components:** CreateDispatchSheet, DispatchForm  
**Standard:** Approved messaging with user-friendly recovery actions

---

## Overview

Success and error states provide users with clear feedback, actionable recovery paths, and next-steps guidance. All messaging follows approved language patterns emphasizing user agency and human-centered context.

---

## Error Handling Architecture

### Error Handler Utility (`lib/error-handler.ts`)

Central utility that standardizes error handling across all forms:

```typescript
// Parse API response into structured error
const errorContext = parseApiError(data);

// Convert to user-friendly guidance
const guidance = getErrorGuidance(errorContext);

// guidance contains:
// - message: User-friendly explanation
// - actionLabel: Call-to-action button text
// - recoveryActions: Array of possible recovery paths
// - isRetryable: Whether error can be retried
// - isAuthError: Whether user needs re-authentication
```

### Error Code to Message Mapping

| Error Code | HTTP Status | User Message | Recovery Actions |
|--------------|-------------|--------------|------------------|
| `MISSING_TOKEN` | 401 | "Your session expired. Please sign in again to send a report." | Sign in |
| `INVALID_TOKEN` | 401 | "Your session expired. Please sign in again to send a report." | Sign in |
| `VALIDATION_ERROR` | 422 | "We couldn't send your report—please check your location and try again. Make sure latitude is between -90 and 90, and longitude is between -180 and 180." | Fix and retry |
| `REGION_ACCESS_DENIED` | 403 | "You don't have access to send reports in that region. Please select a different area or check with your administrator." | Change region |
| `DATABASE_ERROR` | 500 | "Our servers are experiencing issues. We've saved your report ([ID]) and will try again. Please refresh or try again in a moment." | Retry, Contact support |
| `INTERNAL_ERROR` | 500 | "Our servers are experiencing issues. We've saved your report ([ID]) and will try again. Please refresh or try again in a moment." | Retry, Contact support |
| `NETWORK_ERROR` | N/A | "No connection. Check your internet and try again." | Retry |
| `UNKNOWN_ERROR` | N/A | "Something unexpected happened. Please try again or contact support if the problem persists." | Retry, Contact support |

---

## Success State

### Message Format

```
Your report (ID: [dispatch_id]) is live with [urgency_label]. People nearby can see it now.
```

Example outputs:
- "Your report (ID: 550e8400-e29b-41d4-a716-446655440000) is live with standard priority. People nearby can see it now."
- "Your report (ID: 550e8400-e29b-41d4-a716-446655440001) is live with critical priority. People nearby can see it now."

### Next-Steps Messaging

After success, users see contextual guidance:

```
✓ Your report is now visible to responders and the public in your area.
✓ You can send another report or close this window.
```

### Button States

| Button | Condition | Action |
|--------|-----------|--------|
| Close | Always visible | Closes sheet without reset |
| Send another report | On success | Resets form for new submission |
| Cancel | During form | Closes sheet without submission |
| Send report | Form active | Submits with full validation |

---

## Error State: Validation Error

### User Experience Flow

1. User submits form with invalid location (e.g., latitude = 100)
2. Client-side validation fails, sets `status: "error"` and `code: "VALIDATION_ERROR"`
3. User sees error message with specific guidance about latitude/longitude ranges
4. Affected fields display `aria-invalid="true"` and error details
5. Inline "Fix and retry" button allows immediate retry after correction
6. User fixes coordinates and clicks "Fix and retry" button
7. Form resubmits with corrected data

### Visual Indicators

- **Error background:** Rose/pink (`bg-rose-50 dark:bg-rose-900/30`)
- **Error text:** Rose (`text-rose-700 dark:text-rose-200`)
- **Affected input:** `aria-invalid="true"` with red border
- **Action button:** "Fix and retry" (outline style)

### Accessibility

- Error message announced via `aria-live="polite"` with `aria-atomic="true"`
- Affected field linked via `aria-describedby` to error message ID
- Form returns focus to first invalid field after retry
- Screen reader announces validation state and error message

---

## Error State: Authentication Error

### User Experience Flow

1. User submits form with expired/missing token
2. API returns `401 MISSING_TOKEN` or `401 INVALID_TOKEN`
3. Form displays: "Your session expired. Please sign in again to send a report."
4. Error state flags as `isAuthError: true`
5. Recovery action button: "Go to sign in" (closes sheet and routes to login)
6. Form cannot be resubmitted until user re-authenticates

### Recovery Path

- Click "Go to sign in" button
- Navigate to authentication page
- Sign in with credentials or biometric
- Receive new token (stored in HttpOnly cookie)
- Return to dispatch form (token now valid)
- Retry submission

### Accessibility

- Clear message explains session state
- Button has `aria-label="Go to sign in"`
- No retry button (not user-fixable error)
- Focus moves to recovery button for clarity

---

## Error State: Region Access Denied

### User Experience Flow

1. User submits report for region they lack access to (e.g., user from Oregon tries to submit for California)
2. API returns `403 REGION_ACCESS_DENIED`
3. Form displays: "You don't have access to send reports in that region. Please select a different area or check with your administrator."
4. Recovery action: "Change region and try again" button
5. Button resets form state and returns user to location selection
6. User selects location in allowed region and resubmits

### Recovery Path

- Click "Change region and try again"
- Form resets to initial state
- User re-selects location in allowed region
- Form resubmits

### Accessibility

- Message explicitly describes constraint and suggests admin contact
- Button has clear action label
- Focus returns to location picker after reset

---

## Error State: Server Error (Retriable)

### User Experience Flow (Database/Internal Error)

1. User submits form successfully (client validation passes)
2. Server experiences database failure or internal error
3. API returns `500 DATABASE_ERROR` or `500 INTERNAL_ERROR`
4. Form displays: "Our servers are experiencing issues. We've saved your report ([ID]) and will try again. Please refresh or try again in a moment."
5. Recovery actions: "Retry" button + "Contact support" text
6. Retry button automatically attempts submission again
7. If persists, user can contact support with dispatch ID for manual tracking

### Recovery Path

- Click "Retry" button
- Form immediately resubmits with same data
- If retry succeeds: User sees success state
- If retry fails: Error message remains, user can retry again or contact support

### Dispatch ID in Error Context

Server errors include dispatch ID for support reference:
- Helps users reference their report if it was partially created
- Allows support team to investigate specific submission
- Reassures users that data was not lost
- Format: `[ID: 550e8400-e29b-41d4-a716-446655440000]`

### Accessibility

- Message announces server state without blame ("Our servers are experiencing issues...")
- Dispatch ID provided for user reference
- Support contact info available
- Retry button immediately accessible

---

## Error State: Network Error

### User Experience Flow

1. User submits form with valid data
2. Network failure occurs (no internet, timeout, etc.)
3. Client catch block detects network error
4. Form displays: "No connection. Check your internet and try again."
5. Recovery action: "Retry" button
6. User can check connection and retry immediately

### Recovery Path

- User checks internet connection status
- Click "Retry" button
- Form resubmits if connection restored
- If still no connection, message persists until connection recovers

### Accessibility

- Clear, actionable message (not technical jargon)
- No mention of "fetch failed" or "network error code"
- Implies user action (check connection) without blame

---

## Component Implementation Details

### CreateDispatchSheet

**State Management:**
```typescript
const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
const [dispatchMessage, setDispatchMessage] = useState<string>('');
const [errorDetails, setErrorDetails] = useState<{
  code?: string;
  actionLabel?: string;
  recoveryActions?: string[];
  isAuthError?: boolean;
}>({});
const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
```

**Message Display:**
- Status shown in colored alert box (green for success, rose for error, neutral for loading)
- Alert has `role="status"` and `aria-live="polite"` for screen reader announcement
- Alert has `aria-atomic="true"` to announce full message
- Form-level errors appear above buttons

**Recovery Actions (Dynamic Buttons):**
- Validation error: Shows "Fix and retry" button
- Auth error: Shows "Go to sign in" button (SheetClose)
- Server error: Shows "Retry" button + support contact text
- Region error: Shows "Change region and try again" button (calls handleReset)

**Handlers:**
```typescript
const handleRetry = () => {
  setErrorDetails({});
  setDispatchStatus('idle');
  setDispatchMessage('');
  void createDispatch();
};

const handleReset = () => {
  // Clears all state and resets form to initial state
};
```

### DispatchForm

**Differences from CreateDispatchSheet:**
- Uses HTML `<form>` instead of sheet component
- Form fields hidden when `status === 'success'` (conditional rendering with `{status !== 'success' && ...}`)
- Success state shows single "Send another report" button (calls handleReset)
- Error recovery buttons have `type="button"` to avoid form submission on click
- Uses inline elements (no sheet overlay behavior)

**State Management:**
```typescript
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
const [message, setMessage] = useState<string>('');
const [errorDetails, setErrorDetails] = useState<{
  code?: string;
  actionLabel?: string;
  recoveryActions?: string[];
}>({});
```

---

## Testing Checklist

### Validation Error Flow
- [ ] Submit form with latitude > 90
- [ ] Error message displays with specific guidance
- [ ] Affected field shows `aria-invalid="true"`
- [ ] "Fix and retry" button visible
- [ ] Click "Fix and retry" with corrected value → success
- [ ] Screen reader announces error state and recovery action

### Authentication Error Flow
- [ ] Log out or clear token
- [ ] Submit form
- [ ] "Your session expired..." message appears
- [ ] "Go to sign in" button visible
- [ ] Click button → closes sheet and routes to login
- [ ] After re-auth, new submission succeeds

### Server Error Flow (Simulate with Network tab in DevTools)
- [ ] Intercept API response with 500 error
- [ ] Error message shows with dispatch ID (if available)
- [ ] "Retry" button visible
- [ ] Allow request to succeed on second attempt
- [ ] Click "Retry" → success message appears

### Network Error Flow
- [ ] Disconnect internet or throttle to offline
- [ ] Submit form
- [ ] "No connection..." message appears
- [ ] "Retry" button visible
- [ ] Reconnect internet
- [ ] Click "Retry" → success message appears

### Success Flow
- [ ] Submit form with valid data
- [ ] Loading message: "Sending your report..."
- [ ] Success message shows with dispatch ID and urgency
- [ ] Next-steps messaging visible: "Your report is now visible..."
- [ ] Buttons change to: "Close" + "Send another report"
- [ ] Click "Send another report" → form resets to initial state
- [ ] Click "Close" → sheet closes without reset

### Accessibility (Keyboard Navigation)
- [ ] Tab through all form fields
- [ ] Tab to error recovery button and activate with Enter
- [ ] Success message announced to screen reader
- [ ] Tab to "Send another report" and activate
- [ ] Form fields re-focusable after reset

### Accessibility (Screen Reader - NVDA/VoiceOver)
- [ ] Error message announced immediately after submission fails
- [ ] Affected field marked as invalid and error linked via aria-describedby
- [ ] Recovery action button announced with descriptive label
- [ ] Success message announced with dispatch ID
- [ ] Next-steps messaging readable

---

## Messaging Philosophy

### Approved Language Principles

1. **User agency:** "You can...", "Please...", avoiding "system will..."
2. **Specific guidance:** What went wrong and how to fix it
3. **Human context:** Reference dispatch ID, mention responders/public, avoid codes
4. **Actionable:** Clear next step (button label matches action)
5. **Reassuring:** Acknowledge concerns (data saved, people can see it, etc.)

### Examples

❌ Bad: "Submit failed" (no context, system-focused)
✅ Good: "We couldn't send your report—please check your location"

❌ Bad: "Authentication token missing" (technical jargon)
✅ Good: "Your session expired. Please sign in again to send a report."

❌ Bad: "500 Internal Server Error" (technical, scary)
✅ Good: "Our servers are experiencing issues. We've saved your report and will try again. Please refresh or try again in a moment."

---

## Future Enhancements

### Planned for Sprint 2

- **Optimistic UI:** Show success immediately, handle rollback if fails
- **Offline support:** Queue reports when offline, sync when reconnected
- **Retry with exponential backoff:** Automatic retry for server errors with increasing delay
- **Error analytics:** Track which errors occur most frequently and optimize UX
- **Support contact integration:** Link to help center or support chat from error messages
- **Field-specific error recovery:** Focus on invalid field and highlight it in red
- **Pre-submission validation feedback:** Show validation errors as user types (not just on submit)

### Accessibility Improvements

- **Error announcement timeout:** If user doesn't notice, re-announce after 5 seconds
- **Error toast variant:** Pop-up toast for errors (optional, depends on UX research)
- **Keyboard shortcuts:** Alt+R for retry, Alt+C for cancel (if keyboard-heavy user base)
- **Focus trap in error:** Keep focus on error and recovery button until resolved or dismissed

---

## Related Documentation

- [API Error Standards](./API_ERROR_STANDARDS.md) — Error codes and response format
- [WCAG Compliance Checklist](./WCAG_COMPLIANCE_CHECKLIST.md) — Accessibility verification
- [Language Compliance Guide](./LANGUAGE_COMPLIANCE_STANDARDS.md) — Approved messaging terminology

