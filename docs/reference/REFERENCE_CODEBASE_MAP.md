# Codebase Reference Component Map

> Purpose: provide a current codebase map and component-boundary guide for shared UI work. This is a read-only reference for component analysis, not a design-system authority or a destination for new pages.

## 1. System Snapshot

| Area | Current role | Reference implication |
| --- | --- | --- |
| `apps/alnitak` | Modern Next.js App Router application. | Existing product adapters may consume shared UI primitives; this is not a default landing place for new pages. |
| `apps/mintaka` | Feature-rich Pages Router application in maintenance mode. | Existing product adapters may consume shared UI primitives; page placement is outside this map. |
| `packages/components` | Cross-application React package. | Reference point for generic UI, infrastructure-aware shared components, and exported component contracts. |
| `packages/components/ui` | Shared UI entry point. Most existing modules re-export Panda UI. | Reference point for unstyled Headless primitives with no product dependency. |
| `packages/actions`, `packages/data`, `packages/interface`, `packages/utils` | API, constants, domain types, and utilities. | A Headless UI primitive must not import these packages. Product adapters may. |

The repository is a Next.js 14, React 18, TypeScript monorepo with Tailwind, CSS Modules, Jotai, Panda UI, `@italki/i18n`, and `@italki/icons`. It supports 17 languages and RTL, so every shared interactive component needs predictable keyboard behavior, semantic state, and text-expansion tolerance.

## 2. Existing UI Baseline

`@repo/components/ui` already exposes Panda wrappers for the standard visual controls:

- Input and selection: `Button`, `Input`, `Select`, `Radio`, `Checkbox`, `Switch`, `Slider`, `DatePicker`, `Form`, `Selection`.
- Navigation and overlay: `Tabs`, `Menu`, `Dropdown`, `Popup`, `Popover`, `Drawer`, `Modal`, `Tooltip`, `Pagination`.
- Feedback and display: `Alert`, `Badge`, `Progress`, `Skeleton`, `Spin`, `Table`, `Timeline`, `Tag`, `Avatar`.

Do not create a parallel generic `Button`, `Modal`, `Drawer`, `Tabs`, `Input`, or visual card library. Prefer Panda for the visual control and a Headless primitive only where the shared state, keyboard behavior, and ARIA contract are currently reimplemented across product features.

## 3. Component Ownership Model

```text
Panda visual controls
        |
Headless interaction primitives
        |
Product adapters
        |
Pages and route composition
```

| Layer | Owns | Must not own |
| --- | --- | --- |
| Panda visual control | Visual control surface, basic disabled/focus behavior. | Product data, route state, analytics. |
| Headless primitive | Controlled state, keyboard behavior, semantic attributes, slots/render props. | API calls, translations, Jotai atoms, routes, permission checks, tracking, product copy. |
| Product adapter | Data mapping, labels, icon choice, business restrictions, analytics, routes, loading and errors. | Reimplementation of an existing generic interaction contract. |
| Page | Task flow, information order, data fetching, page-specific layout. | A new shared interaction pattern without evidence of reuse. |

## 4. Shared Headless Primitives

### 4.1 `SelectionGroup`

Path: `packages/components/ui/SelectionGroup`

Use for a controlled single- or multi-selection set. It supplies `role`, `aria-checked`, disabled state, maximum selection enforcement, and roving keyboard focus. Consumers render the actual Panda button, card, chip, or row themselves.

Reference consumers observed in the codebase:

- `apps/alnitak/app/[lang]/(booking)/book/[teacherId]/components/DurationPills.tsx`
- `apps/alnitak/app/[lang]/(booking)/book/[teacherId]/components/TimeSlotButton.tsx`
- `apps/alnitak/app/[lang]/(learning)/learner_personality_quiz/components/SingleSelectQuestion.tsx`
- `apps/alnitak/app/[lang]/(learning)/learner_personality_quiz/components/MultiSelectQuestion.tsx`
- Learning-preference goal, topic, level, and schedule option sections.
- Teacher-search filter choices when the selection behavior matches the contract.

### 4.2 `Listbox`

Path: `packages/components/ui/Listbox`

Use for a controlled active option in a flat menu or suggestion result. It owns Arrow/Home/End/Enter/Space/Escape behavior and `aria-activedescendant`. The consumer owns fetching, filtering, overlay placement, open state, rendering, and selection persistence.

Reference consumers observed in the codebase:

- `apps/*/components/Navigation/Header/TeacherSearchSlot/AISearchZone/SearchAutoCompleteDropdown.tsx`
- `apps/alnitak/app/[lang]/(booking)/book/[teacherId]/BookingLanguageSelector.tsx`
- Teacher-search keyword, language, and filter menus that currently implement keyboard selection locally.

### 4.3 `Navigation`

Path: `packages/components/ui/Navigation`

The package contains controlled navigation-item behavior plus semantic shell pieces: `NavigationHeader`, `NavigationMenuTrigger`, `NavigationSidebar`, `NavigationDrawer`, `NavigationList`, and `NavigationSection`.

The product adapter provides item data, active route, permissions, links, analytics, unread state, account data, and the visual surface. The Headless primitive adds current-item semantics, roving focus, keyboard movement, and open/collapsed shell attributes.

