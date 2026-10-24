import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

/** Construire un bon prompt, ingrédient par ingrédient, et voir ce que ça change. */
const parts = [
  { id: 'role', name: 'Un rôle', text: 'Tu es un prof de SVT patient, qui explique simplement.', effect: 'Ton pédagogue, pas celui d’une encyclopédie.' },
  { id: 'ctx', name: 'Le contexte', text: 'Je suis en seconde, j’ai un contrôle vendredi et je n’ai pas compris le cours.', effect: 'Niveau adapté à la seconde, sans vocabulaire de fac.' },
  { id: 'task', name: 'La tâche précise', text: 'Explique-moi la photosynthèse : ce qui entre dans la plante, ce qui en sort, et à quoi ça lui sert.', effect: 'Une réponse centrée sur ce que tu dois savoir.' },
  { id: 'fmt', name: 'Le format', text: 'Réponds en 5 points courts, avec un exemple de la vie de tous les jours.', effect: 'Court et facile à relire, au lieu d’un pavé.' },
  { id: 'check', name: 'Une vérification', text: 'Termine par 3 questions pour vérifier que j’ai compris, sans me donner les réponses.', effect: 'Tu t’entraînes, au lieu de juste lire.' },
];
const BASE = 'Explique la photosynthèse.';

export default function PromptBuilderIsland() {
  const [on, setOn] = useState<string[]>([]);
  const active = parts.filter((p) => on.includes(p.id));
  const toggle = (id: string) => setOn((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));
  const lines = active.some((p) => p.id === 'task') ? active.map((p) => p.text) : [...active.map((p) => p.text), BASE];
  const quality = active.length / parts.length;

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_1.3fr]">
      <div className="grid content-start gap-2">
        <p className="text-xs text-ink-3">Ajoute des ingrédients à ton prompt :</p>
        {parts.map((p) => {
          const sel = on.includes(p.id);
          return (
            <button key={p.id} type="button" onClick={() => toggle(p.id)} aria-pressed={sel} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${sel ? 'border-signal bg-signal-soft text-ink' : 'border-line bg-surface text-ink-2 hover:border-line-strong'}`}>
              <span className={`grid size-5 shrink-0 place-items-center rounded-md border text-xs ${sel ? 'border-signal bg-signal text-bg' : 'border-line-strong'}`}>{sel ? '✓' : ''}</span>
              {p.name}
            </button>
          );
        })}
      </div>

      <div className="grid content-start gap-4">
        <div className="rounded-xl border border-line bg-bg p-4">
          <p className="mb-2 font-mono text-xs text-ink-3">ton prompt</p>
          <div className="grid gap-1.5 text-[0.9375rem] leading-relaxed text-ink">
            <AnimatePresence initial={false}>
              {lines.map((l) => (
                <motion.p key={l} layout initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>{l}</motion.p>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex justify-between text-xs text-ink-3"><span>Chances d’obtenir une réponse vraiment utile</span><span>{Math.round(20 + quality * 75)} %</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <motion.div className="h-full rounded-full" style={{ background: quality === 1 ? 'var(--synapse)' : 'var(--signal)' }} animate={{ width: `${20 + quality * 75}%` }} />
          </div>
        </div>

        <ul className="grid gap-1.5 text-sm">
          {active.length === 0 && (
            <li className="rounded-lg border border-line bg-surface px-3 py-2 text-ink-2">Sans précision, tu obtiens une réponse « moyenne » : longue, générale, peut-être trop technique. L’IA ne sait rien de toi.</li>
          )}
          {active.map((p) => (
            <motion.li key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-ink-2">
              <span className="text-synapse">✓</span>{p.effect}
            </motion.li>
          ))}
        </ul>
        <p className="text-xs text-ink-3">Pourcentages indicatifs, pour l’idée : ce n’est pas une mesure.</p>
      </div>
    </div>
  );
}
