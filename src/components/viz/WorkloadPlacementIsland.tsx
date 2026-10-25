import { motion } from 'motion/react';
import { useState } from 'react';

// « Which workload where » (PIT POV 19, « The return of CapEx ») : le bon modèle pour la bonne charge
type Trait = 'variable' | 'ttm' | 'ai' | 'latency' | 'sovereign' | 'critical';
const traits: { id: Trait; label: string }[] = [
  { id: 'variable', label: 'Charge variable, imprévisible' },
  { id: 'ttm', label: 'Time-to-market prioritaire' },
  { id: 'ai', label: 'IA intensive, charge stable' },
  { id: 'latency', label: 'Chaque milliseconde compte' },
  { id: 'sovereign', label: 'Données souveraines ou réglementées' },
  { id: 'critical', label: 'Mission critique (ne doit jamais tomber)' },
];

type Model = 'cloud' | 'capex' | 'edge' | 'hybrid';
const models: Record<Model, { title: string; text: string }> = {
  cloud: { title: 'Cloud · OpEx variable', text: 'Le cloud gagne quand la charge varie, que le time-to-market compte et qu’aucune contrainte de souveraineté ne s’applique.' },
  capex: { title: 'Sur site ou HaaS · CapEx stratégique', text: 'Pour les charges IA intensives, critiques en latence ou souveraines : 30 à 60 % de TCO en moins sur 18 mois et plus, face au cloud équivalent.' },
  edge: { title: 'Edge computing', text: 'Le calcul au plus près de la machine : environ 20 ms au lieu de 200 ms vers un cloud ou un datacenter distant.' },
  hybrid: { title: 'Hybride, conçu dès le départ', text: 'La résilience ne se délègue pas à un seul cloud : la panne d’AWS us-east-1 (20 octobre 2025) a duré ~15 h et touché plus de 1 000 entreprises.' },
};

function recommend(on: Set<Trait>): { model: Model; why: string[] } {
  const why: string[] = [];
  if (on.has('latency')) why.push('latence critique → le calcul doit être proche');
  if (on.has('sovereign')) why.push('souveraineté → l’infrastructure doit être maîtrisée');
  if (on.has('ai')) why.push('IA intensive et stable → posséder le matériel devient rentable');
  if (on.has('variable')) why.push('charge imprévisible → l’élasticité du cloud');
  if (on.has('ttm')) why.push('time-to-market → pas d’achat de matériel à attendre');
  if (on.has('critical')) why.push('mission critique → ne pas dépendre d’un seul fournisseur');
  const owns = on.has('sovereign') || on.has('ai');
  const elastic = on.has('variable') || on.has('ttm');
  if (on.has('critical') || (owns && elastic)) return { model: 'hybrid', why };
  if (on.has('latency')) return { model: 'edge', why };
  if (owns) return { model: 'capex', why };
  return { model: 'cloud', why: why.length ? why : ['aucune contrainte particulière → le cloud reste le choix par défaut le plus simple'] };
}

export default function WorkloadPlacementIsland() {
  const [on, setOn] = useState<Set<Trait>>(() => new Set<Trait>(['variable']));
  const toggle = (id: Trait) => setOn((s) => { const t = new Set(s); t.has(id) ? t.delete(id) : t.add(id); return t; });
  const { model, why } = recommend(on);
  const m = models[model];

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <p className="text-sm text-ink-2">Décris la charge de travail :</p>
        <div className="flex flex-wrap gap-2">
          {traits.map((t) => {
            const active = on.has(t.id);
            return (
              <button key={t.id} type="button" aria-pressed={active} onClick={() => toggle(t.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${active ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
                {active ? '✓ ' : '+ '}{t.label}
              </button>
            );
          })}
        </div>
      </div>

      <motion.div key={model} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-line bg-bg p-4">
        <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Modèle conseillé</p>
        <p className="mt-1 text-lg font-semibold text-signal">{m.title}</p>
        <p className="mt-1 text-sm text-ink-2">{m.text}</p>
        <ul className="mt-3 grid gap-1 text-sm text-ink">
          {why.map((w) => <li key={w}>· {w}</li>)}
        </ul>
      </motion.div>

      <p className="text-sm text-ink-2">« Quelle charge, où ? » est redevenu une compétence d’ingénierie : un réglage par charge de travail, pas un choix global.</p>
      <button type="button" onClick={() => setOn(new Set<Trait>(['variable']))} className="justify-self-start rounded-xl bg-ink px-3 py-1.5 text-sm font-medium text-bg">Recommencer</button>
    </div>
  );
}
