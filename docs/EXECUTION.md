# EXECUTION.md

## 0. How To Use This Document

### 0.1 Intended Readers

This document is written for:

- designers
- frontend engineers
- AI systems used to generate pages, modules, enhancements, or implementation structures

### 0.2 What This Document Covers

This document defines how to turn product requests into executable UI structures.

## Rule Priority

For page hierarchy, responsive behavior, interaction application, state coverage, accessibility execution, and validation, this document is authoritative. It defers product direction to `DESIGN.md`, reusable UI contracts to `COMPONENTS.md`, and business-object composition to `PATTERNS.md`.

It covers:

- request intake
- AI response rules
- product execution principles
- page generation rules
- information architecture rules
- component selection and page-level application
- page assembly rules
- existing page recipes
- new object creation rules
- data and content rules

### 0.3 What This Document Does Not Cover

This document does not redefine:

- color tokens
- typography tokens
- spacing tokens
- radius tokens
- icon assets
- visual primitives

These remain in `COMPONENTS.md`.

### 0.4 Default Working Method

Use this order:

1. collect a request intake (`INTAKE.md`)
2. interpret the user story and task
3. define the object scope
4. determine the primary action
5. build the information hierarchy
6. reuse an existing pattern if possible
7. define the assembly structure
8. map the structure to components
9. define responsive and state behavior
10. validate the result against execution rules

### 0.5 Non-Negotiable Execution Gate

AI must pass this gate before writing implementation code or presenting a page as complete. Rules in this gate are fail-closed: when evidence is missing, remove the element or ask a focused question. Do not fill the gap with a plausible-looking UI choice.

**Select the working mode first:**

- `Reference fidelity mode`: use when the requester provides a Figma page, screenshot, or existing screen to follow. Reproduce the referenced page's shell, composition, visible information, and interaction model before considering any new composition.
- `Rule-derived composition mode`: use only when no specific visual reference exists. Compose from the closest page recipe and existing contracts, then apply `DESIGN.md` product direction and `PATTERNS.md` composition rules.
- `Exploration mode`: use only when the requester explicitly asks for alternatives or a new visual direction. Exploration output must not be presented as the production implementation.

**Use source precedence:**

1. exact referenced Figma node or approved screenshot
2. existing page recipe for the same page family
3. existing component contract and approved variant
4. `DESIGN.md` product direction, `COMPONENTS.md` visual foundation and contracts, and `PATTERNS.md` composition rules
5. AI inference only for information grouping, copy structure, and safe responsive adaptation

AI must not use a lower source to contradict a higher source. A generic rule cannot justify changing an explicit Figma composition, and a component contract cannot justify adding a component that the current user story does not need.

**Visible Element Evidence Check:**
For every visible region, record:

- `Element`: what is visible
- `User Need`: what current task it supports
- `Evidence`: reference node, page recipe, component contract, or explicit request
- `Relationship`: which nearby object or action it belongs to
- `Removal Test`: what breaks if it is removed

If a visible element has no evidence, no clear relationship, or no meaningful removal consequence, do not implement it. This applies to logos, navigation items, sidebars, cards, borders, icons, badges, progress labels, helper copy, and secondary actions.

**Never invent these without evidence:**

- brand marks, logo combinations, navigation shells, fixed or sticky behavior
- new cards, side panels, banners, hero areas, tabs, or modal structures
- icons chosen only to occupy an available slot
- borders, shadows, radii, gradients, decorative artwork, or color treatments
- extra actions, progress indicators, recommendations, or explanatory panels

**Page Composition Gate:**

- one page must have one identifiable current task or state
- every visible block must be adjacent to the object or action it explains
- optional content must pass the module-omission test before it is included
- repeated information must have one owner; do not restate the same lesson, date, or destination in multiple regions
- mobile must preserve the same task sequence and local relationships before exposing secondary content
- a real page must not display component names, rule labels, legends, or implementation notes

**Completion status:**
AI may call the page complete only after reporting `Pass`, `Needs Decision`, or `Blocked` for each gate item. `Needs Decision` and `Blocked` are not complete implementation states.

### 0.5A Executable Component Gate

After identifying the required component but before writing its markup or styling, AI must resolve it through the executable UI kit when that component has been migrated. This gate is fail-closed.

1. Look up the component contract in `COMPONENTS.md` and its accepted props, defaults, states, tokens and assets in generated `catalog-runtime/component-api.json` or `catalog-runtime/component-api.json`. The registry remains `catalog-runtime/contracts.json`; the API index is its searchable implementation view.
   - Before applying a Catalog color in production, look it up in generated `catalog-runtime/foundation-api.json`: it carries the Foundation's own value, and a colour that is not there is not a Catalog colour.
   - Run `npm --prefix maintenance run component:check -- <component-name>` where the Catalog runtime is available. A `BLOCKED` result means the component gap must be reported; it is never permission to create an approximation.
2. Call the shared Catalog runtime component with documented props and supplied slots only. Do not pass a class-name, arbitrary attributes, a raw token, or an unregistered asset as an escape hatch. Do not recreate its DOM anatomy, CSS, hover, focus, disabled, loading, selected, input, or ARIA behavior in the page or Catalog.
3. If the contract does not contain the required variation, report the gap and request approval for the smallest extension. Do not silently add a new class, raw color, radius, shadow, icon, or state.
4. Run `npm --prefix maintenance run test:contract` before handoff. For a migrated visual component, run `npm --prefix maintenance run test:visual` after the baseline is established. A failing test is a blocked handoff, not a cosmetic follow-up. `npm --prefix maintenance run test` is the required final check when both apply.
5. Report implementation evidence in the handoff as `region → component → props → contract state coverage`. If a visible region does not resolve to a component, Pattern, or approved extension, remove it or mark the work incomplete.

The Catalog is a consumer of the Catalog runtime, not an alternate implementation. It may arrange fixtures, documentation headings, and state examples, but it cannot own a second set of component styling.

### 0.6 Generalization Before Systemization

Feedback from a demo, screenshot, reference review, or implementation review is calibration evidence. It is not automatically a new system rule. A demo records one concrete composition and state; it is not an independent source of visual, interaction, or page-architecture rules.

When a correction is received, AI must first identify the underlying failure mode, then test whether the resulting principle applies beyond the current page.

Classify the result before changing a document:

- `Reference-specific direction`: preserve it in the supplied reference analysis or current page proposal. Do not promote it to a shared rule.
- `Component contract`: use when the issue concerns the stable structure, state, or behavior of one reusable component family.
- `Composition rule`: use when the issue concerns information relationship, task sequence, hierarchy, or module placement across multiple page contexts.
- `Visual foundation`: use only when the issue concerns a stable token, typography, shape, icon, border, surface, or motion behavior across the product.
- `Acceptance check`: use when the issue is a failure that a generated implementation must be able to detect consistently.

Rules must state the general trigger, user-impacting outcome, and boundary. Do not turn a page-specific correction into a literal prohibition merely because it appeared in one demo.

If the evidence is limited to one page and no stable principle can be identified, retain it as a reference-fidelity note and do not add a new component, visual rule, or page-recipe constraint.

### 0.6A Demo Calibration Audit

Before promoting a correction observed in a demo, screenshot, or review into a shared document, record:

```md
Calibration Audit

Source:
Observed Correction:
Underlying Failure Mode:
Candidate Principle:
Classification: Reference-specific direction / Component contract / Composition rule / Visual foundation / Acceptance check
Cross-Context Evidence:
User-Impacting Outcome:
Boundary Or Counterexample:
Document Destination Or Reference Location:
Decision: Promote / Keep reference-specific / Remove
```

Rules:

- start from the user-facing failure, not from the literal placement, color, control, or copy in the demo
- a candidate shared rule must name its general trigger, outcome, and boundary without referring to the demo's subject matter or screen coordinates
- treat a visible block, a color treatment, a modal destination, or shell behavior as reference-specific by default unless cross-context evidence proves a reusable relationship
- promote a correction to a component contract only when it changes the stable anatomy, state model, slot compatibility, or interaction boundary of that component family
- promote a correction to a composition rule only when it governs object proximity, information hierarchy, task order, continuation choice, or parent-child ownership across more than one page context
- promote a correction to visual foundation only when the same semantic token, typography, border, surface, icon, shape, or motion principle applies independently of page content
- promote a correction to an acceptance check only when an evaluator can detect the failure consistently without reproducing the demo
- when a correction says that one specific implementation is wrong, write the underlying valid pattern or reuse requirement. Do not preserve the implementation detail as a blanket prohibition
- treat a reference instance's width, height, line clamp, or visible content density as calibration evidence by default. Promote it to a named component variant or acceptance check only when its task reason, content boundary, overflow behavior, and responsive behavior are also known

### 0.6B Calibration Record Handling

A calibration record is evidence, not an implementation dependency or a second source of truth. Do not use it to override a supplied reference, an approved page recipe, a component contract in `COMPONENTS.md`, a product pattern in `PATTERNS.md`, product direction in `DESIGN.md`, or this document.

When a later demo or review produces new evidence:

1. record the audit using the `0.6A` template in the relevant delivery or review record
2. classify the correction and record cross-context evidence
3. update the destination contract only after the audit decision is `Promote`
4. keep reference-specific decisions with their reference or review record rather than copying them into shared rules

For a completed, one-off demo, retain the promoted rule only in its destination document. Preserve a historical audit record only when its decision trail is needed for ongoing review or migration work.

## 1. Related Documents And Rule Ownership

### 1.1 Source Of Truth

`DESIGN.md` is the product-principles and product-direction source of truth.

`COMPONENTS.md` is the visual-foundation and reusable-component source of truth.

`PATTERNS.md` is the product-composition and object-relationship source of truth.

`EXECUTION.md` is the execution source of truth.

### 1.2 Keep A Rule In COMPONENTS.md If It Is Mainly About

- visual tokens
- styling primitives
- typography specifications
- spacing scales
- radius scales
- elevation primitives
- icon asset definitions
- content style
- reusable component anatomy, props, states, accessibility, and ownership boundaries

### 1.3 Keep A Rule In PATTERNS.md If It Is Mainly About

- a stable product object such as teacher evaluation, booking, payment, workspace navigation, or Mira
- supplied product data relationships between components
- visual composition of a recognized product task area
- product-specific use of components without changing their generic contracts

### 1.4 Keep A Rule In EXECUTION.md If It Is Mainly About

- when a pattern should be used
- where an action should appear
- what information should appear first
- how a page or component should behave across contexts
- how repeated elements should or should not behave
- how data should be turned into usable content

### 1.5 Conflict Resolution

If a rule conflicts:

- product principles and product direction defer to `DESIGN.md`
- visual token, styling, and reusable-component rules defer to `COMPONENTS.md`
- product object and composition rules defer to `PATTERNS.md`
- task, hierarchy, page, behavior, and execution rules defer to `EXECUTION.md`

All execution references must name their source document: `DESIGN.md` for product principles, `COMPONENTS.md` for visual and component contracts, and `PATTERNS.md` for product composition.

## 2. Request Intake For Execution

### 2.1 Why Request Intake Is Required

AI should not respond directly to vague requests such as:

- make this page better
- add a feature here
- improve this flow

Every execution request should begin with a structured intake.

Most requests do not arrive as one. `INTAKE.md` owns how an agent gets there: it scans the request against the decision catalog in `docs/intake.slots.json`, treats what the request already settles as settled, and asks only about the gaps that apply — at most five, each with a default so no request is ever blocked on an answer. This section owns the fields that intake collects; `INTAKE.md` owns how they are obtained.

### 2.2 When To Use This Intake

Use this intake for:

- new page
- existing page enhancement
- section
- module
- widget
- guidance block
- flow step

### 2.3 Core Input Method: User Story

Use this format:

```md
As a [user in a specific situation], I want to [complete a task], so that I can [reach an outcome].
```

### 2.4 Supporting Fields

Every intake should also include:

- `Object To Create Or Improve`
- `Current Context`
- `Must-Have Information`
- `Primary Action`
- `Constraints Or Special Notes`

### 2.5 Request Intake Template

```md
Request Intake For Execution

User Story:
As a [user in a specific situation], I want to [complete a task], so that I can [reach an outcome].

Object To Create Or Improve:

- new page / existing page enhancement / section / module / widget / guidance / flow step

Current Context:

- where this appears in the product

Must-Have Information:

- information that must be visible for this to work

Primary Action:

- the main action the user should be able to take here

Constraints Or Special Notes:

- business constraints
- existing patterns to reuse
- device priority
- information that can be secondary or collapsed
- possible missing data
- anything AI should be careful about
```

## 3. How AI Should Respond To A Request Intake

### 3.1 AI Must Start With Task Interpretation

AI must first interpret:

- the object type
- the current context
- the user situation
- the primary task
- the primary action
- the likely success condition

### 3.2 AI Must Separate Confirmed And Assumed Information

AI should distinguish:

- `Confirmed`: explicitly stated in the intake
- `Assumed`: inferred from context or system rules

### 3.3 AI Must Identify The Type Of Work

Examples:

- new page generation
- existing page enhancement
- new module addition
- guidance insertion
- hierarchy improvement
- CTA improvement

### 3.4 AI Must Reuse Existing Patterns First

AI should try this order:

1. existing page recipe
2. existing assembly pattern
3. existing component contract
4. new structure only when the task is materially different

### 3.5 High-Impact Decisions Should Be Escalated

AI should explicitly confirm decisions that would:

- change the primary task
- change the primary action
- introduce a new major pattern
- materially change commitment logic
- materially change business-critical information priority

### 3.6 Requirement-To-Component Selection Engine

AI must select components from the user's task and context, not from visual preference or a requester's casual component naming.

Before selecting a component, extract these task signals from the intake:

- `User`: who is acting and what situation are they in?
- `Task Verb`: find, narrow, evaluate, select, book, enter, recover, review, continue, learn, or manage.
- `Target Object`: teacher, lesson, time, booking, learning task, progress, message, or another product object.
- `User Outcome`: what becomes clearer, selected, completed, or recoverable?
- `Required Data`: what must be visible before the next action?
- `Interaction Depth`: passive information, one local choice, a grouped task, or a multi-step task.
- `Scope`: page, section, repeatable unit, local enhancement, feedback state, or invoked secondary surface.
- `Frequency`: one-time, repeated across a collection, persistent during scanning, or occasional on demand.

### 3.6A Scope Selection Matrix

| Requirement Shape                                                                    | Default Output Object                             | Selection Rule                                                                           |
| ------------------------------------------------------------------------------------ | ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| User needs to complete a distinct end-to-end task                                    | Page recipe or flow step                          | Start from the closest page family before adding modules.                                |
| User needs a capability inside an existing task page                                 | Existing-page enhancement or section              | Reuse the existing page hierarchy and declare what remains unchanged.                    |
| User repeatedly evaluates several instances of the same object                       | Reusable card, row, or list unit                  | Choose an existing repeated-object contract before creating new card anatomy.            |
| User needs a short local adjustment or secondary task                                | Invoked surface, local control, or guidance block | Choose the smallest appropriate popover, dialog, drawer, sheet, or inline pattern.       |
| User needs to enter, correct, or submit structured data                              | Form component family plus feedback pattern       | Start from input, label, validation, and submission behavior rather than a generic card. |
| User needs to understand a system result, lack of content, warning, or recovery path | Feedback pattern family or empty-state family     | Match the state meaning before choosing visual treatment.                                |
| User needs more context about an already visible object                              | Continuation pattern                              | Use inline reveal, expand, `See all`, overflow, or a follow-up view based on depth.      |

