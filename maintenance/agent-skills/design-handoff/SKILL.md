---
name: design-handoff
description: Generate developer handoff specs from a design. Use when a design is ready for engineering and needs a spec sheet covering layout, design tokens, component props, interaction states, responsive breakpoints, edge cases, and animation details.
argument-hint: "<Figma URL or design description>"
---

> **Adapted from Anthropic's `design` plugin** (v1.2.0) —
> github.com/anthropics/knowledge-work-plugins, Apache-2.0. The consistency
> and design-token sections have been rewired to this kit's contracts:
> `{KIT}/guidelines/`, `{KIT}/tokens/tokens.css`, and each component's `.d.ts`.
> `{KIT}` is where the kit sits in this project. On conflict the owning document
> wins (`{KIT}/guidelines/EXECUTION.md § 1.5`).

# /design-handoff

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../CONNECTORS.md).

Generate comprehensive developer handoff documentation from a design.

## Usage

```
/design-handoff $ARGUMENTS
```

Generate handoff specs for: @$1

If a Figma URL is provided, pull the design from Figma. Otherwise, work from the provided description or screenshot.

## What to Include

### Visual Specifications
- Exact measurements, taken off the scales in `{KIT}/guidelines/COMPONENTS.md § Spacing
  System`, `§ Radius Scale`, `§ Control Width Scale` — not measured off a screenshot
- Semantic token roles and their `--ui-*` properties from
  `{KIT}/guidelines/COMPONENTS.md § Engineering Token Handoff` — hand over the role, not a hex
- Responsive breakpoints per `{KIT}/guidelines/EXECUTION.md § 13.1 Breakpoint Defaults`
- Component variants and states as declared in
  `{KIT}/components/<group>/<Name>/<Name>.d.ts` — the props are asserted at runtime, so a
  spec naming a prop that does not exist will throw

### Interaction Specifications
- Click/tap behavior
- Hover states
- Transitions and animations (duration, easing)
- Gesture support (swipe, pinch, long-press)

### Content Specifications
- Character limits
- Truncation behavior
- Empty states
- Loading states
- Error states

### Edge Cases
- Minimum/maximum content
- International text (longer strings)
- Slow connections
- Missing data

### Accessibility
- Focus order
- ARIA labels and roles
- Keyboard interactions
- Screen reader announcements

## Principles

1. **Don't assume** — If it's not specified, the developer will guess. Specify everything.
2. **Use tokens, not values** — Reference `spacing-md` not `16px`.
3. **Show all states** — Default, hover, active, disabled, loading, error, empty.
4. **Describe the why** — "This collapses on mobile because users primarily use one-handed" helps developers make good judgment calls.

## Output

```markdown
## Handoff Spec: [Feature/Screen Name]

### Overview
[What this screen/feature does, user context]

### Layout
[Grid system, breakpoints, responsive behavior]

### Design Tokens Used
Engineering consumes semantic roles, so hand over the role and its custom property
from `{KIT}/guidelines/COMPONENTS.md § Engineering Token Handoff` — not a hex value. A hex
in a handoff spec is how light-mode colour gets baked into a component.

| Semantic role | CSS custom property | Usage |
|---------------|---------------------|-------|
| Primary/Main | `--ui-color-primary-main` | The one conversion action in this step |
| Background/Card | `--ui-color-background-card` | Card surface |
| Foreground/Title | `--ui-color-foreground-title` | Section heading |
| Foreground/Secondary-text | `--ui-color-foreground-secondary-text` | Supporting copy |
| Status/{tone} | `--ui-color-status-{tone}` | [Which state, and its copy] |

### Components
| Component | Variant | Props | Notes |
|-----------|---------|-------|-------|
| [Component] | [Variant] | [Props] | [Special behavior] |

### States and Interactions
| Element | State | Behavior |
|---------|-------|----------|
| [CTA Button] | Hover | [Background darken 10%] |
| [CTA Button] | Loading | [Spinner, disabled] |
| [Form] | Error | [Red border, error message below] |

### Responsive Behavior
| Breakpoint | Changes |
|------------|---------|
| Desktop (>1024px) | [Default layout] |
| Tablet (768-1024px) | [What changes] |
| Mobile (<768px) | [What changes] |

### Edge Cases
- **Empty state**: [What to show when no data]
- **Long text**: [Truncation rules]
- **Loading**: [Skeleton or spinner]
- **Error**: [Error state appearance]

### Animation / Motion
| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| [Element] | [Trigger] | [Description] | [ms] | [easing] |

### Accessibility Notes
- [Focus order]
- [ARIA labels needed]
- [Keyboard interactions]
```

## If Connectors Available

If **~~design tool** is connected:
- Pull exact measurements, tokens, and component specs from Figma
- Export assets and generate a complete spec sheet

If **~~project tracker** is connected:
- Link the handoff to the implementation ticket
- Create sub-tasks for each section of the spec

## Tips

1. **Share the Figma link** — I can pull exact measurements, tokens, and component info.
2. **Mention edge cases** — "What happens with 100 items?" helps me spec boundary conditions.
3. **Specify the tech stack** — "We use React + Tailwind" helps me give relevant implementation notes.