Reference consumers observed in the codebase:

- `packages/components/Nav/Sidebar/menu/NavMenuRow.tsx`
- `apps/*/components/Navigation/SidebarMenu/Sidebar/Sidebar.tsx`
- Shared desktop/mobile sidebar adapters.

Do not move pinned-menu storage, route matching, chat data, lesson data, wallet data, or Lightyear events into `packages/components/ui/Navigation`.

## 5. Reuse Decision Table

| Need | Use or build | Reason |
| --- | --- | --- |
| Standard button, input, checkbox, radio, switch, tabs, dialog, drawer, tooltip | Reuse Panda UI. | Already supplied and visually standardized. |
| Choice cards, option chips, duration pills, time slots, quiz answers | Use `SelectionGroup` plus a product visual adapter. | Same controlled selection and keyboard model; visual treatment can vary. |
| Search suggestion list, compact language picker, filter result menu | Use `Listbox` plus Panda `Popup` or `Dropdown`. | Shared listbox behavior; fetching and positioning remain local. |
| Sidebar/menu item rows | Use `Navigation` plus a product adapter. | Shared current-state and keyboard behavior; business menu data stays local. |
| Teacher card, booking panel, lesson card, package card, review card | Keep as product assemblies. | They own domain data, eligibility, price/availability, routes, and task hierarchy. |
| Search results, booking flow, teacher detail, lesson detail | Keep as page recipes. | They coordinate multiple domain assemblies around a task path. |

## 6. Candidate Backlog

These are candidates only. Create them after confirming at least two current consumers with the same semantic contract.

| Candidate | Contract | Likely consumers | Priority |
| --- | --- | --- | --- |
| `FormField` | Stable `label`, description, required state, error message, and `aria-describedby` wiring around one supplied control. No validation engine or submission logic. | Booking, learning preference, payment, profile edit. | Next |
| `Autocomplete` adapter | Compose an input owner, `Listbox`, and controlled open state. Does not fetch suggestions or position its overlay. | Teacher search and keyword search. | After `Listbox` adoption |
| `ReorderableList` | Controlled item order, keyboard reorder contract, focus restoration, and drag adapter hooks. | Pinned sidebar menus. | Validate with sidebar first |
| `Disclosure` | Controlled trigger/panel attributes and focus-safe collapse state. | Show-more sections and compact content expansions. | Only if Panda `Collapse` is not sufficient |

Avoid creating generic `Card`, `TeacherCard`, `BookingPanel`, `ProfileCard`, `FilterPanel`, or `SearchBar` primitives. These names conceal product-specific data ownership and cause the shared package to accumulate route, API, and analytics dependencies.

## 7. Implementation Rules

1. Expose state through controlled props such as `value`, `activeValue`, `open`, `activeId`, and matching callbacks. Do not read atoms, URLs, local storage, or context that encodes product state.
2. Use render props, `get*Props` helpers, slots, or a consumer-supplied Panda control to keep visual styling outside the primitive.
3. Do not import `@/`, `@repo/actions`, `@italki/i18n`, `@italki/lightyear`, Jotai, app routes, or business interfaces from `packages/components/ui` primitives.
4. Use `@italki/icons` in adapters when an icon is needed. A primitive should normally accept icon content through children or a render slot.
5. Keep translated labels and formatted dates, times, currency, and counts in the adapter. A primitive receives display-ready children and stable IDs/values.
6. Use Panda `Button` for button semantics in consuming code. The primitive should not establish a competing visual button system.
7. Treat mobile and desktop layout as a consumer concern unless the primitive owns an interaction boundary such as roving focus or a listbox state.

## 8. Accessibility Contract

Every new shared interactive primitive must define and test:

- Keyboard entry, Arrow/Home/End behavior where applicable, activation, disabled behavior, and escape behavior.
- Semantic roles and ARIA relationships, including selected/current/expanded/active-descendant state.
- Focus behavior after an invoked surface closes or an item changes state.
- Meaning beyond color or icon alone.
- Long translated labels, RTL layout, and mobile target sizes in the consuming adapter.

## 9. Test and Migration Checklist

Before adding a primitive:

1. Name at least two consumers and state the common semantic contract.
2. Confirm Panda does not already solve the problem at the needed level.
3. Keep all business imports in the product adapter.
4. Add unit tests for controlled state, keyboard navigation, disabled behavior, and ARIA output.
5. Migrate one low-risk consumer first, then verify visual parity and analytics before migrating others.
6. Do not delete a legacy adapter until its route-specific states, feature flags, and tracking responsibilities have a documented destination.

## 10. Source References

- `openspec/project.md`: repository context and technical conventions.
- `openspec/codemaps/frontend.md`: application and route map.
- `openspec/codemaps/packages.md`: shared package map.
- `openspec/UI_COMPONENTS_SPEC.md`: Panda UI availability and usage rules.
- `openspec/DESIGN_SYSTEM_RULES.md`: tokens, responsive behavior, and implementation policy.
- `packages/components/ui/README.md`: concise API scope for the current Headless primitives.
