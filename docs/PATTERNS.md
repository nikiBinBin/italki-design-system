# PATTERNS.md

## Purpose

This document defines italki product patterns: stable business compositions and object relationships built from the Foundations and component contracts in `COMPONENTS.md`. Patterns may own product meaning, supplied data relationships, and local composition. They do not create a new visual language, replace reusable component contracts, or own page-level responsive behavior and accessibility execution from `EXECUTION.md`.

`DESIGN.md` takes precedence for product direction. `COMPONENTS.md` takes precedence for a reusable component's anatomy, props, states, and component-level accessibility. This document defines only the product relationship between those components and never repeats their generic contract.

## Rule Priority

For stable product objects and their supplied data relationships, this document is authoritative. It defers product direction to `DESIGN.md`, reusable UI contracts to `COMPONENTS.md`, and page-level responsive behavior, interaction execution, and validation to `EXECUTION.md`.

## Product Composition Direction

Use a calm, familiar learning workspace with purposeful variation in density. A page is not a catalogue of components or a stack of equally weighted cards.

- Begin with the learner's or teacher's current object, state, or task. Avoid a generic welcome hero when a lesson, request, booking, or exercise is the real reason for the visit.
- Give each region one role: operational status, current object, task workspace, compact supporting context, or optional continuation.
- Prefer rows, grouped content, dividers, and constrained widths before adding a card boundary. Cards represent discrete objects or bounded task surfaces.
- Pair dense decision data with a quieter adjacent region when both serve one task. Stack only when the learner must complete content in sequence.
- Repeated modules must vary by actual role and density. Do not repeat the same large white card, filled action, or title treatment for every region.
- Never expose component names, design-system labels, or internal rule names in a product screen.

## Authenticated Workspace Shell

### workspace-header

`workspace-header` is the authenticated shell assembly. It composes the reusable `top-nav` surface with supplied sidebar trigger, brand anchor, teacher-search entry surface, and utility/account cluster. It is not a generic container for page actions. The expanded search surface owns its mask, search panel, and scroll lock.

The resting desktop frame is light and compact. New authenticated specifications use `workspace-header` with `sidebar-navigation`; they do not recreate legacy global text navigation such as `Teachers`, `Lessons`, or `Community`.

### sidebar-navigation

`sidebar-navigation` is the persistent authenticated workspace pattern. It composes the reusable `sidebar` surface from `COMPONENTS.md` with product-owned destinations, relationship collections, account access, user state, and entitlement data through its adapter. The reusable Sidebar contract owns dimensions, local interaction states, and responsive presentation; this pattern owns the product data, destination meaning, and information relationships.

- The normal shell uses the standard italki wordmark. An approved Plus shell composes that wordmark with the supplied `logo-italki-plus` mark in `Gradient/Pro`; it does not recolor the standard brand mark or introduce another promotional gradient.
- `Home`, `Search Teachers`, `My Lessons`, `My Calendar`, `Learn`, `Progress`, `Mira`, and `More` retain their supplied product order. `More` is an inline continuation, not a second footer. Chats and Lessons are product-owned relationship sections; their supplied open state and data rows are not inferred by the Sidebar.
- Product-owned relationship sections use supplied section actions and data rows rather than a new card treatment. A lesson row is not a chat row: it starts with the supplied lesson count, followed by a divider, then the supplied teacher and course label; it does not show an avatar or country flag.
- Relationship labels are not disclosure controls unless product state and a full accessible disclosure contract are supplied. Navigation previews are data rows, not nested cards.
- Adapter data owns destination availability, active route, entitlement, account amount, avatar, activity rows, unread status, and all navigation outcomes. The pattern does not infer any of them.

## Discovery And Teacher Evaluation

### teacher-discovery-search and filter

`teacher-discovery-search` composes the reusable `search-bar` with supplied learning goal or keyword, price or budget context, and a search continuation. It does not decide filters, ranking, or results.

