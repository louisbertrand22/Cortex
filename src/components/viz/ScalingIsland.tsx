import { motion } from 'motion/react';
import { useState } from 'react';

// Capacité en « unités de charge » : 4 petits serveurs de 25, ou un gros de 100
const SMALL = 25;
const BIG = 100;

type Mode = 'out' | 'in';

export default function ScalingIsland() {
  const [mode, setMode] = useState<Mode>('out');
  const [load, setLoad] = useState(60);
  const [down, setDown] = useState(false);

  // scale out : autant de petits serveurs que nécessaire (1 de rab) ; scale in : un seul serveur, grossi
  const needed = Math.max(1, Math.ceil(load / SMALL));
  const servers = mode === 'out' ? needed + 1 : 1;
  const alive = down ? servers - 1 : servers;
  // le gros serveur grossit avec la charge, jusqu'au plafond du plus gros modèle disponible (BIG)
  const capacity = mode === 'out' ? alive * SMALL : alive * Math.min(BIG, Math.max(BIG / 2, Math.ceil(load / SMALL) * SMALL));
  const ok = capacity >= load;
  const status = !ok ? (alive === 0 ? 'Service interrompu' : down ? 'Service dégradé' : 'Plafond atteint : impossible de grossir plus') : down ? 'Service maintenu' : 'Service nominal';

  const reset = () => setDown(false);
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Mode de scalabilité">
        {([['out', 'Scale out · plein de petits'], ['in', 'Scale in · un seul gros']] as const).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => { setMode(id); reset(); }}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${mode === id ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            {label}
          </button>
        ))}
      </div>
      <label className="grid gap-1.5 text-sm">
        <span className="flex justify-between text-ink-2"><span>Charge (utilisateurs simultanés)</span><span className="font-mono text-ink">{load * 100}</span></span>
        <input type="range" min={10} max={150} step={5} value={load} onChange={(e) => { setLoad(Number(e.target.value)); reset(); }} className="accent-[var(--signal)]" />
        <span className="flex justify-between text-xs text-ink-3"><span>scale down ←</span><span>→ scale up</span></span>
      </label>
      <div className="flex min-h-36 flex-wrap items-end gap-2 rounded-xl border border-line bg-bg p-4">
        {Array.from({ length: servers }).map((_, i) => {
          const dead = down && i === 0;
          const size = mode === 'out' ? 3 : Math.min(7, 3 + Math.min(load, BIG) / 25);
          return (
            <motion.div key={`${mode}-${i}`} layout initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: dead ? 0.5 : 1, scale: 1 }}
              className="grid place-items-center rounded-lg border-2 text-[0.65rem] font-mono"
              style={{ width: `${size}rem`, height: `${size + 1}rem`, borderColor: dead ? 'var(--danger)' : 'var(--synapse)', background: dead ? 'var(--danger-soft)' : 'var(--synapse-soft)', color: dead ? 'var(--danger)' : 'var(--ink-2)' }}>
              {dead ? '✗ panne' : mode === 'out' ? 'VM' : 'gros serveur'}
            </motion.div>
          );
        })}
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="grid gap-1">
          <div className="flex h-3 overflow-hidden rounded-full bg-surface-2" aria-hidden>
            <motion.div className="h-full" style={{ background: ok ? 'var(--synapse)' : 'var(--danger)' }} animate={{ width: `${Math.min(100, (load / Math.max(capacity, 1)) * 100)}%` }} transition={{ type: 'spring', stiffness: 140, damping: 22 }} />
          </div>
          <p className="text-sm">
            <span className={`font-semibold ${ok ? (down ? 'text-amber' : 'text-synapse') : 'text-danger'}`}>{ok ? '✓' : '✗'} {status}</span>
            <span className="text-ink-3"> · {alive} serveur{alive > 1 ? 's' : ''} actif{alive > 1 ? 's' : ''}, capacité {capacity * 100}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setDown(true)} disabled={down} className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-bg disabled:opacity-40">Faire tomber un serveur</button>
          <button type="button" onClick={reset} className="rounded-xl border border-line px-4 py-2 text-sm text-ink-2">Recommencer</button>
        </div>
      </div>
      <p className="text-sm text-ink-2">
        {mode === 'out'
          ? 'Chaque petit serveur est interchangeable : il ne garde aucun état (stateless). Une panne enlève une part de la capacité, pas le service. C’est le modèle du cloud et des couches web et applicatives.'
          : 'Un seul serveur, qu’on grossit (CPU, RAM) : simple pour une base de données qui garde un état (stateful), mais il atteint un plafond, et sa panne arrête tout. Dans le monde VMware, c’est l’infrastructure (HA, vMotion) qui le protège.'}
      </p>
    </div>
  );
}
