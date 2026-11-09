import { motion } from 'motion/react';
import { useState } from 'react';

/**
 * Dynamique de la dette publique : d(t+1) = d(t) × (1 + r) / (1 + g) − solde primaire.
 * r = taux d'intérêt moyen payé sur la dette, g = croissance nominale du PIB (réelle + inflation),
 * solde primaire = recettes − dépenses hors intérêts, en % du PIB (négatif = déficit primaire).
 */
const D0 = 116; // ordre de grandeur de la dette française fin 2025, en % du PIB
const YEARS = 20;
const PRESETS = [
  { id: 'fr', label: 'Proche de la France', r: 2, g: 3, pb: -3, text: 'Un déficit primaire d’environ 3 % du PIB : même avec une croissance supérieure aux taux, la dette continue de monter.' },
  { id: 'snow', label: 'Boule de neige', r: 5, g: 1, pb: 0, text: 'Budget à l’équilibre hors intérêts, mais les taux dépassent la croissance : les intérêts s’ajoutent à la dette, qui grossit toute seule.' },
  { id: 'down', label: 'Désendettement', r: 2, g: 4, pb: 1, text: 'Croissance supérieure aux taux et léger excédent primaire : le ratio dette/PIB fond, sans rembourser un seul euro de façon spectaculaire.' },
] as const;

const W = 100;
const H = 62;
const X = (t: number) => 12 + (t / YEARS) * 84;
const Y = (d: number) => 56 - (Math.min(d, 250) / 250) * 50;
const n = (v: number) => v.toFixed(1).replace('.', ',');

export default function DebtSnowballIsland() {
  const [p, setP] = useState<{ r: number; g: number; pb: number }>({ r: 2, g: 3, pb: -3 });
  const [note, setNote] = useState<string>(PRESETS[0].text);
  const path: number[] = [D0];
  for (let t = 0; t < YEARS; t++) path.push(Math.max(0, (path[t] * (1 + p.r / 100)) / (1 + p.g / 100) - p.pb));
  const end = path[YEARS];
  const stab = (D0 * (p.r - p.g)) / (100 + p.g); // solde primaire qui stabilise le ratio
  const d = path.map((v, t) => `${t === 0 ? 'M' : 'L'}${X(t).toFixed(2)},${Y(v).toFixed(2)}`).join(' ');

  const slider = (key: 'r' | 'g' | 'pb', label: string, min: number, max: number) => (
    <label className="grid gap-1 text-sm">
      <span className="flex justify-between gap-2 text-ink-2">
        <span>{label}</span>
        <span className="font-mono text-ink tabular-nums">{p[key] > 0 && key === 'pb' ? '+' : ''}{n(p[key])} %</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={0.5}
        value={p[key]}
        onChange={(e) => { setP((v) => ({ ...v, [key]: Number(e.target.value) })); setNote('Tu règles toi-même : compare le taux et la croissance, puis regarde le solde primaire.'); }}
        aria-label={label}
        className="accent-[var(--signal)]"
      />
    </label>
  );

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((pr) => (
          <button
            key={pr.id}
            type="button"
            onClick={() => { setP({ r: pr.r, g: pr.g, pb: pr.pb }); setNote(pr.text); }}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${p.r === pr.r && p.g === pr.g && p.pb === pr.pb ? 'border-signal bg-signal-soft text-ink' : 'border-line bg-surface text-ink-2 hover:text-ink'}`}
          >
            {pr.label}
          </button>
        ))}
      </div>
      <div className="grid items-center gap-6 md:grid-cols-[1.5fr_1fr]">
        <svg viewBox={`0 0 ${W} ${H + 6}`} className="w-full" role="img" aria-label={`Dette publique sur ${YEARS} ans : de ${D0} % à ${Math.round(end)} % du PIB`}>
          {[0, 60, 120, 180, 240].map((v) => (
            <g key={v}>
              <line x1="12" x2="96" y1={Y(v)} y2={Y(v)} stroke="var(--line)" strokeWidth="0.3" />
              <text x="10" y={Y(v) + 1.2} textAnchor="end" fontSize="3.5" fill="var(--ink-3)">{v} %</text>
            </g>
          ))}
          <line x1="12" x2="96" y1={Y(60)} y2={Y(60)} stroke="var(--amber)" strokeWidth="0.5" strokeDasharray="1.5 1" />
          <text x="13" y={Y(60) + 4.5} fontSize="3.5" fill="var(--amber)">repère de Maastricht : 60 %</text>
          <motion.path animate={{ d }} transition={{ duration: 0.5 }} fill="none" stroke="var(--signal)" strokeWidth="1" strokeLinejoin="round" />
          <circle cx={X(0)} cy={Y(D0)} r="1.3" fill="var(--ink)" />
          <motion.circle animate={{ cy: Y(end) }} cx={X(YEARS)} r="1.6" fill="var(--signal)" transition={{ duration: 0.5 }} />
          <text x={X(0)} y={H + 4} fontSize="3.5" fill="var(--ink-3)">aujourd’hui</text>
          <text x={X(YEARS)} y={H + 4} textAnchor="end" fontSize="3.5" fill="var(--ink-3)">dans {YEARS} ans</text>
        </svg>

        <div className="grid gap-4">
          <div className="rounded-xl border border-line bg-surface p-3">
            <p className="text-xs text-ink-3">Dette dans {YEARS} ans</p>
            <p className="font-display text-4xl text-ink tabular-nums">{Math.round(end)} % <span className="text-base text-ink-3">du PIB</span></p>
            <p className="text-xs text-ink-2">{end > D0 + 0.5 ? '↑ en hausse' : end < D0 - 0.5 ? '↓ en baisse' : '= stable'} (départ : {D0} %)</p>
          </div>
          {slider('r', 'Taux d’intérêt moyen sur la dette', 0, 6)}
          {slider('g', 'Croissance nominale du PIB', 0, 6)}
          {slider('pb', 'Solde primaire (hors intérêts)', -5, 3)}
          <p className="text-xs text-ink-3">Pour stabiliser la dette avec ces taux et cette croissance, il faudrait un solde primaire de {stab > 0 ? '+' : ''}{n(stab)} % du PIB.</p>
        </div>
      </div>
      <motion.p key={note} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-ink-2">{note}</motion.p>
    </div>
  );
}
