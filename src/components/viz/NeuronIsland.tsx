import { motion } from 'motion/react';
import { useState } from 'react';

/** Un neurone artificiel = un vote pondéré : « est-ce que je vais au ciné ce soir ? » */
const START = [
  { label: 'Ton meilleur ami vient', on: true, w: 3 },
  { label: 'Le film a de super critiques', on: false, w: 2 },
  { label: 'Il pleut dehors', on: true, w: 1 },
  { label: 'Contrôle de maths demain', on: true, w: -4 },
];

export default function NeuronIsland() {
  const [inputs, setInputs] = useState(START);
  const [threshold, setThreshold] = useState(2);
  const sum = inputs.reduce((s, i) => s + (i.on ? i.w : 0), 0);
  const go = sum >= threshold;
  const set = (k: number, patch: Partial<(typeof START)[number]>) =>
    setInputs((xs) => xs.map((x, i) => (i === k ? { ...x, ...patch } : x)));

  return (
    <div className="grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
      <div className="grid gap-3">
        <p className="text-xs text-ink-3">Entrées (oui / non) et leur poids : à quel point chacune compte</p>
        {inputs.map((x, k) => (
          <div key={x.label} className={`grid gap-2 rounded-xl border p-3 transition-colors ${x.on ? 'border-line-strong bg-surface' : 'border-line bg-bg opacity-70'}`}>
            <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
              <input type="checkbox" checked={x.on} onChange={(e) => set(k, { on: e.target.checked })} className="size-4 accent-[var(--signal)]" />
              <span className="flex-1">{x.label}</span>
              <span className={`font-mono text-xs ${x.w > 0 ? 'text-synapse' : x.w < 0 ? 'text-danger' : 'text-ink-3'}`}>{x.w > 0 ? '+' : ''}{x.w}</span>
            </label>
            <input type="range" min={-5} max={5} step={1} value={x.w} onChange={(e) => set(k, { w: Number(e.target.value) })} aria-label={`Poids : ${x.label}`} className="accent-[var(--ink-3)]" />
          </div>
        ))}
      </div>

      <div className="grid justify-items-center gap-4 text-center">
        <motion.div
          animate={{ scale: go ? 1.04 : 1, borderColor: go ? 'var(--synapse)' : 'var(--line-strong)' }}
          className="grid size-40 place-items-center rounded-full border-2 bg-surface shadow-card"
        >
          <div>
            <p className="text-xs text-ink-3">somme des votes</p>
            <motion.p key={sum} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-5xl text-ink tabular-nums">{sum}</motion.p>
            <p className="text-xs text-ink-3">seuil : {threshold}</p>
          </div>
        </motion.div>
        <motion.p key={String(go)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${go ? 'bg-synapse-soft text-synapse' : 'bg-surface-2 text-ink-2'}`}>
          {go ? 'J’y vais 🎬' : 'Je reste à la maison'}
        </motion.p>
        <label className="grid w-full max-w-56 gap-1 text-sm">
          <span className="text-ink-2">Seuil de décision</span>
          <input type="range" min={-3} max={8} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="accent-[var(--signal)]" />
        </label>
        <button type="button" onClick={() => { setInputs(START); setThreshold(2); }} className="text-xs text-ink-3 hover:text-ink">Revenir au départ</button>
      </div>
    </div>
  );
}
