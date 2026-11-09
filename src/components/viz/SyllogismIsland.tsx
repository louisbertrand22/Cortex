import { motion } from 'motion/react';
import { useId, useMemo, useState } from 'react';

/**
 * Syllogisme catégorique : deux prémisses, une conclusion, trois termes (S, M, P).
 * La validité est calculée en essayant tous les « mondes » possibles : chacune des 7 zones
 * du diagramme de Venn est vide ou habitée (128 mondes). Valide = la conclusion est vraie
 * dans tous les mondes où les prémisses le sont. Lecture moderne : « Tous les X » n'affirme
 * pas qu'il existe des X.
 */
type Q = 'A' | 'E' | 'I' | 'O';
type T = 'S' | 'M' | 'P';
interface Prop { q: Q; x: T; y: T }

const BIT: Record<T, number> = { S: 1, M: 2, P: 4 };
const REGIONS = [1, 2, 3, 4, 5, 6, 7];
const POS: Record<number, [number, number]> = { 1: [29, 22], 4: [71, 22], 2: [50, 59], 5: [50, 17], 3: [38, 41], 6: [62, 41], 7: [50, 33] };
const CIRCLES: { t: T; cx: number; cy: number; lx: number; ly: number }[] = [
  { t: 'S', cx: 40, cy: 28, lx: 18, ly: 13 },
  { t: 'P', cx: 60, cy: 28, lx: 82, ly: 13 },
  { t: 'M', cx: 50, cy: 46, lx: 73, ly: 64 },
];
const R = 18;

const QLABEL: Record<Q, string> = { A: 'Tous', E: 'Aucun', I: 'Quelques', O: 'Quelques … pas' };
const sentence = ({ q, x, y }: Prop) =>
  q === 'A' ? `Tous les ${x} sont des ${y}` : q === 'E' ? `Aucun ${x} n’est un ${y}` : q === 'I' ? `Quelques ${x} sont des ${y}` : `Quelques ${x} ne sont pas des ${y}`;

const holds = ({ q, x, y }: Prop, world: number) => {
  const inX = REGIONS.filter((r) => r & BIT[x]);
  const has = (r: number) => (world >> (r - 1)) & 1;
  if (q === 'A') return inX.filter((r) => !(r & BIT[y])).every((r) => !has(r));
  if (q === 'E') return inX.filter((r) => r & BIT[y]).every((r) => !has(r));
  if (q === 'I') return inX.filter((r) => r & BIT[y]).some((r) => has(r));
  return inX.filter((r) => !(r & BIT[y])).some((r) => has(r));
};
const popcount = (n: number) => n.toString(2).split('').filter((c) => c === '1').length;

const PRESETS: { name: string; valid: boolean; major: Prop; minor: Prop; concl: Q; example: string }[] = [
  { name: 'Barbara', valid: true, major: { q: 'A', x: 'M', y: 'P' }, minor: { q: 'A', x: 'S', y: 'M' }, concl: 'A', example: 'Tous les humains sont mortels ; tous les Grecs sont des humains ; donc tous les Grecs sont mortels.' },
  { name: 'Moyen terme mal placé', valid: false, major: { q: 'A', x: 'P', y: 'M' }, minor: { q: 'A', x: 'S', y: 'M' }, concl: 'A', example: 'Tous les chats sont des mammifères ; tous les chiens sont des mammifères ; donc tous les chiens sont des chats.' },
  { name: 'Celarent', valid: true, major: { q: 'E', x: 'M', y: 'P' }, minor: { q: 'A', x: 'S', y: 'M' }, concl: 'E', example: 'Aucun poisson n’est un mammifère ; tous les requins sont des poissons ; donc aucun requin n’est un mammifère.' },
  { name: 'Darii', valid: true, major: { q: 'A', x: 'M', y: 'P' }, minor: { q: 'I', x: 'S', y: 'M' }, concl: 'I', example: 'Tous les médecins ont fait de longues études ; quelques sportifs sont médecins ; donc quelques sportifs ont fait de longues études.' },
  { name: 'Conclusion trop forte', valid: false, major: { q: 'A', x: 'M', y: 'P' }, minor: { q: 'I', x: 'S', y: 'M' }, concl: 'A', example: 'Tous les médecins ont fait de longues études ; quelques sportifs sont médecins ; donc tous les sportifs ont fait de longues études.' },
  { name: 'Négation abusive', valid: false, major: { q: 'A', x: 'M', y: 'P' }, minor: { q: 'E', x: 'S', y: 'M' }, concl: 'E', example: 'Tous les chiens sont des mammifères ; aucun chat n’est un chien ; donc aucun chat n’est un mammifère.' },
];

