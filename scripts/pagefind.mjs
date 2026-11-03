// Index de recherche Pagefind, en deux parties :
//   dist/pagefind/        pages publiques, chargé par tout le monde ;
//   dist/prive/pagefind/  pages des matières privées (sans les copies de /prive/lecons/), servi derrière le verrou de middleware.ts
//                         (/prive/…) et fusionné par la recherche quand le visiteur est connecté.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import * as pagefind from 'pagefind';

const root = join(import.meta.dirname, '..');
const dist = join(root, 'dist');
const privateIds = JSON.parse(readFileSync(join(root, 'src/content/subjects.json'), 'utf8'))
  .filter((s) => s.private)
  .map((s) => s.id);

const html = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return ['_astro', 'pagefind'].includes(e.name) ? [] : html(p);
    return e.name.endsWith('.html') ? [p] : [];
  });

const pages = html(dist).map((file) => {
  const url = '/' + relative(dist, file).split(sep).join('/').replace(/(^|\/)index\.html$/, '$1');
  return { url, content: readFileSync(file, 'utf8') };
});
// Copies des leçons publiques à navigation complète : déjà dans l'index public, à ne pas indexer deux fois
const isCopy = (url) => url.startsWith('/prive/lecons/');
const isPrivate = (url) => url.startsWith('/prive/') || privateIds.some((id) => url.startsWith(`/cours/${id}/`));

async function build(label, files, outputPath) {
  const { index, errors } = await pagefind.createIndex({ forceLanguage: 'fr' });
  if (!index) throw new Error(errors.join('\n'));
  for (const f of files) await index.addHTMLFile(f);
  const { errors: writeErrors } = await index.writeFiles({ outputPath });
  if (writeErrors.length) throw new Error(writeErrors.join('\n'));
  // Pagefind n'indexe que les pages qui portent data-pagefind-body (leçons, guide)
  const indexed = files.filter((f) => f.content.includes('data-pagefind-body')).length;
  console.log(`Pagefind ${label} : ${indexed} pages indexées → ${relative(root, outputPath)}`);
}

await build('public', pages.filter((p) => !isPrivate(p.url)), join(dist, 'pagefind'));
await build('privé', pages.filter((p) => isPrivate(p.url) && !isCopy(p.url)), join(dist, 'prive/pagefind'));
await pagefind.close();
