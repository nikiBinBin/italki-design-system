import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const manifestPath = path.join(root, "catalog-runtime", "contracts.json");
const outputPath = path.join(root, "catalog-runtime", "contracts.js");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const runtimeContract = {
  assetRoots: manifest.assetRoots,
  components: Object.fromEntries(Object.entries(manifest.components).map(([name, contract]) => [name, {
    acceptedProps: contract.acceptedProps,
    props: contract.props,
    ...(contract.subcomponents ? { subcomponents: contract.subcomponents } : {})
  }]))
};

fs.writeFileSync(outputPath, `window.ITalkiUIContracts = ${JSON.stringify(runtimeContract, null, 2)};\n`);
