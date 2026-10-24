# Cortex — consignes pour l'agent

Site de révision statique (Astro 7 + MDX + Tailwind 4 + Pagefind + Mermaid). Toujours `nvm use` (Node 24) avant npm.

## Ingestion d'un nouveau cours

1. **Lire** le support source en entier (les HTML de cours pèsent plusieurs Mo à cause des polices/images base64 :
   extraire le texte avec un parser HTML, ignorer `<script>`/`<style>`).
2. **Matière** : ajouter une entrée dans `src/content/subjects.json` si elle n'existe pas (`id` = slug court, `plannedSessions`).
3. **Leçon** : `src/content/lessons/<subject-id>/<NN>-<slug>.mdx`, frontmatter validé par `src/content.config.ts`
   (`title`, `subtitle`, `subject`, `session`, `description`, `tags`, `objectives`, `sources`, `updated`).
4. **Rédaction** en français, termes techniques anglais conservés. Structure : une `##` par grande partie du support,
   `###` pour les concepts. Finir par `<Takeaways>` (les « 5 choses à retenir » du prof = matière du quiz).
5. **Fidélité vs enrichissement** — règle stricte :
   - le contenu du support est rédigé dans le flux normal ;
   - tout ce qui vient d'ailleurs (approfondissement, état de l'art, best practice, retour terrain) va dans `<DeepDive>`
     (couleur synapse/teal) et cite ses sources dans le frontmatter `sources`.
6. **Visualiser** chaque concept complexe : Mermaid (séquence, classes, flowchart, architecture, state), `<Pipeline>`,
   `<BarChart>`, ou un nouvel îlot dans `src/components/viz/` (React + motion, wrapper `.astro` avec `client:visible`,
   puis l'enregistrer dans `src/components/mdx/index.ts`). Couleurs : uniquement les tokens CSS (`var(--signal)`…).
7. Ajouter quelques `<Quiz>` (questions type quiz d'ouverture de session) et `<Callout type="exam">` sur les points testés.
8. `npm run build` doit passer sans erreur ; vérifier le rendu (thèmes clair et sombre, mobile 390 px).

## Composants MDX (sans import)

`Callout` (note|tip|warning|danger|definition|exam) · `DeepDive` · `Steps` · `CardGrid`/`Card` · `Compare` (props leftTitle/rightTitle, slots left/right)
· `Takeaways` · `KeyIdea` · `Stat` · `Figure` · `Quiz` · `Pipeline` · `BarChart`. Démo vivante : `/guide`.

## Pièges Mermaid

- `classDef x fill:var(--signal-soft),stroke:var(--signal);` est permis : les `var()` sont résolus au rendu (suivent le thème).
- `#` dans un texte de diagramme le tronque : écrire `#35;`. Pas de `;` dans les libellés (séparateur d'instructions).
- Préférer `flowchart TB` avec des sous-graphes `direction LR` : un diagramme trop large devient illisible (colonne de 72rem max, ~50rem sur un portable).

## Composants spécifiques au cours AIAD

`AiNesting` · `Tokenizer` · `Temperature` · `PriorityMatrix` · `Maturity` · `Hosting` · `Tco` · `ContextWindow` · `EmbeddingMap`
· `Chunking` · `RagTriangle` · `Layers` (bandeau TOGAF, prop `active`) · `ValueChain` (props `title`, `steps`).

## Cours « L'IA expliquée de zéro » (`ia-zero`)

Cours écrit pour un lycéen de seconde sans bagage technique : tutoiement, exemples du quotidien, aucun terme non
expliqué. Pas de support source : tout est rédigé ; `<DeepDive>` sert aux « pour aller plus loin ».
Composants : `Teach` (perceptron pommes/citrons) · `Neuron` (vote pondéré « aller au ciné ») · `NextWord` (mot suivant
+ température) · `PromptBuilder` (les 5 ingrédients d'un prompt).

## Conventions de design

Papier/encre, accent `signal` (vermillon) = contenu du cours, `synapse` (teal) = enrichissement. Display : Instrument Serif
(titres d'exergue uniquement), texte : Geist, code : Geist Mono. Animations sobres (`ease-out-expo`), respect de
`prefers-reduced-motion`. Pas de dépendance réseau au runtime.
