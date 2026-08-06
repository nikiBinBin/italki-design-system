import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import childProcess from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const manifest = JSON.parse(read("catalog-runtime/contracts.json"));
const tokensCSS = read("catalog-runtime/tokens.css");
const componentCSS = read("catalog-runtime/italki-ui.css");
const fixtureSource = fs.readFileSync(path.join(root, "maintenance", "fixtures", "fixtures.js"), "utf8");
const catalog = read("index.html");
const catalogStyle = read("catalog.css");
const componentsDoc = read("docs/COMPONENTS.md");
const componentApi = JSON.parse(read("catalog-runtime/component-api.json"));
const foundationApi = JSON.parse(read("catalog-runtime/foundation-api.json"));
const productionMappingStatuses = new Set(["aligned", "adapter", "composed", "gap", "legacy"]);
const productionTokenMappingStatuses = new Set(["aligned", "override", "gap"]);

assert(catalog.includes('<link rel="stylesheet" href="catalog.css" />'), "Catalog shell styles must live outside the document");
assert(!catalog.includes("<style>"), "Catalog must not embed its presentation CSS");
assert.deepEqual(Object.keys(componentApi.components).sort(), Object.keys(manifest.components).sort(), "Generated component API must index every registered component");
assert.deepEqual(componentApi.usagePolicy.allowedFamilies, ["Color", "Typography", "Spacing", "Radius", "Shadow", "Motion"], "Component API must constrain consumers to registered Foundation token families");
const catalogColorTokens = Object.keys(manifest.tokens).filter((name) => name.startsWith("--ui-color-"));
assert.deepEqual(Object.keys(foundationApi.colors).sort(), catalogColorTokens.sort(), "Foundation API must index every Catalog color token");
for (const name of catalogColorTokens) {
  const mapping = manifest.productionTokenMappings?.color?.[name];
  const apiMapping = foundationApi.colors[name];
  assert(mapping, `Production color mapping is required for: ${name}`);
  assert(productionTokenMappingStatuses.has(mapping.status), `Production color mapping has an invalid status for: ${name}`);
  assert(typeof mapping.projectOverride === "string" && mapping.projectOverride.length > 0, `Production color mapping must record the project override location for: ${name}`);
  assert(typeof mapping.notes === "string" && mapping.notes.length > 0, `Production color mapping must explain the implementation boundary for: ${name}`);
  assert.equal(apiMapping.value, manifest.tokens[name], `Foundation API color value drifted for: ${name}`);
  assert.deepEqual(
    { status: apiMapping.status, pandaToken: apiMapping.pandaToken, projectOverride: apiMapping.projectOverride, notes: apiMapping.notes },
    mapping,
    `Foundation API production mapping drifted for: ${name}`
  );
}
assert.deepEqual(Object.keys(manifest.productionTokenMappings?.color || {}).sort(), catalogColorTokens.sort(), "Every Catalog color token must have exactly one production mapping");
for (const [name, contract] of Object.entries(manifest.components)) {
  const apiContract = componentApi.components[name];
  const implementation = manifest.productionMappings?.[name];
  assert.deepEqual(apiContract.props, contract.acceptedProps, `Component API props drifted for: ${name}`);
  assert.deepEqual(apiContract.enums, contract.props || {}, `Component API enums drifted for: ${name}`);
  assert.deepEqual(apiContract.states, contract.requiredStates || [], `Component API states drifted for: ${name}`);
  assert.deepEqual(Object.keys(apiContract.defaults), contract.acceptedProps, `Component API defaults drifted for: ${name}`);
  assert.deepEqual(apiContract.allowedTokens, componentApi.usagePolicy.allowedFamilies, `Component API token policy drifted for: ${name}`);
  assert(implementation, `Production mapping is required for: ${name}`);
  assert(productionMappingStatuses.has(implementation.status), `Production mapping has an invalid status for: ${name}`);
  assert(typeof implementation.preferredImport === "string" && implementation.preferredImport.length > 0, `Production mapping must declare a preferred import for: ${name}`);
  assert(typeof implementation.productionComponent === "string" && implementation.productionComponent.length > 0, `Production mapping must declare a production component for: ${name}`);
  assert(typeof implementation.notes === "string" && implementation.notes.length > 0, `Production mapping must explain the implementation boundary for: ${name}`);
  assert.deepEqual(apiContract.implementation, implementation, `Component API production mapping drifted for: ${name}`);
}

assert.deepEqual(Object.keys(manifest.productionMappings || {}).sort(), Object.keys(manifest.components).sort(), "Every registered component must have exactly one production mapping");

