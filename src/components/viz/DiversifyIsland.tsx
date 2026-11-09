import { motion } from 'motion/react';
import { useState } from 'react';

/**
 * Diversification : volatilité d'un portefeuille de N actions à poids égaux,
 * chacune de volatilité 30 %, avec une corrélation moyenne ρ entre elles.
 * σp = σ × √(1/N + (1 − 1/N) ρ) ; plancher quand N → ∞ : σ × √ρ (risque de marché).
 */
const SIGMA = 30;
const START = { n: 1, rho: 0.3 };
const pct = (v: number) => `${v.toFixed(1).replace('.', ',')} %`;

export default function DiversifyIsland() {
  const [{ n, rho }, set] = useState(START);
  const total = SIGMA * Math.sqrt(1 / n + (1 - 1 / n) * rho);
  const floor = SIGMA * Math.sqrt(rho);
  const specific = Math.max(0, total - floor);
  const MEAN = 7; // rendement moyen supposé, en % par an
  const bad = MEAN - total * 2; // une « mauvaise année » ≈ deux écarts-types sous la moyenne

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
      <div className="grid content-start gap-4">
        <label className="grid gap-1 text-sm">
          <span className="flex justify-between text-ink-2"><span>Nombre d’actions</span><span className="font-mono text-ink tabular-nums">{n}</span></span>
          <input type="range" min={1} max={50} step={1} value={n} onChange={(e) => set((v) => ({ ...v, n: Number(e.target.value) }))} aria-label="Nombre d'actions dans le portefeuille" className="accent-[var(--signal)]" />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="flex justify-between text-ink-2"><span>Corrélation moyenne entre elles</span><span className="font-mono text-ink tabular-nums">{rho.toFixed(1).replace('.', ',')}</span></span>
          <input type="range" min={0} max={1} step={0.1} value={rho} onChange={(e) => set((v) => ({ ...v, rho: Number(e.target.value) }))} aria-label="Corrélation moyenne" className="accent-[var(--signal)]" />
        </label>
        <p className="text-xs text-ink-3">0 : les actions bougent indépendamment · 1 : elles bougent toutes ensemble. Entre actions d’un même marché, elle tourne souvent autour de 0,2 à 0,4, et monte pendant les crises.</p>
        <button type="button" onClick={() => set(START)} className="justify-self-start text-xs text-ink-3 hover:text-ink">Revenir au départ</button>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-line bg-surface p-3">
            <p className="text-xs text-ink-3">Volatilité du portefeuille</p>
            <p className="font-display text-4xl text-ink tabular-nums">{pct(total)}</p>
            <p className="text-xs text-ink-2">par an (une action seule : {SIGMA} %)</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-3">
            <p className="text-xs text-ink-3">Une mauvaise année</p>
            <p className="font-display text-4xl text-ink tabular-nums">{bad < 0 ? '−' : '+'}{Math.abs(Math.round(bad))} %</p>
            <p className="text-xs text-ink-2">une année sur 40 environ (moyenne 7 % moins deux écarts-types)</p>
          </div>
        </div>
        <div className="grid gap-2">
          <div className="flex h-8 overflow-hidden rounded-lg bg-surface-2" role="img" aria-label={`Risque de marché ${pct(floor)}, risque spécifique ${pct(specific)}`}>
            <motion.div className="grid place-items-center bg-amber text-xs font-semibold text-bg" animate={{ width: `${(floor / SIGMA) * 100}%` }} transition={{ duration: 0.4 }}>
              {floor >= 6 && 'marché'}
            </motion.div>
            <motion.div className="grid place-items-center bg-signal text-xs font-semibold text-bg" animate={{ width: `${(specific / SIGMA) * 100}%` }} transition={{ duration: 0.4 }}>
              {specific >= 6 && 'spécifique'}
            </motion.div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-2">
            <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-sm bg-amber" /> risque de marché : {pct(floor)}, impossible à diversifier</span>
            <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-sm bg-signal" /> risque spécifique : {pct(specific)}</span>
          </div>
        </div>
        <p className="text-sm text-ink-2">
          {n === 1
            ? 'Avec une seule action, tu portes tout son risque : une mauvaise nouvelle sur l’entreprise te touche de plein fouet.'
            : specific < 1.5
              ? 'Le risque spécifique a presque disparu : ajouter des actions ne réduit plus guère le risque. Il ne reste que le risque de marché.'
              : 'Chaque action ajoutée dilue le risque propre à chaque entreprise. Les premières font l’essentiel du travail.'}
        </p>
      </div>
    </div>
  );
}
