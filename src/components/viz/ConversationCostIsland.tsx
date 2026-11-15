import { motion } from 'motion/react';
import { useState } from 'react';

/**
 * Pourquoi une longue conversation use plus vite les limites : à chaque message, le modèle
 * relit toute la conversation (et les pièces jointes). Unités illustratives : 1 bloc = un
 * message moyen ; un document joint compte pour 20 blocs.
 */
const DOC = 20;

export default function ConversationCostIsland() {
  const [n, setN] = useState(10);
  const [doc, setDoc] = useState(false);

  // Message k (1..n) : le modèle lit tout ce qui précède (2 blocs par échange) + le document.
  const perMsg = (k: number) => 2 * k + (doc ? DOC : 0);
  const total = Array.from({ length: n }, (_, k) => perMsg(k + 1)).reduce((a, b) => a + b, 0);
  const split = Math.ceil(n / 2);
  const twoChats =
    Array.from({ length: split }, (_, k) => perMsg(k + 1)).reduce((a, b) => a + b, 0) +
    Array.from({ length: n - split }, (_, k) => perMsg(k + 1)).reduce((a, b) => a + b, 0);
  const max = Math.max(...Array.from({ length: n }, (_, k) => perMsg(k + 1)));
  const fmt = (v: number) => v.toLocaleString('fr-FR');

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_1.3fr]">
      <div className="grid content-start gap-4">
        <label className="grid gap-1 text-sm">
          <span className="flex justify-between text-ink-2">
            <span>Nombre de messages dans la conversation</span>
            <span className="font-mono text-ink tabular-nums">{n}</span>
          </span>
          <input type="range" min={1} max={40} value={n} onChange={(e) => setN(Number(e.target.value))} aria-label="Nombre de messages" className="accent-[var(--signal)]" />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" checked={doc} onChange={(e) => setDoc(e.target.checked)} className="accent-[var(--signal)]" />
          Un long document joint au début
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-line bg-surface p-3">
            <p className="text-xs text-ink-3">Une seule conversation</p>
            <p className="font-display text-3xl text-ink tabular-nums">{fmt(total)}</p>
            <p className="text-xs text-ink-2">blocs relus en tout</p>
          </div>
          <div className="rounded-xl border border-synapse/40 bg-synapse-soft p-3">
            <p className="text-xs text-ink-3">Coupée en deux</p>
            <p className="font-display text-3xl text-ink tabular-nums">{fmt(twoChats)}</p>
            <p className="text-xs text-ink-2">soit {Math.round((1 - twoChats / total) * 100)} % de moins</p>
          </div>
        </div>
        <p className="text-xs text-ink-3">Unités illustratives : 1 bloc = un message moyen, le document compte pour {DOC} blocs. Le principe est réel, les chiffres sont simplifiés.</p>
      </div>

      <div className="grid content-end gap-2">
        <p className="text-xs text-ink-3">Ce que le modèle relit pour produire chaque réponse</p>
        <div className="flex h-44 items-end gap-[2px]" role="img" aria-label={`Le dernier message fait relire ${perMsg(n)} blocs`}>
          {Array.from({ length: n }, (_, k) => (
            <motion.div
              key={k}
              className={`flex-1 rounded-t ${k === n - 1 ? 'bg-signal' : 'bg-ink-3/40'}`}
              animate={{ height: `${(perMsg(k + 1) / Math.max(max, 2 * 40)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        <p className="flex justify-between text-xs text-ink-3"><span>1er message</span><span>message {n} : {perMsg(n)} blocs</span></p>
      </div>
    </div>
  );
}
