// Test de fumée des îlots interactifs : chaque îlot est capturé, ses contrôles sont actionnés un par un,
// puis il est capturé à nouveau. Échoue si une erreur JS survient.
//   npm run islands                    toutes les leçons
//   npm run islands -- ia-zero/02      une leçon
// Sortie : .shots/islands/<page>-<largeur>-<n>-avant|apres.png
import { launch, openPage, outDir, pathsFromArgs, slugOf, withPreview } from './lib.mjs';

const VIEWS = [{ width: 1440, scheme: 'light' }, { width: 390, scheme: 'dark' }];
const MAX_CONTROLS = 12;

const paths = pathsFromArgs(process.argv.slice(2));
const out = outDir('islands');
let failed = false;

await withPreview(async () => {
  const browser = await launch();
  for (const path of paths) {
    for (const view of VIEWS) {
      const { page, errors } = await openPage(browser, path, { ...view, height: 1000 });
      const islands = page.locator('astro-island');
      const count = await islands.count();
      if (count === 0) { await page.close(); continue; }

      for (let i = 0; i < count; i++) {
        const island = islands.nth(i);
        // <astro-island> est en display: contents : on capture la figure qui l'entoure, sinon son premier enfant
        const figure = island.locator('xpath=ancestor::figure[1]');
        const frame = (await figure.count()) ? figure : island.locator(':scope > *').first();
        await frame.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        const name = `${out}/${slugOf(path)}-${view.width}-${i}`;
        await frame.screenshot({ path: `${name}-avant.png` });

        const controls = island.locator('button:visible, input[type=checkbox]:visible, input[type=radio]:visible');
        const n = Math.min(await controls.count(), MAX_CONTROLS);
        for (let k = 0; k < n; k++) {
          await controls.nth(k).click({ timeout: 2000 }).catch(() => {});
          await page.waitForTimeout(250);
        }
        const ranges = island.locator('input[type=range]:visible');
        for (let k = 0; k < (await ranges.count()); k++) {
          await ranges.nth(k).fill(await ranges.nth(k).getAttribute('max') ?? '1').catch(() => {});
        }
        await page.waitForTimeout(800);
        await frame.screenshot({ path: `${name}-apres.png` });
        console.log(`  îlot ${i} : ${n} contrôle(s) actionné(s)`);
      }
      failed ||= errors.length > 0;
      console.log(`${errors.length ? '✗' : '✓'} ${path} · ${view.width}px ${view.scheme} · ${count} îlot(s)`);
      for (const e of errors) console.log(`    JS : ${e}`);
      await page.close();
    }
  }
  await browser.close();
});

console.log(`\nCaptures : ${out}`);
process.exit(failed ? 1 : 0);
