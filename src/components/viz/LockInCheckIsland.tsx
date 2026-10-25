import { motion } from 'motion/react';
import { useState } from 'react';

// Innovation ou vendor lock-in ? Les quatre questions de PIT POV 18 (« Vendor lock-in or innovation »)
const questions = [
  { q: 'Le choix crée-t-il une vraie valeur métier ?', yes: 'Oui : livraison plus rapide, meilleure expérience, automatisation, performance.', no: 'Pas forcément : l’entreprise dépend du fournisseur pour garder cette valeur.' },
  { q: 'La solution peut-elle être remplacée raisonnablement ?', yes: 'Oui : des alternatives existent et l’architecture reste modulaire.', no: 'Non : la remplacer demande de gros changements de code, de données ou d’architecture.' },
  { q: 'Le choix est-il intentionnel ?', yes: 'Oui : le compromis est compris et accepté.', no: 'Non : la dépendance est découverte trop tard.' },
  { q: 'Le coût de sortie est-il maîtrisé ?', yes: 'Oui : stratégie d’export, standards, documentation et plan de migration existent.', no: 'Pas forcément : la migration devient trop chère, risquée ou lente.' },
];
const rules = ['Concevoir la portabilité dès le premier jour', 'Garder la logique métier hors du fournisseur', 'Tester la portabilité régulièrement', 'Négocier la sortie avant de signer', 'Choisir l’open source pour les couches critiques'];
// Règles d'or qui répondent à chaque « non » (numéros dans `rules`)
const fixes = [[], [0, 1, 4], [3], [2, 3]];

export default function LockInCheckIsland() {
  const [ans, setAns] = useState<boolean[]>([true, false, false, false]);
  const set = (i: number, v: boolean) => setAns((a) => a.map((x, j) => (j === i ? v : x)));
  const exits = ans.slice(1).filter(Boolean).length;
  const verdict = !ans[0]
    ? { title: 'Dépendance sans contrepartie', text: 'Sans valeur métier, rien ne justifie d’accepter le risque : c’est le lock-in dans sa pire forme.', tone: 'text-danger' }
    : exits === 3
      ? { title: 'Innovation maîtrisée', text: 'La valeur est là et la sortie reste possible : la dépendance est un choix, pas un piège.', tone: 'text-synapse' }
      : { title: exits === 0 ? 'Vendor lock-in' : 'Lock-in en formation', text: 'L’innovation crée de la valeur ; le lock-in apparaît quand cette valeur crée une dépendance.', tone: exits === 0 ? 'text-signal' : 'text-amber' };
  const todo = [...new Set(ans.flatMap((v, i) => (v ? [] : fixes[i])))].sort();

  return (
    <div className="grid gap-5">
      <ul className="grid gap-2">
        {questions.map((x, i) => (
          <li key={x.q} className="grid gap-1.5 rounded-lg border border-line px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-ink">{x.q}</span>
              <span className="flex gap-1">
                {[true, false].map((v) => (
                  <button key={String(v)} type="button" aria-pressed={ans[i] === v} onClick={() => set(i, v)}
                    className={`rounded-md border px-2.5 py-0.5 text-sm ${ans[i] === v ? (v ? 'border-synapse bg-synapse-soft text-ink' : 'border-signal bg-signal-soft text-ink') : 'border-line text-ink-2'}`}>
                    {v ? 'Oui' : 'Non'}
                  </button>
                ))}
              </span>
            </div>
            <span className="text-xs text-ink-2">{ans[i] ? x.yes : x.no}</span>
          </li>
        ))}
      </ul>

      <motion.div key={verdict.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-line bg-bg p-4">
        <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Verdict</p>
        <p className={`mt-1 text-lg font-semibold ${verdict.tone}`}>{verdict.title}</p>
        <p className="mt-1 text-sm text-ink-2">{verdict.text}</p>
        {todo.length > 0 && ans[0] && (
          <>
            <p className="mt-3 text-sm text-ink">Règles d’or à appliquer :</p>
            <ul className="mt-1 grid gap-1 text-sm text-ink-2">
              {todo.map((r) => <li key={r}>{r + 1}. {rules[r]}</li>)}
            </ul>
          </>
        )}
      </motion.div>
      <p className="text-sm text-ink-2">La seule question qui compte au fond : peux-tu partir quand tu en as besoin ?</p>
      <button type="button" onClick={() => setAns([true, false, false, false])} className="justify-self-start rounded-xl bg-ink px-3 py-1.5 text-sm font-medium text-bg">Recommencer</button>
    </div>
  );
}