### 3.6B Task Signal To Component Matrix

| User Need Or Task Signal                                                                                             | Default Component Or Pattern Candidates                                                           | Selection Boundary                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Start teacher discovery                                                                                              | `search-bar`                                                                                      | Use when the user needs to express or revise initial discovery intent. Do not replace it with a dense filter panel before results exist.                                            |
| Narrow an existing result set                                                                                        | `filters-panel` + `applied-filters summary` + optional `sort-control`                             | Keep active narrowing visible in results. Choose inline, dialog, drawer, sheet, or dedicated view through `6.11`.                                                                   |
| Change only result order                                                                                             | `sort-control`                                                                                    | Use a compact utility control or popover. Do not use a full filter surface for ordering alone.                                                                                      |
| Evaluate several teachers quickly                                                                                    | `teacher-card` + `tag / badge` and trust metadata                                                 | Reuse the repeated evaluation unit; do not create a new card for each visible data field.                                                                                           |
| Verify teacher fit before commitment                                                                                 | teacher detail recipe + `trust-metrics` + `review-card` + `lesson-option group` as needed         | Add only the evidence required for the current fit decision; do not expose every archive-like detail.                                                                               |
| Compare or choose lesson offers                                                                                      | `lesson-option group` + `pricing-row`                                                             | Keep price, duration, lesson meaning, and selected state together. Do not use free-floating price blocks.                                                                           |
| Find or select a bookable time                                                                                       | `availability schedule` + `lesson-option group` + `booking-panel`                                 | Keep timezone, selected duration, slot eligibility, and selected time connected. A profile preview informs evaluation; a booking schedule completes one time choice.                |
| Continue or complete a booking                                                                                       | `booking-panel` + `lesson-option group` + feedback or availability state when needed              | Keep required choice, commitment context, and the next booking action in one recoverable path.                                                                                      |
| Show position in a bounded multi-step task                                                                           | `flow-progress` built from `stepper` items                                                        | Communicate current, completed, blocked, and error state. Do not use it as page navigation, tabs, breadcrumbs, or an implicit route map.                                            |
| Show continuous completion, consumption, or measured work                                                            | `progress`                                                                                        | Use a supplied bounded value or explicit indeterminate state. Do not use it for named steps, unknown loading structure, or decorative momentum.                                     |
| Reveal one bounded supporting section or a related local section group                                               | `disclosure / accordion`                                                                          | Keep the summary available and request a controlled in-place expansion. Do not hide task-critical requirements, turn it into navigation, or create a wall of unrelated disclosures. |
| Switch closely related content panels or a compact local view mode                                                   | `tabs` or `segmented-control`                                                                     | Use tabs for panels and segmented control for a small immediate mode switch. Neither is global navigation, task progress, or a substitute for a form choice group.                  |
| Confirm a non-blocking completed or recoverable outcome                                                              | `toast`                                                                                           | Use only when the result does not need persistent local task context. Do not use a toast as the sole recovery path for validation, payment, or a blocked task.                      |
| Explain a persistent local warning, error, or blocked state                                                          | `alert` + optional local recovery                                                                 | Keep the state beside the affected form, collection, booking, or payment context until resolved or deliberately dismissed.                                                          |
| Reserve a known content structure while data loads                                                                   | `skeleton`                                                                                        | Mirror meaningful layout without invented text, false availability, or interactive targets.                                                                                         |
| Move through a bounded collection                                                                                    | `pagination`                                                                                      | Navigate a result or history collection only. Do not use it for task steps, route shell navigation, or endless scrolling that has no page model.                                    |
| Choose a payment route                                                                                               | `payment-method` + `choice-group` + local feedback when applicable                                | Keep default, selected, unavailable, verification-required, and failed method states explicit. Do not place raw card data or payment SDK behavior in the component contract.        |
| Review amount before payment                                                                                         | `order-summary` + payment-stage action                                                            | Keep purchase context, applied discount or credit, fees or tax when supplied, and final amount due together. The summary never calculates or submits payment.                       |
| Enter or change structured information                                                                               | `form-field` + `text-input`, `textarea`, or `select / combobox` + `error-message` when applicable | Use form contracts when value entry or validation exists; a display row is not an input substitute.                                                                                 |
| Choose one date or bounded date range                                                                                | `date-picker` + `form-field` when a visible field label or validation is needed                   | Use for a date decision. Do not reuse a schedule grid, historical calendar, or booking availability view as a generic date picker.                                                  |
| Choose one supplied time interval                                                                                    | `time-slot` inside `availability schedule` or a documented single-select time group               | Parent owns date, timezone, duration, availability, and resulting task state. A time-slot never derives or holds booking inventory.                                                 |
| Adjust a small bounded integer quantity                                                                              | `form-field` + `number-stepper`                                                                   | Use only when increment and decrement are clearer than entering a free-form value. Do not use it for package, date, time, or money selection.                                       |
| Explain success, warning, blocked progress, or an error                                                              | `feedback family`                                                                                 | Use feedback for a state transition or system meaning; do not use it as decorative emphasis.                                                                                        |
| Explain no results, no availability, or first-use absence                                                            | `empty-state family`                                                                              | Select variant from the reason content is missing, then expose the strongest recovery action.                                                                                       |
| Add a local section to orient or continue                                                                            | `section header / action header`                                                                  | Use only when the section needs a distinct task meaning or local utility action.                                                                                                    |
| Offer a compact temporary choice, setting, or edit task                                                              | `overlay family`                                                                                  | Select popover, modal, drawer, dropdown menu, or sheet from task depth and device context, not from visual novelty.                                                                 |
| Read substantial supporting detail without leaving the current evaluation page                                       | `long-form detail dialog`                                                                         | Use only after a concise inline preview and explicit `Show more` trigger. Preserve the source page and keep booking context reachable.                                              |
| Surface a personalized recommendation, progress cue, learning continuation, optional notification, or campaign entry | `mira module family`                                                                              | Select Mira intent from the learner outcome and trigger, not from visual style. Required course actions, errors, and booking decisions remain in their task-specific patterns.      |
| Show more of a supporting collection or explanation                                                                  | `Continuation Pattern Library`                                                                    | Preserve the default summary and select the smallest continuation pattern that retains meaning.                                                                                     |
| Add a learning summary, practice flow, or post-lesson capability without a matching contract                         | Existing page recipe plus a new composition proposal                                              | Do not invent a named reusable component first. Define the task structure, reuse available primitives, and explain the actual structural gap.                                       |

### 3.6C Component Selection Rules

- Select components by task role, required data, interaction depth, and repetition frequency. Never choose a component merely because it is visually familiar or because the request says “add a card.”
- Start from the smallest complete assembly. A component may be added only when it resolves a distinct user need that another chosen component does not already cover.
- One user story may require several components, but each must have a non-overlapping role: for example, `filters-panel` narrows, `applied-filters summary` preserves current state, and `teacher-card` supports evaluation.
- Repeated content should use one consistent unit contract. Do not create several near-identical cards because fields differ slightly.
- A request for “more information” does not automatically justify a new module. First test whether the information belongs in the current object, a continuation pattern, or an invoked surface.
- A request for “a button” does not automatically justify a new action. First classify it as execution, selection, utility, recovery, navigation, or dismissal, then apply the action hierarchy rules.
- If a component contract matches the task, reuse it even when the copy, data, or placement differs. Propose a new component only when the contract cannot support the required task role or state model.

### 3.6D Confidence And Escalation Rules

- If the task signal maps clearly to an existing contract, AI should select it without asking the requester to choose a component.
- AI should ask a focused question only when the answer materially changes one of these decisions:
  - whether the user is evaluating, selecting, or committing
  - whether a value changes immediately or needs explicit apply
  - whether the task is local, persistent, or a dedicated flow
  - whether multiple options are mutually exclusive or multi-select
  - whether a new capability changes business meaning, trust logic, or commitment logic
- If no existing contract clearly fits, AI should first provide the closest reusable composition and state the specific gap. It must not silently invent a new component family.

### 3.6E Required Component Selection Trace

Every generated proposal must include:

```md
Component Selection Trace

Requirement Signal:
Task Role:
Chosen Component Or Pattern:
Why It Fits:
Required Data Or State:
Surface Or Placement:
Existing Components Considered But Not Chosen:
Why A New Component Is Or Is Not Needed:
Composition Trace:

- direct use or parent component:
- accepted slot and child component or information:
- interaction owner:
- omitted optional slots and why:
  Assumptions Or Focused Decision Needed:
```

### 3.6F Reference Fidelity And Visual Evidence

When a reference page is supplied:

- read the reference as a composed product page, not as an inventory of components
- preserve its shell, major regions, relative density, content order, and interaction surfaces unless the request explicitly asks for a change
- treat empty space, omission, alignment, and module size as intentional design information
- do not add a generic version of a component just because the reference contains a related capability elsewhere
- do not move information across regions without checking proximity, hierarchy, and mobile order
- if the reference cannot be inspected with enough confidence, ask for a screenshot, exported frame, or focused decision rather than approximating the page

Every reference-based proposal must include:

```md
Reference Mode:
Reference Source:
Reference Elements Reused:
Reference Elements Intentionally Omitted:
New Elements Required By The User Story:
Visible Element Evidence Check:
Known Differences:
Open Decisions:
```

### 3.7 Suggested AI Response Structure

```md
Working Mode:
Task Interpretation:
Confirmed Information:
Assumed Information:
Reference Fidelity Summary:
Recommended Scope:
Recommended Pattern Direction:
Component Selection Summary:
Composition Trace:
Visible Element Evidence Check:
Composition And Proximity Check:
Responsive Order Check:
Compliance Status:
Next Step:
```

## 4. Product Execution Principles

### 4.1 Product Context

italki is a consumer education marketplace centered on helping learners find the right language teacher and move quickly into a trial booking.

### 4.2 Execution Priorities

Execution should prioritize:

- teacher identity
- teaching focus
- trust signals
- price and duration clarity
- availability and readiness
- the primary action

### 4.3 Task-First Product Rhythm

- search pages help learners filter, evaluate, and select teachers
- detail pages help learners confirm fit and move toward booking
- booking surfaces reduce uncertainty before commitment
- learning-home pages help learners understand their nearest lesson, resolve time-sensitive course changes, and continue an active learning relationship
- on a learning-home page, a time-sensitive lesson or an action-required course state must appear before recommendations, promotions, progress recaps, or other optional content
- compose each page using the reference-derived Product Composition Direction in `PATTERNS.md`: create a real task workspace with controlled visual cadence, not a visible catalogue of component families

### 4.4 Default Emphasis System

- The black/gray emphasis system is the default interaction system.
- `Gray/600` is the default emphasis fill.
- `Foreground/Title` is reserved for hover, focus, and stronger emphasis.
- The existence of the gray emphasis system does not mean every important action should become a filled gray button.
- Filled gray buttons should still be used sparingly and should not appear as a wall of equal-priority major actions.

### 4.5 Red CTA Usage

- The brand red button uses `Primary/Main` (`#FF4338`).
- Use the brand red button only when a page has one clearly dominant primary execution action.
- A page must not use more than one red button.
- If a page has multiple major actions, do not replace the red button with multiple filled gray major-action buttons. Default those actions to the secondary hierarchy instead.
- If a page uses the brand red button as its primary execution action, other actions on the same page should follow the existing secondary button rules and use secondary, ghost, text, or other non-filled treatments.
- The brand red button should not be used for regular selected states, filter selection, or repeated list CTAs.

### 4.6 Button Decision Tree

Use this decision order:

1. Does the page have one clearly dominant primary execution action?
   - If yes, use one brand red button (`#FF4338`) for that action.
2. Does the page have more than one major action?
   - If yes, do not use a red major-action button.
   - Do not render all of those major actions as filled gray buttons either.
   - Default those actions to secondary, ghost, text, or other non-filled treatments unless one action becomes singular within a clearly scoped local surface.
3. Is the action secondary, supporting, canceling, filtering, or utility-focused?
   - If yes, use the existing secondary, ghost, text, or other non-filled button rules.
4. Is the action part of a repeated list or repeated card structure?
   - If yes, do not use repeated filled red CTAs. Default to secondary or ghost treatments unless a hovered, focused, selected, or active state is intentionally being promoted.

### 4.6A Button Escalation Matrix

| Situation                                                            | Allowed Highest Emphasis              | Default Rule                                                                                                                             |
| -------------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| One clearly dominant page-level execution action                     | One red button                        | All other actions on the same page must be secondary, ghost, text, or utility-only.                                                      |
| Multiple parallel major actions on the same page                     | Secondary hierarchy only              | Do not make them all filled. Start from secondary, ghost, or text treatments.                                                            |
| One clearly dominant local action inside a contained surface         | One filled gray button if needed      | Use this only when the local surface has one singular next step and the page is not already creating repeated high-emphasis competition. |
| Repeated actions across cards, rows, or list items                   | Secondary or ghost only at rest       | Filled emphasis may appear only on hovered, focused, selected, or active items when intentionally promoted.                              |
| Filters, sorting, utility, navigation, and reversible local controls | Secondary, ghost, text, or chip state | Do not escalate these into main CTA styling.                                                                                             |
| Recovery actions inside empty states, warnings, or blocked states    | Usually secondary or ghost            | Escalate only when there is one clearly best recovery path and no competing equal-priority action nearby.                                |

### 4.6B Escalation Tests

Before AI escalates any action into a filled major button, it must pass all of these tests:

- `Singularity Test`: is this the one clearest next action in the current scope?
- `Competition Test`: will this create more than one equally loud button in the same visible area?
- `Repetition Test`: does this action repeat across cards, rows, or modules?
- `Recovery Test`: is this actually a supporting or corrective action rather than the main path?
- `Reversibility Test`: is this a lightweight, reversible, or utility action that should remain visually lighter?

If any answer suggests competition, repetition, recovery, or reversibility, the action should be downgraded to the secondary hierarchy.

### 4.7 CTA Density In Repeated Structures

- Do not repeat filled gray or red CTA buttons across multiple cards in the same view.
- In card lists, use secondary, ghost, or text actions by default.
- Promote only the hovered, focused, selected, or active card CTA to a filled emphasis state.
- A final booking panel may use a single filled CTA because it is not repeated across competing units.
- If several important actions coexist in one visible region, default them all to the secondary hierarchy unless one action is clearly dominant and the others are visibly subordinate.

### 4.8 Filter And Selection Behavior

- Regular filter selection uses the black/gray emphasis system, not red.
- Quick filters and filter chips may use:
  - `Gray/600` fill with white text
  - white fill with a dark border
- Unselected chips and passive neutral tags on gray page backgrounds must use white fill; chips retain their documented border, while tags use the `tag / badge` contract. Do not use colored soft fills for neutral metadata.

### 4.9 Typography Hierarchy In Execution

