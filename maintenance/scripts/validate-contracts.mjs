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
const runtimeSource = read("catalog-runtime/italki-ui.js");
const fixtureSource = fs.readFileSync(path.join(root, "maintenance", "fixtures", "fixtures.js"), "utf8");
const catalog = read("index.html");
const catalogStyle = read("catalog.css");
const componentsDoc = read("docs/COMPONENTS.md");
const componentApi = JSON.parse(read("catalog-runtime/component-api.json"));
const foundationApi = JSON.parse(read("catalog-runtime/foundation-api.json"));
const componentTokenReferences = new Set([...`${componentCSS}\n${runtimeSource}`.matchAll(/--ui-[a-z0-9-]+/g)].map(([token]) => token));
const componentTokenDeclarations = new Set([...`${componentCSS}\n${runtimeSource}`.matchAll(/(--ui-[a-z0-9-]+)\s*:/g)].map(([, token]) => token));
for (const [, token] of runtimeSource.matchAll(/setProperty\(\s*["'](--ui-[a-z0-9-]+)/g)) componentTokenDeclarations.add(token);
const foundationTokenDeclarations = new Set([...tokensCSS.matchAll(/(--ui-[a-z0-9-]+)\s*:/g)].map(([, token]) => token));

/* contracts.js is generated from contracts.json, and nothing failed when it
   lagged behind: the page just threw "<component> does not accept prop <name>"
   at whoever opened it. That is how a finished SegmentedControl change looked
   broken for one test run. Rebuild it here and compare — the same generator,
   so a mismatch means the checked-in file is stale, not that it is wrong. */
{
  const runtimeContract = {
    assetRoots: manifest.assetRoots,
    components: Object.fromEntries(Object.entries(manifest.components).map(([name, contract]) => [name, {
      acceptedProps: contract.acceptedProps,
      props: contract.props,
      ...(contract.subcomponents ? { subcomponents: contract.subcomponents } : {})
    }]))
  };
  assert.equal(
    read("catalog-runtime/contracts.js"),
    `window.ITalkiUIContracts = ${JSON.stringify(runtimeContract, null, 2)};\n`,
    "catalog-runtime/contracts.js is stale — run npm --prefix maintenance run build:contracts",
  );
}

assert(catalog.includes('<link rel="stylesheet" href="catalog.css" />'), "Catalog shell styles must live outside the document");
assert(!catalog.includes("<style>"), "Catalog must not embed its presentation CSS");
assert(catalog.includes("Image|Approved image ratios for content and banners."), "Foundation must expose the image-ratio rule");
assert(catalog.includes("Use only 16:9 or 3:1 image crops."), "Foundation image guidance must restrict imagery to the approved ratios");
assert.deepEqual(manifest.components.card.props.mediaRatio, ["16:9", "3:1"], "Card media must only allow the approved image ratios");
assert(componentCSS.includes(".ui-list__image, .ui-list__image-placeholder { width: 96px; height: 54px;") && componentCSS.includes(".ui-list--content .ui-list__image, .ui-list--content .ui-list__image-placeholder { width: 160px; height: 90px;"), "List image frames must use 16:9 crops");
assert(catalogStyle.includes(".radius-nested-image { --ui-media-placeholder-logo-width: 32px; --ui-media-placeholder-logo-height: 40px; width: min(100%, 256px); aspect-ratio: 16 / 9;"), "Radius nested media must use a 16:9 crop");
assert(catalogStyle.includes(".radius-nested-example { display: grid; grid-template-columns: minmax(0, 288px) minmax(0, 240px); justify-content: start;"), "Radius nested outer surface must fit the approved media frame instead of expanding across the module");
assert(catalog.includes('kind === "full" ? tagComponent({ label: "Tag", size: 32 })'), "Radius pill example must reuse the Tag component treatment");
assert(catalog.includes('buttonComponent({ label: "Reset", variant: "secondary", size: 40, shape: "default" })') && catalog.includes('buttonComponent({ label: "Show teachers", variant: "red", size: 40, shape: "default" })'), "Filter modal footer must use the standard secondary and primary 40px dialog actions");
assert.deepEqual(Object.keys(componentApi.components).sort(), Object.keys(manifest.components).sort(), "Generated component API must index every registered component");
assert.deepEqual(componentApi.usagePolicy.allowedFamilies, ["Color", "Typography", "Spacing", "Radius", "Shadow", "Motion"], "Component API must constrain consumers to registered Foundation token families");
const catalogColorTokens = Object.keys(manifest.tokens).filter((name) => name.startsWith("--ui-color-"));
assert.deepEqual(Object.keys(foundationApi.colors).sort(), catalogColorTokens.sort(), "Foundation API must index every Catalog color token");
/* The Catalog no longer declares how a token maps to any upstream library, so
   the only thing left to assert is that the generated Foundation API still
   carries the value the Foundation defines. */
for (const name of catalogColorTokens) {
  assert.equal(foundationApi.colors[name].value, manifest.tokens[name], `Foundation API color value drifted for: ${name}`);
}
for (const [name, contract] of Object.entries(manifest.components)) {
  const apiContract = componentApi.components[name];
  assert.deepEqual(apiContract.props, contract.acceptedProps, `Component API props drifted for: ${name}`);
  assert.deepEqual(apiContract.enums, contract.props || {}, `Component API enums drifted for: ${name}`);
  assert.deepEqual(apiContract.states, contract.requiredStates || [], `Component API states drifted for: ${name}`);
  assert.deepEqual(Object.keys(apiContract.defaults), contract.acceptedProps, `Component API defaults drifted for: ${name}`);
  assert.deepEqual(apiContract.allowedTokens, componentApi.usagePolicy.allowedFamilies, `Component API token policy drifted for: ${name}`);
}


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
for (const token of componentTokenReferences) {
  assert(foundationTokenDeclarations.has(token) || componentTokenDeclarations.has(token), `Component references an undefined or retired token: ${token}`);
}

for (const token of ["--ui-shadow-md", "--ui-shadow-lg", "--ui-shadow-xl"]) {
  assert(manifest.tokens[token], `Shadow foundation token is missing: ${token}`);
}
for (const token of ["--ui-shadow-card", "--ui-shadow-card-hover"]) {
  assert(manifest.tokens[token], `Card shadow token is missing: ${token}`);
}
for (const token of ["--ui-shadow-button", "--ui-shadow-panel", "--ui-shadow-control", "--ui-shadow-control-hover", "--ui-shadow-surface", "--ui-shadow-floating", "--ui-shadow-dialog", "--ui-shadow-stroke-card"]) {
  assert(![componentCSS, runtimeSource, catalog, catalogStyle].some((source) => source.includes(token)), `Deprecated token must not be consumed: ${token}`);
}
assert(componentCSS.includes(".ui-modal { --ui-modal-width: 520px") && componentCSS.includes("box-shadow: var(--ui-shadow-xl)"), "Modal must consume Shadow/XL");
assert(componentCSS.includes(".ui-select__menu") && componentCSS.includes("box-shadow: var(--ui-shadow-lg)"), "Floating menus must consume Shadow/LG");
assert(componentCSS.includes(".ui-card {") && componentCSS.includes("box-shadow: var(--ui-shadow-card);"), "Card must consume Shadow/Card at rest");
assert(componentCSS.includes(".ui-card.is-outlined { border: 0; box-shadow: 0 0 0 1px var(--ui-color-border); }"), "An outlined Card draws its outline with Color/Border, like every other 1px ring in the kit");
assert(!/--ui-shadow-stroke-card/.test(tokensCSS), "Shadow/Stroke-card is retired: one 1px ring, one source of colour");
assert(componentCSS.includes(".ui-card.is-interactive:hover, .ui-card.is-interactive:focus-visible { box-shadow: var(--ui-shadow-card-hover); }"), "Interactive Card must consume Shadow/Card-Hover");

/* A segmented control's hover fill was the same token as its selected fill, so
   the segment under the cursor already looked chosen and clicking it changed
   nothing anyone could see — the switch had worked the entire time. Chip solved
   this by making hover one step darker than the resting selected state. */
{
  const fill = (pattern) => componentCSS.match(pattern)?.[1]?.match(/background:\s*([^;]+);/)?.[1]?.trim();
  const hover = fill(/\.ui-segmented-control button:hover[^{]*\{([^}]*)\}/);
  const pressed = fill(/\.ui-segmented-control button\[aria-pressed="true"\] \{([^}]*)\}/);
  assert(hover && pressed && hover !== pressed, `A segmented control's hover fill must differ from its selected fill, or clicking reads as nothing happening (both are ${hover})`);
}

assert(!/#[0-9A-Fa-f]{3,8}\b/.test(componentCSS), "Component CSS must not contain raw hexadecimal colors");
assert(!/\brgb\(/.test(componentCSS), "Component CSS must not contain raw rgb colors");
assert(!/#[0-9A-Fa-f]{3,8}\b|\brgb\(/.test(read("catalog-runtime/italki-ui.js")), "Component implementation must not contain raw colors");
assert(!/#[0-9A-Fa-f]{3,8}\b|\brgb\(/.test(fixtureSource), "Visual fixtures must not contain raw colors");
assert(!/Assets\/(?!Icons\/|Flags\/|Images\/)/.test(read("catalog-runtime/italki-ui.js")), "Catalog runtime may only use registered local asset roots");
assert(!/Assets\/(?!Icons\/|Flags\/|Images\/)/.test(catalog), "Catalog may only reference registered local asset roots");
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
assert(componentCSS.includes(".ui-checkbox__box { width: 18px; height: 18px;") && componentCSS.includes("border-radius: var(--ui-radius-xs); background: var(--ui-color-divider);"), "Checkbox must retain its explicit 18px geometry and Radius/XS corners");
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
  ["selection", ui.selectionGroup({ label: "Lesson package", contentType: "package-card", selectionMode: "radio", layout: "package-grid", options: [{ label: "5 lesson package", value: "five", discount: "No discount", price: "¥114.70", period: "per lesson", quantity: "5", totalPrice: "¥573.49 CNY" }] })],
  ["selection", ui.selectionGroup({ label: "Lesson duration", contentType: "lesson-options", selectionMode: "radio", courseTitle: "Real-life Conversation", courseMeta: "B1-C2 · Language Essentials", selected: "30", options: [{ label: "30 mins", value: "30", price: "¥114.70" }, { label: "45 mins", value: "45", price: "¥168.67" }] })],
  ["selection", ui.selectionGroup({ label: "Course lesson options", contentType: "lesson-options", selectionMode: "radio", selected: "conversation", selectedDuration: "30", courses: [{ value: "conversation", title: "Real-life Conversation", meta: "B1-C2 · Language Essentials", options: [{ label: "30 mins", value: "30", price: "¥114.70" }] }, { value: "structured", title: "Structured English Course", meta: "A1-B2 · Language Essentials", price: "¥114.70+", options: [{ label: "30 mins", value: "30", price: "¥114.70" }] }] })],
  ["date-picker", ui.datePicker({ id: "contract-date-picker", label: "Lesson date", days: [{ label: 15, value: "2026-07-15" }], selected: "2026-07-15", open: true })],
  ["tooltip", ui.tooltip({ id: "contract-tooltip", content: "Supporting text", open: true })],
  ["modal", ui.modal({ id: "contract-modal", title: "Dialog", body: "Content", open: true })],
  ["modal", ui.modal({ id: "contract-modal-inline", title: "Color guidance", body: "Content", stage: "inline", open: true })],
  ["popup", ui.popup({ id: "contract-popup", title: "Details", body: "Content", open: true })],
  ["popconfirm", ui.popconfirm({ id: "contract-popconfirm", title: "Confirm", open: true })],
  ["divider", ui.divider({ label: "Details", orientation: "left", icon: "Assets/Icons/16px/morning-sm.svg" })],
  ["section-intro", ui.sectionIntro({ id: "contract-section-intro", eyebrow: "Learning plan", title: "Upcoming lessons", description: "Continue your learning routine.", action: ui.button({ label: "View all", variant: "text", size: 32, shape: "pill" }) })],
  ["avatar", ui.avatar({ name: "Maya Chen", initials: "MC", size: 48, variant: "empty" })],
  ["avatar", ui.avatar({ name: "italki", size: 48, variant: "logo" })],
  ["avatar", ui.flag({ countryCode: "us", countryLabel: "USA", size: 24 })],
  ["avatar", ui.avatarGroup({ members: [{ name: "Maya Chen", initials: "MC" }], overflow: 1, size: "xs" })],
  ["badge", ui.badge({ type: "count", anchor: "<span>Inbox</span>", count: 8 })],
  ["badge", ui.badge({ type: "status", tone: "success", label: "Available" })],
  ["breadcrumb", ui.breadcrumb({ items: [{ label: "Home" }, { label: "Lessons" }, { label: "Lesson details", current: true }] })],
  ["card", ui.card({ title: "Conversation prompts", body: "<p>Content</p>" })],
  ["card", ui.card({ title: "Lesson materials", interactive: true, outlined: false })],
  ["list", ui.list({ id: "contract-list", size: "large", variant: "avatar", items: [{ label: "Lesson notes", description: "Shared today", trailing: "1 file", avatar: ui.avatar({ name: "Maya Chen", initials: "MC", size: 40, variant: "empty" }) }] })],
  ["list", ui.list({ id: "contract-image-list", variant: "image", items: [{ label: "Conversation prompts", imagePlaceholder: true }] })],
  ["list", ui.list({ id: "contract-content-list", variant: "content", items: [{ label: "Maya Chen", content: "Useful speaking practice starts small.", avatar: ui.avatar({ name: "Maya Chen", initials: "MC", size: 40, variant: "empty" }), likes: "24", comments: "6", imagePlaceholder: true }] })],
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
  ["progress", ui.progress({ value: 62, type: "circle" })],
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
  catalog.matchAll(/(?:src=|(?:icon|leadingIcon|trailingIcon):\s*)["'](Assets\/(?:Icons|Flags|Images)\/[A-Za-z0-9_./-]+)/g),
  (match) => match[1]
);
const fixtureAssets = Array.from(
  fixtureSource.matchAll(/Assets\/(?:Icons|Flags|Images)\/[A-Za-z0-9_./-]+/g),
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
assert.match(ui.segmentedControl({ id: "segmented-icon", contentType: "icon", options: [{ label: "Morning lessons", value: "morning", icon: "Assets/Icons/16px/time-morning-sm.svg" }, { label: "Afternoon lessons", value: "afternoon", icon: "Assets/Icons/16px/time-afternoon-sm.svg" }, { label: "Evening lessons", value: "evening", icon: "Assets/Icons/16px/time-evening-sm.svg" }] }), /ui-segmented-control--icon[\s\S]*aria-label="Morning lessons"[\s\S]*ui-segmented-control__icon[\s\S]*time-evening-sm\.svg/, "Icon segmented control must retain accessible names and render three 16px icon options");
assert(componentCSS.includes('.ui-segmented-control--icon button[aria-pressed="true"] .ui-segmented-control__icon { filter: brightness(.32); }'), "Selected icon segments must strengthen their icon color");
assert.match(ui.segmentedControl({ id: "segmented-role", contentType: "role", options: [{ label: "Student role", value: "student", icon: "Assets/Icons/role-student.svg" }, { label: "Teacher role", value: "teacher", icon: "Assets/Icons/role-teacher.svg" }] }), /ui-segmented-control--role[\s\S]*role-student\.svg[\s\S]*role-teacher\.svg[\s\S]*role-switch\.svg/, "Role segmented control must use the supplied Figma role and switch icons");
assert(componentCSS.includes(".ui-segmented-control--role { width: min(100%, 312px);") && componentCSS.includes("min-height: 64px;") && componentCSS.includes(".ui-segmented-control__role-switch { width: 30px; height: 30px;"), "Role segmented control must preserve the documented 312×72 role-switch geometry");
assert(componentCSS.includes('.ui-segmented-control--role button[aria-pressed="true"], .ui-segmented-control--role button[aria-pressed="true"]:hover:not(:disabled), .ui-segmented-control--role button[aria-pressed="true"]:focus-visible { background: var(--ui-color-card); }'), "Selected role segments must retain the card background after generic selected styles");
assert.match(ui.checkbox({ checked: "mixed" }), /role="checkbox"[^>]*aria-checked="mixed"/, "Checkbox must expose mixed state through ARIA");
assert.match(ui.checkboxGroup({ id: "accessibility-group", label: "Topics", options: ["Conversation"] }), /<fieldset[^>]*data-component="checkbox-group"/, "Checkbox group must expose a semantic fieldset");
assert.match(ui.radio({ label: "Online lesson", value: "online", checked: true }), /role="radio"[^>]*aria-checked="true"/, "Radio must expose a checked radio state through ARIA");
assert.match(ui.radioGroup({ label: "Lesson length", options: ["30 min", "45 min"], selected: "45 min" }), /role="radiogroup"[^>]*aria-label="Lesson length"/, "Radio group must expose a named radiogroup");
assert(componentCSS.includes(".ui-selection__feature { width: 32px; height: 32px;") && componentCSS.includes("border-radius: var(--ui-radius-md); background: var(--ui-color-card); }"), "Selection leading feature must use the shared rounded surface token");
assert(componentCSS.includes(".ui-selection__body { min-width: 0; display: flex; align-items: flex-start; gap: var(--ui-space-2); }") && componentCSS.includes(".ui-selection__card-header { min-width: 0; position: relative; display: flex; align-items: center; gap: var(--ui-space-2); padding: var(--ui-space-4); }"), "Selection icons must sit close to their titles without changing card padding");
assert.match(ui.selectionGroup({ label: "Lesson type", options: ["Private lesson"] }), /role="radiogroup"[^>]*aria-label="Lesson type"/, "Selection group must expose a named radiogroup");
assert.match(ui.footer({ columns: [{ heading: "Explore", links: ["Teachers"] }], socialLinks: [{ label: "YouTube", icon: "Assets/Icons/youtube.svg" }] }), /data-component="footer"/, "Footer must expose its shared component root");
const groupedFooter = ui.footer({ columns: [{ groups: [{ heading: "Language teachers", links: ["English teachers"] }, { heading: "More", links: ["FAQ"] }] }], utilities: ui.select({ id: "footer-contract-language", label: "Language", options: ["English"], selected: "English", size: 40, shape: "rounded" }) });
assert.match(groupedFooter, /class="ui-footer__group"/, "Footer must support semantic link groups within one supplied column");
assert.match(groupedFooter, /data-component="select"/, "Footer utilities must be able to consume the shared Select component");
assert.match(ui.datePicker({ id: "date-accessibility", label: "Lesson date", days: [{ label: 15, value: "2026-07-15" }], open: true }), /role="dialog"[^>]*aria-label="Lesson date calendar"/, "Date picker must expose a named calendar dialog");
assert.match(ui.datePicker({ id: "date-navigation", label: "Lesson date", days: [{ label: 15, value: "2026-07-15" }], open: true }), /Assets\/Icons\/arrow-left\.svg[\s\S]*Assets\/Icons\/arrow-right\.svg/, "Date picker month navigation must use the shared left and right arrow icons");
assert.match(ui.datePicker({ id: "date-range-empty", label: "Lesson date range", days: [{ label: 15, value: "2026-07-15" }], range: [], open: true }), /data-date-range="true"/, "An empty Date picker range must retain range-selection behavior until both dates are selected");
assert.match(ui.tooltip({ id: "tooltip-accessibility", content: "Supporting text" }), /aria-describedby="tooltip-accessibility"/, "Tooltip trigger must expose an accessible description relationship");
assert.match(ui.tooltip({ id: "tooltip-accessibility", content: "Supporting text" }), /role="tooltip"/, "Tooltip must expose a tooltip role");
assert.match(ui.modal({ id: "modal-accessibility", title: "Dialog", body: "Content", open: true }), /role="dialog"[^>]*aria-modal="true"/, "Modal must expose a modal dialog role");
assert.match(ui.popup({ id: "popup-accessibility", title: "Details", body: "Content", open: true }), /role="dialog"[^>]*aria-labelledby="popup-accessibility-title"/, "Popup must expose a named non-modal dialog surface");
assert.match(ui.popconfirm({ id: "popconfirm-accessibility", title: "Confirm", open: true }), /role="alertdialog"[^>]*aria-labelledby="popconfirm-accessibility-title"/, "Popconfirm must expose a named confirmation surface");
assert.match(ui.divider({ type: "vertical", ariaLabel: "Teacher metadata separator" }), /role="separator"[^>]*aria-orientation="vertical"[^>]*aria-label="Teacher metadata separator"/, "Divider must expose separator semantics and orientation");
/* Video. It is a cover and a way in, never a player: keeping it a pure string
   builder is what lets it render in a static Design card and offline test. */
assert.match(ui.video({ poster: "Assets/Images/covers/teacher-intro.jpg" }), /<div class="ui-video"[^>]*data-component="video"/, "Video must render its own frame");
assert.doesNotMatch(ui.video({ poster: "Assets/Images/covers/teacher-intro.jpg" }), /<video|<iframe/, "Video must not embed a player — the page decides what play does");
assert.match(ui.video({ poster: "Assets/Images/covers/teacher-intro.jpg", demo: "ui-video-play" }), /data-demo="ui-video-play"/, "Video must expose the play affordance through the shared demo hook");
assert.throws(() => ui.video({}), /video requires a poster/, "A play button over an empty frame says nothing about what it starts");
assert.throws(() => ui.video({ poster: "https://example.com/x.jpg" }), /approved asset/, "Video posters are bound by the same asset roots as every other image");
assert.match(ui.video({ poster: "Assets/Images/covers/teacher-intro.jpg", duration: "1:24" }), /ui-video__duration">1:24</, "Video must be able to state its duration before it is started");
assert.match(ui.video({ poster: "Assets/Images/covers/teacher-intro.jpg", title: "Meet Maya" }), /aria-label="Play Meet Maya"/, "A titled Video must name what the play button starts");
assert.match(ui.video({ poster: "Assets/Images/covers/teacher-intro.jpg", state: "disabled" }), /<button[^>]*disabled/, "A disabled Video must not be startable");
assert(componentCSS.includes(".ui-video__play-disc") && !/ui-video__play-icon/.test(componentCSS), "Video's play affordance is a drawn disc — classroom-play.svg is itself a filled circle, so an icon inside a ring nests two circles");
assert(componentCSS.includes(".ui-video__play { position: absolute; inset: 0; display: grid; place-items: end start; border: 0; padding: var(--ui-space-4);"), "Video play control must sit clear of the lower-left edge");
assert(componentCSS.includes(".ui-video.is-disabled .ui-video__poster { filter: saturate(.72); opacity: .72; }") && !componentCSS.includes(".ui-video.is-disabled .ui-video__poster { filter: grayscale(1);"), "Disabled Video must retain a softened version of its cover rather than turn monochrome");

/* Link. The two decisions worth pinning: a disabled link must not be
   followable, and an external one must say so before it is clicked. */
assert.match(ui.link({ label: "See lessons" }), /<a class="ui-link ui-link--14 ui-link--default"[^>]*href="#"/, "Link must render an anchor with a destination");
assert.doesNotMatch(ui.link({ label: "Unavailable", disabled: true }), /<a\b/, "A disabled Link must not render an anchor — it cannot be followed");
assert.match(ui.link({ label: "Unavailable", disabled: true }), /aria-disabled="true"/, "A disabled Link must announce that it is disabled");
assert.match(ui.link({ label: "Help Center", external: true }), /target="_blank" rel="noreferrer noopener"/, "An external Link must open safely in a new context");
assert.match(ui.link({ label: "Help Center", external: true }), /arrow-up-right\.svg/, "An external Link must mark itself before it is clicked");
assert.match(ui.link({ label: "See lessons", trailingIcon: "chevron" }), /chevron-right\.svg/, "Link must support the chevron affordance the teacher card uses");
assert.match(ui.link({ label: "Default link" }), /ui-link--14/, "Link must default to the compact 14px text tier");
assert.throws(() => ui.link({ label: "x", variant: "ghost" }), /link\.variant does not accept ghost/, "Link variants are contract-bound");
assert(componentCSS.includes(".ui-link:hover, .ui-link.is-hover") && componentCSS.includes("text-decoration: underline"), "Link must underline on hover, not at rest");
assert(!/\.ui-link \{[^}]*text-decoration: underline/.test(componentCSS), "Link must not underline at rest");
assert(!catalog.includes("General Navigation to another destination, inside a sentence or a row."), "Link documentation must not render the retired component description");
assert(catalog.includes('const isLink = byName(entry) === "link";') && catalog.includes("isFoundation || isTeacherCard || isLessonCard || isLink ? \"\" : entry.group.title"), "Link documentation must omit the General heading tag");
assert(catalogStyle.includes(".link-inverse-stage { display: inline-flex; align-items: center; border-radius: var(--radius-md); padding: var(--space-2) var(--space-3); background: var(--ui-color-text); }"), "Inverse Link must be demonstrated on the Text surface, one tonal step below Title");

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
assert(catalog.includes('function alertDetail()') && !catalog.includes('Payment unsuccessful", description: "Choose another payment method to continue." })}</div>`, true)}${dsBlock("Closable"'), "Alert Semantic variants must use the standard single-column documentation width");
assert.match(ui.alert({ tone: "info", title: "New message", closable: true }), /Assets\/Icons\/cross\.svg/, "Closable Alert must use the approved close icon inside its surface-matched dismissal control");
assert.match(ui.toast({ title: "Saved", closable: true }), /Assets\/Icons\/cross\.svg/, "Closable Toast must use the approved close icon inside its surface-matched dismissal control");
assert.match(ui.notification({ title: "New message", closable: true }), /Assets\/Icons\/cross\.svg/, "Closable Notification must use the approved close icon inside its surface-matched dismissal control");
assert(componentCSS.includes("top: -6px; right: -6px; border: 1px solid var(--ui-color-border);"), "Closable feedback surfaces must keep their dismissal control close to the corner with a subtle visible boundary");
assert(componentCSS.includes(".ui-alert.is-banner { grid-template-columns: 24px minmax(0, 1fr); align-items: start;"), "Alert Banner must align its icon with the first line of content");
assert(componentCSS.includes(".ui-tabs__header { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: var(--ui-space-3); }"), "Tabs extra action must align with tab labels along the horizontal center line");
assert.match(ui.timePicker({ id: "time-picker-multiple", slots: ["09:00", "10:30"], selected: ["09:00", "10:30"], selectionMode: "multiple", open: true }), /ui-time-picker--multiple[\s\S]*aria-multiselectable="true"/, "Time picker multiple selection must preserve its supplied selected times and multiselect semantics");
assert.match(ui.timePicker({ id: "time-picker-empty", slots: ["09:00"] }), /class="ui-time-picker__icon is-placeholder" src="Assets\/Icons\/16px\/time-sm\.svg"/, "An unselected Time picker must retain its visible clock SVG");
assert.match(ui.timePicker({ id: "time-picker-selected", slots: ["09:00"], selected: "09:00" }), /class="ui-time-picker__icon" src="Assets\/Icons\/16px\/time-sm\.svg"/, "A selected Time picker must render the full-intensity clock SVG");
assert(componentCSS.includes(".ui-time-picker__icon.is-placeholder { opacity: .45; }") && componentCSS.includes(".ui-time-picker.is-disabled .ui-time-picker__icon { opacity: .25; }"), "Time picker icon intensity must match placeholder and disabled text states without replacing the approved SVG");
assert(runtimeSource.includes('root.querySelector(".ui-time-picker__icon")?.classList.toggle("is-placeholder", selectedLabels.length === 0);'), "Time picker interaction must restore the selected icon intensity after choosing a time");
assert(componentCSS.includes(".ui-time-slot--option { min-width: 0; min-height: 32px; border-radius: var(--ui-radius-md);") && componentCSS.includes(".ui-time-slot--option.is-selected { color: var(--ui-color-card); border-color: var(--ui-color-text); background: var(--ui-color-text); }"), "Time picker options must use the 8px radius token and Foreground/Primary-text when selected");
assert.match(ui.selection({ contentType: "package-card", selectionMode: "radio", discount: "7% off" }), /<span class="ui-selection__package-offer-icon" aria-hidden="true"><\/span>/, "Lesson package discounts must render the category icon element with their offer text");
/* The offer icon is painted, not shipped coloured: it used to be an <img> tinted
   by a hand-tuned filter chain, which meant the colour could not follow the
   token it was imitating. currentColor makes it follow the offer's own text
   colour — info for a discount, secondary when neutral — so the neutral variant
   needs no icon rule of its own. */
{
  const offerIcon = componentCSS.match(/\.ui-selection__package-offer-icon \{[^}]*\}/)?.[0] ?? "";
  assert(/background: currentColor;/.test(offerIcon) && /mask: url\("\.\.\/Assets\/Icons\/16px\/category-sm\.svg"\) center \/ contain no-repeat;/.test(offerIcon),
    "Lesson package discount icons must take their colour from the offer text, not from a filter");
  assert(!/\.ui-selection__package-offer\.is-neutral \.ui-selection__package-offer-icon/.test(componentCSS),
    "A neutral offer needs no icon rule of its own — currentColor already follows the label");
}
assert(!/filter:\s*invert\(/.test(componentCSS), "Icons must be tinted through a mask and a token, never by a hand-tuned filter chain");
/* A mask url in a custom property is resolved against whichever stylesheet reads
   the property, so a caller-supplied path cannot be right for every consumer —
   which is why Divider's icon is an ordinary kit <img> again, and why the two
   icons that are masks name their file in the stylesheet rather than inline. */
assert.match(ui.divider({ label: "or", icon: "Assets/Icons/16px/time-sm.svg" }), /<img class="ui-divider__icon" src="Assets\/Icons\/16px\/time-sm\.svg" alt="" \/>/, "Divider icons must render through the shared icon helper, so their path is rebased like every other icon");
/* Every url() the kit ships is stylesheet-relative from catalog-runtime/. The
   bundle sits beside Assets/ instead, and build-ds-project rewrites for that —
   a url() written any other way would silently paint nothing there. */
for (const [, cssUrl] of componentCSS.matchAll(/url\("([^"]+)"\)/g)) {
  assert(cssUrl.startsWith("../Assets/"), `Component CSS url() must be stylesheet-relative from catalog-runtime: ${cssUrl}`);
  assert(fs.existsSync(path.join(root, "catalog-runtime", cssUrl)), `Component CSS references a missing asset: ${cssUrl}`);
}
assert(componentCSS.includes(".ui-notification { --ui-dismiss-surface: var(--ui-color-card); width: min(100%, 400px); display: none; align-items: flex-start; gap: var(--ui-space-3); position: relative; overflow: visible; border: 1px solid var(--ui-color-divider);"), "Notification outer card border must use the subtle divider token");
assert(catalog.includes('const action = buttonComponent({ label: "View lesson", variant: "secondary", size: 32, shape: "pill", demo: "button" });'), "Notification With action must use a 32px Secondary Pill button");
assert(catalog.includes('statusTag("Decline", "neutral", "Assets/Icons/16px/lesson-canceled-sm.svg")'), "Lesson status tags must include Decline with the same neutral canceled icon treatment");
assert(componentCSS.includes(".ui-progress--semicircle output { position: absolute; right: 0; bottom: var(--ui-space-3); left: 0;"), "Semicircle Progress label must sit within the arc rather than against the lower edge");
assert(catalogStyle.includes(".component-section {\n        margin: 0 0 var(--space-7);\n        background: transparent;"), "Overview sections must keep the page surface while individual catalog cards own the card background");
assert(catalogStyle.includes(".catalog-toast-stack { width: min(100%, 812px); display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); }"), "Toast and Notification semantic variants must support two-column presentation");
assert(catalogStyle.includes(".shadow-detail { display: grid; gap: var(--space-7); background: var(--card); }"), "Shadow documentation module must use the card surface");
assert(catalogStyle.includes(".shadow-token-preview { min-width: 0; display: flex; align-items: center; border-left: 1px solid var(--divider); padding: var(--space-3) var(--space-4); background: var(--card); }") && catalogStyle.includes(".shadow-token-preview i.stroke-card { box-sizing: border-box; border: 1px solid var(--border); box-shadow: none; }"), "Shadow Card documentation must keep its module surface white and distinguish a Color/Border outlined card");
assert(catalog.includes('buttonComponent({ label: "When To Use", variant: "white", size: 32, shape: "pill", demo: "open-button-usage" })'), "Button variants When To Use must use the White button");
assert.match(ui.tabs({ id: "tabs-accessibility", ariaLabel: "Lesson details", items: [{ id: "overview", label: "Overview", panel: "Content" }] }), /role="tablist"[^>]*aria-label="Lesson details"/, "Tabs must expose a named tablist");
assert.match(ui.tabs({ id: "tabs-accessibility", ariaLabel: "Lesson details", items: [{ id: "overview", label: "Overview", panel: "Content" }] }), /role="tabpanel"/, "Tabs must expose a related tabpanel");
assert(componentCSS.includes(".ui-tabs--red-line .ui-tabs__trigger { min-height: 48px; border-radius: 0; color: var(--ui-color-secondary); }") && !componentCSS.includes(".ui-tabs--red-line .ui-tabs__trigger { min-height: 48px; border-radius: 0; color: var(--ui-color-secondary); font-size:"), "Red-line Tabs must inherit the standard tab type scale");
assert(componentCSS.includes(".ui-tabs__extra::before { width: var(--ui-space-6); position: absolute; top: 0; bottom: 0; left: calc(var(--ui-space-6) * -1); background: linear-gradient(to right, transparent, var(--ui-color-card)); content: \"\"; pointer-events: none; }") && componentCSS.includes(".ui-tabs__extra::after { width: 1px; height: 16px; position: absolute; top: 50%; left: var(--ui-space-3); background: var(--ui-color-divider); content: \"\"; transform: translateY(-50%); pointer-events: none; }"), "Tabs extra action must fade from the left and include its separating divider");
assert.match(ui.pagination({ pages: [1, 2, 3], current: 2, ariaLabel: "Results pages" }), /<nav[^>]*aria-label="Results pages"/, "Pagination must expose a named navigation region");
assert.match(ui.pagination({ pages: [1, 2, 3], current: 2 }), /aria-current="page">2/, "Pagination must expose the current page");
assert.match(ui.rate({ value: 2.5, allowHalf: true, label: "Lesson rating" }), /role="radiogroup"[^>]*aria-label="Lesson rating"/, "Rate must expose a named radiogroup");
assert.match(ui.rate({ value: 2.5, allowHalf: true }), /aria-checked="true"/, "Rate must expose checked score through ARIA");
assert.match(ui.rate({ id: "rate-summary", value: 4.98, variant: "summary", label: "Teacher rating" }), /ui-rate--summary[\s\S]*star-solid\.svg[\s\S]*>4\.98<\/output>/, "Rate must support a static yellow-star score summary");
assert.match(ui.rate({ value: 4.98, variant: "summary", label: "Teacher rating" }), /role="img"[^>]*aria-label="Teacher rating: 4\.98 out of 5"/, "Rate score summaries must expose one concise accessible rating");
assert.match(ui.sidebar({ id: "sidebar-accessibility", items: [{ id: "home", label: "Home", icon: "Assets/Icons/dashboard.svg" }], ariaLabel: "Workspace sidebar" }), /<aside[^>]*data-component="sidebar"[^>]*aria-label="Workspace sidebar"/, "Sidebar must expose a named complementary navigation surface");
assert.match(ui.sidebar({ id: "sidebar-accessibility", items: [{ id: "more", label: "More", icon: "Assets/Icons/more.svg", more: true }], moreItems: [{ id: "community", label: "Community", icon: "Assets/Icons/community.svg" }] }), /role="menu"/, "Sidebar More must expose a menu when supplied");
assert.match(ui.statistic({ title: "Lessons completed", value: "128" }), /role="group"[^>]*aria-label="Lessons completed, 128"/, "Statistic must expose a readable grouped value");
assert.match(ui.statistic({ title: "Lessons completed", value: "", loading: true }), /aria-busy="true"[^>]*><span class="ui-statistic__title">Lessons completed<\/span><span class="ui-statistic__skeleton ui-statistic__skeleton--value"/, "Loading Statistic must preserve its title and expose a busy value skeleton");
assert(componentCSS.includes(".ui-statistic__skeleton { display: block; overflow: hidden; border-radius: var(--ui-radius-md); background: var(--ui-color-hover); }") && componentCSS.includes(".ui-statistic.is-loading .ui-statistic__skeleton { background: var(--ui-gradient-skeleton); background-size: 400% 100%; animation: ui-skeleton-loading 1.4s ease infinite; }"), "Loading Statistic must use the shared skeleton animation with a rounded visible shape");
assert.match(ui.table({ id: "table-accessibility", columns: [{ id: "teacher", label: "Teacher" }], rows: [{ id: "maya", cells: [{ content: "Maya Chen", rowHeader: true }] }], ariaLabel: "Teacher lessons" }), /<section[^>]*data-component="table"[^>]*aria-label="Teacher lessons"/, "Table must expose a named region");
assert.match(ui.table({ id: "table-accessibility", columns: [{ id: "teacher", label: "Teacher" }], rows: [{ id: "maya", cells: [{ content: "Maya Chen", rowHeader: true }] }] }), /<th scope="col"/, "Table must preserve semantic column headers");
assert.match(ui.timeline({ id: "timeline-accessibility", items: [{ id: "booked", title: "Lesson booked" }], ariaLabel: "Lesson events" }), /<section[^>]*data-component="timeline"[^>]*aria-label="Lesson events"/, "Timeline must expose a named region");
assert.match(ui.timeline({ id: "timeline-accessibility", items: [{ id: "booked", title: "Lesson booked" }] }), /<ol class="ui-timeline__list">/, "Timeline must preserve a chronological ordered list");
assert.match(ui.topNav({ id: "top-nav-accessibility", leading: "Context" }), /<header[^>]*data-component="top-nav"[^>]*aria-label="Top navigation"/, "Top nav must expose a named navigation banner");
assert.match(ui.topNavContext({ id: "top-nav-context-accessibility", selected: { id: "english", label: "English Teachers", flag: "Assets/Flags/us.svg" }, options: [{ id: "english", label: "English Teachers", flag: "Assets/Flags/us.svg" }], ariaLabel: "Teacher language" }), /aria-haspopup="menu"[^>]*aria-controls="top-nav-context-accessibility-menu"/, "Top nav context must expose its menu relationship");
assert.match(ui.topNavSearch({ id: "top-nav-search-accessibility", placeholder: "Search teachers", ariaLabel: "Search teachers" }), /role="search"/, "Top nav search must expose a search region");
assert.match(ui.chip({ label: "Default" }), /ui-chip--default/, "Chip must expose its default content-fill surface");
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
assert.match(ui.stepper({ id: "stepper-connectors", items: ["Course", "Time", "Payment"], current: 1 }), /ui-stepper__item[\s\S]*ui-stepper__connector is-complete[\s\S]*ui-stepper__item[\s\S]*ui-stepper__connector[\s\S]*ui-stepper__item/, "Horizontal Stepper must render independent progress connectors between its step groups");
assert(componentCSS.includes(".ui-stepper__complete-icon { width: 24px; height: 24px; display: block; filter: brightness(0) invert(1); }"), "Stepper completion marks must preserve their source icon dimensions");
assert(componentCSS.includes(".ui-stepper--horizontal ol { align-items: center; gap: var(--ui-space-3); }") && componentCSS.includes(".ui-stepper--horizontal .ui-stepper__connector { height: 1px; min-width: 24px; flex: 1 1 32px; background: var(--ui-color-border); }"), "Horizontal Stepper must use auto-layout gaps around independent 1px connectors");
assert.match(ui.stepper({ id: "flow-progress-accessibility", items: ["Course", "Time"], current: 1, variant: "flow-progress" }), /aria-current="step"/, "Flow progress Stepper must expose the current step");
assert.match(ui.stepper({ id: "flow-progress-connectors", items: ["Course", "Time", "Payment"], current: 1, variant: "flow-progress" }), /ui-stepper__item[\s\S]*ui-stepper__connector is-complete[\s\S]*ui-stepper__item[\s\S]*ui-stepper__connector[\s\S]*ui-stepper__item/, "Flow progress Stepper must render independent progress connectors between its step groups");
assert(componentCSS.includes("grid-template-rows: var(--ui-stepper-flow-marker-size) auto") && componentCSS.includes(".ui-stepper--flow-progress .ui-stepper__connector { height: var(--ui-stepper-flow-connector-size); min-width: 24px; flex: 1 1 32px; align-self: start; margin-top: calc((var(--ui-stepper-flow-marker-size) - var(--ui-stepper-flow-connector-size)) / 2); background: var(--ui-color-border); }"), "Flow progress Stepper connectors must align independently from the marker centre without depending on label height");
assert(componentCSS.includes(".ui-stepper--flow-progress { --ui-stepper-flow-marker-size: 24px; --ui-stepper-flow-connector-size: 1px;") && componentCSS.includes("margin: 0;"), "Flow progress Stepper must remain left-aligned with a 1px connector");
assert(componentCSS.includes(".ui-stepper--flow-progress .ui-stepper__item.is-current .ui-stepper__marker { border-color: var(--ui-color-text); color: var(--ui-color-text); background: var(--ui-color-card); }"), "Flow progress current Stepper must expose a stroked current marker");
assert.match(ui.stepper({ id: "stepper-dots", items: ["One", "Two", "Three"], current: 1, variant: "dots" }), /ui-stepper--dots[\s\S]*ui-stepper__dot is-current/, "Stepper must support a named dotted pagination indicator");
assert.match(ui.stepper({ id: "stepper-top-indicator", items: ["One", "Two", "Three"], current: 1, variant: "top-indicator" }), /ui-stepper--top-indicator[\s\S]*ui-stepper__segment is-complete[\s\S]*ui-stepper__segment is-current/, "Stepper must support a segmented top indicator");
assert.match(ui.stepper({ id: "stepper-schedule", variant: "schedule-progress", value: 18, max: 20, label: "Scheduled lessons" }), /role="progressbar"[^>]*aria-valuemax="20"[^>]*aria-valuenow="18"/, "Stepper must support the scheduled-lesson progress format");
assert.match(ui.stepper({ id: "stepper-progress-steps", items: ["One", "Two"], current: 0, variant: "progress-steps" }), /ui-stepper--progress-steps[\s\S]*ui-stepper__connector/, "Stepper must support horizontal progress steps with independent connectors");
assert(catalog.includes('const filterModal = filterPattern({') && !catalog.includes('teacher-discovery-filter__options'), "Teacher discovery must reuse the Filter Pattern instead of recreating a local filter panel");
assert.match(ui.progress({ value: 62, ariaLabel: "Profile progress" }), /role="progressbar"[^>]*aria-label="Profile progress"/, "Progress must expose a named progressbar");
assert.match(ui.progress({ value: 62, type: "circle" }), /--ui-progress-ring-stroke:12px/, "Circle Progress must compensate for its SVG scale with a 12px source stroke");
assert.match(ui.progress({ value: 62, type: "semicircle" }), /--ui-progress-ring-stroke:8px/, "Semicircle Progress must use an 8px source stroke to match the Circle's rendered line weight");
assert(componentCSS.includes("stroke-width: var(--ui-progress-ring-stroke);"), "Circular Progress must apply its shared ring stroke variable");
assert.match(ui.toast({ tone: "success", title: "Saved" }), /role="status"[^>]*aria-live="polite"/, "Toast must expose a polite status announcement");
assert.match(ui.notification({ tone: "error", title: "Payment needs updating" }), /role="alert"[^>]*aria-live="polite"/, "Error Notification must expose an announced alert");
assert.match(ui.result({ id: "result-accessibility", tone: "success", title: "Lesson booked" }), /role="status"[^>]*aria-labelledby="result-accessibility-title"/, "Result must expose its visible outcome title");
assert.match(ui.result({ tone: "error", title: "Payment could not be completed" }), /role="alert"/, "Error Result must expose an alert outcome");
assert(componentCSS.includes(".ui-timeline__dot:not(.has-custom-dot):not(.ui-timeline__dot--pending)::after { width: 4px; height: 4px;"), "Timeline semantic dots must retain their white inner dot");
assert.match(ui.skeleton({ type: "content", avatar: true, lines: 2 }), /ui-skeleton--content[^]*ui-skeleton__header[^]*ui-skeleton__title[^]*ui-skeleton__paragraph/, "Skeleton must support composition-first content with optional avatar, title, and paragraph slots");
const skeletonButtonMarkup = ui.skeleton({ type: "button", shape: "round" });
assert.match(skeletonButtonMarkup, /ui-skeleton--button/, "Skeleton must provide the documented Button element");
assert.match(skeletonButtonMarkup, /ui-skeleton--round/, "Skeleton must provide the documented Button element shape");
assert(componentCSS.includes(".ui-skeleton.is-animated .ui-skeleton__block") && componentCSS.includes("ui-skeleton-loading 1.4s"), "Skeleton must use the shared shimmer treatment for loading placeholders");
assert.match(ui.dropdownMenu({ id: "dropdown-accessibility", items: ["Message"], open: true }), /role="menu"/, "Dropdown menu must expose menu semantics");
assert.match(ui.disclosure({ id: "disclosure-accessibility", title: "Details", content: "Content" }), /aria-expanded="false"/, "Disclosure must expose its expanded state");
assert.match(ui.segmentedControl({ id: "segmented-accessibility", options: ["Week", "Month"] }), /aria-pressed="true"/, "Segmented control must expose its selected value");
assert.match(ui.timePicker({ id: "time-picker-accessibility", label: "Lesson time", slots: ["09:00"] }), /role="combobox"[^>]*aria-label="Lesson time"/, "Time picker must expose a named combobox trigger");
assert.match(ui.calendar({ id: "calendar-accessibility", dates: [{ id: "mon", label: "Mon", date: "15" }], rows: [{ id: "09-00", label: "09:00", slots: [{ state: "available" }] }] }), /role="grid"[^>]*aria-label="Weekly availability"/, "Calendar must expose a named availability grid");
assert(componentCSS.includes(".ui-calendar--compact-availability { width: 100%; gap: var(--ui-space-1); }") && componentCSS.includes(".ui-calendar__compact-grid { width: 100%; min-width: 0; display: grid; grid-template-columns: 72px repeat(7, minmax(0, 1fr));"), "Compact availability must distribute time cells from the available module width");
assert(catalog.includes('dsBlock("Compact availability", ui.calendar({ id: "compact-availability-calendar"') && !catalog.includes('ariaLabel: "Compact weekly availability" }), true)'), "Compact availability documentation must use the narrower standard module span");
const lessonRecordCalendar = ui.calendar({ id: "calendar-record-accessibility", variant: "lesson-record", recordTitle: "My lessons", recordStats: [{ label: "Total lesson count", value: "421", tone: "info" }, { label: "Total practice hours", value: "562", tone: "success" }], recordMonths: [{ id: "jul", label: "Jul", weeks: [["empty", "info", "success", "mixed", "selected", "out-of-range", "empty"]] }], ariaLabel: "Lesson record" });
assert.match(lessonRecordCalendar, /data-calendar-variant="lesson-record"/, "Calendar must expose its lesson-record variant");
assert.match(lessonRecordCalendar, /ui-calendar__record-cell is-mixed/, "Lesson record must support mixed activity cells");
assert.match(lessonRecordCalendar, /ui-calendar__record-stat-label/, "Lesson record must support supplied summary stats");
assert.match(ui.popover({ id: "popover-accessibility", title: "Details", body: "Content", open: true }), /data-component="popover"/, "Popover must preserve its semantic component identity");

for (const reference of [
  '<link rel="stylesheet" href="catalog-runtime/tokens.css" />',
  '<link rel="stylesheet" href="catalog-runtime/italki-ui.css?v=20260811-breadcrumb-separator-size" />',
  '<script src="catalog-runtime/contracts.js"></script>',
  '<script src="catalog-runtime/italki-ui.js?v=20260811-breadcrumb-separator-size"></script>',
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
  'ui.dismissToast(control)',
  /* The context picker and search field are no longer built by the route:
     global-default and teacher-search are variants, so the bar composes its
     own subcomponents. Assert the route asks for them by name instead. */
  'variant: "global-default"',
  'variant: "teacher-search"'
]) {
  assert(catalog.includes(reference), `Catalog is not consuming shared UI implementation: ${reference}`);
}

console.log("Contract, token, asset, runtime, and Catalog-consumption checks passed.");
