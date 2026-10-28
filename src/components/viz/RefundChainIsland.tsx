import { motion } from 'motion/react';
import { useState } from 'react';

// Chain of Responsibility : une demande de remboursement remonte la chaîne jusqu'au premier maillon compétent (ACOO session 5)
type Handler = { id: string; name: string; limit: number };
const all: Handler[] = [
  { id: 'conseiller', name: 'Conseiller', limit: 1_000 },
  { id: 'manager', name: 'Manager', limit: 10_000 },
  { id: 'directeur', name: 'Directeur', limit: 50_000 },
];
const AMOUNTS = [300, 2_500, 8_000, 30_000, 80_000];
const eur = (x: number) => `${x.toLocaleString('fr-FR')} €`;

export default function RefundChainIsland() {
  const [amount, setAmount] = useState(8_000);
  const [withManager, setWithManager] = useState(true);
  const chain = all.filter((h) => withManager || h.id !== 'manager');
  const winner = chain.findIndex((h) => amount <= h.limit);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-ink-2">Montant demandé :</span>
        {AMOUNTS.map((a) => (
          <button key={a} type="button" onClick={() => setAmount(a)} aria-pressed={amount === a}
            className={`rounded-lg border px-3 py-1.5 font-mono text-xs ${amount === a ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>{eur(a)}</button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-2">
        <input type="checkbox" checked={withManager} onChange={(e) => setWithManager(e.target.checked)} className="accent-[var(--signal)]" />
        Le manager fait partie de la chaîne (la chaîne se configure à l'exécution)
      </label>

      <ol className="grid gap-2">
        <li className="rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink-2">Client · envoie <span className="font-mono text-ink">rembourser({eur(amount)})</span> au premier maillon, sans savoir qui traitera.</li>
        {chain.map((h, i) => {
          const state = winner === -1 || i < winner ? 'pass' : i === winner ? 'ok' : 'idle';
          return (
            <motion.li key={`${h.id}-${amount}-${withManager}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }}
              className={`flex flex-wrap justify-between gap-2 rounded-xl border px-3 py-2 text-sm ${state === 'ok' ? 'border-synapse bg-synapse-soft' : state === 'pass' ? 'border-line bg-surface-2' : 'border-dashed border-line text-ink-3'}`}>
              <span className="text-ink">{h.name} <span className="font-mono text-xs text-ink-3">· plafond {eur(h.limit)}</span></span>
              <span className={state === 'ok' ? 'font-medium text-synapse' : 'text-ink-2'}>
                {state === 'ok' ? '✓ valide et arrête la chaîne' : state === 'pass' ? '→ hors de son autorité, passe au successeur' : 'pas sollicité'}
              </span>
            </motion.li>
          );
        })}
      </ol>

      <p className={`text-sm font-medium ${winner === -1 ? 'text-danger' : 'text-ink-2'}`}>
        {winner === -1
          ? '✕ Fin de chaîne sans preneur : la demande n’est traitée par personne. C’est la « réception non garantie ».'
          : `Traité par le maillon ${winner + 1} sur ${chain.length}. Le client n’a jamais su qui allait répondre.`}
      </p>
      <p className="text-xs text-ink-3">Plafonds fictifs, pour l'exemple.</p>
    </div>
  );
}