- Typography should clarify the current decision step, not decorate the page.
- Most pages should establish one clear page-level lead, one section-title tier, one local-module title tier, one body tier, and one supporting caption tier.
- Do not give every block a strong headline just because the block is important.
- Repeated cards, repeated rows, and repeated modules should reuse the same internal type hierarchy instead of escalating each item independently.
- Compact controls, chips, badges, utility rows, and dense metadata should stay in compact text tiers and must not borrow page-heading energy.

### 4.9A Typography Escalation Matrix

| Situation                                                                           | Allowed Highest Emphasis      | Default Rule                                                        |
| ----------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------- |
| One page-level heading that frames the current task or decision                     | Page lead                     | Use one clear lead only; nearby sections should step down.          |
| Major section that reframes the next decision area                                  | Section title                 | Keep section titles consistent across sibling sections.             |
| Local card, panel, module, empty state, or feedback block title                     | Module title                  | Keep it below the page lead and section-title tier.                 |
| Standard body explanation, fit summary, guidance copy, and review detail            | Body text                     | Use weight, spacing, and grouping before escalating size.           |
| Supporting metadata, helper copy, badge labels, filter labels, and row labels       | Caption or compact label tier | Keep these clearly subordinate to titles and body content.          |
| Compact controls such as buttons, chips, pills, badges, tabs, and segmented options | Control text only             | Do not promote compact controls into heading-sized typography.      |
| Strong numeric content such as price, ratings, or trust figures                     | Numeric emphasis only         | Escalate the number if needed, but keep the supporting label quiet. |

### 4.9B Typography Escalation Tests

Before AI increases text prominence, it must pass all of these tests:

- `Scope Test`: is this text defining the current page step, section step, or local module step?
- `Container Test`: does the container have enough visual space to support the larger text without making nearby controls feel undersized?
- `Competition Test`: will this create multiple equally loud headings in the same visible area?
- `Repetition Test`: will this stronger type repeat across a list, grid, or stack and create noise?
- `Support Test`: could the hierarchy be solved with spacing, grouping, contrast, or weight instead of a larger size?

If any answer suggests crowding, repetition, or hierarchy competition, the text should stay at the existing tier or step down.

### 4.9C Compact Surface Typography Rules

- Standard buttons should stay on the compact button text tier defined in `COMPONENTS.md`.
- Chips, pills, badges, compact tabs, segmented controls, and dense utility rows should use compact text tiers only.
- If a control height is under 40px, its text should almost never exceed the compact control range defined in `COMPONENTS.md`.
- If several controls appear in one row, keep both the size tier and visual density aligned unless one item is intentionally a different object type.
- If AI is unsure whether a compact surface needs larger text, assume it does not and strengthen hierarchy another way.

### 4.10 Local Control Grouping And Density

- A local surface should expose only the controls that materially help the next decision or recovery step.
- Do not let one local area contain several visually similar action objects that all appear equally actionable.
- Inside a local module, separate:
  - information labels
  - passive metadata
  - lightweight filters or toggles
  - local utility actions
  - the one strongest local next step, if one exists
- Tag, badge, and chip clusters should usually stay attached to the information they describe, not drift into the action row.
- If a local surface needs many controls, distribute them across header, body, and footer intentionally rather than piling them into one strip.

### 4.10A Local Action Group Matrix

| Situation                                                          | Allowed Highest Density                           | Default Rule                                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------- | ----------------------------------------------------------------------------- |
| Section header with one local utility action                       | Title plus one secondary action                   | Keep the action tightly scoped and visually lighter than the heading.         |
| Result header with sorting, filter access, or view controls        | Small utility cluster                             | Group these controls together; do not spread them out like competing CTAs.    |
| Card-level action area in repeated lists                           | One clear local action plus optional utility icon | Keep the rest of the card informational. Avoid parallel CTA rows.             |
| Empty state or warning recovery area                               | One best recovery path plus optional fallback     | If multiple recovery options are shown, keep them all secondary by default.   |
| Booking or commitment panel with one clear next step               | One dominant local action plus one fallback       | Supporting changes should stay lighter and conceptually separate from commit. |
| Dense metadata plus filters plus actions in the same local surface | Split across zones                                | Do not keep all three in one uninterrupted row or cluster.                    |

### 4.10B Local Control Group Tests

Before AI adds another visible control to a local area, it must pass all of these tests:

- `Need Test`: does this control materially change evaluation, selection, execution, or recovery?
- `Scope Test`: is this control local to this module, rather than page-level or global?
- `Zone Test`: is it placed in the correct zone: information, filter, utility, or action?
- `Competition Test`: will it create another control that looks equally important to its neighbors?
- `Crowding Test`: does the row or cluster still read clearly without wrapping into visual noise?

If any answer suggests weak necessity, wrong scope, hierarchy competition, or crowding, the control should be moved, downgraded, collapsed, or removed.

### 4.10C Local Group Composition Rules

- A local action row should usually contain no more than one strong execution action.
- Utility controls that affect presentation, sorting, saving, sharing, filtering, or navigation should cluster together and remain visually secondary.
- Passive badges and metadata should not sit inside the same row as the main execution action unless the row still reads clearly as information-first.
- If a row mixes a text button and an icon button, they should still read as the same control tier rather than as unrelated emphasis levels.
- If a surface needs both metadata chips and actions, metadata should usually appear above or before the action area.
- If multiple local actions are necessary, prefer:
  - one action row for the immediate next step
  - one separate utility row or header action for supporting controls
- Repeated card actions should stay compact and predictable across siblings.
- If AI is unsure whether one more local control is helping, assume it is not helping.

## 5. Page Generation Framework

### 5.1 Generation Must Start From The User Task

Every output must begin by defining:

- object goal
- primary task
- primary action
- success condition

### 5.2 Supported Output Objects

- page
- section
- module
- widget
- flow step
- guidance block
- enhancement to an existing page

### 5.3 Define The Functional Unit First

AI must determine whether the request is for:

- a whole page
- a reusable module
- a contextual guidance block
- a local enhancement

### 5.4 Define Scope Before Structure

Every proposal must define:

- what is in scope
- what is out of scope
- whether the work affects the whole page or a local area

### 5.5 Every Output Must Define

- working mode and the highest-priority visual source used
- the primary action
- must-have information
- what can be secondary or collapsible
- the next-step logic
- a composition trace proving every component, slot, and interaction owner is declared by an existing contract
- a visible-element evidence record, including deliberately omitted modules
- a `Pass`, `Needs Decision`, or `Blocked` status for every `9.8 Page Composition Acceptance Gate` row: task clarity, element evidence, proximity, omission, repetition, surface discipline, component reuse, mobile sequence, interaction reality, and reference fidelity

### 5.6 Suggested Generation Output Skeleton

```md
Generated Proposal

Object Goal:
Object Type:
Scope:
Working Mode:
Highest-Priority Visual Source:
Primary Action:
Must-Have Information:
Default Exposed Information:
Secondary Or Collapsible Information:
Component Selection Trace:
Composition Trace:
Visible-Element Evidence Record:
Deliberately Omitted Elements And Why:
Next-Step Logic:
Existing Patterns To Reuse:
Recommended Structure:
Assumptions:
Execution Gate Status:
```

## 6. Information Architecture Rules

### 6.1 Information Must Follow The Main Task

Primary information must directly support the current task.

### 6.2 Information Hierarchy Must Not Be Flat

Every proposal must distinguish:

- primary information
- secondary information
- supportive or collapsible information

### 6.3 Required Information Comes Before Complete Information

Do not show content just because it exists.

Required information should appear before supporting or decorative information.

### 6.4 Information Order Must Reflect Decision Sequence

The order of sections should match how the user:

- understands
- evaluates
- confirms
- acts

### 6.5 The First Screen Must Answer The Core Question

Every page recipe or new object proposal must define its first-screen question.

### 6.6 Learning And Post-Booking Objects Use Different IA Logic

Do not force teacher marketplace evaluation and selection logic onto:

- booked lesson pages
- lesson preparation pages
- post-lesson summary pages
- practice pages

### 6.7 AI May Infer Hierarchy Within Safe Scope

AI may infer:

- which information is primary vs supportive
- how to group related content
- whether supporting content should be delayed or collapsed

AI should escalate only when hierarchy changes:

- business meaning
- primary action priority
- trust logic
- commitment logic

### 6.8 Suggested IA Output Skeleton

```md
Information Architecture Proposal

Main User Question:
Primary Information:
Default Exposed Information:
Content Surface Plan:
Secondary Information:
Supportive Or Collapsible Information:
Continuation Paths:
Recommended Order:
Why This Order Works:
Assumptions:
```

### 6.9 Information Density And Collapse

- Default exposure should show the minimum information needed to understand, evaluate, and take the next step.
- Completeness should follow relevance, not data availability.
- Supporting information may remain present in the object model without being fully expanded in the default UI.
- If a surface feels dense, reduce or delay secondary information before weakening the primary task path.
- When a page contains both decision-critical and background content, the background content should enter later, lighter, or behind a continuation pattern.

### 6.9A Information Exposure Matrix

| Situation                                                    | Default Exposure                                                   | Default Rule                                                                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| First screen of a page                                       | Only the core question, required decision data, and next step      | Do not preload supporting detail that the user has not yet asked for.                                     |
| Repeated cards, rows, or list items                          | Compressed evaluation view                                         | Show only the information needed to compare options at a glance.                                          |
| Detail page sections                                         | One clear section summary plus the most decision-relevant evidence | Move deeper explanation, long lists, and archive-like content behind continuation patterns when possible. |
| Booking or commitment surfaces                               | Current booking summary, required choices, and action context      | Keep reassurance and policy content present but visually lighter and later.                               |
| Learning, summary, or practice surfaces                      | Current task, current progress, and immediate continuation cue     | Historical, extended, or reference content should usually come after the active task layer.               |
| Filters, reviews, policies, FAQs, and supporting collections | Progressive reveal                                                 | Default to the highest-value subset first, then expose more on demand.                                    |

### 6.9B Collapse And Omission Tests

Before AI keeps content visible by default, it must pass all of these tests:

- `Task Test`: does this help the user complete the current task right now?
- `Timing Test`: does the user need this before the next action, or only after interest is established?
- `Evaluation Test`: does this help evaluate options, or is it merely additional background?
- `Crowding Test`: does keeping this visible make the surrounding hierarchy flatter or noisier?
- `Continuation Test`: if this is hidden initially, is there still a clear path to reach it later?
- `Mobile Test`: will this remain usable when the layout collapses to a narrower viewport?

If any answer suggests weak immediacy, weak evaluation value, hierarchy crowding, or poor mobile fit, the content should be collapsed, summarized, delayed, or omitted from the default state.

### 6.9C Default Density Rules

- First screens should usually expose one clear question, one main action path, and only the evidence needed to support that path.
- Repeated cards should usually expose one fit cue, one trust cluster, one price or commitment cue, and one restrained action area.
- Long supporting explanation should usually be summarized first and expanded only when the summary is insufficient.
- If a section contains a long set of similar items, show the highest-value subset first and provide a clear continuation pattern such as `See all`, `Overflow summary`, or a dedicated follow-up view.
- If several secondary details compete in the same area, group them into a summary block before exposing them as individual rows.
- If filters, reviews, metrics, or policies become numerous, reduce visible count before shrinking typography or packing everything into dense walls.
- On mobile, preserve meaning by collapsing lower-priority detail before collapsing core decision context.
- If AI is unsure whether a piece of information belongs in the default state, assume it does not belong there unless removing it would block understanding or action.

### 6.10 Continuation Pattern Library

- A continuation pattern gives secondary information, a larger collection, or a focused subtask a deliberate place to continue without flattening the default page hierarchy.
- Choose the smallest pattern that preserves the user's current task, selection context, and recovery path.
- A continuation pattern must answer three questions clearly: what becomes available, where it appears, and how the user returns to the prior context.
- Do not use continuation patterns to hide decision-critical requirements, prices, constraints, errors, or the information needed to understand the next action.

| Pattern                    | Use When                                                                                                                                                 | Expected Behavior                                                                                                                                                                               | Do Not Use When                                                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `Inline reveal`            | One short, directly related explanation or bounded detail is needed in the same reading flow.                                                            | Reveal content directly below or beside its summary; use explicit labels such as `Show lesson details` / `Hide lesson details`. Preserve the user's place.                                      | The hidden content is long, forms a separate task, contains many controls, or needs its own evaluation space.                  |
| `Disclosure / accordion`   | A bounded section or related local section group needs more supporting content, but its summary remains useful and the task stays on the same surface.   | Expand in place with a clear stateful control. Keep each summary visible, and use a label that describes the revealed content rather than only `More`.                                          | The collapsed content is required before the page-level action, or several unrelated areas would become a wall of accordions.  |
| `See all`                  | A curated preview represents a homogeneous collection that has a meaningful complete destination, such as all reviews, all lessons, or all availability. | Show a deliberately chosen subset and navigate to a scoped full collection. The destination title and filters must make the relationship clear.                                                 | The user must inspect the remaining items before completing the current decision, or there is no meaningful full destination.  |
| `Overflow summary`         | A compact repeated set, such as applied filters, language tags, participants, or secondary options, exceeds the local space.                             | Show the most meaningful visible items plus an explicit remainder such as `+3 more`; opening it exposes the full set in a context where items remain understandable and actionable when needed. | The hidden items change the meaning of the main action, require side-by-side evaluation, or would make the preview misleading. |
| `Drawer`                   | A secondary but multi-control task needs focused space while preserving the page beneath it, especially filters or structured settings.                  | Open a labelled side surface with stable dismiss behavior. Preserve in-progress selections and restore the prior page context on close.                                                         | The content is a small one-choice interaction, or the task is primary enough to deserve a dedicated page.                      |
| `Bottom sheet`             | A mobile-local choice, short contextual action set, or compact filter task needs temporary focus close to the current page.                              | Use a labelled sheet with a clear close path. Keep choices short and grouped; retain the invoking page context behind the sheet.                                                                | The content contains long forms, deep navigation, extensive multi-option evaluation, or many independently expandable groups.  |
| `Dedicated follow-up view` | The continued content has its own task, deep evaluation, long collection, complex selection, or needs a shareable / revisitable destination.             | Navigate to a clearly named view and preserve relevant query, selection, and return context.                                                                                                    | The user only needs a short clarification or a single local choice.                                                            |

### 6.10A Continuation Selection Matrix

| Content Or Task Shape                                                   | Default Pattern            | Reason                                                                                    |
| ----------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------- |
| One short supporting explanation                                        | `Inline reveal`            | It preserves reading flow without creating a new surface.                                 |
| One bounded supporting section or related local section group           | `Disclosure / accordion`   | The user can inspect more detail while retaining the section summary.                     |
| Preview of a larger homogeneous collection                              | `See all`                  | It protects the page from a long repeated list while keeping the collection discoverable. |
| Dense compact tokens or secondary items                                 | `Overflow summary`         | It preserves local rhythm without losing the full set.                                    |
| Structured filtering or settings with several control groups            | `Drawer`                   | The task needs focus, persistence, and recovery without replacing results.                |
| Mobile-local choices or a small filter set                              | `Bottom sheet`             | The task is temporary and spatially tied to the current page.                             |
| Deep evaluation, scheduling, long-form detail, or a multi-step decision | `Dedicated follow-up view` | The continuation has become a task of its own.                                            |

### 6.10B Continuation Constraints

