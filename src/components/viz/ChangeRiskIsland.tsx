import { motion } from 'motion/react';
import { useState } from 'react';

// Gestion des changements ITIL (PIT POV 13) : validation proportionnée au risque,
// face au circuit unique « alourdi » que critiquent les exposants.
type Risk = 'low' | 'medium' | 'high';
const changes: { id: Risk; label: string; example: string; approver: string }[] = [
  { id: 'low', label: 'Risque faible', example: 'Ajouter un champ dans un formulaire interne', approver: 'Approuvé automatiquement' },
  { id: 'medium', label: 'Risque moyen', example: 'Mettre à jour le serveur de messagerie', approver: 'Validé par le manager' },
  { id: 'high', label: 'Risque élevé', example: 'Migrer la base clients en production', approver: 'Validé par le CAB' },
];
const bloated = ['Demande de changement', 'Validation du manager', 'Comité des risques', 'Documentation', 'Comité de mise en œuvre', 'Déploiement'];
const humanGates = new Set([1, 2, 4]);

export default function ChangeRiskIsland() {
  const [risk, setRisk] = useState<Risk>('low');
  const [heavy, setHeavy] = useState(false);
  const c = changes.find((x) => x.id === risk)!;
  const steps = heavy ? bloated : ['Demande', 'Évaluation', c.approver, 'Mise en œuvre', 'Revue'];
  const gates = heavy ? humanGates.size : risk === 'low' ? 0 : 1;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Changement à faire passer">
        {changes.map((x) => (
          <button key={x.id} type="button" aria-pressed={risk === x.id} onClick={() => setRisk(x.id)}
            className={`grid rounded-lg border px-3 py-1.5 text-left text-sm transition-colors ${risk === x.id ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            <span className="font-medium">{x.label}</span>
            <span className="text-xs text-ink-2">{x.example}</span>
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-2">
        <input type="checkbox" checked={heavy} onChange={(e) => setHeavy(e.target.checked)} className="accent-[var(--signal)]" />
        Appliquer le circuit unique « alourdi » à tous les changements
      </label>

      <ol className="flex flex-wrap items-center gap-1.5" aria-label="Circuit du changement">
        {steps.map((s, k) => {
          const gate = heavy ? humanGates.has(k) : k === 2 && risk !== 'low';
          return (
            <motion.li key={`${heavy}-${risk}-${s}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.05 }} className="flex items-center gap-1.5">
              <span className={`rounded-md border px-2 py-1 text-xs ${gate ? 'border-amber bg-amber-soft text-ink' : 'border-line text-ink-2'}`}>{gate ? '◆ ' : ''}{s}</span>
              {k < steps.length - 1 && <span className="text-ink-3" aria-hidden>→</span>}
            </motion.li>
          );
        })}
      </ol>

      <p className="text-base font-semibold text-ink">
        {gates} validation{gates > 1 ? 's' : ''} humaine{gates > 1 ? 's' : ''} ◆ · {steps.length} étapes
        <span className="font-normal text-ink-2">
          {heavy
            ? ' : le même circuit pour un champ de formulaire et pour une migration, c’est le « one-size-fits-none ».'
            : ' : ITIL proportionne la validation au risque du changement.'}
        </span>
      </p>
    </div>
  );
}