`filter` is the teacher-discovery evaluation-refinement pattern. Its desktop form is a two-column sheet: teacher origin and additional languages; price range; availability; lesson category; and teacher type. It composes `button`, `chip`, `checkbox`, `slider`, `tabs`, `selection`, and approved icons. It may be presented from a supplied Filter trigger in a Drawer or Modal-like task sheet; the Pattern owns this composition, not a new generic `filters-panel` component. The sheet uses a quiet gray body surface (`Foreground/Divider`); its title bar, action bar, and each filter category region use white surfaces so sections remain distinct without introducing nested borders.

The parent supplies all options, selected values, disabled or unavailable choices, price bounds and currency formatting, time-zone context, whether a learner can use a Plus feature, and the apply, reset, close, and result-refresh callbacks. `filter` never invents an available teacher, translates a query into a filter, calculates price ranges, changes a teacher ranking, saves preferences, or fetches results.

- `Teacher from` and `Also speak` use reversible local `chip` choices. Any long country or language collection hands off to the documented Search or Combobox behavior; it is not rendered as an unbounded static chip wall.
- `Price range` combines a supplied distribution preview with the shared dual-handle `slider`; its minimum and maximum values are supplied display values, not locally calculated pricing.
- `Availability` uses `tabs` only to switch the supplied general and specific-time modes. General availability composes `chip` and time-range `selection` controls; exact date selection hands off to `date-picker` and `time-slot`.
- `Lesson category` is a two-level refinement: its parent `checkbox` reveals its child `chip` choices when checked and collapses them when unchecked. Child chips are independently reversible: selecting an active chip again clears it rather than producing another state. `Teacher type` uses the shared `checkbox` and `selection` contracts; its two supplied 80px choice rows expose role evidence with the documented selected outline and corner marker rather than becoming independent Card variants.
- On small screens the same groups stack in one supplied Drawer or Sheet and preserve group order. A sticky apply or reset action, if product supplies one, belongs to the invoking surface rather than this Pattern's core content.

### teacher-discovery

`teacher-discovery` is the product-level result and comparison composition. It brings together supplied search context, active reversible filters, a vertically ordered teacher-result list, pagination, and one compact teacher preview rail. Each result composes the documented `teacher-card` reading order; the preview rail composes the shared `avatar`, `video`, `calendar`, and Button contracts. Hover or focus may update the supplied preview target locally, but it never changes ranking, applies a filter, fetches availability, or opens booking without a parent-supplied callback.

The parent owns result count, ordering, result records, selected filter values, preview state, search submission, pagination, save state, pricing, availability, and all booking outcomes. On narrow layouts the preview becomes a normal block after the result list and no selection, price, or availability meaning is implied by its position.

### teacher-card

`teacher-card` is the core teacher comparison pattern. It receives supplied identity, teaching context, trust evidence, price and duration context, optional language summary, optional saved state, and one local continuation. It composes `avatar`, optional country flag, supplied name, a supplied teacher-type label (`Community Tutor` or `Professional Teacher`) with an approved 24px local role asset, `tag`, compact evidence text, an optional icon-only save action, the shared `dropdown-menu` for secondary more actions, and one supplied booking continuation or whole-card destination. The desktop search-result form is a wide horizontal surface: a 120px Avatar and country marker with rating and completed-lessons evidence at left; name, teacher type, language facts, a two-line-clamped teaching summary, and supplied specialist or professional tags (for example `Business` and `Test Preparation`) in the flexible center; then price, supplied next availability in `Status/Info`, a 32px save action, local 32px pill `Book lesson` continuation, and 32px More action at the bottom of that same reading column. It is a white `Radius/LG` (12px) surface with 24px internal padding. A static card may use one light outer border; a whole-card link is borderless at rest and has the single approved subtle hover/focus lift.

The supplied `a1Mode` controls two search-result compositions; it is not inferred from a teacher record.

