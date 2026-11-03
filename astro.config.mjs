// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import { remarkMermaid } from './src/plugins/remark-mermaid.mjs';
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs';

// Matières privées : hors sitemap (leurs pages sont verrouillées par middleware.ts)
const privateSubjects = JSON.parse(readFileSync(new URL('./src/content/subjects.json', import.meta.url), 'utf8'))
  .filter((s) => s.private)
  .map((s) => s.id);
const isPublicPage = (page) => {
  const { pathname } = new URL(page);
  return !/^\/(prive|connexion)\//.test(pathname) && !privateSubjects.some((id) => pathname.startsWith(`/cours/${id}/`));
};

export default defineConfig({
  site: 'https://cortex.louis-bertrand.fr',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [mdx(), react(), sitemap({ filter: isPublicPage })],
  markdown: {
    remarkPlugins: [remarkMermaid, remarkReadingTime],
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
