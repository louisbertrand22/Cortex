import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

// Command : télécommande de volet, historique des commandes et annulation (ACOO session 5, « Command »)
type Cmd = { label: string; target: (pos: number) => number };
const commands: Cmd[] = [
  { label: 'Ouvrir_Commande', target: () => 100 },
  { label: 'Fermer_Commande', target: () => 0 },
  { label: 'Monter25_Commande', target: (p) => Math.min(100, p + 25) },
  { label: 'Descendre25_Commande', target: (p) => Math.max(0, p - 25) },
];
// chaque commande exécutée retient l'état d'avant pour pouvoir l'annuler
type Done = { label: string; before: number; after: number };

export default function CommandRemoteIsland() {
  const [pos, setPos] = useState(0);
  const [history, setHistory] = useState<Done[]>([]);
  const [undone, setUndone] = useState<Done[]>([]);

  const run = (c: Cmd) => {
    const after = c.target(pos);
    setHistory((h) => [...h, { label: c.label, before: pos, after }]);
    setUndone([]);
    setPos(after);
  };
  const undo = () => {
    const last = history.at(-1);
    if (!last) return;
    setHistory((h) => h.slice(0, -1));
    setUndone((u) => [...u, last]);
    setPos(last.before);
  };
  const redo = () => {
    const next = undone.at(-1);
    if (!next) return;
    setUndone((u) => u.slice(0, -1));
    setHistory((h) => [...h, next]);
    setPos(next.after);
  };
  const reset = () => { setPos(0); setHistory([]); setUndone([]); };

  return (
    <div className="grid gap-5">
      <div>
        <p className="mb-2 font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Invoker · Control_du_Volet</p>
        <div className="flex flex-wrap gap-2">
          {commands.map((c) => (
            <button key={c.label} type="button" onClick={() => run(c)} className="rounded-xl border border-line px-3 py-1.5 font-mono text-xs text-ink-2 hover:border-signal">{c.label}</button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={undo} disabled={!history.length} className="rounded-xl bg-signal px-3 py-1.5 text-sm font-medium text-bg disabled:opacity-40">↶ Annuler</button>
          <button type="button" onClick={redo} disabled={!undone.length} className="rounded-xl border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-line-strong disabled:opacity-40">↷ Rétablir</button>
          <button type="button" onClick={reset} className="rounded-xl border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-line-strong">Recommencer</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <div className="rounded-xl border border-line bg-bg p-3">
          <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Receiver · Volet</p>
          <div className="relative mx-auto mt-2 h-28 w-24 overflow-hidden rounded border border-line-strong bg-synapse-soft" aria-label={`Volet ouvert à ${pos} %`}>
            <motion.div className="absolute inset-x-0 top-0 bg-surface-2 [background-image:repeating-linear-gradient(0deg,var(--line)_0_1px,transparent_1px_8px)]" animate={{ height: `${100 - pos}%` }} transition={{ duration: 0.5 }} />
          </div>
          <p className="mt-2 text-center font-mono text-xs text-ink">ouvert à {pos} %</p>
        </div>
        <div className="rounded-xl border border-line bg-bg p-3">
          <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Historique · des objets Commande conservés</p>
          {history.length === 0 && <p className="mt-2 text-sm text-ink-3">Vide : appuie sur un bouton de la télécommande.</p>}
          <ol className="mt-2 grid gap-1">
            <AnimatePresence initial={false}>
              {history.map((d, i) => (
                <motion.li key={`${i}-${d.label}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="flex justify-between rounded-md bg-surface-2 px-2 py-1 font-mono text-xs text-ink">
                  <span>{d.label}</span><span className="text-ink-3">{d.before} % → {d.after} %</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
          {undone.length > 0 && <p className="mt-2 text-xs text-ink-3">Annulées, rejouables : {undone.map((d) => d.label).reverse().join(', ')}</p>}
        </div>
      </div>
      <p className="text-sm text-ink-2">La télécommande ne sait ni ouvrir ni fermer : elle déclenche des objets Commande. Parce que chaque commande est un objet qui retient l'état d'avant, on peut l'historiser, l'annuler et la rejouer.</p>
    </div>
  );
}