- Every continuation control must describe its destination or revealed content. Avoid generic labels such as `More`, `View`, or an unlabeled ellipsis when a specific label is possible.
- Continuation controls are local utility actions. They use secondary, ghost, text, or low-emphasis treatment; they must not use the red brand CTA or compete with the page's main action.
- Do not place several different continuation patterns in one small module unless each has a distinct object and user purpose.
- When content is summarized, preserve the most decision-relevant part of the hidden content in the visible preview.
- `+N more` must state or make discoverable what the remaining items are; it cannot become a mysterious decorative counter.
- A drawer, sheet, or follow-up view must preserve relevant current state, including active filters, selected lesson options, entered values, and the user's logical return path.
- Closing a drawer or sheet should return focus to its invoking control unless the user completed an action that intentionally changes the page state.
- If an expanded section is long enough to disrupt page orientation, prefer a dedicated follow-up view instead of an endlessly growing inline surface.
- On mobile, choose a sheet only when the complete task can remain concise and usable without nested scrolling complexity. Otherwise use a dedicated view.

### 6.10C Continuation QA Tests

- `Need Test`: is the hidden content truly secondary to the current next action?
- `Pattern Test`: is this the smallest pattern that can hold the content without clipping meaning or interaction?
- `Preview Test`: does the default preview retain enough information to make the continuation worth opening?
- `Return Test`: can the user return without losing context, selections, or orientation?
- `Action Test`: does the continuation control remain visually subordinate to the local and page-level action hierarchy?
- `Mobile Test`: does the pattern remain readable and operable without a tall nested surface or a dense control wall?

If any test fails, choose a different continuation pattern or promote the content into the default task flow.

### 6.11 Content Surface And Invocation Rules

- Before composing a page, AI must decide which content belongs in the default page layer and which content should be invoked through a secondary surface.
- Do not treat the page canvas as the default container for every available control, option, or explanation.
- A secondary surface is appropriate when it lets the main page retain a clearer task path without hiding information needed for the current decision.
- The invocation control is part of the content model. It must communicate the task it opens, any meaningful current state, and the expected scope of the surface.

### 6.11A Content Surface Matrix

| Surface                    | Use When                                                                                                                                                     | Invocation Rule                                                                                                         | Do Not Use When                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `Default page layer`       | Content is needed to understand, evaluate, or complete the current primary task without interruption.                                                        | No separate invocation; expose it in the task path.                                                                     | The content is optional, intermittent, or would make the main page structurally dense.                |
| `Inline layer`             | One small local choice, explanation, or status belongs directly beside the object it affects.                                                                | The local object itself may expose it, but the relationship must stay obvious.                                          | The content contains several groups, long lists, or a separate decision task.                         |
| `Popover`                  | A compact anchored utility, short form, or small value list needs one temporary surface.                                                                     | Invoke from a clearly labelled control; keep the anchor relationship visible.                                           | The task needs persistent context, several control groups, long reading, or mobile-heavy interaction. |
| `Dropdown menu`            | A short list of commands or navigation actions needs an anchored continuation.                                                                               | Invoke from a labelled trigger; each item must describe its own command or destination.                                 | The content is a filter, form, value picker, detailed comparison, or hidden primary navigation.       |
| `Tooltip`                  | A visible control or abbreviation needs optional short clarification.                                                                                        | Associate it with the already-labelled anchor; do not use it as the only source of required information.                | The explanation is essential, interactive, long, or unavailable to touch-only users.                  |
| `Modal`                    | A bounded focused task needs temporary attention without changing the user's broader page context, such as moderate-depth filters or a concise confirmation. | Use an explicit action such as `Filters (3)` or `Edit availability`; the label should reflect active state when useful. | The content is a single small choice, a long form, deep evaluation, or a multi-step flow.             |
| `Drawer`                   | A secondary task has several control groups or needs more vertical space while the underlying page remains relevant.                                         | Invoke with a task label such as `Open filters`; preserve selections until the user applies or discards them.           | The task is short enough for a popover or sheet, or deep enough for a dedicated view.                 |
| `Bottom sheet`             | A concise mobile-local choice or bounded mobile filter task needs temporary focus.                                                                           | Use a named mobile action and keep the current selection context visible in the trigger or page summary.                | The surface would require deep nested scrolling, long forms, or extensive multi-option evaluation.    |
| `Dedicated follow-up view` | Content has become its own task: long-form settings, deep filtering, scheduling, detailed evaluation, or multi-step work.                                    | Navigate from a specific action and preserve return context.                                                            | The user only needs a small temporary adjustment.                                                     |

### 6.11B Invocation Rules

- Default page content must include only what the user needs before the next decision. Supporting controls may be invoked rather than permanently displayed.
- An invocation control must use a specific task label: `Filters (3)`, `Sort: Best match`, `Choose time`, `View all reviews`, or `Edit lesson`. Do not use vague labels such as `Open`, `Manage`, or a bare icon when a text label is feasible.
- When an invoked surface changes the current page state, reflect the result in the default page layer after dismissal. For example, active filters remain visible as an applied-filter summary even when the filter surface is closed.
- An invoked surface must declare whether changes are immediate or require explicit `Apply`, `Save`, or `Done`. Do not mix those interaction models without a clear reason.
- Use one strong local completion action at most inside a modal, drawer, or sheet. Dismiss, reset, and secondary actions remain visually quieter.
- Do not launch a modal or sheet from another modal or sheet unless the second surface is a short system confirmation. Prefer replacing the current surface or navigating to a dedicated view.
- Preserve draft values, active selections, and the logical return point when the user closes and reopens an invoked surface.
- Use `COMPONENTS.md` for `overlay family` anatomy, elevation, mask, radius, icon, dismissal, and focus-return rules. This document owns page-level surface selection and placement.

### 6.11C Filter Surface Selection Matrix

| Filter Situation                                                     | Default Placement                                                        | Why                                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| One or two high-impact, frequently adjusted criteria                 | Inline or a compact top filter row                                       | The user benefits from rapid visible iteration.                               |
| Several related criteria that are not needed for every result scan   | Invoked modal on desktop; bottom sheet on mobile                         | Results retain room and active filters remain visible through the summary.    |
| Many grouped criteria, explanatory help, or a longer refinement task | Drawer or dedicated filter view                                          | The task needs more space and clearer grouping than a compact modal or sheet. |
| Filter state is already active                                       | Applied-filter summary in the results layer plus an invoked edit surface | Users can understand the current narrowing without reopening the controls.    |
| One quick ordering choice                                            | Popover or compact inline control                                        | Sorting is a short utility adjustment, not a full filter task.                |

### 6.11D Content Surface QA Tests

- `Layer Test`: does this content need to remain visible while the user scans or acts, or can it be invoked safely?
- `Trigger Test`: does the entry label describe both the task and meaningful current state?
- `Scope Test`: is the chosen surface large enough for the task but no larger than necessary?
- `State Test`: after dismissal, can the user still see the resulting state on the page when it matters?
- `Completion Test`: is it clear whether changes apply immediately or through a single explicit completion action?
- `Escape Test`: can the user dismiss the surface and return without losing context, values, or orientation?

If AI cannot justify why content must be permanently visible, it should consider an invoked secondary surface before adding another page module.

## 7. Component Application Rules

`COMPONENTS.md` is the only source for reusable component anatomy, props, variants, visual states, and component-level accessibility. `PATTERNS.md` is the only source for product-object composition. This document applies those approved sources to a page; it does not redefine them.

### 7.1 Select The Smallest Complete Unit

- Begin with the page task and the closest product pattern, then select only the required reusable components.
- Do not add a component because a visual reference contains a similar decorative block. Every selected component must own a distinct task, decision, state, or piece of evidence.
- A component may appear in a page only through its documented props and states. A page recipe may choose placement and ordering, but it must not override a component contract.

### 7.2 Apply Product Patterns Without Recreating Them

- Use `PATTERNS.md` for teacher discovery, authenticated navigation, teacher detail, booking, payment, feedback, and Mira composition.
- Use `COMPONENTS.md` for generic controls, input, overlay, content-view, feedback, navigation primitives, and Foundation rules.
- Keep supplied business data, route state, price calculation, availability, entitlement, and persistence outside headless component ownership.

### 7.3 Component Selection Trace

For a new or changed page, record the task role, selected pattern, selected components, supplied data or state, parent placement, and any documented component gap. A new component is justified only when no existing contract can meet a stable reusable need.

## 8. Component Contract Ownership

Do not add reusable component anatomy, prop lists, visual variants, component states, or component-level accessibility rules to this document. Put generic reusable UI in `COMPONENTS.md`; put business-object combinations in `PATTERNS.md`. This document may reference either source only to explain a page's task order, responsive placement, or required state coverage.

## 9. Page Assembly Rules

### 9.1 Assembly Must Start From The Task Path

Do not assemble pages from module lists alone.

Start from:

- what the user sees first
- what the user needs to understand next
- what supports the decision
- where the action lives
- what happens next

### 9.2 There Must Be One Dominant Path Per Object

Every object should have one dominant path, even if it includes supporting actions.

### 9.3 Primary Components Must Sit In The Primary Path

Primary components should not be buried under decorative or supporting blocks.

### 9.3A Time-Sensitive Work Must Outrank Optional Content

- On a learning-home, dashboard, or course hub, place time-sensitive lesson status and action-required course work before recommendations, promotions, achievements, topic content, and optional progress summaries.
- Recommendations may be useful, but they must not delay the learner's understanding of an imminent lesson, request, or scheduling need.
- If no operational course state exists, promote the most useful continuation for the learner's current lifecycle stage instead of leaving an unexplained empty top area.

### 9.4 Supporting Components Must Reinforce, Not Disrupt

Supporting blocks may explain, reassure, or guide, but must not compete with the main path.

### 9.5 Every Complete Object Should Define

- entry layer
- core layer
- action layer
- supporting layer
- content surface plan
- invocation points for secondary content
- next-step logic

### 9.5A Layout Rhythm Rules

- Do not default every page or section to a rigid vertical stack of:
  - heading
  - full-width content block
  - next full-width content block
- Use layout flexibility to create readable rhythm, while keeping hierarchy clear.
- Pair different content densities intentionally:
  - dense evidence with short explanation
  - long-form explanation with compact metrics
  - primary content block with a lighter supporting side block
- When two adjacent blocks support the same decision moment, consider a split composition before stacking them.
- Use asymmetry when it improves scanability, but do not create asymmetry that hides the main task path.
- Let typographic scale, width, and whitespace do some of the hierarchy work so every distinction is not solved by adding another card.
- If AI is unsure whether two related modules should stack or pair side-by-side, prefer pairing on desktop when:
  - one block is denser
  - the other is more summary-like
  - both support the same decision step
- On mobile, preserve the same conceptual grouping even when paired desktop layouts collapse into vertical order.
- Before finalizing a generated page, run a module-omission test: remove every optional region that does not materially support the current task, supplied product logic, or a necessary continuation. If the page improves, keep it removed.

### 9.6 Repeated Components Must Not Create Repeated Emphasis

Repeated units must not all present the same high-emphasis action or visual weight.

### 9.7 Enhancement Proposals Must Declare What Remains Unchanged

For existing-page enhancements, proposals must clearly state what stays unchanged.

### 9.8 Page Composition Acceptance Gate

Use this gate as a plain-language review before accepting a generated page:

| Check               | Pass Condition                                                                                            | Fail Condition                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Task clarity        | The first viewport makes the current user task or state obvious.                                          | The page begins with generic content, decorative framing, or unrelated recommendations. |
| Element evidence    | Every visible region has a reference, recipe, contract, or explicit user-story reason.                    | A region exists because it seemed useful, complete, or visually balanced.               |
| Proximity           | Each label, value, status, progress cue, and action sits next to the object it describes.                 | Information floats in a corner or is separated from its owner by unrelated content.     |
| Omission            | Removing any optional region would cause a real loss of understanding, action, or required context.       | Removing it makes the page clearer without breaking the task.                           |
| Repetition          | Each fact, destination, and action has one visible owner.                                                 | The same lesson, date, summary, or next action appears in multiple regions.             |
| Surface discipline  | Borders, shadows, icons, badges, and artwork come from a contract or explicit reference.                  | A visual treatment was added to fill space or make a region look designed.              |
| Component reuse     | Existing component variants are used when their contract matches.                                         | A one-off component or renamed duplicate was created for convenience.                   |
| Mobile sequence     | The mobile order preserves task content, decision controls, feedback, and continuation as one local flow. | Secondary context or navigation interrupts the current action path.                     |
| Interaction reality | Every visible interactive control has the correct state behavior and destination.                         | A control is decorative, static, fake, or has no meaningful result when activated.      |
| Reference fidelity  | The result feels like the supplied product page, including its restraint and omissions.                   | The result reads like a component showcase or generic dashboard template.               |

If any row fails, the page is not ready for non-designers to use. Fix the structure first; do not compensate with colors, borders, larger typography, or extra explanation.

### 9.9 Suggested Assembly Output Skeleton

```md
Assembly Proposal

Object Type:
Object Goal:
Primary Task Path:
Entry Layer:
Core Layer:
Action Layer:
Supporting Layer:
Content Surface Plan:
Invocation Points:
Next-Step Logic:
Existing Patterns Reused:
What Remains Unchanged:
Working Mode And Highest-Priority Source:
Visible-Element Evidence Record:
Deliberately Omitted Elements And Why:
Execution Gate Status:
Assumptions:
```

## 10. Existing Page Recipes

### 10.1 First Batch Of Existing Recipes

Start with:

- Dashboard / Learning Home
- Search Landing Page
- Search Results Page
- Teacher Detail Page
- Lesson Detail Page
- Practice / Knowledge Exercise Page
- Booking Flow Page
- Mobile Booking Experience

### 10.2 Every Recipe Must Define

- page family
- page goal
- primary task
- primary action
- first-screen question
- default exposed information
- mandatory components
- optional components
- required information
- secondary or collapsible information
- continuation or expansion pattern
- default section order
- desktop structure
- mobile structure
- working mode and applicable visual reference
- visible-element evidence and deliberate omissions
- interaction states and completion criteria

### 10.3 Dashboard / Learning Home

- Page family: learning lifecycle / course operations
- Page goal: help an existing learner immediately understand what needs attention, what lesson is next, and what is worth continuing after urgent course work is clear
- Primary task: resolve the nearest meaningful course action or prepare for the next lesson
- Primary action: context-dependent. It may be `Enter classroom`, `Accept` or `Decline` a request, or `Schedule`; it is not a universal page-level CTA.
- First-screen question: what is the next or most urgent thing I need to do for my learning?
- Default exposed information:
  - nearest upcoming lesson with time cue, teacher identity, lesson time, and an upcoming-lessons continuation
  - action-required lesson requests when present
  - active package status and remaining balance when relevant
  - a compact calendar preview when it helps the learner plan lessons
  - existing teachers or current learning relationships when there is a usable continuation
- Invoked Secondary Surfaces:
  - full upcoming-lesson list from the course count or `View all` affordance
  - course or lesson detail from a lesson row
  - row overflow for lower-frequency operational actions
  - a dedicated calendar or scheduling view from the calendar preview or schedule continuation
  - teacher relationship list from `View all`
