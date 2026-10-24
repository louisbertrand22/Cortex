import { motion } from 'motion/react';
import { useState } from 'react';

// Méthode des ratios (MÉTHODES session 1, « Méthode des Ratios ») : tout est exprimé en % du développement (Dvt)
type Node = { id: string; label: string; pct: number; children?: Node[] };
const dev: Node = {
  id: 'dvt', label: 'Développement', pct: 100,
  children: [
    { id: 'etudes', label: 'Études', pct: 30, children: [
      { id: 'spec', label: 'Spécification', pct: 10 },
      { id: 'conc', label: 'Conception', pct: 15 },
      { id: 'bench', label: 'Benchs', pct: 5 },
    ] },
    { id: 'real', label: 'Réalisation', pct: 50, children: [
      { id: 'code', label: 'Codage', pct: 40 },
      { id: 'tu', label: 'Tests unitaires', pct: 10 },
    ] },
    { id: 'integ', label: 'Intégration / validation', pct: 20 },
  ],
};
const around = [
  { id: 'accept', label: 'Acceptation', pct: 10 },
  { id: 'doc', label: 'Documentation utilisateur', pct: 5 },
  { id: 'mgmt', label: 'Management / qualité', pct: 15 },
];
const flat = [dev, ...dev.children!, ...dev.children!.flatMap((c) => c.children ?? [])];
const known = ['code', 'spec', 'conc', 'tu', 'integ', 'dvt'].map((id) => flat.find((n) => n.id === id)!);

const fmt = (x: number) => (Math.round(x * 10) / 10).toString().replace('.', ',');

export default function EffortRatiosIsland() {
  const [ref, setRef] = useState('code');
  const [days, setDays] = useState(40);
  const R = flat.find((n) => n.id === ref)!;
  const unit = days / R.pct; // jours.homme pour 1 % du développement
  const jh = (pct: number) => fmt(pct * unit);

  function Row({ n, depth }: { n: Node; depth: number }) {
    const on = n.id === ref;
    return (
      <>
        <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 1.1}rem` }}>
          <span className={`text-sm ${on ? 'font-semibold text-ink' : depth === 0 ? 'font-medium text-ink' : 'text-ink-2'}`}>{on ? '▸ ' : ''}{n.label}</span>
          <span className="font-mono text-[0.65rem] text-ink-3">{n.pct} %</span>
          <span className="grow border-b border-dotted border-line" aria-hidden />
          <span className={`font-mono text-sm ${on ? 'text-signal' : 'text-ink'}`}>{jh(n.pct)} j.h</span>
        </div>
        {n.children?.map((c) => <Row key={c.id} n={c} depth={depth + 1} />)}
      </>
    );
  }

  const total = 130;
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Ce que tu sais estimer</span>
          <select value={ref} onChange={(e) => setRef(e.target.value)} className="rounded-lg border border-line bg-bg px-2 py-1.5 text-ink">
            {known.map((n) => <option key={n.id} value={n.id}>{n.label} ({n.pct} % du Dvt)</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="flex justify-between text-ink-2"><span>Ton estimation</span><span className="font-mono text-ink">{days} j.h</span></span>
          <input type="range" min={5} max={200} step={5} value={days} onChange={(e) => setDays(Number(e.target.value))} className="accent-[var(--signal)]" />
        </label>
      </div>

      <div className="grid gap-1.5 rounded-xl border border-line bg-bg p-4">
        <Row n={dev} depth={0} />
        <div className="mt-2 grid gap-1.5 border-t border-line pt-2">
          {around.map((n) => (
            <div key={n.id} className="flex items-center gap-2">
              <span className="text-sm text-ink-2">+ {n.label}</span>
              <span className="font-mono text-[0.65rem] text-ink-3">{n.pct} %</span>
              <span className="grow border-b border-dotted border-line" aria-hidden />
              <span className="font-mono text-sm text-ink">{jh(n.pct)} j.h</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex h-3 overflow-hidden rounded-full" aria-hidden>
        {[...dev.children!.map((c, i) => ({ ...c, color: ['var(--signal)', 'var(--amber)', 'var(--synapse)'][i] })), { id: 'x', label: '', pct: 30, color: 'var(--line-strong)' }].map((c) => (
          <motion.div key={c.id} animate={{ width: `${(c.pct / total) * 100}%` }} style={{ background: c.color }} />
        ))}
      </div>

      <p className="text-base font-semibold text-ink">
        Charge du projet : <span className="font-mono text-signal">{jh(total)} j.h</span>
        <span className="font-normal text-ink-2"> · soit 130 % du développement ({jh(100)} j.h)</span>
      </p>
      <p className="-mt-3 text-sm text-ink-2">
        Une seule estimation ({R.label.toLowerCase()} = {days} j.h, soit {R.pct} % du Dvt) suffit à extrapoler toutes les autres phases.
      </p>
    </div>
  );
}
