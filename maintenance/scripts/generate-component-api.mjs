import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const write = (relativePath, value) => fs.writeFileSync(path.join(root, relativePath), value);
const manifest = JSON.parse(read("catalog-runtime/contracts.json"));
const runtimeSource = read("catalog-runtime/italki-ui.js");

const renderers = {
  button: "button", chip: "chip", tag: "tag", checkbox: "checkbox", "checkbox-group": "checkboxGroup",
  radio: "radio", selection: "selection", "date-picker": "datePicker", tooltip: "tooltip", modal: "modal",
  popup: "popup", popconfirm: "popconfirm", divider: "divider", avatar: "avatar", badge: "badge",
  breadcrumb: "breadcrumb", card: "card", list: "list", alert: "alert", tabs: "tabs", pagination: "pagination",
  rate: "rate", sidebar: "sidebar", statistic: "statistic", table: "table", timeline: "timeline",
  "top-nav": "topNav", slider: "slider", panel: "panel", search: "search", select: "select",
  switch: "switchControl", drawer: "drawer", "form-field": "formField", "text-input": "textInput",
  textarea: "textarea", "number-stepper": "numberStepper", combobox: "combobox", upload: "upload", stepper: "stepper",
  progress: "progress", toast: "toast", notification: "notification", result: "result", skeleton: "skeleton",
  "dropdown-menu": "dropdownMenu", disclosure: "disclosure", "segmented-control": "segmentedControl",
  "time-slot": "timeSlot", "time-picker": "timePicker", calendar: "calendar", popover: "popover", footer: "footer",
  "section-intro": "sectionIntro"
};

function functionSlice(name) {
  const marker = `function ${name}(props = {})`;
  const start = runtimeSource.indexOf(marker);
  if (start < 0) return "";
  const end = runtimeSource.indexOf("\n  function ", start + marker.length);
  return runtimeSource.slice(start, end < 0 ? runtimeSource.length : end);
}

function splitDefaultEntries(source) {
  const entries = [];
  let start = 0;
  let quote = "";
  let escaped = false;
  let depth = 0;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if ("([{<".includes(character)) depth += 1;
    else if (")]}>".includes(character)) depth = Math.max(0, depth - 1);
    else if (character === "," && depth === 0) {
      entries.push(source.slice(start, index));
      start = index + 1;
    }
  }
  entries.push(source.slice(start));
  return entries;
}

function readDefaults(renderer) {
  const source = functionSlice(renderer);
  const match = source.match(/const\s*\{([\s\S]*?)\}\s*=\s*props;/);
  if (!match) return {};
  const defaults = {};
  for (const entry of splitDefaultEntries(match[1])) {
    const normalized = entry.trim().replace(/\s+/g, " ");
    const defaultMatch = normalized.match(/^([A-Za-z_$][\w$]*)\s*=\s*(.+)$/);
    if (defaultMatch) defaults[defaultMatch[1]] = defaultMatch[2].trim();
  }
  return defaults;
}

const tokenPolicy = {
  rule: "Consumers choose a registered component and pass documented props only. They must not add local CSS for a component or pass raw colors, spacing, radius, shadow, icon paths, or state styling.",
  allowedFamilies: ["Color", "Typography", "Spacing", "Radius", "Shadow", "Motion"],
  approvedAssetRoots: manifest.assetRoots,
  exceptions: "Only component-specific geometry explicitly registered in COMPONENTS.md and the executable contract may differ from the Foundation scale."
};

const components = Object.fromEntries(Object.entries(manifest.components).map(([name, contract]) => {
  const renderer = renderers[name] || "";
  const runtimeDefaults = readDefaults(renderer);
  const defaults = Object.fromEntries(contract.acceptedProps.map((prop) => [prop, runtimeDefaults[prop] || "required or context-provided"]));
  return [name, {
    renderer,
    props: contract.acceptedProps,
    defaults,
    enums: contract.props || {},
    states: contract.requiredStates || [],
    subcomponents: contract.subcomponents || {},
    allowedTokens: tokenPolicy.allowedFamilies,
  }];
}));

const api = {
  schemaVersion: 2,
  sourceOfTruth: ["catalog-runtime/contracts.json", "catalog-runtime/italki-ui.js", "catalog-runtime/tokens.css"],
  usagePolicy: tokenPolicy,
  components
};

write("catalog-runtime/component-api.json", `${JSON.stringify(api, null, 2)}\n`);

const titleCase = (value) => value.replace(/(^|[-\s])(\w)/g, (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`);
const enumText = (values) => values.map((value) => `\`${String(value)}\``).join(", ");
const colorTokens = Object.fromEntries(Object.entries(manifest.tokens).filter(([name]) => name.startsWith("--ui-color-")));
const foundationApi = {
  schemaVersion: 1,
  sourceOfTruth: ["catalog-runtime/tokens.css via catalog-runtime/contracts.json"],
  colors: Object.fromEntries(Object.entries(colorTokens).map(([name, value]) => [name, { value }]))
};
write("catalog-runtime/foundation-api.json", `${JSON.stringify(foundationApi, null, 2)}\n`);

// The Panda mapping layer is gone entirely. 368740a removed its documents but
// left the data — productionMappings, productionTokenMappings and
// productionApiMappings in contracts.json — dormant, which meant the contract
// still asserted that every component and every colour declared how it mapped
// to a library the Catalog no longer tracks. The contract now describes only
// the Catalog itself.
