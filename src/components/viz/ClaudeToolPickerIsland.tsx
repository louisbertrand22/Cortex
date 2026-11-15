import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

/**
 * Quel outil de Claude pour quelle tâche ? On choisit une situation, on devine l'outil,
 * puis on voit la bonne réponse, ce qu'elle permet et si elle est dans l'offre gratuite.
 * Offres d'après claude.com/pricing (novembre 2026).
 */
type Tool = 'chat' | 'projet' | 'artifact' | 'recherche' | 'connecteur' | 'fichier';
const TOOLS: Record<Tool, { label: string; free: string }> = {
  chat: { label: 'Une simple conversation', free: 'Gratuit et Pro' },
  projet: { label: 'Un projet', free: 'Gratuit (5 projets max) · Pro illimité' },
  artifact: { label: 'Un artifact', free: 'Gratuit et Pro' },
  recherche: { label: 'Le mode Recherche', free: 'Pro seulement' },
  connecteur: { label: 'Un connecteur', free: 'Gratuit et Pro' },
  fichier: { label: 'La création de fichiers', free: 'Gratuit et Pro' },
};
const CASES: { text: string; answer: Tool; options: Tool[]; why: string }[] = [
  {
    text: 'Tu prépares un examen pendant trois mois : tu veux que Claude connaisse ton programme, tes fiches et ta façon de travailler à chaque nouvelle conversation.',
    answer: 'projet',
    options: ['chat', 'projet', 'recherche'],
    why: 'Un projet regroupe tes documents et des instructions permanentes (« explique-moi simplement, pose-moi des questions »). Chaque conversation ouverte dans le projet part de là, sans tout réexpliquer.',
  },
  {
    text: 'Tu veux comparer sérieusement trois offres de voyage scolaire, avec des sources récentes et vérifiables.',
    answer: 'recherche',
    options: ['recherche', 'artifact', 'chat'],
    why: 'Le mode Recherche lance plusieurs recherches sur le web, lit les pages et rend un rapport avec ses sources. Plus long qu’une réponse normale, mais tu peux vérifier chaque affirmation.',
  },
  {
    text: 'Tu veux un petit quiz interactif sur les capitales européennes, à ouvrir et à partager.',
    answer: 'artifact',
    options: ['fichier', 'artifact', 'projet'],
    why: 'Un artifact s’affiche à côté de la conversation : une page, un quiz, un schéma, un petit jeu. Tu peux le modifier en discutant (« ajoute un chronomètre ») et le partager par un lien.',
  },
  {
    text: 'Tu veux savoir ce qu’est un taux d’intérêt, en deux minutes, avec un exemple.',
    answer: 'chat',
    options: ['recherche', 'projet', 'chat'],
    why: 'Pas besoin de sortir l’artillerie : une question claire dans une conversation suffit. Garde la Recherche pour ce qui demande des sources récentes.',
  },
  {
    text: 'Tu veux que Claude retrouve dans ta boîte mail la date de ta prochaine réunion de parents d’élèves.',
    answer: 'connecteur',
    options: ['connecteur', 'chat', 'fichier'],
    why: 'Un connecteur (Gmail, Google Agenda, Google Drive…) donne à Claude l’accès à tes données, avec ton autorisation. Sans lui, Claude ne voit pas tes mails. Active seulement ceux dont tu as besoin.',
  },
  {
    text: 'Tu as un tableau de dépenses à mettre en forme et tu veux récupérer un vrai fichier Excel.',
    answer: 'fichier',
    options: ['artifact', 'fichier', 'recherche'],
    why: 'Claude peut créer et modifier des fichiers (Excel, Word, PowerPoint, PDF) en exécutant du code, puis te les donner à télécharger. Vérifie toujours les calculs avant de t’en servir.',
  },
];

export default function ClaudeToolPickerIsland() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Record<number, Tool>>({});
  const c = CASES[i];
  const mine = picked[i];
  const score = CASES.filter((x, k) => picked[k] === x.answer).length;
  const done = Object.keys(picked).length === CASES.length;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Situations">
        {CASES.map((x, k) => (
          <button
            key={k}
            type="button"
            onClick={() => setI(k)}
            aria-label={`Situation ${k + 1}`}
            className={`size-9 rounded-full border text-sm tabular-nums transition-colors ${i === k ? 'border-signal bg-signal-soft text-ink' : picked[k] ? (picked[k] === x.answer ? 'border-synapse text-synapse' : 'border-danger text-danger') : 'border-line bg-surface text-ink-2'}`}
          >
            {k + 1}
          </button>
        ))}
        <span className="ml-auto self-center font-mono text-xs text-ink-3 tabular-nums">score : {score} / {CASES.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="grid gap-3">
          <p className="rounded-xl border border-line bg-surface p-4 text-base text-ink">{c.text}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {c.options.map((t) => {
              const state = !mine ? 'idle' : t === c.answer ? 'right' : t === mine ? 'wrong' : 'other';
              return (
                <button
                  key={t}
                  type="button"
                  disabled={!!mine}
                  onClick={() => setPicked((p) => ({ ...p, [i]: t }))}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${state === 'right' ? 'border-synapse bg-synapse-soft text-ink' : state === 'wrong' ? 'border-danger bg-surface text-ink' : state === 'other' ? 'border-line bg-surface text-ink-3' : 'border-line bg-surface text-ink-2 hover:border-signal hover:text-ink'}`}
                >
                  {state === 'right' ? '✓ ' : state === 'wrong' ? '✗ ' : ''}
                  {TOOLS[t].label}
                </button>
              );
            })}
          </div>
          {mine && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid justify-items-start gap-2">
              <p className="text-sm text-ink-2">
                <strong className="text-ink">{TOOLS[c.answer].label}</strong> · <span className="text-xs text-ink-3">{TOOLS[c.answer].free}</span>
              </p>
              <p className="text-sm text-ink-2">{c.why}</p>
              {i < CASES.length - 1 ? (
                <button type="button" onClick={() => setI(i + 1)} className="rounded-full border border-signal bg-signal-soft px-3 py-1.5 text-sm text-ink">Situation suivante</button>
              ) : done ? (
                <button type="button" onClick={() => { setPicked({}); setI(0); }} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-2 hover:text-ink">Recommencer</button>
              ) : null}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