- Mandatory Components:
  - `learning-status module family`
  - `section header / action header` for lower-priority grouped modules
  - `feedback family` for data failures or actionable system issues
- Optional Components:
  - `calendar overview / schedule preview`
  - `relationship rail / existing teachers preview`
  - `mira module family` for personalized match, learning continuation, progress or achievement, community or knowledge, and commercial entry
- Required Information:
  - course state meaning
  - lesson timing, including a clear local-time treatment when relevant
  - affected teacher or lesson identity
  - decision-relevant request details, such as proposed schedule, price, or cancellation status
  - remaining lesson balance when an active package is shown
- Secondary Or Collapsible Information:
  - additional upcoming lessons beyond the immediate preview
  - full calendar and historical course archive
  - all teachers and all recommendations
  - detailed achievement metrics, promotions, and content-discovery modules
- Continuation Pattern(s), Scope And Return Context:
  - use `View all` or a count-based text-plus-icon continuation for lists that remain in the same learning context
  - use a row-level detail view for a specific request or lesson
  - use a dedicated follow-up view for full schedule management, course history, or recommendation browsing
  - preserve the current dashboard scroll position and module context when returning from a local continuation
- Default Section Order:
  1. optional compact greeting or page recognition
  2. action-required lesson requests, when any are materially more urgent than the next lesson
  3. nearest upcoming lesson
  4. active package or schedule continuation, when applicable
  5. `calendar overview / schedule preview`
  6. `relationship rail / existing teachers preview`
  7. curated `mira module family` sequence in the product-supplied order
- Desktop Structure:
  - use a single coherent learning column for the operational top layer rather than distributing urgent tasks across unrelated dashboard cards
  - keep status modules full-width in that column so timing, identity, details, and actions scan as one unit
  - use a two-month or wider calendar preview only when it supports real lesson planning; keep calendar controls compact and locally scoped
  - use horizontal rails only for compact, repeatable relationship previews such as current teachers; include an explicit `View all` continuation
  - below the operational layer, compose a curated Mira sequence with intentionally varied density; a teacher-match rail, compact progress module, and creative campaign module may alternate, but must not all use the same card weight or CTA treatment
- Mobile Structure:
  - preserve the same top priority: request, next lesson, package, schedule, then supporting content
  - stack operational row actions below identity and details when necessary; keep controls equal height and compact
  - convert wide calendar and relationship previews into a focused preview plus a dedicated continuation instead of shrinking the content excessively
  - use horizontal scrolling only for compact repeatable cards; show enough of the next item or an explicit control to communicate that more items exist
  - do not show more than the first useful Mira module before the learner can reach their course continuation tools
- Key Interaction Rules:
  - a `next lesson` module opens the relevant lesson or classroom continuation only when the timing permits; otherwise it should reveal the appropriate lesson detail or schedule context
  - action-required rows keep decisions local; `Accept` / `Decline` pairs must provide confirmation or immediate resolved feedback according to product risk
  - calendar arrows change the preview range without navigating the learner away; the month range remains textually clear
  - schedule affordances open the correct scheduling context, not a generic teacher search
  - horizontal rails use an explicit `View all` entry and accessible previous / next controls if they are carousel-like
  - dismissible Mira modules must not remove access to required learning operations
- Empty / Error / Loading Notes:
  - first-use: replace unavailable course modules with a concise learning-start state and one appropriate continuation, such as discovering teachers or setting a learning goal
  - no upcoming lesson: keep package or teacher relationship context if useful, then provide a scoped scheduling continuation
  - no current teachers: omit the relationship rail rather than showing an empty decorative panel
  - failed course data: show local feedback in the affected module and preserve all unaffected dashboard content
  - loading: reserve the operational module shape before optional modules; do not make Mira skeletons appear before course-state skeletons
- Do:
  - treat the dashboard as a prioritization surface, not a content inventory
  - reflect the learner's current course relationship before proposing new discovery paths
  - give operational modules strong hierarchy through order, semantic status, and concise actions
  - use a curated Mira sequence for optional motivation, discovery, progress, and re-engagement
- Do Not:
  - start the dashboard with a commercial Mira module when an action-required or imminent lesson state exists
  - turn every section into the same bordered white card with a large button
  - expose the full lesson archive, full calendar, and all teachers by default
  - use a brand-red button as a repeated course-row action
  - make accept, decline, scheduling, and Mira actions all look like page-level CTAs
- QA Checklist:
  - the top of the page answers what needs the learner's attention now
  - an action-required request appears before optional content and is tied to its lesson context
  - the next lesson is easy to find when no more urgent task exists
  - course counts, calendar, and teacher rail have clear continuations
  - Mira placement cannot obscure required course actions
  - repeated controls use compact, consistent sizing and hierarchy
  - the page has a useful first-use, no-upcoming-lesson, and failed-data behavior

### 10.4 Search Landing Page

- Page family: discovery
- Page goal: help a learner express a teacher-search need without forcing them to understand the full filtering system first
- Primary task: start teacher discovery
- Primary action: search teachers
- First-screen question: what kind of teacher or lesson do I want?
- Default exposed information:
  - one `search-bar` with only the fields necessary to form a useful first query
  - concise contextual prompt or recent-search continuation only when product data provides a real continuation
  - a clear result destination after submit
- Invoked Secondary Surfaces:
  - compact quick-entry chips only when they represent known high-confidence starting intents
  - deeper filters only after the learner reaches results or explicitly asks to refine
- Mandatory Components:
  - `search-bar`
  - `search-field` variants required by the active product query model
- Optional Components:
  - `chip` quick-entry variant
  - `Mira Module Family` only when an explicit product-provided recommendation belongs in the discovery context
- Default Structure:
  1. search intent
  2. minimum required query controls
  3. submit continuation
- Do Not:
  - expose the full filter taxonomy before the learner has started a search
  - add teacher-card grids, testimonial marketing, or unrelated learning status merely to fill the page
  - create an additional red CTA when the search submit is already the dominant action
- Mobile Structure:
  - retain the same query order in a single vertical sequence; do not split one query across unrelated sheets
- Completion Criteria:
  - submit produces the correct results state with the query retained and legible
  - every optional quick-entry control has a real query result

### 10.5 Search Results Page

- Page family: selection
- Page goal: help a learner narrow credible teacher options and enter a profile with enough context to continue evaluation
- Primary task: narrow teacher options and decide which profile to open next
- Primary action: view profile or move toward booking decision
- First-screen question: which options best match my current need?
- Default exposed information:
  - current query or selection context
  - result count and active constraints in one local group
  - `teacher-card` evaluation units ordered by product logic
  - a filter invocation and sort invocation with their current state visible
- Invoked Secondary Surfaces:
  - filter panel, popover, drawer, or sheet selected through `6.11 Content Surface And Invocation Rules`
  - sort menu from a specific current-sort control
  - teacher detail from the teacher-card continuation
- Mandatory Components:
  - `teacher-card`
  - current-query context
  - filter and sort invocation controls
- Optional Components:
  - persistent left filter rail only when filtering is frequent enough to earn persistent desktop space
  - `Mira Module Family` only when product provides an adjacent, task-relevant recommendation and it does not interrupt evaluation
- Default Desktop Structure:
  1. query and results context
  2. local filter and sort controls
  3. teacher evaluation list
  4. result continuation or empty state
- Mobile Structure:
  1. query and result count
  2. filter and sort triggers in the same local row
  3. teacher evaluation list
  4. invoked filter sheet or drawer that returns the learner to the same result position
- Do Not:
  - display all filter content inline on mobile
  - turn every teacher-card continuation into a filled CTA
  - add a fixed rail without product evidence that repeated filtering is the core task
- Completion Criteria:
  - active filters, result count, and result list update as one understandable state
  - opening and closing a filter surface preserves the current query, filters, scroll context, and evaluation path

### 10.6 Teacher Detail Page

- Page family: teacher evaluation / fit confirmation
- Page goal: help the learner decide whether this teacher, a specific lesson offer, and an available time are a credible fit before they begin booking
- Primary task: confirm teacher fit and move into a selected booking context
- Primary action: `Book lesson` when booking is the one clear page-level continuation; favorite and contact actions remain secondary
- First-screen question: is this teacher right for my goal, and can I book a suitable lesson at a suitable time?
- Default exposed information:
  - teacher identity, online status, taught and native languages, and concise professional credentials
  - compact trust metrics and specialist evidence
  - `About me` preview with video or teaching-introduction evidence when present
  - lesson offer preview with price and compact duration or package information
  - `availability schedule` preview in the learner's timezone
  - review evidence, including an AI summary only when it is labelled and traceable to reviews
- Invoked Secondary Surfaces:
  - `long-form detail dialog` from `Show more` in About me
  - related resume or certificate tab within that dialog
  - full lesson offer list or booking flow from a selected lesson option
  - full availability or booking schedule from the availability preview
  - complete review collection or review-filter continuation
  - contact-teacher flow
- Mandatory Components:
  - teacher profile identity composition
  - `lesson-option group`
  - `availability schedule` profile preview
  - `trust-metrics`
  - `review-card`
- Optional Components:
  - profile video or other teaching-introduction media
  - `long-form detail dialog`
  - AI review summary and evidence tags
  - similar-teacher rail as a lower-page recovery path
- Required Information:
  - teacher identity, languages, and availability status
  - teaching focus, credential or specialist signals when relevant to the learner's goal
  - at least one concrete lesson offer with price and lesson meaning
  - learner-local availability context
  - review quantity and recent or meaningful trust evidence
- Secondary Or Collapsible Information:
  - complete biography, resume, certificates, teaching materials, and authored content
  - full lesson catalog beyond the useful preview
  - all availability dates and time slots
  - long AI review synthesis, full tag set, full review archive, and all similar teachers
- Continuation Pattern(s), Scope And Return Context:
  - use `Show more` to open full biography detail in a `long-form detail dialog`; preserve the profile scroll position and selected booking context on close
  - use a bounded offer preview with `Show more` only when additional offers are homogeneous and have a meaningful complete destination
  - selecting a lesson offer should carry teacher, lesson, price, duration, and any package context into Booking Flow
  - availability preview should enter Booking Flow or a scheduling continuation with teacher and lesson context intact
- Default Section Order:
  1. teacher identity, languages, status, and page-level actions
  2. concise credentials and specialist evidence
  3. About me preview, teaching media, and local contact action
  4. lesson offers grouped by taught language when useful
  5. availability schedule in learner timezone
  6. trust metrics, review summary, and review evidence
  7. similar teachers as a recovery continuation
- Desktop Structure:
  - use a centered evaluation column with a clear top identity band; do not force a sticky booking panel when the page needs the learner to evaluate offers and availability first
  - pair About me text and teaching-introduction media in one coherent evidence area when both are present
  - use horizontally scannable lesson offer previews only for comparable offers; keep price and offer meaning aligned, then provide a clear continuation
  - keep availability as a full-width planning surface below offers, not as a small decorative calendar
  - present review evidence as an editorial hierarchy: metrics and synthesis first, then selected review cards, then a lower-emphasis full-review continuation
- Mobile Structure:
  - preserve the path: identity, fit evidence, lesson offer, availability, trust evidence
  - use a compact top booking continuation only after an offer is selected or when the page has one clearly relevant default lesson
  - move full biography into a long-form sheet or dedicated detail view; do not expand it inline above offers and availability
  - make offer previews horizontally scrollable only when their price and selection affordances remain fully visible; otherwise stack them
  - use the focused mobile `availability schedule` variant rather than shrinking a desktop weekly grid
- Key Interaction Rules:
  - `Favorite teacher` changes saved state immediately and must not compete visually with booking
  - `Contact teacher` is a secondary consultation path; it must not interrupt a learner who is ready to book
  - `Show Translation` and `Show Original Language` change only the represented content and retain the learner's profile context
  - lesson selection carries its exact offer context into booking; do not make the learner choose the same lesson again without explanation
  - profile availability slots may initiate booking but must not look like a completed reservation until Booking Flow confirms the selected time
  - AI review summaries need an AI label, clear relationship to the underlying reviews, and a path to the source review evidence
- Empty / Error / Loading Notes:
  - unavailable teacher: replace booking continuation with a local no-availability state and the strongest recovery path
  - no lesson offers for the current language: explain the scope and offer a nearby valid lesson or teacher-discovery continuation
  - no future slots: keep teacher fit evidence visible and provide date-range, timezone, or similar-teacher recovery
  - loading: reserve identity, offer, and availability shapes before review or similar-teacher skeletons
- Do:
  - make teacher fit, lesson fit, and time fit progressively clearer
  - let price, duration, and lesson meaning travel together
  - treat biography and reviews as evidence, not page-level CTAs
  - provide recovery through similar teachers only after the current teacher's core evidence
- Do Not:
  - expose every certificate, review, lesson, and calendar slot in the default page
  - show multiple red booking actions across profile sections
  - make availability selectable without a clear path to booking confirmation
  - present AI summary as an independent trust source without review provenance
  - turn the About me dialog into a second profile page
- QA Checklist:
  - teacher, lesson, and time fit are each understandable before booking
  - only one page-level brand-red booking continuation is visible
  - lesson offer selection and availability preview retain consistent context into Booking Flow
  - long biography opens and closes without losing the profile context
  - review metrics, AI synthesis, and individual reviews have distinct roles
  - no-availability and unavailable-teacher recovery paths are useful

### 10.7 Lesson Detail Page

- Page family: learning lifecycle / lesson operations
- Page goal: give a learner the exact information and action set appropriate to one lesson's current lifecycle state
- Primary task: state-dependent. Prepare for an upcoming lesson, continue learning after a completed lesson, complete a required confirmation, understand a pending or resolved dispute, or schedule within an active package.
- Primary action: state-dependent and local to the lesson or package. It is never a universal page CTA.
- First-screen question: what is the current state of this lesson or package, and what can or must I do next?
- Default exposed information:
  - `lesson-context header`
  - the highest-priority state explanation or course action
  - the smallest supporting information needed for that state
  - a `lesson-record timeline` beneath the active operational or learning content
- Invoked Secondary Surfaces:
  - classroom entry or device check
  - lesson edit or scheduling surface
  - complete lesson summary, flashcard practice, homework, files, and learning content
  - review, dispute, evidence, or resolution detail
  - full package lesson list
- Mandatory Components:
  - `lesson-context header`
  - `lesson-record timeline`
  - `learning resource item / artifact row` when lesson-generated or learning-supporting resources are available
  - `feedback family` when an exception, deadline, waiting state, or resolution requires explanation
- Optional Components:
  - pre-class preparation
  - `learning resource item / artifact row` group for flashcards, homework, AI-assisted lesson summary, notes, recordings, or files
  - lesson topic list
  - device compatibility or classroom readiness panel
  - package lesson grid or list
- Required Information:
  - lesson or package identity
  - teacher relationship
  - relevant date, time, duration, or package progress
  - current lifecycle state
  - required deadline, reason, or outcome when applicable
