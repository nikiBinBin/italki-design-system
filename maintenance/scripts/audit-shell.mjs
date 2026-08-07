import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
/* Anchored to this file, not to the shell's working directory. `path.resolve('.')`
   made `npm run audit:hooks` — which npm runs from maintenance/ — audit an empty
   tree and report that every hook passed. A harness that quietly finds nothing
   is worse than one that fails. */
const REPO = path.resolve(fileURLToPath(import.meta.url), '../../..');
const T={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
const srv=http.createServer((q,r)=>{ const rel=decodeURIComponent(q.url.split('?')[0]);
  const f = rel.startsWith('/t/') ? path.join('/tmp/shell', rel.slice(3)) : path.join(REPO, rel);
  fs.readFile(f,(e,b)=>{ if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{'content-type':T[path.extname(f)]??'text/plain'}); r.end(b); }); });
await new Promise(r=>srv.listen(4495,r));
const b=await chromium.launch();
const VPS=[[1440,900],[1280,720],[1024,640],[900,1200]];
const findings=[];
for (const f of fs.readdirSync('/tmp/shell').sort((a,c)=>a.localeCompare(c,undefined,{numeric:true}))) {
  for (const [w,h] of VPS) {
    const p=await b.newPage({viewport:{width:w,height:h}});
    const errs=[]; p.on('pageerror',e=>errs.push(e.message.slice(0,80)));
    await p.goto('http://127.0.0.1:4495/t/'+f,{waitUntil:'load'});
    await p.waitForTimeout(120);
    const title=await p.title();
    const r=await p.evaluate(()=>{
      const out={};
      const sb=document.querySelector('.ui-sidebar'), tn=document.querySelector('.ui-top-nav');
      if (sb){ const R=sb.getBoundingClientRect(), L=R.left;
        const off=s=>{const n=document.querySelector(s);return n?Math.round(n.getBoundingClientRect().left-L):null;};
        const wd=s=>{const n=document.querySelector(s);return n?Math.round(n.getBoundingClientRect().width):null;};
        out.sb={w:Math.round(R.width),h:Math.round(R.height),
          nav:off('.ui-sidebar__nav'),navW:wd('.ui-sidebar__nav'),
          sec:off('.ui-sidebar__section'),secW:wd('.ui-sidebar__section'),
          scroll:off('.ui-sidebar__scroll'),scrollW:wd('.ui-sidebar__scroll'),
          overRight:0,footTop:null,footBottom:null};
        const foot=document.querySelector('.ui-sidebar__footer');
        if (foot){ const fr=foot.getBoundingClientRect(); out.sb.footBottom=Math.round(fr.bottom-R.bottom); }
        // 子元素越出侧栏左右边界
        let l=0,rr=0,lw='',rw='';
        for (const n of sb.querySelectorAll('*')){ const q=n.getBoundingClientRect();
          if (q.width<1||q.height<1) continue;
          if (getComputedStyle(n).position==='fixed') continue;
          if (n.closest('.ui-tooltip')) continue;
          const dl=Math.round(q.left-R.left), dr=Math.round(q.right-R.right);
          if (dl<l){l=dl;lw=(n.className||'').toString().split(' ')[0];}
          if (dr>rr){rr=dr;rw=(n.className||'').toString().split(' ')[0];} }
        out.sb.overLeft=l; out.sb.overRight=rr; out.sb.overLeftWho=lw; out.sb.overRightWho=rw;
        // 文本溢出（标签被撑破而不是省略）
        out.sb.textOverflow=[...sb.querySelectorAll('.ui-sidebar__item span, .ui-sidebar__subitem span')]
          .filter(n=>n.scrollWidth>n.clientWidth+1 && getComputedStyle(n).textOverflow!=='ellipsis').length;
      }
      if (tn){ const R=tn.getBoundingClientRect();
        let rr=0,rw=''; for (const n of tn.querySelectorAll('*')){ const q=n.getBoundingClientRect();
          if (q.width<1||q.height<1) continue; if (getComputedStyle(n).position==='fixed') continue;
          const dr=Math.round(q.right-R.right); if (dr>rr){rr=dr;rw=(n.className||'').toString().split(' ')[0];} }
        out.tn={h:Math.round(R.height),overRight:rr,overRightWho:rw,w:Math.round(R.width)};
      }
      out.pageScrollX=document.documentElement.scrollWidth-document.documentElement.clientWidth;
      return out;
    });
    await p.evaluate(()=>window.scrollTo(0,1200)); await p.waitForTimeout(120);
    const pin=await p.evaluate(()=>({
      sb:document.querySelector('.ui-sidebar')?Math.round(document.querySelector('.ui-sidebar').getBoundingClientRect().top):null,
      tn:document.querySelector('.ui-top-nav')?Math.round(document.querySelector('.ui-top-nav').getBoundingClientRect().top):null}));
    const bad=[];
    if (r.sb){
      if (r.sb.nav!==null && r.sb.sec!==null && r.sb.secW>0 && r.sb.nav!==r.sb.sec) bad.push(`nav/section 左边不齐 ${r.sb.nav}≠${r.sb.sec}`);
      if (r.sb.overLeft<-1) bad.push(`越出左边 ${r.sb.overLeft} (${r.sb.overLeftWho})`);
      if (r.sb.overRight>1) bad.push(`越出右边 ${r.sb.overRight} (${r.sb.overRightWho})`);
      if (r.sb.footBottom!==null && Math.abs(r.sb.footBottom)>1) bad.push(`footer 未贴底 ${r.sb.footBottom}`);
      if (r.sb.textOverflow) bad.push(`${r.sb.textOverflow} 处文本撑破无省略`);
      if (Math.abs(pin.sb)>2) bad.push(`sidebar 未吸顶 ${pin.sb}`);
    }
    if (r.tn){ if (r.tn.overRight>1) bad.push(`top-nav 越出右边 ${r.tn.overRight} (${r.tn.overRightWho})`);
      if (Math.abs(pin.tn)>2) bad.push(`top-nav 未吸顶 ${pin.tn}`); }
    if (r.pageScrollX>0) bad.push(`页面横向滚动 ${r.pageScrollX}`);
    if (errs.length) bad.push(`JS 错误 ${errs[0]}`);
    if (bad.length) findings.push(`${title} @${w}x${h} :: ${bad.join(' · ')}`);
    await p.close();
  }
}
console.log(`共 ${fs.readdirSync('/tmp/shell').length} 个用例 × ${VPS.length} 视口 = ${fs.readdirSync('/tmp/shell').length*VPS.length} 次检查`);
console.log(findings.length ? `\n${findings.length} 处问题:` : '\n无问题');
const seen=new Map();
for (const f of findings){ const k=f.split(' :: ')[1]; seen.set(k,(seen.get(k)||0)+1); }
for (const f of findings.slice(0,40)) console.log('  '+f);
if (findings.length>40) console.log(`  … 还有 ${findings.length-40} 条`);
console.log('\n按问题类型汇总:');
for (const [k,v] of [...seen].sort((a,c)=>c[1]-a[1])) console.log(`  ×${String(v).padStart(3)}  ${k}`);
await b.close(); srv.close();
