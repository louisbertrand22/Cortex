# Créer une visualisation

Avant d'en créer une, vérifier qu'un composant MDX standard (`<Pipeline>`, `<BarChart>`, Mermaid, `<Compare>`…) ne
suffit pas. Un nouvel îlot se justifie quand **manipuler** fait comprendre (un curseur, un clic, une animation pas à pas).

## Deux sortes de composants

- **Statique** (`.astro` seul) : schéma sans interaction, rendu au build, zéro JavaScript envoyé.
  Exemples : `Layers`, `PriorityMatrix`, `RagTriangle`, `ValueChain`.
- **Îlot interactif** (React 19 + `motion`) : deux fichiers.
  - `NomIsland.tsx` : le composant React, `export default`.
  - `Nom.astro` : le wrapper qui porte la directive d'hydratation (MDX ne peut pas la porter lui-même) :

    ```astro
    ---
    import Island from './NomIsland';
    ---
    <Island client:visible {...Astro.props} />
    ```

    S'il prend des props, les typer dans le wrapper (`interface Props { … }`), comme `Pipeline.astro` ou `BarChart.astro`.

Puis **enregistrer** le wrapper dans `src/components/mdx/index.ts` (import + entrée dans `components`) : il devient
utilisable dans toutes les leçons sans import. L'ajouter aussi à la liste du cours concerné ci-dessous.

## Règles

- **Couleurs** : uniquement les tokens (`var(--signal)`, `var(--synapse)`, `var(--ink-2)`, `var(--line)`… ou les classes
  Tailwind `text-signal`, `bg-surface-2`, `border-line`). Jamais d'hexadécimal : le composant doit suivre le thème
  clair/sombre. Rappel du code couleur : `signal` = contenu du cours, `synapse` = enrichissement / réussite,
  `amber` = attention, `danger` = erreur.
- **SVG** : `viewBox` fixe et `className="w-full"`, pour s'adapter de 358 px (mobile) à 72rem. Texte SVG ≥ 3,5 unités
  pour un viewBox de 100 de large, sinon illisible sur mobile.
- **Animations** : `motion` (`motion.div`, `animate`, `useInView` pour démarrer à l'entrée dans l'écran), courbes sobres.
  Ne pas animer `points` d'un `<polygon>` dont le nombre de sommets varie (non interpolable) : utiliser un élément simple.
  `prefers-reduced-motion` : `src/styles/global.css` ne neutralise que les animations et transitions **CSS** ; celles de
  `motion` sont pilotées en JS. Pour une animation en boucle ou longue, lire `useReducedMotion()` (de `motion/react`)
  et afficher directement l'état final.
- **Accessibilité** : vrais `<button>`/`<input>`, `aria-label` sur les contrôles sans texte, état lisible sans la couleur
  (texte ou icône en plus).
- **Autonomie** : données en dur dans le fichier (pas de fetch), état initial déjà parlant (la capture d'écran sans
  interaction doit montrer quelque chose d'utile), un bouton « Recommencer » si l'état peut se perdre.
- **Textes** : en français, au ton du cours qui l'utilise. Un texte qui guide doit décrire l'interface réelle
  (« clique dans le graphique » et non « le dernier bouton » s'il n'y a pas de bouton).

## Vérifier

Dans une leçon (ou sur `/guide`) : build, puis rendu clair/sombre, 1440 px et 390 px, et **cliquer** sur chaque contrôle
(`npm run islands -- <page>` les actionne tous et capture avant/après dans `.shots/islands/` ; un scénario précis
— entraîner jusqu'au bout, enchaîner des choix — se teste à la main en preview). Aucune erreur dans la console.

## Îlots existants par cours

- **AIAD** : `AiNesting` · `Tokenizer` · `Temperature` · `PriorityMatrix` · `Maturity` · `Hosting` · `Tco` · `ContextWindow`
  · `EmbeddingMap` · `Chunking` · `RagTriangle` · `Layers` (bandeau TOGAF, prop `active`) · `ValueChain` (props `title`, `steps`).
- **ia-zero** : `Teach` (perceptron pommes/citrons) · `Neuron` (vote pondéré « aller au ciné ») · `NextWord` (mot suivant
  + température) · `PromptBuilder` (les 5 ingrédients d'un prompt) · `Refine`
  (itérer sur une réponse par relances).
- **ARCL** : `ServiceModels` (IaaS/PaaS/SaaS, qui gère quelle couche) · `Scaling` (scale out vs scale in, panne d'un
  serveur) · `AzFailure` (mono-AZ, multi-AZ, multi-région face à une panne).
- **UBSI** : `SplitModels` (standard, ERP, data centric, micro services) · `Availability` (composants en série ou en
  parallèle) · `IntegrationTiers` (intégration manuelle, IHM, AS, batch, base de données).
- **MÉTHODES** : `EffortRatios` (méthode des ratios : une estimation, toutes les phases) · `Prioritize` (backlog classé
  par RICE ou WSJF) · `CmmiLevels` (CMMI étagé vs continu, les 25 secteurs clés).
- **PIT** : `Harness` (le harnais autour du LLM : quelles tâches deviennent possibles) · `RackDensity` (densité d'un rack,
  refroidissement et réseau imposés) · `ChangeRisk` (changement ITIL validé selon le risque vs circuit unique alourdi)
  · `WorkloadPlacement` (quelle charge, où : cloud, CapEx sur site/HaaS, edge ou hybride) · `LockInCheck` (innovation
  ou vendor lock-in : les quatre questions et les règles d'or) · `AutonomyGate` (AIOps : niveau d'autonomie selon la
  réversibilité de l'action, le rollback testé et le contexte).
- **ARLA** : `CapTheorem` (choisir deux garanties sur trois, le cas Expense.io multi-région) · `SyncAsync` (soumission
  synchrone vs asynchrone face à une API lente) · `ApiStyles` (REST, GraphQL, POST Action, gRPC selon le consommateur)
  · `Idempotence` (rejouer une requête : l'état final change-t-il ?).
- **Génériques** : `Pipeline` · `BarChart`.
