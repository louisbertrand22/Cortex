import { motion } from 'motion/react';
import { useState } from 'react';

// Soumission d'une note de frais chez Expense.io, en synchrone puis en asynchrone
// (ARLA session 2, « Expense.io (3) - L'app devient lente » et « Flux NDF Asynchrone »).
// Durées illustratives : seul l'ordre de grandeur compte.
type Mode = 'sync' | 'async';
const TIMEOUT = 10; // délai d'attente du front, en secondes (exemple)
const S3 = 0.3;
const DB = 0.2;
const PUBLISH = 0.1;

const fmt = (s: number) => `${s.toFixed(1).replace('.', ',')} s`;

export default function SyncAsyncIsland() {
  const [mode, setMode] = useState<Mode>('sync');
  const [llm, setLlm] = useState(14);

  const total = S3 + llm + DB;
  const userWait = mode === 'sync' ? total : S3 + PUBLISH;
  const timedOut = mode === 'sync' && total > TIMEOUT;
  const scale = (s: number) => `${Math.min(100, (s / 40) * 100)}%`;

  const rows = mode === 'sync'
    ? [
        { label: 'Dépôt du reçu (S3)', from: 0, len: S3, tone: 'bg-signal' },
        { label: 'Catégorisation (API OpenAI)', from: S3, len: llm, tone: 'bg-signal' },
        { label: 'Écriture en base', from: S3 + llm, len: DB, tone: 'bg-signal' },
      ]
    : [
        { label: 'Dépôt du reçu (S3)', from: 0, len: S3, tone: 'bg-signal' },
        { label: 'Publication « Reçu déposé »', from: S3, len: PUBLISH, tone: 'bg-signal' },
        { label: 'Worker : OpenAI puis base', from: S3 + PUBLISH, len: llm + DB, tone: 'bg-synapse' },
        { label: 'Notification (SMTP)', from: S3 + PUBLISH + llm + DB, len: 0.4, tone: 'bg-synapse' },
      ];

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Mode de traitement">
        {([['sync', 'Synchrone · tout dans la requête'], ['async', 'Asynchrone · bus de messages']] as const).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => setMode(id)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${mode === id ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            {label}
          </button>
        ))}
      </div>

      <label className="grid gap-1.5 text-sm">
        <span className="flex justify-between text-ink-2"><span>Temps de réponse de l’API OpenAI (avec ses retries)</span><span className="font-mono whitespace-nowrap text-ink">{fmt(llm)}</span></span>
        <input type="range" min={1} max={35} step={1} value={llm} onChange={(e) => setLlm(Number(e.target.value))} className="accent-[var(--signal)]" />
      </label>

      <div className="relative grid gap-2 rounded-xl border border-line bg-bg p-4">
        {rows.map((r) => (
          <div key={r.label} className="grid gap-1 sm:grid-cols-[13rem_minmax(0,1fr)] sm:items-center sm:gap-3">
            <span className="text-xs text-ink-2">{r.label}</span>
            <div className="relative h-4 rounded bg-surface-2">
              <motion.div className={`absolute top-0 h-4 rounded ${r.tone}`} initial={false}
                animate={{ left: scale(r.from), width: `max(3px, ${scale(r.len)})` }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />
            </div>
          </div>
        ))}
        <div className="grid gap-1 border-t border-line pt-2 sm:grid-cols-[13rem_minmax(0,1fr)] sm:items-center sm:gap-3">
          <span className="text-xs font-medium text-ink">L’utilisateur attend</span>
          <div className="relative h-4 rounded bg-surface-2">
            <motion.div className={`absolute top-0 left-0 h-4 rounded ${timedOut ? 'bg-danger' : 'bg-ink'}`} initial={false}
              animate={{ width: `max(3px, ${scale(Math.min(userWait, TIMEOUT))})` }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />
            <div className="absolute -top-1 h-6 border-l-2 border-dashed border-amber" style={{ left: scale(TIMEOUT) }} aria-hidden />
          </div>
        </div>
        <p className="text-right font-mono text-[0.65rem] text-ink-3">┆ délai d’attente du front : {TIMEOUT} s · échelle 0 – 40 s</p>
      </div>

      <motion.div key={`${mode}-${timedOut}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <p className={`text-base font-semibold ${timedOut ? 'text-danger' : mode === 'async' ? 'text-synapse' : 'text-ink'}`}>
          {mode === 'async'
            ? `202 Accepted après ${fmt(userWait)}, notification ${fmt(S3 + PUBLISH + llm + DB + 0.4)} plus tard`
            : timedOut ? `Timeout à ${TIMEOUT} s : la note de frais est-elle traitée ? Personne ne le sait` : `Réponse après ${fmt(total)}`}
        </p>
        <p className="mt-1 text-sm text-ink-2">
          {mode === 'async'
            ? 'L’attente de l’utilisateur ne dépend plus d’OpenAI : le worker traite le message à son rythme et le rejoue s’il échoue.'
            : 'En synchrone, l’utilisateur attend le maillon le plus lent : la résilience du système est celle de ce maillon.'}
        </p>
      </motion.div>
      <button type="button" onClick={() => { setMode('sync'); setLlm(14); }} className="justify-self-start rounded-xl bg-ink px-3 py-1.5 text-sm font-medium text-bg">Recommencer</button>
    </div>
  );
}