const migrated = new Set(manifest.migration?.migrated || []);
const pending = new Set(manifest.migration?.pending || []);
assert.equal(migrated.size, manifest.migration?.migrated?.length, "Migration registry cannot contain duplicate migrated components");
assert.equal(pending.size, manifest.migration?.pending?.length, "Migration registry cannot contain duplicate pending components");
for (const name of migrated) assert(!pending.has(name), `Component cannot be both migrated and pending: ${name}`);
assert.deepEqual([...migrated].sort(), Object.keys(manifest.components).sort(), "Every executable contract must be marked migrated, and every migrated component needs a contract");
const resolvedButton = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "button"], { encoding: "utf8" });
assert.equal(resolvedButton.status, 0, "Migrated component lookup must succeed");
assert.equal(JSON.parse(resolvedButton.stdout).component, "button", "Component lookup must resolve the requested component");
const resolvedSelect = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "select"], { encoding: "utf8" });
assert.equal(resolvedSelect.status, 0, "Migrated Select lookup must succeed");
assert.equal(JSON.parse(resolvedSelect.stdout).component, "select", "Component lookup must resolve Select");
const resolvedRadio = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "radio"], { encoding: "utf8" });
assert.equal(resolvedRadio.status, 0, "Migrated Radio lookup must succeed");
assert.equal(JSON.parse(resolvedRadio.stdout).component, "radio", "Component lookup must resolve Radio");
const resolvedCheckboxGroup = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "checkbox-group"], { encoding: "utf8" });
assert.equal(resolvedCheckboxGroup.status, 0, "Migrated Checkbox group lookup must succeed");
assert.equal(JSON.parse(resolvedCheckboxGroup.stdout).component, "checkbox-group", "Component lookup must resolve Checkbox group");
const resolvedSelection = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "selection"], { encoding: "utf8" });
assert.equal(resolvedSelection.status, 0, "Migrated Selection lookup must succeed");
assert.equal(JSON.parse(resolvedSelection.stdout).component, "selection", "Component lookup must resolve Selection");
const resolvedDatePicker = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "date-picker"], { encoding: "utf8" });
assert.equal(resolvedDatePicker.status, 0, "Migrated Date picker lookup must succeed");
assert.equal(JSON.parse(resolvedDatePicker.stdout).component, "date-picker", "Component lookup must resolve Date picker");
const resolvedTooltip = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "tooltip"], { encoding: "utf8" });
assert.equal(resolvedTooltip.status, 0, "Migrated Tooltip lookup must succeed");
assert.equal(JSON.parse(resolvedTooltip.stdout).component, "tooltip", "Component lookup must resolve Tooltip");
const resolvedModal = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "modal"], { encoding: "utf8" });
assert.equal(resolvedModal.status, 0, "Migrated Modal lookup must succeed");
assert.equal(JSON.parse(resolvedModal.stdout).component, "modal", "Component lookup must resolve Modal");
const resolvedPopup = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "popup"], { encoding: "utf8" });
assert.equal(resolvedPopup.status, 0, "Migrated Popup lookup must succeed");
assert.equal(JSON.parse(resolvedPopup.stdout).component, "popup", "Component lookup must resolve Popup");
const resolvedPopconfirm = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "popconfirm"], { encoding: "utf8" });
assert.equal(resolvedPopconfirm.status, 0, "Migrated Popconfirm lookup must succeed");
assert.equal(JSON.parse(resolvedPopconfirm.stdout).component, "popconfirm", "Component lookup must resolve Popconfirm");
const resolvedDivider = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "divider"], { encoding: "utf8" });
assert.equal(resolvedDivider.status, 0, "Migrated Divider lookup must succeed");
assert.equal(JSON.parse(resolvedDivider.stdout).component, "divider", "Component lookup must resolve Divider");
const resolvedAvatar = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "avatar"], { encoding: "utf8" });
assert.equal(resolvedAvatar.status, 0, "Migrated Avatar lookup must succeed");
assert.equal(JSON.parse(resolvedAvatar.stdout).component, "avatar", "Component lookup must resolve Avatar");
const resolvedBadge = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "badge"], { encoding: "utf8" });
assert.equal(resolvedBadge.status, 0, "Migrated Badge lookup must succeed");
assert.equal(JSON.parse(resolvedBadge.stdout).component, "badge", "Component lookup must resolve Badge");
const resolvedBreadcrumb = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "breadcrumb"], { encoding: "utf8" });
assert.equal(resolvedBreadcrumb.status, 0, "Migrated Breadcrumb lookup must succeed");
assert.equal(JSON.parse(resolvedBreadcrumb.stdout).component, "breadcrumb", "Component lookup must resolve Breadcrumb");
const resolvedCard = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "card"], { encoding: "utf8" });
assert.equal(resolvedCard.status, 0, "Migrated Card lookup must succeed");
assert.equal(JSON.parse(resolvedCard.stdout).component, "card", "Component lookup must resolve Card");
const resolvedAlert = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "alert"], { encoding: "utf8" });
assert.equal(resolvedAlert.status, 0, "Migrated Alert lookup must succeed");
assert.equal(JSON.parse(resolvedAlert.stdout).component, "alert", "Component lookup must resolve Alert");
const resolvedTabs = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "tabs"], { encoding: "utf8" });
assert.equal(resolvedTabs.status, 0, "Migrated Tabs lookup must succeed");
assert.equal(JSON.parse(resolvedTabs.stdout).component, "tabs", "Component lookup must resolve Tabs");
const resolvedPagination = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "pagination"], { encoding: "utf8" });
assert.equal(resolvedPagination.status, 0, "Migrated Pagination lookup must succeed");
assert.equal(JSON.parse(resolvedPagination.stdout).component, "pagination", "Component lookup must resolve Pagination");
const resolvedRate = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "rate"], { encoding: "utf8" });
assert.equal(resolvedRate.status, 0, "Migrated Rate lookup must succeed");
assert.equal(JSON.parse(resolvedRate.stdout).component, "rate", "Component lookup must resolve Rate");
const resolvedSidebar = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "sidebar"], { encoding: "utf8" });
assert.equal(resolvedSidebar.status, 0, "Migrated Sidebar lookup must succeed");
assert.equal(JSON.parse(resolvedSidebar.stdout).component, "sidebar", "Component lookup must resolve Sidebar");
const resolvedFooter = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "footer"], { encoding: "utf8" });
assert.equal(resolvedFooter.status, 0, "Migrated Footer lookup must succeed");
assert.equal(JSON.parse(resolvedFooter.stdout).component, "footer", "Component lookup must resolve Footer");
const resolvedStatistic = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "statistic"], { encoding: "utf8" });
assert.equal(resolvedStatistic.status, 0, "Migrated Statistic lookup must succeed");
assert.equal(JSON.parse(resolvedStatistic.stdout).component, "statistic", "Component lookup must resolve Statistic");
const resolvedTable = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "table"], { encoding: "utf8" });
assert.equal(resolvedTable.status, 0, "Migrated Table lookup must succeed");
assert.equal(JSON.parse(resolvedTable.stdout).component, "table", "Component lookup must resolve Table");
const resolvedTimeline = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "timeline"], { encoding: "utf8" });
assert.equal(resolvedTimeline.status, 0, "Migrated Timeline lookup must succeed");
assert.equal(JSON.parse(resolvedTimeline.stdout).component, "timeline", "Component lookup must resolve Timeline");
const resolvedTopNav = childProcess.spawnSync(process.execPath, [path.join(root, "maintenance", "scripts", "check-component.mjs"), "top-nav"], { encoding: "utf8" });
assert.equal(resolvedTopNav.status, 0, "Migrated Top nav lookup must succeed");
assert.equal(JSON.parse(resolvedTopNav.stdout).component, "top-nav", "Component lookup must resolve Top nav");

for (const [token, value] of Object.entries(manifest.tokens)) {
  assert(tokensCSS.includes(`${token}: ${value};`), `Missing or incorrect token: ${token}`);
}

for (const token of ["--ui-shadow-md", "--ui-shadow-lg", "--ui-shadow-xl"]) {
  assert(manifest.tokens[token], `Shadow foundation token is missing: ${token}`);
}
for (const token of ["--ui-shadow-card", "--ui-shadow-stroke-card", "--ui-shadow-card-hover"]) {
  assert(manifest.tokens[token], `Card shadow token is missing: ${token}`);
}
for (const token of ["--ui-shadow-button", "--ui-shadow-panel", "--ui-shadow-control", "--ui-shadow-control-hover", "--ui-shadow-surface", "--ui-shadow-floating", "--ui-shadow-dialog"]) {
  assert(!componentCSS.includes(token), `Deprecated shadow token must not be consumed: ${token}`);
}
assert(componentCSS.includes(".ui-modal { --ui-modal-width: 520px") && componentCSS.includes("box-shadow: var(--ui-shadow-xl)"), "Modal must consume Shadow/XL");
assert(componentCSS.includes(".ui-select__menu") && componentCSS.includes("box-shadow: var(--ui-shadow-lg)"), "Floating menus must consume Shadow/LG");
assert(componentCSS.includes(".ui-card {") && componentCSS.includes("box-shadow: var(--ui-shadow-card);"), "Card must consume Shadow/Card at rest");
assert(componentCSS.includes(".ui-card.is-outlined { border: 0; box-shadow: var(--ui-shadow-stroke-card); }") , "Outlined Card must consume Shadow/Stroke card");
assert(componentCSS.includes(".ui-card.is-interactive:hover, .ui-card.is-interactive:focus-visible { box-shadow: var(--ui-shadow-card-hover); }"), "Interactive Card must consume Shadow/Card-Hover");

