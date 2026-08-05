# AI.md — italki Design System execution pack

**This file is a gate and a router, not a substitute for the system.** It carries
the rules needed to compose and validate a page. It deliberately does **not**
carry component anatomy — you must fetch that per component (see §2).

- Catalog (every component, every documented state): https://design.italkiux.com/
- Component contracts (machine-readable): https://design.italkiux.com/catalog-runtime/contracts.json
- Component API index: https://design.italkiux.com/catalog-runtime/component-api.json
- Full authored rules, when this file is not enough:
  [DESIGN.md](https://design.italkiux.com/docs/core/DESIGN.md) (product direction) ·
  [COMPONENTS.md](https://design.italkiux.com/docs/core/COMPONENTS.md) (visual foundation + all 76 component contracts) ·
  [PATTERNS.md](https://design.italkiux.com/docs/core/PATTERNS.md) (product composition) ·
  [EXECUTION.md](https://design.italkiux.com/docs/core/EXECUTION.md) (157 sections; this file condenses the generation-relevant ones)

Rule ownership, in case of conflict: product direction defers to `DESIGN.md`;
visual tokens and component contracts defer to `COMPONENTS.md`; product-object
composition defers to `PATTERNS.md`; task, hierarchy, page and behavior rules
defer to `EXECUTION.md`.

---

## 1. Non-negotiable execution gate

Pass this gate **before** writing markup. It is fail-closed: when evidence is
missing, remove the element or ask a focused question. Never fill a gap with a
plausible-looking UI choice.

### 1.1 Select the working mode first

| Mode | Use when | Obligation |
| --- | --- | --- |
| `Reference fidelity` | A Figma frame, screenshot, or existing screen is supplied | Reproduce that page's shell, composition, visible information, and interaction model before considering any new composition |
| `Rule-derived composition` | No specific visual reference exists | Compose from the closest existing page recipe and existing contracts, then apply `DESIGN.md` direction and `PATTERNS.md` composition |
| `Exploration` | The requester explicitly asks for alternatives or a new visual direction | Output must not be presented as the production implementation |

### 1.2 Source precedence

1. the exact referenced Figma node or approved screenshot
2. an existing page recipe for the same page family
3. an existing component contract and approved variant
4. `DESIGN.md` direction, `COMPONENTS.md` foundation, `PATTERNS.md` composition
5. AI inference — **only** for information grouping, copy structure, and safe responsive adaptation

Never use a lower source to contradict a higher one. A generic rule cannot
justify changing an explicit Figma composition, and a component contract cannot
justify adding a component the current user story does not need.

### 1.3 Visible element evidence check

For **every** visible region, be able to state:

- `Element` — what is visible
- `User Need` — which current task it supports
- `Evidence` — reference node, page recipe, component contract, or explicit request
- `Relationship` — which nearby object or action it belongs to
- `Removal Test` — what breaks if it is removed

If a region has no evidence, no clear relationship, or no meaningful removal
consequence, **do not implement it**. This applies to logos, navigation items,
sidebars, cards, borders, icons, badges, progress labels, helper copy, and
secondary actions.

### 1.4 Never invent these without evidence

- brand marks, logo combinations, navigation shells, fixed or sticky behavior
- new cards, side panels, banners, hero areas, tabs, or modal structures
- icons chosen only to occupy an available slot
- borders, shadows, radii, gradients, decorative artwork, or color treatments
- extra actions, progress indicators, recommendations, or explanatory panels

### 1.5 Page composition gate

- One page has one identifiable current task or state.
- Every visible block sits adjacent to the object or action it explains.
- Optional content must pass the module-omission test before inclusion.
- Repeated information has exactly one owner — do not restate the same lesson,
  date, price, or destination in multiple regions.
- Mobile preserves the same task sequence and local relationships before
  exposing secondary content.
- A real page never displays component names, rule labels, legends, or
  implementation notes.

### 1.6 Completion status

Report `Pass`, `Needs Decision`, or `Blocked` for every acceptance-gate row
(§12). **`Needs Decision` and `Blocked` are not complete states.** Never fill an
unknown product or behavior decision with a plausible visible element.

---

## 2. Component resolution gate — MANDATORY

**You must not generate a component from memory or from your own priors about
what that component usually looks like.**

Before using any component:

1. Confirm it exists in the inventory (§13).
2. **Fetch its entry** from
   https://design.italkiux.com/catalog-runtime/component-api.json
   (or `contracts.json`) and use only its documented props, defaults, enum
   values, and states. `COMPONENTS.md` holds the prose contract if you need
   anatomy, accessibility, or slot rules.
3. Call the component with documented props and supplied slots only. Do **not**
   pass a class name, arbitrary attribute, raw token, or unregistered asset as an
   escape hatch. Do **not** recreate its DOM, CSS, hover, focus, disabled,
   loading, selected, input, or ARIA behavior.
4. If the contract lacks the variation you need, **report the gap** and request
   the smallest extension. Never silently add a new class, raw color, radius,
   shadow, icon, or state.
5. If you cannot retrieve the contract, mark that component `Blocked` rather
   than guessing its API.

Report implementation evidence as `region → component → props → contract state
coverage`. If a visible region does not resolve to a component, a pattern, or an
approved extension, remove it or mark the work incomplete.

---

## 3. Request intake

```md
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
- business constraints, existing patterns to reuse, device priority,
  what can be secondary or collapsed, possibly missing data
```

Ask one focused question **only** when the answer materially changes: whether the
user is evaluating / selecting / committing; whether a value changes immediately
or needs explicit apply; whether the task is local, persistent, or a dedicated
flow; whether options are mutually exclusive or multi-select; or whether a new
capability changes business, trust, or commitment meaning.

If the task signal maps clearly to an existing contract, select it without asking
the requester to choose a component.

---

## 4. Scope and component selection

### 4.1 Scope selection

| Requirement shape | Default output | Rule |
| --- | --- | --- |
| A distinct end-to-end task | Page recipe or flow step | Start from the closest page family before adding modules |
| A capability inside an existing task page | Existing-page enhancement | Reuse the page hierarchy and declare what stays unchanged |
| Repeatedly evaluating several instances of one object | Reusable card / row / list unit | Use an existing repeated-object contract before new card anatomy |
| A short local adjustment or secondary task | Invoked surface, local control, or guidance block | Choose the smallest appropriate popover, dialog, drawer, sheet, or inline pattern |
| Entering, correcting, or submitting structured data | Form family + feedback pattern | Start from input, label, validation, and submission behavior |
| Understanding a result, absence, warning, or recovery path | Feedback or empty-state family | Match the state *meaning* before choosing visual treatment |
| More context about an already visible object | Continuation pattern | Use inline reveal, expand, `See all`, overflow, or a follow-up view by depth |

### 4.2 Task → component

Select by task role, required data, interaction depth, and repetition frequency.
Never pick a component because it is visually familiar or because the request
said "add a card".

| User need | Use | Boundary |
| --- | --- | --- |
| Start teacher discovery | `search` | Do not replace with a dense filter panel before results exist |
| Narrow an existing result set | filters panel + applied-filters summary + optional sort control | Keep active narrowing visible in results |
| Change only result order | sort control (compact control or popover) | Do not use a full filter surface for ordering alone |
| Evaluate several teachers quickly | `teacher-card` + `tag` / `badge` + trust metadata | Reuse the repeated evaluation unit; do not create a card per visible field |
| Verify teacher fit before commitment | teacher detail recipe + trust metrics + review card + lesson-option group | Add only the evidence the current fit decision needs |
| Compare or choose lesson offers | lesson-option group + pricing row | Keep price, duration, meaning, and selected state together; no free-floating price blocks |
| Find or select a bookable time | availability `calendar` + `time-slot` + booking panel | Keep timezone, duration, slot eligibility, and selected time connected |
| Continue or complete a booking | booking panel + lesson options + feedback/availability state | Keep required choice, commitment context, and next action in one recoverable path |
| Show position in a bounded multi-step task | `stepper` | Communicate current, completed, blocked, error. Not page navigation, tabs, breadcrumbs, or a route map |
| Show continuous completion or measured work | `progress` | Requires a bounded value or explicit indeterminate state. Not for named steps or decorative momentum |
| Reveal one bounded supporting section | `disclosure` | Keep the summary available. Never hide task-critical requirements or build a wall of accordions |
| Switch closely related panels / a compact local view mode | `tabs` or `segmented-control` | Tabs for panels, segmented for a small immediate mode switch. Neither is global navigation, task progress, or a form choice group |
| Confirm a non-blocking, recoverable outcome | `toast` | Never the sole recovery path for validation, payment, or a blocked task |
| Explain a persistent local warning, error, or blocked state | `alert` + optional local recovery | Keep it beside the affected form, collection, booking, or payment context until resolved |
| Reserve known structure while data loads | `skeleton` | Mirror meaningful layout. No invented text, false availability, or interactive targets |
| Move through a bounded collection | `pagination` | Result or history collections only. Not task steps or route navigation |
| Choose a payment route | payment-method + choice group + local feedback | Keep default, selected, unavailable, verification-required, and failed states explicit. No raw card data in the contract |
| Review amount before payment | order-summary + payment-stage action | Keep purchase context, discounts/credits, fees or tax, and final amount together. The summary never calculates or submits |
| Enter or change structured information | `form-field` + `text-input` / `textarea` / `select` / `combobox` + error message | A display row is not an input substitute |
| Choose one date or bounded range | `date-picker` (+ `form-field` when a label or validation is needed) | Do not reuse a schedule grid, historical calendar, or booking availability view as a generic date picker |
| Choose one supplied time interval | `time-slot` inside an availability schedule | The parent owns date, timezone, duration, availability, and resulting task state. A time-slot never holds inventory |
| Adjust a small bounded integer | `form-field` + `number-stepper` | Only when increment/decrement is clearer than free entry. Not for package, date, time, or money |
| Explain success, warning, blocked progress, or error | feedback family (`alert`, `result`, `notification`, `toast`) | Feedback marks a state transition, not decorative emphasis |
| Explain no results, no availability, or first-use absence | empty-state family | Select the variant from *why* content is missing, then expose the strongest recovery action |
| Orient or continue a local section | section / action header | Only when the section needs distinct task meaning or a local utility action |
| Offer a compact temporary choice, setting, or edit task | overlay family (§6) | Select by task depth and device context, not visual novelty |
| Read substantial supporting detail without leaving the page | long-form detail dialog | Only after a concise inline preview and explicit `Show more`. Preserve the source page |
| Surface a personalized recommendation or continuation | Mira module family | Select by learner outcome and trigger. Required course actions, errors, and booking decisions stay in their task-specific patterns |
| Add a capability with no matching contract | Existing page recipe + a new composition proposal | Do not invent a named reusable component first. Define the task structure, reuse primitives, explain the real structural gap |

### 4.3 Selection rules

- Start from the smallest complete assembly. Add a component only when it
  resolves a distinct need another chosen component does not already cover.
- One user story may need several components, but each must have a
  non-overlapping role.
- Repeated content uses one consistent unit contract. Do not create several
  near-identical cards because fields differ slightly.
- "More information" does not automatically justify a new module. Test whether it
  belongs in the current object, a continuation pattern, or an invoked surface.
- "A button" does not automatically justify a new action. Classify it first:
  execution, selection, utility, recovery, navigation, or dismissal.
- If a contract matches the task, reuse it even when copy, data, or placement
  differ. Propose a new component only when the contract cannot support the
  required task role or state model.

---

## 5. Action hierarchy

The black/gray emphasis system is the default. `Gray/600` is the default
emphasis fill; `Foreground/Title` is reserved for hover, focus, and stronger
emphasis. The existence of the gray system does **not** mean every important
action becomes a filled gray button.

The brand red button uses `Primary/Main` (`#FF4338`).

**Decision order:**

1. Does the page have one clearly dominant primary execution action? → use one red button.
2. Does the page have more than one major action? → **no red button**, and do **not** render them all as filled gray either. Default to secondary, ghost, or text.
3. Is the action secondary, supporting, canceling, filtering, or utility? → secondary, ghost, text, or other non-filled treatment.
4. Is the action part of a repeated list or card structure? → no repeated filled CTAs. Secondary or ghost, unless a hovered, focused, selected, or active state is intentionally promoted.

| Situation | Allowed highest emphasis | Default rule |
| --- | --- | --- |
| One dominant page-level execution action | One red button | All other actions on the page are secondary, ghost, text, or utility-only |
| Multiple parallel major actions | Secondary hierarchy only | Do not make them all filled |
| One dominant local action in a contained surface | One filled gray button if needed | Only when that surface has one singular next step and the page is not already crowded with emphasis |
| Repeated actions across cards, rows, list items | Secondary or ghost at rest | Filled emphasis only on hovered, focused, selected, or active items |
| Filters, sorting, utility, navigation, reversible local controls | Secondary, ghost, text, or chip state | Never escalate to main-CTA styling |
| Recovery actions in empty, warning, or blocked states | Usually secondary or ghost | Escalate only with one clearly best recovery path and no competing equal-priority action |

**Escalation tests** — all must pass before any filled major button:
`Singularity` (the one clearest next action in scope?) · `Competition` (creates a
second equally loud button nearby?) · `Repetition` (repeats across cards/rows?) ·
`Recovery` (actually a supporting or corrective action?) · `Reversibility`
(lightweight or reversible, so it should stay lighter?).

**Filter and selection behavior:** filter selection uses the black/gray system,
not red. Quick filters and chips may use `Gray/600` fill with white text, or
white fill with a dark border. Unselected chips and passive neutral tags on gray
page backgrounds use white fill — never colored soft fills for neutral metadata.

**Local grouping:** a local action row should contain at most one strong
execution action. Utility controls (presentation, sorting, saving, sharing,
filtering, navigation) cluster together and stay visually secondary. Metadata
chips usually appear above or before the action area, not inside it. If unsure
whether one more local control helps, assume it does not.

---

## 6. Information architecture, density, and surfaces

### 6.1 Order and hierarchy

- Primary information directly supports the current task. Required information
  comes before complete information — do not show content because it exists.
- Distinguish primary / secondary / supportive-or-collapsible. Hierarchy must not
  be flat.
- Section order matches how the user understands → evaluates → confirms → acts.
- Every page defines its **first-screen question**.
- Do not force marketplace evaluation logic onto booked-lesson, lesson-prep,
  post-lesson summary, or practice pages.
- Escalate to the requester only when hierarchy changes business meaning,
  primary action priority, trust logic, or commitment logic.

### 6.2 Default exposure

| Situation | Default exposure |
| --- | --- |
| First screen of a page | Only the core question, required decision data, and next step |
| Repeated cards, rows, list items | Compressed evaluation view — only what enables at-a-glance comparison |
| Detail page sections | One clear section summary plus the most decision-relevant evidence |
| Booking or commitment surfaces | Current booking summary, required choices, action context. Reassurance and policy stay lighter and later |
| Learning, summary, practice surfaces | Current task, current progress, immediate continuation cue. History comes after the active layer |
| Filters, reviews, policies, FAQs | Progressive reveal — highest-value subset first |

**Collapse tests** — before keeping content visible by default: `Task` (helps the
current task right now?) · `Timing` (needed before the next action, or only after
interest?) · `Evaluation` (helps evaluate options, or just background?) ·
`Crowding` (makes surrounding hierarchy flatter or noisier?) · `Continuation`
(still reachable later if hidden?) · `Mobile` (usable when the layout narrows?).

If unsure whether information belongs in the default state, **assume it does
not** — unless removing it would block understanding or action.

### 6.3 Continuation patterns

| Pattern | Use when | Do not use when |
| --- | --- | --- |
| `Inline reveal` | One short, directly related explanation in the same reading flow | Content is long, forms a separate task, or needs its own evaluation space |
| `Disclosure / accordion` | A bounded section needs more supporting content while its summary stays useful | The content is required before the page-level action, or many unrelated accordions would result |
| `See all` | A curated preview represents a homogeneous collection with a meaningful full destination | The user must inspect remaining items to complete the current decision |
| `Overflow summary` (`+3 more`) | A compact repeated set exceeds local space | Hidden items change the meaning of the main action or need side-by-side evaluation |
| `Drawer` | A secondary multi-control task needs focused space while the page stays relevant | It is a single small choice, or deserves a dedicated page |
| `Bottom sheet` | A concise mobile-local choice or bounded mobile filter task | Long forms, deep navigation, or nested scrolling would result |
| `Dedicated follow-up view` | The continuation became its own task: deep evaluation, long collection, complex selection, shareable destination | The user only needs a short clarification or one local choice |

Constraints: every continuation control **describes its destination or revealed
content** — avoid bare `More`, `View`, or an unlabeled ellipsis when a specific
label is possible. Continuation controls are local utility actions: secondary,
ghost, or text, never the red CTA. `+N more` must make discoverable what the
remaining items are. A drawer, sheet, or follow-up view preserves active filters,
selected options, entered values, and the logical return path; closing returns
focus to the invoking control unless the user completed a state-changing action.

### 6.4 Content surface selection

| Surface | Use when | Do not use when |
| --- | --- | --- |
| Default page layer | Needed to understand, evaluate, or complete the primary task without interruption | Optional, intermittent, or would make the page structurally dense |
| Inline layer | One small local choice, explanation, or status beside the object it affects | Several groups, long lists, or a separate decision task |
| `popover` | A compact anchored utility, short form, or small value list | Needs persistent context, several control groups, long reading, or heavy mobile interaction |
| `dropdown-menu` | A short list of commands or navigation actions | It is a filter, form, value picker, comparison, or hidden primary navigation |
| `tooltip` | A visible control or abbreviation needs optional short clarification | The explanation is essential, interactive, long, or unavailable to touch-only users |
| `modal` | A bounded focused task needing temporary attention (moderate filters, concise confirmation) | A single small choice, a long form, deep evaluation, or a multi-step flow |
| `drawer` | A secondary task with several control groups or needing vertical space | Short enough for a popover or sheet, or deep enough for a dedicated view |
| Bottom sheet | A concise mobile-local choice or bounded mobile filter task | Deep nested scrolling, long forms, or extensive multi-option evaluation |
| Dedicated follow-up view | Content became its own task | The user needs only a small temporary adjustment |

**Invocation rules:** an invocation control uses a specific task label —
`Filters (3)`, `Sort: Best match`, `Choose time`, `View all reviews`, `Edit
lesson` — never vague `Open` / `Manage` / a bare icon when text is feasible. When
an invoked surface changes page state, reflect the result in the default page
layer after dismissal (active filters remain visible as an applied-filter
summary). Declare whether changes apply immediately or require explicit
`Apply` / `Save` / `Done`; do not mix those models without a clear reason. Use at
most one strong local completion action inside a modal, drawer, or sheet. Do not
launch a modal or sheet from another one unless the second is a short system
confirmation. Preserve draft values, selections, and the return point.

**Filter surface placement:** 1–2 high-impact frequently adjusted criteria →
inline or compact top row. Several related criteria not needed for every scan →
modal on desktop, bottom sheet on mobile. Many grouped criteria or a longer
refinement task → drawer or dedicated filter view. Filter state already active →
applied-filter summary in the results layer plus an invoked edit surface. One
quick ordering choice → popover or compact inline control.

**Surface QA:** `Layer` (must it stay visible while scanning, or can it be
invoked?) · `Trigger` (does the label describe task *and* current state?) ·
`Scope` (large enough but no larger?) · `State` (is the result visible after
dismissal when it matters?) · `Completion` (immediate vs one explicit action?) ·
`Escape` (dismiss and return without losing context, values, orientation?).

If you cannot justify why content must be permanently visible, prefer an invoked
secondary surface over adding another page module.

---

## 7. Page assembly

Do not assemble pages from module lists. Start from: what the user sees first →
what they need to understand next → what supports the decision → where the action
lives → what happens next.

- **One dominant path per object**, even when supporting actions exist.
- Primary components sit in the primary path, not buried under decorative or
  supporting blocks.
- **Time-sensitive work outranks optional content.** On a learning-home,
  dashboard, or course hub, place time-sensitive lesson status and
  action-required course work **before** recommendations, promotions,
  achievements, topic content, and optional progress summaries. If no operational
  course state exists, promote the most useful continuation for the learner's
  lifecycle stage rather than leaving an unexplained empty top area.
- Supporting blocks may explain, reassure, or guide, but must not compete with
  the main path.
- Repeated units must not all present the same high-emphasis action or visual
  weight.
- Existing-page enhancements must state clearly **what remains unchanged**.

Every complete object defines: entry layer · core layer · action layer ·
supporting layer · content surface plan · invocation points for secondary content
· next-step logic.

**Layout rhythm.** Do not default every page to a rigid vertical stack of
heading → full-width block → full-width block. Pair different densities
intentionally (dense evidence with short explanation; long-form explanation with
compact metrics; primary block with a lighter supporting side block). When two
adjacent blocks support the same decision moment, consider a split composition
before stacking. Prefer pairing on desktop when one block is denser, the other
more summary-like, and both support the same decision step. On mobile preserve
the same conceptual grouping. Let typographic scale, width, and whitespace do
some hierarchy work — do not solve every distinction by adding another card.
Before finalizing, run a **module-omission test**: remove every optional region
that does not materially support the current task, supplied product logic, or a
necessary continuation. If the page improves, keep it removed.

---

## 8. Typography and density

- Establish one page-level lead, one section-title tier, one module-title tier,
  one body tier, one caption tier. Do not give every block a strong headline.
- Repeated cards, rows, and modules reuse the same internal type hierarchy
  instead of escalating each item independently.
- Compact controls — buttons, chips, badges, tabs, segmented options, dense
  utility rows — use compact text tiers only. A control under 40px tall should
  almost never exceed the compact control range.
- Strong numeric content (price, rating, trust figures) may take numeric
  emphasis, but its supporting label stays quiet.
- Solve hierarchy with weight, spacing, grouping, and contrast **before**
  increasing size.

**Escalation tests:** `Scope` (does this define the current page / section /
module step?) · `Container` (enough space without making neighbors feel
undersized?) · `Competition` (multiple equally loud headings nearby?) ·
`Repetition` (repeats across a list or grid?) · `Support` (could spacing,
grouping, contrast, or weight solve it instead?).

---

## 9. Data and content

- Content follows the task, not the data inventory. Do not show content because
  it exists.
- Every object distinguishes **required** data from **optional** data.
- Related data stays together: price with duration; metric value with metric
  meaning; time with date or status; summary point with continuation cue.
- **Missing data degrades gracefully.** You may reorder, collapse, omit optional
  content, or use safe placeholders when allowed. You may **not** invent facts,
  fabricate trust signals, guess prices, ratings, dates, or lesson outcomes, or
  create fake user content.
- Trust data must be clear, correctly contextualized, easy to scan and evaluate,
  and never fabricated or padded.
- Instructional content (lesson prep, summary, practice) guides action, surfaces
  key takeaways first, reduces friction to continue, and avoids promotional
  language.

**Localization and format:**

- Use product locale and formatter data for dates, times, numbers, currencies,
  percentages, plurals. Components receive **formatted display values** plus
  semantic context; they must not recreate locale rules by string concatenation.
- Keep displayed currency, price meaning, duration, package condition, and any
  estimate or conversion note together. Never present an approximate local
  currency as the committed booking total unless product data says it is.
- **Timezone is required context** whenever a user evaluates availability,
  selects a time, confirms a booking, or reads a time-sensitive lesson state.
- Preserve user- and teacher-authored names, source-language lesson content, and
  language names as supplied.
- When translated and original content both exist, make the active view explicit
  and preserve reading context when switching — do not reset an active task,
  selected offer, or related local state.
- Do not use flags, color, or script **alone** to identify a language,
  proficiency, locale, currency, or regional availability condition. Provide
  readable text plus an accessible name or state.
- Anticipate language expansion in labels, buttons, tags, metadata. Preserve
  meaning through wrapping, reflow, a documented overflow summary, or a named
  continuation **before** truncating text or dropping below the documented tier.
- Translate validation, loading, empty, error, recovery, and completion messages
  with the same state semantics as the source.

---

## 10. Responsive, interaction states, and implementation

### 10.1 Breakpoints

| Name | Width | Key changes |
| --- | --- | --- |
| Mobile | < 744px | Top nav collapses; search becomes single-column; filters move to drawer or sheet; teacher cards stack; booking panel becomes a sticky bottom bar |
| Tablet | 744–1128px | Hero may stay two-column with reduced gap; teacher list becomes one column; filters can move to top controls |
| Desktop | 1128–1440px | Full top nav; left filters + right teacher list; detail page uses main content + right booking panel; content width capped |
| Wide | > 1440px | Content stays centered and capped; extra width becomes gutter |

**Collapsing strategy:** search multi-column → single column. Filters left rail →
trigger + bottom sheet or drawer. Teacher cards → teacher identity / tags /
price and rating / CTA. Booking panel → sticky bottom bar with expandable
controls.

### 10.2 Touch targets and button sizing

- Desktop buttons default to **40px**. Use 48px only for a singular dominant
  action or a touch-critical mobile action.
- The Button family supports **32px, 40px, 48px only** — never introduce 36px or
  44px tiers.
- Chips and pills ≥ 36px, and 40px on mobile when possible. Inputs and selects
  ≥ 48px. Teacher-card CTA targets ≥ 44×44px.
- Mobile sticky booking bars need safe-area padding and must not cover final
  content.
- Buttons sharing a visible row use the same height and size tier. Do not mix
  32/40/48 in one row unless one control is intentionally a different object
  type. If unsure on desktop, choose 40px. With several buttons in one row,
  prefer the smaller shared size unless that row has one clearly dominant CTA.

### 10.3 Interaction states

Every interactive object defines at least `default`, `hover`, `focus-visible`,
and `disabled` when applicable. Selectable objects also define `selected` and
`pressed`/`active`. **State feedback must not change component dimensions, move
nearby content, add bounce, or rely on shadow** — except whole-card hover on
intentionally clickable cards, and persistent floating surfaces.

| Object | Hover / focus-visible | Selected / pressed | Disabled |
| --- | --- | --- | --- |
| Gray emphasis button | Deepen `Gray/600` → `Foreground/Title`; no shadow or movement | Stronger fill while pressed | Muted gray fill; explain the unavailable condition when not obvious |
| Red CTA button | Deepen to red pressed token; no shadow or movement | Red pressed only while actively pressed | Muted; never bright red implying availability |
| Secondary / ghost / icon button | Restrained fill, border, or text-color change | Stay secondary unless selection has real meaning | Reduce contrast, remove pointer affordance |
| Chip, pill, nav item, compact toggle | Border, fill, or text-color change only | Black/gray selected system when selection is meaningful | Muted; selection cannot change |
| Input or selectable row | Border or neutral-fill change only | Explicit selected state plus text or semantic indicator | Value stays readable, unavailability is clear |
| Clickable card | May receive the one allowed subtle hover/focus lift | Explicit selection only if the whole card is selectable | Avoid making the full card look tappable |
| Overlay trigger | Same low-emphasis treatment as its control tier; expose expanded state programmatically | Open state may use restrained active fill or border | Cannot be invoked; reason discoverable when needed |

**Interaction QA:** `Affordance` (are interactive objects identifiable without
mistaking passive badges or static cards for controls?) · `Feedback` (does hover
or focus clarify without shadow, movement, or a new hierarchy?) · `Keyboard`
(does `focus-visible` stay obvious?) · `State` (are selected, open, loading,
error, disabled conveyed by more than color when meaning matters?) ·
`Consistency` (same state language across page, dialog, drawer, mobile sheet?).

### 10.4 Hard execution constraints

- Do not use `Primary/Main` broadly.
- Do not use red for regular selected states.
- **Do not use more than one red button on a page.**
- Do not use a red major-action button on pages with multiple major actions.
- Do not replace that red button with multiple filled gray major-action buttons.
- Do not render multiple parallel major actions as equally strong filled buttons
  in the same visible area — downgrade to secondary, ghost, or text by default.
- Do not repeat filled gray or red buttons across every card in a repeated list.
- Do not make bordered white cards clickable as a whole.
- Do not add borders to gray internal modules or option blocks inside cards.
- Do not add borders to page shells, layout columns, section wrappers, or other
  non-component containers. A border requires an owning component contract or a
  necessary structural separator.
- Do not render a default icon-only utility control as a bordered square. Keep
  the hit area, use transparent rest with restrained feedback, unless its
  contract requires a border.
- Do not use an icon as a visual placeholder. If the icon kit has no semantically
  accurate match, remove the icon and keep the text or control simple.
- Do not apply a generic foundation radius over a component's documented radius
  contract.
- Do not leave clickable buttons or cards without hover or focus feedback.
- Do not add hover shadow to buttons, badges, inputs, or regular list rows.
- Do not make every tag colorful.
- Do not place colored soft tags on gray backgrounds.
- Do not let passive tag or badge clusters read like rows of equal-priority
  buttons or selected chips.
- Avoid card-in-card patterns unless the nested block is a distinct clickable or
  selectable option.
- Do not make all buttons pills. Do not make all badges pills.
- Do not let teacher cards become marketing-only cards.
- Do not keep complex multi-column filters on mobile.
- Do not let sticky booking bars cover page content.

**Composition:** avoid card-in-card by default. Inside a teacher card or booking
panel, prefer section headings, dividers, list rows, grouped spacing, or a
light-gray content zone. Use a distinct internal block only when it behaves as a
clickable or selectable option; gray internal option blocks stay borderless and
rely on fill change rather than card chrome.

### 10.5 Accessibility and motion

- Use native semantic elements and controls whenever they express the required
  interaction. A custom visual control must preserve the equivalent name, role,
  state, value, keyboard behavior, and disabled behavior.
- Keep DOM and keyboard focus order aligned with the visible task sequence. CSS
  placement must not make keyboard users encounter secondary content, hidden
  duplicates, or action controls before their local context.
- Use landmarks, headings, lists, tables, and field-group semantics when the
  content structure calls for them. Do not use generic wrappers when a real
  structural element carries the relationship.

`COMPONENTS.md` defines the visual accessibility and motion baseline — consult it
for contrast, focus ring, and reduced-motion specifics.

---

## 11. Scenario coverage

Validate only the states applicable to the object. A missing state may be marked
`Not Applicable` **only** when the reason is recorded.

| Scenario | Required verification | Failure to avoid |
| --- | --- | --- |
| Initial / default | User can identify the current object, required information, next action | Generic shell, unrelated recommendation, or decorative region before task context |
| Incomplete input or selection | Required fields, eligibility, validation feedback stay attached to the owning input or option group | Disabled controls without a reason; page-level errors for local mistakes; lost input |
| Loading or delayed data | Layout reserves meaningful task structure without fabricated content | Random skeletons, misleading action readiness, layout shifts obscuring the path |
| Empty, unavailable, blocked | Reason is understandable; strongest valid recovery path is visible | Decorative empty state, misleading success treatment, unavailable action that looks actionable |
| Error and recovery | User keeps recoverable context and can retry, revise, or leave | Generic failure copy detached from the failed object; destructive reset without warning |
| Selected / changed / pending | New state is visible where the decision was made; dependent data updated or explicitly invalidated | Stale price, duration, slot, filter, or selection elsewhere on the page |
| Success / completion | Outcome is clear; completed action no longer looks pending; next continuation available | Success styling for an unresolved state; duplicate completion actions; unclear return context |
| Dismissed / closed secondary surface | Draft values, selection, focus, return context follow the invoked-surface contract | Lost work; focus jumping to page start; ambiguous task state |

---

## 12. Page composition acceptance gate

Report `Pass` / `Needs Decision` / `Blocked` for **every** row.

| Check | Pass | Fail |
| --- | --- | --- |
| Task clarity | The first viewport makes the current user task or state obvious | The page begins with generic content, decorative framing, or unrelated recommendations |
| Element evidence | Every visible region has a reference, recipe, contract, or explicit user-story reason | A region exists because it seemed useful, complete, or visually balanced |
| Proximity | Each label, value, status, progress cue, and action sits next to the object it describes | Information floats in a corner or is separated from its owner by unrelated content |
| Omission | Removing any optional region would cause real loss of understanding, action, or context | Removing it makes the page clearer without breaking the task |
| Repetition | Each fact, destination, and action has one visible owner | The same lesson, date, summary, or next action appears in multiple regions |
| Surface discipline | Borders, shadows, icons, badges, artwork come from a contract or explicit reference | A visual treatment was added to fill space or make a region look designed |
| Component reuse | Existing component variants are used when their contract matches | A one-off component or renamed duplicate was created for convenience |
| Mobile sequence | Mobile order preserves task content, decision controls, feedback, continuation as one local flow | Secondary context or navigation interrupts the current action path |
| Interaction reality | Every visible interactive control has correct state behavior and destination | A control is decorative, static, fake, or has no meaningful result |
| Reference fidelity | The result feels like the supplied product page, including its restraint and omissions | The result reads like a component showcase or generic dashboard template |

**If any row fails, the page is not ready.** Fix the structure first — do not
compensate with colors, borders, larger typography, or extra explanation.

**Validation order** (fix an earlier failure before validating later layers):
source and scope → composition → contract and behavior → content and data →
responsive and interaction → reference fidelity.

---

## 13. Inventory

**52 registered component contracts** — fetch each one's API before use (§2):

```
alert, avatar, badge, breadcrumb, button, calendar, card, checkbox,
checkbox-group, chip, combobox, date-picker, disclosure, divider, drawer,
dropdown-menu, footer, form-field, modal, notification, number-stepper,
pagination, panel, popconfirm, popover, popup, progress, radio, rate, result,
search, segmented-control, select, selection, sidebar, skeleton, slider,
statistic, stepper, switch, table, tabs, tag, text-input, textarea,
time-picker, time-slot, timeline, toast, tooltip, top-nav, upload
```

**Product pattern families** — reuse these instead of assembling from scratch:
Authenticated Workspace Shell · Discovery And Teacher Evaluation · Teacher Detail
· Booking And Payment · Mira. See
[PATTERNS.md](https://design.italkiux.com/docs/core/PATTERNS.md).

A pattern is a product-specific composition of documented components and supplied
business data. It is not a generic component and never replaces a component
contract. Keep supplied business data, route state, price calculation,
availability, entitlement, and persistence **outside** component ownership.

---

## 14. Required output shape

```md
Working Mode:
Highest-Priority Visual Source:
Task Interpretation:
Confirmed Information:            (explicitly stated in the request)
Assumed Information:              (inferred — flag anything load-bearing)
Scope:                            (in scope / out of scope / unchanged regions / deliberately omitted)
Primary Task Path:                (entry state → required decision or input → primary action → successful next state)
Must-Have Information:
Default Exposed Information:
Secondary Or Collapsible Information:
Component Selection Trace:        (task role, chosen contract, why it fits, alternatives rejected, why no new component is needed, and any contract gap)
Composition Trace:                (parent component, accepted slots, interaction owner, omitted optional slots and why)
Visible Element Evidence Record:  (per region: Element / User Need / Evidence / Relationship / Removal Test)
State Coverage:                   (normal, loading, empty, unavailable, validation, error, recovery, completion, dismissed)
Responsive Coverage:              (desktop and mobile task order, collapsed or invoked secondary surfaces)
Accessibility Coverage:           (semantic structure, accessible naming, keyboard path, focus behavior, reduced motion)
Localization Coverage:            (language expansion, locale formatting, timezone, currency, terminology)
Acceptance Gate Status:           (Pass / Needs Decision / Blocked for each of the 10 rows in §12)
Next Step:
```

Never claim behavior that has not been designed or implemented.