- `a1Mode="off"` is the compact comparison card: identity, language facts, concise supplied summary, trust evidence, price/availability and one `Book lesson` continuation. It does not reserve space for beginner-specific content.
- `a1Mode="on"` adds optional supplied beginner-focus tags using the established info or warning tag treatments, and an optional `See beginner lessons` continuation after the concise summary. This form may grow vertically but preserves the same identity rail, price/availability, save affordance, and booking continuation.

The card never labels a teacher as beginner-suitable, produces beginner tags, derives availability, or changes its own mode. Search/product state owns `a1Mode` and all supplied content.

The reading order is:

1. identity: image or initials fallback, name, role or teaching context, and optional country marker;
2. teaching fit: one concise supplied summary followed by a short, ordered set of comparison tags;
3. trust evidence: supplied rating, completed lessons, response time, or similarly comparable facts;
4. price and trial context: one supplied price, duration, and trial or lesson meaning kept together;
5. one continuation: a profile view, selection, or other supplied next step.

Do not make both the whole card and its main continuation independently navigate to the same destination. The parent chooses either a whole-card profile destination or one local booking continuation, and supplies saved state and its callback separately. When the local continuation begins booking, its visible label is `Book lesson`; profile reading remains the supplied whole-card destination rather than a competing primary button. Repeated teacher cards use secondary or ghost actions by default; only an actual selected, hovered, or task-specific continuation may receive stronger emphasis. The pattern does not rank teachers, calculate rating or price, infer a teacher's fit, decide availability, fetch data, localize content, or persist saved state. Responsive arrangement and result-list behavior belong in `EXECUTION.md`.

`teacher-card.recommendation-group` is the compact recommendation composition for two to four peer teachers in one supplied collection. On desktop it commonly presents three narrow cards in a row. Each card retains only the comparison minimum: 56px supplied identity, role, rating plus completed-lessons evidence, one concise language fact, a two-line fit cue, and trial price context. Its local continuation is labelled `Book lesson` and uses the documented secondary hierarchy; do not repeat a page-level Red CTA across the recommendation set. The parent owns the collection label, recommendation reason, ordering, eligibility, impression tracking, and empty state; the pattern does not imply that the listed teachers are ranked, sponsored, or available unless supplied product data says so.

### teacher identity patterns

- `teacher-avatar` uses the generic `avatar` component with a supplied approved image or documented fallback identity.
- `teacher-identity` adds concise supplied teaching role or language context.
- `teacher-language-summary` groups supplied language and proficiency facts with controlled overflow.
- `trust-metrics` and `trust-metrics.compact-rail` present supplied decision evidence; they do not calculate ratings, retention, or performance.
- `teacher-tags` is the ordered group of short supplied comparison facts. It wraps before clipping; outside white cards it stays neutral, while a white card may use at most two colored soft tags.
- `lesson-badge` is a compact non-interactive lesson marker using the `tag / badge` visual system. It receives one supplied type, duration, level, or status and never becomes a filter.

### lesson-card

`lesson-card` is the compact lesson-list summary for one supplied lesson or lesson package. It composes `card`, a 48px `avatar`, one approved direct 16px status-icon asset, supplied teacher name, supplied lesson label, and one supplied metadata line. Status meaning is conveyed by supplied copy together with its semantic strip; do not replace the registered icon with an inline or masked substitute. Its reading order is the 40px status strip first, then the teacher and lesson context. The base surface is exactly 652px wide and 120px high with `Radius/LG` (12px), a 40px full-width strip, and a 48px identity row offset 16px from the horizontal edges and 15px below the strip. It does not become a generic teacher-comparison card.

The parent supplies the lesson or group-class type, teacher identity, current status, countdown or expiry copy, localized date and time, duration, package lesson count, and any accessibility label. `lesson-card` never calculates time remaining, derives an expiry date, decides an action is required, determines package balance, schedules a lesson, or changes lesson state.

