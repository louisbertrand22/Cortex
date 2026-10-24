import { motion } from 'motion/react';
import { useState } from 'react';

const W = 680, H = 300, P = { l: 56, r: 200, t: 16, b: 36 };
const months = Array.from({ length: 37 }, (_, m) => m);
const fmtK = (v: number) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${Math.round(v)}`);

export default function TcoIsland() {
  const [full, setFull] = useState(false);
  const tokensB = full ? 0.84 / 0.06 : 0.84; // milliards de tokens / mois
  const apiMonthly = tokensB * 1000 * 0.75; // $0.75 / million
  const server = months.map((m) => 370000 + 1500 * m);
  let acc = 0, accF = 0;
  const api = months.map((m) => (m === 0 ? 0 : (acc += apiMonthly)));
  const apiFall = months.map((m) => (m === 0 ? 0 : (accF += apiMonthly * Math.pow(10, -(m - 1) / 12))));
  const max = 500000;
  const x = (m: number) => P.l + (m / 36) * (W - P.l - P.r);
  const y = (v: number) => H - P.b - (v / max) * (H - P.t - P.b);
  const path = (s: number[]) => s.map((v, m) => `${m ? 'L' : 'M'}${x(m).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const series0 = [
    { d: server, color: 'var(--ink)', label: 'GPU internes', dash: '' },
    { d: api, color: 'var(--signal)', label: 'API cloud', dash: '' },
    { d: apiFall, color: 'var(--synapse)', label: 'API si les prix baissent', dash: '5 5' },
  ];
  // écarte les étiquettes de fin de courbe pour qu'elles ne se chevauchent pas
  const order = series0.map((s, i) => ({ i, y: y(s.d[36]) })).sort((a, b) => b.y - a.y);
  const labelY: number[] = [];
  order.forEach((o, k) => { labelY[o.i] = k === 0 ? o.y : Math.min(o.y, labelY[order[k - 1].i] - 15); });
  const series = series0.map((s, i) => ({ ...s, ly: labelY[i] }));
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2 text-sm">
        {[false, true].map((f) => (
          <button key={String(f)} type="button" onClick={() => setFull(f)} className={`rounded-lg border px-3 py-1.5 ${full === f ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2'}`}>
            {f ? 'Pleine capacité du serveur (heures de bureau)' : 'Un vrai assistant : 1 000 salariés'}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Coût cumulé sur 36 mois">
        {[0, 100000, 200000, 300000, 400000, 500000].map((v) => (
          <g key={v}>
            <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke="var(--line)" />
            <text x={P.l - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--ink-3)">{fmtK(v)}</text>
          </g>
        ))}
        {[0, 6, 12, 18, 24, 30, 36].map((m) => <text key={m} x={x(m)} y={H - 14} textAnchor="middle" fontSize="11" fill="var(--ink-3)">{m}</text>)}
        <text x={(P.l + W - P.r) / 2} y={H - 1} textAnchor="middle" fontSize="11" fill="var(--ink-3)">mois depuis le jour 1</text>
        {series.map((s) => (
          <g key={s.label}>
            <motion.path key={s.label + full} d={path(s.d)} fill="none" stroke={s.color} strokeWidth="2.5" strokeDasharray={s.dash || undefined} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} />
            <text x={x(36) + 8} y={s.ly + 4} fontSize="11.5" fill={s.color} fontWeight="600">{s.label} ≈ {fmtK(s.d[36])}</text>
          </g>
        ))}
      </svg>
      <p className="text-xs leading-relaxed text-ink-3">
        Même modèle (DeepSeek V4-Flash, poids ouverts), même volume, personnel non compté. Serveur : 370 000 $ le jour 1, puis ~1 500 $/mois d’électricité.
        API : 0,75 $ / million de tokens (moitié entrée, moitié sortie). Volume : {tokensB.toFixed(2)} milliard de tokens / mois → {fmtK(apiMonthly)} / mois.
        {full ? ' À pleine capacité, l’écart se resserre : un serveur rentabilisé exige un usage massif et continu.' : ' Le serveur tournerait à ~6 % de sa capacité.'} Baisse des prix : ÷10 par an (a16z, ordre de grandeur). Chiffres du cours, oct. 2026.
      </p>
    </div>
  );
}
