---
name: design-critique
description: Get structured design feedback on usability, hierarchy, and consistency. Trigger with "review this design", "critique this mockup", "what do you think of this screen?", or when sharing a Figma link or screenshot for feedback at any stage from exploration to final polish.
argument-hint: "<Figma URL, screenshot, or description>"
---

> **Adapted from Anthropic's `design` plugin** (v1.2.0), whose package declares no
> licence — check before redistributing this kit outside italki. The consistency
> and design-token sections have been rewired to this kit's contracts:
> `{KIT}/guidelines/`, `{KIT}/tokens/tokens.css`, and each component's `.d.ts`.
> `{KIT}` is where the kit sits in this project. On conflict the owning document
> wins (`{KIT}/guidelines/EXECUTION.md § 1.5`).

# /design-critique

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../CONNECTORS.md).

Get structured design feedback across multiple dimensions.

## Usage

```
/design-critique $ARGUMENTS
```

Review the design: @$1

If a Figma URL is provided, pull the design from Figma. If a file is referenced, read it. Otherwise, ask the user to describe or share their design.

## What I Need From You

- **The design**: Figma URL, screenshot, or detailed description
- **Context**: What is this? Who is it for? What stage (exploration, refinement, final)?
- **Focus** (optional): "Focus on mobile" or "Focus on the onboarding flow"

## Critique Framework

### 1. First Impression (2 seconds)
- What draws the eye first? Is that correct?
- What's the emotional reaction?
- Is the purpose immediately clear?

### 2. Usability
- Can the user accomplish their goal?
- Is the navigation intuitive?
- Are interactive elements obvious?
- Are there unnecessary steps?

### 3. Visual Hierarchy
- Is there a clear reading order?
- Are the right elements emphasized?
- Is whitespace used effectively?
- Is typography creating the right hierarchy?

### 4. Consistency — measured against this kit, not against generic good practice

The kit owns these rules. A consistency finding that contradicts them is wrong, not
a matter of taste; a finding that cites none of them is an opinion, not a defect.

- **Tokens, never hex.** Every colour, size, space, radius and shadow resolves to a
  `--ui-*` custom property in `{KIT}/tokens/tokens.css` —
  `{KIT}/guidelines/COMPONENTS.md § Color Application Rules`, `§ Engineering Token Handoff`.
- **Typography is a closed set.** Only the sizes and weights in
  `{KIT}/guidelines/COMPONENTS.md § Typography Token Enforcement`. 13 / 15 / 17 / 19 / 22 /
  26 / 30px are violations, not choices. Weight 800 is hero and brand-mark only.
- **One `variant="red"` per page or task step** —
  `{KIT}/guidelines/EXECUTION.md § 4.5 Red CTA Usage`, `§ 4.6 Button Decision Tree`. Brand
  red is the booking / conversion action: never an error, never ordinary selection.
- **Component anatomy is fixed.** Reusing a component name while changing its reading
  order, action hierarchy, content limits, states or accessibility contract is
  non-compliant — `{KIT}/guidelines/DESIGN.md § Non-Negotiable Rules`.
- **Props are asserted at runtime.** Read `{KIT}/components/<group>/<Name>/<Name>.d.ts`
  before claiming a prop exists or is misused; it is exhaustive, not indicative.
- **Icons come from the local library** — `{KIT}/guidelines/COMPONENTS.md § Icon Library`,
  `§ Naming`. No external icon set, no hand-drawn substitute, no temporary URL.
- **Spacing and radius come off the scales** — `§ Spacing System`,
  `§ Semantic Spacing Roles`, `§ Radius Scale`, `§ Height-Based Radius Rules`.
- **Both themes resolve from one role** — `§ Light And Dark Semantic Mapping`. A
  light-mode hex copied into a component is a defect even if it looks right.
- **No component names or rule labels on a real screen** —
  `{KIT}/guidelines/EXECUTION.md § 0.5 Non-Negotiable Execution Gate` (Page Composition Gate).

Cite the owning document and section for every consistency finding.

### 5. Accessibility
- Color contrast ratios
- Touch target sizes
- Text readability
- Alternative text for images

## How to Give Feedback

- **Be specific**: "The CTA competes with the navigation" not "the layout is confusing"
- **Explain why**: Connect feedback to design principles or user needs
- **Suggest alternatives**: Don't just identify problems, propose solutions
- **Acknowledge what works**: Good feedback includes positive observations
- **Match the stage**: Early exploration gets different feedback than final polish

## Output

```markdown
## Design Critique: [Design Name]

### Overall Impression
[1-2 sentence first reaction — what works, what's the biggest opportunity]

### Usability
| Finding | Severity | Recommendation |
|---------|----------|----------------|
| [Issue] | 🔴 Critical / 🟡 Moderate / 🟢 Minor | [Fix] |

### Visual Hierarchy
- **What draws the eye first**: [Element] — [Is this correct?]
- **Reading flow**: [How does the eye move through the layout?]
- **Emphasis**: [Are the right things emphasized?]

### Consistency
| Element | Rule violated (doc § section) | Issue | Recommendation |
|---------|-------------------------------|-------|----------------|
| [Element] | [COMPONENTS.md § Typography Token Enforcement] | [17px body copy] | [16 or 18] |
| [Element] | [EXECUTION.md § 4.5 Red CTA Usage] | [Two red actions in one step] | [Demote the secondary] |

### Accessibility
- **Color contrast**: [Pass/fail for key text]
- **Touch targets**: [Adequate size?]
- **Text readability**: [Font size, line height]

### What Works Well
- [Positive observation 1]
- [Positive observation 2]

### Priority Recommendations
1. **[Most impactful change]** — [Why and how]
2. **[Second priority]** — [Why and how]
3. **[Third priority]** — [Why and how]
```

## If Connectors Available

If **~~design tool** is connected:
- Pull the design directly from Figma and inspect components, tokens, and layers
- Compare against the existing design system for consistency

If **~~user feedback** is connected:
- Cross-reference design decisions with recent user feedback and support tickets

## Tips

1. **Share the context** — "This is a checkout flow for a B2B SaaS" helps me give relevant feedback.
2. **Specify your stage** — Early exploration gets different feedback than final polish.
3. **Ask me to focus** — "Just look at the navigation" gives you more depth on one area.
