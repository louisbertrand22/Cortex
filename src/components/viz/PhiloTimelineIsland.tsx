import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

/**
 * Frise des philosophes : 2 600 ans de philosophie sur un axe linéaire,
 * filtrés par époque, avec une fiche (idée clé, citation sourcée, session du cours).
 */
type Era = 'antiquite' | 'moyen-age' | 'classique' | 'lumieres' | 'contemporain';
interface Philo {
  name: string;
  from: number;
  to: number;
  era: Era;
  idea: string;
  quote?: string;
  source?: string;
  sessions?: string;
  east?: boolean;
}

const ERAS: { id: Era; label: string; span: string }[] = [
  { id: 'antiquite', label: 'Antiquité', span: 'VIe s. av. J.-C. – Ve s.' },
  { id: 'moyen-age', label: 'Moyen Âge', span: 'Ve – XVe s.' },
  { id: 'classique', label: 'Renaissance et âge classique', span: 'XVIe – XVIIe s.' },
  { id: 'lumieres', label: 'Lumières et XIXe siècle', span: 'XVIIIe – XIXe s.' },
  { id: 'contemporain', label: 'XXe siècle et après', span: 'depuis 1900' },
];

const PHILOS: Philo[] = [
  { name: 'Thalès', from: -625, to: -547, era: 'antiquite', idea: 'Le premier à chercher une explication de la nature sans passer par les dieux : tout viendrait de l’eau. La réponse est fausse, la démarche fonde la philosophie.' },
  { name: 'Confucius', from: -551, to: -479, era: 'antiquite', east: true, idea: 'En Chine, une sagesse de la vie en société : la vertu s’apprend, par l’étude et le respect des relations entre les personnes.', quote: 'Ce que tu ne veux pas qu’on te fasse, ne le fais pas aux autres.', source: 'Entretiens, XV, 23', sessions: '7' },
  { name: 'Héraclite', from: -544, to: -480, era: 'antiquite', idea: 'Tout change sans cesse ; la réalité est un flux où les contraires s’opposent et s’équilibrent.', quote: 'On ne se baigne jamais deux fois dans le même fleuve.', source: 'formule rapportée par Platon, Cratyle, 402a' },
  { name: 'Socrate', from: -470, to: -399, era: 'antiquite', idea: 'N’a rien écrit. Interroge les Athéniens pour leur montrer qu’ils ne savent pas ce qu’ils croient savoir. Condamné à mort en 399 av. J.-C.', quote: 'Une vie sans examen ne vaut pas la peine d’être vécue.', source: 'Platon, Apologie de Socrate, 38a', sessions: '1' },
  { name: 'Platon', from: -428, to: -348, era: 'antiquite', idea: 'Élève de Socrate. Derrière le monde sensible, changeant, existent des Idées éternelles que seule la raison atteint.', quote: 'C’est tout à fait d’un philosophe, ce sentiment : s’étonner.', source: 'Théétète, 155d', sessions: '1, 3' },
  { name: 'Aristote', from: -384, to: -322, era: 'antiquite', idea: 'Élève de Platon, il invente la logique, classe les sciences et fait du bonheur le but de la vie humaine, atteint par la vertu.', quote: 'Tous les hommes désirent naturellement savoir.', source: 'Métaphysique, A, 1', sessions: '2, 6' },
  { name: 'Épicure', from: -341, to: -270, era: 'antiquite', idea: 'Le bonheur, c’est l’absence de trouble : peu de désirs, des amis, et ne pas craindre la mort.', quote: 'La mort n’est rien pour nous.', source: 'Lettre à Ménécée', sessions: '6, 11' },
  { name: 'Épictète', from: 50, to: 135, era: 'antiquite', idea: 'Esclave affranchi, stoïcien : distinguer ce qui dépend de nous (nos jugements) de ce qui n’en dépend pas.', quote: 'Ce qui trouble les hommes, ce ne sont pas les choses, mais les jugements qu’ils portent sur les choses.', source: 'Manuel, V', sessions: '6' },
  { name: 'Augustin', from: 354, to: 430, era: 'moyen-age', idea: 'Unit la philosophie grecque et la foi chrétienne. Explore l’intériorité, le temps, la volonté et le mal.', quote: 'Qu’est-ce donc que le temps ? Si personne ne me le demande, je le sais ; si je veux l’expliquer, je ne le sais plus.', source: 'Confessions, XI, 14' },
  { name: 'Avicenne', from: 980, to: 1037, era: 'moyen-age', east: true, idea: 'Médecin et philosophe persan, il prolonge Aristote et distingue ce qu’une chose est (essence) du fait qu’elle existe.' },
  { name: 'Averroès', from: 1126, to: 1198, era: 'moyen-age', east: true, idea: 'Philosophe de Cordoue, grand commentateur d’Aristote : la raison et la révélation ne peuvent pas se contredire.' },
  { name: 'Thomas d’Aquin', from: 1225, to: 1274, era: 'moyen-age', idea: 'Réconcilie Aristote et la théologie chrétienne : la raison mène loin, la foi va au-delà.' },
  { name: 'Machiavel', from: 1469, to: 1527, era: 'classique', idea: 'Regarde la politique telle qu’elle est, pas telle qu’elle devrait être : le prince doit savoir ne pas être bon.', source: 'Le Prince (1532)', sessions: '9' },
  { name: 'Montaigne', from: 1533, to: 1592, era: 'classique', idea: 'Se prend lui-même comme sujet d’étude. Doute, tolérance et lucidité sur la diversité des coutumes.', quote: 'Que sais-je ?', source: 'Essais, II, 12', sessions: '1' },
  { name: 'Hobbes', from: 1588, to: 1679, era: 'classique', idea: 'Sans État, c’est la guerre de chacun contre chacun : les hommes acceptent un pouvoir fort pour être en sécurité.', quote: 'La vie de l’homme est alors solitaire, misérable, dangereuse, animale et brève.', source: 'Léviathan (1651), chap. 13', sessions: '9' },
  { name: 'Descartes', from: 1596, to: 1650, era: 'classique', idea: 'Doute de tout pour trouver une certitude inébranlable : la pensée qui doute existe. Sépare l’esprit et le corps.', quote: 'Je pense, donc je suis.', source: 'Discours de la méthode (1637), IV', sessions: '3, 5' },
  { name: 'Pascal', from: 1623, to: 1662, era: 'classique', idea: 'Mathématicien et croyant : la raison a des limites, l’homme est grand et misérable à la fois.', quote: 'Le cœur a ses raisons que la raison ne connaît point.', source: 'Pensées' },
  { name: 'Spinoza', from: 1632, to: 1677, era: 'classique', idea: 'Tout est nécessaire dans la nature ; la liberté n’est pas de choisir, mais de comprendre ce qui nous détermine.', quote: 'Les hommes se trompent en ce qu’ils se croient libres ; et cette opinion consiste en cela seul qu’ils sont conscients de leurs actions et ignorants des causes qui les déterminent.', source: 'Éthique (1677), II, prop. 35, scolie', sessions: '8' },
  { name: 'Locke', from: 1632, to: 1704, era: 'classique', idea: 'À la naissance, l’esprit est une page blanche : toutes nos idées viennent de l’expérience. Le pouvoir doit respecter les droits naturels.', sessions: '3, 9' },
  { name: 'Hume', from: 1711, to: 1776, era: 'lumieres', idea: 'Empiriste radical : la causalité n’est qu’une habitude de l’esprit, et ce sont les passions qui nous font agir.', quote: 'La raison est, et ne doit qu’être, l’esclave des passions.', source: 'Traité de la nature humaine (1739), II, 3, 3', sessions: '3, 4' },
  { name: 'Rousseau', from: 1712, to: 1778, era: 'lumieres', idea: 'La société corrompt l’homme ; un contrat social juste fait de chacun un citoyen qui obéit à la loi qu’il s’est donnée.', quote: 'L’homme est né libre, et partout il est dans les fers.', source: 'Du contrat social (1762), I, 1', sessions: '9' },
  { name: 'Kant', from: 1724, to: 1804, era: 'lumieres', idea: 'Fixe les limites de la connaissance et fonde la morale sur le devoir : agir selon une règle que tout le monde pourrait suivre.', quote: 'Aie le courage de te servir de ton propre entendement !', source: 'Qu’est-ce que les Lumières ? (1784)', sessions: '1, 3, 7' },
  { name: 'Hegel', from: 1770, to: 1831, era: 'lumieres', idea: 'L’histoire est le progrès de la liberté ; la conscience de soi naît de la lutte pour être reconnu par autrui.', quote: 'Rien de grand ne s’est accompli dans le monde sans passion.', source: 'Leçons sur la philosophie de l’histoire', sessions: '10' },
  { name: 'Mill', from: 1806, to: 1873, era: 'lumieres', idea: 'Utilitariste : une action est bonne si elle produit le plus grand bonheur pour le plus grand nombre. Défenseur de la liberté d’expression.', quote: 'Il vaut mieux être Socrate insatisfait qu’un imbécile satisfait.', source: 'L’Utilitarisme (1861), chap. 2', sessions: '6, 7' },
  { name: 'Marx', from: 1818, to: 1883, era: 'lumieres', idea: 'Les conditions matérielles et la lutte des classes font l’histoire ; la philosophie doit servir à changer le monde.', quote: 'Les philosophes n’ont fait qu’interpréter le monde de différentes manières ; ce qui importe, c’est de le transformer.', source: 'Thèses sur Feuerbach (1845), XI' },
  { name: 'Nietzsche', from: 1844, to: 1900, era: 'lumieres', idea: 'Démasque les valeurs morales héritées et appelle à créer ses propres valeurs.', quote: 'Dieu est mort.', source: 'Le Gai Savoir (1882), § 125', sessions: '11' },
  { name: 'Freud', from: 1856, to: 1939, era: 'contemporain', idea: 'Une grande partie de notre vie psychique est inconsciente : nous ne savons pas tout ce qui nous fait agir.', quote: 'Le moi n’est pas maître dans sa propre maison.', source: 'Une difficulté de la psychanalyse (1917)', sessions: '5' },
  { name: 'Wittgenstein', from: 1889, to: 1951, era: 'contemporain', idea: 'Beaucoup de problèmes philosophiques naissent de malentendus sur le langage.', quote: 'Ce dont on ne peut parler, il faut le taire.', source: 'Tractatus logico-philosophicus (1921), 7', sessions: '10' },
  { name: 'Popper', from: 1902, to: 1994, era: 'contemporain', idea: 'Une théorie est scientifique si une expérience pourrait la réfuter : la science avance par essais et erreurs.', source: 'Logique de la découverte scientifique (1934)', sessions: '4' },
  { name: 'Jonas', from: 1903, to: 1993, era: 'contemporain', idea: 'Notre puissance technique crée une responsabilité nouvelle envers les générations futures.', quote: 'Agis de façon que les effets de ton action soient compatibles avec la permanence d’une vie authentiquement humaine sur terre.', source: 'Le Principe responsabilité (1979)', sessions: '12' },
  { name: 'Sartre', from: 1905, to: 1980, era: 'contemporain', idea: 'L’homme n’a pas de nature fixée d’avance : il se définit par ses choix, dont il est entièrement responsable.', quote: 'L’existence précède l’essence.', source: 'L’existentialisme est un humanisme (1946)', sessions: '8, 10, 11' },
  { name: 'Arendt', from: 1906, to: 1975, era: 'contemporain', idea: 'Pense le totalitarisme et la « banalité du mal » : le mal peut naître de l’absence de pensée.', source: 'Eichmann à Jérusalem (1963)', sessions: '7' },
  { name: 'Beauvoir', from: 1908, to: 1986, era: 'contemporain', idea: 'La condition des femmes n’est pas une donnée naturelle mais une construction sociale.', quote: 'On ne naît pas femme : on le devient.', source: 'Le Deuxième Sexe (1949)', sessions: '10' },
  { name: 'Camus', from: 1913, to: 1960, era: 'contemporain', idea: 'Le monde ne répond pas à notre besoin de sens : c’est l’absurde. Il faut vivre et se révolter quand même.', quote: 'Il faut imaginer Sisyphe heureux.', source: 'Le Mythe de Sisyphe (1942)', sessions: '11' },
  { name: 'Rawls', from: 1921, to: 2002, era: 'contemporain', idea: 'Une société juste est celle qu’on choisirait sans savoir quelle place on y occuperait (le « voile d’ignorance »).', source: 'Théorie de la justice (1971)', sessions: '9' },
  { name: 'Singer', from: 1946, to: 2026, era: 'contemporain', idea: 'La souffrance des animaux compte moralement : l’ignorer est une discrimination, le « spécisme ».', source: 'La Libération animale (1975)', sessions: '12' },
];

