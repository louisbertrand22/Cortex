import { motion } from 'motion/react';
import { useState } from 'react';

// Prioriser un backlog avec RICE ou WSJF (MÉTHODES session 2, « Focus Priorités »). Valeurs d'exemple.
type Method = 'rice' | 'wsjf';
type Crit = { key: string; label: string; min: number; max: number; step: number; unit?: string };
const crits: Record<Method, Crit[]> = {
  rice: [
    { key: 'reach', label: 'Reach · personnes touchées par trimestre', min: 100, max: 5000, step: 100 },
    { key: 'impact', label: 'Impact pour l’utilisateur (1 à 3)', min: 1, max: 3, step: 0.5 },
    { key: 'confidence', label: 'Confidence dans ces chiffres', min: 50, max: 100, step: 10, unit: '%' },
    { key: 'effort', label: 'Effort · mois.homme', min: 0.5, max: 12, step: 0.5 },
  ],
  wsjf: [
    { key: 'value', label: 'Business value', min: 1, max: 10, step: 1 },
    { key: 'time', label: 'Time criticality (échéance légale, contractuelle)', min: 1, max: 10, step: 1 },
    { key: 'rr', label: 'Risk reduction / opportunity enablement', min: 1, max: 10, step: 1 },
    { key: 'size', label: 'Job size · taille du travail', min: 1, max: 10, step: 1 },
  ],
};
type Item = { id: string; name: string } & Record<string, number | string>;
const initial: Item[] = [
  { id: 'a', name: 'Paiement en un clic', reach: 3000, impact: 2, confidence: 80, effort: 4, value: 8, time: 3, rr: 2, size: 8 },
  { id: 'b', name: 'Export comptable légal', reach: 400, impact: 3, confidence: 100, effort: 2, value: 5, time: 10, rr: 3, size: 3 },
  { id: 'c', name: 'Mode sombre', reach: 2500, impact: 1, confidence: 90, effort: 1, value: 3, time: 1, rr: 1, size: 2 },
  { id: 'd', name: 'Refonte du moteur de recherche', reach: 4000, impact: 2, confidence: 50, effort: 9, value: 7, time: 2, rr: 8, size: 10 },
];

const n = (it: Item, k: string) => Number(it[k]);
const score = (m: Method, it: Item) => m === 'rice'
  ? (n(it, 'reach') * n(it, 'impact') * (n(it, 'confidence') / 100)) / n(it, 'effort')
  : (n(it, 'value') + n(it, 'time') + n(it, 'rr')) / n(it, 'size');
const fmt = (x: number) => (x >= 100 ? Math.round(x).toLocaleString('fr-FR') : x.toFixed(2).replace('.', ','));

export default function PrioritizeIsland() {
  const [m, setM] = useState<Method>('rice');
  const [items, setItems] = useState(initial);
  const [sel, setSel] = useState('a');
  const ranked = [...items].sort((x, y) => score(m, y) - score(m, x));
  const top = score(m, ranked[0]);
  const S = items.find((x) => x.id === sel)!;
  const set = (k: string, v: number) => setItems((xs) => xs.map((x) => (x.id === sel ? { ...x, [k]: v } : x)));

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Méthode de priorisation">
        {([['rice', 'RICE'], ['wsjf', 'WSJF']] as const).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={m === id} onClick={() => setM(id)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${m === id ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            {label}
          </button>
        ))}
      </div>

      <p className="rounded-lg bg-surface-2 px-3 py-2 text-center font-mono text-xs text-ink-2">
        {m === 'rice' ? 'score RICE = Reach × Impact × Confidence ÷ Effort' : 'score WSJF = (Business value + Time criticality + Risk reduction) ÷ Job size'}
      </p>

      <ol className="grid gap-2" aria-label="Backlog classé">
        {ranked.map((it, i) => {
          const s = score(m, it);
          const on = it.id === sel;
          return (
            <motion.li key={it.id} layout transition={{ duration: 0.35 }}>
              <button type="button" onClick={() => setSel(it.id)} aria-pressed={on}
                className={`grid w-full gap-1 rounded-lg border px-3 py-2 text-left transition-colors ${on ? 'border-signal bg-signal-soft' : 'border-line hover:border-line-strong'}`}>
                <span className="flex items-baseline gap-2 text-sm">
                  <span className="font-mono text-ink-3">#{i + 1}</span>
                  <span className="grow text-ink">{it.name}</span>
                  <span className="font-mono text-ink">{fmt(s)}</span>
                </span>
                <span className="h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                  <motion.span className="block h-full rounded-full" animate={{ width: `${(s / top) * 100}%` }} style={{ background: i === 0 ? 'var(--signal)' : 'var(--ink-3)' }} />
                </span>
              </button>
            </motion.li>
          );
        })}
      </ol>

      <div className="grid gap-3 rounded-xl border border-line bg-bg p-4">
        <p className="text-sm text-ink-2">Critères de <span className="font-medium text-ink">{S.name}</span> (choisis une autre exigence dans la liste) :</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {crits[m].map((c) => (
            <label key={c.key} className="grid gap-1.5 text-sm">
              <span className="flex justify-between gap-2 text-ink-2"><span>{c.label}</span><span className="font-mono text-ink">{String(S[c.key]).replace('.', ',')}{c.unit ? ` ${c.unit}` : ''}</span></span>
              <input type="range" min={c.min} max={c.max} step={c.step} value={n(S, c.key)} onChange={(e) => set(c.key, Number(e.target.value))} className="accent-[var(--signal)]" />
            </label>
          ))}
        </div>
        <button type="button" onClick={() => { setItems(initial); setSel('a'); }} className="justify-self-start rounded-xl bg-ink px-3 py-1.5 text-sm font-medium text-bg">Recommencer</button>
      </div>
    </div>
  );
}
