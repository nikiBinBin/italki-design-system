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
  breadcrumb: "breadcrumb", card: "card", alert: "alert", tabs: "tabs", pagination: "pagination",
  rate: "rate", sidebar: "sidebar", statistic: "statistic", table: "table", timeline: "timeline",
  "top-nav": "topNav", slider: "slider", panel: "panel", search: "search", select: "select",
  switch: "switchControl", drawer: "drawer", "form-field": "formField", "text-input": "textInput",
  textarea: "textarea", "number-stepper": "numberStepper", combobox: "combobox", upload: "upload", stepper: "stepper",
  progress: "progress", toast: "toast", notification: "notification", result: "result", skeleton: "skeleton",
  "dropdown-menu": "dropdownMenu", disclosure: "disclosure", "segmented-control": "segmentedControl",
  "time-slot": "timeSlot", "time-picker": "timePicker", calendar: "calendar", popover: "popover", footer: "footer"
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
    implementation: manifest.productionMappings?.[name] || null
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
const colorMappings = manifest.productionTokenMappings?.color || {};
const foundationApi = {
  schemaVersion: 1,
  sourceOfTruth: ["catalog-runtime/contracts.json", "@italki/panda theme tokens", "current project ConfigProvider usage"],
  statusDefinitions: {
    aligned: "Panda exposes the matching semantic token with the Catalog value.",
    override: "Panda exposes the semantic token, but the current value differs and requires a reviewed ConfigProvider override.",
    gap: "No safe Panda semantic token or current project override exists. Do not substitute an approximate color."
  },
  colors: Object.fromEntries(Object.entries(colorTokens).map(([name, value]) => [name, {
    value,
    ...(colorMappings[name] || {})
  }]))
};
write("catalog-runtime/foundation-api.json", `${JSON.stringify(foundationApi, null, 2)}\n`);
const apiMappings = manifest.productionApiMappings || {};
const apiMappingComponents = apiMappings.components || {};
const pandaApi = {
  schemaVersion: 1,
  sourceOfTruth: ["catalog-runtime/contracts.json", "@italki/panda component prop types", "existing project wrappers"],
  statusDefinitions: apiMappings.statusDefinitions || {},
  coverage: apiMappings.coverage || { mapped: [], pending: [] },
  components: Object.fromEntries(Object.entries(apiMappingComponents).map(([name, mapping]) => [name, {
    catalogComponent: name,
    catalogProps: manifest.components[name]?.acceptedProps || [],
    coverageStatus: "mapped",
    ...mapping
  }]))
};
write("catalog-runtime/panda-api.json", `${JSON.stringify(pandaApi, null, 2)}\n`);
const implementationSummary = (implementation) => implementation
  ? `\`${implementation.status}\` - ${implementation.pandaExport || "No Panda primitive"}`
  : "Not mapped";
