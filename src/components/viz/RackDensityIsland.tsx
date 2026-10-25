import { motion } from 'motion/react';
import { useState } from 'react';

// Densité d'un rack et ce qu'elle impose (PIT POV 16, « AI's impact on Datacenters »)
const stops = [3, 5, 10, 15, 30, 40, 80, 132, 300, 600, 1000];

function profile(kw: number) {
  const ai = kw >= 40;
  return {
    era: kw <= 10 ? 'Rack classique, à base de CPU (3 à 10 kW)' : kw < 40 ? 'Entre les deux mondes' : kw <= 132 ? 'Rack IA actuel, à base de GPU (40 à 132 kW)' : 'Horizon annoncé : jusqu’à 1 MW par rack en 2027',
    cooling: kw <= 15 ? ['Refroidissement par air', 'suffisant jusqu’à ~15 kW par rack'] : kw <= 30 ? ['L’air atteint ses limites', 'au-delà de ~15 kW, il faut passer au liquide'] : ['Liquide direct-to-chip obligatoire', 'au-delà de 30 kW par rack'],
    coolingTone: kw <= 15 ? 'text-synapse' : kw <= 30 ? 'text-amber' : 'text-signal',
    network: ai ? ['InfiniBand / RoCE sur fibre', 'zéro perte de paquets, 3,2 Tb/s par serveur, racks à moins de ~150 m'] : ['Ethernet nord-sud', 'les serveurs parlent aux clients, une perte de paquets est tolérée'],
  };
}

export default function RackDensityIsland() {
  const [i, setI] = useState(2);
  const kw = stops[i];
  const p = profile(kw);
  const ratio = kw / 10;
  return (
    <div className="grid gap-5">
      <label className="grid gap-1.5 text-sm">
        <span className="flex justify-between text-ink-2"><span>Puissance électrique d’un rack</span><span className="font-mono text-ink">{kw >= 1000 ? '1 MW' : `${kw} kW`}</span></span>
        <input type="range" min={0} max={stops.length - 1} step={1} value={i} onChange={(e) => setI(Number(e.target.value))} className="accent-[var(--signal)]" aria-valuetext={`${kw} kW`} />
      </label>

      <div className="grid gap-1.5">
        <div className="h-3 overflow-hidden rounded-full bg-surface-2" aria-hidden>
          <motion.div className="h-full rounded-full" animate={{ width: `${(Math.log10(kw) / 3) * 100}%` }} style={{ background: kw >= 40 ? 'var(--signal)' : 'var(--ink-3)' }} />
        </div>
        <p className="text-sm text-ink-2">{p.era}{ratio > 1 ? <> · <span className="font-mono text-ink">×{ratio.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}</span> un rack classique de 10 kW</> : null}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-bg p-4">
          <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Refroidissement</p>
          <p className={`mt-1 font-semibold ${p.coolingTone}`}>{p.cooling[0]}</p>
          <p className="text-sm text-ink-2">{p.cooling[1]}</p>
        </div>
        <div className="rounded-xl border border-line bg-bg p-4">
          <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Réseau</p>
          <p className="mt-1 font-semibold text-ink">{p.network[0]}</p>
          <p className="text-sm text-ink-2">{p.network[1]}</p>
        </div>
      </div>
      <p className="text-sm text-ink-2">L’IA ne demande pas « plus de la même chose » : passé quelques dizaines de kW, c’est une autre infrastructure.</p>
    </div>
  );
}
