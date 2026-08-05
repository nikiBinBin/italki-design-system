# COMPONENTS.md

## Purpose

This is the visual-system and component-contract source of truth. It defines Foundations, Content Style, and reusable UI components. Product meaning and object relationships belong in `PATTERNS.md`; responsive behavior, interaction, accessibility execution, and page recipes belong in `EXECUTION.md`; product decision principles belong in `DESIGN.md`.

Components receive supplied props, slots, and state. They do not fetch product data, inspect routes, infer business outcomes, or create page composition unless the contract explicitly says so.

## Rule Priority

For Foundations, Content Style, and reusable UI anatomy, props, states, and component-level accessibility, this document is authoritative. It defers product direction to `DESIGN.md`, business-object composition to `PATTERNS.md`, and page placement, responsive behavior, and execution validation to `EXECUTION.md`.

## Executable UI Kit

The contracts in this document have an executable reference layer in `catalog-runtime/` for the components currently migrated there. It is framework-neutral, has no product, route, data-fetching, or business dependency, and accepts only supplied UI props and slots. It drives the static Catalog only; production React pages consume `react-web/`.

- `catalog-runtime/contracts.json` is the single machine-checkable registry of accepted props, variants, sizes, states, token values, and approved asset roots. `npm --prefix maintenance run build:contracts` generates the file-loaded runtime contract from it; do not edit the generated `catalog-runtime/contracts.js` directly.
- `catalog-runtime/tokens.css` is the shared semantic token implementation for the static Catalog. Raw color and shadow values belong there, never inside a Catalog component stylesheet.
- `catalog-runtime/italki-ui.js` is the callable pure-UI renderer and state-controller API. It rejects undeclared props, unapproved asset paths, and enum values. Catalog examples for a migrated component call this API; they must not redraw the same component anatomy, styling, state transition, or ARIA behavior locally.
- `catalog-runtime/italki-ui.css` owns the migrated Catalog component visual implementation.
- `catalog-runtime/component-api.json` and `docs/reference/COMPONENT_API.md` are generated searchable indexes of every accepted prop, runtime default, state, enum, and allowed Foundation token family. `catalog-runtime/panda-api.json` and `docs/reference/PANDA_API.md` are the generated prop-by-prop bridge to the current Panda implementation: each Catalog prop is marked `direct`, `adapter`, `catalog-only`, or `gap`. Generate these indexes with `npm --prefix maintenance run build:api`; do not edit them manually.
- `maintenance/fixtures/fixtures.js` derives the required state fixtures from the same callable API. `maintenance/scripts/validate-contracts.mjs` checks token drift, state coverage, prop enums, asset roots, runtime output, ARIA, escape-hatch props, and Catalog consumption. `maintenance/tests/catalog-runtime.visual.spec.mjs` holds screenshot regression coverage for documented states.

The current migrated set is `button`, `chip`, `tag`, `checkbox` (including its `checkbox-group` composite), `radio`, `selection`, `form-field`, `text-input`, `textarea`, `number-stepper`, `upload`, `search`, `combobox`, `select`, `date-picker`, `time-picker`, `time-slot`, `tooltip`, `modal`, `drawer`, `popup`, `popover`, `popconfirm`, `dropdown-menu`, `divider`, `stepper`, `avatar`, `badge`, `breadcrumb`, `card`, `disclosure`, `alert`, `toast`, `notification`, `result`, `skeleton`, `progress`, `tabs`, `pagination`, `rate`, `sidebar`, `footer`, `statistic`, `table`, `calendar`, `timeline`, `top-nav`, `slider`, `panel`, `segmented-control`, and `switch`. The explicit pending queue is recorded in `catalog-runtime/contracts.json` under `migration.pending`; it is a visible system gap, not permission to create a Catalog-only version. A component outside the migrated set is not an executable implementation: AI must stop and report the gap until it is migrated. Each migration must first add the component to the registry and state fixtures, then make Catalog consume the shared renderer, then pass contract and visual checks.

Use `docs/reference/COMPONENT_API.md` for human component lookup, `docs/reference/PANDA_API.md` for prop-level Panda translation, or their JSON files for tool lookup, then run `npm --prefix maintenance run component:check -- <component-name>` before implementation. A migrated component prints its accepted props, required states, and available Panda mapping; an unmapped API remains explicitly `pending`, not inferred. A pending or unknown component exits as `BLOCKED`. This is the executable form of the component-selection gate.

Rules:

- A page or Catalog example must call the existing UI-kit component when one is available. It may pass documented props and supplied content slots only; it may not pass arbitrary HTML attributes or CSS classes, override anatomy with one-off CSS, or locally recreate hover, focus, disabled, loading, selected, input, or accessibility behavior.
- A new required variant, token, icon, slot, or state is a contract change. Add it to this document and the registry first; if it is not covered, stop and request the smallest approved extension rather than approximating it.
- A component is not stable until its contract test and visual state fixture pass. A visual match without shared implementation is a draft, not a reusable component.

## Colors

### Brand & Accent

