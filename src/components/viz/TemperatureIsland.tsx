import { motion } from 'motion/react';
import { useMemo, useState } from 'react';

const prompt = 'Le ticket de maintenance a été clôturé';
const cands = [
  { tok: 'après', p: 0.44, end: 'après le remplacement du capteur.' },
  { tok: 'car', p: 0.33, end: 'car le client ne répondait plus.' },
  { tok: 'sans', p: 0.23, end: 'sans qu’aucune intervention ne soit tracée.' },
];

function dist(T: number) {
  if (T <= 0.001) return cands.map((_, i) => (i === 0 ? 1 : 0));
  const w = cands.map((c) => Math.pow(c.p, 1 / T));
  const s = w.reduce((a, b) => a + b, 0);
  return w.map((x) => x / s);
}

export default function TemperatureIsland() {
  const [T, setT] = useState(1);
  const [draws, setDraws] = useState<number[]>([]);
  const probs = useMemo(() => dist(T), [T]);
  const draw = () => {
    let r = Math.random(), i = 0;
    while (i < probs.length - 1 && r > probs[i]) { r -= probs[i]; i++; }
    setDraws((d) => [i, ...d].slice(0, 6));
  };
  return (
    <div className="grid gap-5">
      <label className="grid gap-1.5 text-sm">
        <span className="flex justify-between text-ink-2"><span>Température</span><span className="font-mono text-ink">{T.toFixed(2)}</span></span>
        <input type="range" min={0} max={2} step={0.05} value={T} onChange={(e) => { setT(Number(e.target.value)); setDraws([]); }} className="accent-[var(--signal)]" />
        <span className="flex justify-between text-xs text-ink-3"><span>0 · déterministe (argmax)</span><span>2 · très dispersé</span></span>
      </label>
      <div className="rounded-xl border border-line bg-bg p-4">
        <p className="mb-3 text-sm text-ink-2">Prompt : <span className="text-ink">« {prompt} … »</span></p>
        <div className="grid gap-2">
          {cands.map((c, i) => (
            <div key={c.tok} className="grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-3 text-sm">
              <span className="font-mono text-ink">{c.tok}</span>
              <div className="h-5 overflow-hidden rounded bg-surface-2">
                <motion.div className="h-full rounded" style={{ background: i === 0 ? 'var(--signal)' : 'var(--line-strong)' }} animate={{ width: `${probs[i] * 100}%` }} transition={{ type: 'spring', stiffness: 160, damping: 22 }} />
              </div>
              <span className="text-right font-mono text-ink-2">{Math.round(probs[i] * 100)} %</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={draw} className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-bg">Relancer le même appel</button>
        <span className="text-xs text-ink-3">Probabilités illustratives, pas la sortie d’un vrai modèle.</span>
      </div>
      {draws.length > 0 && (
        <ol className="grid gap-1.5 text-sm">
          {draws.map((d, k) => (
            <motion.li key={draws.length - k} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1 - k * 0.13, y: 0 }} className="rounded-lg border border-line bg-surface px-3 py-2 text-ink-2">
              {prompt} <span className={d === 0 ? 'font-medium text-ink' : 'font-medium text-signal'}>{cands[d].end}</span>
            </motion.li>
          ))}
        </ol>
      )}
    </div>
  );
}
