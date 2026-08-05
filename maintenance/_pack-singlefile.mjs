/* Packs the react-catalog single-bundle build into ONE self-contained HTML:
   - inlines the JS bundle and CSS
   - swaps every emitted asset reference for a data: URI (svg utf8, png base64)
   - embeds Noto Sans latin @font-face (400/500/600/700 + italic 400) so the
     page renders identically on machines without the font installed. */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const DIST = resolve("../react-catalog/dist-singlefile");
const OUT = resolve("../react-catalog/italki-design-system.html");

const assets = readdirSync(`${DIST}/assets`);
const jsFile = assets.find((f) => f.startsWith("index-") && f.endsWith(".js"));
const cssFile = assets.find((f) => f.endsWith(".css"));
let js = readFileSync(`${DIST}/assets/${jsFile}`, "utf8");
let css = readFileSync(`${DIST}/assets/${cssFile}`, "utf8");

const encodeSvg = (source) =>
  "data:image/svg+xml," +
  source
    .replace(/[\r\n]+\s*/g, " ")
    .replace(/"/g, "'")
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/&/g, "%26");

let swapped = 0;
for (const file of assets) {
  if (file === jsFile || file === cssFile) continue;
  const ref = `/assets/${file}`;
  const uri = file.endsWith(".svg")
    ? encodeSvg(readFileSync(`${DIST}/assets/${file}`, "utf8"))
    : `data:image/${file.endsWith(".png") ? "png" : "jpeg"};base64,` +
      readFileSync(`${DIST}/assets/${file}`).toString("base64");
  if (js.includes(ref)) {
    js = js.split(ref).join(uri);
    swapped++;
  }
  if (css.includes(ref)) {
    css = css.split(ref).join(uri);
    swapped++;
  }
}

/* Noto Sans latin faces from the fetched css2 stylesheet. */
const fontCss = readFileSync("/tmp/notosans.css", "utf8");
const blocks = fontCss.match(/@font-face\s*{[^}]*}/g) ?? [];
const latinFaces = [];
const seen = new Set();
for (const block of blocks) {
  if (!/unicode-range:[^;]*U\+0000-00FF/.test(block)) continue;
  const style = block.match(/font-style:\s*(\w+)/)?.[1];
  const weight = block.match(/font-weight:\s*(\d+)/)?.[1];
  const url = block.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
  const key = `${style}-${weight}`;
  if (!url || seen.has(key)) continue;
  seen.add(key);
  execSync(`curl -s "${url}" -o /tmp/noto-${key}.woff2`);
  const b64 = readFileSync(`/tmp/noto-${key}.woff2`).toString("base64");
  latinFaces.push(
    block
      .replace(/src:[^;]+;/, `src: url(data:font/woff2;base64,${b64}) format('woff2');`)
      .replace(/unicode-range:[^;]+;/, ""),
  );
}

const fontFaces = latinFaces.join("\n");
const safeJs = js.replace(/<\/script/g, "<\\/script");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>italki Design System</title>
    <style>${fontFaces}</style>
    <style>${css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">${safeJs}</script>
  </body>
</html>
`;
writeFileSync(OUT, html);
console.log(
  JSON.stringify({
    out: OUT,
    sizeMB: +(html.length / 1024 / 1024).toFixed(2),
    swappedRefs: swapped,
    fontFaces: latinFaces.length,
    leftoverAssetRefs: (html.match(/\/assets\/[A-Za-z0-9._-]+/g) ?? []).slice(0, 5),
  }),
);