- `upcoming` supports one supplied countdown (for example `In 11h 45m`) or neutral `Upcoming` status. It uses `Accessory/Accessory-2` with `Status/Info` status text. Group class changes only supplied lesson label and time copy and is the one unoutlined surface in the set.
- `waiting` uses `Accessory/Accessory-1` for a supplied pending state.
- `action-required` uses `Accessory/Accessory-3`. It must name the issue through supplied copy rather than relying on the color alone.
- `canceled` uses the neutral `Foreground/Border` strip, not an Error surface, because it reports a completed outcome rather than asking the learner to resolve a failure.
- `active-package` is 128px high and uses `Accessory/Accessory-4`. An optional supplied expiry notice is a secondary `Status/Error` message on the right of the same status strip; it does not add a second card action. `completed` returns to the 120px base height with the same `Accessory/Accessory-4` strip.

The card is a summary and destination context, not a command surface. A parent may supply a whole-card destination or a separate local continuation, but does not introduce an extra primary action inside this 120px summary. Repeated cards preserve their parent-supplied order and may stack in a lesson list; responsive list behavior belongs in `EXECUTION.md`.

## Teacher Detail

### teacher-detail

`teacher-detail` is the product-level teacher profile composition. It presents supplied identity and trust evidence, local section navigation, about and teaching-fit information, lesson offerings, supplied availability, student review evidence, similar-teacher links, and a bounded booking rail. It composes `avatar`, `tag`, `tabs`, `time-slot`, `calendar`, `rate`, `video`, `link`, and Button contracts rather than creating profile-specific variants of them.

The parent supplies every identity field, role, language and interest tag, introduction, insight, lesson, price, time-zone-aware availability, review, recommendation, online status, response-time, and booking state. The Pattern does not calculate ratings, infer availability or teacher suitability, rank similar teachers, reserve a slot, price a lesson, or submit a booking. On narrow layouts the booking rail follows the detail content as a normal section; a product-owned sticky booking action may be introduced only with its full behavior contract.

`detail-hero` presents supplied identity, location, teaching focus, introduction, and core trust evidence before deeper detail. It may compose teacher identity, language summary, and trust metrics but does not own saved state, booking, price calculation, or data retrieval.

`detail-section` holds one supplied topic such as fit, teaching focus, lesson style, reviews, or pricing. It receives heading, content slots, optional local action, density, and surface choice. It may be unframed or use one approved card surface; it is not a generic page wrapper.

`review-card` presents concise learner proof. `pricing-row` keeps lesson type, description, price, and duration together. Both are evidence patterns and do not own teacher-detail page order.

## Booking And Payment

`booking-panel` is the bounded booking commitment pattern. It keeps supplied lesson choice, date/time context, price and duration, booking state, and one next action together. Desktop may use a constrained sticky side surface; mobile uses the documented sticky action-bar handoff. It does not decide availability, hold inventory, calculate price, or submit the booking.

`booking-offer-summary` keeps supplied price, duration or trial meaning, and optional availability together without owning the booking CTA.

`payment-method` is the payment-stage selection pattern for supplied available payment routes, default method, unavailable or verification state, and one optional add-method continuation. It never stores card data, tokenizes payment details, calculates eligibility, or submits a charge.

`order-summary` keeps supplied monetary line items, discount or credit, price-change state, and final amount due together. It receives preformatted currency values and never calculates totals, tax, fees, coupons, or wallet balance.

## Mira

`mira module family` is the intentional pattern for personalized recommendation, learning continuation, progress, community, offer, or campaign entry. Mira may use approved illustration or stronger accent color, but creates one focal interruption only. It never turns a normal teacher card, booking panel, form, or feedback surface into a campaign surface, and it cannot replace required task or recovery content.

## Related Documents

- Visual foundations, Content Style, and component contracts: `COMPONENTS.md`
- Product direction and decision principles: `DESIGN.md`
- Responsive behavior, interaction state, accessibility behavior, and page recipes: `EXECUTION.md`