- State Matrix:
  - `upcoming`:
    - expose upcoming time, classroom entry, lesson edit when allowed, and pre-class preparation
    - may show a compact flashcard preview and the previous lesson summary as preparation context
    - keep device or classroom readiness information available but below the direct entry path
  - `completed`:
    - expose completion status, next-lesson continuation, and reentry only when product rules permit it
    - promote lesson outputs that support continued learning: flashcards, homework, lesson summary, notes, links, and files
    - label AI-generated summary content and keep feedback or correction paths available where relevant
  - `confirm needed`:
    - expose the confirmation reason, deadline, and the exact two local choices before all learning content
    - use one compact gray affirmative control and one secondary alternative, such as `Confirm lesson` and `Lesson incomplete`
    - show the record for context; defer flashcards, homework, and summary modules until the operational decision is resolved
  - `waiting / dispute`:
    - expose who owns the next step and what the learner should expect
    - remove confirmation, classroom, and conflicting schedule actions
    - show the record or dispute history as the principal supporting content
  - `resolved`:
    - expose the resolution in direct language, including outcome or credit information when applicable
    - make the dispute record available; do not preserve pending actions or warning copy that no longer applies
  - `active package`:
    - expose package progress, expiry, and a local schedule continuation
    - use `progress` only when completed, remaining, or total lessons have an explicit supplied bound; keep the count text adjacent to the indicator
    - show a bounded preview of scheduled, completed, or canceled lessons, then continue to the full package list
    - keep package request history in the record timeline
- Secondary Or Collapsible Information:
  - long topic lists and translated topic labels
  - full lesson summary, all vocabulary, grammar, idioms, links, files, and chat history
  - complete package lesson history
  - older record entries when no dispute review is underway
- Continuation Pattern(s), Scope And Return Context:
  - use direct classroom entry only for a lesson that is actually eligible to enter
  - use a local modal, drawer, or dedicated flow for lesson edit, scheduling, incomplete-lesson reporting, and evidence detail according to task complexity
  - use `View lesson summary`, `View all lesson summary`, or equivalent text-plus-icon continuations for long learning materials
  - returning from a sub-surface must preserve the lesson state, scroll position, and current record context
- Default Section Order:
  1. status, identity, time or package progress, and permitted actions
  2. required state explanation or deadline, when present
  3. state-relevant operational or learning content
  4. compact continuation to deeper material
  5. lesson or package record
- Desktop Structure:
  - use one centered lesson context column; do not convert each subsection into an unrelated dashboard tile
  - keep the lifecycle header full-width in that column and use locally scoped header actions
  - use grouped learning sections with clear headings and dividers; use light-gray internal zones for compact content previews rather than excessive nested cards
  - package lesson previews may use a two-column grid when each tile is short and status-scannable
- Mobile Structure:
  - display the status explanation and action controls before all optional materials
  - stack header action controls in a compact group directly under their context; do not use a sticky action bar for a state that has no immediate action
  - preserve paired confirmation controls at equal height and clearly distinguish affirmative from secondary treatment
  - reduce content previews to a useful sample and an explicit continuation; do not force full learning summaries into the first mobile page
  - render package lesson cards in one column unless a two-column layout remains legible at the standard text size
- Key Interaction Rules:
  - an upcoming `Enter classroom` action must be gated by actual lesson eligibility; before eligibility, route to relevant preparation or details instead
  - confirmation and incomplete-lesson reporting require feedback or confirmation appropriate to their business impact, then immediately update the header state and record
  - waiting states must not offer stale decision actions
  - resolution views should explain outcome before offering a deeper dispute record
  - flashcards, homework, summaries, and files may use independent loading or empty states without blocking the lesson-status header
- Empty / Error / Loading Notes:
  - missing preparation, homework, flashcards, or summary content should use local, neutral empty states and leave the lesson operation usable
  - unavailable lesson data should preserve a clear retry or support path and not show guessed lifecycle actions
  - loading should prioritize the status header and deadline skeleton before learning-content skeletons
  - if an action is temporarily unavailable because the lesson state changed, replace it with an explicit state message rather than a silently disabled control
- Do:
  - let lifecycle state determine content exposure and actions
  - keep task-critical decisions above history and learning enrichment
  - treat learning outputs as continuation tools after a completed lesson
  - keep course evidence and event history readable without treating it as the active state
- Do Not:
  - reuse the completed-lesson content stack for an unresolved confirmation or dispute state
  - show `Enter classroom` or `Edit lesson` controls after they are no longer permitted
  - use a brand-red button for confirmation, incomplete-lesson reporting, scheduling, or repeated learning actions
  - surface all lesson materials, package history, and record entries at once
  - mix current state, requests, and resolved outcomes into one visually ambiguous banner
- QA Checklist:
  - the first viewport identifies one unambiguous lifecycle state
  - shown actions are valid for that state and absent when no longer valid
  - confirmation, waiting, and resolved states have different content exposure, not only different color
  - completed lessons lead naturally into practice, homework, summary, or next lesson continuation
  - package state exposes progress, expiry, scheduling, and a bounded lesson preview
  - the record distinguishes current task from historical events
  - mobile preserves state-to-action proximity and does not bury required actions

### 10.7A Practice / Knowledge Exercise Page

- Page family: learning continuation / focused task completion
- Page goal: help a learner complete one bounded practice task derived from a lesson, summary, or learning objective without turning the page into a lesson archive or generic dashboard
- Working mode: select according to `0.5 Non-Negotiable Execution Gate`. When an approved host-page reference exists, preserve its shell, composition, and lifecycle context. When no reference exists, compose from this recipe and existing component contracts. A demo may calibrate the result but cannot override this source order.
- Primary task: answer, complete, or review the current learning item
- Primary action: use the existing interaction pattern that completes the current learning task. Add a separate submit or check action only when the task has a real explicit evaluation boundary; otherwise let the documented input or choice pattern own immediate feedback. Do not create a second competing task action.
- First-screen question: what am I practising now, what should I do, and how will I know whether I completed it?
- Default exposed information:
  - concise source context naming the lesson, summary, or objective that generated the task
  - the current task prompt and the minimum instruction needed to answer it
  - the input, selection, or interaction control belonging to that exact task
  - progress only when the product has a real count or completion model; keep it adjacent to the current task, never floating elsewhere on the page
  - local semantic feedback when the task produces an evaluation, recovery, or completion state
- Invoked Secondary Surfaces:
  - the continuation pattern selected through `6.10 Continuation Pattern Library` for substantive lesson summary, explanation, or source material that the learner explicitly opens; use `long-form detail dialog` only when its existing contract fits the depth and return-context need
  - a named lesson, resource, or learning-detail destination when the current task cannot be understood from its concise source context
- Mandatory Components:
  - appropriate existing input, selection, or task control
  - `feedback family` in the smallest local variant that communicates an evaluation, recovery, or completion state when one exists
  - one task action using the existing button hierarchy only when an explicit task transition requires it
  - concise source context, or a `learning resource item / artifact row` when the source itself needs an identifiable access point
- Optional Components:
  - an existing supporting-detail continuation whose contract matches the material depth and task context
  - `progress` when the practice task has a real bounded count or completion model
  - one concise preparation or explanation block when it materially changes how the learner completes the current task
- State Model:
  - `not ready`: the task is visible but awaits required input, a selection, or another prerequisite
  - `in progress`: the learner has entered, selected, or begun the task; any explicit task action reflects the real readiness state
  - `evaluated`: use a semantically correct local outcome such as success, needs-revision, informative result, or blocked state; feedback must not reuse a different status semantic
  - `transitioned`: when the task leads to another item or step, replace outdated input, feedback, and controls with the actual next state
  - `completed`: update the real progress or completion model, remove stale task controls, and state the valid continuation when one exists
- Default Section Order:
  1. concise source context and any necessary supporting-material invocation
  2. current practice task with locally associated progress
  3. answer or input controls
  4. local feedback
  5. one task action and its immediate next-step hint
- Desktop Structure:
  - use one focused primary task area; add a secondary region only when it materially supports the current task and has a clear relationship to it
  - keep source context compact above the task surface; the active task is the visual owner of progress, feedback, and action
  - determine shell behavior from the page family and highest-priority reference. Do not add persistent navigation, side regions, or a host shell solely to make a focused exercise look visually complete
- Mobile Structure:
  1. source context or compact supporting-material invocation
  2. prompt and instruction
  3. answer controls
  4. feedback
  5. one full-width task action
  - keep task response, feedback, and next action adjacent. Move secondary context behind a named continuation when it would interrupt this sequence.
  - move substantial source material into the continuation pattern selected for its depth; preserve the current answer and progress when the learner returns.
- Key Interaction Rules:
  - feedback states use their matching semantic treatments and remain distinguishable through explicit state meaning as well as visual treatment.
  - every visible task control must use an existing component and interaction pattern whose state model fits the task. Do not recreate a control, modal, or transition when an existing contract already satisfies the same need.
  - selection, submission, evaluation, continuation, and completion must each produce a real defined state change. A control must not merely change its label.
  - keep value selection distinct from task completion unless the documented learning interaction explicitly uses immediate evaluation or immediate advance.
  - when a continuation loads another task or step, replace stale input, feedback, action availability, and progress association with the real next state.
  - add a bypass or deferral action only when product logic defines its outcome for progress, history, or task completion. State that outcome clearly and keep the action secondary; otherwise omit it.
  - an opened supporting-detail surface preserves task state and returns focus to its invoking control on close.
- Empty / Error / Loading Notes:
  - no available task: explain whether the learner completed the set, the material is unavailable, or it is still generating; offer only the nearest valid continuation
  - evaluation or validation requiring revision: retain the relevant learner input when it supports recovery, provide a task-local retry path, and do not turn a local outcome into a page-level alert
  - loading an updated task or step: reserve the focused task area and avoid replacing it with unrelated secondary content
- Do:
  - make current task, progress, feedback, and continuation read as one local sequence
  - keep source context compact and adjacent to the task it explains; use a richer lesson or resource surface only when the task cannot otherwise be understood
  - preserve input and progress when the learner opens supporting detail and returns
  - make completed, needs-revision, and active states meaningfully distinct when they exist
- Do Not:
  - add persistent secondary regions merely to balance the composition when they do not support the active task
  - repeat source, task, status, or action information in several regions without a distinct ownership reason
  - interrupt the task input, feedback, and continuation sequence with unrelated secondary context on mobile
- QA Checklist:
  - the current task is clear before any supporting course information
  - progress, feedback, and task action are locally associated with the current prompt
  - task states have distinct semantic treatment and clear text meaning
  - each high-emphasis task action has a real next state or outcome and does not compete with another action
  - no stale input, action, feedback, or progress state remains after a task transition
  - supporting detail opens from a named control and returns the learner to the exact task state
  - mobile keeps prompt, answer, feedback, and continuation contiguous

### 10.8 Booking Flow Page

- Page family: booking / commitment
- Page goal: turn a selected teacher and lesson into one unambiguous booking commitment by resolving lesson type, duration, package or independent quantity, and time in sequence
- Primary task: select a bookable lesson configuration and one eligible time, then submit the booking
- Primary action: `Book now`; use the one brand-red action only after the summary accurately represents the selected commitment
- First-screen question: what exactly am I booking, when is it, and what will it cost?
- Default exposed information:
  - teacher identity and taught-language context
  - selected lesson offer with price and meaningful short description
  - duration selection when the offer supports more than one duration
  - additional lesson offers as a bounded continuation
  - package options when applicable
  - independently adjustable lesson quantity only when it is not represented by a package option
  - `availability schedule` time picker
  - persistent booking summary and action bar
- Invoked Secondary Surfaces:
  - lesson offer detail from `View more detail`
  - expanded lesson offer list from `Show more`
  - timezone or date-range adjustment within the schedule
  - focused mobile schedule view when the compact flow cannot display slots clearly
  - booking policy, payment, or support detail only when needed to resolve a blocked commitment
- Mandatory Components:
  - `lesson-option group`
  - `availability schedule` booking-time-picker variant
  - `booking-panel` or sticky booking action bar
  - local feedback for incomplete, invalid, unavailable, or expired selection states
- Optional Components:
  - `flow-progress` only when lesson configuration, schedule selection, and payment are explicit named stages of one bounded multi-surface flow
  - selectable package-option group
  - `form-field` with `number-stepper` when lesson quantity is a separate bounded decision rather than a package selection
  - brief offer-description expansion
  - currency estimation or localized-price note
  - schedule `Today` control and date-range navigation
- Required Information:
  - teacher and language context
  - selected lesson offer
  - selected duration when variable
  - selected package count when applicable
  - selected independent lesson quantity when applicable
  - learner timezone
  - selected date and time
  - current total price and meaningful booking summary
- Secondary Or Collapsible Information:
  - extra lesson offers beyond the initial useful set
  - long offer descriptions
  - discount explanation beyond concise package value cues
  - extended scheduling range and policy detail
- Continuation Pattern(s), Scope And Return Context:
  - `View more detail` opens only the selected offer's additional description and returns to the same selection
  - `Show more` reveals additional lesson offers without losing selected offer, duration, package, or schedule state
  - range navigation updates availability within the current booking context
  - a mobile focused schedule view returns the selected time to the persistent booking summary
- Default Section Order: 0. `flow-progress` when the product exposes the multi-stage flow
  1. teacher and language context
  2. selected lesson offer and duration
  3. additional offers when the initial offer is not sufficient
  4. package options
  5. independent quantity adjustment only when applicable
  6. time selection
  7. persistent price, booking summary, and submit action
- Desktop Structure:
  - center the choice sequence in one focused booking column
  - group lesson and duration as one decision block; keep additional offers beneath rather than mixing them into the duration controls
  - use compact horizontal package options only when count, per-lesson value, and selected state remain scannable
  - render an independent quantity `number-stepper` below the selected offer or package decision and above time selection; do not show both controls when they represent the same count decision
  - place the availability schedule below offer and package selection, with visible timezone and date-range controls
  - use a sticky bottom action bar containing total price, condensed selected summary, and the single `Book now` action
- Mobile Structure:
  - keep the same commitment order and preserve selected values as the learner scrolls
  - use compact vertical offer and package rows with equal selection affordances
  - keep an independent quantity `number-stepper` as one full-width field group; do not split its decrement, value, and increment regions across the flow
  - use a day or week schedule picker with slots large enough for touch; do not compress desktop columns
  - sticky bottom bar shows total and the currently complete booking summary; it must explain any missing prerequisite when `Book now` is disabled
- Key Interaction Rules:
  - when present, `flow-progress` shows the current booking stage and completed prior work. It does not replace explicit back or edit actions, and it must not make payment or future stages selectable before the parent flow permits them.
  - selecting an offer updates duration availability, package eligibility, schedule availability, price, and summary as needed
  - selecting a duration can invalidate the selected time; clear it with an explanation and require a new eligible time
  - selecting a package updates total and per-lesson value immediately; a savings cue never substitutes for the final price
  - changing an independent quantity updates the total and any dependent eligibility immediately. It does not select a different lesson package or finalize the booking.
  - booking action remains disabled until all required choices are valid. The reason is stated beside the relevant missing control or in the summary.
  - selecting a time updates the bottom booking summary immediately and does not finalize a booking on its own
  - schedule timezone changes update visible slots and the selected-time summary consistently
- Empty / Error / Loading Notes:
  - no lesson offers: show a scoped unavailable state and return to teacher profile or discovery with context
  - no eligible time in range: explain whether the learner should change duration, date range, or timezone, then provide the smallest relevant recovery control
  - expired slot or price change: preserve other selections, invalidate only the affected one, and explain the needed re-selection before enabling booking
  - loading: retain selected summary and skeleton only the changing offer or schedule area
  - booking failure after submit: preserve choices, show clear local recovery, and do not create a second submit action
