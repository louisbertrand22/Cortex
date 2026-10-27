import { motion } from 'motion/react';
import { useState } from 'react';

// Push, pull ou remédiation automatique : la panne arrive-t-elle jusqu'à quelqu'un ?
// (GEN ARCHI session 4, « Architecture plateforme 2 » et « Architecture plateforme 3 »)
type Mode = 'push' | 'pull' | 'p3';
type Fault = 'service' | 'agent' | 'serveur';
type Outcome = { seen: boolean; steps: string[]; verdict: string };

const modes: { id: Mode; label: string }[] = [
  { id: 'push', label: 'Platform 2 · push' },
  { id: 'pull', label: 'Platform 2 · pull' },
  { id: 'p3', label: 'Platform 3 · événements' },
];
const faults: { id: Fault; label: string }[] = [
  { id: 'service', label: 'Le process applicatif tombe' },
  { id: 'agent', label: 'L’agent de monitoring tombe' },
  { id: 'serveur', label: 'Le serveur entier tombe' },
];

const outcome = (m: Mode, f: Fault): Outcome => {
  if (m === 'push') {
    if (f === 'service') return { seen: true, steps: ['L’agent détecte le process down', 'Il pousse l’alerte au serveur de monitoring', 'La console centrale (hypervision) s’allume', 'Le Command Center redémarre le process ou passe au N2 / astreinte'], verdict: 'Alerte reçue : un humain traite.' };
    return { seen: false, steps: [f === 'agent' ? 'L’agent est mort : il n’envoie plus rien' : 'Le serveur est éteint : l’agent aussi', 'Le serveur de monitoring ne reçoit aucune alerte', 'La console reste verte'], verdict: 'Silence : la console croit que tout va bien.' };
  }
  if (m === 'pull') {
    if (f === 'service') return { seen: true, steps: ['Le serveur de monitoring interroge régulièrement la machine', 'Le contrôle « process up ? » échoue', 'La console centrale s’allume', 'Le Command Center traite ou escalade'], verdict: 'Alerte au prochain contrôle : un humain traite.' };
    return { seen: true, steps: ['Le serveur de monitoring interroge régulièrement la machine', f === 'agent' ? 'Pas de réponse de l’agent : contrôle en échec' : 'Plus de ping : contrôle en échec (pull sans agent possible)', 'La console centrale s’allume', 'Le Command Center traite ou escalade'], verdict: 'Alerte au prochain contrôle : c’est l’absence de réponse qui alerte.' };
  }
  return {
    seen: true,
    steps: [f === 'service' ? 'Le health check de l’instance échoue' : 'L’instance ne répond plus à son health check', 'L’alerte déclenche un événement (CloudWatch Event)', 'L’action (Lambda / Auto Scaling Group) détruit l’instance', 'Une nouvelle instance est reconstruite automatiquement', 'L’observabilité garde les logs pour chercher la root cause'],
    verdict: 'Remédiation automatique : personne n’est réveillé.',
  };
};

export default function MonitoringIsland() {
  const [mode, setMode] = useState<Mode>('push');
  const [fault, setFault] = useState<Fault>('agent');
  const o = outcome(mode, fault);

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Architecture</p>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Architecture de monitoring">
          {modes.map((x) => (
            <button key={x.id} type="button" role="tab" aria-selected={mode === x.id} onClick={() => setMode(x.id)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${mode === x.id ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
              {x.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Panne</p>
        <div className="flex flex-wrap gap-2">
          {faults.map((x) => (
            <button key={x.id} type="button" aria-pressed={fault === x.id} onClick={() => setFault(x.id)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${fault === x.id ? 'border-danger bg-danger-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <ol key={`${mode}-${fault}`} className="grid gap-2 rounded-xl border border-line bg-bg p-4">
        {o.steps.map((s, i) => {
          const broken = !o.seen && i > 0;
          return (
            <motion.li key={s} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.18 }}
              className="flex items-start gap-3 text-sm">
              <span className={`grid size-6 shrink-0 place-items-center rounded-full font-mono text-xs ${broken ? 'bg-danger-soft text-danger' : 'bg-surface-2 text-ink'}`}>{broken ? '✗' : i + 1}</span>
              <span className={broken ? 'text-danger' : 'text-ink'}>{s}</span>
            </motion.li>
          );
        })}
      </ol>

      <motion.p key={`v-${mode}-${fault}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: o.steps.length * 0.18 }}
        className={`text-base font-semibold ${o.seen ? 'text-synapse' : 'text-danger'}`}>
        {o.seen ? '✓' : '✕'} {o.verdict}
      </motion.p>
      <p className="text-sm text-ink-2">Un agent en panne n’envoie pas de panne : c’est pour cela que le push seul ne suffit pas et qu’on ajoute des contrôles réguliers en pull.</p>
    </div>
  );
}
