import { motion } from 'motion/react';
import { useState } from 'react';

// Jusqu'où déléguer une action à un agent AIOps (PIT POV 24, « Proven recovery sets the autonomy limit »)
type Kind = 'reversible' | 'compensatable' | 'hard';
const actions: { label: string; kind: Kind }[] = [
  { label: 'Rebasculer le trafic sur l’ancienne version', kind: 'reversible' },
  { label: 'Désactiver un feature flag', kind: 'reversible' },
  { label: 'Basculer sur la région de secours (failover)', kind: 'compensatable' },
  { label: 'Déployer un correctif', kind: 'compensatable' },
  { label: 'Purger des données', kind: 'hard' },
  { label: 'Rembourser un client', kind: 'hard' },
];
const kinds: Record<Kind, { title: string; text: string }> = {
  reversible: { title: 'Réversible', text: 'retour au même état : peut être pré-autorisé' },
  compensatable: { title: 'Compensable', text: 'compensation prévue, des effets de bord peuvent rester : autorisé sous conditions' },
  hard: { title: 'Difficile à annuler', text: 'aucun retour fiable : escalade humaine par défaut' },
};

type Level = 0 | 1 | 2;
const levels = [
  { title: 'Assister', text: 'L’IA enquête, l’humain décide et agit.' },
  { title: 'Autonomie partielle', text: 'L’IA prépare et exécute, l’humain approuve avant.' },
  { title: 'Autonomie bornée', text: 'L’IA agit dans ses garde-fous, sans approbation en temps réel.' },
];

function decide(kind: Kind, proven: boolean, risky: boolean): { level: Level; why: string } {
  if (kind === 'hard') return { level: 0, why: 'Effet difficile à annuler (donnée supprimée, paiement, effet externe) : un humain décide.' };
  if (!proven) return { level: 1, why: 'Pas de chemin de retour prouvé, pas d’action autonome : l’humain approuve d’abord.' };
  if (risky) return { level: 1, why: 'Le risque monte : on revient à l’approbation humaine, l’autonomie est retirée par le contexte.' };
  return kind === 'reversible'
    ? { level: 2, why: 'Réversible, rollback testé, contexte normal : l’action peut être pré-autorisée.' }
    : { level: 2, why: 'Compensation définie et état de reprise vérifié : autorisé sous ces conditions.' };
}

export default function AutonomyGateIsland() {
  const [a, setA] = useState(0);
  const [proven, setProven] = useState(true);
  const [risky, setRisky] = useState(false);
  const { kind } = actions[a];
  const { level, why } = decide(kind, proven, risky);

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <p className="text-sm text-ink-2">L’agent propose une action :</p>
        <div className="flex flex-wrap gap-2">
          {actions.map((x, i) => (
            <button key={x.label} type="button" aria-pressed={i === a} onClick={() => setA(i)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${i === a ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
              {x.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-ink-2"><span className="font-semibold text-ink">{kinds[kind].title}</span> · {kinds[kind].text}</p>
      </div>

      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <label className="flex items-start gap-2 rounded-lg border border-line px-3 py-2">
          <input type="checkbox" checked={proven} onChange={(e) => setProven(e.target.checked)} className="mt-1 accent-[var(--signal)]" />
          <span>Retour arrière testé (canary, rollback, signaux de succès)</span>
        </label>
        <label className="flex items-start gap-2 rounded-lg border border-line px-3 py-2">
          <input type="checkbox" checked={risky} onChange={(e) => setRisky(e.target.checked)} className="mt-1 accent-[var(--signal)]" />
          <span>Contexte inhabituel ou impact métier élevé</span>
        </label>
      </div>

      <ol className="grid gap-2 sm:grid-cols-3">
        {levels.map((l, i) => {
          const on = i === level;
          return (
            <motion.li key={l.title} animate={{ opacity: on ? 1 : 0.45 }} className={`rounded-xl border p-3 ${on ? 'border-signal bg-signal-soft' : 'border-line bg-bg'}`}>
              <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Niveau 0{i + 1}</p>
              <p className="mt-0.5 font-semibold text-ink">{l.title}</p>
              <p className="text-xs text-ink-2">{l.text}</p>
            </motion.li>
          );
        })}
      </ol>

      <motion.p key={why} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-ink">{why}</motion.p>
      <p className="text-sm text-ink-2">L’autonomie se gagne par la preuve et se retire selon le contexte.</p>
      <button type="button" onClick={() => { setA(0); setProven(true); setRisky(false); }} className="justify-self-start rounded-xl bg-ink px-3 py-1.5 text-sm font-medium text-bg">Recommencer</button>
    </div>
  );
}