const componentRows = Object.entries(components).map(([name, component]) => {
  const props = component.props.map((prop) => `\`${prop}\``).join(", ");
  return `| [${titleCase(name)}](#${name}) | ${props} | ${component.states.map((state) => `\`${state}\``).join(", ")} | ${implementationSummary(component.implementation)} |`;
}).join("\n");
const sections = Object.entries(components).map(([name, component]) => {
  const propRows = component.props.map((prop) => {
    const values = component.enums[prop];
    return `| \`${prop}\` | ${component.defaults[prop]} | ${values ? enumText(values) : "Any documented value"} |`;
  }).join("\n");
  const subcomponents = Object.entries(component.subcomponents).map(([subName, definition]) => `- **${subName}**: ${definition.acceptedProps.map((prop) => `\`${prop}\``).join(", ")}`).join("\n");
  const implementation = component.implementation;
  const mapping = implementation
    ? `\n\n### Production Mapping\n\n| Field | Value |\n| --- | --- |\n| Status | \`${implementation.status}\` |\n| Panda export | ${implementation.pandaExport ? `\`${implementation.pandaExport}\`` : "No direct Panda primitive"} |\n| Preferred code entry | \`${implementation.preferredImport}\` |\n| Production component | \`${implementation.productionComponent}\` |\n\n${implementation.notes}`
    : "\n\n### Production Mapping\n\nNot mapped. Do not create a local replacement; report the component gap.";
  return `## ${titleCase(name)}\n\n**Catalog runtime:** \`ITalkiUI.${component.renderer || "not registered"}\`\n\nThe props below describe the Catalog reference runtime. Production code must follow the Production Mapping rather than copying this runtime API.\n\n| Prop | Default | Allowed values |\n| --- | --- | --- |\n${propRows}\n\n**Required states:** ${component.states.map((state) => `\`${state}\``).join(", ") || "None registered"}.${subcomponents ? `\n\n**Subcomponents**\n\n${subcomponents}` : ""}${mapping}`;
}).join("\n\n");

const markdown = `# Component API Index\n\n> Generated by \`maintenance/scripts/generate-component-api.mjs\`. Do not edit manually.\n\n## Usage Rule\n\nBuild Catalog fixtures by selecting a registered component and passing only the props below. Component presentation is owned by \`catalog-runtime/italki-ui.css\`; Catalog examples may compose components but must not recreate their CSS or raw Foundation values.\n\nFor production code, use each component's **Production Mapping**. \`aligned\` components are available through the listed Panda wrapper or Panda export. \`adapter\` components require the named Panda primitive plus approved product behavior. \`composed\` entries are business compositions, not Panda primitives.\n\nFor the prop-by-prop translation from a Catalog example to Panda, use generated \`docs/reference/PANDA_API.md\` or \`catalog-runtime/panda-api.json\`. Catalog prop names are not assumed to be Panda prop names.\n\n**Allowed Foundation token families:** ${tokenPolicy.allowedFamilies.map((family) => `\`${family}\``).join(", ")}.\n\n**Approved local asset roots:** ${tokenPolicy.approvedAssetRoots.map((root) => `\`${root}\``).join(", ")}.\n\n${tokenPolicy.exceptions}\n\n## Searchable Summary\n\n| Component | Accepted props | Required states | Production mapping |\n| --- | --- | --- | --- |\n${componentRows}\n\n${sections}\n`;
write("docs/reference/COMPONENT_API.md", markdown);

const formatCode = (value) => `\`${value}\``;
const foundationRows = Object.entries(foundationApi.colors).map(([name, mapping]) => `| ${formatCode(name)} | ${formatCode(mapping.value)} | ${formatCode(mapping.status || "unmapped")} | ${mapping.pandaToken ? formatCode(mapping.pandaToken) : "No safe Panda token"} | ${mapping.projectOverride || "Not recorded"} | ${mapping.notes || "Not recorded"} |`).join("\n");
const foundationMarkdown = `# Foundation API Index\n\n> Generated by \`maintenance/scripts/generate-component-api.mjs\`. Do not edit manually.\n\n## Production Color Mapping\n\nThis is a read-only decision map between Catalog semantic colors and the current Panda implementation. It does not modify \`@italki/panda\`, a \`ConfigProvider\`, or an application theme.\n\n- \`aligned\`: Panda already exposes the matching semantic token and Catalog value.\n- \`override\`: Panda exposes the semantic token, but a reviewed \`ConfigProvider\` override is required to match Catalog.\n- \`gap\`: no safe Panda semantic token or project override exists. Report the gap; do not use an approximate replacement.\n\n| Catalog token | Catalog value | Status | Panda token | Current production location | Implementation boundary |\n| --- | --- | --- | --- | --- | --- |\n${foundationRows}\n`;
write("docs/reference/FOUNDATION_API.md", foundationMarkdown);

