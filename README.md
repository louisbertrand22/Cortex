# Cortex

Plateforme de révision **100 % statique** : mes cours EPITA SIGL transformés en pages visuelles, enrichies et interactives.
Déployée sur Vercel → `cortex.louis-bertrand.fr`.

## Stack

| Rôle | Outil |
| --- | --- |
| Framework | Astro 7 (output `static`) + MDX |
| Style | Tailwind CSS 4 + `@tailwindcss/typography` |
| Interactivité | Îlots React 19 + `motion` (hydratés `client:visible`) |
| Diagrammes | Mermaid 12 (blocs ` ```mermaid `, rendu client, suit le thème) |
| Recherche | Pagefind (index généré au build, aucun service externe) |

## Commandes

```bash
nvm use            # Node 24 (Astro 7 exige >= 22.23)
npm run dev        # http://localhost:4321 — la recherche n'y fonctionne pas (index généré au build)
npm run build      # astro build + pagefind --site dist
npm run preview    # sert dist/ avec la recherche
npm run shots      # captures + contrôles de rendu (Mermaid, JS, débordement) → .shots/
npm run islands    # actionne les îlots interactifs et capture avant/après
npm run check:pwa  # vérifie l'app installable et le hors-ligne
npm run assets     # régénère icônes et image de partage
```

## Arborescence

```
src/
  content.config.ts          # schémas : subjects (matières) et lessons (sessions)
  content/subjects.json      # une entrée par matière
  content/lessons/<matière>/<NN-slug>.mdx
  components/mdx/            # composants disponibles dans toutes les leçons, sans import
  components/viz/            # îlots React animés (+ wrapper .astro portant client:visible)
  components/layout/         # header, sidebar, TOC, recherche, thème
  plugins/                   # remark : mermaid, temps de lecture
  pages/guide.mdx            # référence visuelle de tous les composants → /guide
```

## Ajouter un cours

Voir `AGENTS.md` (procédure complète, lue par tous les agents ; `CLAUDE.md` l'importe), puis
`src/content/lessons/AGENTS.md` pour la rédaction et `src/components/viz/AGENTS.md` pour les visualisations. En résumé : ajouter la matière dans `subjects.json` si nouvelle,
créer `src/content/lessons/<matière>/<NN-slug>.mdx`, `npm run build`, pousser.

## Déploiement Vercel

Importer le repo dans Vercel (preset Astro détecté, `vercel.json` fourni), puis ajouter le domaine
`cortex.louis-bertrand.fr` dans *Settings → Domains* et créer chez le registrar un enregistrement
`CNAME cortex → cname.vercel-dns.com`. Node 24 est sélectionné via `engines`.
