/* Serves the template mirror the way the Design project serves it.
   The templates resolve everything through "../../" — tokens, the bundle, the
   stylesheets, every Assets/ path — which lands on the project root when the
   app serves them and on nothing at all when the files are opened from disk.
   That is why a local copy opened directly shows no CSS and a page of broken
   images: it is not the template failing, it is the root not being there.

   Both the audit and `serve:templates` mount the same three roots, so what the
   audit checks and what a person opens are the same page. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = () => path.resolve(fileURLToPath(import.meta.url), '../../..');

const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.json': 'application/json',
};

export function templateHost(repo = repoRoot()) {
  const PROJECT = path.join(repo, 'maintenance/ds-project');
  const TEMPLATES = path.join(repo, 'maintenance/templates');
  /* The project tree first, then the repository — Assets live in the repository
     and are copied into the project only at upload time. */
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]);
    const candidates = rel.startsWith('/templates/')
      ? [path.join(TEMPLATES, rel.slice('/templates/'.length))]
      : [path.join(PROJECT, rel), path.join(repo, rel)];
    for (const file of candidates) {
      try {
        const body = fs.readFileSync(file);
        res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
        res.end(body);
        return;
      } catch { /* try the next root */ }
    }
    res.writeHead(404);
    res.end();
  });
  return { server, repo, PROJECT, TEMPLATES };
}

export function templatePages(TEMPLATES) {
  return fs.readdirSync(TEMPLATES, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = path.join(TEMPLATES, entry.name);
      const page = fs.readdirSync(dir).find((f) => f.endsWith('.dc.html'));
      return page ? { name: entry.name, url: `/templates/${entry.name}/${page}` } : null;
    })
    .filter(Boolean);
}

/* What the mirror is, and how far it can be trusted. A copy that has drifted
   from the project produces confident findings about a page nobody is running —
   that already happened once, and cost an afternoon — so the provenance is
   printed every run rather than kept in a file nobody opens. */
export function syncNote(TEMPLATES) {
  try {
    const meta = JSON.parse(fs.readFileSync(path.join(TEMPLATES, '.synced.json'), 'utf8'));
    const stale = Object.entries(meta.files).filter(([rel]) => {
      try { return fs.statSync(path.join(TEMPLATES, rel)).size !== meta.files[rel].bytes; }
      catch { return true; }
    });
    const head = `  镜像自 Design 项目 · ${meta.syncedAt}`;
    return stale.length
      ? `${head} —— 但有 ${stale.length} 个文件与记录不符，已在本地改过或没同步：\n` +
        stale.map(([rel]) => `    ${rel}`).join('\n')
      : head;
  } catch {
    return '  没有 .synced.json —— 无法判断这份副本是不是项目的当前内容';
  }
}
