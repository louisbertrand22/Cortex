import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

const levels = [
  { name: 'Intelligence artificielle', year: '1956', def: 'Domaine de l’informatique qui construit des machines capables de reproduire ou dépasser l’intelligence humaine.', ask: 'Descriptive — que s’est-il passé ?', needs: 'Des règles écrites à la main' },
  { name: 'Machine Learning', year: '~1980', def: 'Sous-ensemble de l’IA : la machine apprend à partir de données existantes pour prédire ou agir.', ask: 'Prédictive — que va-t-il se passer ?', needs: 'Un dataset labellisé' },
  { name: 'Deep Learning', year: '2012', def: 'Technique de ML où des couches de réseaux de neurones traitent les données et prennent des décisions.', ask: 'Prescriptive — que devrait-on faire ?', needs: 'Données, GPU, experts' },
  { name: 'IA générative', year: '2022', def: 'Crée du contenu nouveau — texte, image, audio — à partir d’un prompt ou de données existantes.', ask: 'Générative — créer du contenu', needs: 'Un appel d’API' },
];

export default function AiNestingIsland() {
  const [sel, setSel] = useState(3);
  const box = (i: number): React.ReactNode => {
    const l = levels[i];
    const on = sel === i;
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); setSel(i); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setSel(i); } }}
        className="cursor-pointer rounded-2xl border p-3 transition-colors duration-300 sm:p-4"
        style={{
          borderColor: on ? 'var(--signal)' : 'var(--line-strong)',
          background: on ? 'var(--signal-soft)' : i % 2 ? 'var(--surface)' : 'var(--surface-2)',
        }}
      >
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <span className={`text-sm font-semibold ${on ? 'text-ink' : 'text-ink-2'}`}>{l.name}</span>
          <span className="font-mono text-xs text-ink-3">{l.year}</span>
        </div>
        {i < levels.length - 1 ? box(i + 1) : <div className="h-6" />}
      </div>
    );
  };
  const l = levels[sel];
  return (
    <div className="grid items-start gap-5 md:grid-cols-[1.2fr_1fr]">
      <div>{box(0)}</div>
      <AnimatePresence mode="wait">
        <motion.div key={sel} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.3 }} className="rounded-2xl border border-line bg-bg p-5">
          <p className="font-mono text-xs tracking-widest text-signal uppercase">{l.year}</p>
          <p className="mt-1 text-lg font-semibold text-ink">{l.name}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">{l.def}</p>
          <dl className="mt-4 grid gap-3 text-sm">
            <div><dt className="text-xs text-ink-3">Ce qu’on lui demande</dt><dd className="font-medium text-ink">{l.ask}</dd></div>
            <div><dt className="text-xs text-ink-3">Ce qu’il faut pour en construire un aujourd’hui</dt><dd className="font-medium text-ink">{l.needs}</dd></div>
          </dl>
          <div className="mt-5 flex gap-1" aria-hidden="true">
            {levels.map((_, i) => <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i <= sel ? 'var(--signal)' : 'var(--line)' }} />)}
          </div>
          <p className="mt-1.5 text-xs text-ink-3">Valeur ajoutée potentielle →</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
