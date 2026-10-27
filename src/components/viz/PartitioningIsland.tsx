import { motion } from 'motion/react';
import { useState } from 'react';

// Saucissonnage d'un serveur : du standalone au process, isolation contre mutualisation
// (GEN ARCHI session 2, « Saucissonnage & cloisonnement interne de serveur »)
type Share = 'dédié' | 'réallouable' | 'partagé';
type Level = {
  name: string; analogy: string; detail: string; iso: number; agility: number;
  cpu: Share; ram: Share; os: Share; techno: string; p3?: boolean;
};

const levels: Level[] = [
  { name: 'Standalone', analogy: 'Une maison', detail: 'Un serveur tout seul : rien n’est partagé avec personne.', iso: 5, agility: 1, cpu: 'dédié', ram: 'dédié', os: 'dédié', techno: 'Tout serveur physique' },
  { name: 'Partition physique', analogy: 'Un appartement', detail: 'Un CPU est alloué à une partition. Du commun (escaliers, ascenseur) et du dédié (l’appartement). Cloisonnement électrique : un mur porteur, cassable mais long et compliqué.', iso: 4, agility: 1.5, cpu: 'dédié', ram: 'dédié', os: 'dédié', techno: 'nPar (Itanium), mainframe' },
  { name: 'Partition logique', analogy: 'Une salle de cours modulable', detail: 'Le CPU est alloué à une partition, mais on le change facilement. Toujours du commun et du dédié.', iso: 3, agility: 2.5, cpu: 'réallouable', ram: 'réallouable', os: 'dédié', techno: 'lPar (Power), vPar (Itanium), Zones (Sparc, partagent le noyau)' },
  { name: 'Machine virtuelle', analogy: 'Une colocation d’étudiants', detail: 'Le temps CPU et les I/O sont partagés entre les VM. Rien n’est dédié : CPU, I/O, RAM, tout est partagé.', iso: 2, agility: 4, cpu: 'partagé', ram: 'partagé', os: 'dédié', techno: 'VMware, Hyper-V (x86), PowerVM, HP VM, hyperviseur mainframe' },
  { name: 'Container', analogy: 'La super virtualisation', detail: 'Le principe de la virtualisation poussé à l’extrême et allégé : les conteneurs partagent jusqu’au noyau de l’OS.', iso: 1.5, agility: 5, cpu: 'partagé', ram: 'partagé', os: 'partagé', techno: 'Docker (x86), mainframe si Linux', p3: true },
  { name: 'Process / thread', analogy: 'Inception', detail: 'Une colocation dans un appartement, une colocation dans une maison… on peut encore découper à l’intérieur de l’OS.', iso: 1, agility: 5, cpu: 'partagé', ram: 'partagé', os: 'partagé', techno: 'L’ordonnanceur de l’OS' },
];

const tone: Record<Share, string> = {
  'dédié': 'bg-signal-soft text-ink border-signal',
  'réallouable': 'bg-amber-soft text-ink border-amber',
  'partagé': 'bg-synapse-soft text-ink border-synapse',
};

function Gauge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="grid gap-1">
      <span className="flex justify-between text-xs text-ink-2"><span>{label}</span><span className="font-mono text-ink">{value}/5</span></span>
      <div className="h-2.5 overflow-hidden rounded-full bg-surface-2" aria-hidden>
        <motion.div className="h-full rounded-full" style={{ background: color }} animate={{ width: `${(value / 5) * 100}%` }} transition={{ type: 'spring', stiffness: 140, damping: 22 }} />
      </div>
    </div>
  );
}

export default function PartitioningIsland() {
  const [i, setI] = useState(3);
  const l = levels[i];

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Niveau de cloisonnement">
        {levels.map((x, k) => (
          <button key={x.name} type="button" role="tab" aria-selected={i === k} onClick={() => setI(k)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${i === k ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            {x.name}
          </button>
        ))}
      </div>

      <div className="flex justify-between text-xs text-ink-3"><span>↑ isolation matérielle</span><span>mutualisation matérielle ↓</span></div>

      <motion.div key={l.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 rounded-xl border border-line bg-bg p-4 sm:grid-cols-[1fr_1fr]">
        <div className="grid content-start gap-2">
          <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Analogie</p>
          <p className="text-lg font-semibold text-ink">{l.analogy}{l.p3 && <span className="ml-2 rounded-full bg-ink px-2 py-0.5 align-middle text-[0.65rem] font-medium text-bg">Platform 3</span>}</p>
          <p className="text-sm text-ink-2">{l.detail}</p>
          <p className="text-xs text-ink-3">Exemples : <span className="text-ink-2">{l.techno}</span></p>
        </div>
        <div className="grid content-start gap-3">
          <ul className="grid grid-cols-3 gap-2" aria-label="Ce qui est dédié ou partagé">
            {([['CPU', l.cpu], ['RAM / I/O', l.ram], ['Noyau OS', l.os]] as const).map(([k, v]) => (
              <li key={k} className={`grid gap-0.5 rounded-lg border px-2 py-2 text-center ${tone[v]}`}>
                <span className="text-[0.65rem] text-ink-3">{k}</span>
                <span className="text-sm font-medium">{v}</span>
              </li>
            ))}
          </ul>
          <Gauge label="Isolation" value={l.iso} color="var(--signal)" />
          <Gauge label="Agilité" value={l.agility} color="var(--synapse)" />
        </div>
      </motion.div>
      <p className="text-sm text-ink-2">Plus le cloisonnement est faible, plus l’agilité est grande : choisis le niveau selon le besoin d’isolation (fort, moyen, faible).</p>
    </div>
  );
}
