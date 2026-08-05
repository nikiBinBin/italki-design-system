import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* Foundation compliance lint.

   Fails when a stylesheet introduces a spacing, radius, typography, or color
   value that the Foundation does not define. It exists because an off-scale
   value is invisible in review but compounds across the system: the audit that
   produced this script found 11 of them, several introduced by well-meaning
   edits months apart.

   Two things this lint deliberately tolerates, because both are real and
   neither is an arbitrary design choice:

   - `calc()` whose px operands are all on-scale. That is how a derived
     geometric value (centring a thumb on a track, clearing a title row) should
     be written — the derivation stays readable instead of collapsing into a
     magic number.
   - Entries in REGISTERED_EXCEPTIONS below. These are documented decisions,
     not oversights. Adding one requires a reason and a source. */

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

/* ---------- Scales ----------
   Spacing and radius are parsed from tokens.css so this lint cannot drift from
   the Foundation. Typography sizes and line heights are declared, because
   COMPONENTS.md states them in prose rather than as tokens; see the cited
   sections when either changes. */

const tokensCSS = read("catalog-runtime/tokens.css");
const scaleFrom = (prefix) =>
  new Set(
    [...tokensCSS.matchAll(new RegExp(`--ui-${prefix}-[a-z0-9]+:\\s*([0-9]+)px`, "g"))]
      .map((match) => Number(match[1])),
  );

const SPACING = scaleFrom("space");
const RADIUS = new Set([...scaleFrom("radius"), 9999]);
/* COMPONENTS.md "Available size tokens", plus 10px: the size-token list starts
   at 12px but the Typography tier table documents `{typography.micro}` at
   10px/14px, and the runtime uses it for unread counts and online status. */
const FONT_SIZES = new Set([10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 52, 60]);
// Line heights paired with those sizes across the Typography tier table.
const LINE_HEIGHTS = new Set([14, 16, 18, 20, 22, 24, 28, 30, 32, 34, 40, 48, 60]);

assert(SPACING.size > 5, "Could not parse the spacing scale from tokens.css");
assert(RADIUS.size > 3, "Could not parse the radius scale from tokens.css");
SPACING.add(0);
RADIUS.add(0);

/* ---------- Registered exceptions ----------
   Each entry: the selector it applies to, the declaration, and why. */

const REGISTERED_EXCEPTIONS = [
  {
    match: /\.ui-checkbox__box\b/,
    prop: "border-radius",
    value: 6,
    reason:
      "Registered 6px exception for the 18px checkbox box; asserted by validate-contracts.mjs",
  },
  {
    match: /\.ui-radio__indicator\b/,
    prop: "margin-top",
    value: 1,
    reason: "Optical alignment of the 18px radio indicator against its label",
  },
  {
    match: /(\.ui-calendar__(teacher-header|teacher-row)|\.teacherHeader|\.teacherRow)\b/,
    prop: "gap",
    value: 1,
    reason:
      "Hairline separator, not spacing: the grid paints the border colour and cells paint over it",
  },
  {
    match: /(\.ui-tooltip::before|\.surface::before)/,
    prop: "border-radius",
    value: 1,
    reason:
      "Tip softening on an 8px rotated square; the radius scale governs surfaces, and 4px would round it almost circular",
  },
];

const SPACE_PROP = /^(padding|margin|gap|row-gap|column-gap)(-(top|right|bottom|left|inline|block)(-start|-end)?)?$/;
const COLOR_PROPS = new Set([
  "color", "background", "background-color", "border-color", "fill", "stroke",
  "border", "border-top", "border-right", "border-bottom", "border-left",
  "outline", "outline-color", "border-inline-start", "border-inline-end",
]);

const pxValues = (value) =>
  [...value.matchAll(/(-?[0-9.]+)px/g)].map((match) => Math.round(Number(match[1])));

const onScale = (values, scale) => values.every((value) => scale.has(Math.abs(value)));

/* A calc() is acceptable when every px operand is itself on a documented
   scale — that is what makes the derivation auditable. */
const derivedFromScale = (value) => {
  if (!value.includes("calc(")) return false;
  const operands = pxValues(value);
  const allowed = new Set([...SPACING, ...FONT_SIZES, ...LINE_HEIGHTS]);
  return operands.length > 0 && operands.every((operand) => allowed.has(Math.abs(operand)));
};

/* Walks declarations without depending on formatting: italki-ui.css keeps one
   rule per line, CSS modules are expanded. Both must lint identically. */
function* declarations(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  let index = 0;
  let line = 1;
  while (index < clean.length) {
    const open = clean.indexOf("{", index);
    if (open === -1) break;
    const close = clean.indexOf("}", open);
    if (close === -1) break;
    line += (clean.slice(index, open).match(/\n/g) || []).length;
    const selector = clean.slice(clean.lastIndexOf("}", open - 1) + 1, open).trim();
    let bodyLine = line;
    for (const declaration of clean.slice(open + 1, close).split(";")) {
      const colon = declaration.indexOf(":");
      if (colon !== -1) {
        yield {
          line: bodyLine,
          selector,
          prop: declaration.slice(0, colon).trim().toLowerCase(),
          value: declaration.slice(colon + 1).trim(),
        };
      }
      bodyLine += (declaration.match(/\n/g) || []).length;
    }
    line += (clean.slice(open, close).match(/\n/g) || []).length;
    index = close + 1;
  }
}

