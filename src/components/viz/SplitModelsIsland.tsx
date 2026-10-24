import { motion } from 'motion/react';
import { useState } from 'react';

// Les quatre visions du découpage d'un SI, d'après les schémas du support UBSI (session 1)
type Unit = { ihm?: boolean; api?: boolean; data?: boolean };
const models = [
  {
    id: 'standard', short: 'Standard', title: 'Le modèle « standard » : des applications',
    units: Array.from({ length: 5 }, () => ({ ihm: true, data: true })) as Unit[],
    shared: false,
    note: 'Chaque application a son IHM, ses traitements et son stock de données, que seule elle peut accéder. Les applications communiquent par des flux.',
    verdict: 'Éprouvé dans tous les SI de toutes les entreprises.',
  },
  {
    id: 'erp', short: 'ERP universel', title: 'Le modèle « ERP universel »',
    units: [] as Unit[],
    shared: true,
    note: 'Une seule application pour toute l’entreprise : une IHM, tous les modules, une base commune. C’était la promesse des ERP.',
    verdict: 'Le monolithe n’est ni soutenable ni possible à l’échelle d’un SI entier.',
  },
  {
    id: 'data', short: 'Data centric', title: 'Le modèle « Data centric »',
    units: Array.from({ length: 5 }, () => ({ ihm: true })) as Unit[],
    shared: true,
    note: 'Plusieurs IHM et traitements séparés, branchés sur un même stock de données central.',
    verdict: 'Pas universel, mais pertinent sur un sous-ensemble du SI.',
  },
  {
    id: 'micro', short: 'Micro services', title: 'Le modèle « Micro services »',
    units: Array.from({ length: 7 }, () => ({ api: true, data: true })) as Unit[],
    shared: false,
    note: 'Beaucoup de petits services, chacun avec son API et ses propres données. Les IHM appellent les API, les services s’appellent entre eux.',
    verdict: 'Pas universel, mais pertinent sur un sous-ensemble du SI.',
  },
];

const tag = 'rounded px-1.5 py-0.5 text-center font-mono text-[0.6rem]';

function Tile({ u, i }: { u: Unit; i: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
      className="grid w-20 gap-1 rounded-lg border border-line-strong bg-surface p-1.5">
      {u.ihm && <span className={tag} style={{ background: 'var(--signal-soft)', color: 'var(--ink)' }}>IHM</span>}
      {u.api && <span className={tag} style={{ background: 'var(--amber-soft)', color: 'var(--ink)' }}>API</span>}
      <span className={tag} style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>⚙ traitements</span>
      {u.data && <span className={tag} style={{ background: 'var(--synapse-soft)', color: 'var(--ink)' }}>Data</span>}
    </motion.div>
  );
}

export default function SplitModelsIsland() {
  const [m, setM] = useState(0);
  const M = models[m];
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Modèle de découpage">
        {models.map((x, i) => (
          <button key={x.id} type="button" role="tab" aria-selected={m === i} onClick={() => setM(i)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${m === i ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            {x.short}
          </button>
        ))}
      </div>
      <div className="grid min-h-48 content-center gap-3 rounded-xl border border-line bg-bg p-4">
        {M.id === 'erp' ? (
          <motion.div key="erp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-2 rounded-lg border-2 border-line-strong bg-surface p-3">
            <span className={tag} style={{ background: 'var(--signal-soft)', color: 'var(--ink)' }}>IHM unique</span>
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
              {['Ventes', 'Achats', 'Stocks', 'Compta', 'RH', 'Logistique'].map((x) => (
                <span key={x} className={tag} style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>⚙ {x}</span>
              ))}
            </div>
            <span className={tag} style={{ background: 'var(--synapse-soft)', color: 'var(--ink)' }}>Data · une base commune</span>
          </motion.div>
        ) : (
          <>
            {M.id === 'micro' && (
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map((k) => <span key={k} className={`${tag} w-20`} style={{ background: 'var(--signal-soft)', color: 'var(--ink)' }}>IHM</span>)}
              </div>
            )}
            <div key={M.id} className="flex flex-wrap justify-center gap-2">
              {M.units.map((u, i) => <Tile key={`${M.id}-${i}`} u={u} i={i} />)}
            </div>
            {M.shared && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${tag} py-2`} style={{ background: 'var(--synapse-soft)', color: 'var(--ink)' }}>
                ↓ Data · stock de données partagé ↓
              </motion.div>
            )}
            {!M.shared && <p className="text-center text-xs text-ink-3">{M.id === 'micro' ? 'IHM → API, API → API' : 'flux point à point entre applications'}</p>}
          </>
        )}
      </div>
      <div>
        <p className="text-base font-semibold text-ink">{M.title}</p>
        <p className="mt-1 text-sm text-ink-2">{M.note}</p>
        <p className={`mt-1 text-sm ${M.id === 'standard' ? 'text-synapse' : 'text-ink-3'}`}>{M.verdict}</p>
      </div>
    </div>
  );
}