const apiStatusText = (status) => `\`${status}\``;
const mappedComponents = pandaApi.coverage.mapped || [];
const pendingComponents = pandaApi.coverage.pending || [];
const pandaSummaryRows = mappedComponents.map((name) => {
  const component = pandaApi.components[name];
  const propCount = Object.values(component.props || {}).reduce((counts, prop) => {
    counts[prop.status] = (counts[prop.status] || 0) + 1;
    return counts;
  }, {});
  const statusSummary = Object.entries(propCount).map(([status, count]) => `${apiStatusText(status)} ${count}`).join(", ");
  return `| [${titleCase(name)}](#${name}) | \`${component.pandaComponent}\` | ${statusSummary} |`;
}).join("\n");
const pandaSections = mappedComponents.map((name) => {
  const component = pandaApi.components[name];
  const propRows = component.catalogProps.map((prop) => {
    const mapping = component.props[prop];
    return `| \`${prop}\` | ${apiStatusText(mapping.status)} | ${mapping.pandaProp ? `\`${mapping.pandaProp}\`` : "No safe Panda API"} | ${mapping.notes} |`;
  }).join("\n");
  return `## ${titleCase(name)}\n\n**Panda target:** \`${component.pandaComponent}\`  \n**Preferred import:** \`${component.preferredImport}\`  \n**Source checked:** ${component.source}\n\n${component.notes}\n\n| Catalog prop | Mapping | Panda prop / destination | Implementation boundary |\n| --- | --- | --- | --- |\n${propRows}`;
}).join("\n\n");
const pandaMarkdown = `# Panda API Mapping\n\n> Generated by \`maintenance/scripts/generate-component-api.mjs\`. Do not edit manually.\n\nThis is the code-level translation layer between the Catalog reference API and the current Panda component library. It is read-only: it does not change Panda, existing wrappers, or any application theme.\n\n- \`direct\`: pass the stated Panda prop or native attribute through the approved wrapper.\n- \`adapter\`: use the named Panda composition or existing product adapter; Catalog and Panda APIs are not interchangeable.\n- \`catalog-only\`: fixture state or demo control only; never copy it into production code.\n- \`gap\`: no confirmed Panda API. Report the gap and do not create a local visual substitute.\n\n## Coverage\n\nMapped now: ${mappedComponents.map((name) => `\`${name}\``).join(", ")}.\n\nPending API mapping: ${pendingComponents.map((name) => `\`${name}\``).join(", ") || "None"}.\n\n## Summary\n\n| Catalog component | Panda target | Catalog-prop resolution |\n| --- | --- | --- |\n${pandaSummaryRows}\n\n${pandaSections}\n`;
write("docs/reference/PANDA_API.md", pandaMarkdown);

const inlinePropSummary = (component, status, includeTarget = true) => Object.entries(component.props)
  .filter(([, mapping]) => mapping.status === status)
  .map(([prop, mapping]) => includeTarget && mapping.pandaProp ? `\`${prop}\` -> \`${mapping.pandaProp}\`` : `\`${prop}\``)
  .join("; ") || "None";
const componentImplementationRows = mappedComponents.map((name) => {
  const component = pandaApi.components[name];
  const reviewProps = Object.entries(component.props)
    .filter(([, mapping]) => ["adapter", "gap"].includes(mapping.status))
    .map(([prop, mapping]) => `\`${prop}\` (${mapping.status})`)
    .join("; ") || "None";
  return `| **\`${name}\`** | \`${component.pandaComponent}\` via \`${component.preferredImport}\` | ${inlinePropSummary(component, "direct")} | ${reviewProps} | ${inlinePropSummary(component, "catalog-only", false)} |`;
}).join("\n");
const componentImplementationSummary = `### Panda Implementation Summary\n\n> Generated by \`maintenance/scripts/generate-component-api.mjs\`. Do not edit inside this block.\n\nThis is the production-code entry point for the components mapped so far. Use the complete prop-level table in \`docs/reference/PANDA_API.md\` before implementation. \`direct\` props may pass through the approved wrapper; \`adapter\` props require the named product composition; \`gap\` props must be reported; \`catalog-only\` props never enter production code.\n\n| Catalog component | Panda target | Direct Panda mapping | Requires adapter or has a gap | Catalog-only |\n| --- | --- | --- | --- | --- |\n${componentImplementationRows}\n\nAPI mapping is pending for: ${pendingComponents.map((name) => `\`${name}\``).join(", ") || "None"}.\n`;
const componentDocStart = "<!-- PANDA_IMPLEMENTATION_SUMMARY:START -->";
const componentDocEnd = "<!-- PANDA_IMPLEMENTATION_SUMMARY:END -->";
const componentDoc = read("docs/core/COMPONENTS.md");
if (!componentDoc.includes(componentDocStart) || !componentDoc.includes(componentDocEnd)) {
  throw new Error("COMPONENTS.md is missing Panda implementation summary markers");
}
const componentDocWithSummary = componentDoc.replace(
  new RegExp(`${componentDocStart}[\\s\\S]*?${componentDocEnd}`),
  `${componentDocStart}\n\n${componentImplementationSummary}\n${componentDocEnd}`
);
write("docs/core/COMPONENTS.md", componentDocWithSummary);