const isRegistered = (selector, prop, values) =>
  REGISTERED_EXCEPTIONS.some(
    (exception) =>
      exception.prop === prop &&
      exception.match.test(selector) &&
      values.every((value) => Math.abs(value) === exception.value),
  );

function lintStylesheet(relativePath) {
  const findings = [];
  const push = (line, kind, detail) =>
    findings.push({ file: relativePath, line, kind, detail });

  for (const { line, selector, prop, value } of declarations(read(relativePath))) {
    if (value.includes("var(")) continue;

    if (SPACE_PROP.test(prop)) {
      const values = pxValues(value);
      if (values.length && !onScale(values, SPACING) && !derivedFromScale(value)
          && !isRegistered(selector, prop, values)) {
        push(line, "spacing", `${prop}: ${value}`);
      }
    } else if (prop === "border-radius" && !value.includes("%")) {
      const values = pxValues(value);
      if (values.length && !onScale(values, RADIUS) && !derivedFromScale(value)
          && !isRegistered(selector, prop, values)) {
        push(line, "radius", `${prop}: ${value}`);
      }
    } else if (prop === "font-size") {
      const [size] = pxValues(value);
      if (size !== undefined && !FONT_SIZES.has(size)) {
        push(line, "font-size", `${prop}: ${value}`);
      }
    } else if (prop === "line-height") {
      const [height] = pxValues(value);
      if (height !== undefined && !LINE_HEIGHTS.has(height)) {
        push(line, "line-height", `${prop}: ${value}`);
      }
    } else if (prop === "font-family" && !value.includes("inherit")
        && !/^(html|body|:root|\*)/.test(selector)) {
      /* The root declaration is the definition site — the Foundation has no
         font token, so some stylesheet must state the stack. Only downstream
         re-declarations are drift. */
      push(line, "font-family", `${prop}: ${value.slice(0, 40)}`);
    } else if ((prop === "box-shadow" || prop === "text-shadow")
        && !["none", ""].includes(value.replace("!important", "").trim())) {
      push(line, "shadow", `${prop}: ${value.slice(0, 50)}`);
    } else if (COLOR_PROPS.has(prop)
        && (/#[0-9a-fA-F]{3,8}\b/.test(value) || /\b(rgba?|hsla?)\(/.test(value))) {
      push(line, "color", `${prop}: ${value.slice(0, 50)}`);
    }
  }
  return findings;
}

/* Inline colour literals bypass the stylesheet entirely, so scan markup too. */
function lintInlineColors(relativePath) {
  const findings = [];
  read(relativePath)
    .split("\n")
    .forEach((text, index) => {
      const match = text.match(/(fill|stroke|color|background)\s*[=:]\s*["']?(#[0-9a-fA-F]{3,8})/);
      if (match) {
        findings.push({
          file: relativePath,
          line: index + 1,
          kind: "inline-color",
          detail: match[0].trim().slice(0, 50),
        });
      }
    });
  return findings;
}

/* The design system itself. These must stay clean — a violation here ships to
   every consumer. */
const SYSTEM_STYLESHEETS = ["catalog-runtime/italki-ui.css", "catalog.css"];

/* No advisory tier: the Catalog shell was brought onto the Foundation scale
   too, so everything this repository ships is enforced. */
const SHELL_STYLESHEETS = [];

/* The runtime inlines a handful of SVG data URIs, which legitimately carry
   their own fills; only real markup is scanned for inline colour. */
const markup = ["index.html"];

const findings = [
  ...SYSTEM_STYLESHEETS.flatMap(lintStylesheet),
  ...markup.flatMap(lintInlineColors),
];
const shellFindings = SHELL_STYLESHEETS.flatMap(lintStylesheet);

if (findings.length) {
  const byKind = new Map();
  for (const finding of findings) {
    byKind.set(finding.kind, [...(byKind.get(finding.kind) ?? []), finding]);
  }
  console.error(`\nFoundation lint found ${findings.length} off-scale value(s):\n`);
  for (const [kind, rows] of [...byKind].sort((a, b) => b[1].length - a[1].length)) {
    console.error(`  ${kind} (${rows.length})`);
    for (const row of rows) {
      console.error(`    ${row.file}:${row.line}  ${row.detail}`);
    }
  }
  console.error(
    "\nFix by using a Foundation token, expressing the value as calc() over" +
      "\non-scale operands, or — only for a documented decision — adding an" +
      "\nentry to REGISTERED_EXCEPTIONS in this script with its reason.\n",
  );
}

if (shellFindings.length) {
  const kinds = new Map();
  for (const finding of shellFindings) {
    kinds.set(finding.kind, (kinds.get(finding.kind) ?? 0) + 1);
  }
  const summary = [...kinds].map(([kind, count]) => `${kind} ${count}`).join(", ");
  console.log(
    `Foundation lint advisory: ${shellFindings.length} off-scale value(s) in the` +
      ` Catalog shell (${summary}). Not enforced — see SHELL_STYLESHEETS.`,
  );
}

assert.equal(findings.length, 0, `Foundation lint failed with ${findings.length} finding(s)`);
console.log(
  `Foundation lint passed: spacing ${[...SPACING].sort((a, b) => a - b).join("/")}` +
    ` · radius ${[...RADIUS].sort((a, b) => a - b).join("/")}` +
    ` · ${REGISTERED_EXCEPTIONS.length} registered exceptions`,
);
