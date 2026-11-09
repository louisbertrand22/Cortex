import { motion } from 'motion/react';
import { useState } from 'react';

/**
 * Intérêts composés : capital de départ + versements mensuels, capitalisation mensuelle.
 * Barres empilées par année : ce que tu as versé (gris) et les intérêts accumulés (signal).
 * Comparaison avec des intérêts simples (les intérêts ne rapportent rien).
 */
const START = { initial: 5000, monthly: 200, rate: 5, years: 25 };
const fmt = (v: number) => Math.round(v).toLocaleString('fr-FR');
/** Montant compact : 136 508 €, 1,9 M€ */
const money = (v: number) => (v >= 1e6 ? `${(v / 1e6).toFixed(1).replace('.', ',')} M€` : `${fmt(v)} €`);
const axis = (v: number) => (v >= 1e6 ? `${(v / 1e6).toFixed(1).replace('.', ',')} M€` : `${Math.round(v / 1000)} k€`);

function simulate(initial: number, monthly: number, rate: number, years: number) {
  const r = rate / 100 / 12;
  let value = initial;
  const rows: { paid: number; value: number }[] = [{ paid: initial, value: initial }];
  for (let m = 1; m <= years * 12; m++) {
    value = value * (1 + r) + monthly;
    if (m % 12 === 0) rows.push({ paid: initial + monthly * m, value });
  }
  // Intérêts simples : chaque euro versé rapporte rate % par an, sans que les intérêts produisent d'intérêts
  const n = years * 12;
  let simple = initial * (1 + (rate / 100) * years);
  for (let m = 1; m <= n; m++) simple += monthly * (1 + (rate / 100) * ((n - m) / 12));
  return { rows, simple };
}

export default function CompoundGrowthIsland() {
  const [p, setP] = useState(START);
  const { rows, simple } = simulate(p.initial, p.monthly, p.rate, p.years);
  const last = rows[rows.length - 1];
  const interest = last.value - last.paid;
  const max = Math.max(last.value, 1);
  const w = 84 / rows.length;
  const double = p.rate > 0 ? 72 / p.rate : Infinity;

  const slider = (key: keyof typeof START, label: string, min: number, maxV: number, step: number, unit: string) => (
    <label className="grid gap-1 text-sm">
      <span className="flex justify-between gap-2 text-ink-2">
        <span>{label}</span>
        <span className="font-mono text-ink tabular-nums">{key === 'rate' ? String(p[key]).replace('.', ',') : fmt(p[key])} {unit}</span>
      </span>
      <input type="range" min={min} max={maxV} step={step} value={p[key]} onChange={(e) => setP((v) => ({ ...v, [key]: Number(e.target.value) }))} aria-label={label} className="accent-[var(--signal)]" />
    </label>
  );

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
      <div className="grid content-start gap-4">
        {slider('initial', 'Capital de départ', 0, 50000, 500, '€')}
        {slider('monthly', 'Versement chaque mois', 0, 1000, 25, '€')}
        {slider('rate', 'Rendement annuel', 0, 12, 0.5, '%')}
        {slider('years', 'Durée', 1, 40, 1, 'ans')}
        <button type="button" onClick={() => setP(START)} className="justify-self-start text-xs text-ink-3 hover:text-ink">Revenir au départ</button>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-line bg-surface p-3">
            <p className="text-xs text-ink-3">Tu as versé</p>
            <p className="font-mono text-sm text-ink tabular-nums sm:text-lg">{money(last.paid)}</p>
          </div>
          <div className="rounded-xl border border-signal/35 bg-signal-soft p-3">
            <p className="text-xs text-ink-3">Intérêts gagnés</p>
            <p className="font-mono text-sm text-ink tabular-nums sm:text-lg">{money(interest)}</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-3">
            <p className="text-xs text-ink-3">Capital final</p>
            <p className="font-mono text-sm text-ink tabular-nums sm:text-lg">{money(last.value)}</p>
          </div>
        </div>

        <svg viewBox="0 0 100 58" className="w-full" role="img" aria-label={`Capital au bout de ${p.years} ans : ${fmt(last.value)} euros, dont ${fmt(interest)} euros d'intérêts`}>
          <line x1="12" x2="97" y1="50" y2="50" stroke="var(--line-strong)" strokeWidth="0.4" />
          <text x="13" y="4" textAnchor="start" fontSize="3.5" fill="var(--ink-3)">{axis(max)}</text>
          <text x="11" y="50" textAnchor="end" fontSize="3.5" fill="var(--ink-3)">0</text>
          {rows.map((row, i) => {
            const hPaid = (row.paid / max) * 44;
            const hInt = (Math.max(0, row.value - row.paid) / max) * 44;
            const x = 13 + i * w;
            return (
              <g key={i}>
                <motion.rect x={x} width={Math.max(w - 0.4, 0.3)} fill="var(--line-strong)" animate={{ y: 50 - hPaid, height: hPaid }} transition={{ duration: 0.4 }} />
                <motion.rect x={x} width={Math.max(w - 0.4, 0.3)} fill="var(--signal)" animate={{ y: 50 - hPaid - hInt, height: hInt }} transition={{ duration: 0.4 }} />
              </g>
            );
          })}
          <text x="13" y="55.5" fontSize="3.5" fill="var(--ink-3)">aujourd’hui</text>
          <text x="97" y="55.5" textAnchor="end" fontSize="3.5" fill="var(--ink-3)">dans {p.years} ans</text>
        </svg>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-2">
          <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-sm bg-line-strong" /> ce que tu as versé</span>
          <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-sm bg-signal" /> intérêts accumulés</span>
        </div>
        <p className="text-sm text-ink-2">
          Avec des intérêts <strong>simples</strong>, tu aurais {money(simple)} : les intérêts composés t’apportent {money(last.value - simple)} de plus.
          {Number.isFinite(double) && <> À {String(p.rate).replace('.', ',')} %, un capital double en ≈ {Math.round(double)} ans (règle de 72).</>}
        </p>
      </div>
    </div>
  );
}
