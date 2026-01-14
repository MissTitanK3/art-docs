# Dispatch System Modes

**Status:** Binding

**Scope:** UI behavior, navigation, visibility, and allowed actions

**Applies to:** All apps and packages consuming the Region Dispatch Constitution

## Purpose

Modes exist to prevent mode confusion during stress.

Each mode defines:

- What the user can see
- What the user can do
- What the system is optimizing for

Modes are explicit, visible, and intentional.
The system must always know which mode it is in, and users must be able to tell at a glance.

## Mode Overview

| Mode | Default | Primary Goal |
| :------ | :---------: | --------------: |
| Crisis Mode | Yes | Coordinate active situations |
| Management Mode | No | Configure and administer the system |
| Lockdown Mode | No | Force focus during major incidents |
| Offline Mode | Conditional | Preserve trust when connectivity is lost |
| Read-Only Mode | Conditional | Safe visibility without mutation |

Only one primary mode may be active at a time.
Conditional modes may overlay primary modes.

## 1. Crisis Mode

Default mode for all users.

### CM Purpose

Enable rapid, low-friction coordination during active situations.

### CM Characteristics

- Minimal UI
- Calm language
- No administrative concepts
- No irreversible actions without explanation

### CM Allowed Actions

- Create dispatches
- View active dispatches
- Update dispatch information
- Mark "I'm responding"
- Escalate or de-escalate urgency
- Close or reopen dispatches

### Prohibited

- Configuration changes
- Schedule management
- Inventory management
- Role or permission changes

### Visibility Requirements

- Active situations always visible
- System state always visible
- No hidden escalation or failure states

## 2. Management Mode

Explicitly entered. Never default.

### MM Purpose

Allow administrative configuration when no crisis coordination is required.

### Entry

- User action via "Admin" or "Settings"
- Explicit navigation only

### MM Characteristics

- Full configuration UI
- Reduced urgency signaling
- Clear separation from crisis workflows

### MM Allowed Actions

- Schedule management
- Inventory and logistics configuration
- Role and visibility configuration
- Audit log review
- Regional settings

### Safety Requirements

- Clear banner when active dispatches exist
- Quick return path to Crisis Mode
- No accidental entry during dispatch creation

## 3. Lockdown Mode

Exceptional mode. Overrides all others.

### LM Purpose

Force system-wide focus during large-scale or high-risk incidents.

**Lockdown mode is not security.
It is a focus and coordination constraint.**

### Activation

- Regional admin or dispatcher-on-duty
- Requires stated reason
- Fully logged

### Effects

- Forces all users into Crisis Mode
- Hides all management and admin UI
- Preserves all dispatch functionality
- Makes mode state visible on every screen

### Auto-Expiration

- Expires after 24 hours unless renewed
- Renewal requires explicit action
- Warnings shown before expiration

### Non-Negotiable Rules

- Never disables dispatch actions
- Never hides active situations
- Never persists silently
- Never survives restart without renewal

**Lockdown mode changes what is visible, not what is possible.**

## 4. Offline Mode

Conditional overlay mode.

### OM Purpose

Preserve trust and clarity when connectivity is unavailable.

### Trigger

- Network loss
- Server unreachable

### OM Characteristics

- Clear offline indicator
- Predictable queuing behavior
- No silent failures

### Behavior

- Dispatch creation allowed
- Submissions queued locally
- Sync status always visible
- Manual retry available

**Offline mode does not block action.
It changes expectations.**

## 5. Read-Only Mode

Conditional overlay mode.

### RO Purpose

Allow safe visibility without mutation.

### Triggers

- Unauthenticated access
- Permission-limited roles
- System safeguards during incidents

### RO Characteristics

- Active dispatches visible
- No mutation actions available
- Clear explanation of limitations

### Rules

- Must never appear as an error
- Must explain why actions are unavailable
- Must not hide system state

## Mode Transitions

### Allowed Transitions

| From | To | Requirement |
| :------ | :----: | ----: |
| Crisis | Management | Explicit user action |
| Any | Lockdown | Authorized activation |
| Lockdown | Crisis | Auto-expire or explicit exit |
| Any | Offline | Network failure |
| Offline | Prior Mode | Network restored |

**Silent transitions are forbidden.**

## Visibility Invariant

At all times:

- The active mode must be visible
- The reason for the mode must be visible if applicable
- The exit path must be obvious when allowed

**If a user cannot tell what mode they are in, the system is failing.**

## Design Principles

- Modes reduce cognitive load by reducing choices.
- Modes are explicit, not inferred.
- Crisis Mode is the default because coordination is the priority.
- Lockdown Mode protects focus, not authority.
- Offline Mode protects trust, not correctness.
- Read-Only Mode protects safety without obscuring reality.

## Relationship to Other Documents

This document must remain consistent with:

- SYSTEM_CONSTITUTION.md
- INVARIANTS.md
- Language and tone guidelines

If implementation behavior contradicts this document, the implementation is incorrect.
