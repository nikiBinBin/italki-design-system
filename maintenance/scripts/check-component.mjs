import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "ui-kit", "contracts.json"), "utf8"));
const apiPath = path.join(root, "ui-kit", "component-api.json");
const api = fs.existsSync(apiPath) ? JSON.parse(fs.readFileSync(apiPath, "utf8")) : null;
const requested = process.argv[2]?.trim().toLowerCase();

if (!requested) {
  console.error("Usage: npm --prefix maintenance run component:check -- <component-name>");
  process.exit(2);
}

const aliases = { "button-variants": "button", "top-nav": "top-nav", "date-picker": "date-picker", "checkbox-group": "checkbox-group" };
const name = aliases[requested] || requested;
const contract = manifest.components[name];
const apiComponent = api?.components?.[name];

if (!contract) {
  const pending = manifest.migration?.pending?.includes(name);
  console.error(`BLOCKED: ${name} is ${pending ? "documented but not yet migrated" : "not registered"}. Do not create local markup or CSS; request the smallest contract extension first.`);
  process.exit(1);
}

console.log(JSON.stringify({
  component: name,
  status: "migrated",
  acceptedProps: contract.acceptedProps,
  defaults: apiComponent?.defaults || {},
  propEnums: contract.props,
  requiredStates: contract.requiredStates,
  subcomponents: contract.subcomponents || {},
  allowedTokens: apiComponent?.allowedTokens || api?.usagePolicy?.allowedFamilies || []
}, null, 2));
