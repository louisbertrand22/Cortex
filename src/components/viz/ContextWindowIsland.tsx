import { motion } from 'motion/react';
import { useState } from 'react';

/** Fenêtre de contexte : plus on envoie de pages, moins il reste de place — et la bonne page glisse au milieu. */
export default function ContextWindowIsland() {
  const [pages, setPages] = useState(1);
  const [ranked, setRanked] = useState(false);
  const sys = 8, conv = 10, perPage = 7.5;
  const docs = Math.min(pages * perPage, 100 - sys - conv - 4);
  const room = 100 - sys - conv - docs;
  // position du paragraphe-réponse dans le bloc documents
  const answerAt = ranked || pages === 1 ? 0 : Math.floor((pages - 1) / 2);
  const tokens = Math.round(2000 + pages * 1500);
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="grid flex-1 gap-1">
          <span className="flex justify-between text-ink-2"><span>Pages de documentation envoyées</span><span className="font-mono text-ink">{pages}</span></span>
          <input type="range" min={1} max={10} value={pages} onChange={(e) => setPages(Number(e.target.value))} className="accent-[var(--signal)]" />
        </label>
        <label className="flex items-center gap-2 text-ink-2"><input type="checkbox" checked={ranked} onChange={(e) => setRanked(e.target.checked)} className="accent-[var(--signal)]" /> classer par pertinence</label>
      </div>
      <div className="flex h-14 overflow-hidden rounded-xl border border-line bg-bg text-[0.68rem]">
        <div className="grid place-items-center bg-ink text-bg" style={{ width: `${sys}%` }}>règles</div>
        <motion.div className="flex" animate={{ width: `${docs}%` }} transition={{ type: 'spring', stiffness: 140, damping: 22 }}>
          {Array.from({ length: pages }, (_, i) => (
            <div key={i} className="flex-1 border-r border-bg" style={{ background: i === answerAt ? 'var(--signal)' : 'var(--line-strong)' }} title={i === answerAt ? 'le paragraphe qui répond' : 'page sans la réponse'} />
          ))}
        </motion.div>
        <div className="grid place-items-center bg-surface-2 text-ink-3" style={{ width: `${conv}%` }}>historique</div>
        <motion.div className="grid place-items-center text-ink-2" animate={{ width: `${room}%`, background: room < 20 ? 'var(--danger-soft)' : 'var(--synapse-soft)' }}>
          {room > 12 ? 'place pour la réponse' : '!'}
        </motion.div>
      </div>
      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg border border-line p-3"><p className="text-xs text-ink-3">Tokens envoyés à chaque appel</p><p className="font-mono text-lg text-ink">~{tokens.toLocaleString('fr-FR')}</p><p className="text-xs text-ink-3">renvoyés et repayés à chaque appel</p></div>
        <div className="rounded-lg border border-line p-3"><p className="text-xs text-ink-3">Place restante pour répondre</p><p className="font-mono text-lg" style={{ color: room < 20 ? 'var(--danger)' : 'var(--ink)' }}>{Math.round(room)} %</p><p className="text-xs text-ink-3">la fenêtre, elle, ne grandit pas</p></div>
        <div className="rounded-lg border border-line p-3"><p className="text-xs text-ink-3">Position de la bonne page</p><p className="font-mono text-lg text-ink">{answerAt === 0 ? 'en tête' : `${answerAt + 1}ᵉ / ${pages}`}</p><p className="text-xs text-ink-3">{answerAt > 0 ? 'lost in the middle : moins bien exploitée' : 'aux bords : bien exploitée'}</p></div>
      </div>
      <p className="text-xs text-ink-3">Illustratif : découpage et positions non mesurés.</p>
    </div>
  );
}
