import { motion } from 'motion/react';
import { useState } from 'react';

// Les 25 secteurs clés de CMMI v1.1, en représentation étagée ou continue (MÉTHODES session 3)
type Cat = 'Gestion de processus' | 'Gestion de projet' | 'Ingénierie' | 'Support';
const pas: { id: string; name: string; level: number; cat: Cat }[] = [
  { id: 'REQM', name: 'Requirements Management', level: 2, cat: 'Ingénierie' },
  { id: 'PP', name: 'Project Planning', level: 2, cat: 'Gestion de projet' },
  { id: 'PMC', name: 'Project Monitoring and Control', level: 2, cat: 'Gestion de projet' },
  { id: 'SAM', name: 'Supplier Agreement Management', level: 2, cat: 'Gestion de projet' },
  { id: 'MA', name: 'Measurement and Analysis', level: 2, cat: 'Support' },
  { id: 'PPQA', name: 'Process and Product Quality Assurance', level: 2, cat: 'Support' },
  { id: 'CM', name: 'Configuration Management', level: 2, cat: 'Support' },
  { id: 'RD', name: 'Requirements Development', level: 3, cat: 'Ingénierie' },
  { id: 'TS', name: 'Technical Solution', level: 3, cat: 'Ingénierie' },
  { id: 'PI', name: 'Product Integration', level: 3, cat: 'Ingénierie' },
  { id: 'VER', name: 'Verification', level: 3, cat: 'Ingénierie' },
  { id: 'VAL', name: 'Validation', level: 3, cat: 'Ingénierie' },
  { id: 'OPF', name: 'Organizational Process Focus', level: 3, cat: 'Gestion de processus' },
  { id: 'OPD', name: 'Organizational Process Definition', level: 3, cat: 'Gestion de processus' },
  { id: 'OT', name: 'Organizational Training', level: 3, cat: 'Gestion de processus' },
  { id: 'IPM', name: 'Integrated Project Management', level: 3, cat: 'Gestion de projet' },
  { id: 'ISM', name: 'Integrated Supplier Management', level: 3, cat: 'Gestion de projet' },
  { id: 'RSKM', name: 'Risk Management', level: 3, cat: 'Gestion de projet' },
  { id: 'DAR', name: 'Decision Analysis and Resolution', level: 3, cat: 'Support' },
  { id: 'OEI', name: 'Organizational Environment for Integration', level: 3, cat: 'Support' },
  { id: 'IT', name: 'Integrated Teaming', level: 3, cat: 'Gestion de projet' },
  { id: 'OPP', name: 'Organizational Process Performance', level: 4, cat: 'Gestion de processus' },
  { id: 'QPM', name: 'Quantitative Project Management', level: 4, cat: 'Gestion de projet' },
  { id: 'OID', name: 'Organizational Innovation and Deployment', level: 5, cat: 'Gestion de processus' },
  { id: 'CAR', name: 'Causal Analysis and Resolution', level: 5, cat: 'Support' },
];
const maturity = ['', 'Initial', 'Géré', 'Défini', 'Maîtrisé', 'En optimisation'];
const capability = ['Incomplet', 'Réalisé', 'Géré', 'Défini', 'Maîtrisé', 'En optimisation'];
const cats: Cat[] = ['Gestion de processus', 'Gestion de projet', 'Ingénierie', 'Support'];

type Mode = 'etagee' | 'continue';
const startDone = new Set(['REQM', 'PP', 'PMC', 'MA', 'PPQA', 'CM', 'RD', 'TS', 'VER']);
const startCap: Record<string, number> = Object.fromEntries(pas.map((p) => [p.id, p.cat === 'Ingénierie' ? 3 : p.cat === 'Gestion de projet' ? 2 : 1]));

