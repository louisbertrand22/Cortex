import { motion } from 'motion/react';
import { useState } from 'react';

// Le harnais autour du LLM (PIT POV 02, « The harness connects the model to the world ») :
// le modèle produit une sortie, c'est le système qui permet l'action.
type Layer = 'rag' | 'tools' | 'memory' | 'safety' | 'body';
const layers: { id: Layer; label: string; hint: string }[] = [
  { id: 'rag', label: 'RAG', hint: 'retrouver des documents' },
  { id: 'tools', label: 'Outils', hint: 'code, fichiers, navigateur, API' },
  { id: 'memory', label: 'Contexte + mémoire', hint: 'garder l’état d’une tâche' },
  { id: 'safety', label: 'Sécurité + permissions', hint: 'borner ce qui est permis' },
  { id: 'body', label: 'Capteurs + actionneurs', hint: 'agir dans le monde physique' },
];

type Status = 'ok' | 'risky' | 'no';
type Task = { label: string; check: (on: Set<Layer>) => [Status, string] };
const tasks: Task[] = [
  { label: 'Expliquer ce qu’est un SLA', check: () => ['ok', 'Le modèle seul suffit : c’est de la génération de texte.'] },
  { label: 'Résumer la politique de congés de l’entreprise', check: (on) => on.has('rag')
    ? ['ok', 'Le RAG lui donne le document : la réponse s’appuie sur une source.']
    : ['no', 'Le document n’est pas dans ses poids : il inventerait une politique plausible.'] },
  { label: 'Ouvrir un ticket dans l’outil de support', check: (on) => !on.has('tools')
    ? ['no', 'Sans outil, il peut seulement rédiger le ticket, pas le créer.']
    : on.has('safety') ? ['ok', 'L’outil agit, dans les limites de ses permissions.'] : ['risky', 'Il agit, mais rien ne borne ce qu’il a le droit de faire.'] },
  { label: 'Reprendre une migration commencée hier', check: (on) => !on.has('memory')
    ? ['no', 'Une nouvelle session repart de zéro : l’état d’hier est perdu.']
    : on.has('tools') ? ['ok', 'Il relit l’état sauvegardé et reprend le travail.'] : ['risky', 'Il sait où il en était, mais ne peut rien exécuter.'] },
  { label: 'Ranger un colis dans l’entrepôt', check: (on) => on.has('body')
    ? ['ok', 'Capteurs et actionneurs relient le système au monde physique.']
    : ['no', 'Le monde physique exige des capteurs et des actionneurs.'] },
];
const icon: Record<Status, string> = { ok: '✓', risky: '!', no: '✗' };
const tone: Record<Status, string> = { ok: 'text-synapse', risky: 'text-amber', no: 'text-ink-3' };

export default function HarnessIsland() {
  const [on, setOn] = useState<Set<Layer>>(() => new Set());
  const toggle = (id: Layer) => setOn((s) => { const t = new Set(s); t.has(id) ? t.delete(id) : t.add(id); return t; });
  const results = tasks.map((t) => t.check(on));
  const done = results.filter(([s]) => s === 'ok').length;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" aria-label="Couches du harnais">
        <span className="rounded-lg border border-signal bg-signal-soft px-3 py-1.5 text-sm font-medium text-ink">LLM · boucle d’exécution</span>
        {layers.map((l) => {
          const active = on.has(l.id);
          return (
            <button key={l.id} type="button" aria-pressed={active} onClick={() => toggle(l.id)} title={l.hint}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${active ? 'border-synapse bg-synapse-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
              {active ? '✓ ' : '+ '}{l.label}
            </button>
          );
        })}
      </div>

      <ul className="grid gap-2">
        {tasks.map((t, i) => {
          const [s, why] = results[i];
          return (
            <motion.li key={t.label} layout className="grid grid-cols-[1.5rem_1fr] gap-x-2 rounded-lg border border-line px-3 py-2">
              <span className={`font-mono text-base font-semibold ${tone[s]}`} aria-label={s === 'ok' ? 'possible' : s === 'risky' ? 'risqué' : 'impossible'}>{icon[s]}</span>
              <span className="text-sm text-ink">{t.label}</span>
              <span className="col-start-2 text-xs text-ink-2">{why}</span>
            </motion.li>
          );
        })}
      </ul>

      <p className="text-base font-semibold text-ink">
        {done} tâche{done > 1 ? 's' : ''} sur {tasks.length} à portée
        <span className="font-normal text-ink-2"> · le modèle produit une sortie, c’est le système qui permet l’action.</span>
      </p>
      <button type="button" onClick={() => setOn(new Set())} className="justify-self-start rounded-xl bg-ink px-3 py-1.5 text-sm font-medium text-bg">Recommencer</button>
    </div>
  );
}
