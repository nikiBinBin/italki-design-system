---
name: design-system
description: Audit, document, or extend your design system. Use when checking for naming inconsistencies or hardcoded values across components, writing documentation for a component's variants, states, and accessibility notes, or designing a new pattern that fits the existing system.
argument-hint: "[audit | document | extend] <component or system>"
---

> **Adapted from Anthropic's `design` plugin** (v1.2.0), whose package declares no
> licence — check before redistributing this kit outside italki. The consistency
> and design-token sections have been rewired to this kit's contracts:
> `{KIT}/guidelines/`, `{KIT}/tokens/tokens.css`, and each component's `.d.ts`.
> `{KIT}` is where the kit sits in this project. On conflict the owning document
> wins (`{KIT}/guidelines/EXECUTION.md § 1.5`).

# /design-system

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../CONNECTORS.md).

Manage your design system — audit for consistency, document components, or design new patterns.

## Usage

```
/design-system audit                    # Full system audit
/design-system document [component]     # Document a component
/design-system extend [pattern]         # Design a new component or pattern
```

## Components of a Design System

### Design Tokens — this kit's tokens, not a generic taxonomy

Do not enumerate what a token system *could* contain. This kit's tokens already exist
and are the only legal source of a value. Read them before auditing or documenting:

- `{KIT}/tokens/tokens.css` — the shipped `--ui-*` custom properties.
- `{KIT}/guidelines/COMPONENTS.md § Engineering Token Handoff` — the semantic role →
  framework key → CSS custom property table. Components consume **semantic roles**
  (`Primary/Main`, `Background/Card`, `Foreground/Title`, `Status/{tone}`), never
  primitive ramps (`Red/600`, `Gray/800`, `Teal/700`) and never a raw hex.
- `§ Color Application Rules` — what each role is permitted to *mean*. `Primary/Main`
  is one decisive booking / submit / conversion action per task area and never a text
  colour; `Status/Available` is bookable time only; `Gradient/Pro` is italki Plus
  identity only; `Special/Text-Link` is navigation, not a general action button.
- `§ Typography Token Enforcement` — the closed size set (12–60) and weight set
  (400/500/600/700, plus 800 for hero only).
- `§ Spacing System`, `§ Semantic Spacing Roles`, `§ Module Padding And Margin Scale`.
- `§ Radius Scale`, `§ Height-Based Radius Rules`, `§ Corner Smoothing`.
- `§ Elevation Levels`, `§ Card Tokens`, `§ Elevation Matrix`.
- `§ Light And Dark Semantic Mapping` — one role, both themes.
- `§ Motion And Reduced Motion` — durations, easings, and the reduced-motion contract.

A role the design needs but the system lacks is a **token gap**, not licence to invent:
name it, cite the owning document, and follow `{KIT}/guidelines/DESIGN.md § Deviation
Protocol` — smallest compatible extension, explicit approval before implementing.

### Components
Reusable UI elements with defined:
- Variants (primary, secondary, ghost)
- States (default, hover, active, disabled, loading, error)
- Sizes (sm, md, lg)
- Behavior (interactions, animations)
- Accessibility (ARIA, keyboard)

### Patterns
Common UI solutions combining components:
- Forms (input groups, validation, submission)
- Navigation (sidebar, tabs, breadcrumbs)
- Data display (tables, cards, lists)
- Feedback (toasts, modals, inline messages)

## Principles

1. **Consistency over creativity** — The system exists so teams don't reinvent the wheel
2. **Flexibility within constraints** — Components should be composable, not rigid
3. **Document everything** — If it's not documented, it doesn't exist
4. **Version and migrate** — Breaking changes need migration paths

## Output — Audit

