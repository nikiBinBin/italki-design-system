#!/usr/bin/env node
/* Opens the template mirror in a browser, mounted the way the Design project
   mounts it.

   Opening these files straight off disk cannot work and fails in a way that
   looks like the template is broken rather than the setup: the pages resolve
   tokens, the bundle, the stylesheets and every Assets/ path through "../../",
   which is the project root when the app serves them and an empty folder here.
   The result is a page with no CSS and a screenful of broken images.

     npm --prefix maintenance run serve:templates
*/
import { templateHost, templatePages, repoRoot, syncNote } from './template-host.mjs';

const PORT = Number(process.argv[3] ?? 4601);
const { server, TEMPLATES } = templateHost(process.argv[2] ?? repoRoot());
await new Promise((r) => server.listen(PORT, r));

console.log(syncNote(TEMPLATES));
console.log('');
for (const t of templatePages(TEMPLATES)) {
  console.log(`  ${t.name.padEnd(16)} http://127.0.0.1:${PORT}${t.url}`);
}
console.log('\n  Ctrl-C 停止。React 由 support.js 从 CDN 取，所以这里需要联网。');
