import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

/**
 * Chasse aux sophismes : dix arguments de la vie courante, à chaque fois quatre noms de
 * sophismes possibles. On choisit, on lit l'explication, on passe au suivant.
 */
const ITEMS: { text: string; options: string[]; answer: number; why: string }[] = [
  {
    text: '« Tu dis qu’il faudrait manger moins de viande, mais tu portes des chaussures en cuir ! »',
    options: ['Faux dilemme', 'Attaque contre la personne', 'Pente glissante', 'Appel à la popularité'],
    answer: 1,
    why: 'On répond à la personne (son incohérence supposée) au lieu de répondre à son argument. Même si elle est incohérente, son argument peut être juste : c’est l’argument « toi aussi » (tu quoque), une forme d’attaque contre la personne.',
  },
  {
    text: '« Si on autorise les trottinettes sur ce trottoir, demain ce seront les scooters, et après-demain les voitures. »',
    options: ['Pente glissante', 'Homme de paille', 'Généralisation hâtive', 'Appel à la nature'],
    answer: 0,
    why: 'On enchaîne des conséquences de plus en plus graves sans montrer pourquoi chaque étape entraînerait la suivante. Le premier pas n’oblige pas à faire les autres.',
  },
  {
    text: '« Soit tu soutiens cette réforme, soit tu veux la faillite du pays. »',
    options: ['Raisonnement circulaire', 'Appel à l’autorité', 'Faux dilemme', 'Post hoc'],
    answer: 2,
    why: 'On présente deux options comme les seules possibles, alors qu’il en existe d’autres : soutenir une autre réforme, la modifier, en proposer une différente.',
  },
  {
    text: '« Des millions de personnes utilisent ce remède : il marche forcément. »',
    options: ['Attaque contre la personne', 'Appel à la popularité', 'Pente glissante', 'Homme de paille'],
    answer: 1,
    why: 'Le nombre de gens qui croient une chose ne la rend pas vraie : pendant des siècles, presque tout le monde a cru que le Soleil tournait autour de la Terre. Ce qui compte, ce sont les preuves.',
  },
  {
    text: '« Depuis que je porte ce bracelet porte-bonheur, j’ai eu une promotion et je suis moins malade. »',
    options: ['Faux dilemme', 'Appel à la nature', 'Généralisation hâtive', 'Post hoc : après, donc à cause de'],
    answer: 3,
    why: 'Que B arrive après A ne prouve pas que A cause B. La promotion et la santé ont bien d’autres explications possibles ; il faudrait comparer avec des gens sans bracelet.',
  },
  {
    text: '— Il faudrait limiter les vols courts en avion.\n— Ah, donc tu veux qu’on retourne s’éclairer à la bougie ?',
    options: ['Homme de paille', 'Appel à la popularité', 'Raisonnement circulaire', 'Post hoc'],
    answer: 0,
    why: 'On déforme la position de l’autre en une version caricaturale, plus facile à attaquer. « Limiter les vols courts » n’a jamais voulu dire « renoncer à l’électricité ».',
  },
  {
    text: '« C’est 100 % naturel, donc c’est bon pour la santé. »',
    options: ['Pente glissante', 'Appel à la nature', 'Attaque contre la personne', 'Faux dilemme'],
    answer: 1,
    why: 'Naturel ne veut pas dire bon : la ciguë, l’arsenic et les champignons vénéneux sont naturels. Et beaucoup de choses artificielles (vaccins, lunettes) sont très bénéfiques.',
  },
  {
    text: '« Mon grand-père a fumé toute sa vie et il est mort à 95 ans : le tabac, ce n’est pas si dangereux. »',
    options: ['Appel à l’autorité', 'Homme de paille', 'Généralisation hâtive', 'Raisonnement circulaire'],
    answer: 2,
    why: 'Un seul cas ne dit rien d’une tendance. Un risque statistique n’annonce pas que tous les fumeurs mourront jeunes, mais que beaucoup plus d’entre eux mourront tôt.',
  },
  {
    text: '« Ce journal dit toujours la vérité : c’est écrit dans son propre éditorial. »',
    options: ['Raisonnement circulaire', 'Appel à la popularité', 'Pente glissante', 'Faux dilemme'],
    answer: 0,
    why: 'La conclusion (le journal est fiable) sert de preuve à elle-même : on ne peut croire l’éditorial que si l’on croit déjà le journal fiable. On tourne en rond.',
  },
  {
    text: '« Un prix Nobel de physique l’a dit à la télé : ce régime alimentaire est le meilleur. »',
    options: ['Post hoc', 'Généralisation hâtive', 'Appel à une autorité hors de son domaine', 'Homme de paille'],
    answer: 2,
    why: 'S’appuyer sur un expert est raisonnable dans son domaine. Mais un physicien n’est pas nutritionniste : son prestige ne prouve rien sur ce sujet.',
  },
];