function QSelect({ value, onChange, label }: { value: Q; onChange: (q: Q) => void; label: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as Q)} aria-label={label} className="rounded-md border border-line bg-surface px-2 py-1 text-sm text-ink">
      {(Object.keys(QLABEL) as Q[]).map((q) => (
        <option key={q} value={q}>{QLABEL[q]}</option>
      ))}
    </select>
  );
}

export default function SyllogismIsland() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [preset, setPreset] = useState<number | null>(0);
  const [major, setMajor] = useState<Prop>(PRESETS[0].major);
  const [minor, setMinor] = useState<Prop>(PRESETS[0].minor);
  const [concl, setConcl] = useState<Q>('A');
  const conclusion: Prop = { q: concl, x: 'S', y: 'P' };

  const load = (i: number) => {
    setPreset(i);
    setMajor(PRESETS[i].major);
    setMinor(PRESETS[i].minor);
    setConcl(PRESETS[i].concl);
  };
  const edit = (f: () => void) => {
    setPreset(null);
    f();
  };

  const { valid, empty, full, consistent } = useMemo(() => {
    const worlds = Array.from({ length: 128 }, (_, w) => w).filter((w) => holds(major, w) && holds(minor, w));
    const counter = worlds.filter((w) => !holds(conclusion, w)).sort((a, b) => popcount(a) - popcount(b));
    const isValid = counter.length === 0;
    const has = (w: number, r: number) => (w >> (r - 1)) & 1;
    if (!worlds.length) return { valid: true, consistent: false, empty: [] as number[], full: [] as number[] };
    if (isValid) {
      return {
        valid: true,
        consistent: true,
        empty: REGIONS.filter((r) => worlds.every((w) => !has(w, r))),
        full: REGIONS.filter((r) => worlds.every((w) => has(w, r))),
      };
    }
    const c = counter[0];
    return { valid: false, consistent: true, empty: REGIONS.filter((r) => !has(c, r)), full: REGIONS.filter((r) => has(c, r)) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [major, minor, concl]);

  const regionShape = (r: number) => {
    const ins = CIRCLES.filter((c) => r & BIT[c.t]);
    const outs = CIRCLES.filter((c) => !(r & BIT[c.t]));
    let el = <rect x="0" y="0" width="100" height="72" fill="var(--ink-3)" />;
    for (const c of ins) el = <g clipPath={`url(#${uid}c${c.t})`}>{el}</g>;
    return (
      <g key={r} mask={outs.length ? `url(#${uid}m${r})` : undefined} opacity={empty.includes(r) ? 0.35 : 0}>
        {el}
      </g>
    );
  };

  const premiseRow = (p: Prop, set: (p: Prop) => void, name: string) => (
    <div className="flex items-center gap-2">
      <span className="w-14 text-xs text-ink-3">{name}</span>
      <QSelect value={p.q} onChange={(q) => edit(() => set({ ...p, q }))} label={`Quantificateur de la ${name.toLowerCase()}`} />
      <span className="font-mono text-sm text-ink">{p.x} → {p.y}</span>
      <button type="button" onClick={() => edit(() => set({ ...p, x: p.y, y: p.x }))} aria-label={`Inverser les termes de la ${name.toLowerCase()}`} className="rounded-md border border-line bg-surface px-2 py-0.5 text-sm text-ink-2 hover:text-ink">
        ⇄
      </button>
    </div>
  );

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Exemples">
        {PRESETS.map((p, i) => (
          <button
            key={p.name}
            type="button"
            onClick={() => load(i)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${preset === i ? 'border-signal bg-signal-soft text-ink' : 'border-line bg-surface text-ink-2 hover:text-ink'}`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[1.1fr_1fr]">
        <div className="grid gap-3">
          {premiseRow(major, setMajor, 'Majeure')}
          {premiseRow(minor, setMinor, 'Mineure')}
          <div className="flex items-center gap-2 border-t border-line pt-3">
            <span className="w-14 text-xs text-ink-3">Donc</span>
            <QSelect value={concl} onChange={(q) => edit(() => setConcl(q))} label="Quantificateur de la conclusion" />
            <span className="font-mono text-sm text-ink">S → P</span>
          </div>
          <div className="grid gap-1 rounded-xl border border-line bg-surface p-3 text-sm text-ink-2">
            <p>1. {sentence(major)}.</p>
            <p>2. {sentence(minor)}.</p>
            <p className="text-ink">Donc {sentence(conclusion).charAt(0).toLowerCase() + sentence(conclusion).slice(1)}.</p>
            {preset !== null && <p className="mt-1 text-xs text-ink-3">Avec des mots : {PRESETS[preset].example}</p>}
          </div>
        </div>

        <div className="grid gap-3">
          <svg viewBox="0 0 100 72" className="w-full" role="img" aria-label={valid ? 'Diagramme des prémisses : la conclusion s’y lit' : 'Diagramme d’un contre-exemple'}>
            <defs>
              {CIRCLES.map((c) => (
                <clipPath key={c.t} id={`${uid}c${c.t}`}>
                  <circle cx={c.cx} cy={c.cy} r={R} />
                </clipPath>
              ))}
              {REGIONS.map((r) => (
                <mask key={r} id={`${uid}m${r}`}>
                  <rect x="0" y="0" width="100" height="72" fill="white" />
                  {CIRCLES.filter((c) => !(r & BIT[c.t])).map((c) => (
                    <circle key={c.t} cx={c.cx} cy={c.cy} r={R} fill="black" />
                  ))}
                </mask>
              ))}
            </defs>
            {REGIONS.map(regionShape)}
            {CIRCLES.map((c) => (
              <g key={c.t}>
                <circle cx={c.cx} cy={c.cy} r={R} fill="none" stroke={c.t === 'M' ? 'var(--amber)' : 'var(--signal)'} strokeWidth="0.6" />
                <text x={c.lx} y={c.ly} textAnchor="middle" fontSize="5" fontWeight="600" fill={c.t === 'M' ? 'var(--amber)' : 'var(--signal)'}>{c.t}</text>
              </g>
            ))}
            {full.map((r) => (
              <motion.text key={r} initial={{ scale: 0 }} animate={{ scale: 1 }} x={POS[r][0]} y={POS[r][1] + 1.6} textAnchor="middle" fontSize="5" fontWeight="700" fill="var(--ink)">×</motion.text>
            ))}
          </svg>
          <p className="text-xs text-ink-3">Zone grisée : vide, personne dedans · × : il existe au moins un individu.</p>
          <motion.div
            key={`${valid}-${consistent}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-3 text-sm ${valid ? 'border-synapse/35 bg-synapse-soft' : 'border-danger/35 bg-surface'}`}
          >
            <p className="font-semibold text-ink">{!consistent ? 'Prémisses contradictoires' : valid ? '✓ Valide' : '✗ Invalide'}</p>
            <p className="text-ink-2">
              {!consistent
                ? 'Les deux prémisses ne peuvent pas être vraies ensemble : il n’y a rien à déduire.'
                : valid
                  ? 'Le dessin ne représente que les deux prémisses, et la conclusion s’y lit déjà : impossible qu’elles soient vraies et elle fausse.'
                  : 'Le dessin montre un contre-exemple : un monde où les deux prémisses sont vraies et la conclusion fausse. La conclusion ne découle donc pas des prémisses.'}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