- **Gray/600** (#515164): Default black/gray emphasis button fill. Figma Button `Primary-Black / Default` uses this color.
- **Foreground/Title** (#313140, alias `Gray/800`): Hover, focused, and strong emphasis color. Used for button hover/focused states, headings, prices, and strong text emphasis. Do not use it as the default black/gray button fill.
- **Primary/Main** (#FF4338, alias `Red/600`): Brand red button color. Use it for the red CTA visual variant. Do not use it for regular selected states. Screen-level CTA usage rules live in `EXECUTION.md`.
- **Primary/Shade-0** (#D3382F, alias `Red/700`): Deeper red for error, destructive, warning-adjacent emphasis, and red CTA hover/pressed states when a red CTA mode is intentionally chosen.
- **Red/500** (#FF7B73): Light coral step for illustration details or low-priority warm accents.
- **Primary/Shade-1** (#FF8E87, alias `Red/400`): Light coral step for illustration details or low-priority warm accents.
- **Primary/Surface** (#FFF1F1, alias `Red/50`): Very soft red surface for gentle hints, red CTA-adjacent hints, error-adjacent hints, promotional areas, light badges, and low-priority empty states. Do not use for regular active chips.

### Complementary

- **Teal/700** (#009897): Deep teal for information emphasis, illustration details, and supporting icons. Do not use as a main CTA.
- **Teal/500** (#00BFBD): Main supporting accent. Suitable for learning progress, availability, language support, and positive informational cues.
- **Teal/300** (#4CD1D0): Light teal for tags, avatar backgrounds, and illustration details.
- **Teal/50** (#EDFAFA): Very light teal surface for information panels or card-internal supporting modules.

### Surface

- **Background/Page** (#F5F6F9, alias `Gray/50`): Default page background. Use for search pages, detail pages, filter zones, and page whitespace.
- **Background/Card** (#FFFFFF): Teacher cards, filter panels, booking panels, review cards, pricing rows, and modal content.
- **Foreground/Divider** (#F5F6F9, alias `Gray/50`): Secondary fills inside cards, input zones, internal separators, and very light dividers.
- **Background/Hover** (#EBEDF1, alias `Gray/100`): The one-step deeper gray for an already `Foreground/Divider`-filled interactive surface on hover. Use this instead of adding shadow.

Hover depth is relative to the resting surface: an available transparent or white surface fills with `Foreground/Divider` (#F5F6F9) on hover; an available surface already filled with `Foreground/Divider` deepens to `Background/Hover` (#EBEDF1). Semantic, selected, disabled, and emphasized components follow their own explicit state contract rather than this neutral rule.
- **Special/Always-White** (#FFFFFF): Fixed white content on dark, image, or colored backgrounds.
- **Special/Always-Dark** (#000000): Mask base, high-contrast icons, and special overlays.
- **Special/Mask** (#00000099, alias `Alpha/Black-60`): Modal, drawer, image hover, or disabled overlays.

### Hairlines & Borders

- **Foreground/Border** (#E5E8ED, alias `Gray/200`): Input outlines, card internal dividers, filter boundaries, and pricing-row separators.
- **Foreground/Divider** (#F5F6F9, alias `Gray/50`): Very light dividers for card internals and list spacing.

### Border And Stroke Usage Rules

Use borders as structural tools, not as general decoration. Do not add strokes freely just to make a component feel more designed.

Default rules:

- Default UI border width is 1px.
- Default border color should come from `Foreground/Border` unless a semantic status border is explicitly required.
- Internal dividers should use the lightest divider treatment needed to preserve grouping.
- A border may be introduced only by the owning component contract or by a clearly necessary structural separator. Page shells, layout wrappers, section wrappers, and non-component grouping containers default to no border.

Allowed uses:

- inputs and selects
- secondary controls when a border helps communicate affordance
- filter boundaries
- pricing-row separators
- internal dividers inside larger white surfaces
- static card containers when a bordered container is the intended pattern

Avoid by default:

- borders on every card in a repeated list if the card pattern is meant to feel lighter
- borders on gray internal neutral blocks
- decorative borders that do not communicate structure or state
- multiple nested borders in the same local surface
- borders added to make a non-component layout region look like a card

State rules:

- Focus states should usually prefer border-color change before adding new visual chrome.
- Hover states should not default to thicker borders.
- Selected states should not create a second redundant outline if fill or emphasis already communicates state clearly.
- Error states may use semantic error border treatment when the component is an input, field group, or field-level validation surface.

Hierarchy rules:

- If a parent container already uses a border, child elements should usually use dividers or spacing instead of additional full outlines.
- Use separators to divide rows inside a surface. Use borders to define the surface itself.
- Do not use a border merely to announce that a section exists. Use spacing, typography, or a surface change first.
- If AI is unsure whether a border is needed, prefer no border and rely on spacing, background layering, or typography first.

### Border Density Limits

Too many borders make surfaces feel mechanical and noisy.

Rules:

- A compact component should usually expose no more than one outer stroke.
- A standard card-like surface should usually have either:
  - one outer border
  - or internal dividers
  - but not both at the same visual strength
- Repeated list items should not all receive heavy boxed borders unless the pattern explicitly depends on it.
- Nested bordered rectangles should be treated as an exception, not a default.

### Text

- **Foreground/Title** (#313140, alias `Gray/800`): Page titles, section headings, teacher names, important prices, and strong emphasis.
- **Foreground/Primary-text** (#515164, alias `Gray/600`): Default body text, navigation, labels, teacher summaries, and form text.
- **Foreground/Secondary-text** (#767687, alias `Gray/500`): Metadata, helper text, lesson duration, dates, and review details.
- **Foreground/Disabled-text** (#C7CBD3, alias `Gray/300`): Disabled labels, inactive controls, and unavailable states.
- **Foreground/Placeholder-text** (#9C9CAC, alias `Gray/400`): Input placeholder and empty-value text.
- **Special/Text-Link** (#59779A, alias `Blue/400`): Inline links, return paths, and low-priority text actions.

### Status & Availability

- **Status/Available** (#98D45F, alias `Lime/500`): Open time slots, positive availability, and bookable states.
- **Status/Available-surface** (#F4FBEA, alias `Lime/50`): Soft availability surfaces, schedule hints, and lightweight positive availability badges.
- **Status/Available-current-day-surface** (#E7FCF5): Current-day context in a teacher availability calendar. It is a passive date-header surface, not a success state or a selectable time slot.
- **Status/Error** (#D3382F, alias `Red/700`): Validation errors, failed payments, destructive states, and unavailable booking states.
- **Status/Error-surface** (#FFF1F1, alias `Red/50`): Soft error backgrounds and low-intensity blocked-state surfaces.
- **Status/Info** (#00B3BD, alias `Teal/600`): Neutral information, system messages, and learning guidance.
- **Status/Info-surface** (#EDFAFA, alias `Teal/50`): Soft information panels and card-internal supporting modules.
- **Status/Success** (#0DE298, alias `Green/400`): Booking success, saved state, completed lesson state, and completed progress.
- **Status/Success-surface** (#ECFFF9, alias `Green/50`): Soft success backgrounds and completion surfaces.
- **Status/Warning** (#FFC400, alias `Yellow/400`): Scheduling conflicts, low availability, and pending confirmation.
- **Status/Warning-surface** (#FFF9E6, alias `Yellow/50`): Soft warning, learning guidance, and lightweight achievement surfaces.

### Color Application Rules

Color is a product signal, not the first source of hierarchy. Start with content order, typography, spacing, and neutral surfaces; then apply one named semantic role only where it carries an additional meaning.

- **Brand priority:** Use `Primary/Main` for one decisive booking, submit, or conversion action in a task area. `Primary/Shade-0` is its hover or pressed treatment and `Primary/Surface` is supporting context only. Do not use brand red for ordinary selection, and do not let a Red CTA communicate error.
- **Functional status:** Use `Status/Available` only for supplied bookable time or availability; `Status/Success` for completed or saved results; `Status/Info` for neutral guidance; `Status/Warning` for attention or a pending decision; and `Status/Error` for failure, blocked state, or destructive consequence. Use the solid token for a marker, icon, border, or strong status and the matching surface token for a quiet supporting region. Every status must also include clear copy and, where appropriate, an approved icon.
- **Neutral structure:** `Foreground/Title`, text tokens, `Background/Page`, `Background/Card`, `Foreground/Divider`, `Foreground/Border`, and `Background/Hover` carry normal reading order and layout. A transparent or white interactive surface fills with `Foreground/Divider` on hover; a surface already using that fill may deepen once to `Background/Hover`.
- **Link and Plus:** `Special/Text-Link` is for navigation and references, not a replacement for a general action button. `Gradient/Pro` is reserved for italki Plus identity and Plus features; it is never a generic emphasis or status color.
- **Themes and extensions:** Consume named semantic tokens in both light and dark UI; do not copy a light-mode hex value into a component. Do not introduce a raw hex, decorative rainbow treatment, or an unregistered color meaning. A missing role is a token gap that must be added before implementation.

### Accessory

- **Yellow/50** (#FFF9E6): Gentle hints, learning guidance, and lightweight achievement surfaces.
- **Teal/50** (#EDFAFA): Language support, availability, and lesson-method hints.
- **Red/50** (#FFF1F1): Promotions, trial offers, and gentle alert backgrounds.
- **Green/50** (#ECFFF9): Success, completion, and progress backgrounds.

### Engineering Token Handoff

Engineering implementations consume semantic roles, never raw primitive ramps or project-specific legacy variables. A theme provider selects the Light or Dark value from the semantic mapping in this document; components request roles through props or their local semantic token contract.

| Semantic role | Framework-neutral key | CSS custom property |
| --- | --- | --- |
| Primary/Main | `color.primary.main` | `--ui-color-primary-main` |
| Background/Page | `color.background.page` | `--ui-color-background-page` |
| Background/Card | `color.background.card` | `--ui-color-background-card` |
| Background/Hover | `color.background.hover` | `--ui-color-background-hover` |
| Foreground/Title | `color.foreground.title` | `--ui-color-foreground-title` |
| Foreground/Primary-text | `color.foreground.primaryText` | `--ui-color-foreground-primary-text` |
| Foreground/Secondary-text | `color.foreground.secondaryText` | `--ui-color-foreground-secondary-text` |
| Foreground/Border | `color.foreground.border` | `--ui-color-foreground-border` |
| Foreground/Divider | `color.foreground.divider` | `--ui-color-foreground-divider` |
| Status/{tone} | `color.status.{tone}` | `--ui-color-status-{tone}` |
| Status/{tone}-surface | `color.status.{tone}Surface` | `--ui-color-status-{tone}-surface` |
| Gradient/Pro | `gradient.pro` | `--ui-gradient-pro` |

Rules:

- A component accepts a semantic `tone`, `variant`, or explicitly supplied token reference; it does not inspect the active theme, derive a shade, or hardcode a hex value.
- A theme boundary resolves `light` or `dark` once and supplies the same semantic role to every descendant. It must not make a component depend on browser preference, application route, account state, or a particular CSS framework.
- `--ui-*` names are documentation-level handoff names, not a required repository API. An implementation may map them to another token system only when the semantic role and Light/Dark values remain identical.
- Primitive aliases such as `Red/600`, `Gray/800`, and `Teal/700` remain the source palette. Use them only through the semantic role shown above, except where a documented visual contract explicitly names a primitive.

## Typography

### Font Family

Use **Noto Sans** across the system:

`"Noto Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

The font works well for Chinese, English, Japanese kana, teacher names, and JLPT labels. The Figma variable `Font-family/Default` is Noto Sans.

### Multilingual Content Resilience

The product must remain readable when the same task is presented in Chinese, English, Japanese, another supported language, or a mixture of learner, teacher, and system languages. Language changes affect content length and grouping; they do not justify a different visual hierarchy.

- Let translated labels, teacher names, lesson titles, and explanatory copy wrap within their documented content boundary. Do not shorten, clip, or reduce required text merely to preserve a sampled reference height.
- Preserve user- or teacher-provided names, lesson titles, language names, and source-language content unless there is an approved localization or translation behavior. Do not rewrite them into a different tone, casing, or script for visual consistency.
- Use readable product-approved language names and proficiency labels. A flag, script sample, or color may support recognition but must not be the only language identifier.
- Keep a language label, its proficiency cue, and any translation or original-language status in one reading group. Do not distribute them across distant metadata rows.
- Design columns, cards, controls, and action labels for language expansion. Reflow, use a documented continuation, or move low-priority content before compressing required type, control targets, or text spacing.
- Dates, times, prices, quantities, and percentages should use locale-aware formatting supplied by the product. Do not hard-code visual punctuation, currency placement, or a single date order into a reusable component.
- When the current task depends on scheduled time, keep the timezone label visually connected to the date, time range, or selected slot. A timezone is task context, not decorative metadata.

### Hierarchy

| Token                        |    Size |  Weight | Line Height | Letter Spacing | Use                                                                                                              |
| ---------------------------- | ------: | ------: | ----------: | -------------: | ---------------------------------------------------------------------------------------------------------------- |
| `{title.h1-banner}`          |    48px |     700 |        60px |              0 | Hero banner; one per landing or marketing page                                                                  |
| `{title.h2}`                 |    40px |     700 |        48px |              0 | Primary page title                                                                                               |
| `{title.h3}`                 |    32px |     700 |        40px |              0 | Major section heading                                                                                            |
| `{title.h4-page}`            |    24px |     700 |        32px |              0 | Sub-section or content group title                                                                               |
| `{title.h4}`                 |    20px |     700 |        28px |              0 | Figma-confirmed H4; module and filter headings                                                                   |
| `{body.large}`               |    16px |     500 |        24px |              0 | Important body text, teacher intro, detail lead                                                                  |
| `{action.button-lg}`         |    16px |     600 |        24px |              0 | Large buttons                                                                                                    |
| `{action.button}`            |    14px |     600 |        20px |              0 | Figma-confirmed default button text                                                                              |
| `{body.default}`             |    14px |     500 |        22px |              0 | Default UI text, card metadata, tags                                                                             |
| `{typography.caption}`       |    12px | 600–700 |     16–18px |              0 | Form labels, eyebrows, status microcopy                                                                          |
| `{typography.micro}`         |    10px |     500 |        14px |              0 | Restricted online status, unread count, timestamp, or terse secondary metadata                                 |
| `{typography.price}`         | 20–24px |     700 |         1.2 |              0 | Teacher-card price, booking-panel price                                                                          |
| `{typography.compact-price}` |    14px |     700 |        20px |              0 | Price inside a compact comparison card's `booking-offer-summary`; not for teacher detail or booking-panel prices |
| `{typography.rating}`        |    14px |     700 |        20px |              0 | Rating, lesson count, retention stats                                                                            |

### DS3.0 Figma Styles

The named text styles in the DS3.0 Figma library, for exact matching when normalizing a mockup. Format is `weight · size/line-height`. All use Noto Sans.

| Figma Style                    | Spec                     | Use                                                                 |
| ------------------------------ | ------------------------ | ------------------------------------------------------------------- |
| `Title/H1-Banner`              | 700 · 48/60              | Hero banner; one per landing or marketing page                     |
| `Title/H2`                     | 700 · 40/48              | Primary page title                                                  |
| `Title/H3`                     | 700 · 32/40              | Major section heading                                               |
| `Title/H4-Page`                | 700 · 24/32              | Sub-section or content group title                                 |
| `Title/H5-Panel, Popup`        | 700 · 20/28              | Dialog, panel, or modal title                                      |
| `Title/H6-Label`               | 700 · 16/24              | Teacher name, card title, or compact section label                 |
| `Text/Body-Large`              | 500 · 16/24              | Spacious body copy                                                 |
| `Text/Body`                    | 500 · 14/22              | Default product body copy                                          |
| `Text/Tiny-Caption`            | 500 · 12/18              | Helper text and metadata                                           |
| `Body/Micro`                   | 500 · 10/14              | Restricted to terse metadata such as online status or timestamps   |
| `Special/Buttons Subtitle`     | 600 · 14/20              | Default button label                                               |
| `Action/Button-LG`             | 600 · 16/24              | Large button label                                                 |
| `Action/Button-SM`             | 600 · 12/18              | Compact 32px button label                                          |
| `Action/Input`                 | 500 · 14/16              | Input values and placeholders                                      |
| `Special/OVERLINE`             | 600 · 12/16 · +0.75     | Eyebrows and all-caps category labels                              |
| `Special/Speech-italic`        | 400 italic · 14/22       | Quotes, testimonials, and person-attributed speech                 |
| `Link/16`                      | 500 · 16/24              | Default text link                                                  |
| `Link/14`                      | 500 · 14/22              | Compact inline or secondary text link                              |

Available size tokens: 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 52, 60. Weight tokens: Regular 400, Medium 500, SemiBold 600, Bold 700, ExtraBold 800 (800 is reserved for the documented hero exception and rare brand marks; default body remains Medium 500).

### Principles

Headings should be clear but not overly SaaS-like or aggressive. italki pages help learners decide whether a teacher fits their goals, so headings provide direction while teacher cards carry the decision data.

Default body text uses 14px / 22px / 500. Longer explanatory text may use 16px / 24px, especially teacher introductions, teaching-method descriptions, and review content.

Default md button text follows the Figma Button spec: 14px / 600 / 20px. Compact 32px buttons use 12px / 600 / 18px; larger CTA surfaces may use 16px / 600 / 24px. Button labels should be direct, for example: “Book trial”, “View profile”, “Search teachers”.

### Typography Selection Rules

When AI or engineers choose typography, they should not select sizes freely by taste. Choose type by content role first and container role second.

Rules:

- A single component should usually use no more than 3 text tiers:
  - primary
  - secondary
  - supportive
- Card titles should default to `Title/H6-Label` or `Title/H4`. Do not jump to `Title/H3` unless the card is acting like a page-level hero or major panel.
- Section titles should default to `Title/H4` or `Title/H3`. Use `Title/H2` or above only for major page-level headings.
- Default body copy should use `Body/Default`. Use `Body/Large` only when the content needs stronger readability or carries more interpretive weight.
- Metadata, helper text, and supporting detail should default to `Body/Caption` or visually equivalent small text tiers.
- Labels for inputs, controls, and compact helpers should stay in the compact label range. Do not let labels visually compete with the content they describe.
- Prices, ratings, and compact trust figures may use stronger numeric emphasis, but supporting labels should remain secondary.
- Do not mix too many headline scales inside one surface. A page may have several typographic scales, but each local module should stay controlled.
- If AI is unsure between two adjacent type sizes, prefer the smaller one unless the content clearly needs stronger hierarchy.

### Typography Token Enforcement

Use only the typography sizes and styles defined in this document. Do not invent intermediate text sizes, weights, or line-height pairings.

Allowed size tokens:

- 12
- 14
- 16
- 18
- 20
- 24
- 28
- 32
- 36
- 40
- 44
- 48
- 52
- 60

Allowed weight tokens:

- 400
- 500
- 600
- 700
- 800, only for `{typography.hero}` and rare brand-mark exceptions

Rules:

- Do not introduce unsanctioned sizes such as 13px, 15px, 17px, 19px, 22px, 26px, 30px, or similar in-between values unless this document is explicitly updated to include them.
- Do not introduce arbitrary line-heights for convenience. Use the line-heights defined by the named typography styles or the documented token pairings in this file.
- Do not use 800 weights for normal interface text. Reserve it for `{typography.hero}` and rare brand-mark exceptions only.
- If AI is unsure which size to use, it must choose the nearest smaller allowed token rather than inventing a new size.
- If AI is unsure which style to use, it should select the closest existing named text style rather than composing a new one from scratch.
- Each local component or module should map its typography to existing roles such as title, body, caption, label, link, or action text.
- If a component requires text emphasis, prefer changing role or weight within the system before changing the size outside the system.

### Typography Tier Limits

Control the number of visible text tiers inside each local surface. Too many text sizes make modules feel noisy and reduce clarity.

Rules:

- A single small component should usually use no more than 2 text sizes.
- A standard card, form group, or compact panel should usually use no more than 3 text tiers:
  - primary
  - secondary
  - supportive
- A large page section may use 4 text tiers only when there is a clear structural reason, such as:
  - section title
  - section intro
  - body content
  - caption or metadata
- Avoid using more than 4 visible text sizes inside one local module or section.
- Do not create emphasis by assigning every row its own text size.
- Repeated list items should keep the same internal text hierarchy across siblings.
- If two adjacent text roles feel too close, change weight, color, or spacing before introducing a new size tier.
- If AI is unsure whether a new text size is necessary, assume it is not necessary and reuse an existing tier.

### Typography Size-To-Container Fit

Text size must stay proportional to the height and visual density of the component that contains it. Do not place oversized type inside small controls or compact surfaces.

Rules:

- Small controls and compact chips should not use headline-style text.
- Standard buttons, chips, compact tabs, and dense rows should usually keep text at 12–16px.
- Small cards and compact modules should usually keep their largest text at 16–20px unless the surface is intentionally acting as a key numeric or price display.
- Large numeric emphasis such as price or rating may exceed normal body sizing, but only when the container is visually designed to support that emphasis.
- Do not place `Title/H3`, `Title/H2`, or larger headline scales inside compact controls, compact chips, metadata rows, or other dense utility surfaces.
- Do not use hero, display, or large section-title scales inside a component that is primarily a control.
- If a component height is below 40px, its text should almost never exceed 16px.
- If a component height is 40–56px, its text should usually stay at 14–16px.
- If a component is compact but needs stronger emphasis, increase weight or contrast before increasing the size.
- If AI is unsure whether a text size feels too large for a component, assume it is too large and step down one allowed token.

## Icon Library

This kit ships a **flat local SVG set** under `Assets/Icons/` — the product source of truth. Use these files directly; never pull from short-lived Figma asset URLs. Three sets:

- **Main** — `Assets/Icons/*.svg`, drawn for 24px (`viewBox="0 0 24 24"`). The default UI set: navigation, actions, content, status, and brand marks.
- **Small (16px)** — `Assets/Icons/16px/*.svg`, drawn for 16px. Use for dense metadata and compact UI instead of shrinking a 24px icon.
- **Backup** — `Assets/Icons/backup/*.svg`, for cases the main set does not cover. Always try the main set first.

### Naming

Flat, kebab-case, **single token — no category prefix, no per-category folders**. The file name _is_ the icon name.

| File                                    | Name in code           | Use                              |
| --------------------------------------- | ---------------------- | -------------------------------- |
| `Assets/Icons/search.svg`               | `search`               | Search fields, teacher discovery |
| `Assets/Icons/filter.svg`               | `filter`               | Filter buttons and sheets        |
| `Assets/Icons/favorite-outline.svg`     | `favorite-outline`     | Unsaved teacher / lesson         |
| `Assets/Icons/favorite-solid.svg`       | `favorite-solid`       | Saved teacher / lesson           |
| `Assets/Icons/teacher.svg`              | `teacher`              | Teacher navigation               |
| `Assets/Icons/calendar.svg`             | `calendar`             | Schedule and booking             |
| `Assets/Icons/logo-italki-logomark.svg` | `logo-italki-logomark` | Brand mark (do not recolor)      |
| `Assets/Icons/logo-italki-plus.svg`     | `logo-italki-plus`     | Compose after the standard italki wordmark; use Gradient/Pro only |

Conventions:

- Outline / solid pairs use `-outline` / `-solid` (e.g. `favorite-outline` / `favorite-solid`, `star-outline` / `star-solid`, `pin-outline` / `pin-solid`).
- 16px-specific icons carry `-sm` and live in `16px/`.
- Brand / logo marks use the `logo-italki-*` prefix and ship white variants (`-white`).
- In the Icon Library catalog, inverse white logo previews use a `Primary/Main` red tile and appear after the standard Brand marks; this is a catalog presentation rule, not a new logo variant.

### Sizing

| Token            |    Size | Use                                                                                     |
| ---------------- | ------: | --------------------------------------------------------------------------------------- |
| `{icon.sm}`      |    16px | Dense metadata, helper rows — use the `16px/` set, don't shrink a 24px icon             |
| `{icon.default}` |    24px | Default UI icon size — buttons, icon buttons, navigation, cards, and standalone actions |
| `{icon.brand}`   | 32–56px | Logo and brand marks                                                                    |

### Color & Tone

The kit mixes two color modes — respect each icon's mode:

- **Most UI icons are stroke-based and use `currentColor`.** They inherit text color, so drive their color through the surrounding text color / `tone`. Don't hardcode a hex on them.
- **Status icons ship with fixed semantic fills** and must not be recolored: `check` (Status/Success #0DE298), `error` (Status/Error #D3382F), `cross` (#515164). Use them as-is for success / error / dismiss.
- **Brand & logo marks keep their own color.** Do not tint `logo-italki-*` with `currentColor`, do not stretch them, and do not use them as decorative UI icons. `logo-italki-plus` uses `Gradient/Pro` only.

### Usage

- **Pair icons with a label** wherever the meaning isn't obvious. An icon-only control (icon button, nav item) needs an `aria-label`.
- **Pick size by context, not by eye:** this system only uses 16px and 24px UI icons. Use 16px for inline metadata and dense helper contexts. Use 24px for buttons, standalone actions, icon buttons, navigation, and cards. Do not invent a 20px middle size.
- **Match the icon to the action** using the real flat name: `search`, `filter`, `favorite-outline`→`favorite-solid` on toggle, `calendar` for scheduling, `message` for chat, `translate` for language.
- **Stay inside the kit.** Only use files that already exist in `Assets/Icons/` (incl. `16px/`, `backup/`). Do not import Lucide, Font Awesome, remote URLs, Figma temporary asset links, or copied inline SVGs. If a meaningful icon is unavailable, omit the icon and keep the label or control simple. Report an icon gap only when a reference or component contract requires a non-textual icon and no clear text alternative can preserve the task.
- **One icon system per surface.** If a prototype used an open-source set, swap to the kit icon before review.

### Catalog Enforcement

Every functional pictogram in `index.html` must render an approved asset from the Icon Library: `Assets/Icons/` first, then `Assets/Icons/16px/`, then `Assets/Icons/backup/` only when the first two sets have no suitable asset. Do not use Unicode symbols, CSS-drawn pictograms, inline SVG, external icon URLs, or a visually similar substitute for a real UI icon. Text punctuation, numeric values, status geometry, and product imagery are not UI icons. Before introducing an icon, check the Icon Library and its documented size. If the required concept or required 16px/24px variant is missing, stop and report the gap with the intended action and suggested asset name; do not create an ad hoc icon or scale an asset to imitate an unavailable size.

### Icon And Text Pairing Rules

When icons appear with text, choose icon size, spacing, and alignment by text role and control type. Do not size or place icons freely by eye.

| Context                              | Default Icon Size | Default Gap To Text | Notes                                                                |
| ------------------------------------ | ----------------: | ------------------: | -------------------------------------------------------------------- |
| Dense metadata row                   |              16px |                 4px | Use the 16px icon set                                                |
| Compact helper row                   |              16px |               4–6px | Keep icon visually secondary                                         |
| Button with leading icon             |              24px |                 8px | Default button icon pairing                                          |
| Button with trailing icon            |      16px or 24px |                 8px | Use 16px for compact directional cues and 24px for full action icons |
| Navigation item                      |              24px |                 8px | Keep icon and label visually balanced                                |
| Standalone action with visible label |              24px |                 8px | Use the default 24px UI icon size                                    |

Rules:

- If a button contains text and an icon, the icon should usually sit on the leading side unless the trailing placement communicates direction, expansion, or navigation.
- Use only 16px or 24px UI icons. Do not interpolate to 20px for button icons.
- Use 24px as the default button icon size when a button includes an icon.
- Use 16px icons for dense metadata and helper rows. Do not shrink 24px icons to imitate a 16px metadata icon.
- In metadata rows, icon and text should align by optical center, not by raw bounding box.
- In text-first interfaces, icons should support reading flow rather than dominate it.
- If the icon does not add meaning, remove it instead of decorating the label.
- If no icon in the kit accurately represents the concept, use no icon. Do not substitute a semantically unrelated icon merely to occupy an icon slot.
- Avoid pairing long labels with large icons. As label length increases, icon size should stay compact.
- If multiple icon-text rows appear in a stack, keep icon size and icon-to-text gap consistent across the stack.
- Use a 16px asset only when the icon is known to be dense metadata or helper context. Otherwise use the 24px asset for a real action, navigation item, or standalone control, or omit the icon. Do not resolve uncertainty by CSS-scaling a 24px asset.

### Icon-Only Control Rules

Use icon-only controls only when the action is already well established or the surrounding context makes the meaning obvious.

Rules:

- Every icon-only control needs an accessible label.
- Use icon-only buttons for utility actions, compact controls, or known repeated actions, not for ambiguous primary actions.
- Do not use an icon-only control when the same action would be materially clearer with a text label.
- Icon-only controls should use the standard icon size for their context rather than oversized decorative icons.
- Icon-only controls are borderless and transparent at rest by default. The hit area may remain 40–44px, but it should not be rendered as a bordered square.
- Hover, focus, selected, or pressed states may use a restrained background or icon-color change. Add an outer border only when the owning component contract explicitly requires it.
- Close, settings, save, and similar utility controls should not be placed inside a decorative container solely to make the hit area visible.

### SVG Hygiene (new exports only)

When adding a new icon to `Assets/Icons/`, match the existing files:

- Keep `viewBox="0 0 24 24"`; remove fixed `width` / `height` and Figma metadata.
- Stroke-based UI icons use `currentColor`, round caps / joins, and consistent stroke weight.
- Status, brand, logo, and payment icons keep their original fills and must not inherit text color.

### Component Contract

A single local wrapper, keyed by the flat file name:

```tsx
<Icon name="search" size={24} tone="default" decorative />
<Icon name="logo-italki-logomark" size={32} tone="brand" label="italki" />
```

| Prop         | Values                                 | Rule                                                                          |
| ------------ | -------------------------------------- | ----------------------------------------------------------------------------- |
| `name`       | flat file name                         | Required. Maps to `Assets/Icons/{name}.svg` (or `16px/`, `backup/`).          |
| `size`       | 16, 24, 32, 56                         | By context; defaults to 24.                                                   |
| `tone`       | default, muted, inverse, danger, brand | Stroke icons inherit text color; status / brand icons keep their fixed color. |
| `decorative` | true / false                           | True only when the icon repeats adjacent visible text.                        |
| `label`      | string                                 | Required when `decorative=false`.                                             |

Do not mix this kit with unrelated icon sets on the same production surface. If Lucide or another open-source set is used during prototyping, replace it with the kit icon before production review.

## Layout

### Content-First Layout Principle

Content determines a component or composition's occupied space by default. Prefer intrinsic Flex or Grid flow, natural height, wrapping text, and responsive columns such as `auto-fit` / `minmax` over fixed tracks, fixed card heights, or coordinates copied from one reference.

- Let the parent supply available width; let the child reflow within it.
- Use fixed dimensions only when the component contract owns the geometry: an interaction target, icon or avatar size, media ratio, bounded dialog, or an explicitly named density variant.
- A fixed dimension must state its supported content range plus its wrap, scroll, collapse, or overflow recovery behavior.
- A visual sample or documentation frame is not evidence that production content should be cropped or given the same fixed height.

### Control Width Scale

Field-like components use three maximum-width tokens and always contract to their parent on smaller screens:

| Token | Value | Use |
| --- | ---: | --- |
| `--ui-width-control-compact` | 224px | Embedded controls, such as Calendar's Time picker. |
| `--ui-width-control-default` | 336px | Single-value controls: Select, Date picker, and Time picker. |
| `--ui-width-control-wide` | 440px | Text entry, Form field, Search, and choice groups that need longer labels or feedback. |

Do not introduce a one-off control width for a sample. Time picker options are always four equal columns within the picker, including when the compact parent width constrains the picker.

### Spacing System

The system uses a 4px layout grid with a 2px micro-spacing exception for directly related inline content. The complete Foundation scale is:

| Token | Value | Scope |
| --- | ---: | --- |
| `{spacing.0}` | 0px | Base |
| `{spacing.half}` | 2px | Micro |
| `{spacing.1}` | 4px | Compact |
| `{spacing.2}` | 8px | Compact |
| `{spacing.3}` | 12px | Compact |
| `{spacing.4}` | 16px | Default |
| `{spacing.6}` | 24px | Default |
| `{spacing.7}` | 32px | Module |
| `{spacing.8}` | 40px | Module |
| `{spacing.9}` | 48px | Module |
| `{spacing.10}` | 64px | Page |
| `{spacing.11}` | 80px | Page |
| `{spacing.12}` | 96px | Page |

- `{spacing.half}` 2px: a fact and its direct qualifier, such as a title and status cue.
- `{spacing.1}` 4px: icon-text gap and direct inline relationships.
- `{spacing.2}` 8px: label-content gap, compact internal spacing.
- `{spacing.3}` 12px: compact module padding and small-card internals.
- `{spacing.4}` 16px: standard module padding and form group spacing.
- `{spacing.6}` 24px: default panel padding and list rhythm.
- `{spacing.7}` 32px: feature-module padding and section rhythm.
- `{spacing.8}` 40px: prominent module padding.
- `{spacing.9}` 48px: module-to-module rhythm only; not local module padding.
- `{spacing.10}` 64px, `{spacing.11}` 80px, and `{spacing.12}` 96px: page-level region spacing only.

### Semantic Spacing Roles

Primitive tokens are the source values. Reusable components may name the appropriate primitive in their contract; page or pattern compositions should use the semantic role below instead of selecting raw pixels by taste. These roles do not create another scale or add new values.

| Semantic role | Primitive | Default use |
| --- | ---: | --- |
| `spacing.inline` | 4px | Icon + label, direct qualifier, paired inline facts |
| `spacing.compact` | 8px | Closely related facts and compact controls |
| `spacing.group` | 12px | A bounded reading group or compact module |
| `spacing.stack` | 16px | Ordinary local vertical or horizontal flow |
| `spacing.section` | 24px | Transition to the next local question or section |
| `spacing.module` | 32px | Feature-level separation or roomy composition |
| `spacing.page` | 64px | Major page-region separation |

Use a semantic role for a repeated composition relationship, then map it to the primitive token in the implementation. A component-specific alias may exist only when it prevents repeated decisions and remains mapped to one Foundation token, such as `card.padding → spacing.stack` or `button-group.gap → spacing.compact`.

### Semantic Spacing And Content Sizing

The 4px grid is a scale, not an instruction to distribute every visible item with the same gap. Spacing must communicate the relationship between information, not make a surface look mechanically even.

Use these relationship bands as a starting point, then validate them against content and task density:

- **Tight (0–4px):** one fact and its direct qualifier, such as a name and verification cue, a primary statement and its supporting phrase, or icon-text inside one compact control.
- **Grouped (8px):** distinct facts within one reading stage, such as identity context, language capability, or a small trust cluster.
- **Stage transition (12–16px):** a shift to a different user question or decision stage, such as identity → capability, fit evidence → booking decision, or form field group → action area.
- **Section rhythm (24px+):** a new local section, list item, or page-level region.

These are relationship bands, not mandatory component anatomy. A parent may use a different documented spacing when the current task, component variant, or reference requires it. Do not add empty space merely to reach a band value.

Rules:

- preserve tight relationships between primary information and its direct support; do not separate them with unrelated metadata, a decorative divider, or a generic equal gap
- use larger space only when the reader is moving to a different question, fact group, or action decision
- if a compact surface cannot contain all information while preserving meaningful groups, first reflow, omit optional information, or use a documented collapse rule; do not flatten all gaps into one density
- a component's height is content-driven by default. The parent controls available width and placement; the child must not acquire a fixed width or height merely because one reference instance used it
- fixed geometry is allowed only in a named variant with an explicit task reason, supported content range, overflow or collapse behavior, and responsive boundary
- a measurement observed in one Figma node, screenshot, or demo is calibration evidence, not a component constraint. Promote it only after it is documented as a reusable variant or acceptance requirement
- text wrapping is the default behavior. Truncation, line clamp, fixed height, or hidden overflow require an owning component contract and a meaningful recovery or priority rule
- keep sample-frame limits, preview dimensions, and page-container widths outside the component contract unless the component itself owns that geometry

### Property And Responsive Rules

- Use **padding** for the internal breathing room of one owned surface.
- Use **Grid or Flex `gap`** for spacing between siblings in one responsive layout. This preserves the relationship when items wrap, reorder, or change count.
- Use **margin** only for an external structural relationship between independent blocks, or when a parent cannot own the layout. Do not add arbitrary margins to every child in a repeated stack.
- Use `auto`, `minmax`, intrinsic sizing, and wrapping for fluid remainder space; percentage or fractional tracks may divide a page layout but are not spacing tokens.
- Spacing tokens are stable across breakpoints. A parent composition may intentionally step one or two documented tokens down at a responsive boundary or compact density; it must preserve the relative hierarchy between inline, group, section, and page spacing.
- Optical adjustment is permitted only with an existing token, normally the 2px or 4px micro step for directly related inline content. It must not create a new one-off spacing value.

### Module Padding And Margin Scale

For page sections, cards, panels, documentation modules, and other layout surfaces, use only these padding and structural-margin values: **8px, 12px, 16px, 24px, 32px, and 40px**. Use 8px padding only for small modules. Do not introduce 20px or 28px layout padding or margins. Margin may use **2px, 4px, or 8px** only for directly related inline facts and compact local relationships.

| Module Scale | Padding And Local Margin | Typical Use |
| ------------ | -----------------------: | ----------- |
| Small | 8px | Small modules and compact utility surfaces |
| Compact | 12px | Dense metadata clusters and small local groups |
| Standard | 16px | Card headers, form groups, ordinary local sections |
| Content | 24px | Default card and panel content |
| Feature | 32px | Complex feature modules and roomy content regions |
| Prominent | 40px | Large focal panels and deliberate campaign-like exceptions |

Rules:

- Use 2px and 4px only for micro gaps, icon-text pairing, and direct text relationships; they are not module padding or structural margin values. Use 8px padding only for the documented Small module scale.
- Select the module scale from content density and visual weight, then use the same value for comparable sibling modules.
- A card header normally uses 16px while its content uses 24px; a compact card may use 12px throughout.
- Page-region spacing may use 48px or 64px only when separating whole sections, never as local module padding.
- A component with an explicit padding contract, such as Button, Chip, Input, or Avatar, follows that contract before this module scale.
- Do not use padding to create a larger-looking component when hierarchy, spacing, or surface treatment can solve the problem.

### Radius Scale

The DS3.0 radius tokens are values, not permission to choose a shape freely. Resolve radius in this exact order and stop at the first matching source:

1. exact approved Figma or screenshot reference
2. owning component contract or named component variant
3. documented component family default in this file
4. height-based foundation rule for a genuinely new uncontracted component

Do not apply a foundation value over a component contract merely because its height appears to match a different row.

| Token         |  Value | Use                                                                                                                                          |
| ------------- | -----: | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `Radius/XS`   |    4px | Explicit component reference or compact square-corner detail, including the named Panel contract; not a generic short-tag default             |
| `Radius/MD`   |    8px | **Default workflow buttons**, inputs                                                                                                         |
| `Radius/LG`   |   12px | **Cards and Dialogs** — teacher, booking, filter, review, 520px and 744px Dialogs                                                          |
| `Radius/XL`   |   16px | Large drawers, sheets, and uncontracted surfaces                                                                                             |
| `Radius/2XL`  |   24px | Prominent uncontracted containers                                                                                                           |
| `Radius/Full` | 9999px | Default for uncontracted interactive, status, and metadata components shorter than 36px; also used by explicitly pill-shaped taller controls |

### Height-Based Radius Rules

Use this table only after the radius resolution order above confirms that the object has no reference, component contract, or named component-family default. Component height is then the first constraint and component role is the second constraint. Do not choose radii freely by taste.

| Component Height |       Default Radius | Typical Use                                                                                      |
| ---------------- | -------------------: | ------------------------------------------------------------------------------------------------ |
| < 36px           | `Radius/Full` 9999px | Tiny indicators, badges, status labels, compact actions, small icon controls, and short metadata |
| 36–72px          |     `Radius/LG` 12px | Standard controls, cards, booking rows, and actionable blocks                                    |
| 72–120px         |     `Radius/XL` 16px | Large uncontracted panels, large cards, and oversized containers                                  |
| 120px+           |   `Radius/2XL` 24px | Prominent uncontracted containers                                                                   |

Rules:

- If a component already has an explicitly defined radius in its own component spec, use the component-specific radius rule first. Do not override it with the generic height-based foundation rule.
- Apply the `< 36px` full-radius rule only when the component has no explicit radius contract. Do not override a documented component radius with this foundation default.
- Image crops, avatars, logo assets, and components with an independently documented visual shape retain their own explicit geometry.
- For components 36px and taller, use the height-based foundation rule unless a component contract defines a more specific radius behavior.
- `Radius/2XL` 24px is the foundation fallback for uncontracted surfaces 120px and taller. Do not use it to override the named Dialog contract.
- A 36px-or-taller component may use `Radius/Full` only when its named component variant is intentionally pill-shaped. Do not use it just because the component is compact.
- Do not use a smaller radius on an uncontracted component below 36px. Above that threshold, do not increase radius merely to imitate a softer corner.

### Corner Smoothing

Use iOS-style continuous corner smoothing for rounded components whenever the design or implementation environment supports it.

Rules:

- This rule applies to the **shape of the corner**, not the radius value itself.
- Follow the radius values in this document; do not increase radius size just to imitate a softer corner.
- Use the same continuous-corner behavior across buttons, inputs, cards, panels, and sheets to keep the system consistent.
- Pills and full-radius capsules may still use continuous smoothing, but they should not introduce a different corner language from the rest of the system.
- If an implementation environment does not support continuous corner smoothing directly, keep the documented radius values and avoid compensating with oversized geometric radii.

### Optical Roundness For Nested Surfaces

When nesting rounded objects, do not reuse the same corner radius for both the outer and inner object. Equal radii on nested surfaces often look optically unbalanced.

Use a stepped token relationship instead: when the inner object is visibly framed by the outer surface, choose a smaller approved radius token for the inner object. Do not calculate or introduce an arbitrary intermediate radius.

Example: a card with `Radius/XL` 16px uses `Radius/LG` 12px for its nested image crop; an avatar inside that content remains `Radius/Full`.

Rules:

- Apply this rule when a rounded object sits inside another rounded object and the inner object is visually framed by the outer one.
- Step down to a smaller approved token when the outer and inner corners are visually coupled. A nested image crop in a 16px card therefore uses 12px, not 16px.
- If a component has an explicitly defined radius rule, retain that rule unless it visibly conflicts with its framed nesting relationship.
- If a component already has its own radius rule, follow the component rule first and only use optical roundness when the nested relationship would otherwise look visibly inconsistent.
- Prefer optical balance over mechanically reusing the same token on both layers.

### Grid & Container

Use one responsive page grid across product pages and Catalog composition. A component can own local arrangement, but it must not introduce an unrelated page-level column count, gutter, or outer width.

| Viewport | Columns | Gutter | Page inset | Container rule |
| --- | ---: | ---: | ---: | --- |
| Desktop (≥1128px) | 12 | 24px | flexible outer gutter | Center content; cap it at 1240px. |
| Tablet (744–1127px) | 8 | 24px | 32px | Reflow desktop spans; preserve the task order. |
| Mobile (<744px) | 4 | 16px | 16px | Stack primary content before secondary rails and controls. |

The corresponding tokens are `--ui-layout-content-max-width`, `--ui-layout-grid-columns-*`, and `--ui-layout-grid-gutter-*`.

### Grid Span Rules

- Use **12** columns for one continuous task surface: Calendar, Table, long state collection, full-width alert/banner, or a section that cannot be meaningfully split.
- Use **8 + 4** for a main task with a secondary booking, summary, or action rail; the 8-column region always comes first in reading order.
- Use **6 + 6** for two peer examples or sibling modules. Variants and States are peers by default, so neither becomes full width merely because it has more examples.
- Use **4 + 4 + 4** only for three compact, comparable cards; use **3 + 3 + 3 + 3** only for small repeated metrics or tokens.
- At Tablet, recompose the same content over 8 columns; at Mobile, use the four-column grid and stack whenever a comparison is no longer legible.
- Do not make a block full-width only to accommodate a sample. Keep the component’s own maximum width inside its assigned span, or use an explicitly documented full-width task surface.

### Container Width Rules

Choose container width by reading behavior and task density, not by the amount of available screen space.

Rules:

- Keep the main content area centered and capped. Do not stretch the page to fill wide screens just because space is available.
- Use narrower readable widths for text-heavy surfaces and wider widths for evaluation, lists, or multi-column task layouts.
- If a layout includes a sticky side panel, protect the readability of the main content column instead of letting both columns expand freely.
- Extra wide screens should add gutter space before they add line length.
- If AI is unsure whether to widen a container, prefer keeping the container narrower.

### Readable Line-Length Rules

Text blocks should stay readable and scannable. Do not let paragraphs or intros become overly wide.

Rules:

- Hero headlines should stay compact enough to feel intentional and should not stretch across overly long lines.
- Section intros, supportive copy, and explanatory text should use a narrower readable width than full content containers.
- Long-form body text should not span the full width of a wide page container.
- Dense metadata rows may extend wider than paragraph copy, but explanatory text should stay more constrained.
- If a line of text becomes visually hard to scan, reduce the text container width before changing the type scale.
- If AI is unsure whether a text block is too wide, assume it is too wide on large screens and constrain it.

### Container Type Defaults

Use these defaults unless a page recipe or component spec defines a more specific structure.

| Container Type               | Width Behavior                                | Typical Use                                                          |
| ---------------------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| Full page content shell      | Max-width capped and centered                 | Main product pages                                                   |
| Text-heavy intro block       | Narrower than full content shell              | Hero copy, section intro, explanatory lead text                      |
| Evaluation or selection area | Wider structured content region               | Teacher lists, filters plus results, multi-column selection surfaces |
| Sticky side-panel layout     | Readable main column + constrained side panel | Teacher detail with booking panel                                    |
| Single-column reading block  | Narrow readable width                         | Summary text, longer explanations, policies, review excerpts         |

Rules:

- Do not use the widest available container for every section on a page.
- Let content type determine width:
  - reading content should be narrower
  - structured data and cards may be wider
  - action panels should stay controlled
- If two adjacent regions have different purposes, they do not need to share the same reading width.

### Whitespace Philosophy

The rhythm should sit between consumer marketplace and learning tool: more open than an admin dashboard, more task-oriented than an editorial landing page. Hero areas can breathe, but teacher lists must remain dense enough for evaluation and selection.

## Shadow

The system is mostly flat. Shadow communicates spatial separation, not selection, priority, focus, or generic hover. Choose a structural boundary first; add a documented Shadow token only when a surface must visually sit above another surface.

### Elevation Levels

| Token | Value | Reserved use |
| --- | --- | --- |
| `Shadow/MD` | `0 2px 4px #001A5608, 0 4px 8px #00174E0A` | Quiet raised control or persistent surface: White Button, Panel, and Tooltip. |
| `Shadow/LG` | `0 4px 8px #00174F08, 0 12px 24px #0019530E` | Temporary anchored surface: Menu, Select list, Picker, Popup, Popconfirm, Toast, and local context menu. |
| `Shadow/XL` | `0 8px 16px #00195309, 0 24px 48px #00195312` | Blocking Modal and Drawer task surface above a Scrim. |

### Card Tokens

| Token | Value | Reserved use |
| --- | --- | --- |
| `Shadow/Card` | `0 0 0 #0F172A00` | Resting unoutlined Card; intentionally no visible lift. |
| `Shadow/Stroke card` | `0 0 0 1px #E9EBF3` | Static outlined Card boundary. |
| `Shadow/Card-Hover` | `0 1px 2px #0F172A00, 0 4px 12px #0F172A0A` | Hover or focus on one whole interactive Card root. |

`Slider` thumb and `Switch` thumb retain component-owned micro shadows. They are not a general elevation token and must not be used by a product surface.

- **Flat:** Page background, navigation, regular content areas, inputs, badges, chips, tags, list rows, and resting cards.
- **Static Bordered Cards:** White cards with a visible `Shadow/Stroke card` boundary are static containers. They are not clickable as a whole.
- **Clickable Cards:** Whole-card click targets use `Shadow/Card` at rest, then use `Shadow/Card-Hover` without obvious movement.
- **Internal Module Hover:** Avoid card-in-card patterns. If an internal module must behave as a distinct clickable option, use `Foreground/Divider` (#F5F6F9) at rest and deepen to `Background/Hover` (#EBEDF1) on hover. Do not use white-on-white nesting or a hover shadow.
- **Scrim:** Modals and mobile filter sheets use `Special/Mask` at 40–60% opacity depending on readability.

Do not use heavy shadows, glassmorphism, glossy highlights, or multiple shadow layers. Outside White Button, interactive Card, and invoked-surface contracts, hover feedback must use color, border, or text-color changes only.

### Elevation Matrix

Use this matrix before introducing any shadow or lifted surface treatment.

| Surface Type               | Resting State            | Hover / Focus State         | Shadow Allowed        |
| -------------------------- | ------------------------ | --------------------------- | --------------------- |
| Button                     | Flat                     | Color or border change only | No                    |
| Badge / Chip / Tag         | Flat                     | Color or border change only | No                    |
| Input / Select             | Flat                     | Border or fill change only  | No                    |
| Static Card                | `Shadow/Card` or `Shadow/Stroke card` | Usually unchanged | Card tokens only |
| Interactive Card           | `Shadow/Card`            | `Shadow/Card-Hover`         | Card tokens only |
| Anchored surface           | `Shadow/LG`              | Usually unchanged           | Yes                   |
| Modal or Drawer            | `Shadow/XL` + Scrim      | Usually unchanged           | Yes                   |
| Internal Neutral Block     | Flat                     | Fill deepening only         | No                    |

Rules:

- If a surface type is not listed, default to flat treatment unless it clearly behaves as a floating module.
- Do not use shadow as a general emphasis shortcut.
- Prefer fill, border, or text-color changes before adding elevation.
- Hover lift should stay subtle and should never feel bouncy or glossy.

## Accessibility And Motion

### Accessibility Baseline

Accessibility is part of the visual contract, not a later implementation pass. A visual treatment is incomplete when the state, hierarchy, or relationship can be understood only through color, pointer hover, or a precise layout position.

- Text, icons, borders, and focus indicators must retain sufficient distinction from their immediate surface for their intended role. Do not reduce contrast to make a quiet surface look more minimal.
- Meaningful status, selection, requiredness, error, availability, and progress must use readable text, an icon or shape, or a programmatic state in addition to color.
- A visible label remains the default for inputs, choices, and unfamiliar actions. Placeholder text, hover-only help, and color changes are not label substitutes.
- Keyboard focus must be clearly visible on every interactive object and must not rely only on a subtle shadow, color change, or browser-default style that disappears against the current surface.
- An available click, tap, or selection root uses a pointer cursor; disabled and loading roots retain their documented unavailable or waiting cursor. Do not apply a pointer cursor to passive display regions merely because they contain an interactive descendant.
- Icon-only controls require an accessible name and an interaction state that remains understandable without hover. Decorative icons and artwork must not create duplicate accessible content.
- Do not use visual order to imply an association that is absent in the content structure. Keep labels, values, helper text, validation, and local actions visibly and structurally connected.
- Preserve readable text at larger text settings and narrower widths. Reflow, wrap, or use the component's documented continuation behavior before clipping required information or shrinking text below its intended tier.

Semantic markup, keyboard behavior, focus management, and live announcements are defined in `EXECUTION.md`.

### Motion And Reduced Motion

Motion may clarify a state change, spatial relationship, or successful task transition. It must not be required to discover an action, read a value, understand a result, or recover from an error.

- Default motion should be short, restrained, and interruptible. Do not delay a primary action, navigation, validation result, or recovery path for an animation.
- Animate opacity, color, or a small surface change when feedback is useful. Do not use bounce, parallax, continuous movement, or large layout shifts as ordinary interaction feedback.
- A component must have a complete reduced-motion presentation. Under reduced motion, replace movement with an immediate state change or a subtle non-spatial transition while preserving the same information and action result.
- Celebration and reward motion are limited to meaningful learning or progression outcomes. They must not obscure controls, trap attention, auto-repeat, or create continuous ambient distraction.
- Loading indicators may communicate that work is in progress, but must not imply false progress, conceal a blocked state, or replace a readable status message when delay materially affects the task.

## Content Style

Product copy should sound like a clear, reliable learning assistant: short, specific, and decision-oriented. It helps a learner judge teacher fit and complete a booking; it does not use generic marketing praise, feature narration, or decorative labels.

- CTA labels begin with a direct verb and identify the next action: `Search teachers`, `View profile`, `Book trial`, or `Continue booking`.
- Teacher metadata communicates comparison facts, not vague promotion: language support, learning goal, availability, level fit, rating, review count, lesson count, or response time.
- Teacher descriptions state method, audience fit, and feedback style. Avoid unsupported superlatives such as “the best teacher” or generic claims of quality.
- Prices always remain adjacent to their duration and lesson context, for example `$18 / 25 min trial`; do not render a price as an isolated decorative number.
- Status, recovery, and payment copy states what happened, what it affects, and the supplied next action. Do not hide meaningful recovery behind an ambiguous `OK` label.
- Labels, tags, and helper text must remain readable under localization. Prefer clear words over abbreviations that depend on a specific language or market.

## Components

### Component Layering

The system is intentionally composable. A component may be used alone when its own contract permits it, or it may become a named part of a larger component. Do not treat the following layers as a fixed hierarchy for every page.

| Layer            | Visual Responsibility                                                          | Typical Scope                                                       |
| ---------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Foundation       | Supplies tokens and visual constraints; it is not a visible product component. | Color, type, spacing, radius, border, icon asset, elevation.        |
| Visual primitive | Owns one stable visual and semantic unit.                                      | Button, icon-text pair, label, input, choice control, status marker. |
| Composite        | Establishes a reusable relationship between reusable primitives.                | Field group, label-control pair, metric group, compact action group. |

The layers define ownership and compatibility, not a mandatory runtime tree. A documented primitive may stand alone or enter any parent that explicitly accepts it; a composite may also stand alone or participate in a larger assembly when its own contract permits it.

Rules:

- A primitive may stand alone only when its own contract defines an independent task or information role.
- A composite must name the relationship it preserves. It is not a decorative wrapper around nearby elements.
- Plain text, copy, or one-off layout should remain a named slot inside its parent. Do not turn a display name, a single gap value, or an incidental wrapper into a component unless it owns stable behavior, accessibility, or visual treatment across contexts.
- A parent may place a child in a documented variant or slot, but it must not silently override the child's type, icon, radius, border, or state contract.
- Component demonstrations and product patterns must compose the documented Button, Chip, Tag, and other applicable primitives instead of recreating visual lookalikes with local CSS. A locally scoped control remains bespoke only when it is part of its owning component's documented interaction anatomy, such as a Select clear action or Date Picker month navigation.
- Do not promote a one-off layout wrapper or a single copy variation into a component. Promote only stable visual or semantic relationships.

Generic component anatomy and slot compatibility live here. Product-object composition belongs in `PATTERNS.md`; page order, responsive placement, and task-specific interaction application belong in `EXECUTION.md`.

<!-- PANDA_IMPLEMENTATION_SUMMARY:START -->

### Panda Implementation Summary

> Generated by `maintenance/scripts/generate-component-api.mjs`. Do not edit inside this block.

This is the production-code entry point for the components mapped so far. Use the complete prop-level table in `docs/reference/PANDA_API.md` before implementation. `direct` props may pass through the approved wrapper; `adapter` props require the named product composition; `gap` props must be reported; `catalog-only` props never enter production code.

| Catalog component | Panda target | Direct Panda mapping | Requires adapter or has a gap | Catalog-only |
| --- | --- | --- | --- | --- |
| **`button`** | `Button` via `@repo/components/ui` | `label` -> `children`; `leadingIcon` -> `icon`; `disabled` -> `disabled`; `loading` -> `loading`; `ariaLabel` -> `aria-label`; `href` -> `href`; `download` -> `download`; `target` -> `target`; `rel` -> `rel`; `ariaExpanded` -> `aria-expanded`; `ariaPressed` -> `aria-pressed`; `ariaDescribedBy` -> `aria-describedby`; `ariaControls` -> `aria-controls` | `variant` (adapter); `size` (adapter); `shape` (adapter); `trailingIcon` (adapter); `iconOnly` (adapter) | `state`; `demo` |
| **`checkbox`** | `Checkbox` via `@repo/components/ui` | `id` -> `id`; `label` -> `children`; `checked` -> `checked`; `disabled` -> `disabled` | `toggleMode` (adapter) | `state`; `demo` |
| **`checkbox-group`** | `Checkbox.Group` via `@repo/components/ui` | `options` -> `options`; `selected` -> `value` | `id` (adapter); `label` (adapter); `description` (adapter); `layout` (adapter); `selectAll` (adapter); `feedback` (adapter); `feedbackTone` (adapter) | None |
| **`radio`** | `Radio / Radio.Group` via `@repo/components/ui` | `label` -> `children`; `value` -> `value`; `checked` -> `checked`; `disabled` -> `disabled`; `tabIndex` -> `tabIndex` | `description` (adapter) | `state`; `demo` |
| **`modal`** | `Modal` via `@repo/components/ui` | `title` -> `title`; `body` -> `children`; `footer` -> `footer`; `open` -> `open`; `closable` -> `closable`; `maskClosable` -> `maskClosable`; `keyboardClosable` -> `keyboard` | `id` (adapter); `trigger` (adapter); `triggerLabel` (adapter); `size` (adapter); `titleAlign` (adapter) | `stage`; `demo` |
| **`search`** | `Input.Search` via `@repo/components/ui` | `id` -> `id`; `value` -> `value`; `placeholder` -> `placeholder`; `clearable` -> `allowClear`; `disabled` -> `disabled` | `size` (adapter); `shape` (gap) | `state` |
| **`select`** | `Select` via `@repo/components/ui` | `id` -> `id`; `placeholder` -> `placeholder`; `options` -> `options`; `selected` -> `value`; `status` -> `status`; `clearable` -> `allowClear`; `searchable` -> `showSearch`; `disabled` -> `disabled`; `loading` -> `loading`; `open` -> `open` | `label` (adapter); `groups` (adapter); `mode` (adapter); `size` (adapter); `shape` (gap); `query` (adapter) | `state` |
| **`drawer`** | `Drawer` via `@repo/components/ui` | `title` -> `title`; `body` -> `children`; `footer` -> `footer`; `open` -> `open`; `placement` -> `placement`; `closable` -> `closable`; `maskClosable` -> `maskClosable`; `keyboardClosable` -> `keyboard` | `id` (adapter); `trigger` (adapter); `triggerLabel` (adapter); `size` (adapter) | `demo` |
| **`form-field`** | `Form.Item` via `@repo/components/ui` | `id` -> `id`; `label` -> `label`; `control` -> `children`; `helper` -> `help`; `status` -> `validateStatus`; `required` -> `required` | `error` (adapter); `size` (adapter); `shape` (gap); `disabled` (adapter) | `state` |
| **`text-input`** | `Input` via `@repo/components/ui` | `id` -> `id`; `value` -> `value`; `placeholder` -> `placeholder`; `status` -> `status`; `disabled` -> `disabled`; `readOnly` -> `readOnly`; `leadingIcon` -> `prefix`; `trailingIcon` -> `suffix`; `ariaLabel` -> `aria-label` | `size` (adapter); `shape` (gap); `trailingAction` (adapter) | `state`; `demo` |
| **`textarea`** | `Input.TextArea` via `@repo/components/ui` | `id` -> `id`; `value` -> `value`; `placeholder` -> `placeholder`; `rows` -> `rows`; `maxLength` -> `maxLength`; `showCount` -> `showCount`; `status` -> `status`; `disabled` -> `disabled`; `readOnly` -> `readOnly`; `ariaLabel` -> `aria-label` | `size` (adapter) | `state`; `demo` |
| **`toast`** | `message` via `@repo/components/ui` | `id` -> `key`; `tone` -> `type`; `duration` -> `duration` | `title` (adapter); `description` (adapter); `action` (adapter); `closable` (gap); `open` (adapter); `ariaLabel` (gap) | None |
| **`notification`** | `notification` via `@repo/components/ui` | `id` -> `key`; `tone` -> `type`; `title` -> `message`; `description` -> `description`; `action` -> `btn`; `closable` -> `closeIcon` | `open` (adapter); `ariaLabel` (adapter) | None |

API mapping is pending for: `chip`, `tag`, `selection`, `date-picker`, `tooltip`, `popup`, `popconfirm`, `divider`, `avatar`, `badge`, `breadcrumb`, `card`, `alert`, `tabs`, `pagination`, `rate`, `sidebar`, `statistic`, `table`, `timeline`, `top-nav`, `slider`, `panel`, `switch`, `number-stepper`, `combobox`, `upload`, `stepper`, `progress`, `result`, `skeleton`, `dropdown-menu`, `disclosure`, `segmented-control`, `time-slot`, `time-picker`, `calendar`, `popover`, `footer`.

<!-- PANDA_IMPLEMENTATION_SUMMARY:END -->

### Variant And Slot Model

Complex components must be defined as one stable semantic shell with explicit variant axes and named content slots. Do not split the same interaction into visually similar but unrelated components merely because it has a compact form, a rich-content form, or a different leading visual.

- Keep behavioral axes independent: for example, selected state, size, interaction state, content presentation, and breakpoint adaptation are separate decisions.
- Keep product content in slots: title, supporting text, leading visual, metadata, price, badge, and action or selection indicator. A component must not infer these values or bake a product object into its structure.
- A selected state must preserve the same outer bounds as the unselected state. Use inset treatment or border-box sizing so selection never shifts adjacent content.
- Document the complete state model: default, hover, focus-visible, selected, disabled, and their meaningful combinations. Focus is not a hover treatment and must remain visible for keyboard users.
- Use semantic size names when content determines height. `sm` and `md` may change type scale, control size, gap, and padding together; do not pretend every content-rich surface has one fixed pixel height.
- Model responsive composition at the component level when its slots rearrange. For example, a card may move a badge above pricing on mobile without becoming a separate mobile component.

This is the default authoring model for Selection and for other composite controls, cards, navigation rows, and information surfaces added to the system.

### Light And Dark Semantic Mapping

The semantic token name is the contract. A theme boundary supplies `mode: "light" | "dark"` and resolves the matching value once; a component consumes the named semantic role rather than inspecting theme, route, account, or browser state. The Light column is the value used by the color descriptions above.

| Token | Light | Dark |
| --- | --- | --- |
| Primary/Shade-0 | #D3382F | #D3382F |
| Primary/Main | #FF4338 | #D3382F |
| Primary/Shade-1 | #FF8E87 | #CC352C |
| Primary/Surface | #FFF1F1 | #8F2620 |
| Background/Card | #FFFFFF | #313140 |
| Background/Page | #F5F6F9 | #1A1A26 |
| Background/Hover | #EBEDF1 | #3C3C4F |
| Foreground/Divider | #F5F6F9 | #313140 |
| Foreground/Border | #E5E8ED | #3C3C4F |
| Foreground/Disabled-text | #C7CBD3 | #515164 |
| Foreground/Placeholder-text | #9C9CAC | #767687 |
| Foreground/Secondary-text | #767687 | #9C9CAC |
| Foreground/Primary-text | #515164 | #E5E8ED |
| Foreground/Title | #313140 | #FFFFFF |
| Foreground/On-Primary | #FFFFFF | #FFFFFF |
| Status/Available | #98D45F | #77B23F |
| Status/Available-surface | #F4FBEA | #2F471B |
| Status/Error | #D3382F | #CC352C |
| Status/Error-surface | #FFF1F1 | #8F2620 |
| Status/Info | #00B3BD | #009897 |
| Status/Info-surface | #EDFAFA | #00504F |
| Status/Success | #0DE298 | #00B377 |
| Status/Success-surface | #ECFFF9 | #003F2B |
| Status/Warning | #FFC400 | #E5AC00 |
| Status/Warning-surface | #FFF9E6 | #3D2E00 |
| Special/Always-Dark | #000000 | #000000 |
| Special/Always-White | #FFFFFF | #FFFFFF |
| Special/Mask | #00000099 | #000000CC |
| Special/Text-Link | #59779A | #59779A |

`Gradient/Pro` is the `plus-button` resting paint style, not a regular color token: `linear-gradient(88deg, #FF4438 9.48%, #1C07FF 99.43%)`. It is reserved for approved italki Plus surfaces and must not introduce another promotional gradient palette. Its blue endpoint belongs only to this gradient, not to the reusable color-token set. Its motion track repeats the same two stops once so the resting crop is the complete red-to-blue gradient and the hover crop is the complete blue-to-red gradient. It shifts from the left crop to the right crop so the visible color movement travels right; it must not add a shine layer, another color, or a different visual direction.

### General Primitives

**`divider`** — Headless structural separator for related content regions. It receives `type` (`horizontal` or `vertical`, default `horizontal`), optional horizontal `label`, optional `icon` from the registered icon library, `orientation` (`left`, `center`, or `right`, default `center`), optional `orientationMargin` (a non-negative number, `px`, or `%`; only for left/right labels), `dashed`, `plain`, one supplied semantic `tone` (`divider` or `border`), and optional `ariaLabel`. It renders a 1px `Foreground/Divider` rule (#F5F6F9); a dashed prop changes only the rule stroke, never its thickness or token. A labelled horizontal rule uses `Foreground/Secondary-text` at `14px / 600 / 20px`; `plain` changes only the label to quiet regular treatment at `14px / 500 / 20px`. Left and right labels use a 5% edge rule by default; `orientationMargin` replaces that edge rule and may deliberately be `0` or a value such as `50px`. Vertical Dividers do not render label or icon and use a fixed 20px inline rule with 8px inline gutters, matching the default text line height so the 1px divider remains perceptible. Its width follows the containing content column; it must not stretch beyond the content it separates. The parent owns external spacing and content layout. Divider does not group content, determine spacing, infer hierarchy, fetch data, or replace a section heading. Show it in content context, with related content on either side of the rule, rather than as a floating line. Use it only when whitespace and typography do not adequately establish a boundary; do not use it as decorative chrome.

**`avatar`** — Headless person-identity primitive based on DS3.0 Avatar. Call `avatar({ name, image, initials, size, flag, flagLabel, variant, tone, interactive, state, ariaLabel })`. It receives an accessible name, one size, supplied image or initials fallback, and optional country code; it does not fetch, upload, crop, infer, localize, verify, or mutate identity data. Its visual variants are `without-flag`, `with-flag`, `empty`, and `logo`; image versus initials is supplied content, not a separate visual hierarchy. The circular image supports `24px`, `32px`, `40px`, `48px`, `56px`, `64px`, `80px`, and `120px`. `empty` receives no image and requires supplied user initials; its `tone` is one of `primary`, `info` (default), `success`, or `warning`, each using the matching registered token with white bold type. `logo` receives neither image, initials, nor flag and renders only the approved `logo-italki-logomark-white.svg` on `Primary/Main`; it has the accessible name `italki` unless one is supplied. On hover, the avatar body receives a 1px `Foreground/Border` outer outline; it must not alter the avatar's box size or crop its image. `with-flag` requires one country code and overlays `flag` at the bottom-right: use `16px` for Avatar sizes from `24px` through `56px`, and `24px` for Avatar sizes from `64px` through `120px`; `without-flag` omits it. Every visible flag has a 1px `Foreground/Border` outer boundary; it does not use a white separation ring. The flag supports recognition but does not replace a readable country or language label in product content.

**`flag`** — Country marker subcomponent. Call `flag({ countryCode, countryLabel, size, decorative, ariaLabel })` with one approved ISO 3166-1 alpha-2 code from the bundled Flags library (252 unique country and territory entries). It resolves locally as `Assets/Flags/{countryCode}.svg`; do not substitute an emoji, draw a flag, or fetch an external asset at runtime. It permits `16px` or `24px`; use `decorative` only when the containing Avatar or adjacent content already provides the country context. Place the unmodified source asset inside the documented circular frame with a 1px `Foreground/Border` outer boundary; never use a white separation ring.

**`avatar-group`** — DS3.0 composite for a supplied ordered person collection. Call `avatarGroup({ members, overflow, addLabel, size, ariaLabel })`; each member is an Avatar prop object. It receives ordered members, optional overflow count, optional add-member accessible label, and one size: `xs` (`24px`), `sm` (`32px`), or `md` (`40px`). It supports image groups and empty groups: an empty group simply supplies members with `variant: "empty"`, their initials, and an approved tone; an italki Logo avatar can appear as a member through `variant: "logo"`. Adjacent avatars overlap by `4px`, `8px`, or `12px` respectively and each retains a 1px `Foreground/Border` outer boundary without a white separation ring; `+N` uses `Gray/100` with `Gray/500` text, while the add action is a matching-size white dashed `Gray/300` circle. It does not sort people, infer a count, fetch identities, or own member-management behavior.

**`person-identity` composition rule** — Generic relationship between one supplied person cue (`avatar` or a documented initials fallback) and a readable supplied name. An optional secondary line may describe a generic role, account context, or local status. Keep the cue and name together in reading order; the parent owns identity data, overflow policy, destination, and any product-specific meaning. This is a generic composition rule, not a separate executable UI-kit component yet. Teacher role, language, trust, and teaching-fit information are product-specific additions owned by `teacher-identity` in `PATTERNS.md`.

### Buttons

#### When To Use

A button means an operation (or a series of operations). Clicking a button triggers its corresponding business logic.

- **Red button:** use for the highest-priority submit, confirm, booking, or conversion action; no more than one in a page or task step.
- **Primary button:** use for the main action; no more than one primary button in one section.
- **Default button:** use for a series of actions without priority.
- **Ghost button:** commonly use for adding more actions; on complex backgrounds, especially home pages, it may provide a lower-contrast action boundary.
- **White button:** use on a colored background.
- **Text button:** use for the most secondary action.
- **Link button:** use for external links.
- **Plus button:** use for italki Plus related features.
- **Danger:** use for risky actions such as deletion or authorization.
- **Disabled:** use when an action is unavailable.
- **Loading:** adds a spinner to the button and prevents multiple submits.

**`button-emphasis`** — `Gray/600` (#515164) fill, white text, supplied `shape`, 40px default height, horizontal padding 16px, font 14px / 600 / 20px. This is the standard main action within a local workflow or supporting step. Do not use it to compete with a page's singular final submit or confirm CTA.

**`button-emphasis-hover`** — `Foreground/Title` (#313140, alias `Gray/800`) fill for hover, focused, and pressed states. Default, hover, pressed, and focus Emphasis copy remains `Special/Always-White`; only disabled or loading states may use muted text. Focus reuses the available state color change and has no external focus outline. Do not add shadow or bounce.

**`button-emphasis-disabled`** — use `Foreground/Divider` (#F5F6F9) fill with `Foreground/Disabled-text` (#C7CBD3). Filled disabled buttons share this neutral treatment so unavailable hierarchy does not imply an active CTA; Text and Link remain transparent with disabled text. Provide a reason when the unavailable state is not obvious.

**`button-red-cta`** — `Primary/Main` red fill, white text, and the current selected button shape. Default, hover, pressed, and focus copy remains `Special/Always-White`; only disabled or loading states may use muted text. This is the highest-priority page or task CTA. Use it when the screen has one singular submit, confirm, booking, or conversion action; a page or bounded task step must expose no more than one Red CTA. When the only available action is submission or confirmation, that action uses Red CTA. Behavioral usage and screen-level CTA hierarchy rules live in `EXECUTION.md`.

**`button-secondary`** — `Gray/50` (#F5F6F9) fill, `Gray/700` or title text, no visible border, and supplied `shape`. Its available hover state uses `Background/Hover` (#EBEDF1); disabled Secondary retains its muted disabled surface with no hover treatment. Use for return paths, filters, cancel actions, and secondary actions.

**`button-white`** — white fill, no visible border, `Gray/700` or title text, the current selected button shape, and a restrained neutral shadow for separation on a white page surface. Its available hover and focus surface is a 50/50 `Background/Card` and `Foreground/Divider` mix (`#FAFBFC`), intentionally lighter than the standard `Background/Hover` and Secondary-button treatments. Do not add a dark or colored backing module solely to make this button visible.

**`button-ghost`** — white fill, `Foreground/Border` 1px border, `Gray/700` or title text, and the current selected button shape. Its available hover state uses `Foreground/Divider` fill; disabled Ghost retains its muted disabled surface with no hover treatment. Use for low-priority supporting actions that still need a visible button boundary.

**`button-text`** — transparent fill, no border, `Foreground/Title` text, and the current selected button shape. Use for the most secondary local action when an explicit button boundary would create unnecessary visual weight. It retains the full documented hit target; do not use it for navigation, the only action in a task, or destructive work.

**`button-link`** — transparent fill, no border, `Special/Text-Link` (#59779A) text, and anchor semantics. Use for an external destination only; provide a descriptive accessible name and preserve the visible external-link context when it is not obvious. It is not a substitute for a local workflow action or a primary CTA.

**`button-danger`** — white fill, `Status/Error` (#D3382F) text, no visible border, and `Primary/Surface` hover fill. Use only for a supplied risky action, such as deletion or authorization. It must have a specific readable label, never become the page's ordinary Red CTA, and must not imply that confirmation has already occurred.

**`plus-button`** — named italki Plus promotional or Mira CTA only. It uses the Plus gradient from red to blue by default, with white text, the selected button shape, and no border. Its available default, hover, pressed, and focus copy remains `Special/Always-White`; only disabled or loading states may use muted text. On hover, the visible gradient moves right and the red-to-blue resting colorway resolves as blue-to-red; do not add a white shine layer or introduce another gradient palette. Under reduced motion, retain the resting gradient without the movement. It may appear only inside an approved italki Plus, Mira, campaign, referral, gift-card, or other explicitly promotional module. It must not replace `button-red-cta` in standard search, teacher detail, booking, payment, form, or workspace workflows.

### Button Size, Icon, And Loading Variants

All button visual variants accept one supplied size and optional icon or loading state. The parent owns the action, pending meaning, and state transition.

- **Size and shape:** `sm` is 32px high with `Action/Button-SM` (12/18) and 12px horizontal padding, `md` is 40px high with `Special/Buttons Subtitle` (14/20) and 16px horizontal padding, and `lg` is 48px high with `Action/Button-LG` (16/24) and 24px horizontal padding. The default shape is size-aware: 32px uses 9999px Pill; 40px and 48px use 8px Rounded. An explicit `rounded` or `pill` shape applies consistently to every size. Do not mix button sizes in one ordinary action row without a documented reason.
- **Icon button:** a labelled button may accept one leading 24px action icon or one trailing directional icon from `Assets/Icons/`, with an 8px icon-to-label gap. A leading icon uses an 8px left edge inset; a trailing icon uses an 8px right edge inset. An icon-only button is for known utility actions only, uses a 40px minimum hit area and requires an accessible label. Do not add an icon only as decoration.
- **Loading:** a supplied loading state replaces the action icon with a spinner, prevents repeated activation, and exposes pending meaning programmatically. It supports labelled and spinner-only presentations; labelled loading preserves the readable action label, while spinner-only loading requires an accessible label. A disabled Loading presentation uses `Foreground/Disabled-text` for its label and spinner. Loading is a state that may be supplied to any documented button hierarchy; it is not a separate button hierarchy or a substitute for a page-level loading state.
- **Disabled:** filled variants use `Foreground/Divider` fill with `Foreground/Disabled-text`; Ghost removes its boundary and uses the same neutral surface, while Text and Link remain transparent. When the reason is not obvious, the owning form or task context supplies it.

### Button Property Coverage

The Button component supports visual hierarchy, state, size, shape, loading, leading icon, trailing icon, and icon-only properties. Each supported visual family defines default, hover or pressed, focus, and disabled states. Focus reuses the available variant's darker or deeper hover color treatment instead of adding an external focus outline. `button-white` uses its restrained shadow for separation on a white surface; `plus-button` remains a named promotional italki Plus button outside the ordinary hierarchy.

### CTA Density

CTA hierarchy, repeated-card action rules, and screen-level emphasis behavior now live in `EXECUTION.md`.

### Search Surface

**`search`** — Controlled query-input primitive. It receives a supplied value, accessible label, placeholder, disabled or loading state, optional clear affordance, optional leading or trailing slot, `shape` (`rounded | pill`), submit callback, clear callback, and input callbacks through props. It supports one supplied height: 32px, 40px (default), or 48px. `pill` is the default and uses `Radius/Full`; `rounded` uses `Radius/LG` (12px). They use white fill, `Foreground/Border` 1px outline, 12px horizontal inset, an approved 16px leading Search icon, and `Action/Input` text (14px / 500 / 16px). Use 32px for dense local controls, 40px for the standard search field, and 48px only when a more prominent local search is needed. The clear affordance uses the approved 16px close icon, preserves a 24px hit area, and appears only when the supplied value is non-empty and `clearable` is true. Hover may deepen the border to `Foreground/Placeholder-text`; focus uses one field-level title-color boundary only, without an outer ring or glow. Disabled uses `Foreground/Divider` fill and disabled or placeholder text. It never fetches or ranks results, persists history, interprets a query, chooses a destination, supplies filters, or decides submit behavior.

**`search-bar`** — A parent-composed search form that places `search` beside supplied local actions, filters, result counts, or other task-specific slots. It receives the same query and callbacks plus those supplied slots; it does not turn its own query into teacher discovery or any other product-specific behavior. `PATTERNS.md` defines teacher-discovery composition; `EXECUTION.md` defines page placement and responsive application.

**`search-field`** — The bare field presentation of `search`. When a visible external label is required, the parent supplies it at 12px / 700 with secondary text; field content uses the `search` contract and its placeholder uses `Foreground/Placeholder-text`.

**`chip`** — Headless compact choice control for a supplied filter, quick-entry intent, editable selection, or other reversible local selection. It receives visible `label`, controlled `checked`, disabled state, one `size` (`24px` compact, `32px` small, or `40px` default), one supplied `surface` (`default | white | transparent`), a visual `state` (`default | hover | checked | disabled`), accessible text, and parent-owned selection handling. `selected` remains a compatibility alias for existing consumers but new work uses `checked`. All sizes use `Radius/Full`; `Pill` describes shape only and is not a separate component or semantic. The default Chip is `Foreground/Divider` (#F5F6F9) fill; `white` is `Background/Card`, and `transparent` inherits its parent surface. All three are borderless at rest, while available unselected Chips hover to `Foreground/Border` (#E5E8ED). Checked keeps the shallow `Foreground/Divider` fill, adds a 1px `Gray/600` (#515164) boundary, and uses `Gray/600` text; its hover may deepen once to `Foreground/Border`. Disabled uses `Foreground/Border` fill with `Background/Card` text and never reacts. Keyboard focus strengthens the component's own boundary only; it does not draw an external focus ring. A controlled Chip may change a supplied local selection, but never fetches results, ranks data, derives filter counts, persists preferences, or decides a route. Do not use it to present static teacher attributes, course facts, status, or metadata; use `tag` or `badge`.

**`tag`** — Headless compact classification marker or supplied selected-value token. It receives supplied visible content, optional decorative icon, one semantic tone (`neutral`, `info`, `success`, `warning`, or `error`), `size` (`24 | 32 | 40`, default `24`), `removable`, accessible text, overflow behavior, and removal callback through props. The default form presents one static attribute, duration, level, status, or concise comparison fact; it never changes selection, opens a menu, filters a collection, changes a route, or receives button, checkbox, or radio semantics. The neutral default inside a white surface uses `Foreground/Divider` (#F5F6F9) fill with `Foreground/Primary-text` (#515164) text and no border; on a gray page surface it uses white fill with a 1px `Foreground/Border` outline. All named Tag sizes use `Radius/Full`: 24px uses 12/18 type with 8px horizontal inset; 32px uses 14/20 type with 12px horizontal inset; 40px uses 14/20 type with 16px horizontal inset. A documented size switch updates every Tag in its supplied container through the shared `setTagPresentation(container, { size })` implementation; Catalog must not imitate the size change with local CSS. A removable Tag exposes one separately labelled removal action sized 16px, 20px, or 24px to match the supplied Tag size and asks the parent to remove the supplied token; use it for selected values inside a control such as `select` multiple, not for a filter choice. Its approved `Assets/Icons/16px/cross-sm.svg` mark rests at muted secondary emphasis and returns to full emphasis only on hover or keyboard focus. A Tag never toggles itself: a selected, hoverable, or keyboard-selectable choice is a `chip`, not a Tag.

**`badge`** — Headless concise count, dot, or status marker. It receives `type` (`count | dot | status`), an `anchor` slot for `count` and `dot`, optional supplied `count`, readable `label` for `status`, semantic `tone` (`default | success | info | warning | error`), non-negative `overflowCount` (default `99`), `hidden`, and accessible label through props. A numeric count above the supplied cap renders as `overflowCount+`; the parent decides whether a zero count is hidden. `count` and `dot` require a stable supplied anchor such as an avatar, icon, or navigation item; `status` renders a readable text label with its semantic dot and does not need an anchor. It exposes a named `status` relationship, never creates the attached object, derives unread counts, selects content, fetches data, or becomes an inline Tag or alert. Ribbon is intentionally not part of the current Badge contract.

### Flow Progress

**`stepper`** — Passive ordered-step component, distinct from the quantity `number-stepper`. It receives ordered `items`, `current`, `variant` (`default | flow-progress`), `orientation` (`horizontal | vertical`), and an accessible label. `default` has a full 32px step marker and supports horizontal or vertical layouts with optional descriptions. `flow-progress` is its compact horizontal type with 24px markers and dense connectors. Both use the same `upcoming`, `current`, `complete`, and disabled state model. It never validates the step, changes routes, unlocks later work, or decides whether a step is clickable. It is not page navigation, tabs, breadcrumbs, or a route map; the parent owns validation, state transition, availability, persistence, and any destination of an allowed revisit. Blocked and error states require an explicit future contract before use.

**`progress`** — Controlled continuous-progress primitive for a supplied bounded amount, such as lesson package use, learning completion, or a measurable processing task. It receives value, bounds, formatted value text, state, labels, indeterminate meaning, and callbacks through props. It renders one visible track or compact indicator but never calculates the ratio, estimates time remaining, fetches work state, or represents named multi-step position; use `stepper` and its `flow-progress` variant for stages, and `skeleton` for unknown loading structure.

### Data Display

**`card`** — Headless discrete-object surface for supplied media, header, body, metadata, and footer slots. It receives `interactive`, `outlined`, optional media source and alt text, `mediaRatio` (`16:9 | 4:3 | 1:1`), supplied eyebrow, title, body, metadata and footer slots, `density` (`compact | default | comfortable`), accessible name, optional supplied `href`, and demo identifier through props. Static Card renders an `article`, `Background/Card`, `Radius/LG` (12px), and `Shadow/Card`; its optional outlined state uses `Shadow/Stroke card` rather than a CSS border. An interactive Card renders one root link or button, has no resting border, and uses `Shadow/Card-Hover` for hover and focus. The interactive root must not contain a second interactive descendant. The supplied media is clipped to the Card boundary. Default body inset is 16px, compact is 12px, and comfortable is 24px. Use Card for a discrete content object or one actionable destination; use `panel` for a related region with a stable internal header, and use a Pattern for teacher, booking, payment, or other product-specific compositions. Do not nest Cards, use Card as page-section chrome, fetch its object data, infer actions, or decide navigation.

**`statistic`** — Passive emphasized numeric fact. It receives supplied `title`, preformatted `value`, optional `prefix`, `suffix`, description, loading state, accessible label, and demo identifier through props. It renders a named grouped value using 12px / 18px secondary title and description text with a 28px / 34px title-color value; affixes use 16px / 24px and remain part of the supplied formatted fact. During loading it replaces only the value with a neutral skeleton while retaining the supplied title. It does not calculate totals, apply precision, separators, locale formatting, currency conversion, query metrics, choose a reporting period, or imply a trend from a number alone. The parent provides already formatted content and any change meaning. Use it for one scannable value, not a dense data table or a status badge.

**`table`** — Controlled structured collection display. It receives a stable id, non-empty ordered supplied `columns`, ordered `rows`, optional caption, density (`compact | default`), loading state, supplied empty text, accessible label, and demo identifier through props. A column supplies stable id, visible label, and text alignment (`left | center | right`). Each row supplies stable id and one supplied cell per column; a cell supplies content slot, alignment, and may be marked as the row header. The component preserves semantic `table`, `caption`, `thead`, `tbody`, column-header `scope`, and row-header `scope` markup inside a named region. Default headers are 40px high with `Foreground/Divider` fill; default rows use 48px minimum content rhythm, 14px / 20px text, and one divider between rows. Compact density uses 12px / 18px text with the compact inset. The responsive overflow boundary belongs to the Table root and scrolls horizontally rather than hiding comparable columns. Loading retains the supplied column structure and renders neutral skeleton cells with `aria-busy`; empty renders one supplied empty row spanning the supplied columns. Cells are supplied slots, so an action must use an existing Button or other registered primitive rather than locally styled markup. Table does not fetch, sort, filter, paginate, select rows, expand rows, mutate records, format domain data, infer columns, or decide responsive priority. Use it for comparable records; use a list or Cards when rows are not compared column by column. Sorting, filtering, selection, pagination, and expandable rows are deliberate future contract extensions, not implicit Table behavior.

**`timeline`** — Passive chronological event list. It receives an optional stable `id`, a non-empty ordered list of supplied items, `layout` (`left | right | alternate`), optional overall `tone` (`default | info | success | warning | error`), `reverse`, accessible label, and demo identifier through props. Every item supplies a stable `id` and a visible `title`; it may supply description, time label, semantic `tone` (`default | info | success | warning | error | pending`), or one approved local icon asset as its dot. When an overall `tone` is supplied, every standard dot uses it; otherwise each item uses its supplied tone. The root is a named region containing a semantic ordered list. Standard dots are 12px; semantic tones use their registered status token, while `pending` is muted, outlined, and rotates as a loading indicator. Labels occupy the side opposite event copy for left and right layouts. Alternate is a wide-layout presentation only; it must collapse to one side in a compact product adapter. `reverse` reverses the supplied item order for both visual and reading order. Timeline connects already ordered events; it does not sort or calculate dates, infer completion, fetch history, create task navigation, or decide a pending state. The parent owns item order, event meaning, layout suitability, tone choice, and the reverse toggle.

**`calendar`** — Controlled calendar surface with `variant: availability | teacher-availability | compact-availability | lesson-record`; a parent always supplies the data and owns every business consequence. `availability` is the weekly booking display composed only from existing `time-slot` (`availability` appearance). It receives a stable id, timezone label, week label, Today label, ordered date headers (`id`, label, optional date and current state), ordered time rows, disabled state, accessible label, and demo identifier. A time row supplies its visible left-axis `label` and one supplied cell per date. The row represents one hour and every cell is normalized into two ordered 30-minute Time slot units. Legacy four-segment input resolves to its two half-hour boundaries. Each visible half-hour is one interactive interval and one Tooltip target, so a booking shown from 03:30–04:00 remains a 30-minute booking in both grid height and hover copy. A supplied slot may include `tooltip` copy and a `teacher` name for a booked-by-you interval; otherwise Calendar supplies state-appropriate interval copy. The left axis remains the visible time reference. Its header uses the approved 24px `earth` icon, a 32px Today control, and 32px previous/next week controls; date headers are 40px and time rows are 40px. A current date uses `Status/Available-current-day-surface` with one 8px `Status/Success` (`#0DE298`) corner marker. A slot supplies its existing Time slot state (`available`, `selected`, `unavailable`, `booked-by-others`, `booked-by-you`, or `loading`), so Calendar must not recreate availability styling. It emits `italki:calendar-change` for a selectable supplied slot and `italki:calendar-action` for Today or week-navigation intent; the parent supplies the new week, time zone, selected slot, availability data, and all booking consequences. `teacher-availability` is the passive seven-day teacher schedule used inside a focused-task Modal: it receives an `availabilityLabel` and exactly seven ordered `teacherAvailability` days (`id`, `label`, `date`, optional `current`, and ordered `slots`). A slot is a supplied available label or `{ label, state: available | unavailable }`; missing rows normalize to unavailable rather than inventing a time. It uses the same 40px current-date header treatment as `availability`: `Status/Available-current-day-surface` and one 8px `Status/Success` (`#0DE298`) corner marker; schedule cells are 32px with `Status/Available` for supplied opening times and `Foreground/Border` grid lines. Its previous/next controls appear without a duplicate date label between them and only emit `italki:calendar-action`; it does not select a time, hold inventory, calculate a schedule, open a booking, or render the Modal footer. A parent may compose it with the existing 744px `modal` (`titleAlign: center`) and existing 40px Red CTA. `compact-availability` is the passive 342px week-at-a-glance matrix: it receives exactly seven supplied date headers and ordered four-hour time-band rows, each with exactly seven supplied `available | unavailable` cells plus a supplied timezone caption. An available cell may supply positive `hours` and optional tooltip copy; hovering it exposes that actual bookable duration (for example, `2.5 hours`). When `hours` is absent, its band duration is used as the fallback. It uses the 72px time-label rail, 26px row rhythm, `Radius/MD` outer corners, `Foreground/Border` grid lines, and `Status/Available` fill. It communicates only the supplied open-time pattern; it never renders Time-slot controls, accepts a selection, calculates availability, fetches schedules, or emits a booking intent. `lesson-record` is a passive annual activity heatmap, not an availability surface: it receives a title, ordered `recordMonths` (label, optional current state, and ordered weeks of exactly seven cells), optional ordered summary stats (`label`, `value`, `tone: info | success`), weekday labels, accessible label, and demo identifier. Its supplied cell states are `empty`, `info` (lesson), `success` (practice), `mixed`, `selected`, and `out-of-range`; the visual uses 20px cells, a 2px gap, `Radius/XS` (4px), semantic info/success tokens, and a supplied selected boundary. A lesson record only displays supplied history; it does not calculate dates, aggregate totals, infer activity, select a date, fetch availability, convert time zones, hold a lesson, or submit a booking. At narrow widths every variant scrolls horizontally rather than dropping or clipping calendar data.

**Calendar availability update.** The current availability grid uses two 30-minute Time slot children per hour. Older four-segment data resolves to its two half-hour boundaries and must not create a 15-minute visual rhythm. Time slot, rather than Calendar, owns the default availability Tooltip copy and the calendar-cell metadata; Calendar owns only the grid, date context, week navigation, and one-hour selection rule.

### Content Views

**`tabs`** — Controlled local content-view composite for switching between closely related panels in one page region or invoked surface. It receives a stable `id`, ordered `items` (`id`, visible label, supplied panel slot, optional approved 16px icon, optional compact count, and disabled state), active id, `orientation` (`horizontal`), activation mode (`manual | automatic`), optional trailing-action slot, accessible label, and demo identifier through props. The default is a horizontal line tab bar: transparent at rest; hover and keyboard focus use a `Radius/MD` `Foreground/Divider` surface; the active label uses title color and its 2px `Gray/600` indicator scales in over 160ms. An activated panel enters once with a restrained 180ms fade and 4px rise; both animations are disabled for reduced-motion preferences. A disabled tab cannot be activated and uses disabled text. Arrow keys, Home, and End move focus; automatic activation updates the supplied local panel while manual activation waits for an explicit trigger. The parent supplies item order, content panels, lifecycle, overflow policy, and active state; an overflowing horizontal tab list scrolls rather than wrapping into an ambiguous second row. It keeps one local content context visible; it never changes routes, represents task completion, replaces page navigation, owns a global navigation list, or hides unrelated sections. Card-style editable workspaces, closeable browser-like views, and route-level navigation are separate product compositions, not core Tabs.

**`segmented-control`** — Compact controlled single-select mode or view switch for two to five immediately comparable options, such as list/grid or day/week. It receives ordered options, selected id, `size` (`32 | 40 | 48`), `shape` (`pill | rounded`), disabled state, accessible label, and callbacks through props. `pill` is the default; `rounded` uses `Radius/MD` (8px). Shape is a local visual treatment only: keep one shape consistent within one decision set. It does not own a tab panel, route, filter data, form submission, or a multi-step decision; use `tabs`, `choice-group`, or `stepper` when those semantics apply.

### Content Disclosure

**`disclosure / accordion`** — Controlled local-content composite for one bounded supporting section or a related group of sections. It receives stable item ids, expanded ids, single or multiple expansion mode, item labels and content slots, disabled or unavailable meaning, and expansion callbacks through props. It preserves the summary while revealing supplied content in place; it never reads routes, persists preferences, fetches content, validates hidden fields, decides which errors require expansion, or treats a disclosure as navigation, tabs, or a flow step.

### Layout

**`panel`** — Headless bounded content region. It receives body content, optional title, optional extra slot, one density (`small`, `medium`, or `large`), optional header divider, and accessible region label through props. Density controls internal rhythm, not the panel's external width: `small` uses a 40px header and 12px body padding; `medium` uses a 48px header and 16px body padding; `large` uses a 56px header and 24px body padding. When a header action is needed, supply the existing `text button` through `extra`; Panel does not create a separate Edit treatment. Its outer surface uses `Radius/LG` (12px); header dividers stay clipped to that same boundary. It owns only the title/body relationship and local spacing; it does not paginate content, create an independent task surface, fetch records, infer the title, or put a card inside a card. Use it when a related content region needs a stable internal header; use plain grouped content when a heading and whitespace communicate the structure without a Panel.

#### Internal Composition Rules

Inside a Card or Panel, use headings, rows, dividers, grouped spacing, or `Foreground/Divider` neutral fill to distinguish related content. A static internal region has no additional border, shadow, or nested Card; only an explicitly selectable option may deepen to `Background/Hover` on hover or focus. This is a layout rule, not a named product pattern or a new component.

### Navigation

Product shell assemblies, including `workspace-header` and product-specific navigation data, are defined in `PATTERNS.md`. The reusable `sidebar` below owns only the navigation surface and its local interaction states; product adapters supply destinations, history, account data, entitlements, and outcomes.

**`brand-mark`** — May use the emphasis color or brand mark treatment. Size 40–44px, radius 12–14px, white mark text.

**`nav-link`** — 14px / 500, primary text. Active and hover states use title/gray emphasis, not red.

**`top-nav`** — Headless horizontal navigation surface. Call `topNav({ id, leading, center, trailing, ariaLabel, demo })` with supplied slots; it owns only a 72px white bar, one bottom `Foreground/Border` separator, 24px desktop edge inset, and the reading order `leading` → `center` → `trailing`. It does not supply global text-navigation items, account data, routes, language choices, search results, filters, or booking behavior.

**`top-nav-context`** — Subcomponent for a supplied contextual menu. Call `topNavContext({ id, mode, selected, options, open, ariaLabel, demo })`, where `mode` is `labelled | compact`, `selected` supplies `{ id, label, flag }`, and each option supplies the same stable id, label, and approved local flag asset. It owns the menu disclosure relationship and local selection presentation, but does not derive or persist a context choice. `labelled` uses a 24px visual, `14px / 700 / 20px` label, and the approved 24px `arrow-down-sm` asset with 8px gaps and 8px trigger inset; `compact` omits only the visible label. Resting state has no fill or outline; hover and open use `Foreground/Divider`, while direct hover of an open trigger may use `Background/Hover`. Its supplied 208px menu uses `Radius/XL`, 8px container padding, 4px row gaps, and 40px options with a 24px visual, 12px visual-to-label gap, and `14px / 600 / 20px` labels.

**`top-nav-search`** — Navigation-search subcomponent, distinct from standalone `search`. Call `topNavSearch({ id, value, placeholder, filter, filterLabel, filterIcon, filterCount, filtered, clearable, disabled, state, ariaLabel, demo })`. It renders an accessible 40px search region with a 24px Search icon, 8px icon-to-text gap, 12px leading inset, `14px / 500 / 22px` text, optional 24px clear action, and optional filter control. Resting and filtered states are 400px wide with `Foreground/Divider` fill and no outline; direct input focus or a non-empty supplied query may expand symmetrically from the navigation center to 520px where the parent viewport permits, using white fill and a 1px `Foreground/Border` boundary. Activating Filter never changes width. Its Filter control uses one divider, 24px icon, 4px icon-to-label gap, and optional supplied 8px `Status/Success` cue. The headless renderer does not submit, fetch, rank results, interpret a query, count filters, or decide a destination; the parent owns those callbacks and values.

Top-nav actions are supplied slots and must use the existing `button` renderer. A standard action uses `button({ variant: 'emphasis', size: 40, shape: 'pill' })`, optionally with one approved 24px leading icon, so padding, text, focus, disabled, and loading behavior remain the Button contract. `top-nav` never creates a parallel action style. On narrower widths, the parent supplies slot compression or the alternate presentation defined by `EXECUTION.md`. The reusable UI component remains distinct from the authenticated `workspace-header` pattern in `PATTERNS.md`.

**`sidebar`** — Controlled vertical navigation surface. It receives a stable `id`, `variant` (`normal | plus`), `collapsed`, ordered primary `items`, optional disclosure `sections`, optional `moreItems`, `moreOpen`, supplied footer slot, accessible label, and demo identifier through props. A primary item supplies id, label, approved Icon-library asset, active and disabled state; one item may be the More trigger. Use `fixed: true` for destinations that must stay at the top: they never expose Pin controls or dragging. All other primary destinations are pinnable: their right-side solid Pin action removes them from the primary list and returns them to More; More rows expose an outline Pin action that restores them before More. Pinnable rows can be dragged to reorder within their current list, while fixed rows always retain their relative positions. A section supplies id, label, `open`, and ordered child items. A child item may supply an approved leading slot, numeric prefix, optional 1px divider, and secondary text; these values are supplied content, not user, teacher, lesson, chat, or route data inferred by the component. More items supply id, label, approved icon, disabled state, and optional preceding divider. The root is a named `aside` with a named destination `nav`; More is an anchored `menu`, and sections expose `aria-expanded` / `aria-controls`.

Expanded Sidebar is 324px wide with a 72px header and footer, internal scrolling, compact 12px / 18px rows, 40px minimum row targets, and `Radius/LG` rows. `normal` shows the italki wordmark; `plus` additionally shows the approved Plus logo asset. `collapsed` is 72px wide, centers the mark, hides text and sections, and exposes the expand affordance on hover. Primary item hover uses `Foreground/Divider`; active items use the same base fill and may deepen to `Background/Hover` on direct hover. Pin controls are visible only on direct row hover or keyboard focus. Sections are collapsed by default unless the supplied `open` value says otherwise, then expand and collapse over 260ms. On expansion, the Sidebar scrolls only its internal region upward by at least the height of the first three child rows; it never scrolls the document. The 16px section arrow rotates only with the supplied open state. More is a bounded elevated menu and closes 300ms after pointer leave unless the pointer re-enters.

**`footer`** — Headless page-end navigation region. It receives a stable optional id, ordered supplied link `columns`, optional supplied `utilities` slot, copyright, legal links, social links with approved Icon-library assets, accessible label, and demo identifier through props. A column accepts either the compact `{ heading, links }` shape or ordered `{ groups: [{ heading, links }] }` groups; this lets a column hold related navigation sections without creating a new Footer variant. It renders semantic footer and navigation/link groups only: it does not decide link labels, locales, currencies, social destinations, legal copy, link priority, account state, or responsive product content. The standard desktop composition is four equal navigation columns and one equal utility column; utility controls are supplied instances of the shared `select` component, commonly 40px Rounded locale and currency Selects. The top area has 40px page insets, group headings use 16/24, and links use 12/18 with an 8px trailing rhythm. Copyright occupies its own centered band after one `Foreground/Divider` boundary; supplied legal links and approved social icons compose the final bottom row. At narrower widths, navigation columns wrap from four to two to one based on available content width; no fixed page height is imposed. Use the shared `select` component for locale or currency utilities and approved Icon-library assets for social destinations.

Sidebar does not read routes, viewport, account, entitlement, notifications, lesson counts, teacher identity, chat messages, pin state, analytics, or translations. It does not fetch data, decide which destination is active, persist collapsed or disclosure state, or perform navigation. A parent supplies those values and callbacks. Use `sidebar-navigation` in `PATTERNS.md` only to compose this primitive with product data and shell policy; do not reproduce Sidebar markup or CSS in a page.

**`breadcrumb`** — Headless hierarchy-path primitive. It receives ordered supplied `items`, optional `separator`, one navigation `ariaLabel`, `collapsedOpen`, and a demo identifier through props. Each item supplies a visible `label` or approved Icon-library asset, optional icon-only `ariaLabel`, optional destination, disabled state, `current`, and optional `collapsed` state. The current item is non-actionable, uses `Foreground/Title`, and exposes `aria-current="page"`; every ancestor uses `Foreground/Secondary-text`. The default separator is `Assets/Icons/arrow-right-sm.svg` at 16px. A parent may supply a neutral literal separator or another approved local icon asset without changing path hierarchy. Home may be icon-only but must retain its documented 24px icon box and an accessible name; do not add icons to every path item. When a supplied middle item is `collapsed`, the component renders a More menu containing those supplied labels; it never truncates the current item, infers routes, reads browser location, fetches navigation data, decides a destination, or becomes a stepper, tab strip, or back button. A Backup icon is allowed only when no Core equivalent exists.

#### Headless Navigation Primitives

**`navigation-primitives`** — The reusable component contract is defined here, alongside the other design-system components. `NavigationHeader`, `NavigationMenuTrigger`, `NavigationSidebar`, `NavigationDrawer`, `NavigationList`, `NavigationItem`, and `NavigationSection` are unstyled React primitives. They receive all content through slots and all state through props: a consumer supplies `isOpen`, `mode`, `isActive`, `isCollapsed`, `isExpanded`, callbacks, icons, labels, routes, and any custom link renderer. They never read product route, viewport, account, entitlement, notification, course, chat, pin, analytics, or translation state. This is a design-system contract; it does not authorize implementation changes in the frontend repository.

### Overlay Family

**`overlay family`** — Headless invoked-surface primitives for a temporary layer above the current task: `modal`, `drawer`, `popover`, `dropdown menu`, and `tooltip`. They receive their open state, dismissal permissions, accessible name, focus-return target, placement or mobile presentation, content slots, and callbacks through props. They never fetch data, inspect routes or viewport state, decide a task's business outcome, or infer whether draft changes are saved. The parent chooses the variant and supplies state; the component owns only the visible surface, its local interaction boundary, and its documented accessibility behavior.

| Overlay Tier | Components                             | Visual Treatment                                                                                          | Interaction Boundary                                                                                |
| ------------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Context hint | `tooltip`                              | Small transient floating label. It must not overlap an active dialog or communicate required task data.   | Passive; never traps focus or contains required interactive content.                                |
| Local action | `popover`, `dropdown menu`             | Compact floating `Background/Card` surface with restrained elevation, anchored to its invoking control.   | Non-modal by default; preserve the anchor relationship and close without obscuring the parent task. |
| Focused task | `modal`, `drawer`, mobile bottom sheet | `Background/Card` surface above `Special/Mask`; modal uses `Radius/LG`, drawer and sheet use `Radius/XL` | Modal scope; blocks the page, manages focus, and owns scroll containment while open.                |

- A lower tier never renders above an already active higher-tier surface from the background page. A popover or menu opened inside a modal belongs to that modal's focus and stacking scope.
- Only one modal-level surface may be active at once. A short confirmation may replace or temporarily suspend the initiating modal only when it is necessary to prevent a destructive or irreversible result.
- `modal` is the centered, bounded focused-task variant; `drawer` is the edge-anchored focused-task variant; a bottom sheet is the mobile presentation of a focused task, not a new business component.
- `popover` contains a compact contextual task or short form. `dropdown menu` contains commands or navigation actions, not a form, filter group, or detailed value comparison. `tooltip` supplies optional clarification only.
- All floating surfaces use one clean background, one controlled elevation treatment, and no nested card styling. Their close permissions, focus-return target, keyboard behavior, and mobile presentation are explicit component props; page-level surface selection lives in `EXECUTION.md`.

**`modal`** — Controlled focused-task dialog. It receives `open`, accessible title, body and footer slots, optional close affordance, `maskClosable`, `keyboardClosable`, loading state for a supplied confirm action, `size`, optional `titleAlign` (`start | center`), `stage` (`demo | inline`), focus-return target, and close/confirm callbacks through props. `size="default"` is a 520px Dialog and `size="wide"` is a 744px Dialog; do not supply arbitrary widths. Both sizes use `Special/Mask`, one `Background/Card` surface, and `Radius/LG` (12px). `stage="demo"` is the bounded, neutral preview surface for component documentation; `stage="inline"` keeps only the trigger in normal layout and opens the same dialog above the viewport. An inline Modal locks background scrolling; its header and footer remain fixed while an over-height body scrolls inside the dialog. Its close affordance uses the approved native 24px `Assets/Icons/cross.svg`; center alignment is for a concise, focused task title only, while the close action remains at the header end. The parent may constrain either size to the available viewport width, without changing its token or visual hierarchy. It traps focus while open, closes on Escape only when permitted, returns focus to its invoking control, and prevents background interaction. It does not choose a task, supply buttons, mutate data, decide whether work is destructive, or calculate responsive content. On compact screens the parent supplies the documented focused-task mobile presentation.

**`drawer`** — Controlled edge-anchored focused-task surface. It receives an id, supplied trigger or fallback trigger label, title, body and footer slots, `open`, placement (`left | right | bottom`), size (`default | wide`), close affordance, mask and keyboard dismissal permissions, focus-return target, and close callbacks through props. It uses `Special/Mask` and one `Background/Card` surface. A right Drawer is flush and square-cornered; left and bottom Drawers use `Radius/XL` (16px) only on their exposed corners. Footer actions align to the end with a 16px gap. On open and close, the panel slides 220ms from or toward its placement edge while the mask fades; reduced-motion preference shows the final state without the movement. It is appropriate for a related secondary task that needs more vertical space than a popover while leaving the originating page context visible. It traps focus while open, closes on Escape only when permitted, and returns focus to its invoking control after dismissal. It does not own a page route, fetch options, validate a business task, persist edits, or decide whether an apply action succeeds.

**`popconfirm`** — Controlled compact destructive-or-irreversible action confirmation anchored to its supplied trigger. It receives `id`, title, optional description, supplied trigger / cancel / confirm slots or their fallback labels, `showCancel`, `open`, placement (`top`, `bottom`, `left`, or `right`), disabled state, loading state, and accessible label through props. Its fallback trigger and short local actions use 32px Pill Buttons: Secondary for cancel and Danger for confirm. It shares the 320px bounded anchored-surface width and anchor spacing of `popup` and `popover`. A supplied trigger includes `aria-expanded` and `aria-controls`; the fallback trigger receives those attributes automatically. It uses an `alertdialog` relationship, closes on Escape or outside interaction, and returns focus to its trigger after its supplied cancel or confirm action asks the shared close helper to close it. It is for one short decision with clear local context, not multi-field editing, lengthy explanation, or a second full dialog. When both actions are shown, the action row preserves both supplied labels on one non-wrapping line at the documented compact width; a parent must choose a different compact presentation rather than let action labels wrap. It never performs the confirmation itself.

**`popup`** — Controlled non-modal anchored supporting surface. It receives `id`, supplied trigger markup or a labelled fallback trigger, optional title, body text, action slot, `open`, placement (`top`, `bottom`, `left`, or `right`), trigger mode (`click`, `hover`, or `focus`), pointer-leave dismissal (`closeOnLeave`) and the documented 300ms `leaveDelay` through props. A supplied trigger includes `aria-expanded` and `aria-controls` for the generated surface id; the fallback trigger receives those attributes automatically. When pointer-leave dismissal is enabled, it closes 300ms after the pointer has left both the supplied trigger and popup surface; re-entering either cancels the pending close. Escape closes an open Popup and returns focus to its trigger. Its supplied trigger and compact local action buttons use 32px Pill Buttons, retaining their supplied visual hierarchy. `popup`, `popover`, and `popconfirm` share one 320px bounded surface width and one anchor gap in documentation and product use. It may contain concise supporting information or local actions, but must not contain a required task flow, a large form, or page navigation. It does not infer placement from product state, fetch supporting content, or own route or business behavior. Use `tooltip` for passive clarification and `popconfirm` for confirmation.

**`popover`** — Controlled semantic alias of the `popup` renderer for a compact contextual task or short form. It takes the same supplied anchor, open state, placement, content, actions, leave-delay, dismissal, and focus-return props; its visual and accessibility behavior remains the Popup contract. Use the `popover` name when the invoking content is an editable or actionable local context, and `popup` for supporting information. Neither may contain page navigation or a required multi-step task.

**`dropdown-menu`** — Controlled anchored command menu. It receives an id, supplied trigger or fallback trigger label, ordered supplied items, placement (`bottom-start | bottom-end`), open state, accessible name, and callbacks through props. An item supplies its visible label, optional approved icon, disabled state, or destructive tone. A supplied menu icon retains its native 24px size; do not scale it down for the row. The root owns only trigger-to-menu ARIA, bounded menu geometry, command focus, and local open or close state; it does not fetch commands, derive permissions, create navigation destinations, or decide the action result. Use it for a short command list, not a filter form, detailed comparison, or content disclosure.

**`tooltip`** — Passive contextual hint anchored to one supplied trigger slot. It receives an id, concise text, supplied trigger markup or a labelled fallback trigger, placement (`top`, `top-left`, `top-right`, `bottom`, `bottom-left`, `bottom-right`, `left`, or `right`), arrow visibility, open state, optional disabled-trigger wrapper, and a demo id through props. The supplied trigger associates itself with the generated tooltip id through `aria-describedby`; the fallback trigger receives that relationship automatically. It defaults to an arrowed top placement with a 100ms show and hide delay. Corner placements align the tooltip edge and arrow 16px from the corresponding trigger edge; use them only when centered placement would collide with nearby content. Its surface is `Foreground/Title` with white text, `Radius/MD` (8px), 8px vertical and 12px horizontal inset, 12px / 18px / 500 type, an 8px arrow, restrained elevation, and a maximum text width of 240px. A tooltip supplies optional clarification only: it must not contain actions, links, forms, long explanation, error recovery, or information required to complete the task. A disabled control requires the supplied hoverable wrapper; Tooltip never changes the disabled control itself. On touch-only or compact contexts, expose required meaning through the visible label or inline help rather than relying on a Tooltip.

### Inputs & Forms

**Field family contract** — `form-field`, `text-input`, `textarea`, `select`, `combobox`, `number-stepper`, and `date-picker` use the same independent `size` (`32 | 40 | 48`), interaction `state` (`default | hover | focus | disabled`), and validation `status` (`default | warning | error`) axes. `shape` (`default | rounded | pill`) is available only where a component has distinct visual forms; Textarea uses one fixed `Radius/LG` multi-line surface. `state` never communicates validation; `status` never implies keyboard focus. For compatibility, legacy `state: "warning" | "error"` resolves to the equivalent status, but new usage must pass `status`. `default` resolves to Pill at 32px and `Radius/LG` at 40px and 48px; `rounded` is always `Radius/LG`; `pill` is always `Radius/Full`. Available white or transparent controls use a `Foreground/Divider` hover fill or a stronger boundary; warning/error use their matching semantic outline and surface; disabled and read-only forms never show hover or focus treatment. Validation copy, `aria-describedby`, and `role="alert"` belong to `form-field`, not an orphaned colored control.

**`form-field`** — Composite relationship between one visible `form-label`, one compatible control, and optional helper, validation, or confirmed-state text. It accepts the Field family `size`, `shape`, `state`, and `status` props to keep the label, child control, and message in one documented presentation. It owns the field-level reading order, required or optional cue, description and error association, and vertical spacing. It does not own the entered value, option data, submission, cross-field validation, or page-level error summary. Use it for one `text-input`, `textarea`, `select`, `combobox`, `date-picker`, or `number-stepper`. A text input may supply a leading approved icon or a trailing Button action inside the same field; these belong to the input, not to a separate Form field variant. A self-labelled `choice-group` uses its own `fieldset` / `legend` relationship and must not be wrapped in a second `form-field`.

**`text-input`** — Scalar single-line text-entry primitive used inside `form-field`. It receives a supplied value, placeholder, optional leading or trailing approved 24px icon, optional trailing action, disabled or read-only state, validation state, accessible name, and input callbacks. It supports one supplied height: 32px, 40px (default), or 48px, and one `shape` (`default | rounded | pill`). The shared default shape policy applies: 32px uses `Radius/Full`; 40px and 48px use `Radius/LG` (12px); an explicit `rounded` or `pill` shape may override it. It uses white fill, a 1px `Foreground/Border` boundary, 12px horizontal inset, `Action/Button-SM` at 32px, and `Action/Input` at 40px and 48px. Focus uses the black/gray emphasis system or title border without glow. It does not create its own label, helper text, error message, query behavior, or submit action. Use the separate `textarea` primitive for multi-line entry; the Catalog presents it alongside Text input only as the related multi-line text-entry choice.

**`textarea`** — Multi-line scalar text-entry primitive used inside `form-field`. It receives the Field family `size`, `state`, and `status` alongside its text, validation limits, disabled or read-only state, resize behavior, row bounds, count display, accessible name, and callbacks. It has one fixed `Radius/LG` surface; it does not expose redundant shape variants. It does not fetch, save, translate, moderate, or interpret the entered content. An error or warning surface must be composed with `form-field`, which owns the visible helper or error message and its `aria-describedby` relationship; a colored Textarea border alone is not valid validation feedback. Read-only and disabled forms use the quiet `Foreground/Divider` surface and do not expose hover, focus, border, or shadow emphasis. It may grow vertically only when the configured task benefits from it; it must not horizontally resize, create a second card, or replace a rich-text editor.

**`select`** — Controlled option-selection primitive used inside `form-field`. It receives one supplied selected value or an ordered supplied set of selected values (`mode: single | multiple`), options or option groups, placeholder, disabled, loading, validation status (`warning | error`), clearability, accessible label, option rendering, `shape` (`default | rounded | pill`), and open, close, clear, search, remove, and change callbacks through props. When searchable, its optional controlled `query` only filters the supplied visible options; the parent still owns remote results, option data, and query persistence. Its trigger supports `size: 32 | 40 | 48` (48px default), white fill, a 1px `Foreground/Border` outline, 12px horizontal inset, the supplied `Assets/Icons/arrow-down-sm.svg` on its native 24px canvas, and the native 16px `Assets/Icons/16px/cross-sm.svg` clear asset in its 24px hit area. The clear icon rests at muted secondary emphasis and returns to full emphasis only on hover or keyboard focus. `default` follows the shared control shape policy: 32px uses `Radius/Full`, while 40px and 48px use `Radius/LG` (12px). `rounded` always uses `Radius/LG`; `pill` always uses `Radius/Full`. The 32px compact size uses `Action/Button-SM`; 40px and 48px use `Action/Input`. An `error` state uses its semantic error outline and `Error/Surface` fill; a `warning` state uses its semantic warning outline and `Warning/Surface` fill. The popup is one elevated, bounded listbox with a 256px maximum list height, white surface, 1px border, `Radius/LG`, and documented overlay layering; its surface shape does not change with the trigger. Each selected multiple value renders the shared removable `tag` inside the trigger; it is not an independent filter Chip. The searchable Select presentation is documented as Combobox on this same page: it exposes the controlled query in the field and filters before first paint, but it does not request remote results, create a new option, or turn text into a value without parent-supplied behavior. Default, focused, disabled, warning, error, loading, clearable, multiple, searchable, empty-result, disabled-option, grouped-option, and Combobox states are required. The component does not fetch, sort, translate, format domain data, create arbitrary values, persist a preference, or decide booking, payment, availability, or submission behavior. Use it for a small to medium supplied choice set; use radio for immediately comparable short options and a dedicated picker for calendar or time selection.

**`date-picker`** — Controlled overlay calendar for selecting one supplied date or one bounded supplied date range. It receives the Field family `size`, `shape`, `state`, and `status`, plus an id, visible label, display value or placeholder, open and disabled state, a supplied weekday row, the visible month or month pages, ordered supplied days (label, stable value, optional disabled or muted state), one selected value or an ordered range, and the visible month index through props. It owns trigger, calendar-grid semantics, active-date focus, local range preview, supplied-month navigation, and the open-to-closed transition after a chosen day. It does not calculate timezone conversions, determine business availability, fetch blackout dates, parse arbitrary dates, manufacture calendar data, or choose booking outcomes. Its trigger uses the shared 40px field rhythm by default, the approved Calendar asset, and `Assets/Icons/arrow-down-sm.svg` as its suffix. The suffix points up while the overlay is open and returns down when it closes. Month navigation uses the approved small assets `Assets/Icons/arrow-left-sm.svg` and `Assets/Icons/arrow-right-sm.svg`. Its overlay is positioned independently of document flow and must not move surrounding content when opened. Use it for a date decision, not a schedule grid, calendar history, or free-form time selection.

**`rate`** — Bounded quick-evaluation primitive. It accepts `id`, `value` (`0` through `count`, default `5`), `count` (integer `1–10`), `allowHalf`, `allowClear` (default `true`), `disabled`, optional one-per-star `labels`, `showText`, accessible `label`, visual `state` (`default | hover | disabled`), and an optional `demo` hook. It uses the approved `Assets/Icons/star-outline.svg` and `Assets/Icons/star-solid.svg` assets at 20px with a 4px gap. The Basic presentation permits half steps through the left and right halves of each star. Selecting the current value again clears it when `allowClear` is true. Arrow keys move by the active step, Home clears, and End selects the maximum. `labels` provide each star's accessible name and can be surfaced with `showText`; disabled retains the supplied score but cannot be changed. It communicates one lightweight supplied evaluation only. It does not calculate review averages, fetch reviews, rank teachers, submit feedback, or infer a score. Do not add custom characters, read-only presentation, or alternative rating scales without a separately registered extension.

**`selection`** — Controlled, information-rich selectable card. It is one semantic shell with independent `contentType` (`standard | icon-simple | icon-card | avatar | payment-icon`), `selectionMode` (`radio | checkbox`), visual `state` (`default | hover | focus | disabled`), selected state, optional `selectedMarker`, and supplied content slots (`label`, optional `subtext`, `description`, `leading`, `badge`, `price`, and `period`). Content is consistently left aligned. `standard` places the shared Radio or Checkbox visual primitive before text; the other content types place the shared Checkbox visual primitive at the far right of the supplied information. The Selection root remains the only interactive element, so it never nests an interactive Radio or Checkbox. `icon-card` adds a bounded header and body but remains the same Selection component, not a separate product card. The parent supplies all labels, values, imagery, pricing, and selected values; Selection owns only its card surface, local focus, accessible radio or checkbox semantics, and local selected presentation.

Selection uses a white surface, 1px `Foreground/Border` boundary, `Radius/LG`, 16px inset, compact 14px text, and one 16px control scale. `icon-card` applies that 16px inset to both its header and body. A standalone card and a `layout: stack` group cap reading width at 560px; `layout: grid` is the named two-column comparison form and contracts to one column on narrow widths. Selected keeps the same outer dimensions and strengthens the existing boundary with inset `Gray/600`. `selectedMarker` is an optional selected-only 20px `Gray/600` corner marker; it is clipped inside the Selection radius, never positioned by page-level CSS. It is the card mode's sole visual selected indicator, so a card configured with `selectedMarker` hides its regular Radio or Checkbox glyph while retaining its radio or checkbox semantics. Height follows supplied content rather than a fabricated fixed height. Hover uses `Foreground/Divider`; focus strengthens the inset title boundary without an outer halo; disabled uses a quiet divider surface and no interaction. Radio cards are mutually exclusive: a group exposes one named `radiogroup`, one selected card, roving tab focus, and arrow-key movement. Checkbox cards are independent multi-select choices and each exposes checkbox semantics. On narrow widths, `icon-card` may stack its badge above price and description while preserving the same semantic component. Use Selection when each choice needs evidence or comparison content; use bare Radio or Checkbox for short choices, Chip or Segmented control for compact modes, and Button only for an action.

**`slider`** — Controlled bounded numeric-range input. It receives one value or supplied `[minValue, maxValue]` range, `min`, `max`, `step`, optional marks, disabled state, orientation (`horizontal | vertical`), reverse direction, keyboard support, tooltip formatting and visibility policy, accessible name, and change callbacks through props. Horizontal is the default; vertical retains the same supplied value semantics and needs a labelled axis or adjacent value. Tooltips appear on hover, focus, and drag unless the parent explicitly supplies a hidden or always-visible policy; they format the current supplied value and never replace an accessible value. Every orientation uses the same neutral visual contract: `Gray/600` (#515164) for the selected segment, `Foreground/Border` (#E5E8ED) for the unselected rail, and `Background/Card` for the 16px thumb with a 2px `Gray/600` outline. Do not introduce semantic, brand, browser-default, or orientation-specific track colors. A range is one shared rail with one continuous selected segment bounded by its two 16px thumbs; it must support pointer and touch drag on the nearest thumb, plus native keyboard adjustment on either thumb, and never render as stacked independent sliders. Its `min–max` output is one non-wrapping 44px column; optional marks align only to the rail and never occupy that output column. Reverse mirrors that selected segment from the end of the same rail. Vertical uses the same tokens and grows the selected segment from the bottom. Thumb hover, active, and focus add the approved restrained emphasis ring; disabled has no hover or focus treatment and uses `Foreground/Disabled-text` for the selected segment and `Foreground/Divider` for the remaining track. It owns thumb and track interaction only; it does not derive a valid range, convert units, persist settings, or infer a recommended value. Use it when a continuous or ordered numeric range is easier to understand than discrete visible choices. Use a number input when exact entry is the primary task.

**`switch`** — Controlled immediate binary action. It receives checked, disabled, visual state (`default | hover | disabled`), loading, size, optional checked and unchecked labels, accessible name, and change callback through props. Its 44×24px track uses `Foreground/Disabled-text` off and `Gray/600` on; an available hover deepens each state one step, while disabled off and on are muted and never react. The Catalog documents those six visual outcomes as Off, On, Off hover, On hover, Off disabled, and On disabled. Toggling applies one reversible setting immediately; it is not a deferred multi-select field, a submit button, or an availability status. A parent owns the update, recovery, loading result, and any persisted preference. Use checkbox when the selection should be reviewed and submitted with a form.

**`time-slot`** — Atomic visible availability unit for one supplied time interval and the child component of `calendar` availability. It receives a stable id, `time` for the formatted interval, optional visible `label`, secondary text, Tooltip copy, `duration` (`15 | 30 | 60` minutes), state (`available | selected | unavailable | booked-by-others | booked-by-you | loading`), disabled compatibility state, accessible label, and demo identifier through props. For Calendar composition, `calendarDay` and `calendarMinute` provide the parent’s date and start-minute metadata; `teacher` adds a booked-by-you Tooltip name. `availability` contains no visible time text, uses `Status/Available` for available, `Status/Info` for selected, white for unavailable, a light-gray diagonal stripe for another learner’s booking, and an available-green diagonal stripe for the user’s own booking. Calendar always composes the 30-minute form; the same primitive can represent a supplied 15- or 60-minute interval in another schedule. Hover or keyboard focus exposes supplied Tooltip copy, or the same state-specific default copy used by Calendar when no copy is supplied. A selected availability interval does not expose a Tooltip: its filled selected range is already the current booking choice. `option` is reserved for a Time picker’s compact listbox options. Time picker options always use four equal columns; the picker may contract with its parent, but it must not auto-change its column count. An unselected option hover uses `Foreground/Divider` with readable primary text, while a selected option retains its on-emphasis text. It does not derive time ranges, calculate duration eligibility, fetch availability, hold inventory, decide who owns a booking, or submit a booking. A parent such as `calendar` owns grouping, date context, selection, and booking consequences.

**`time-picker`** — Controlled compact time selection overlay. It receives a stable id, visible label, current formatted value or placeholder, open and disabled state, ordered supplied time options, selected option, and open, close, and change callbacks through props. Its trigger follows the 40px field rhythm with one `Foreground/Border` boundary and the approved `Assets/Icons/arrow-down-sm.svg` on its native canvas; the arrow points up while the listbox is open. The listbox is positioned independently of document flow, has the shared overlay boundary and `Radius/LG`, and closes after an allowed selection or outside interaction. It does not calculate availability, translate time zones, derive durations, hold inventory, or submit a booking. Use `time-slot` when time choices need to remain visible in an availability surface.

**`number-stepper`** — A bounded integer control inside `form-field`: decrement action, visible current value, and increment action. Use it for a small, meaningful quantity such as lesson count. It accepts the Field family `size`, `shape`, `state`, and `status`; the selected presentation applies to the complete three-part control, not to the actions individually. Both actions use the approved circular `Assets/Icons/backup/minus-circle.svg` and `Assets/Icons/backup/plus-circle.svg` assets on their native 24px canvas; do not substitute plain plus/minus glyphs or scale these icons to 16px. A disabled action retains the same approved icon asset with the component's disabled visual treatment, alongside `Foreground/Disabled-text` control copy. Its outer control is one coherent surface; do not render three independent pill buttons. At a minimum or maximum, disable the relevant action and preserve an explanatory field-level message when the bound is not obvious. Do not use it to select a lesson package, date, time, price, currency amount, or unbounded numeric value.

**`upload`** — Controlled file-selection surface with supplied file or avatar presentation. Call `upload({ id, label, description, accept, multiple, files, variant, state, disabled, actionLabel, maxSize, avatar, avatarAlt, error, ariaLabel })`. Its `variant` is `dropzone` for a prominent drag-or-choose affordance, `trigger` for a compact row with a shared 32px Secondary Pill Button, or `avatar` for one profile image. Avatar uses a 120px circular target, accepts one JPG, JPEG, or PNG file by default, and receives its current controlled preview through `avatar` and `avatarAlt`; its empty, filled, uploading, and error states are all explicit. Existing photos receive a Change photo hover treatment; uploading locks the target and presents only a spinner; error preserves a retryable target and concise accessible recovery copy. It receives accepted file types, selection multiplicity, visible file records, and any parent-defined size policy through props; it never uploads bytes, crops or edits a photo, inspects file contents, determines validation rules, creates retry behavior, stores files, or calls an API. Each supplied file has a stable `id`, visible `name`, optional byte `size`, and `status` of `uploading | complete | error`; uploading optionally receives a `progress` number and error receives concise supplied recovery copy. Progress owns the only transient spinner. Completed state is communicated by the visible Uploaded metadata and a programmatic status announcement; error is communicated by its error surface, error copy, and a programmatic alert. Neither state adds a second check or error icon beside the file-level removal action. File type uses `Assets/Icons/file.svg`; removal uses the explicit `Assets/Icons/delete.svg` action, never a generic close glyph. It exposes a native file input with an accessible name and requests selection; `italki:upload-change` emits supplied selected-file records (and the selected `avatar` file for the avatar variant) and `italki:upload-remove` emits the supplied stable file `id`, after which the parent supplies the next controlled `files` or `avatar` state. Dropzone hover moves from white to `Foreground/Divider`; focus strengthens its own boundary to `Foreground/Title` without an outer ring; disabled uses quiet divider fill and never reacts. Use it for attachments, learner-provided documents, lesson preparation materials, and one profile photo. Do not use it for media editing, avatar cropping, proofing an upload, or a background transfer with no visible file record.

**`checkbox`** — Controlled multi-select choice primitive with supplied label, `checked` (`false`, `true`, or `mixed`), disabled state, accessible name, and change callback. `toggleMode` is `binary` by default and permits only `off ↔ on`. `mixed` is a parent-owned aggregate state, never a third normal click outcome: use `indeterminate` only for an explicit parent control that toggles `off ↔ mixed`, or `controlled` when the parent handles every state update itself. Its DS3.0 visual box is explicitly 18×18px with a component-specific 6px corner radius; this does not create a reusable Foundation radius token. Its 1px state border is included inside that 18px box, so changing between unchecked, checked, and mixed never moves the label or changes the control's occupied size. It sits 8px before a `Text/Body` label (14px / 500 / 20px). Unchecked default uses `Foreground/Divider` fill; unchecked hover uses `Foreground/Border` fill; unchecked disabled keeps the divider fill with a 1px `Foreground/Border` outline. Checked default and hover use `Gray/600` fill with the local `confirm-sm` mark rendered in white; checked disabled uses `Foreground/Border` fill. The indeterminate visual uses a white `Foreground/Border` outlined box with an 8×8px `Gray/600` square; hover strengthens its border to `Gray/600`, while its disabled form uses `Foreground/Divider` fill. Keyboard focus strengthens the same 1px control boundary to `Gray/700`; it never adds an outer ring or changes layout. Disabled labels use `Foreground/Disabled-text`. The parent owns the selected values, tri-state meaning, validation, submission, and state update; the checkbox never infers a mixed state or manages a collection. Prefer a native checkbox input. If a non-native implementation is required, use `role="checkbox"`, `aria-checked="true" | "false" | "mixed"`, keyboard activation, and visible focus feedback. Use a parent-provided choice group for related controls.

**`radio`** — Controlled single-select choice primitive with supplied `value`, visible label, optional supporting text, `checked`, disabled state, accessible name, and change callback. The circular indicator is fixed at 18×18px and sits 8px before a `Text/Body` label (14px / 500 / 20px). Unchecked uses a white surface with a 1px `Foreground/Border` boundary; hover and keyboard focus may strengthen that boundary to `Gray/700`, without an outer ring. Checked uses the `Gray/600` indicator with an 8px white inner dot; checked disabled uses `Foreground/Border`, while disabled labels use `Foreground/Disabled-text`. A radio may be shown inline, in a vertical group, or as a full-width option row when comparison needs a supporting line. It does not use the red CTA treatment, create a selectable card hierarchy, or become a pill/button group; use `segmented` or `chip` for compact button-like choices. The parent owns the selected value, option data, validation, submission, and state update. Prefer native radio inputs inside a named `fieldset` / `legend`; a custom implementation must use `role="radiogroup"`, `role="radio"`, `aria-checked`, a single tab stop, Space activation, and arrow-key movement that selects and focuses the next enabled option.

**Choice-control guidance** — For one explicit selection, use the documented `checkbox`, `radio`, `switch`, or `selection` contract rather than inventing a new card treatment. Field-like choice rows follow the input height and surface rules; compact short choices use the named `chip` contract when it fits. Selected state uses the black/gray emphasis system, never the brand-red CTA treatment. This is selection guidance, not an additional component.

**`checkbox-group / choice-group`** — Checkbox's controlled composite subcomponent for a named set of related `checkbox` or `radio` controls; it is documented within Checkbox rather than as a separate Catalog entry. It receives a visible `legend`, ordered supplied options (`id`, label, optional supporting text, disabled state), selected values or one selected value, layout (`vertical | inline`), optional helper or validation feedback, accessible description, and change callbacks through props. The legend has a 12px gap before the first group child. A checkbox-group may receive an optional select-all control; the parent derives and supplies its `off | on | mixed` state and selects or clears only enabled options on request. The group composes the existing Checkbox or Radio primitive rather than redrawing a second indicator, and owns only the shared `fieldset` / `legend`, local reading order, and feedback relationship. It must not add decorative outer chrome when spacing, a fieldset, or the containing surface already communicates the grouping, and it does not fetch options, infer selection, validate domain rules, persist values, submit a form, or decide product behavior. Use checkbox-group when zero or more independent choices can be selected; use radio-group for exactly one, and Select multiple when a compact field presentation is more appropriate. Do not wrap a self-labelled group in `form-field`.

**`form-label`** — 12px / 700, secondary text. Labels should stay visible; placeholder text must not be the only instruction.

**`error-message`** — 12–14px, `Status/Error`. Error inputs may use error border and helper text; avoid large red fills.

### Status & Feedback

**`feedback family`** — Generic semantic family for info, success, warning, and error states. It is implemented through the component contracts below; use semantic status tokens from this file and execution usage rules from `EXECUTION.md`. Product patterns must not redefine the same family.

**`alert`** — Persistent local status message. It receives semantic `tone` (`info | success | warning | error`), supplied title and optional description, closable state, optional supplied action slot, banner presentation, accessible label, and demo identifier through props. Its fixed local icon mapping is `info` → `Assets/Icons/info.svg`, `success` → `Assets/Icons/check.svg`, `warning` → `Assets/Icons/warning.svg`, and `error` → `Assets/Icons/error.svg`; callers cannot substitute a mismatched icon. `closable` provides the approved 24px `Assets/Icons/cross-sm.svg` dismissal control and asks the parent to own persistence or reappearance. It remains beside the affected context until dismissed or resolved; it does not become a toast, field-level error, confirmation dialog, or promotional callout. A banner is one concise page-region message and must not hide a required task action. The parent owns the actual condition, recovery action, and whether the message returns.

**`status-info`**, **`status-success`**, **`status-warning`**, and **`status-error`** are named semantic presentations within `feedback family`, not four unrelated components. Each receives supplied message, tone, optional supporting detail, and one optional recovery action. Use the matching `Status/{tone}` token for concise inline meaning and `Status/{tone}-surface` only for a persistent local block. They do not replace field validation, toast, loading, or a full-page result state.

**`toast`** — Transient, non-blocking outcome notice. It receives supplied tone, message, optional one-action recovery, duration, dismissal, and lifecycle callbacks through props. When closable, it uses the approved 24px `Assets/Icons/cross-sm.svg` dismissal control. Use it for a completed or recoverable background outcome that does not need to remain beside the affected task. It never replaces a local validation, blocked-state explanation, or failed payment recovery.

**`notification`** — Persistent product-level update with a supplied semantic tone (`info | success | warning | error`), title, optional description, optional one-action slot, and optional dismissal. Its fixed local icon mapping is `info` → `Assets/Icons/info.svg`, `success` → `Assets/Icons/check.svg`, `warning` → `Assets/Icons/warning.svg`, and `error` → `Assets/Icons/error.svg`; callers cannot substitute a mismatched icon. When closable, it uses the approved 24px `Assets/Icons/cross-sm.svg` dismissal control. Use it for an existing product notification that should remain available until it is dismissed or resolved, such as an availability reminder or a new lesson message. The parent owns priority, persistence, reappearance, and the action outcome. It is not the sole confirmation for booking, payment, or a recoverable error, and it does not replace a field error, Toast, Alert beside the affected task, or a result page.

**`result`** — Full-task outcome region with a supplied semantic tone (`success | info | warning | error`), title, optional description, one explicit next action, and optional secondary action. Its fixed local icon mapping is `success` → `Assets/Icons/check.svg`, `info` → `Assets/Icons/info.svg`, `warning` → `Assets/Icons/warning.svg`, and `error` → `Assets/Icons/error.svg`; callers cannot substitute a mismatched icon. Use it only after an underlying task outcome is confirmed, or when a blocked or recoverable failure needs its own clear recovery path. It must not be used for field-level feedback, a background acknowledgement, or a local in-context status message. The parent owns confirmation, routing, retry behavior, and the supplied next action; a success Result must never be shown before the underlying operation completes successfully.

**`skeleton`** — Non-interactive loading placeholder that reserves the structure of content known to be loading. Its model follows Panda’s composition-first API: `type: content` renders an optional `avatar`, optional `title`, and supplied paragraph `lines`, while the independent `avatar`, `button`, `input`, and `image` types reserve one matching control shape. `text` is paragraph-only and `card` combines a media block with title and paragraph structure. Use `width`, `height`, `lastLineWidth`, `shape` (`default | round | circle | square`), and `round` only to match already-known content geometry; `animated` enables the 1.4s neutral shimmer and must be disabled for reduced motion. Text and reduced-motion roots remain transparent: only their placeholder bars are visible. Skeleton receives no real content, loading request, data state, or retry behavior; the parent controls loading and replaces it with the finished structure. Use it only for first-load or known structural loading, not an error, empty state, indefinite progress, or content whose shape is unknown.

**`pagination`** — Collection-local page navigation primitive. It receives an ordered supplied `pages` list of positive page numbers plus optional `ellipsis`, supplied current page, previous/next disabled state, accessible label, and demo identifier through props. Its page list must include the supplied current page. The current page uses `Foreground/Divider` (#F5F6F9) fill, `Foreground/Title` text, and `Radius/Full` Pill geometry; it is not a dark reversed CTA. Previous and next use the approved 16px `arrow-left-sm` and `arrow-right-sm` assets. The parent supplies total data, visible page calculation, requested-page callback, route behavior, page size, quick-jump, and any omission rule for one-page collections. Pagination controls neither data fetching nor global route navigation, and it must not be confused with `stepper` or application navigation.

## Related Documents

- `DESIGN.md`: product principles and product direction.
- `PATTERNS.md`: business-object composition and supplied data relationships.
- `EXECUTION.md`: page-level application of these contracts, including:

- breakpoint behavior and collapsing strategy
- task-driven content behavior and CTA wording rules
- product behavior constraints
- page-level and component-level responsive execution rules
- implementation-facing UI behavior rules
- semantic structure, keyboard behavior, dynamic-status announcements, and reduced-motion execution
- locale formatting, timezone behavior, original or translated content, and language-state handling

### Hard Constraints

Visual constraints that remain in this file:

- Use only icon files from this kit's `Assets/Icons/` directory.
- Do not use heavy shadows, glassmorphism, neon glow, glossy effects, or layered elevation.
- Do not make every tag colorful. Accessory colors must remain secondary.
- Do not place colored soft tags on gray backgrounds. On gray surfaces, use white tags with borders.
- Do not make all buttons pills.
- Do not make all badges pills.
- Do not use pure black as default body text. Use `Foreground/Primary-text`.
- Prefer DS3.0 token names such as `Primary/Main`, `Foreground/Title`, `Background/Page`, and `Status/Error` over raw hex values.
- Bind to semantic tokens, not primitive ramps.

### Surface Layering Rules

When AI or engineers choose background layers, use surface role before decoration. Do not stack multiple surfaces just because they look visually pleasant.

| Layer Role            | Default Surface                 | Typical Use                                              |
| --------------------- | ------------------------------- | -------------------------------------------------------- |
| Page Floor            | `Background/Page`               | Whole page background                                    |
| Primary Card Surface  | `Background/Card`               | Teacher cards, booking cards, review cards, filter cards |
| Internal Neutral Zone | `Foreground/Divider`            | Light internal grouping zones inside white cards         |
| Hovered Neutral Zone  | `Background/Hover`              | Hover state for neutral internal option blocks           |
| Floating Surface      | `Background/Card`               | Popovers, dropdowns, modal content, sticky panels        |
| Status Surface        | Matching semantic surface token | Info, success, warning, error feedback blocks            |

Rules:

- Do not place white card surfaces inside other white card surfaces unless there is a strong structural reason.
- If a parent surface is already white, prefer dividers, spacing, and neutral internal zones before introducing another white block.
- Use semantic status surfaces only for true status or feedback content, not for decorative variety.
- On gray page backgrounds, let white cards carry the main content weight.
- Neutral internal grouping should stay subtle and should not visually compete with the primary card surface.
- If AI is unsure which surface to use, prefer the flatter and lighter option unless the content is clearly a floating layer or a semantic status block.
