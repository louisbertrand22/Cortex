import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

const levels = [
  { name: 'Assistant généraliste privé', what: 'Un modèle généraliste déployé dans le SI, sans les données de l’entreprise.', ex: 'Un « ChatGPT interne » pour que les salariés arrêtent de coller des données dans des outils publics.', issues: ['Confidentialité : ce que tapent les salariés ne doit pas sortir.', 'Coût : chaque question se paie, au token ou au GPU.', 'Hébergement : choisir où tourne le modèle.', 'Souveraineté : quel droit s’applique aux données et au modèle.'] },
  { name: 'Assistant personnalisé, enrichi', what: 'Un agent conversationnel qui utilise les données de l’entreprise dans ses réponses.', ex: 'Un chatbot qui répond aux clients à partir de la FAQ de l’entreprise.', issues: ['Intégration : connecter l’assistant aux sources de données.', 'Fiabilité : réponses justes et ancrées dans ces données.', 'RAG : aller chercher les bons passages avant de répondre.', 'Éventuellement fine-tuning : pour un ton ou un format.'] },
  { name: 'Agent IA interactif', what: 'Un nouveau canal utilisateur qui agit sur le SI via ses API.', ex: 'Un chatbot qui passe une commande, envoie un e-mail, déploie une ressource.', issues: ['Droits d’accès : l’agent ne fait que ce que son utilisateur a le droit de faire.', 'Confiance : quelles actions exigent une confirmation humaine.', 'Détection d’intention : comprendre la vraie demande avant d’agir.'] },
  { name: 'Automatisation IA du SI', what: 'Un moteur de traitement qui automatise des tâches décrites en langage naturel.', ex: 'L’IA dans les processus métier, branchée aux données vivantes et aux capacités du SI, sans utilisateur dans la boucle.', issues: ['Format de réponse : une sortie lisible par d’autres programmes, à chaque fois.', 'Performance : latence et débit au rythme du processus.', 'Patterns multi-agents : répartir une tâche entre plusieurs agents.'] },
];

// niveau minimal à partir duquel chaque brique du SI est touchée par l'IA
const blocks = [
  { id: 'users', label: 'Utilisateurs & canaux', zone: 'top', from: 0, until: 2 },
  { id: 'sec', label: 'Couche sécurité', zone: 'top', from: 0 },
  { id: 'ai', label: 'IA', zone: 'mid', from: 0, ai: true },
  { id: 'api', label: 'Intégration / API', zone: 'mid', from: 2, verb: 'agit' },
  { id: 'svc', label: 'Services', zone: 'op', from: 2, verb: 'agit' },
  { id: 'logic', label: 'Logique métier', zone: 'op', from: 3, verb: 'agit' },
  { id: 'db', label: 'Bases de données', zone: 'op', from: 1, verb: 'lit' },
  { id: 'found', label: 'Fondations IT', zone: 'op', from: 3, verb: 'agit' },
  { id: 'bi', label: 'BI & analytics', zone: 'data', from: 1, verb: 'lit' },
  { id: 'dp', label: 'Data platform', zone: 'data', from: 1, verb: 'lit' },
];

export default function MaturityIsland() {
  const [lvl, setLvl] = useState(0);
  const L = levels[lvl];
  const state = (b: (typeof blocks)[number]) => b.from <= lvl && (b.until === undefined || lvl <= b.until);
  const Block = ({ b }: { b: (typeof blocks)[number] }) => {
    const on = state(b);
    return (
      <motion.div layout className="relative rounded-lg border px-2.5 py-2 text-xs" animate={{ opacity: on ? 1 : 0.45 }}
        style={{ borderColor: b.ai ? 'var(--signal)' : on ? 'var(--synapse)' : 'var(--line)', background: b.ai ? 'var(--signal-soft)' : on ? 'var(--synapse-soft)' : 'var(--surface)' }}>
        <span className={on ? 'font-medium text-ink' : 'text-ink-3'}>{b.label}</span>
        {on && b.verb && <span className="ml-1 font-mono text-[0.65rem] text-synapse">← {b.verb}</span>}
      </motion.div>
    );
  };
  const zone = (z: string) => blocks.filter((b) => b.zone === z).map((b) => <Block key={b.id} b={b} />);
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="tablist">
        {levels.map((l, i) => (
          <button key={i} role="tab" aria-selected={lvl === i} type="button" onClick={() => setLvl(i)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${lvl === i ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            Niveau {i}
          </button>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="grid gap-2 rounded-xl border border-line bg-bg p-3">
          <div className="grid grid-cols-2 gap-2">{zone('top')}</div>
          <div className="grid grid-cols-2 gap-2">{zone('mid')}</div>
          <div className="grid gap-2 sm:grid-cols-[1.6fr_1fr]">
            <div className="rounded-lg border border-dashed border-line p-2"><p className="mb-1.5 font-mono text-[0.65rem] text-ink-3 uppercase">SI opérationnel</p><div className="grid grid-cols-2 gap-1.5">{zone('op')}</div></div>
            <div className="rounded-lg border border-dashed border-line p-2"><p className="mb-1.5 font-mono text-[0.65rem] text-ink-3 uppercase">SI data</p><div className="grid gap-1.5">{zone('data')}</div></div>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-ink-3">
            Impact sur l’architecture
            <span className="flex flex-1 gap-1">{[1, 2, 3].map((k) => <span key={k} className="h-1.5 flex-1 rounded-full" style={{ background: k <= lvl ? 'var(--signal)' : 'var(--line)' }} />)}</span>
            <span className="font-mono">{lvl}/3</span>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={lvl} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <p className="font-mono text-xs tracking-widest text-signal uppercase">Niveau {lvl}</p>
            <p className="mt-1 text-lg font-semibold text-ink">{L.name}</p>
            <p className="mt-2 text-sm text-ink-2">{L.what}</p>
            <p className="mt-2 text-sm text-ink-3 italic">Ex. : {L.ex}</p>
            <p className="mt-4 mb-2 text-xs font-semibold tracking-wide text-ink uppercase">Enjeux (cumulés)</p>
            <ul className="grid gap-1.5 text-sm">
              {levels.slice(0, lvl + 1).flatMap((l, i) => l.issues.map((iss, k) => (
                <li key={`${i}-${k}`} className={`flex gap-2 ${i === lvl ? 'text-ink' : 'text-ink-3'}`}>
                  <span className="font-mono text-xs pt-0.5" style={{ color: i === lvl ? 'var(--signal)' : 'var(--ink-3)' }}>N{i}</span>{iss}
                </li>
              )))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