assert(!/#[0-9A-Fa-f]{3,8}\b/.test(componentCSS), "Component CSS must not contain raw hexadecimal colors");
assert(!/\brgb\(/.test(componentCSS), "Component CSS must not contain raw rgb colors");
assert(!/#[0-9A-Fa-f]{3,8}\b|\brgb\(/.test(read("catalog-runtime/italki-ui.js")), "Component implementation must not contain raw colors");
assert(!/#[0-9A-Fa-f]{3,8}\b|\brgb\(/.test(fixtureSource), "Visual fixtures must not contain raw colors");
assert(!/Assets\/(?!Icons\/|Flags\/)/.test(read("catalog-runtime/italki-ui.js")), "Catalog runtime may only use registered local asset roots");
assert(!/Assets\/(?!Icons\/|Flags\/)/.test(catalog), "Catalog may only reference registered local asset roots");
assert(catalog.includes('const CATALOG_SECTION_ORDER = Object.freeze({ variants: 1, features: 2, states: 3 });'), "Catalog must define one shared component-section order");
assert(catalog.includes('function sortCatalogSections(root)'), "Catalog must sort component sections through the shared taxonomy");
assert(catalog.includes('data-catalog-section="${sectionKind}"'), "Catalog sections must expose their taxonomy for verification");
assert(catalog.includes('root.querySelectorAll(".component-doc-grid, .button-detail-grid")'), "Catalog must apply the shared taxonomy to Button and standard component pages");
assert(catalog.includes('const CATALOG_SECTION_TITLES = Object.freeze({'), "Catalog must use the named section taxonomy rather than page-specific ordering");
assert(!/dsBlock\("Status"/.test(catalog), "Catalog section titles must not use ambiguous Status; use Semantic variants or States");
const fieldFamily = ["form-field", "text-input", "textarea", "select", "combobox", "number-stepper", "date-picker"];
for (const component of fieldFamily) {
  const contract = manifest.components[component];
  assert.deepEqual(contract.props?.size, [32, 40, 48], `${component} must expose the shared Field size scale`);
  assert.deepEqual(contract.props?.status, ["default", "warning", "error"], `${component} must separate Field validation status from interaction state`);
  assert(contract.props?.state?.includes("focus") && contract.props?.state?.includes("disabled"), `${component} must expose Field focus and disabled interaction states`);
}
for (const component of ["form-field", "text-input", "select", "combobox", "number-stepper", "date-picker"]) {
  assert.deepEqual(manifest.components[component].props?.shape, ["default", "rounded", "pill"], `${component} must expose the shared Field shape scale`);
}
assert(componentCSS.includes(".ui-date-picker--32 .ui-date-picker__trigger") && componentCSS.includes(".ui-date-picker--pill .ui-date-picker__trigger"), "Date picker must consume the shared Field size and shape presentation");
assert(componentCSS.includes(".ui-textarea--32") && !componentCSS.includes(".ui-textarea--rounded"), "Textarea must use the shared Field size scale without duplicate shape presentation");
assert(componentCSS.includes(".ui-number-stepper.is-warning") && componentCSS.includes(".ui-number-stepper.is-error"), "Number stepper must consume shared Field validation surfaces");
assert(!/button:focus-visible,\s*input:focus-visible/.test(catalogStyle), "Catalog must not impose a global focus outline over component contracts");
assert(componentCSS.includes(".ui-checkbox__box { width: 18px; height: 18px;") && componentCSS.includes("border-radius: 6px; background: var(--ui-color-divider);"), "Checkbox must retain its explicit 18px component geometry and registered 6px exception");
assert(componentCSS.includes(".ui-slider.has-tooltip .ui-slider__row { padding-top: var(--ui-space-4); }"), "Slider tooltip spacing must consume a registered Foundation token");
assert(catalogStyle.includes(".select-detail .component-doc-block, .combobox-detail .component-doc-block { overflow: visible; }"), "Combobox Catalog examples must not clip their shared Select menu");
assert(!catalogStyle.includes(".button-size-switch"), "Catalog presentation controls must call shared Segmented control instead of recreating button styling");
assert(!catalogStyle.includes(".icon-search-field"), "Catalog icon search must call the shared Search implementation");
assert(!catalogStyle.includes(".sidebar-logo-switch"), "Catalog Sidebar variant switch must call the shared Segmented control");
assert(!catalogStyle.includes(".overview-overlay-preview--anchored .ui-popup"), "Catalog must not locally restyle shared Popup previews");
assert(componentCSS.includes('[data-ui-preview-stage="anchored"] .ui-popup'), "Shared UI CSS must own anchored preview presentation");
assert(componentCSS.includes('[data-ui-preview-stage="combobox-overlay"] [data-component="combobox"].is-open .ui-select__menu'), "Shared UI CSS must own open Combobox preview presentation");
for (const selector of ["ui-date-picker", "ui-search", "ui-select", "ui-text-input", "ui-textarea", "ui-time-picker"]) {
  const focusRule = componentCSS.match(new RegExp(`\\.${selector}[^}]*?(?:focus-within|focus-visible|\\.is-focus)[^}]*\\}`, "g")) || [];
  assert(focusRule.some((rule) => rule.includes("border-color: var(--ui-color-title)")), `${selector} focus must use the title-color boundary`);
  assert(focusRule.every((rule) => !rule.includes("var(--ui-shadow-field-focus)")), `${selector} focus must not add an outer glow`);
}
assert(componentCSS.includes(".ui-checkbox:focus-visible .ui-checkbox__box { border-color: var(--ui-color-title); box-shadow: none; }"), "Checkbox focus must strengthen its own boundary without an outer ring");
assert(componentCSS.includes(".ui-radio:focus-visible .ui-radio__indicator { border-color: var(--ui-color-title); box-shadow: none; }"), "Radio focus must strengthen its own boundary without an outer ring");
assert(componentCSS.includes(".ui-tooltip { --ui-tooltip-x: -50%; --ui-tooltip-y: 4px; width: max-content; max-width: min(240px, calc(100vw - 48px)); min-width: 0; overflow: visible;"), "Tooltip surfaces must not create scroll containers");
for (const selector of ["ui-button", "ui-chip", "ui-tag", "ui-checkbox", "ui-checkbox-group", "ui-radio", "ui-selection", "ui-date-picker", "ui-tooltip", "ui-modal", "ui-popup", "ui-popconfirm", "ui-divider", "ui-avatar", "ui-flag", "ui-avatar-group", "ui-badge", "ui-breadcrumb", "ui-card", "ui-alert", "ui-tabs", "ui-pagination", "ui-rate", "ui-sidebar", "ui-footer", "ui-statistic", "ui-table", "ui-timeline", "ui-top-nav", "ui-slider", "ui-panel", "ui-search", "ui-select", "ui-switch", "ui-drawer", "ui-form-field", "ui-text-input", "ui-textarea", "ui-number-stepper", "ui-stepper", "ui-progress", "ui-toast", "ui-notification", "ui-result", "ui-skeleton", "ui-dropdown-menu", "ui-disclosure", "ui-segmented-control", "ui-time-slot", "ui-time-picker", "ui-calendar"]) {
  assert(!new RegExp(`^\\s*\\.${selector}(?:\\b|--)[^{]*\\{`, "m").test(catalogStyle), `Catalog must not own a root CSS rule for migrated ${selector}`);
}

const runtime = { window: {} };
vm.createContext(runtime);
vm.runInContext(read("catalog-runtime/contracts.js"), runtime, { filename: "contracts.js" });
vm.runInContext(read("catalog-runtime/italki-ui.js"), runtime, { filename: "italki-ui.js" });
vm.runInContext(fixtureSource, runtime, { filename: "fixtures.js" });
const ui = runtime.window.ITalkiUI;
assert(ui, "Catalog runtime must expose one runtime API");
assert(runtime.window.ITalkiUIFixtures, "Catalog runtime must expose contract fixtures");

for (const [name, contract] of Object.entries(manifest.components)) {
  const runtimeContract = runtime.window.ITalkiUIContracts.components[name];
  assert(runtimeContract, `Runtime contract missing: ${name}`);
  assert.deepEqual(JSON.parse(JSON.stringify(runtimeContract)), {
    acceptedProps: contract.acceptedProps,
    props: contract.props,
    ...(contract.subcomponents ? { subcomponents: contract.subcomponents } : {})
  }, `Runtime contract drifted for: ${name}`);
}

const fixtures = [
  ["button", ui.button({ label: "Continue", state: "focus" })],
  ["chip", ui.chip({ label: "Conversation", checked: true })],
  ["tag", ui.tag({ label: "Native", removable: true })],
  ["checkbox", ui.checkbox({ checked: "mixed" })],
  ["checkbox-group", ui.checkboxGroup({ id: "contract-checkbox-group", label: "Topics", options: ["Conversation", "Grammar"], selected: ["Conversation"], selectAll: true })],
  ["radio", ui.radio({ label: "Online lesson", value: "online", checked: true })],
  ["radio", ui.radioGroup({ label: "Lesson length", options: ["30 min", "45 min"], selected: "45 min" })],
  ["selection", ui.selection({ label: "Trial lesson", value: "trial", selected: true, contentType: "standard", selectionMode: "radio" })],
  ["selection", ui.selection({ label: "Basic plan", selected: true, leading: '<img src="Assets/Icons/16px/topic-sm.svg" alt="" />' })],
  ["selection", ui.selectionGroup({ label: "Cadence", selectionMode: "radio", options: ["Weekly", "Monthly"], selected: "Weekly" })],
  ["date-picker", ui.datePicker({ id: "contract-date-picker", label: "Lesson date", days: [{ label: 15, value: "2026-07-15" }], selected: "2026-07-15", open: true })],
  ["tooltip", ui.tooltip({ id: "contract-tooltip", content: "Supporting text", open: true })],
  ["modal", ui.modal({ id: "contract-modal", title: "Dialog", body: "Content", open: true })],
  ["modal", ui.modal({ id: "contract-modal-inline", title: "Color guidance", body: "Content", stage: "inline", open: true })],
  ["popup", ui.popup({ id: "contract-popup", title: "Details", body: "Content", open: true })],
  ["popconfirm", ui.popconfirm({ id: "contract-popconfirm", title: "Confirm", open: true })],
  ["divider", ui.divider({ label: "Details", orientation: "left", icon: "Assets/Icons/16px/morning-sm.svg" })],
  ["avatar", ui.avatar({ name: "Maya Chen", initials: "MC", size: 48, variant: "empty" })],
  ["avatar", ui.avatar({ name: "italki", size: 48, variant: "logo" })],
  ["avatar", ui.flag({ countryCode: "us", countryLabel: "USA", size: 24 })],
  ["avatar", ui.avatarGroup({ members: [{ name: "Maya Chen", initials: "MC" }], overflow: 1, size: "xs" })],
  ["badge", ui.badge({ type: "count", anchor: "<span>Inbox</span>", count: 8 })],
  ["badge", ui.badge({ type: "status", tone: "success", label: "Available" })],
  ["breadcrumb", ui.breadcrumb({ items: [{ label: "Home" }, { label: "Lessons" }, { label: "Lesson details", current: true }] })],
  ["card", ui.card({ title: "Conversation prompts", body: "<p>Content</p>" })],
  ["card", ui.card({ title: "Lesson materials", interactive: true, outlined: false })],
  ["alert", ui.alert({ tone: "info", title: "Lesson reminder", description: "Your lesson starts soon." })],
  ["tabs", ui.tabs({ id: "contract-tabs", ariaLabel: "Lesson details", items: [{ id: "overview", label: "Overview", panel: "Content" }, { id: "reviews", label: "Reviews", panel: "More content" }] })],
  ["pagination", ui.pagination({ pages: [1, 2, 3], current: 2 })],
  ["rate", ui.rate({ value: 2.5, allowHalf: true, label: "Lesson rating" })],
  ["sidebar", ui.sidebar({ id: "contract-sidebar", items: [{ id: "home", label: "Home", icon: "Assets/Icons/dashboard.svg" }], ariaLabel: "Workspace sidebar" })],
  ["footer", ui.footer({ id: "contract-footer", columns: [{ heading: "Explore", links: ["Teachers"] }], copyright: "© italki" })],
  ["statistic", ui.statistic({ title: "Lessons completed", value: "128" })],
  ["table", ui.table({ id: "contract-table", columns: [{ id: "teacher", label: "Teacher" }], rows: [{ id: "maya", cells: [{ content: "Maya Chen", rowHeader: true }] }], ariaLabel: "Teacher lessons" })],
  ["timeline", ui.timeline({ id: "contract-timeline", items: [{ id: "booked", tone: "success", title: "Lesson booked", description: "15 July · 14:30" }], ariaLabel: "Lesson events" })],
  ["top-nav", ui.topNav({ id: "contract-top-nav", leading: ui.topNavContext({ id: "contract-top-nav-context", selected: { id: "english", label: "English Teachers", flag: "Assets/Flags/us.svg" }, options: [{ id: "english", label: "English Teachers", flag: "Assets/Flags/us.svg" }] }), center: ui.topNavSearch({ id: "contract-top-nav-search", placeholder: "Search teachers" }), trailing: ui.button({ label: "Book lessons", size: 40, shape: "pill" }) })],
  ["slider", ui.slider({ value: 50, tooltip: true })],
  ["slider", ui.sliderRange({ lower: 20, upper: 70 })],
  ["slider", ui.sliderVertical({ value: 60 })],
  ["panel", ui.panel({ title: "Lesson details", body: "Content", divider: true })],
  ["search", ui.search({ value: "French", clearable: true })],
  ["select", ui.select({ id: "contract-select", label: "Language", options: ["English", "French"], selected: "English", clearable: true })],
  ["switch", ui.switchControl({ checked: true })],
  ["drawer", ui.drawer({ id: "contract-drawer", title: "Filters", body: "Content", open: true })],
  ["form-field", ui.formField({ id: "contract-field", label: "Email", control: ui.textInput({ id: "contract-field" }) })],
  ["text-input", ui.textInput({ id: "contract-input", leadingIcon: "Assets/Icons/search.svg" })],
  ["textarea", ui.textarea({ id: "contract-textarea", showCount: true, maxLength: 120 })],
  ["number-stepper", ui.numberStepper({ id: "contract-stepper", value: 2, min: 1, max: 8 })],
  ["combobox", ui.combobox({ id: "contract-combobox", label: "Language", options: ["English"], open: true })],
  ["upload", ui.upload({ id: "contract-upload", label: "Lesson documents", accept: ".pdf", files: [{ id: "brief", name: "lesson-brief.pdf", size: 1250000, status: "complete" }] })],
  ["stepper", ui.stepper({ id: "contract-steps", items: ["Course", "Time"], current: 1 })],
  ["progress", ui.progress({ value: 62 })],
  ["toast", ui.toast({ tone: "success", title: "Saved" })],
  ["notification", ui.notification({ tone: "info", title: "Lesson reminder", description: "Your lesson starts soon." })],
  ["result", ui.result({ tone: "success", title: "Lesson booked", description: "Your lesson with Maya is confirmed." })],
  ["skeleton", ui.skeleton({ type: "card" })],
  ["dropdown-menu", ui.dropdownMenu({ id: "contract-dropdown", items: ["Message"], open: true })],
  ["disclosure", ui.disclosure({ id: "contract-disclosure", title: "Details", content: "Content" })],
  ["segmented-control", ui.segmentedControl({ id: "contract-segmented", options: ["Week", "Month"] })],
  ["time-slot", ui.timeSlot({ label: "09:00", state: "selected" })],
  ["time-picker", ui.timePicker({ id: "contract-time-picker", slots: ["09:00", "10:30"], open: true })],
  ["calendar", ui.calendar({ id: "contract-calendar", dates: [{ id: "mon", label: "Mon", date: "15" }], rows: [{ id: "09-00", label: "09:00", slots: [{ state: "available" }] }] })],
  ["calendar", ui.calendar({ id: "contract-lesson-record", variant: "lesson-record", recordTitle: "My lessons", recordStats: [{ label: "Total lesson count", value: "1" }], recordMonths: [{ id: "jul", label: "Jul", weeks: [Array(7).fill("empty")] }] })],
  ["popover", ui.popover({ id: "contract-popover", title: "Details", body: "Content", open: true })]
];

for (const [component, markup] of fixtures) {
  assert(markup.includes(`data-component=\"${component}\"`), `Fixture does not render registered component: ${component}`);
}
const numberStepperMarkup = ui.numberStepper({ id: "contract-stepper-icons", value: 2, min: 1, max: 8 });
assert(numberStepperMarkup.includes("Assets/Icons/minus-circle.svg"), "Number stepper must render the approved circular decrement icon");
assert(numberStepperMarkup.includes("Assets/Icons/plus-circle.svg"), "Number stepper must render the approved circular increment icon");
assert.match(ui.numberStepper({ size: 32, shape: "pill" }), /ui-number-stepper--32 ui-number-stepper--pill/, "Number stepper must support compact Pill presentation");
assert.match(ui.numberStepper({ size: 48, shape: "rounded" }), /ui-number-stepper--48 ui-number-stepper--rounded/, "Number stepper must support spacious Rounded presentation");
assert.match(ui.modal({ id: "contract-modal-inline-stage", title: "Color guidance", body: "Content", stage: "inline" }), /ui-modal-stage--inline/, "Modal must support an inline trigger stage without a demo surface");
assert(componentCSS.includes(".ui-number-stepper__icon { width: 24px; height: 24px;"), "Number stepper icons must retain their native 24px canvas");
assert(componentCSS.includes(".ui-number-stepper--32 { min-height: 32px;") && componentCSS.includes(".ui-number-stepper--48 { min-height: 48px;"), "Number stepper must provide its documented three-height scale");
assert(componentCSS.includes(".ui-number-stepper__action:disabled { color: var(--ui-color-disabled);"), "Disabled number-stepper actions must use the disabled color token");
assert(componentCSS.includes(".ui-number-stepper__action:disabled .ui-number-stepper__icon { filter: grayscale(1); opacity: .25; }"), "Disabled number-stepper icons must receive the disabled visual treatment");
assert.throws(() => ui.button({ label: "Invalid", variant: "rainbow" }), /does not accept/, "Invalid enum must be rejected");
assert.throws(() => ui.button({ label: "Invalid", extraClass: "one-off-style" }), /does not accept prop/, "Undeclared UI props must be rejected");
assert.throws(() => ui.button({ label: "Invalid", leadingIcon: "https://example.com/icon.svg" }), /Unapproved asset/, "External icon must be rejected");
assert(!/\b(?:attributes|extraClass|componentName|removeAttributes)\s*:/.test(catalog), "Catalog cannot use an implementation escape-hatch prop");

for (const asset of read("catalog-runtime/italki-ui.js").matchAll(/Assets\/(?:Icons|Flags)\/[A-Za-z0-9_./-]+/g)) {
  assert(fs.existsSync(path.join(root, asset[0])), `Missing registered asset: ${asset[0]}`);
}

const catalogRenderedAssets = Array.from(
  catalog.matchAll(/(?:src=|(?:icon|leadingIcon|trailingIcon):\s*)["'](Assets\/(?:Icons|Flags|Images\/avatars)\/[A-Za-z0-9_./-]+)/g),
  (match) => match[1]
);
const fixtureAssets = Array.from(
  fixtureSource.matchAll(/Assets\/(?:Icons|Flags|Images\/avatars)\/[A-Za-z0-9_./-]+/g),
  (match) => match[0]
);
for (const [sourcePath, assets] of [["index.html", catalogRenderedAssets], ["maintenance/fixtures/fixtures.js", fixtureAssets]]) {
  for (const asset of assets) assert(fs.existsSync(path.join(root, asset)), `Missing registered asset in ${sourcePath}: ${asset}`);
}

// The Icon Library page renders the generated manifest; regenerate with
// maintenance/scripts/build-icon-manifest.mjs whenever Assets/Icons changes.
{
  const manifestSource = read("catalog-runtime/icon-manifest.js");
  const listed = new Set(Array.from(manifestSource.matchAll(/"(Assets\/Icons\/[^"]+)"/g), (match) => match[1]));
  const excluded = new Set(["Assets/Icons/back.svg", "Assets/Icons/arrow-right-1.svg", "Assets/Icons/arrow-up-1.svg"]);
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : entry.name.endsWith(".svg") ? [path.relative(root, full)] : [];
  });
  for (const asset of walk(path.join(root, "Assets", "Icons"))) {
    if (excluded.has(asset)) continue;
    assert(listed.has(asset), `Icon on disk but missing from icon-manifest.js (run build-icon-manifest.mjs): ${asset}`);
  }
  for (const asset of listed) {
    assert(fs.existsSync(path.join(root, asset)), `icon-manifest.js lists a file not on disk: ${asset}`);
  }
}

const stateFixtures = runtime.window.ITalkiUIFixtures.build(ui).entries;
for (const [component, contract] of Object.entries(manifest.components)) {
  const documentedStates = new Set((stateFixtures[component] || []).map((fixture) => fixture.state));
  for (const state of contract.requiredStates) {
    assert(documentedStates.has(state), `Visual fixture missing required state: ${component}.${state}`);
  }
}

assert.match(ui.button({ label: "Continue", iconOnly: true, ariaLabel: "Continue" }), /aria-label="Continue"/, "Icon-only buttons require an accessible name");
assert.match(ui.button({ label: "Add lesson", leadingIcon: "Assets/Icons/add.svg" }), /has-leading-icon/, "Labelled leading-icon Buttons must expose the shared 8px leading inset hook");
assert.match(ui.button({ label: "View profile", trailingIcon: "Assets/Icons/arrow-right-sm.svg" }), /has-trailing-icon/, "Labelled trailing-icon Buttons must expose the shared 8px trailing inset hook");
assert.match(ui.segmentedControl({ id: "segmented-pill", options: ["Week", "Month"] }), /ui-segmented-control--pill/, "Segmented control must default to Pill");
assert.match(ui.segmentedControl({ id: "segmented-rounded", options: ["Week", "Month"], shape: "rounded" }), /ui-segmented-control--rounded/, "Segmented control must support the Rounded variant");
assert.match(ui.checkbox({ checked: "mixed" }), /role="checkbox"[^>]*aria-checked="mixed"/, "Checkbox must expose mixed state through ARIA");
assert.match(ui.checkboxGroup({ id: "accessibility-group", label: "Topics", options: ["Conversation"] }), /<fieldset[^>]*data-component="checkbox-group"/, "Checkbox group must expose a semantic fieldset");
assert.match(ui.radio({ label: "Online lesson", value: "online", checked: true }), /role="radio"[^>]*aria-checked="true"/, "Radio must expose a checked radio state through ARIA");
assert.match(ui.radioGroup({ label: "Lesson length", options: ["30 min", "45 min"], selected: "45 min" }), /role="radiogroup"[^>]*aria-label="Lesson length"/, "Radio group must expose a named radiogroup");
assert(componentCSS.includes(".ui-selection__feature { width: 32px; height: 32px;") && componentCSS.includes("border-radius: var(--ui-radius-md); background: var(--ui-color-card); }"), "Selection leading feature must use the shared rounded surface token");
assert.match(ui.selectionGroup({ label: "Lesson type", options: ["Private lesson"] }), /role="radiogroup"[^>]*aria-label="Lesson type"/, "Selection group must expose a named radiogroup");
assert.match(ui.footer({ columns: [{ heading: "Explore", links: ["Teachers"] }], socialLinks: [{ label: "YouTube", icon: "Assets/Icons/youtube.svg" }] }), /data-component="footer"/, "Footer must expose its shared component root");
const groupedFooter = ui.footer({ columns: [{ groups: [{ heading: "Language teachers", links: ["English teachers"] }, { heading: "More", links: ["FAQ"] }] }], utilities: ui.select({ id: "footer-contract-language", label: "Language", options: ["English"], selected: "English", size: 40, shape: "rounded" }) });
assert.match(groupedFooter, /class="ui-footer__group"/, "Footer must support semantic link groups within one supplied column");
assert.match(groupedFooter, /data-component="select"/, "Footer utilities must be able to consume the shared Select component");
assert.match(ui.datePicker({ id: "date-accessibility", label: "Lesson date", days: [{ label: 15, value: "2026-07-15" }], open: true }), /role="dialog"[^>]*aria-label="Lesson date calendar"/, "Date picker must expose a named calendar dialog");
assert.match(ui.tooltip({ id: "tooltip-accessibility", content: "Supporting text" }), /aria-describedby="tooltip-accessibility"/, "Tooltip trigger must expose an accessible description relationship");
assert.match(ui.tooltip({ id: "tooltip-accessibility", content: "Supporting text" }), /role="tooltip"/, "Tooltip must expose a tooltip role");
assert.match(ui.modal({ id: "modal-accessibility", title: "Dialog", body: "Content", open: true }), /role="dialog"[^>]*aria-modal="true"/, "Modal must expose a modal dialog role");
assert.match(ui.popup({ id: "popup-accessibility", title: "Details", body: "Content", open: true }), /role="dialog"[^>]*aria-labelledby="popup-accessibility-title"/, "Popup must expose a named non-modal dialog surface");
assert.match(ui.popconfirm({ id: "popconfirm-accessibility", title: "Confirm", open: true }), /role="alertdialog"[^>]*aria-labelledby="popconfirm-accessibility-title"/, "Popconfirm must expose a named confirmation surface");
assert.match(ui.divider({ type: "vertical", ariaLabel: "Teacher metadata separator" }), /role="separator"[^>]*aria-orientation="vertical"[^>]*aria-label="Teacher metadata separator"/, "Divider must expose separator semantics and orientation");
assert.match(ui.avatar({ name: "Maya Chen", initials: "MC", size: 48, variant: "empty" }), /role="img"[^>]*aria-label="Maya Chen"/, "Avatar must expose a person name");
assert.match(ui.avatar({ name: "italki", size: 48, variant: "logo" }), /ui-avatar--logo[\s\S]*logo-italki-logomark-white\.svg/, "Logo avatar must use the registered italki logomark asset");
assert.match(ui.flag({ countryCode: "us", countryLabel: "USA", size: 24 }), /alt="USA"/, "Flag must expose a readable country label when it is standalone");
assert.match(ui.avatarGroup({ members: [{ name: "Maya Chen", initials: "MC" }], size: "xs", ariaLabel: "Teacher group" }), /role="group"[^>]*aria-label="Teacher group"/, "Avatar group must expose a named group");
assert.match(ui.badge({ type: "count", anchor: "<span>Inbox</span>", count: 8, ariaLabel: "8 unread inbox messages" }), /role="status"[^>]*aria-label="8 unread inbox messages"/, "Badge count must expose an accessible status name");
assert.match(ui.badge({ type: "status", tone: "success", label: "Available" }), /role="status"[^>]*aria-label="Available"/, "Badge status must expose its readable status name");
assert.match(ui.breadcrumb({ ariaLabel: "Teacher path", items: [{ icon: "Assets/Icons/home-01.svg", ariaLabel: "Home" }, { label: "Lesson details", current: true }] }), /<nav[^>]*aria-label="Teacher path"/, "Breadcrumb must expose a named navigation region");
assert.match(ui.breadcrumb({ items: [{ label: "Home" }, { label: "Lesson details", current: true }] }), /aria-current="page"/, "Breadcrumb must expose the supplied current item");
assert.match(ui.card({ title: "Conversation prompts", body: "<p>Content</p>" }), /<article[^>]*data-component="card"/, "Static Card must expose an article root");
assert.match(ui.card({ title: "Lesson materials", interactive: true, outlined: false, ariaLabel: "Open lesson materials" }), /<button[^>]*data-component="card"[^>]*aria-label="Open lesson materials"/, "Interactive Card must expose one accessible button root");
assert.match(ui.alert({ tone: "success", title: "Saved" }), /role="alert"[^>]*aria-label="Saved"/, "Alert must expose a readable alert role");
assert.match(ui.alert({ tone: "success", title: "Saved" }), /Assets\/Icons\/check\.svg/, "Success Alert must use the approved check icon");
assert.match(ui.alert({ tone: "info", title: "New message", closable: true }), /Assets\/Icons\/cross-sm\.svg/, "Closable Alert must use the approved 24px close icon");
assert.match(ui.toast({ title: "Saved", closable: true }), /Assets\/Icons\/cross-sm\.svg/, "Closable Toast must use the approved 24px close icon");
assert.match(ui.notification({ title: "New message", closable: true }), /Assets\/Icons\/cross-sm\.svg/, "Closable Notification must use the approved 24px close icon");
assert.match(ui.tabs({ id: "tabs-accessibility", ariaLabel: "Lesson details", items: [{ id: "overview", label: "Overview", panel: "Content" }] }), /role="tablist"[^>]*aria-label="Lesson details"/, "Tabs must expose a named tablist");
assert.match(ui.tabs({ id: "tabs-accessibility", ariaLabel: "Lesson details", items: [{ id: "overview", label: "Overview", panel: "Content" }] }), /role="tabpanel"/, "Tabs must expose a related tabpanel");
assert.match(ui.pagination({ pages: [1, 2, 3], current: 2, ariaLabel: "Results pages" }), /<nav[^>]*aria-label="Results pages"/, "Pagination must expose a named navigation region");
assert.match(ui.pagination({ pages: [1, 2, 3], current: 2 }), /aria-current="page">2/, "Pagination must expose the current page");
assert.match(ui.rate({ value: 2.5, allowHalf: true, label: "Lesson rating" }), /role="radiogroup"[^>]*aria-label="Lesson rating"/, "Rate must expose a named radiogroup");
assert.match(ui.rate({ value: 2.5, allowHalf: true }), /aria-checked="true"/, "Rate must expose checked score through ARIA");
assert.match(ui.sidebar({ id: "sidebar-accessibility", items: [{ id: "home", label: "Home", icon: "Assets/Icons/dashboard.svg" }], ariaLabel: "Workspace sidebar" }), /<aside[^>]*data-component="sidebar"[^>]*aria-label="Workspace sidebar"/, "Sidebar must expose a named complementary navigation surface");
assert.match(ui.sidebar({ id: "sidebar-accessibility", items: [{ id: "more", label: "More", icon: "Assets/Icons/more.svg", more: true }], moreItems: [{ id: "community", label: "Community", icon: "Assets/Icons/community.svg" }] }), /role="menu"/, "Sidebar More must expose a menu when supplied");
assert.match(ui.statistic({ title: "Lessons completed", value: "128" }), /role="group"[^>]*aria-label="Lessons completed, 128"/, "Statistic must expose a readable grouped value");
assert.match(ui.table({ id: "table-accessibility", columns: [{ id: "teacher", label: "Teacher" }], rows: [{ id: "maya", cells: [{ content: "Maya Chen", rowHeader: true }] }], ariaLabel: "Teacher lessons" }), /<section[^>]*data-component="table"[^>]*aria-label="Teacher lessons"/, "Table must expose a named region");
assert.match(ui.table({ id: "table-accessibility", columns: [{ id: "teacher", label: "Teacher" }], rows: [{ id: "maya", cells: [{ content: "Maya Chen", rowHeader: true }] }] }), /<th scope="col"/, "Table must preserve semantic column headers");
assert.match(ui.timeline({ id: "timeline-accessibility", items: [{ id: "booked", title: "Lesson booked" }], ariaLabel: "Lesson events" }), /<section[^>]*data-component="timeline"[^>]*aria-label="Lesson events"/, "Timeline must expose a named region");
assert.match(ui.timeline({ id: "timeline-accessibility", items: [{ id: "booked", title: "Lesson booked" }] }), /<ol class="ui-timeline__list">/, "Timeline must preserve a chronological ordered list");
assert.match(ui.topNav({ id: "top-nav-accessibility", leading: "Context" }), /<header[^>]*data-component="top-nav"[^>]*aria-label="Top navigation"/, "Top nav must expose a named navigation banner");
assert.match(ui.topNavContext({ id: "top-nav-context-accessibility", selected: { id: "english", label: "English Teachers", flag: "Assets/Flags/us.svg" }, options: [{ id: "english", label: "English Teachers", flag: "Assets/Flags/us.svg" }], ariaLabel: "Teacher language" }), /aria-haspopup="menu"[^>]*aria-controls="top-nav-context-accessibility-menu"/, "Top nav context must expose its menu relationship");
assert.match(ui.topNavSearch({ id: "top-nav-search-accessibility", placeholder: "Search teachers", ariaLabel: "Search teachers" }), /role="search"/, "Top nav search must expose a search region");
assert.match(ui.chip({ label: "Default" }), /ui-chip--default/, "Chip must expose Panda's default content-fill surface");
assert.match(ui.chip({ label: "White", surface: "white" }), /ui-chip--white/, "Chip must retain a distinct white surface");
assert.match(ui.chip({ label: "Checked", checked: true }), /is-selected[^>]*aria-pressed="true"/, "Chip checked state must remain controlled and announced");
assert.match(ui.chip({ label: "Compatibility", selected: true }), /is-selected[^>]*aria-pressed="true"/, "Chip selected alias must remain compatible with existing consumers");
assert(componentCSS.includes(".ui-chip.is-selected { border-color: var(--ui-color-text); color: var(--ui-color-text); background: var(--ui-color-divider); }"), "Chip checked state must use the documented shallow fill, dark boundary, and readable text");
assert(componentCSS.includes(".ui-chip:disabled, .ui-chip.is-disabled { color: var(--ui-color-card); background: var(--ui-color-border); cursor: not-allowed; }"), "Chip disabled state must remain quiet and non-interactive");
assert.match(ui.selection({ label: "Basic plan", selected: true, contentType: "standard", selectionMode: "radio" }), /role="radio"[^>]*aria-checked="true"/, "Radio Selection must expose its selected radio state through ARIA");
assert.match(ui.selection({ label: "Written feedback", selected: true, contentType: "standard", selectionMode: "checkbox" }), /role="checkbox"[^>]*aria-checked="true"/, "Checkbox Selection must expose its selected checkbox state through ARIA");
assert(componentCSS.includes(".ui-selection:focus-visible, .ui-selection.is-focused"), "Selection must expose the documented visible focus ring");
assert.match(ui.switchControl({ checked: true, label: "Available" }), /role="switch"[^>]*aria-checked="true"[^>]*aria-label="Available"/, "Switch must expose role, state, and name");
assert.match(ui.search({ placeholder: "Search teachers" }), /aria-label="Search teachers"/, "Search input must expose an accessible name");
assert.match(ui.select({ id: "language", label: "Language", options: ["English"] }), /role="combobox"[^>]*aria-label="Language"/, "Select trigger must expose a named combobox");
assert.match(ui.slider({ label: "Lesson goal" }), /aria-label="Lesson goal"/, "Slider input must expose an accessible name");
assert.match(ui.panel({ title: "Lesson details", body: "Body" }), /<section[^>]*data-component="panel"/, "Panel must expose a semantic region");
assert(componentCSS.includes(".ui-panel--small .ui-panel__header { min-height: 40px; }") && componentCSS.includes(".ui-panel--large .ui-panel__header { min-height: 56px; }"), "Panel density must provide visibly distinct compact and spacious headers");
assert(catalog.includes('dsBlock("With title and Text button"'), "Panel Catalog must identify its supplied text-button header action");
assert.match(ui.drawer({ id: "drawer-accessibility", title: "Filters", body: "Content", open: true }), /role="dialog"[^>]*aria-modal="true"/, "Drawer must expose a modal dialog surface");
assert.match(ui.formField({ id: "field-accessibility", label: "Email", control: ui.textInput({ id: "field-accessibility" }) }), /<label id="field-accessibility-label" for="field-accessibility">/, "Form field must associate its visible label with its control");
assert.match(ui.formField({ id: "field-help", label: "Email", helper: "We only send updates", control: ui.textInput({ id: "field-help" }) }), /aria-describedby="field-help-helper"/, "Form field must associate helper text with its control");
assert.match(ui.formField({ id: "field-error", label: "Email", error: "Required", control: ui.textInput({ id: "field-error" }) }), /role="alert"/, "Form field errors must announce their state");
assert.match(ui.textInput({ id: "input-shape-default", size: 32, shape: "default" }), /ui-text-input--32 ui-text-input--pill/, "A 32px default text input must resolve to Pill");
assert.match(ui.textInput({ id: "input-shape-rounded", size: 48, shape: "rounded" }), /ui-text-input--48 ui-text-input--rounded/, "Text input must support its documented rounded shape");
assert.match(ui.textInput({ id: "input-shape-pill", size: 40, shape: "pill" }), /ui-text-input--40 ui-text-input--pill/, "Text input must support its documented pill shape");
assert.match(ui.textarea({ id: "textarea-accessibility", showCount: true, maxLength: 120 }), /data-ui-textarea-count/, "Textarea count must be owned by the shared textarea renderer");
assert.match(ui.formField({ id: "textarea-error", label: "Lesson brief", error: "Add more detail", control: ui.textarea({ id: "textarea-error", state: "error" }) }), /aria-describedby="textarea-error-error"/, "Textarea validation must expose form-field error text to assistive technology");
assert(componentCSS.includes(".ui-textarea:focus-within:not(.is-disabled):not(.is-readonly)"), "Read-only and disabled textareas must not receive container focus emphasis");
assert(!/input:focus-visible|textarea:focus-visible|select:focus-visible/.test(catalogStyle), "Catalog must not apply browser focus styles over shared input components");
assert.match(ui.combobox({ id: "combobox-accessibility", label: "Language", options: ["English"] }), /data-component="combobox"/, "Combobox must preserve its semantic component identity");
assert.match(ui.combobox({ id: "combobox-presentation", label: "Language", options: ["English"], size: 32, shape: "pill" }), /ui-select--32 ui-select--pill/, "Combobox must inherit the shared Select size and shape presentation");
const uploadMarkup = ui.upload({ id: "upload-accessibility", label: "Lesson documents", accept: ".pdf,.docx", multiple: true, files: [{ id: "brief", name: "lesson-brief.pdf", size: 1250000, status: "complete" }] });
assert.match(uploadMarkup, /data-component="upload"/, "Upload must preserve its semantic component identity");
assert.match(uploadMarkup, /type="file"[^>]*accept="\.pdf,\.docx"[^>]*multiple/, "Upload must render the supplied native file-selection contract");
assert.match(uploadMarkup, /Assets\/Icons\/whiteboard-upload\.svg/, "Upload dropzones must use the approved upload icon");
assert.match(uploadMarkup, /Assets\/Icons\/file\.svg/, "Upload file rows must use the approved file icon");
assert.match(uploadMarkup, /role="status"[^>]*aria-label="Upload complete"/, "Completed Upload files must announce their completed state without a competing action icon");
assert.match(ui.upload({ id: "upload-error", label: "Lesson documents", files: [{ id: "failed", name: "large.pdf", status: "error", error: "Too large" }] }), /role="alert">Too large/, "Failed Upload files must announce their supplied error message without a competing error icon");
assert.match(uploadMarkup, /Assets\/Icons\/16px\/cross-sm\.svg/, "Upload file removal must use the approved 16px close icon");
assert.match(ui.upload({ id: "upload-trigger", variant: "trigger", label: "Lesson documents" }), /data-demo="ui-upload-trigger"/, "Upload trigger rows must reuse the shared interactive Button contract");
const avatarUploadMarkup = ui.upload({ id: "upload-avatar", variant: "avatar", label: "Profile photo", avatar: "Assets/Icons/user.svg", avatarAlt: "Elena Ruiz profile photo" });
assert.match(avatarUploadMarkup, /ui-upload--avatar/, "Upload must provide an Avatar upload variant");
assert.match(avatarUploadMarkup, /type="file"[^>]*accept="\.jpg,\.jpeg,\.png"/, "Avatar Upload must default to one supported image-selection contract");
assert.match(avatarUploadMarkup, /ui-upload__avatar-image/, "Avatar Upload must render a supplied controlled profile preview");
assert.match(ui.upload({ id: "upload-avatar-error", variant: "avatar", label: "Profile photo", state: "error", error: "Photo is too large" }), /ui-upload__avatar-copy[^]*role="alert">Photo is too large/, "Avatar Upload errors must expose concise recovery copy");
assert(componentCSS.includes(".ui-upload__dropzone") && componentCSS.includes(".ui-upload__file"), "Upload must consume shared UI-kit styles rather than Catalog-only presentation CSS");
const filteredCombobox = ui.combobox({ id: "combobox-query", label: "Language", options: ["English", "French"], query: "French" });
assert.match(filteredCombobox, /value="French"/, "Combobox must render its supplied query in the search field");
assert.match(filteredCombobox, /data-select-label="English"[^>]*is-filtered|is-filtered[^>]*data-select-label="English"/, "Combobox must filter unrelated supplied options before first paint");
assert.match(filteredCombobox, /data-select-label="French"(?![^>]*is-filtered)/, "Combobox must keep a matching supplied option visible");
assert(catalogStyle.includes(".text-input-global-controls"), "Text input presentation controls must use the shared control-bar rhythm");
assert(catalogStyle.includes(".input-detail .component-doc-content { min-height: 0; padding: var(--space-4); }"), "Text input examples must use compact documented sample spacing");
assert(catalog.includes('data-ui-preview-stage="combobox-overlay"'), "Open Combobox examples must use the shared overlay stage adapter");
assert(catalog.includes('catalogSegmentedControl({ id: "search-size"'), "Search presentation controls must consume the shared Segmented control");
assert(catalog.includes('ui.search({ id: "icon-search"'), "Icon library search must consume the shared Search component");
assert.match(ui.stepper({ id: "stepper-accessibility", items: ["Course", "Time"], current: 1 }), /aria-current="step"/, "Stepper must expose the current step");
assert(componentCSS.includes(".ui-stepper__complete-icon { width: 24px; height: 24px; display: block; filter: brightness(0) invert(1); }"), "Stepper completion marks must preserve their source icon dimensions");
assert(componentCSS.includes(".ui-stepper--horizontal .ui-stepper__item > button { align-items: center; }"), "Horizontal Stepper current and complete content must share one vertical alignment");
assert.match(ui.stepper({ id: "flow-progress-accessibility", items: ["Course", "Time"], current: 1, variant: "flow-progress" }), /aria-current="step"/, "Flow progress Stepper must expose the current step");
assert.match(ui.progress({ value: 62, ariaLabel: "Profile progress" }), /role="progressbar"[^>]*aria-label="Profile progress"/, "Progress must expose a named progressbar");
assert.match(ui.toast({ tone: "success", title: "Saved" }), /role="status"[^>]*aria-live="polite"/, "Toast must expose a polite status announcement");
assert.match(ui.notification({ tone: "error", title: "Payment needs updating" }), /role="alert"[^>]*aria-live="polite"/, "Error Notification must expose an announced alert");
assert.match(ui.result({ id: "result-accessibility", tone: "success", title: "Lesson booked" }), /role="status"[^>]*aria-labelledby="result-accessibility-title"/, "Result must expose its visible outcome title");
assert.match(ui.result({ tone: "error", title: "Payment could not be completed" }), /role="alert"/, "Error Result must expose an alert outcome");
assert(componentCSS.includes(".ui-timeline__dot:not(.has-custom-dot):not(.ui-timeline__dot--pending)::after { width: 4px; height: 4px;"), "Timeline semantic dots must retain their white inner dot");
assert.match(ui.skeleton({ type: "content", avatar: true, lines: 2 }), /ui-skeleton--content[^]*ui-skeleton__header[^]*ui-skeleton__title[^]*ui-skeleton__paragraph/, "Skeleton must support Panda-style content composition with optional avatar, title, and paragraph slots");
const skeletonButtonMarkup = ui.skeleton({ type: "button", shape: "round" });
assert.match(skeletonButtonMarkup, /ui-skeleton--button/, "Skeleton must provide the documented Button element");
assert.match(skeletonButtonMarkup, /ui-skeleton--round/, "Skeleton must provide the documented Button element shape");
assert(componentCSS.includes(".ui-skeleton.is-animated .ui-skeleton__block") && componentCSS.includes("ui-skeleton-loading 1.4s"), "Skeleton must use the shared shimmer treatment for loading placeholders");
assert.match(ui.dropdownMenu({ id: "dropdown-accessibility", items: ["Message"], open: true }), /role="menu"/, "Dropdown menu must expose menu semantics");
assert.match(ui.disclosure({ id: "disclosure-accessibility", title: "Details", content: "Content" }), /aria-expanded="false"/, "Disclosure must expose its expanded state");
assert.match(ui.segmentedControl({ id: "segmented-accessibility", options: ["Week", "Month"] }), /aria-pressed="true"/, "Segmented control must expose its selected value");
assert.match(ui.timePicker({ id: "time-picker-accessibility", label: "Lesson time", slots: ["09:00"] }), /role="combobox"[^>]*aria-label="Lesson time"/, "Time picker must expose a named combobox trigger");
assert.match(ui.calendar({ id: "calendar-accessibility", dates: [{ id: "mon", label: "Mon", date: "15" }], rows: [{ id: "09-00", label: "09:00", slots: [{ state: "available" }] }] }), /role="grid"[^>]*aria-label="Weekly availability"/, "Calendar must expose a named availability grid");
const lessonRecordCalendar = ui.calendar({ id: "calendar-record-accessibility", variant: "lesson-record", recordTitle: "My lessons", recordStats: [{ label: "Total lesson count", value: "421", tone: "info" }, { label: "Total practice hours", value: "562", tone: "success" }], recordMonths: [{ id: "jul", label: "Jul", weeks: [["empty", "info", "success", "mixed", "selected", "out-of-range", "empty"]] }], ariaLabel: "Lesson record" });
assert.match(lessonRecordCalendar, /data-calendar-variant="lesson-record"/, "Calendar must expose its lesson-record variant");
assert.match(lessonRecordCalendar, /ui-calendar__record-cell is-mixed/, "Lesson record must support mixed activity cells");
assert.match(lessonRecordCalendar, /ui-calendar__record-stat-label/, "Lesson record must support supplied summary stats");
assert.match(ui.popover({ id: "popover-accessibility", title: "Details", body: "Content", open: true }), /data-component="popover"/, "Popover must preserve its semantic component identity");

for (const reference of [
  '<link rel="stylesheet" href="catalog-runtime/tokens.css" />',
  '<link rel="stylesheet" href="catalog-runtime/italki-ui.css" />',
  '<script src="catalog-runtime/contracts.js"></script>',
  '<script src="catalog-runtime/italki-ui.js"></script>',
  'function buttonComponent(props = {}) { return ui.button({ ...props, variant: props.variant === "gradient" ? "plus" : props.variant }); }',
  'function chipComponent(props = {}) { return ui.chip(props); }',
  'function tagComponent(props = {}) { return ui.tag(props); }',
  'return ui.checkbox(',
  'ui.checkboxGroup(',
  'ui.radio(',
  'ui.radioGroup(',
  'ui.selection(',
  'ui.selectionGroup(',
  'ui.datePicker(',
  'ui.tooltip(',
  'ui.modal(',
  'ui.popup(',
  'ui.popconfirm(',
  'ui.divider(',
  'ui.avatar(',
  'ui.flag(',
  'ui.avatarGroup(',
  'ui.badge(',
  'ui.breadcrumb(',
  'ui.card(',
  'ui.alert(',
  'ui.tabs(',
  'ui.pagination(',
  'ui.rate(',
  'ui.sidebar(',
  'ui.statistic(',
  'ui.table(',
  'ui.timeline(',
  'ui.topNav(',
  'ui.topNavContext(',
  'ui.topNavSearch(',
  'ui.sliderRange(',
  'ui.panel(',
  'ui.select(',
  'ui.drawer(',
  'ui.formField(',
  'ui.textInput(',
  'ui.textarea(',
  'ui.numberStepper(',
  'ui.combobox(',
  'ui.upload(',
  'ui.stepper(',
  'ui.progress(',
  'ui.toast(',
  'ui.notification(',
  'ui.result(',
  'ui.skeleton(',
  'ui.dropdownMenu(',
  'ui.disclosure(',
  'ui.segmentedControl(',
  'ui.timeSlot(',
  'ui.timePicker(',
  'ui.popover(',
  'function applyButtonCatalogProps(detail)',
  'function applySearchCatalogProps(detail)',
  'ui.toggleChip(control)',
  'ui.setCheckboxValue(control, value)',
  'ui.syncSliderRange(event.target)',
  'ui.setTimelineReverse(timeline, reversed)',
  'ui.setTopNavContextOpen(control)',
  'ui.selectTopNavContext(control)',
  'ui.clearTopNavSearch(control)',
  'ui.toggleTopNavFilter(control)',
  'ui.setTopNavSearchFocus(event.target, true)',
  'ui.syncTopNavSearch(event.target)',
  'ui.syncSliderInput(event.target)',
  'ui.syncSearchInput(event.target)',
  'ui.toggleSelect(control)',
  'ui.filterSelectOptions(event.target)',
  'ui.handleSelectKeydown(event)',
  'ui.selectRadio(control)',
  'ui.handleRadioKeydown(event)',
  'ui.toggleCheckboxGroup(control)',
  'ui.toggleSelectionCard(control)',
  'ui.handleSelectionCardKeydown(event)',
  'ui.toggleBreadcrumb(control)',
  'ui.dismissAlert(control)',
  'ui.selectTab(control)',
  'ui.handleTabsKeydown(event)',
  'ui.selectPaginationPage(control)',
  'ui.selectRate(control, event)',
  'ui.previewRate(item, event)',
  'ui.resetRatePreview(item)',
  'ui.handleRateKeydown(event)',
  'ui.selectSidebarItem(control)',
  'ui.toggleSidebarMore(control)',
  'ui.toggleSidebarSection(control)',
  'ui.toggleSidebar(control)',
  'ui.toggleDatePicker(control)',
  'ui.selectDatePickerDay(control)',
  'ui.navigateDatePicker(control, -1)',
  'ui.closeDatePickers()',
  'ui.openModal(control)',
  'ui.closeModal(control)',
  'ui.handleModalKeydown(event)',
  'ui.togglePopup(control)',
  'ui.closePopup(control, true)',
  'ui.closePopups()',
  'ui.cancelPopupClose(popup)',
  'ui.schedulePopupClose(popup)',
  'ui.handlePopupKeydown(event)',
  'ui.togglePopconfirm(control)',
  'ui.closePopconfirm(control, true)',
  'ui.closePopconfirms()',
  'ui.handlePopconfirmKeydown(event)',
  'ui.openDrawer(control)',
  'ui.closeDrawer(control)',
  'ui.handleDrawerKeydown(event)',
  'ui.adjustNumberStepper(control, -1)',
  'ui.toggleDropdownMenu(control)',
  'ui.toggleDisclosure(control)',
  'ui.selectSegmentedControl(control)',
  'ui.toggleTimePicker(control)',
  'ui.selectTimePickerSlot(control)',
  'ui.dismissToast(control)'
]) {
  assert(catalog.includes(reference), `Catalog is not consuming shared UI implementation: ${reference}`);
}

console.log("Contract, token, asset, runtime, and Catalog-consumption checks passed.");
