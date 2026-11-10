import { motion } from 'motion/react';
import { useState } from 'react';

/**
 * Le voile d'ignorance de Rawls : choisir une société sans savoir quelle place on y
 * occupera. Revenus annuels illustratifs, par cinquième de la population.
 */
const SOCIETIES = [
  { id: 'A', name: 'Tout au mérite, sans filet', incomes: [8, 15, 30, 60, 140], note: 'La plus riche en moyenne, mais les plus pauvres y vivent très mal.' },
  { id: 'B', name: 'Égalité stricte', incomes: [25, 25, 25, 25, 25], note: 'Personne n’est pauvre ni riche ; mais sans incitation, la richesse totale est faible.' },
  { id: 'C', name: 'Inégalités qui profitent aux plus pauvres', incomes: [28, 32, 38, 48, 75], note: 'Des écarts existent, mais ils financent un sort meilleur pour les plus défavorisés que dans B.' },
];
const LEVELS = ['les 20 % les plus pauvres', 'le 2e cinquième', 'le cinquième du milieu', 'le 4e cinquième', 'les 20 % les plus riches'];
const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const k = (v: number) => `${v.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} k€`;
const MAX = 140;

export default function VeilOfIgnoranceIsland() {
  const [pick, setPick] = useState<number | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [draw, setDraw] = useState(0);

  const lift = () => {
    setSlot(Math.floor(Math.random() * 5));
    setDraw((d) => d + 1);
  };
  const reset = () => {
    setPick(null);
    setSlot(null);
  };

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 md:grid-cols-3">
        {SOCIETIES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setPick(i);
              setSlot(null);
            }}
            aria-pressed={pick === i}
            className={`grid content-start gap-2 rounded-xl border p-3 text-left transition-colors ${pick === i ? 'border-signal bg-signal-soft' : 'border-line bg-surface hover:border-signal'}`}
          >
            <span className="text-sm font-semibold text-ink">Société {s.id} · {s.name}</span>
            <span className="flex h-16 items-end gap-1" aria-hidden="true">
              {s.incomes.map((v, j) => (
                <motion.span
                  key={j}
                  className={`flex-1 rounded-t ${slot !== null && pick === i && slot === j ? 'bg-signal' : 'bg-ink-3/40'}`}
                  animate={{ height: `${Math.max(4, (v / MAX) * 100)}%` }}
                />
              ))}
            </span>
            <span className="text-xs text-ink-3">
              plus pauvres : <span className="font-mono text-ink tabular-nums">{k(s.incomes[0])}</span> · moyenne : <span className="font-mono text-ink tabular-nums">{k(avg(s.incomes))}</span>
            </span>
            <span className="text-xs text-ink-2">{s.note}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={lift}
          disabled={pick === null}
          className={`rounded-full border px-4 py-2 text-sm ${pick === null ? 'border-line text-ink-3' : 'border-signal bg-signal-soft text-ink'}`}
        >
          {slot === null ? 'Lever le voile' : 'Relancer le tirage'}
        </button>
        <button type="button" onClick={reset} className="text-xs text-ink-3 hover:text-ink">Recommencer</button>
        <span className="text-sm text-ink-2">
          {pick === null ? 'Choisis d’abord une société, sans savoir où tu naîtras.' : slot === null ? `Tu as choisi la société ${SOCIETIES[pick].id}. Lève le voile pour découvrir ta place.` : ''}
        </span>
      </div>

      {pick !== null && slot !== null && (
        <motion.p key={draw} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-line bg-surface p-3 text-sm text-ink-2">
          Ta place : <strong className="text-ink">{LEVELS[slot]}</strong> de la société {SOCIETIES[pick].id}. Tu vis avec <strong className="text-ink">{k(SOCIETIES[pick].incomes[slot])}</strong> par an.{' '}
          {slot === 0
            ? pick === 0
              ? 'C’est le risque que Rawls refuse de courir : dans le doute, il faut choisir la société où le pire sort est le moins mauvais, ici la société C.'
              : pick === 2
                ? 'C’est le choix de Rawls : même tout en bas, tu vis mieux que dans les deux autres sociétés.'
                : 'L’égalité te protège, mais la société C t’aurait donné plus, même tout en bas.'
            : 'Relance plusieurs fois : la question de Rawls est de savoir si tu accepterais aussi la place la plus basse.'}
        </motion.p>
      )}
      <p className="text-xs text-ink-3">Revenus annuels illustratifs, en milliers d’euros, par cinquième de la population.</p>
    </div>
  );
}
