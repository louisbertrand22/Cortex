import { motion } from 'motion/react';
import { useState } from 'react';

// RAID : faire tomber des disques et voir si les données survivent (GEN ARCHI session 2, annexe « RAID »)
type Level = '0' | '1' | '5' | '6' | '10';
type Spec = { disks: number; layout: string[][]; usable: (n: number) => number; lost: (failed: Set<number>) => boolean; tolerance: string; read: string; write: string; note: string };

const spec: Record<Level, Spec> = {
  '0': {
    disks: 4, layout: [['A1', 'A2', 'A3', 'A4'], ['B1', 'B2', 'B3', 'B4'], ['C1', 'C2', 'C3', 'C4']],
    usable: (n) => n, lost: (f) => f.size > 0, tolerance: 'aucun disque',
    read: '+++', write: '+++', note: 'Les blocs sont répartis (striping) : toute la capacité et toute la vitesse, aucune redondance.',
  },
  '1': {
    disks: 2, layout: [['A', 'A'], ['B', 'B'], ['C', 'C']],
    usable: () => 1, lost: (f) => f.size >= 2, tolerance: '1 disque',
    read: '++', write: '+', note: 'Miroir : chaque bloc est écrit deux fois. On paie deux disques pour en utiliser un.',
  },
  '5': {
    disks: 4, layout: [['A1', 'A2', 'A3', 'Ap'], ['B1', 'B2', 'Bp', 'B3'], ['C1', 'Cp', 'C2', 'C3']],
    usable: (n) => n - 1, lost: (f) => f.size >= 2, tolerance: '1 disque',
    read: '++', write: '−', note: 'Une parité (p) tournante permet de recalculer le disque perdu. Chaque écriture recalcule la parité.',
  },
  '6': {
    disks: 5, layout: [['A1', 'A2', 'A3', 'Ap', 'Aq'], ['B1', 'B2', 'Bp', 'Bq', 'B3'], ['C1', 'Cp', 'Cq', 'C2', 'C3']],
    usable: (n) => n - 2, lost: (f) => f.size >= 3, tolerance: '2 disques',
    read: '++', write: '−−', note: 'Double parité (p et q) : c’est le principe du « 7D+2P » des baies, 7 disques de données pour 2 de parité.',
  },
  '10': {
    disks: 4, layout: [['A1', 'A1', 'A2', 'A2'], ['B1', 'B1', 'B2', 'B2'], ['C1', 'C1', 'C2', 'C2']],
    usable: (n) => n / 2, lost: (f) => (f.has(0) && f.has(1)) || (f.has(2) && f.has(3)), tolerance: '1 disque par miroir',
    read: '+++', write: '++', note: 'Des miroirs (RAID 1) répartis en bandes (RAID 0) : rapide et redondant, mais la moitié de la capacité.',
  },
};
const levels = Object.keys(spec) as Level[];

export default function RaidIsland() {
  const [lvl, setLvl] = useState<Level>('5');
  const [failed, setFailed] = useState<Set<number>>(new Set());
  const s = spec[lvl];
  const lost = s.lost(failed);
  const degraded = !lost && failed.size > 0;

  const toggle = (d: number) => setFailed((f) => {
    const n = new Set(f);
    if (n.has(d)) n.delete(d); else n.add(d);
    return n;
  });

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Niveau de RAID">
        {levels.map((l) => (
          <button key={l} type="button" role="tab" aria-selected={lvl === l} onClick={() => { setLvl(l); setFailed(new Set()); }}
            className={`rounded-lg border px-3 py-1.5 font-mono text-sm transition-colors ${lvl === l ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            RAID {l}
          </button>
        ))}
      </div>

      <div className="grid gap-2 rounded-xl border border-line bg-bg p-4" style={{ gridTemplateColumns: `repeat(${s.disks}, minmax(0, 1fr))` }}>
        {Array.from({ length: s.disks }).map((_, d) => {
          const down = failed.has(d);
          return (
            <button key={`${lvl}-${d}`} type="button" onClick={() => toggle(d)} aria-pressed={down}
              aria-label={`Disque ${d + 1} : ${down ? 'en panne, cliquer pour le remplacer' : 'en service, cliquer pour le faire tomber'}`}
              className={`grid gap-1 rounded-lg border-2 p-1.5 transition-colors ${down ? 'border-danger bg-danger-soft' : 'border-line hover:border-line-strong'}`}>
              {s.layout.map((row, r) => {
                const b = row[d];
                const parity = /[pq]$/.test(b);
                return (
                  <motion.span key={r} animate={{ opacity: down ? 0.35 : 1 }}
                    className={`rounded px-1 py-1 text-center font-mono text-xs ${down ? 'text-danger line-through' : parity ? 'bg-amber-soft text-ink' : 'bg-surface-2 text-ink'}`}>
                    {b}
                  </motion.span>
                );
              })}
              <span className={`text-center text-[0.65rem] ${down ? 'font-semibold text-danger' : 'text-ink-3'}`}>{down ? '✗ panne' : `disque ${d + 1}`}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {([['Capacité utile', `${s.usable(s.disks)} To / ${s.disks} To`], ['Tolère la perte de', s.tolerance], ['Lecture', s.read], ['Écriture', s.write]] as const).map(([k, v]) => (
          <div key={k} className="rounded-lg bg-surface-2 px-3 py-2">
            <p className="text-[0.65rem] text-ink-3">{k}</p>
            <p className="font-mono text-sm font-medium text-ink">{v}</p>
          </div>
        ))}
      </div>

      <motion.p key={`${lvl}-${failed.size}-${lost}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className={`text-base font-semibold ${lost ? 'text-danger' : degraded ? 'text-amber' : 'text-synapse'}`}>
        {lost ? '✕ Données perdues : il faut restaurer depuis la sauvegarde' : degraded ? `⚠ Mode dégradé : les données sont intactes, remplace vite ${failed.size > 1 ? 'les disques' : 'le disque'}` : '✓ Toutes les données sont accessibles'}
      </motion.p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-2">{s.note} Clique sur un disque pour le faire tomber.</p>
        <button type="button" onClick={() => setFailed(new Set())} className="rounded-xl border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-line-strong">Recommencer</button>
      </div>
    </div>
  );
}
