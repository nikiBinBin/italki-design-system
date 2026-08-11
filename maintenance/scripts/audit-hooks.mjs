import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
/* Clicks every distinct data-demo hook on every card and checks the page
   actually changed. A binding that resolves to nothing is invisible to every
   static check we have — the whole kit was in that state for a day because one
   namespace was missing — so this asks the only question that catches it: did
   anything happen? */
/* Anchored to this file, not to the shell's working directory. `path.resolve('.')`
   made `npm run audit:hooks` — which npm runs from maintenance/ — audit an empty
   tree and report that every hook passed. A harness that quietly finds nothing
   is worse than one that fails. */
const REPO = path.resolve(fileURLToPath(import.meta.url), '../../..');
const STAGE = path.join(REPO, 'maintenance/ds-project');
const T={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
const srv=http.createServer((q,r)=>{ const rel=decodeURIComponent(q.url.split('?')[0]);
  const send=f=>fs.readFile(f,(e,b)=>{ if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{'content-type':T[path.extname(f)]??'text/plain'}); r.end(b); });
  const a=path.join(STAGE,rel); fs.access(a,e=> e?send(path.join(REPO,rel)):send(a)); });
await new Promise(r=>srv.listen(4570,r));
const cards=[];
for (const root of ['components','patterns']) {
  const base=path.join(STAGE,root); if(!fs.existsSync(base)) continue;
  (function walk(d){ for(const e of fs.readdirSync(d,{withFileTypes:true})){ const f=path.join(d,e.name);
    if(e.isDirectory()) walk(f); else if(e.name.endsWith('.html')) cards.push(path.relative(STAGE,f)); } })(base);
}
const b=await chromium.launch();
const dead=[], errored=[];
let tested=0;
for (const rel of cards.sort()) {
  const p=await b.newPage({viewport:{width:1280,height:1000}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message.slice(0,80)));
  const warns=[]; p.on('console',m=>{ if(/is not in this bundle|threw/.test(m.text())) warns.push(m.text().slice(0,90)); });
  await p.goto('http://127.0.0.1:4570/'+rel,{waitUntil:'networkidle'});
  await p.waitForTimeout(250);
  const hooks=await p.evaluate(()=>[...new Set([...document.querySelectorAll('[data-demo]')].map(n=>n.dataset.demo))]);
  for (const hook of hooks) {
    /* Coarse signatures miss real behaviour: a checkbox flips a property, a
       field takes focus, a slider moves its thumb. Fold those in, or the audit
       reports working components as dead and buries the ones that are. */
    const sig=()=>p.evaluate(()=>[
      document.body.innerHTML.length,
      document.querySelectorAll('.is-open,.is-active,.is-selected,.is-checked,.is-collapsed,.is-current,.is-expanded').length,
      document.querySelectorAll('[aria-expanded="true"],[aria-pressed="true"],[aria-selected="true"],[aria-checked="true"]').length,
      [...document.querySelectorAll('input')].map(n=>n.checked?1:0).join(''),
      [...document.querySelectorAll('input,textarea')].map(n=>n.value).join('\u0001'),
      document.activeElement ? document.activeElement.tagName + (document.activeElement.className||'') : '',
    ].join('|'));
    const before=await sig();
    /* A disabled control doing nothing is the control working. Same for a file
       input, whose click opens an OS dialog the driver suppresses. */
    const el=await p.$(`[data-demo="${hook}"]:not([disabled]):not([type=file])`)
      || await p.$(`[data-demo="${hook}"]`);
    if(!el) continue;
    if (await el.evaluate(n=>n.disabled === true || n.type === 'file')) continue;
    tested++;
    try { await el.hover({timeout:800}).catch(()=>{}); await el.click({force:true,timeout:1500}); } catch { continue; }
    await p.waitForTimeout(180);
    if (await sig() === before) dead.push(`${path.basename(rel,'.html')} · ${hook}`);
  }
  if (errs.length) errored.push(`${path.basename(rel,'.html')}: ${errs[0]}`);
  if (warns.length) errored.push(`${path.basename(rel,'.html')}: ${warns[0]}`);
  await p.close();
}
/* Asked statically as well, because asking it by clicking does not work: a hook
   with no handler produces no behaviour, but the click still moves focus and
   that counts as "something changed". ui-lesson-toggle and ui-timeline-reverse
   both passed this audit while doing nothing on the page.

   The dispatcher answers it directly — its CLICK table is what runs, and its
   NOT_CLICK set declares the hooks that deliberately do not. Anything a card
   renders that is in neither is a gap. */
const dispatcher = fs.readFileSync(path.join(REPO, 'maintenance/scripts/ds-cards-behaviour.js'), 'utf8');
const clickTable = dispatcher.slice(dispatcher.indexOf('const CLICK = {'), dispatcher.indexOf('const NOT_CLICK'));
const handled = new Set([...clickTable.matchAll(/'([\w-]+)':\s*\(/g)].map((m) => m[1]));
const declared = new Set([...dispatcher.slice(dispatcher.indexOf('const NOT_CLICK'))
  .slice(0, dispatcher.slice(dispatcher.indexOf('const NOT_CLICK')).indexOf(']'))
  .matchAll(/'([\w-]+)'/g)].map((m) => m[1]));
const emitted = new Set();
for (const rel of cards) {
  for (const m of fs.readFileSync(path.join(STAGE, rel), 'utf8').matchAll(/data-demo="([^"]+)"/g)) emitted.add(m[1]);
}
const unbound = [...emitted].filter((d) => !handled.has(d) && !declared.has(d)).sort();
console.log(`\n钩子表: 卡片渲染 ${emitted.size} 种 · 分发表接 ${handled.size} 种 · 声明为非点击 ${declared.size} 种`);
console.log(unbound.length
  ? `没人接的 ${unbound.length} 种（点了不会有任何行为）:\n  ${unbound.join('\n  ')}`
  : '每种都有人接，或已声明为非点击');

console.log(`${cards.length} 张卡，点了 ${tested} 个钩子`);
/* An audit that examines nothing must not read as an audit that found nothing
   wrong — pointed at the wrong root, this printed "每个钩子都有反应" over zero
   cards. */
if (!cards.length || !tested) {
  console.log(`\n没有卡片可审：${STAGE} 下没找到卡片，先跑 npm run build:ds`);
  await b.close(); srv.close();
  process.exit(1);
}
console.log(dead.length ? `\n点了没反应的 ${dead.length} 个:` : '\n每个钩子都有反应');
dead.forEach(x=>console.log('  '+x));
if (errored.length) { console.log(`\n报错/缺函数 ${errored.length}:`); [...new Set(errored)].slice(0,10).forEach(x=>console.log('  '+x)); }
await b.close(); srv.close();
