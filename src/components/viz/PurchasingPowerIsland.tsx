import { motion } from 'motion/react';
import { useState } from 'react';

/**
 * Inflation et pouvoir d'achat : ce que valent 1 000 € dans N ans,
 * laissés sur un compte courant ou placés à un taux nominal r.
 */
const START = { inflation: 3, years: 10, rate: 1.5 };
const fmt = (v: number) => Math.round(v).toLocaleString('fr-FR');
const pct = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1).replace('.', ',')} %`;

export default function PurchasingPowerIsland() {
  const [{ inflation, years, rate }, set] = useState(START);
  const i = inflation / 100;
  const r = rate / 100;
  const prices = Math.pow(1 + i, years); // indice des prix (1 = aujourd'hui)
  const cash = 1000 / prices; // pouvoir d'achat des billets
  const placed = (1000 * Math.pow(1 + r, years)) / prices; // pouvoir d'achat de l'épargne placée
  const real = ((1 + r) / (1 + i) - 1) * 100; // rendement réel annuel
  const baguette = 1.2 * prices;
  const double = inflation > 0 ? 72 / inflation : Infinity;
  const max = Math.max(1000, placed);

  const bars = [
    { label: 'Aujourd’hui', value: 1000, tone: 'var(--ink-3)' },
    { label: 'Billets sous le matelas', value: cash, tone: 'var(--danger)' },
    { label: `Placés à ${rate.toFixed(1).replace('.', ',')} %`, value: placed, tone: placed >= 1000 ? 'var(--synapse)' : 'var(--amber)' },
  ];

  const slider = (key: keyof typeof START, label: string, min: number, max: number, step: number, unit: string) => (
    <label className="grid gap-1 text-sm">
      <span className="flex justify-between text-ink-2">
        <span>{label}</span>
        <span className="font-mono text-ink tabular-nums">{`${String({ inflation, years, rate }[key]).replace('.', ',')} ${unit}`}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={{ inflation, years, rate }[key]}
        onChange={(e) => set((v) => ({ ...v, [key]: Number(e.target.value) }))}
        aria-label={label}
        className="accent-[var(--signal)]"
      />
    </label>
  );

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.3fr]">
      <div className="grid content-start gap-4">
        {slider('inflation', 'Inflation par an', 0, 10, 0.5, '%')}
        {slider('years', 'Durée', 0, 30, 1, 'ans')}
        {slider('rate', 'Taux de ton placement', 0, 8, 0.5, '%')}
        <button type="button" onClick={() => set(START)} className="justify-self-start text-xs text-ink-3 hover:text-ink">Revenir au départ</button>
      </div>

      <div className="grid gap-4">
        <p className="text-xs text-ink-3">Pouvoir d’achat de 1 000 € dans {years} an{years > 1 ? 's' : ''}, en euros d’aujourd’hui</p>
        <div className="grid gap-3">
          {bars.map((b) => (
            <div key={b.label} className="grid gap-1">
              <div className="flex justify-between text-sm">
                <span className="text-ink-2">{b.label}</span>
                <span className="font-mono text-ink tabular-nums">{fmt(b.value)} €</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-surface-2">
                <motion.div className="h-full rounded-full" style={{ background: b.tone }} animate={{ width: `${(b.value / max) * 100}%` }} transition={{ duration: 0.5 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-surface p-3">
            <p className="text-xs text-ink-3">Une baguette à 1,20 €</p>
            <p className="font-mono text-lg text-ink tabular-nums">{baguette.toFixed(2).replace('.', ',')} €</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-3">
            <p className="text-xs text-ink-3">Les prix doublent en</p>
            <p className="font-mono text-lg text-ink tabular-nums">{Number.isFinite(double) ? `≈ ${Math.round(double)} ans` : 'jamais'}</p>
          </div>
          <div className={`rounded-xl border p-3 ${real >= 0 ? 'border-synapse/35 bg-synapse-soft' : 'border-danger/30 bg-danger-soft'}`}>
            <p className="text-xs text-ink-3">Rendement réel par an</p>
            <p className="font-mono text-lg text-ink tabular-nums">{pct(real)}</p>
          </div>
        </div>
        <p className="text-sm text-ink-2">
          {real >= 0
            ? 'Ton placement rapporte plus que l’inflation : ton pouvoir d’achat progresse.'
            : 'Ton placement rapporte moins que l’inflation : tu as plus d’euros, mais ils achètent moins de choses.'}
        </p>
      </div>
    </div>
  );
}
