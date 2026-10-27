import { motion } from 'motion/react';
import { useState } from 'react';

// Théorème CAP sur le cas Expense.io (ARLA session 2, « Expense.io (4) - Théorème de CAP »)
type G = 'C' | 'A' | 'P';
const guarantees: Record<G, { name: string; def: string; cx: number; cy: number }> = {
  C: { name: 'Consistency', def: 'Tous les nœuds du système voient la même donnée au même moment.', cx: 50, cy: 27 },
  A: { name: 'Availability', def: 'Toutes les requêtes reçoivent une réponse.', cx: 36, cy: 50 },
  P: { name: 'Partition Tolerance', def: 'En cas d’incident entre les nœuds, le système continue à opérer.', cx: 64, cy: 50 },
};
// Bases classées par le support dans chaque intersection ; scénario : un manager aux États-Unis valide une note
// de frais d'une équipe européenne, données réparties sur deux régions
const pairs: Record<string, { lost: G; dbs: string; scenario: string; x: number; y: number }> = {
  CA: { lost: 'P', dbs: 'PostgreSQL, MySQL', x: 39, y: 36, scenario: 'Une seule base, en Europe : la donnée est juste et toujours servie… tant que rien ne coupe le réseau. Les utilisateurs américains gardent leur latence, et une coupure entre nœuds n’est pas prévue.' },
  CP: { lost: 'A', dbs: 'MongoDB, Redis', x: 61, y: 36, scenario: 'Le lien Europe–États-Unis tombe : la validation du manager est refusée (erreur ou attente) plutôt que d’écrire une donnée que l’Europe ne verrait pas.' },
  AP: { lost: 'C', dbs: 'Cassandra, CouchDB', x: 50, y: 58, scenario: 'Le lien tombe : la validation est acceptée côté États-Unis, mais l’Europe voit encore la note « en attente » le temps que les répliques se réconcilient.' },
};
const order: G[] = ['C', 'A', 'P'];
const key = (s: G[]) => order.filter((g) => s.includes(g)).join('');

export default function CapTheoremIsland() {
  const [sel, setSel] = useState<G[]>(['C', 'P']);
  const toggle = (g: G) =>
    setSel((s) => (s.includes(g) ? s.filter((x) => x !== g) : [...s, g].slice(-2)));
  const pair = sel.length === 2 ? pairs[key(sel)] : null;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" aria-label="Garanties choisies (deux au plus)">
        {order.map((g) => (
          <button key={g} type="button" aria-pressed={sel.includes(g)} onClick={() => toggle(g)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${sel.includes(g) ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            <span className="font-mono font-semibold">{g}</span> · {guarantees[g].name}
          </button>
        ))}
      </div>

      <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <svg viewBox="0 0 100 80" className="w-full" role="img" aria-label={`Diagramme CAP, garanties choisies : ${sel.join(' et ') || 'aucune'}`}>
          {order.map((g) => {
            const { cx, cy } = guarantees[g];
            const on = sel.includes(g);
            return (
              <motion.circle key={g} cx={cx} cy={cy} r={21} initial={false}
                animate={{ fillOpacity: on ? 0.55 : 0.12 }}
                style={{ fill: on ? 'var(--signal-soft)' : 'var(--surface-2)', stroke: on ? 'var(--signal)' : 'var(--line-strong)' }} strokeWidth={0.6} />
            );
          })}
          <text x={50} y={14} textAnchor="middle" fontSize={5} fontWeight={600} style={{ fill: 'var(--ink)' }}>C</text>
          <text x={22} y={58} textAnchor="middle" fontSize={5} fontWeight={600} style={{ fill: 'var(--ink)' }}>A</text>
          <text x={78} y={58} textAnchor="middle" fontSize={5} fontWeight={600} style={{ fill: 'var(--ink)' }}>P</text>
          {Object.entries(pairs).map(([k, p]) => (
            <text key={k} x={p.x} y={p.y} textAnchor="middle" fontSize={4} fontFamily="var(--font-mono)"
              style={{ fill: pair === p ? 'var(--signal)' : 'var(--ink-3)', fontWeight: pair === p ? 700 : 400 }}>{k}</text>
          ))}
          <text x={50} y={46} textAnchor="middle" fontSize={3.6} style={{ fill: 'var(--danger)' }}>✕</text>
        </svg>

        <motion.div key={key(sel)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-line bg-bg p-4">
          {pair ? (
            <>
              <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Choix {key(sel)} · exemples du support : {pair.dbs}</p>
              <p className="mt-1 text-lg font-semibold text-ink">
                Tu sacrifies <span className="text-signal">{guarantees[pair.lost].name}</span>
              </p>
              <p className="mt-1 text-sm text-ink-2">{pair.scenario}</p>
            </>
          ) : (
            <>
              <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Choisis deux garanties</p>
              <ul className="mt-2 grid gap-1.5 text-sm text-ink-2">
                {order.map((g) => <li key={g}><span className="font-medium text-ink">{guarantees[g].name}</span> : {guarantees[g].def}</li>)}
              </ul>
            </>
          )}
        </motion.div>
      </div>
      <p className="text-sm text-ink-2">Le centre (les trois à la fois) reste vide : un troisième clic remplace la plus ancienne des deux garanties.</p>
    </div>
  );
}
