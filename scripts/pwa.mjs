// Vérifie la PWA sur le build : manifeste, installabilité, service worker, hors ligne, bouton Installer.
//   npm run check:pwa
import { BASE, launch, outDir, withPreview } from './lib.mjs';

const out = outDir('pwa');
const problems = [];

await withPreview(async () => {
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });

  const cdp = await ctx.newCDPSession(page);
  const manifest = await cdp.send('Page.getAppManifest');
  if (!manifest.url) problems.push('aucun manifeste lié');
  for (const e of manifest.errors) problems.push(`manifeste : ${e.message}`);
  // « in-incognito » est propre au navigateur de test (profil éphémère), pas au site
  const install = (await cdp.send('Page.getInstallabilityErrors')).installabilityErrors.filter((e) => e.errorId !== 'in-incognito');
  for (const e of install) problems.push(`installabilité : ${e.errorId}`);

  const sw = await page.evaluate(async () => (await navigator.serviceWorker.ready).active?.state);
  if (sw !== 'activated') problems.push(`service worker : ${sw ?? 'absent'}`);

  // Simule la proposition d'installation de Chrome : le bouton doit apparaître
  await page.evaluate(() => {
    const e = Object.assign(new Event('beforeinstallprompt'), { prompt: async () => {}, userChoice: Promise.resolve({ outcome: 'dismissed' }) });
    dispatchEvent(e);
  });
  if (!(await page.locator('[data-install-btn]').isVisible())) problems.push('bouton Installer invisible après beforeinstallprompt');
  await page.screenshot({ path: `${out}/entete.png`, clip: { x: 0, y: 0, width: 1440, height: 80 } });

  // Hors ligne : une page précachée doit s'afficher
  await ctx.setOffline(true);
  const offline = await page.goto(BASE + '/cours/').then(() => page.title(), (e) => `erreur : ${e.message}`);
  if (!offline.includes('Cours')) problems.push(`hors ligne : ${offline}`);
  await ctx.setOffline(false);

  // iPhone : pas d'API d'installation, le bouton explique le geste
  const ios = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, colorScheme: 'dark',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  });
  const phone = await ios.newPage();
  await phone.goto(BASE + '/', { waitUntil: 'networkidle' });
  await phone.click('[data-install-btn]');
  if (!(await phone.locator('[data-install-ios]').isVisible())) problems.push('iOS : explication d\'installation absente');
  await phone.screenshot({ path: `${out}/ios.png`, clip: { x: 0, y: 0, width: 390, height: 260 } });

  problems.push(...errors.map((e) => `JS : ${e}`));
  await browser.close();
});

if (problems.length) {
  console.log('✗ PWA');
  for (const p of problems) console.log(`    ${p}`);
} else {
  console.log('✓ PWA : manifeste, installable, service worker actif, hors ligne, bouton Installer (Chrome et iOS)');
}
console.log(`\nCaptures : ${out}`);
process.exit(problems.length ? 1 : 0);
