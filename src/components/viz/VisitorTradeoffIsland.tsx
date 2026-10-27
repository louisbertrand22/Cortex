import { motion } from 'motion/react';
import { useState } from 'react';

// Visitor : où vit le code, et quels fichiers changent quand on ajoute une opération ou un élément (ACOO session 3, « Visitor »)
type Mode = 'methods' | 'visitor';
type Change = 'op' | 'elem' | null;

const baseElems = ['Maison', 'Chalet'];
const baseOps = ['Prix', 'Export'];
const NEW_ELEM = 'Immeuble';
const NEW_OP = 'Taxe';

export default function VisitorTradeoffIsland() {
  const [mode, setMode] = useState<Mode>('visitor');
  const [change, setChange] = useState<Change>(null);

  const elems = change === 'elem' ? [...baseElems, NEW_ELEM] : baseElems;
  const ops = change === 'op' ? [...baseOps, NEW_OP] : baseOps;

  // fichiers : une classe par élément, et (mode visitor) une interface + une classe par visiteur
  type File = { name: string; status: 'new' | 'edit' | 'same' };
  const files: File[] = [];
  if (mode === 'methods') {
    files.push({ name: 'Building.java', status: change === 'op' ? 'edit' : 'same' });
    elems.forEach((e) => files.push({ name: `${e}.java`, status: e === NEW_ELEM ? 'new' : change === 'op' ? 'edit' : 'same' }));
  } else {
    files.push({ name: 'Building.java', status: 'same' });
    elems.forEach((e) => files.push({ name: `${e}.java`, status: e === NEW_ELEM ? 'new' : 'same' }));
    files.push({ name: 'BatimentVisitor.java', status: change === 'elem' ? 'edit' : 'same' });
    ops.forEach((o) => files.push({ name: `${o}Visitor.java`, status: o === NEW_OP ? 'new' : change === 'elem' ? 'edit' : 'same' }));
  }
  const edited = files.filter((f) => f.status === 'edit').length;
  const created = files.filter((f) => f.status === 'new').length;

  const tone = { new: 'border-synapse bg-synapse-soft', edit: 'border-danger bg-danger-soft', same: 'border-line bg-bg' };
  const label = { new: 'créé', edit: 'modifié', same: 'inchangé' };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Organisation du code">
        {(['methods', 'visitor'] as Mode[]).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${mode === m ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            {m === 'methods' ? 'Une méthode par opération dans chaque classe' : 'Pattern Visitor'}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setChange('op')} aria-pressed={change === 'op'} className={`rounded-xl border px-3 py-1.5 text-sm ${change === 'op' ? 'border-signal text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>+ une opération ({NEW_OP})</button>
        <button type="button" onClick={() => setChange('elem')} aria-pressed={change === 'elem'} className={`rounded-xl border px-3 py-1.5 text-sm ${change === 'elem' ? 'border-signal text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>+ un élément ({NEW_ELEM})</button>
        <button type="button" onClick={() => setChange(null)} className="rounded-xl border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-line-strong">Recommencer</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="overflow-x-auto rounded-xl border border-line bg-bg p-3">
          <p className="mb-2 font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Où vit le code de chaque couple (élément, opération)</p>
          <table className="w-full border-separate border-spacing-1 text-xs">
            <thead><tr><th></th>{ops.map((o) => <th key={o} className={`font-mono text-[0.65rem] font-normal ${o === NEW_OP ? 'text-synapse' : 'text-ink-3'}`}>{mode === 'methods' ? o : `${o}Visitor`}</th>)}</tr></thead>
            <tbody>
              {elems.map((e) => (
                <tr key={e}>
                  <th className={`pr-1 text-left font-mono font-normal ${e === NEW_ELEM ? 'text-synapse' : 'text-ink-3'}`}>{e}</th>
                  {ops.map((o) => (
                    <motion.td key={o} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded bg-surface-2 px-1 py-1 text-center font-mono text-[0.65rem] text-ink">
                      {mode === 'methods' ? `${o.toLowerCase()}()` : `visit(${e})`}
                    </motion.td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-ink-3">{mode === 'methods' ? 'Le code est rangé par ligne : chaque classe d’élément porte une méthode par opération.' : 'Le code est rangé par colonne : chaque visiteur porte une opération pour tous les éléments.'}</p>
        </div>

        <div className="rounded-xl border border-line bg-bg p-3">
          <p className="mb-2 font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Fichiers</p>
          <ul className="grid gap-1">
            {files.map((f) => (
              <motion.li key={f.name} layout initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={`flex justify-between rounded-md border px-2 py-1 font-mono text-xs text-ink ${tone[f.status]}`}>
                <span>{f.name}</span><span className="text-ink-2">{label[f.status]}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <p className={`text-sm font-medium ${change === null ? 'text-ink-2' : edited === 0 ? 'text-synapse' : 'text-danger'}`}>
        {change === null && 'Ajoute une opération ou un élément, dans chacune des deux organisations.'}
        {change !== null && `${created} fichier${created > 1 ? 's' : ''} créé${created > 1 ? 's' : ''}, ${edited} fichier${edited > 1 ? 's' : ''} existant${edited > 1 ? 's' : ''} modifié${edited > 1 ? 's' : ''}.`}
        {change === 'op' && mode === 'visitor' && ' Le Visitor brille : la nouvelle opération est une classe à part.'}
        {change === 'op' && mode === 'methods' && ' Chaque classe d’élément doit être rouverte.'}
        {change === 'elem' && mode === 'visitor' && ' Le revers du Visitor : l’interface et tous les visiteurs doivent apprendre le nouvel élément.'}
        {change === 'elem' && mode === 'methods' && ' Sans Visitor, un nouvel élément est une classe autonome.'}
      </p>
    </div>
  );
}
