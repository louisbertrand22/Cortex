import { motion } from 'motion/react';
import { useState } from 'react';

/**
 * Le dilemme du prisonnier, lu comme Hobbes : sans pouvoir commun, trahir est toujours
 * le meilleur choix individuel, et tout le monde y perd. Un souverain qui punit la
 * trahison change le calcul. Valeurs : années de prison (moins = mieux).
 */
type Move = 'coop' | 'trahir';
const BASE: Record<Move, Record<Move, [number, number]>> = {
  coop: { coop: [1, 1], trahir: [10, 0] },
  trahir: { coop: [0, 10], trahir: [5, 5] },
};
const PENALTY = 6;
const LABEL: Record<Move, string> = { coop: 'Se taire', trahir: 'Trahir' };
const ans = (n: number) => `${n} an${n > 1 ? 's' : ''}`;

export default function PrisonerDilemmaIsland() {
  const [sovereign, setSovereign] = useState(false);
  const [mine, setMine] = useState<Move>('coop');
  const pay = (a: Move, b: Move): [number, number] => {
    const [x, y] = BASE[a][b];
    return sovereign ? [x + (a === 'trahir' ? PENALTY : 0), y + (b === 'trahir' ? PENALTY : 0)] : [x, y];
  };
  // L'autre, rationnel, choisit ce qui lui coûte le moins quel que soit mon choix (stratégie dominante).
  const best = (them: Move): Move => (pay(them, 'coop')[1] <= pay(them, 'trahir')[1] ? 'coop' : 'trahir');
  const other = best(mine);
  const dominant: Move = pay('trahir', 'coop')[0] < pay('coop', 'coop')[0] && pay('trahir', 'trahir')[0] < pay('coop', 'trahir')[0] ? 'trahir' : 'coop';
  const [me, them] = pay(mine, other);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {([false, true] as const).map((s) => (
          <button
            key={String(s)}
            type="button"
            onClick={() => setSovereign(s)}
            aria-pressed={sovereign === s}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${sovereign === s ? 'border-signal bg-signal-soft text-ink' : 'border-line bg-surface text-ink-2 hover:text-ink'}`}
          >
            {s ? 'Avec un souverain qui punit la trahison' : 'État de nature : pas de pouvoir commun'}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="grid gap-2">
          <p className="text-xs text-ink-3">Années de prison : toi / l’autre {sovereign ? `(trahir coûte ${PENALTY} ans de plus)` : ''}</p>
          <div className="grid grid-cols-[auto_1fr_1fr] gap-1.5 text-sm">
            <div />
            <div className="px-2 text-center text-xs text-ink-3">l’autre se tait</div>
            <div className="px-2 text-center text-xs text-ink-3">l’autre trahit</div>
            {(['coop', 'trahir'] as Move[]).map((a) => (
              <div key={a} className="contents">
                <div className="flex items-center pr-2 text-xs text-ink-3">tu {a === 'coop' ? 'te tais' : 'trahis'}</div>
                {(['coop', 'trahir'] as Move[]).map((b) => {
                  const [x, y] = pay(a, b);
                  const on = a === mine && b === other;
                  return (
                    <motion.div
                      key={b}
                      animate={{ scale: on ? 1.03 : 1 }}
                      className={`rounded-lg border p-2 text-center font-mono tabular-nums ${on ? 'border-signal bg-signal-soft text-ink' : 'border-line bg-surface text-ink-2'}`}
                    >
                      {x} / {y}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="grid content-start gap-3">
          <p className="text-sm text-ink">Ton choix :</p>
          <div className="flex gap-2">
            {(['coop', 'trahir'] as Move[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMine(m)}
                aria-pressed={mine === m}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${mine === m ? 'border-signal bg-signal-soft text-ink' : 'border-line bg-surface text-ink-2 hover:text-ink'}`}
              >
                {LABEL[m]}
              </button>
            ))}
          </div>
          <motion.div key={`${mine}-${sovereign}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="grid gap-1 rounded-xl border border-line bg-surface p-3 text-sm">
            <p className="text-ink-2">L’autre, qui calcule son intérêt, choisit : <strong className="text-ink">{LABEL[other].toLowerCase()}</strong>.</p>
            <p className="text-ink-2">Résultat : toi {ans(me)}, lui {ans(them)}.</p>
            <p className="text-ink-2">
              {dominant === 'trahir'
                ? 'Quoi que fasse l’autre, trahir te coûte moins. Chacun trahit donc, et les deux prennent 5 ans, alors que se taire ensemble n’en coûtait qu’un. La méfiance rationnelle mène au pire pour tous.'
                : 'La punition rend la trahison toujours plus coûteuse : se taire devient le meilleur choix pour chacun. Le pouvoir commun rend la coopération rationnelle.'}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