export default function FallacyHuntIsland() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const done = i >= ITEMS.length;
  const item = ITEMS[Math.min(i, ITEMS.length - 1)];

  const pick = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    if (k === item.answer) setScore((s) => s + 1);
  };
  const next = () => {
    setPicked(null);
    setI((v) => v + 1);
  };
  const restart = () => {
    setI(0);
    setPicked(null);
    setScore(0);
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between text-xs text-ink-3">
        <span>{done ? 'Terminé' : `Argument ${i + 1} sur ${ITEMS.length}`}</span>
        <span className="font-mono tabular-nums">score : {score}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <motion.div className="h-full bg-signal" animate={{ width: `${((i + (picked !== null ? 1 : 0)) / ITEMS.length) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid justify-items-start gap-3 rounded-xl border border-line bg-surface p-4">
            <p className="font-display text-3xl text-ink">{score} / {ITEMS.length}</p>
            <p className="text-sm text-ink-2">
              {score >= 8
                ? 'Excellent : tu repères les pièges les plus courants. Reste à les repérer aussi quand ils servent tes propres idées.'
                : score >= 5
                  ? 'Bien. Les sophismes ratés sont souvent les plus « confortables » : ceux qui vont dans le sens de ce qu’on pense déjà.'
                  : 'Pas de panique : ces pièges marchent justement parce qu’ils sont convaincants. Relis les explications et recommence.'}
            </p>
            <button type="button" onClick={restart} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-2 hover:text-ink">Recommencer</button>
          </motion.div>
        ) : (
          <motion.div key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }} className="grid gap-4">
            <p className="whitespace-pre-line rounded-xl border border-line bg-surface p-4 text-base text-ink">{item.text}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {item.options.map((o, k) => {
                const state = picked === null ? 'idle' : k === item.answer ? 'right' : k === picked ? 'wrong' : 'other';
                return (
                  <button
                    key={o}
                    type="button"
                    onClick={() => pick(k)}
                    disabled={picked !== null}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      state === 'right'
                        ? 'border-synapse bg-synapse-soft text-ink'
                        : state === 'wrong'
                          ? 'border-danger bg-surface text-ink'
                          : state === 'other'
                            ? 'border-line bg-surface text-ink-3'
                            : 'border-line bg-surface text-ink-2 hover:border-signal hover:text-ink'
                    }`}
                  >
                    {state === 'right' ? '✓ ' : state === 'wrong' ? '✗ ' : ''}
                    {o}
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="grid justify-items-start gap-3">
                <p className="text-sm text-ink-2">
                  <strong className="text-ink">{picked === item.answer ? 'Bien vu.' : `C’était : ${item.options[item.answer].toLowerCase()}.`}</strong> {item.why}
                </p>
                <button type="button" onClick={next} className="rounded-full border border-signal bg-signal-soft px-3 py-1.5 text-sm text-ink">
                  {i + 1 < ITEMS.length ? 'Argument suivant' : 'Voir mon score'}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
