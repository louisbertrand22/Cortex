// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { remarkMermaid } from './src/plugins/remark-mermaid.mjs';
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs';

export default defineConfig({
  site: 'https://cortex.louis-bertrand.fr',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [mdx(), react(), sitemap()],
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
