// Captures et contrôles de rendu : 1440 px clair et 390 px sombre.
//   npm run shots                      toutes les leçons
//   npm run shots -- ia-zero /guide/   une matière, une page précise…
// Sortie : .shots/pages/<page>-<largeur>-<n>.png (tranches de 2000 px, lisibles telles quelles)
// Code de sortie 1 si un diagramme Mermaid est en erreur, si une erreur JS survient ou si la page déborde.
import { launch, openPage, outDir, pathsFromArgs, scrollThrough, slugOf, withPreview } from './lib.mjs';

const VIEWS = [{ width: 1440, scheme: 'light' }, { width: 390, scheme: 'dark' }];
const SLICE = 2000;

const paths = pathsFromArgs(process.argv.slice(2));
const out = outDir('pages');
let failed = false;

await withPreview(async () => {
  const browser = await launch();
  for (const path of paths) {
    for (const view of VIEWS) {
      const { page, errors } = await openPage(browser, path, view);
      await scrollThrough(page);
      const m = await page.evaluate(() => ({
        height: document.body.scrollHeight,
        overflow: document.documentElement.scrollWidth - innerWidth,
        mermaid: document.querySelectorAll('.mermaid-diagram svg').length,
        mermaidErr: document.querySelectorAll('.mermaid-diagram pre.text-danger').length,
        islands: document.querySelectorAll('astro-island').length,
      }));
      const files = [];
      for (let y = 0, i = 0; y < m.height; y += SLICE, i++) {
        const file = `${out}/${slugOf(path)}-${view.width}-${i}.png`;
        await page.screenshot({ path: file, fullPage: true, clip: { x: 0, y, width: view.width, height: Math.min(SLICE, m.height - y) } });
        files.push(file);
      }
      const problems = [
        m.mermaidErr && `${m.mermaidErr} diagramme(s) Mermaid invalide(s)`,
        m.overflow > 0 && `débordement horizontal de ${m.overflow} px`,
        ...errors.map((e) => `JS : ${e}`),
      ].filter(Boolean);
      failed ||= problems.length > 0;
      console.log(`${problems.length ? '✗' : '✓'} ${path} · ${view.width}px ${view.scheme} · ${m.mermaid} mermaid · ${m.islands} îlot(s) · ${files.length} capture(s)`);
      for (const p of problems) console.log(`    ${p}`);
      await page.close();
    }
  }
  await browser.close();
});

console.log(`\nCaptures : ${out}`);
process.exit(failed ? 1 : 0);