- Do:
  - reveal choices in commitment order
  - keep total price, duration, lesson, and selected time synchronized
  - use the sticky bar as a concise commitment summary, not as another form section
  - make selection invalidation explicit and recoverable
- Do Not:
  - expose `Book now` as an enabled action before required choices are valid
  - make every duration, package, and time option visually equal after selection
  - use multiple red actions across the flow
  - separate timezone from the calendar context
  - lose selected data when expanding offers or changing date range
- QA Checklist:
  - the learner can explain the selected lesson, duration, package, time, timezone, and total before booking
  - only one valid time can be selected
  - duration or package changes update all dependent booking information
  - an independent quantity change updates the total without creating a stale package, availability, or booking summary
  - sticky summary stays synchronized and does not cover content
  - unavailable, invalidated, loading, and submission-failure states retain clear recovery
  - desktop and mobile preserve the same decision order

### 10.8A Payment / Checkout Stage

- Page family: booking payment / checkout
- Page goal: turn one valid booking commitment into one understandable and recoverable payment attempt by showing what is being purchased, how it will be paid, and the final amount due.
- Entry condition: receive the selected teacher, lesson, duration, package or quantity, eligible time, timezone, and parent-supplied calculated amount after the booking configuration is valid. Do not reconstruct or guess these values from display copy.
- Primary task: choose an eligible payment route when a choice exists, verify the final amount due, and intentionally continue to the parent-owned payment action.
- Primary action: payment-page-owned action such as `Pay` or `Confirm payment`. It remains disabled or pending whenever required method, secure verification, amount calculation, or booking validity is unresolved; the local reason is visible.
- Mandatory Components:
  - `flow-progress` when the booking and payment stages are presented as one explicit multi-surface flow
  - `payment-method` when a payment route choice, saved method, or method recovery exists
  - `order-summary`
  - one payment-page-owned action area
  - `feedback family` for payment-method failure, amount invalidation, booking expiry, or recoverable payment failure
- Optional Components:
  - compact booking context with an explicit edit continuation
  - coupon, credit, or wallet continuation when product rules supply one
  - secure add-method, verification, bank-instruction, or external-authentication surface through the `overlay family` or dedicated provider flow
- Required Information:
  - concise selected booking context including teacher or lesson, selected time, timezone, and any package or quantity meaning needed to understand the order
  - selected or required payment-method state, including default, unavailable, verification-required, or failed meaning when applicable
  - base amount, every material supplied reduction or addition, and final amount due with currency context
  - explicit recovery when price, availability, coupon, or payment method is no longer valid
- Default Section Order: 0. compact or labelled `flow-progress` when the multi-stage flow is exposed
  1. concise booking context and edit continuation
  2. `payment-method`
  3. coupon, credit, or other parent-supplied adjustment continuation when applicable
  4. `order-summary`
  5. one payment action and the smallest required policy or recovery note
- State Rules:
  - flow progress: mark booking configuration and scheduling complete only after the parent confirms the carried context is valid; mark payment current. An explicit edit return is parent-owned, and a price, slot, or method failure must not falsely mark payment complete.
  - method change: preserve the current booking context, show the selected method immediately, and wait for the parent-supplied recalculated order summary before presenting payment as ready
  - default saved card: expose it as default and selected only when the parent supplies both states; never silently select it inside the UI component
  - unavailable or verification-required method: keep the method visible with its reason and strongest valid alternative, verify, retry, or change path
  - failed payment attempt: preserve booking, method, promotion, and amount context; attach recovery to the affected method or payment action rather than clearing the checkout state
  - changed price, expired slot, or invalid coupon: preserve unaffected values, mark the affected line or booking context explicitly, update `order-summary`, and require acknowledgement or reselection before payment continues
  - zero amount due: make the no-charge outcome explicit and use the parent-defined completion action; do not force the user to choose an irrelevant payment method
- Desktop Structure:
  - use one focused payment column with `order-summary` beside or below the payment method according to readable width. Do not present two competing total panels.
  - keep the final amount due and payment action within one recovery path; a compact sticky action may repeat only the same synchronized final amount.
- Mobile Structure:
  - use the compact `flow-progress` variant when it is present; retain the current label, step count, and any blocked or error meaning without turning the bar into mobile navigation.
  - preserve the order: booking context, payment method, adjustment continuation, final amount, payment action.
  - use a compact sticky payment action only when its final amount exactly mirrors `order-summary` and the full breakdown remains recoverable above it.
  - move secure card entry, longer method lists, or external authentication into a supplied sheet, modal, or dedicated provider flow. Return to the same payment context and focus target.
- Do:
  - keep selection, amount calculation, and payment submission visibly separate responsibilities
  - make price changes and payment failures recoverable without losing the booking context
  - use locale-formatted supplied currencies and explicit payment-method labels
- Do Not:
  - expose card credentials, payment tokens, provider-specific fields, or payment SDK behavior in the design-system contracts
  - allow a stale amount, unavailable method, invalid coupon, or expired booking to look ready for payment
  - add several payment CTAs or let discount marketing obscure the final amount due
- QA Checklist:
  - the learner can identify the booking, payment method state, every material amount line, and final amount due before payment
  - default, selected, unavailable, verification-required, failed, recalculating, changed-price, and zero-due states have clear distinct meaning
  - changing method, coupon, credit, package, quantity, duration, or slot cannot leave stale order details or an enabled misleading payment action
  - secure or external payment surfaces return to the same preserved checkout state and logical focus target

### 10.9 Mobile Booking Experience

- Page family: mobile booking / continuation support
- Primary task: complete the same lesson, duration, package, and time decisions defined in `10.8 Booking Flow Page` without losing selection context
- Primary action: `Book now` after every required choice is valid
- First-screen question: what is still required to complete this booking, and what have I already chosen?
- Action treatment: use the `booking-panel` sticky bottom summary. It shows total price plus the meaningful selected context, states any missing prerequisite, and never covers the schedule or page content.
- Required Mobile Rules:
  - use compact `flow-progress` only when the booking flow has explicit named stages; it remains status-only unless a completed-step edit return is explicitly supplied
  - use the `availability schedule` day or week picker rather than a compressed desktop grid
  - retain selected offer, duration, package, and timezone while the learner moves between the visible booking sections
  - turn long offer detail or scheduling work into a focused sheet or dedicated view only when the current page cannot retain legible tap targets
  - return selected values to the sticky summary immediately after a sheet or focused schedule view closes

### 10.10 Suggested Page Recipe Skeleton

```md
[Page Name]

Page Family:
Page Goal:
Working Mode:
Highest-Priority Visual Source:
Primary Task:
Primary Action:
First-Screen Question:
Default Exposed Information:
Invoked Secondary Surfaces:
Mandatory Components:
Optional Components:
Required Information:
Secondary Or Collapsible Information:
Continuation Pattern(s), Scope And Return Context:
Default Section Order:
Desktop Structure:
Mobile Structure:
Key Interaction Rules:
Empty / Error / Loading Notes:
Visible-Element Evidence Record:
Deliberately Omitted Elements And Why:
Do:
Do Not:
QA Checklist:
Execution Gate Status:
```

## 11. New Page Creation Rules

### 11.1 Reuse Is The Default Starting Point

Creation should start from:

1. existing page recipe
2. existing assembly pattern
3. existing component contracts
4. new structure only when the task is materially different

### 11.2 Distinguish New Instance From New Pattern

- `new instance`: an existing pattern used in a new context
- `new pattern`: a structurally different solution that existing patterns do not support well enough

### 11.3 New Objects Must Explain Why Existing Recipes Are Not Enough

If AI proposes a new pattern, it must explain:

- which existing recipe was considered
- why reuse is insufficient
- what structural gap remains

### 11.4 New Objects Must Preserve System Vocabulary

New structures must still respect:

- page family logic
- component usage logic
- action hierarchy logic
- information hierarchy logic
- trust and commitment sequencing
- `DESIGN.md` product direction and `COMPONENTS.md` visual rules

### 11.5 New Creation Should Prefer Composition Over Reinvention

Prefer new compositions of known components before proposing new components.

### 11.6 First Use Does Not Automatically Become A System Pattern

Do not promote a new structure to a formal system pattern after its first use.

### 11.7 Suggested New Creation Output Skeleton

```md
New Object Proposal

User Story Interpretation:
Object Type:
Product Flow Relationship:
Why Existing Recipes Are Not Enough:
Stable Elements Reused:
New Structural Needs:
Component Selection Trace:
Working Mode:
Highest-Priority Visual Source:
First-Screen Question:
Primary Action:
Must-Have Information:
Default Exposed Information:
Secondary Or Collapsible Information:
Recommended Assembly:
Visible-Element Evidence Record:
Deliberately Omitted Elements And Why:
Assumptions:
What May Become Reusable Later:
Execution Gate Status:
```

## 12. Data And Content Rules

### 12.1 Content Must Follow The Task, Not The Data Inventory

Do not show content just because it exists.

Show content because it helps the current task.

### 12.2 Every Object Must Distinguish Required Data From Optional Data

Every page, module, and component should distinguish:

- required data
- optional data

### 12.3 Content Priority Must Match Information Hierarchy

Primary content should support the primary task.

Secondary content should support decision-making or orientation.

Supportive content should remain lightweight unless needed.

### 12.4 Related Data Must Be Presented Together

Examples:

- price with duration
- metric value with metric meaning
- time with date or status when relevant
- summary point with continuation cue when needed

### 12.5 Missing Data Must Degrade Gracefully

Missing data should trigger degradation, not random substitution.

AI may:

- reorder
- collapse
- omit optional content
- use safe placeholders when allowed

AI may not:

- invent facts
- fabricate trust signals
- guess prices, ratings, dates, or lesson outcomes
- create fake user content

### 12.6 Trust Data Requires Special Handling

Trust-related content should be:

- clear
- correctly contextualized
- easy to scan
- easy to evaluate
- never fabricated or padded

### 12.7 Instructional And Learning Content Requires Different Rules

Lesson prep, summary, and practice content should:

- guide action and understanding
- surface key takeaways first
- reduce friction to continue
- avoid promotional language

### 12.8 Content Style Application

Apply the Content Style in `COMPONENTS.md` to the task context rather than creating page-local voice rules.

Page recipes may determine which supplied content is required, supporting, or optional. They must not override the documented voice, terminology, CTA, price, or status-copy rules.

### 12.8A Localization, Language, And Format Rules

Localized content must preserve the same task meaning, decision sequence, and data relationships as the source experience. Do not treat a translated string as decoration that can be abbreviated, moved, or omitted without checking its product meaning.

- Use product locale and formatter data for dates, times, numbers, currencies, percentages, and plurals. Reusable components receive formatted display values and their semantic context; they must not recreate locale rules with string concatenation.
- Keep the displayed currency, price meaning, duration, package condition, and any estimate or conversion note together. Do not present an approximate local currency as the committed booking total unless product data explicitly identifies it as such.
- Treat timezone as required context whenever a user evaluates availability, selects a time, confirms a booking, or reads a time-sensitive lesson state. Date and time values must have enough context to remain unambiguous across timezone and seasonal-offset changes.
- Preserve user- and teacher-authored names, source-language lesson content, and language names as supplied. Translation, transliteration, or normalization requires an approved product behavior and must not silently change trust, identity, or instructional meaning.
- When both translated and original content are available, make the active view explicit and preserve the user’s reading context when switching. A translation control changes the represented content; it must not reset an active task, selected offer, scroll position where technically possible, or related local state.
- Do not use flags, color, or script alone to identify a language, proficiency, locale, currency, or regional availability condition. Provide readable text and the appropriate accessible name or state.
- Anticipate language expansion in labels, buttons, tags, and metadata. Preserve required meaning through wrapping, reflow, a documented overflow summary, or a named continuation before truncating text or reducing type below the documented tier.
- Translate validation, loading, empty, error, recovery, and completion messages with the same state semantics as the source. Do not let a shorter localized string change whether a user understands an action as pending, successful, unavailable, or reversible.

### 12.9 Suggested Data And Content Output Skeleton

```md
Data And Content Proposal

Required Data:
Optional Data:
Primary Content:
Default Exposed Content:
Secondary Content:
Supportive Or Collapsible Content:
Missing Data Handling:
Key Data Relationships:
Terminology Notes:
Locale, Timezone And Format Notes:
Assumptions:
```

## 13. Responsive And Implementation Execution Rules

### 13.1 Breakpoint Defaults

| Name    |       Width | Key Changes                                                                                                                                                        |
| ------- | ----------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mobile  |     < 744px | Top navigation collapses; search form becomes single-column; filters move into a drawer or sheet; teacher cards stack; booking panel becomes a sticky bottom bar.  |
| Tablet  |  744–1128px | Hero may remain two-column with reduced gap; teacher list becomes one column; filters can move to top controls; booking panel may remain sticky at narrower width. |
| Desktop | 1128–1440px | Full top navigation; left filters and right teacher list; detail page uses main content and right booking panel; content width stays capped.                       |
| Wide    |    > 1440px | Content remains centered and capped; extra width becomes gutter space.                                                                                             |

### 13.2 Touch Targets

- Standard desktop buttons should default to 40px height.
- Use 48px only for a singular dominant action or a touch-critical mobile action that benefits from the larger target.
- Do not introduce 36px or 44px button tiers; the documented Button family supports 32px, 40px, and 48px only.
- Chips and pills should be at least 36px high, and 40px on mobile when possible.
- Inputs and selects should be at least 48px high.
- Teacher-card CTA targets should be at least 44 by 44px.
- Mobile sticky booking bars must include safe-area padding and must not cover final content.

### 13.2A Button Size Consistency

- Buttons that share the same visible row should use the same height and size tier by default.
- Do not mix 32px, 40px, and 48px buttons in the same row unless one control is intentionally a different object type or the difference is required by a clear product reason.
- If AI is unsure which button size to use on desktop, choose 40px first.
- If several buttons appear together in one row, prefer the smaller shared size unless that row contains one clearly dominant single-action CTA pattern.

### 13.2B Interaction State Rendering

- Every interactive object must define at least `default`, `hover`, `focus-visible`, and `disabled` behavior when that state is applicable. Selectable objects must also define `selected` and `pressed` or `active` behavior.
- State feedback must not change component dimensions, move nearby content, add bounce, or rely on shadow except for whole-card hover on intentionally clickable cards and persistent floating surfaces.
- Use the `COMPONENTS.md` color, border, elevation, and focus rules. Hover and focus should clarify interactivity, not create a second competing hierarchy.