const MIN = -650;
const MAX = 2030;
const X = (year: number) => 4 + ((year - MIN) / (MAX - MIN)) * 92;
const year = (y: number) => (y < 0 ? `${-y} av. J.-C.` : `${y}`);
const TICKS = [-500, 0, 500, 1000, 1500, 2000];

export default function PhiloTimelineIsland() {
  const [era, setEra] = useState<Era>('antiquite');
  const [sel, setSel] = useState('Socrate');
  const p = PHILOS.find((x) => x.name === sel)!;
  const list = PHILOS.filter((x) => x.era === era);
  const alive = p.name === 'Singer' ? `né en ${p.from}` : `${year(p.from)} – ${year(p.to)}`;

  return (
    <div className="grid gap-5">
      <svg viewBox="0 0 100 20" className="w-full" role="img" aria-label={`Frise de ${year(MIN)} à aujourd'hui, ${p.name} en surbrillance`}>
        <line x1="4" x2="96" y1="10" y2="10" stroke="var(--line-strong)" strokeWidth="0.4" />
        {TICKS.map((t) => (
          <g key={t}>
            <line x1={X(t)} x2={X(t)} y1="10" y2="12" stroke="var(--line-strong)" strokeWidth="0.3" />
            <text x={X(t)} y="17" textAnchor="middle" fontSize="3.5" fill="var(--ink-3)">{t === 0 ? '0' : t < 0 ? '−500' : t}</text>
          </g>
        ))}
        {PHILOS.map((x) => (
          <line key={x.name} x1={X(x.from)} x2={X(x.from)} y1="7.5" y2="10" stroke={x.era === era ? 'var(--ink-2)' : 'var(--line-strong)'} strokeWidth="0.3" />
        ))}
        <motion.rect animate={{ x: X(p.from), width: Math.max(0.8, X(p.to) - X(p.from)) }} transition={{ duration: 0.4 }} y="8" height="4" rx="1" fill={p.east ? 'var(--synapse)' : 'var(--signal)'} />
      </svg>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Époques">
        {ERAS.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => {
              setEra(e.id);
              setSel(PHILOS.find((x) => x.era === e.id)!.name);
            }}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${era === e.id ? 'border-signal bg-signal-soft text-ink' : 'border-line bg-surface text-ink-2 hover:text-ink'}`}
          >
            {e.label}
          </button>
        ))}
      </div>
      <p className="-mt-2 text-xs text-ink-3">{ERAS.find((e) => e.id === era)!.span} · clique sur un nom pour ouvrir sa fiche</p>

      <div className="grid gap-5 md:grid-cols-[1fr_1.6fr]">
        <div className="flex flex-wrap content-start gap-2">
          {list.map((x) => (
            <button
              key={x.name}
              type="button"
              onClick={() => setSel(x.name)}
              aria-pressed={sel === x.name}
              className={`rounded-lg border px-2.5 py-1 text-sm transition-colors ${sel === x.name ? (x.east ? 'border-synapse bg-synapse-soft text-ink' : 'border-signal bg-signal-soft text-ink') : 'border-line bg-surface text-ink-2 hover:text-ink'}`}
            >
              {x.name}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={p.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="grid content-start gap-2 rounded-xl border border-line bg-surface p-4">
            <p className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="font-display text-3xl text-ink">{p.name}</span>
              <span className="font-mono text-xs text-ink-3 tabular-nums">{alive}{p.from < -100 || p.name === 'Épictète' ? ' (dates approximatives)' : ''}</span>
            </p>
            {p.east && <p className="text-xs text-synapse">Hors de la tradition grecque et européenne</p>}
            <p className="text-sm text-ink-2">{p.idea}</p>
            {p.quote && (
              <blockquote className="border-l-2 border-signal pl-3 text-sm italic text-ink">
                « {p.quote} »
              </blockquote>
            )}
            {p.source && <p className="text-xs text-ink-3">{p.quote ? '' : 'Œuvre clé : '}{p.source}</p>}
            {p.sessions && <p className="text-xs text-ink-3">Dans ce cours : session{p.sessions.includes(',') ? 's' : ''} {p.sessions}</p>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
