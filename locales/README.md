# Locales README

This directory contains all user-facing language for the Region Dispatch system.

It is a policy surface, not an implementation detail.

All apps and packages consume these files read-only.

## Purpose

The goals of this locale system are:

- Reduce cognitive load during crisis situations
- Ensure calm, human, non-institutional language
- Make translation manageable without massive files
- Prevent UI drift caused by ad-hoc copy
- Treat language as a first-class design constraint

**If a string appears in the UI, it must live here.**

## Directory Structure

```bash
locales/
├── en/
│   ├── actions.json
│   ├── states.json
│   ├── errors.json
│   └── reassurance.json
├── es/
├── fr/
└── README.md
```

Each language mirrors the same namespace structure.

Do not add new namespaces without review.

## Namespace Meanings

Namespaces are intent-based, not screen-based.

### actions.json

User-initiated verbs.

Examples:

- Buttons
- Links
- Commands

Rule:

- Must be short
- Must be a verb phrase
- Must not describe system state

### states.json

Neutral descriptions of what is happening.

Examples:

- Status labels
- Urgency labels
- Connectivity states

Rule:

- Declarative, not judgmental
- No database or technical language
- No blame or implication of failure

### errors.json

Problems that require user awareness.

Examples:

- Network issues
- Validation failures
- Permission issues

Rule:

- No panic language
- No exclamation points
- Always recoverable or explainable

### reassurance.json

Human support and permission.

Examples:

- "You can update this later"
- "Nothing is final until you send"
- "Approximate is fine"

Rule:

- Calm
- Non-patronizing
- Permission-oriented

This namespace exists deliberately.
Do not merge it into others.

## Key Design Rules

These rules are hard constraints.

### 1. No inline copy in UI code

UI code must never define visible strings.

All visible text comes from `locales/`.

### 2. Maximum string length

Hard limit: 120 characters

Target: under 80 characters

Shorter strings reduce translation cost and cognitive load.

### 3. No em dashes

Do not use `—`.

Use:

- Periods
- Commas
- Separate sentences

This improves readability and translation safety.

### 4. Atomic strings only

Strings must be reusable.

Bad:

```bash
"Ready to send this report to responders?"
```

Good:

```bash
"Ready to send this?"
"People can see this now"
```

Compose in the UI.

### 5. No embedded logic

Do not encode conditions in copy.

Bad:

```bash
"If no one responds, we will escalate"
```

Good:

```bash
"No one has responded yet"
"We are notifying more people"
```

Logic belongs in code, not language.

## Adding a New Language

1. Create a new directory under `locales/` (e.g. `es/`)
2. Copy all namespace files from `en/`
3. Translate values only
4. Do not change keys
5. Do not reorder keys

Missing keys are treated as errors.

## Adding New Keys

New keys should be rare.

Before adding:

- Check if an existing key can be reused
- Ensure the string is atomic
- Ensure it fits the namespace intent

If a new key is added:

- It must be added to all languages
- It must follow all rules in this document

## What This Is Not

This system is not:

- Marketing copy
- Legal disclaimers
- Narrative content
- Long-form help text

If something needs more than 120 characters, it likely belongs in documentation, not the UI.

## Enforcement

This directory is considered policy.

Future enforcement may include:

- CI checks for string length
- Lint rules blocking inline strings
- Checks for forbidden characters
- Review gates for new keys

If implementation conflicts with these rules, the implementation is wrong.

## Philosophy

Language shapes behavior.

In a crisis system:

- Fear blocks action
- Precision too early creates paralysis
- Silence feels like abandonment

These locales exist to ensure the UI remains calm, clear, and human, even when the situation is not.