```markdown
## Design System Audit

### Summary
**Components reviewed:** [X] | **Issues found:** [X] | **Score:** [X/100]

### Naming Consistency
Component and prop names are contracts, not labels — check each against
`{KIT}/components/<group>/<Name>/<Name>.d.ts` and `{KIT}/README.md`'s prop vocabulary and slot
table. Icon names against `{KIT}/guidelines/COMPONENTS.md § Naming`.

| Issue | Components | Owning rule (doc § section) | Standard to adopt |
|-------|------------|-----------------------------|-------------------|
| [Inconsistent naming] | [List] | [doc § section] | [Standard] |

### Token Coverage
Measured against `{KIT}/tokens/tokens.css` and the tables in
`{KIT}/guidelines/COMPONENTS.md § Engineering Token Handoff`.

| Category | Owning rule | Off-system values found |
|----------|-------------|-------------------------|
| Colour | § Color Application Rules | [X] raw hex, [X] primitive ramps used directly |
| Typography | § Typography Token Enforcement | [X] unsanctioned sizes, [X] weight-800 misuses |
| Spacing | § Spacing System | [X] values off the scale |
| Radius | § Radius Scale | [X] values off the scale |
| Elevation | § Elevation Levels | [X] custom shadows |
| Theme | § Light And Dark Semantic Mapping | [X] light-mode hexes hardcoded |
| Icons | § Icon Library | [X] non-local or substituted icons |
| Role misuse | § Color Application Rules | [X] roles used outside their documented meaning |

### Component Completeness
| Component | States | Variants | Docs | Score |
|-----------|--------|----------|------|-------|
| Button | ✅ | ✅ | ⚠️ | 8/10 |
| Input | ✅ | ⚠️ | ❌ | 5/10 |

### Priority Actions
1. [Most impactful improvement]
2. [Second priority]
3. [Third priority]
```

## Output — Document

```markdown
## Component: [Name]

### Description
[What this component is and when to use it]

### Variants
| Variant | Use When |
|---------|----------|
| [Primary] | [Main actions] |
| [Secondary] | [Supporting actions] |

### Props / Properties
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| [prop] | [type] | [default] | [description] |

### States
| State | Visual | Behavior |
|-------|--------|----------|
| Default | [description] | — |
| Hover | [description] | [interaction] |
| Active | [description] | [interaction] |
| Disabled | [description] | Non-interactive |
| Loading | [description] | [animation] |

### Accessibility
- **Role**: [ARIA role]
- **Keyboard**: [Tab, Enter, Escape behavior]
- **Screen reader**: [Announced as...]

### Do's and Don'ts
| ✅ Do | ❌ Don't |
|------|---------|
| [Best practice] | [Anti-pattern] |

### Code Example
[Framework-appropriate code snippet]
```

## Output — Extend

```markdown
## New Component: [Name]

### Problem
[What user need or gap this component addresses]

### Existing Patterns
| Related Component | Similarity | Why It's Not Enough |
|-------------------|-----------|---------------------|
| [Component] | [What's shared] | [What's missing] |

### Proposed Design

#### API / Props
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| [prop] | [type] | [default] | [description] |

#### Variants
| Variant | Use When | Visual |
|---------|----------|--------|
| [Variant] | [Scenario] | [Description] |

#### States
| State | Behavior | Notes |
|-------|----------|-------|
| Default | [Description] | — |
| Hover | [Description] | [Interaction] |
| Disabled | [Description] | Non-interactive |
| Loading | [Description] | [Animation] |

#### Tokens Used
- Colors: [Which tokens]
- Spacing: [Which tokens]
- Typography: [Which tokens]

### Accessibility
- **Role**: [ARIA role]
- **Keyboard**: [Expected interactions]
- **Screen reader**: [Announced as...]

### Open Questions
- [Decision that needs design review]
- [Edge case to resolve]
```

## If Connectors Available

If **~~design tool** is connected:
- Audit components directly in Figma — check naming, variants, and token usage
- Pull component properties and layer structure for documentation

If **~~knowledge base** is connected:
- Search for existing component documentation and usage guidelines
- Publish updated documentation to your wiki

## Tips

1. **Start with an audit** — Know where you are before deciding where to go.
2. **Document as you build** — It's easier to document a component while designing it.
3. **Prioritize coverage over perfection** — 80% of components documented beats 100% of 10 components.
