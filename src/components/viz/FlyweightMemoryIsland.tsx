import { motion } from 'motion/react';
import { useState } from 'react';

// Flyweight : mémoire d'une forêt avec et sans partage de l'état intrinsèque (ACOO session 4, « Flyweight »)
const COUNTS = [1_000, 10_000, 100_000, 1_000_000];
const TYPE_BYTES = 2 * 1024 * 1024; // hypothèse : modèle 3D + texture d'un type d'arbre ≈ 2 Mo
const CONTEXT_BYTES = 16; // hypothèse : x, y et une référence vers le TreeType

function human(bytes: number) {
  const units = ['o', 'Ko', 'Mo', 'Go', 'To'];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v >= 100 ? Math.round(v) : v.toFixed(1).replace('.', ',')} ${units[i]}`;
}

export default function FlyweightMemoryIsland() {
  const [ci, setCi] = useState(3);
  const [types, setTypes] = useState(3);
  const n = COUNTS[ci];

  const without = n * (TYPE_BYTES + CONTEXT_BYTES);
  const withFw = types * TYPE_BYTES + n * CONTEXT_BYTES;
  const ratio = without / withFw;
  const pct = Math.max((withFw / without) * 100, 0.6);

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm text-ink-2">
          <span>Arbres dans la forêt : <span className="font-mono text-ink">{n.toLocaleString('fr-FR')}</span></span>
          <input type="range" min={0} max={COUNTS.length - 1} value={ci} onChange={(e) => setCi(Number(e.target.value))} aria-label="Nombre d'arbres" className="accent-[var(--signal)]" />
        </label>
        <label className="grid gap-1 text-sm text-ink-2">
          <span>Types d'arbres différents (chêne, pin…) : <span className="font-mono text-ink">{types}</span></span>
          <input type="range" min={1} max={10} value={types} onChange={(e) => setTypes(Number(e.target.value))} aria-label="Nombre de types d'arbres" className="accent-[var(--signal)]" />
        </label>
      </div>

      <div className="grid gap-3">
        <div>
          <div className="flex justify-between text-sm"><span className="text-ink-2">Sans Flyweight · chaque arbre porte son modèle et sa texture</span><span className="font-mono whitespace-nowrap text-danger">{human(without)}</span></div>
          <div className="mt-1 h-4 rounded bg-danger" />
        </div>
        <div>
          <div className="flex justify-between text-sm"><span className="text-ink-2">Avec Flyweight · {types} TreeType partagé{types > 1 ? 's' : ''} + {n.toLocaleString('fr-FR')} contextes (x, y)</span><span className="font-mono whitespace-nowrap text-synapse">{human(withFw)}</span></div>
          <div className="mt-1 h-4 rounded bg-surface-2">
            <motion.div className="h-4 rounded bg-synapse" animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>
      </div>

      <p className="text-sm text-ink-2">
        Mémoire divisée par <span className="font-semibold text-ink">{Math.round(ratio).toLocaleString('fr-FR')}</span>. Le gain vient du rapport entre arbres et types : plus il y a d'objets qui partagent le même état lourd, plus le Flyweight rapporte. Avec autant de types que d'arbres, il ne servirait à rien.
      </p>
      <p className="text-xs text-ink-3">Tailles fictives pour l'ordre de grandeur : 2 Mo par type d'arbre, 16 octets par contexte.</p>
    </div>
  );
}