| Object                                    | Hover / Focus-Visible                                                                                  | Selected / Pressed                                                       | Disabled                                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Gray emphasis button                      | Deepen `Gray/600` to `Foreground/Title`; no shadow or movement.                                        | Keep stronger fill while pressed.                                        | Muted gray fill with secondary or disabled text; explain the unavailable condition when it is not obvious. |
| Red CTA button                            | Deepen to the red pressed token; no shadow or movement.                                                | Keep red pressed state only while actively pressed.                      | Muted state; do not use bright red to imply availability.                                                  |
| Secondary, ghost, and icon button         | Use a restrained fill, border, or text-color change.                                                   | Remain secondary unless selected state has real meaning.                 | Reduce contrast and remove pointer affordance.                                                             |
| Chip, pill, nav item, or compact toggle   | Use border, fill, or text-color change only.                                                           | Use the black/gray selected system when selection is meaningful.         | Muted treatment; selection cannot change.                                                                  |
| Input or selectable row                   | Use border or neutral-fill change only.                                                                | Use explicit selected state plus text or semantic indicator when needed. | Retain readable value but clearly communicate unavailable interaction.                                     |
| Clickable card                            | May receive the one allowed subtle hover/focus lift.                                                   | Use explicit selection treatment only if the whole card is selectable.   | Avoid making the full card look tappable.                                                                  |
| Popover, dialog, drawer, or sheet trigger | Use the same low-emphasis state treatment as its control tier; expose expanded state programmatically. | Open state may use restrained active fill or border.                     | Surface cannot be invoked and the reason is discoverable when needed.                                      |

### 13.2C Interaction State QA

- `Affordance Test`: can users identify interactive objects without mistaking passive badges or static cards for controls?
- `Feedback Test`: does hover or focus make the control clearer without adding shadow, movement, or a new visual hierarchy?
- `Keyboard Test`: does `focus-visible` remain obvious when using keyboard navigation?
- `State Test`: are selected, open, loading, error, and disabled states conveyed by more than color when their meaning matters?
- `Consistency Test`: do controls in the same family use the same state language across page, dialog, drawer, and mobile sheet variants?

### 13.3 Responsive Collapsing Strategy

- Search form collapses from multi-column to single-column.
- Filters move from left rail to a trigger plus bottom sheet or drawer.
- Teacher cards collapse from horizontal evaluation layout to:
  - teacher identity
  - tags
  - price and rating
  - CTA
- Booking panel becomes a sticky bottom bar with expandable detailed booking controls.

### 13.4 Execution Constraints

- Do not use `Primary/Main` broadly.
- Do not use red for regular selected states.
- Do not use more than one red button on a page.
- Do not use a red major-action button on pages with multiple major actions.
- Do not replace that red button with multiple filled gray major-action buttons.
- Do not render multiple parallel major actions as equally strong filled buttons in the same visible area; downgrade them to secondary, ghost, or text treatments by default.
- Do not repeat filled gray or red buttons across every card in a repeated list.
- Do not make bordered white cards clickable as a whole.
- Do not add borders to gray internal modules or option blocks inside cards.
- Do not add borders to page shells, layout columns, section wrappers, or other non-component containers. A border requires an owning component contract or a necessary structural separator.
- Do not render a default icon-only utility control as a bordered square. Keep the hit area, but use transparent rest and restrained background or color feedback unless its component contract explicitly requires a border.
- Do not use an icon as a visual placeholder. If the icon kit has no semantically accurate match, remove the icon and keep the text or control simple.
- Do not apply a generic foundation radius over a component's documented radius contract. The `< 36px` full-radius rule in `COMPONENTS.md` applies only to new components without an explicit component radius.
- Do not leave clickable buttons or cards without hover or focus feedback.
- Do not add hover shadow to buttons, badges, inputs, or regular list rows.
- Do not make every tag colorful.
- Do not place colored soft tags on gray backgrounds.
- Do not let passive tag or badge clusters read like rows of equal-priority buttons or selected chips.
- Avoid card-in-card patterns unless the nested block is a distinct clickable or selectable option.
- Do not make all buttons pills.
- Do not make all badges pills.
- Do not let teacher cards become marketing-only cards.
- Do not keep complex multi-column filters on mobile.
- Do not let sticky booking bars cover page content.

### 13.5 Composition Rules

- Avoid card-in-card composition by default.
- For content inside a teacher card or booking panel, prefer section headings, dividers, list rows, grouped spacing, or a light-gray content zone.
- Use a distinct internal block only when it behaves as a clickable or selectable option.
- Gray internal option blocks should remain borderless and rely on fill change rather than card chrome.

### 13.6 Implementation-Facing References

- Follow token mapping, semantic color usage, Content Style, and visual implementation guidance in `COMPONENTS.md`.
- Follow the radius, corner smoothing, border, surface layering, typography, icon, and spacing rules in `COMPONENTS.md`.
- Use `COMPONENTS.md` as the source of truth for:
  - color mapping
  - typography mapping
  - radius and corner behavior
  - border and surface behavior
  - icon sizing and pairing

### 13.7 Accessibility And Motion Execution

`COMPONENTS.md` defines the visual accessibility and motion baseline. This section defines the implementation behavior required for every page, component, and invoked surface.

- Use native semantic elements and controls whenever they express the required interaction. A custom visual control must preserve the equivalent name, role, state, value, keyboard behavior, and disabled behavior.
- Keep DOM and keyboard focus order aligned with the visible task sequence. CSS placement must not cause keyboard users to encounter secondary content, hidden duplicates, or action controls before their local context.
- Use landmarks, headings, lists, tables, and field-group semantics when the content structure calls for them. Do not use generic wrappers when a real structural element carries the relationship.
- Give every interactive control an accessible name. A visible text label normally supplies it; icon-only, compact, and repeated controls need a specific name that includes enough local context to distinguish their result.
- Associate labels, descriptions, required state, validation, and error feedback with their owning input or choice group. Do not rely on placeholder text, proximity alone, or a page-level alert for a field-level error.
- Manage focus for dialogs, drawers, sheets, popovers, and other invoked surfaces according to their interaction boundary. A modal surface must receive focus when opened, keep focus within its active scope, expose a clear accessible name and dismissal route when dismissal is allowed, and return focus to the invoking control or the resulting changed object when closed.
- Announce meaningful asynchronous changes such as submitted results, validation failures, unavailable selections, saved changes, and task completion. Do not announce every loading tick, countdown update, decorative animation, or transient hover change.
- Preserve the current task state when an assistive-technology user opens, closes, retries, or recovers from a local surface. Do not reset entered values, scroll context, or selected options unless the user explicitly requested a destructive reset.
- Respect reduced-motion preferences. Motion must have an immediate, non-spatial alternative that communicates the same outcome and does not delay interaction.
- Do not hide essential instructions, status, validation, or recovery behind hover-only behavior, pointer-specific gestures, or an unavailable visual cue.

### 13.7A Accessibility And Motion QA

| Check                       | Pass Condition                                                                                            | Fail Condition                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Semantic structure          | Landmarks, headings, groups, lists, tables, and controls reflect the information and task structure.      | Generic containers obscure relationships or visual grouping is the only structure.                              |
| Accessible naming           | Each interactive control has a specific accessible name and state.                                        | Icon-only, repeated, or custom controls are ambiguous without surrounding visual context.                       |
| Keyboard path               | Tab order follows the task path; all available controls can be reached, operated, and exited by keyboard. | Focus reaches hidden duplicates, skips a needed action, becomes trapped, or follows a visually unrelated order. |
| Focus visibility and return | Focus remains visible; invoked surfaces receive and return focus predictably.                             | Focus is lost, returns to the page start, remains behind a modal, or has no visible indication.                 |
| Non-color meaning           | State is clear through text, icon, shape, or programmatic state as well as color.                         | Selection, error, warning, availability, or progress is communicated only with color.                           |
| Dynamic feedback            | Meaningful outcomes are announced once and remain discoverable in their local context.                    | Important results are silent, repeated timers create noise, or feedback disappears before it can be understood. |
| Text reflow                 | Required content remains readable when text grows or width shrinks.                                       | Required labels, values, errors, or actions are clipped, overlapped, or reduced below their type tier.          |
| Reduced motion              | The task works with motion reduced and the outcome remains clear without movement.                        | Motion is needed to understand state, blocks an action, or continues as ambient distraction.                    |

Apply this QA alongside the relevant component checklist and the `9.8 Page Composition Acceptance Gate`. A delivery cannot be marked complete when an applicable row fails.

## 14. Watchlist For Possible System Expansion

### 14.1 Existing Reuse Baseline

| Layer                        | Existing source                         | Reuse rule                                                                                                                                                        |
| ---------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generic interactive controls | `COMPONENTS.md`                         | Reuse a documented generic component and its props before proposing a product-local equivalent.                                                                  |
| Iconography                  | `COMPONENTS.md` Icon Library            | Use the approved local icon asset before requesting a new asset.                                                                                                  |
| Headless navigation          | `COMPONENTS.md` and `PATTERNS.md`       | Reuse prop-controlled navigation primitives; product adapters supply business data without becoming a new generic component. |

### 14.2 High-Reuse Component Candidates

- `Section Header / Section Intro`
- A future generic `navigation-row` adapter only after its data model no longer imports dashboard menu types or pinning semantics. Until then, use `NavigationItem` directly.

### 14.3 Composite Component Candidates

- `Trust Metrics Cluster`
- `Summary Block`

These are not system components yet.

They should be promoted only if repeated use shows that:

- the pattern is stable
- the structure is reused across contexts
- composition alone is no longer enough

## 15. Execution Validation, Handoff And Change Control

### 15.1 Purpose

Component QA checklists validate individual contracts. This section validates the assembled output before implementation is handed off, accepted, or used as a new reference.

The goal is to prove that the page solves the requested task with evidence-backed composition and real behavior. It is not a request to add more documentation, visible UI, or generic test states.

### 15.2 Required Delivery Record

Every delivery must include a concise record with:

- `Request And User Story`: the task being solved and the target outcome
- `Working Mode And Source`: reference-fidelity, rule-derived composition, or exploration mode, plus the highest-priority source used
- `Scope`: changed regions, unchanged regions, and deliberately omitted optional regions
- `Primary Task Path`: the entry state, required decision or input, primary action, and successful next state
- `Component Selection Trace`: selected contracts, their parent or slot relationship, and any documented contract gap
- `State Coverage`: the meaningful normal, loading, unavailable, validation, error, recovery, completion, and dismissed states
- `Responsive Coverage`: desktop and mobile task order, including any collapsed or invoked secondary surfaces
- `Accessibility And Motion Coverage`: applicable semantic structure, accessible naming, keyboard path, focus behavior, dynamic feedback, text reflow, and reduced-motion checks
- `Localization Coverage`: applicable language expansion, original or translated content, locale formatting, timezone, currency, and terminology checks
- `Execution Gate Status`: a `Pass`, `Needs Decision`, or `Blocked` result for each `9.8` acceptance-gate row

A delivery may link to an approved reference, prototype, implementation, or test evidence. It must not claim behavior that has not been designed or implemented.

### 15.3 Validation Sequence

Run validation in this order. Stop and correct an earlier failure before validating later layers.

1. `Source and scope`: confirm the working mode, source precedence, user task, primary action, changed area, and unchanged area.
2. `Composition`: run the visible-element evidence check, proximity check, module-omission test, repetition check, and page acceptance gate.
3. `Contract and behavior`: confirm each chosen component owns its displayed information, state, action, and destination. Remove decorative or nonfunctional controls.
4. `Content and data`: verify required data, relationships, terminology, missing-data degradation, and trust-content provenance.
5. `Responsive and interaction`: verify task sequence, focus order, touch targets, invoked-surface return context, and meaningful interactive states at each required viewport.
6. `Reference fidelity`: when a reference exists, compare shell, major regions, information order, density, omissions, and interaction model before comparing minor visual details.

### 15.4 Scenario Coverage Matrix

Validate only the states applicable to the object. A missing state may be marked `Not Applicable` only when the reason is recorded.

| Scenario                              | Required Verification                                                                                                       | Failure To Avoid                                                                                            |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Initial or default state              | The user can identify the current object, required information, and next meaningful action.                                 | A generic shell, unrelated recommendation, or decorative region appears before task context.                |
| Incomplete input or selection         | Required fields, eligibility, and validation feedback stay attached to the owning input or option group.                    | Disabled controls without a reason, page-level errors for local mistakes, or lost user input.               |
| Loading or delayed data               | Layout reserves the meaningful task structure and avoids fabricated content or false availability.                          | Random skeletons, misleading action readiness, or layout shifts that obscure the path.                      |
| Empty, unavailable, or blocked state  | The reason is understandable and the strongest valid recovery path is visible.                                              | A decorative empty state, a misleading success treatment, or an unavailable action that appears actionable. |
| Error and recovery                    | The user keeps recoverable context and can retry, revise, or leave without losing more work than necessary.                 | Generic failure copy detached from the failed object or a destructive reset without warning.                |
| Selected, changed, or pending state   | The new state is visible where the decision was made and any dependent data is updated or invalidated explicitly.           | Stale price, duration, slot, filter, or selection information elsewhere on the page.                        |
| Success or completion                 | The outcome is clear, the completed action is no longer presented as pending, and the next valid continuation is available. | Success styling for an unresolved state, duplicate completion actions, or unclear return context.           |
| Dismissed or closed secondary surface | Draft values, active selection, focus, and return context follow the invoked-surface contract.                              | Lost work, focus jumping to the page start, or a modal/drawer that leaves the task state ambiguous.         |

### 15.5 Reference Comparison Rules

Use reference comparison only in `Reference fidelity mode`. A reference review answers whether the implementation preserves the approved composition; it does not authorize new product behavior.

Compare in this order:

1. page family, shell, and current task
2. visible regions, hierarchy, local relationships, and deliberate omissions
3. content density, line wrapping, continuation boundaries, and responsive order
4. component state and interaction model
5. token-level visual details from `COMPONENTS.md`

Do not fail a rule-derived composition because it does not reproduce a reference that was not supplied for that work. Do not pass a referenced page merely because its colors and typography are close while its task sequence, shell, or information ownership differs.

### 15.6 Handoff Boundaries

The handoff must make these boundaries explicit:

- Designers define approved visual references, information hierarchy, interaction intent, and any decision that changes product meaning.
- Engineers implement documented contracts, semantic states, responsive behavior, accessibility behavior, and real destinations or callbacks.
- AI may assemble, explain, and implement within approved sources and contracts. It must flag uncertain product meaning, missing data behavior, undefined interaction outcomes, or a genuine contract gap.
- Reviewers validate the delivery record and report corrections as reference-specific direction, component-contract change, composition rule, visual-foundation change, or acceptance-check candidate.

No role should fill an unknown product or behavior decision with a plausible visible element. Mark it `Needs Decision` or `Blocked` according to the execution gate.

### 15.7 Change Control

Treat a document change as a controlled system change when it modifies a shared component contract, page recipe, visual foundation, acceptance gate, or source-precedence rule.

For each controlled change, record:

```md
System Change Record

Triggering Evidence:
Failure Mode Or Opportunity:
Proposed Classification:
Affected Contract, Recipe, Or Foundation:
Cross-Context Evidence:
User-Impacting Outcome:
Boundary And Non-Examples:
Migration Or Compatibility Notes:
Validation Needed:
Decision: Adopt / Keep Local / Reject / Revisit
```

Rules:

- use `0.6A Demo Calibration Audit` when a demo, screenshot, or review is the triggering evidence
- prefer a local reference note or implementation correction when the evidence does not justify a shared change
- update the destination document once; do not copy the full rule into audits, demos, or several component contracts
- when a new shared rule changes an existing recipe or component, state the affected consumers and any migration condition
- keep rejected and reference-specific decisions discoverable in their audit or reference location, not in the shared rule set
