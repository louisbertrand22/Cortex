import { motion } from 'motion/react';
import { useState } from 'react';

/**
 * Investir 12 000 € d'un coup ou 1 000 € par mois pendant 12 mois (DCA),
 * selon trois trajectoires de prix (illustratives) sur 12 mois.
 */
const PATHS = {
  up: { label: 'Hausse régulière', prices: [100, 102, 101, 104, 106, 105, 108, 110, 109, 112, 115, 116, 118], text: 'Quand le marché monte, chaque mois d’attente fait acheter plus cher : investir tout de suite gagne.' },
  crash: { label: 'Krach puis reprise', prices: [100, 92, 80, 70, 64, 62, 68, 75, 82, 88, 94, 99, 104], text: 'Les versements mensuels achètent beaucoup de parts pendant la baisse : le DCA gagne nettement.' },
  down: { label: 'Baisse continue', prices: [100, 97, 95, 92, 90, 88, 85, 83, 80, 78, 76, 74, 72], text: 'Les deux perdent, mais le DCA perd moins : une partie de l’argent est investie plus bas.' },
} as const;
type Key = keyof typeof PATHS;
const TOTAL = 12000;
const eur = (v: number) => `${Math.round(v).toLocaleString('fr-FR')} €`;
const X = (i: number) => 15 + (i / 12) * 81;

export default function DcaLumpIsland() {
  const [k, setK] = useState<Key>('crash');
  const p = PATHS[k].prices;
  const lo = Math.min(...p) - 5;
  const hi = Math.max(...p) + 5;
  const Y = (v: number) => 46 - ((v - lo) / (hi - lo)) * 40;
  const lumpUnits = TOTAL / p[0];
  const dcaUnits = p.slice(0, 12).reduce((s, price) => s + 1000 / price, 0);
  const end = p[12];
  const lump = lumpUnits * end;
  const dca = dcaUnits * end;
  const avg = TOTAL / dcaUnits;
  const d = p.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(2)},${Y(v).toFixed(2)}`).join(' ');
  const winner = lump > dca ? 'lump' : 'dca';

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(PATHS) as Key[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setK(key)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${k === key ? 'border-signal bg-signal-soft text-ink' : 'border-line bg-surface text-ink-2 hover:text-ink'}`}
          >
            {PATHS[key].label}
          </button>
        ))}
      </div>
      <div className="grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
        <svg viewBox="0 0 100 54" className="w-full" role="img" aria-label={`Prix de la part sur 12 mois, scénario ${PATHS[k].label}`}>
          <line x1="15" x2="96" y1={Y(100)} y2={Y(100)} stroke="var(--line-strong)" strokeWidth="0.3" strokeDasharray="1 1" />
          <text x="11" y={Y(100) + 1.2} textAnchor="end" fontSize="3.5" fill="var(--ink-3)">100</text>
          <motion.path animate={{ d }} transition={{ duration: 0.5 }} fill="none" stroke="var(--ink-2)" strokeWidth="0.7" />
          {p.slice(0, 12).map((v, i) => (
            <motion.circle key={i} cx={X(i)} animate={{ cy: Y(v) }} transition={{ duration: 0.5 }} r={i === 0 ? 2 : 1.2} fill={i === 0 ? 'var(--signal)' : 'var(--synapse)'} />
          ))}
          <text x="15" y="52" fontSize="3.5" fill="var(--ink-3)">mois 0</text>
          <text x="96" y="52" textAnchor="end" fontSize="3.5" fill="var(--ink-3)">mois 12</text>
        </svg>
        <div className="grid gap-3">
          <div className={`rounded-xl border p-3 ${winner === 'lump' ? 'border-signal/35 bg-signal-soft' : 'border-line bg-surface'}`}>
            <p className="flex items-center gap-1.5 text-xs text-ink-3"><span className="inline-block size-2.5 rounded-full bg-signal" /> 12 000 € investis au mois 0</p>
            <p className="font-mono text-xl text-ink tabular-nums">{eur(lump)}</p>
            <p className="text-xs text-ink-2">prix d’achat : {p[0]}{winner === 'lump' ? ' · gagnant' : ''}</p>
          </div>
          <div className={`rounded-xl border p-3 ${winner === 'dca' ? 'border-synapse/35 bg-synapse-soft' : 'border-line bg-surface'}`}>
            <p className="flex items-center gap-1.5 text-xs text-ink-3"><span className="inline-block size-2.5 rounded-full bg-synapse" /> 1 000 € par mois pendant 12 mois</p>
            <p className="font-mono text-xl text-ink tabular-nums">{eur(dca)}</p>
            <p className="text-xs text-ink-2">prix d’achat moyen : {avg.toFixed(1).replace('.', ',')}{winner === 'dca' ? ' · gagnant' : ''}</p>
          </div>
        </div>
      </div>
      <motion.p key={k} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-ink-2">{PATHS[k].text} Valeurs au mois 12, trajectoires illustratives.</motion.p>
    </div>
  );
}
