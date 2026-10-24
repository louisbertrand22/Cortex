import { motion } from 'motion/react';
import { useState } from 'react';

// Disponibilité de composants en série ou en parallèle (UBSI session 2, « Disponibilité : des probabilités »)
type Mode = 'serie' | 'parallele';
const HOURS_PER_YEAR = 365 * 24;

const fmtPct = (a: number) => `${(a * 100).toFixed(a > 0.9999 ? 4 : 2).replace('.', ',')} %`;
function fmtDowntime(a: number) {
  const h = (1 - a) * HOURS_PER_YEAR;
  if (h >= 24) return `${(h / 24).toFixed(1).replace('.', ',')} jours`;
  if (h >= 1) return `${h.toFixed(1).replace('.', ',')} h`;
  return `${Math.round(h * 60)} min`;
}

export default function AvailabilityIsland() {
  const [mode, setMode] = useState<Mode>('serie');
  const [avail, setAvail] = useState([99, 99]);

  const a = avail.map((x) => x / 100);
  // série : tous doivent marcher ; parallèle : il suffit qu'un seul marche
  const total = mode === 'serie' ? a.reduce((p, x) => p * x, 1) : 1 - a.reduce((p, x) => p * (1 - x), 1);
  const best = Math.max(...a);
  const worst = Math.min(...a);
  const better = total > best;

  const setOne = (i: number, v: number) => setAvail((xs) => xs.map((x, k) => (k === i ? v : x)));
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Montage des composants">
        {([['serie', 'En série · tous nécessaires'], ['parallele', 'En parallèle · un seul suffit']] as const).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => setMode(id)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${mode === id ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className={`flex items-center justify-center gap-2 rounded-xl border border-line bg-bg p-4 ${mode === 'parallele' ? 'flex-col' : 'flex-wrap'}`}>
        {avail.map((x, i) => (
          <div key={i} className={`flex items-center gap-2 ${mode === 'parallele' ? 'w-full max-w-xs' : ''}`}>
            {mode === 'serie' && i > 0 && <span className="text-ink-3" aria-hidden>→</span>}
            <motion.div layout className="grow rounded-lg border-2 border-synapse bg-synapse-soft px-3 py-2 text-center">
              <p className="font-mono text-[0.65rem] text-ink-3">composant {String.fromCharCode(65 + i)}</p>
              <p className="font-mono text-sm text-ink">{fmtPct(x / 100)}</p>
            </motion.div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {avail.map((x, i) => (
          <label key={i} className="grid gap-1.5 text-sm">
            <span className="flex justify-between text-ink-2"><span>Composant {String.fromCharCode(65 + i)}</span><span className="font-mono text-ink">{x.toFixed(1).replace('.', ',')} %</span></span>
            <input type="range" min={90} max={99.9} step={0.1} value={x} onChange={(e) => setOne(i, Number(e.target.value))} className="accent-[var(--signal)]" />
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={avail.length >= 4} onClick={() => setAvail((xs) => [...xs, 99])}
          className="rounded-xl border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-line-strong disabled:opacity-40">+ Ajouter un composant</button>
        <button type="button" disabled={avail.length <= 2} onClick={() => setAvail((xs) => xs.slice(0, -1))}
          className="rounded-xl border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-line-strong disabled:opacity-40">− Retirer</button>
        <button type="button" onClick={() => { setAvail([99, 99]); setMode('serie'); }} className="rounded-xl bg-ink px-3 py-1.5 text-sm font-medium text-bg">Recommencer</button>
      </div>

      <div>
        <p className={`text-base font-semibold ${better ? 'text-synapse' : 'text-danger'}`}>
          Disponibilité de l’ensemble : <span className="font-mono">{fmtPct(total)}</span>
          <span className="font-normal text-ink-2"> · ≈ {fmtDowntime(total)} d’arrêt par an</span>
        </p>
        <p className="mt-1 text-sm text-ink-2">
          {mode === 'serie'
            ? <>Produit des disponibilités : l’ensemble est <span className="font-medium text-ink">moins disponible que le plus faible</span> de ses composants ({fmtPct(worst)}).</>
            : <>1 − produit des indisponibilités : l’ensemble est <span className="font-medium text-ink">plus disponible que le meilleur</span> de ses composants ({fmtPct(best)}).</>}
        </p>
      </div>
    </div>
  );
}
