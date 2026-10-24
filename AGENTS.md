# Cortex — guide pour les agents

Site de révision statique : des supports de cours transformés en pages visuelles, enrichies et interactives.
Astro 7 (output `static`) + MDX + Tailwind 4 + îlots React 19/motion + Mermaid 12 + Pagefind.
En ligne sur `cortex.louis-bertrand.fr` (Vercel). **Un push sur `main` = une mise en production.**

Ce fichier est la référence commune à tous les agents. Des guides plus précis vivent à côté du code :

| Fichier | Quand le lire |
| --- | --- |
| `src/content/lessons/AGENTS.md` | Rédiger ou modifier une leçon (frontmatter, structure, ton, modèle à copier) |
| `src/components/viz/AGENTS.md` | Créer une visualisation interactive (îlot React) |
| `src/pages/guide.mdx` → `/guide` | Voir le rendu de chaque composant MDX |

## Commandes

```bash
source ~/.nvm/nvm.sh && nvm use   # Node 24, obligatoire avant toute commande npm
npm run dev                       # http://localhost:4321 (la recherche n'y marche pas)
npm run build                     # astro build + index Pagefind : doit passer sans erreur
npm run preview                   # sert dist/ avec la recherche
```

Coupe les serveurs (dev/preview) que tu as lancés avant de rendre la main.

## Arborescence utile

```
src/content/subjects.json                 # une entrée par matière
src/content/lessons/<matière>/<NN-slug>.mdx
src/content.config.ts                     # schémas Zod des deux collections (source de vérité)
src/components/mdx/index.ts               # composants disponibles dans les leçons, sans import
src/components/viz/                       # îlots React + wrapper .astro (client:visible)
src/layouts/                              # BaseLayout (SEO, PWA), LessonLayout, GuideLayout
public/                                   # manifeste, service worker, icônes, og.png, robots.txt
```

## Intégrer un nouveau cours — procédure

L'utilisateur fournit en général un support (HTML exporté, PDF, notes) et demande « ajoute le cours ».
Un cours = une **matière** (`subjects.json`) découpée en **sessions** (une leçon MDX par session).

### 1. Lire le support en entier

- Les HTML de cours pèsent plusieurs Mo (polices et images en base64) : extraire le texte avec un parser HTML
  (Python `html.parser`/BeautifulSoup), en ignorant `<script>` et `<style>`. Ne jamais `cat` le fichier brut.
- PDF : extraire le texte page par page ; regarder les pages-schémas en image si elles portent du sens.
- Repérer : le plan, les définitions, les chiffres, les schémas, les « choses à retenir » / questions de quiz du prof.

### 2. Déclarer la matière (si elle n'existe pas)

Ajouter un objet dans `src/content/subjects.json` :

```json
{
  "id": "slug-court",
  "title": "Titre complet de l'UE",
  "short": "SIGLE",
  "description": "Une à deux phrases, 120-160 caractères : c'est aussi la meta description Google.",
  "teacher": "Prénom Nom",
  "semester": "S9",
  "domain": "ia",
  "accent": "signal",
  "order": 3,
  "plannedSessions": 5,
  "upcoming": [{ "session": 2, "title": "Titre annoncé", "description": "Optionnel" }]
}
```

- `domain` ∈ `ia | architecture | infrastructure | genie-logiciel | securite | data | autre`. Un nouveau domaine
  demande de l'ajouter à l'enum de `src/content.config.ts` **et** à `domainLabels` dans `src/lib/content.ts`.
- `plannedSessions` : nombre total de sessions de l'UE ; les sessions sans leçon s'affichent en pointillés « à venir ».
- `upcoming` : titres des sessions annoncées mais pas encore rédigées. **Retirer l'entrée dès que la leçon existe.**
- `order` : position dans la liste des cours (le plus petit en premier).

### 3. Rédiger la leçon

Fichier `src/content/lessons/<matière>/<NN>-<slug>.mdx` (`NN` = numéro de session sur deux chiffres).
Toutes les règles de rédaction, le frontmatter et un modèle complet sont dans **`src/content/lessons/AGENTS.md`**.

Les deux règles qui ne se négocient pas :

1. **Fidélité vs enrichissement.** Ce qui vient du support est rédigé dans le flux normal. Tout ce qui vient
   d'ailleurs (approfondissement, état de l'art, best practice, retour terrain) va dans `<DeepDive>` et cite
   sa source dans le frontmatter `sources`.
2. **Visualiser chaque concept complexe** : Mermaid, `<Pipeline>`, `<BarChart>`, `<Compare>`… ou un nouvel îlot
   (`src/components/viz/AGENTS.md`) quand manipuler aide à comprendre.

### 4. Vérifier

- `npm run build` sans erreur ni avertissement de contenu. Pagefind doit indexer une page de plus.
- Rendu réel, pas seulement le build : `npm run preview`, puis contrôler la page en **clair et sombre**,
  en **1440 px** et en **390 px** (mobile) :
  - aucun diagramme Mermaid en erreur (« Syntax error ») ;
  - pas de débordement horizontal (`document.documentElement.scrollWidth` = largeur de la fenêtre) ;
  - aucune erreur JavaScript ; chaque îlot réagit aux clics ;
  - les titres de `<Compare>` s'affichent, les `<Stat>` ne passent pas à la ligne bizarrement.
