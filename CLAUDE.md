@AGENTS.md

# Spécifique à Claude Code

## Avant de commencer un cours

- Lire le support **en entier** avant d'écrire une ligne, puis annoncer le plan en une phrase (sessions, visualisations
  prévues) et enchaîner sans attendre de validation, sauf si le support est ambigu (session manquante, public inconnu).
- Pour un nouveau public (autre que des étudiants SIGL), demander une seule fois : niveau, tutoiement ou non, objectif.

## Vérification visuelle

Utiliser les scripts du repo (détail dans `AGENTS.md` § Commandes) : `npm run build`, puis `npm run shots -- <page>` et,
s'il y a des îlots, `npm run islands -- <page>`. Lire ensuite les captures de `.shots/` avec Read (elles sont déjà
découpées en tranches de 2000 px) : un code de sortie 0 ne garantit pas que la mise en page est belle.
Ne pas lancer `astro preview` pour ces scripts (démon détaché qui survit à la session ; si un démon traîne :
`npx astro preview stop`), et éviter `pkill -f`, qui tue aussi le shell courant.

## Git

- Push en SSH sur `origin main` = mise en ligne : seulement après build **et** vérification visuelle.
- Messages de commit en français ; terminer par la ligne `Co-Authored-By` demandée par le harnais.