export default function CmmiLevelsIsland() {
  const [mode, setMode] = useState<Mode>('etagee');
  const [done, setDone] = useState(() => new Set(startDone));
  const [cap, setCap] = useState(startCap);

  // étagée : le niveau N est atteint si TOUS les secteurs des niveaux 2 à N sont validés
  let level = 1;
  for (let l = 2; l <= 5; l++) {
    if (pas.filter((p) => p.level <= l).every((p) => done.has(p.id))) level = l; else break;
  }
  const missing = level < 5 ? pas.filter((p) => p.level <= level + 1 && !done.has(p.id)) : [];
  const toggle = (id: string) => setDone((s) => { const t = new Set(s); t.has(id) ? t.delete(id) : t.add(id); return t; });
  const bump = (id: string) => setCap((c) => ({ ...c, [id]: (c[id] + 1) % 6 }));
  const reset = () => { setDone(new Set(startDone)); setCap(startCap); };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Représentation">
        {([['etagee', 'Étagée · un niveau de maturité'], ['continue', 'Continue · un profil de capacités']] as const).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => setMode(id)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${mode === id ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            {label}
          </button>
        ))}
      </div>

      {mode === 'etagee' ? (
        <>
          <div className="grid gap-3">
            {[5, 4, 3, 2].map((l) => (
              <div key={l} className="grid gap-1.5 sm:grid-cols-[8rem_1fr] sm:items-start">
                <p className={`font-mono text-xs ${l <= level ? 'text-synapse' : 'text-ink-3'}`}>{l <= level ? '✓ ' : ''}Niveau {l} · {maturity[l]}</p>
                <div className="flex flex-wrap gap-1.5">
                  {pas.filter((p) => p.level === l).map((p) => {
                    const on = done.has(p.id);
                    return (
                      <button key={p.id} type="button" title={p.name} aria-pressed={on} onClick={() => toggle(p.id)}
                        className={`rounded-md border px-2 py-1 font-mono text-[0.7rem] transition-colors ${on ? 'border-synapse bg-synapse-soft text-ink' : 'border-line text-ink-3 hover:border-line-strong'}`}>
                        {on ? '✓ ' : ''}{p.id}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div>
            <p className="text-base font-semibold text-ink">Maturité de l’organisation : <span className="text-signal">niveau {level} · {maturity[level]}</span></p>
            <p className="mt-1 text-sm text-ink-2">
              {level < 5
                ? <>Pour passer au niveau {level + 1}, il manque : <span className="font-mono text-ink">{missing.map((p) => p.id).join(', ')}</span>. Les secteurs validés au-delà ne comptent pas tant qu’une marche reste vide.</>
                : 'Les 25 secteurs sont validés.'}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {cats.map((c) => (
              <div key={c} className="grid content-start gap-1.5">
                <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">{c} ({pas.filter((p) => p.cat === c).length})</p>
                {pas.filter((p) => p.cat === c).map((p) => (
                  <button key={p.id} type="button" title={p.name} onClick={() => bump(p.id)} aria-label={`${p.id} : capacité ${cap[p.id]}, ${capability[cap[p.id]]}. Cliquer pour augmenter.`}
                    className="flex items-center gap-2 rounded-md px-1 py-0.5 text-left hover:bg-surface-2">
                    <span className="w-11 font-mono text-[0.7rem] text-ink">{p.id}</span>
                    <span className="h-2 grow overflow-hidden rounded-full bg-surface-2">
                      <motion.span className="block h-full rounded-full" animate={{ width: `${(cap[p.id] / 5) * 100}%` }} style={{ background: 'var(--signal)' }} />
                    </span>
                    <span className="w-4 font-mono text-[0.7rem] text-ink-2">{cap[p.id]}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
          <p className="text-sm text-ink-2">
            Clique sur un secteur pour monter sa capacité (0 incomplet → 5 en optimisation, puis retour à 0). Pas de note globale :
            l’organisation choisit librement les secteurs à améliorer en priorité.
          </p>
        </>
      )}
      <button type="button" onClick={reset} className="justify-self-start rounded-xl bg-ink px-3 py-1.5 text-sm font-medium text-bg">Recommencer</button>
    </div>
  );
}
