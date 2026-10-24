@AGENTS.md

# Spécifique à Claude Code

## Avant de commencer un cours

- Lire le support **en entier** avant d'écrire une ligne, puis annoncer le plan en une phrase (sessions, visualisations
  prévues) et enchaîner sans attendre de validation, sauf si le support est ambigu (session manquante, public inconnu).
- Pour un nouveau public (autre que des étudiants SIGL), demander une seule fois : niveau, tutoiement ou non, objectif.

## Vérification visuelle (sur la machine de Louis)

Les scripts playwright-core vivent hors du repo, dans `~/.cache/cortex-shots/` (Chromium :
`~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`) :

| Script | Rôle |
| --- | --- |
| `shot.mjs` | Captures d'une leçon à plusieurs largeurs + mesures de colonne |
| `ia0.mjs` | Captures pleine page de toutes les leçons (1440 clair / 390 sombre), compte les erreurs Mermaid et JS |
| `inter.mjs` | Clique dans les îlots et capture le résultat |
| `pwa.mjs` | Installabilité, service worker, hors ligne, bouton Installer |
| `assets.mjs` | Régénère les icônes PWA et `public/og.png` |

Adapter l'URL ou la liste de pages en tête de script, lancer `npm run preview -- --port 4329` en arrière-plan, puis
`node <script>`. Les pages longues sont découpées avec PIL avant d'être lues. Couper le preview à la fin
(`kill <pid>` ; éviter `pkill -f`, qui tue aussi le shell courant).

## Git

- Push en SSH sur `origin main` = mise en ligne : seulement après build **et** vérification visuelle.
- Messages de commit en français ; terminer par la ligne `Co-Authored-By` demandée par le harnais.