- La page de la matière (`/cours/<matière>/`) montre la nouvelle session ; la recherche (Ctrl K) la trouve.

### 5. Livrer

- Commit en français, au présent, qui dit ce qui change (« Ajoute la session 3 d'AIAD : RAG avancé »).
- `git push origin main` (SSH) déclenche le déploiement Vercel. Ne pousser qu'un build vérifié.
- Rendre compte : ce qui a été ajouté, les choix d'enrichissement faits, ce qui reste à faire (sessions à venir).

## Composants MDX (sans import)

Rendu de chacun sur `/guide`. Props exactes dans `src/components/mdx/*.astro`.

| Composant | Usage |
| --- | --- |
| `<Callout type="…" title="…">` | `note`, `tip`, `warning`, `danger`, `definition`, `exam` (point testé à l'examen) |
| `<DeepDive title="…" level="…">` | Enrichissement hors support. `level` : `approfondissement`, `best-practice`, `terrain`, `état-de-l-art` |
| `<Steps>` | Liste numérotée en frise (contenu = liste Markdown `1.`) |
| `<CardGrid cols={2\|3}>` + `<Card title kicker tone>` | Grille de cartes. `tone` : `default`, `signal`, `synapse`, `amber`, `danger`, `muted` |
| `<Compare leftTitle rightTitle>` | Deux colonnes, contenu dans `<Fragment slot="left">` / `<Fragment slot="right">` |
| `<Stat value label hint>` | Chiffre clé (valeur courte : « 1 000 Md », pas une phrase) |
| `<KeyIdea>` | La phrase à retenir d'une partie |
| `<Figure caption wide>` | Cadre + légende autour d'un schéma ou d'un îlot |
| `<Quiz question options={[…]} answer={i}>` | QCM, explication en contenu. `answer` = index à partir de 0 |
| `<Takeaways>` | « À retenir » final, 5 points maximum (liste `1.`) |
| `<Pipeline steps={[{title, caption, detail, tone}]}>` | Étapes séquentielles animées et cliquables |
| `<BarChart unit data={[{label, value, highlight}]}>` | Barres animées |

Îlots spécifiques à un cours : voir `src/components/viz/AGENTS.md`.

## Pièges connus

- **MDX — slot et prop de même nom** : un slot nommé (`<Fragment slot="x">`) écrase une prop `x`. D'où
  `leftTitle`/`rightTitle` sur `<Compare>`. Ne jamais donner à une prop le nom d'un slot.
- **Mermaid** :
  - `classDef x fill:var(--signal-soft),stroke:var(--signal);` est permis (les `var()` suivent le thème) ;
  - `#` dans un libellé le tronque : écrire `#35;`. Pas de `;` dans un libellé (séparateur d'instructions) ;
  - préférer `flowchart TB` avec des sous-graphes `direction LR` : un diagramme large devient illisible
    (colonne de 72rem max, ~50rem sur un portable, 358 px sur mobile).
- **Accolades en MDX** : `{` et `}` dans le texte sont interprétés comme du JS. Les échapper (`\{`) ou les mettre en code.
- **`<` en MDX** : `a < b` dans le texte casse le parseur ; écrire `&lt;` ou reformuler.
- **Brouillon** : `draft: true` dans le frontmatter masque la leçon en production (visible en dev).

## Conventions de design

Papier/encre, accent `signal` (vermillon) = contenu du cours, `synapse` (teal) = enrichissement. Display : Instrument Serif
(titres d'exergue uniquement), texte : Geist, code : Geist Mono. Couleurs : **uniquement les tokens CSS**
(`var(--signal)`, `text-ink-2`…), jamais d'hexadécimal dans un composant. Animations sobres (`ease-out-expo`),
respect de `prefers-reduced-motion`. **Pas de dépendance réseau au runtime** (polices et scripts servis par le site).

## SEO et PWA

- `BaseLayout` gère canonical, Open Graph/Twitter (`/og.png`), JSON-LD (prop `jsonLd`, `@context` ajouté) et `noindex`
  (404 seulement). Les leçons émettent `LearningResource` + `BreadcrumbList`, les matières `Course`
  (helpers `author`/`breadcrumbLd` dans `src/lib/content.ts`). Rien à faire pour un nouveau cours : le `title` et la
  `description` du frontmatter deviennent le titre et la meta description.
- PWA : `public/manifest.webmanifest`, `public/sw.js` (pages réseau d'abord, `/_astro/` cache d'abord ; incrémenter
  `CACHE` si la stratégie change). `InstallButton` (en-tête) n'apparaît que si l'installation est possible, ou sur iOS.

## Cours existants

| id | Matière | Public | Particularités |
| --- | --- | --- | --- |
| `aiad` | Architecture AI Driven (S9, Gabriel Lion) | Étudiants ingénieurs | Dérivé des supports du prof ; tutoiement, ton direct, termes anglais conservés |
| `ia-zero` | L'IA expliquée de zéro (Seconde) | Lycéen non technique | Pas de support : tout est rédigé ; tutoiement ; aucun terme non expliqué |
