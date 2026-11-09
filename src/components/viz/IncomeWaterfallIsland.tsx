import { motion } from 'motion/react';
import { useState } from 'react';

/**
 * Compte de résultat simplifié de Cycléa (fabricant de vélos fictif), en millions d'euros,
 * et levier opérationnel : une variation du chiffre d'affaires amplifiée par les coûts fixes.
 */
const MODELS = {
  flex: { label: 'Coûts surtout variables', variable: 0.6, fixed: 25, text: 'Cycléa sous-traite l’assemblage : quand les ventes baissent, ses coûts baissent aussi.' },
  fixed: { label: 'Coûts surtout fixes', variable: 0.4, fixed: 45, text: 'Cycléa possède son usine et ses robots : ses coûts tombent peu quand les ventes baissent.' },
} as const;
type Model = keyof typeof MODELS;
const INTEREST = 3;
const TAX = 0.25;
const SHARES = 10; // millions d'actions

function compute(model: Model, change: number) {
  const m = MODELS[model];
  const ca = 100 * (1 + change / 100);
  const variable = ca * m.variable;
  const margin = ca - variable;
  const ebit = margin - m.fixed;
  const pretax = ebit - INTEREST;
  const tax = pretax > 0 ? pretax * TAX : 0;
  const net = pretax - tax;
  return { ca, variable, margin, fixed: m.fixed, ebit, pretax, tax, net };
}

const n = (v: number) => (Math.abs(v) < 0.05 ? '0' : v.toFixed(1).replace('.', ',').replace('-', '−'));

export default function IncomeWaterfallIsland() {
  const [model, setModel] = useState<Model>('flex');
  const [change, setChange] = useState(0);
  const c = compute(model, change);
  const base = compute(model, 0);
  const delta = base.net !== 0 ? ((c.net - base.net) / Math.abs(base.net)) * 100 : 0;

  const rows: { label: string; value: number; kind: 'total' | 'minus' }[] = [
    { label: 'Chiffre d’affaires', value: c.ca, kind: 'total' },
    { label: '− Coûts variables (pièces, sous-traitance)', value: -c.variable, kind: 'minus' },
    { label: '− Coûts fixes (loyers, salaires, machines)', value: -c.fixed, kind: 'minus' },
    { label: '= Résultat d’exploitation', value: c.ebit, kind: 'total' },
    { label: '− Intérêts de la dette', value: -INTEREST, kind: 'minus' },
    { label: '− Impôt sur les sociétés (25 %)', value: -c.tax, kind: 'minus' },
    { label: '= Résultat net', value: c.net, kind: 'total' },
  ];

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(MODELS) as Model[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setModel(k)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${model === k ? 'border-signal bg-signal-soft text-ink' : 'border-line bg-surface text-ink-2 hover:text-ink'}`}
          >
            {MODELS[k].label}
          </button>
        ))}
      </div>
      <p className="text-sm text-ink-2">{MODELS[model].text}</p>

      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-2">
          {rows.map((r) => {
            const neg = r.value < 0;
            const bad = r.kind === 'total' && neg;
            return (
              <div key={r.label} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 sm:grid-cols-[13rem_1fr_4rem]">
                <span className={`text-sm ${r.kind === 'total' ? 'font-semibold text-ink' : 'text-ink-2'}`}>{r.label}</span>
                <span className="order-3 col-span-2 h-3 overflow-hidden rounded-full bg-surface-2 sm:order-none sm:col-span-1">
                  <motion.span
                    className="block h-full rounded-full"
                    style={{ background: bad ? 'var(--danger)' : r.kind === 'total' ? 'var(--signal)' : 'var(--line-strong)' }}
                    animate={{ width: `${Math.min(100, (Math.abs(r.value) / 130) * 100)}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </span>
                <span className={`text-right font-mono text-sm tabular-nums ${bad ? 'text-danger' : 'text-ink'}`}>{n(r.value)}</span>
              </div>
            );
          })}
          <p className="text-xs text-ink-3">En millions d’euros · Cycléa est une entreprise fictive</p>
        </div>

        <div className="grid content-start gap-4">
          <label className="grid gap-1 text-sm">
            <span className="flex justify-between text-ink-2">
              <span>Variation des ventes</span>
              <span className="font-mono text-ink tabular-nums">{change > 0 ? '+' : ''}{change} %</span>
            </span>
            <input type="range" min={-30} max={30} step={5} value={change} onChange={(e) => setChange(Number(e.target.value))} aria-label="Variation du chiffre d'affaires" className="accent-[var(--signal)]" />
          </label>
          <div className={`rounded-xl border p-3 ${c.net < 0 ? 'border-danger/30 bg-danger-soft' : 'border-line bg-surface'}`}>
            <p className="text-xs text-ink-3">Résultat net</p>
            <p className="font-display text-4xl text-ink tabular-nums">{n(c.net)} M€</p>
            <p className="text-xs text-ink-2">
              {change === 0 ? 'situation de départ' : `${delta > 0 ? '↑ +' : '↓ '}${Math.round(delta)} % pour des ventes à ${change > 0 ? '+' : ''}${change} %`}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line bg-surface p-3">
              <p className="text-xs text-ink-3">Marge nette</p>
              <p className="font-mono text-lg text-ink tabular-nums">{n((c.net / c.ca) * 100)} %</p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-3">
              <p className="text-xs text-ink-3">Bénéfice par action</p>
              <p className="font-mono text-lg text-ink tabular-nums">{n(c.net / SHARES)} €</p>
            </div>
          </div>
          <button type="button" onClick={() => { setChange(0); setModel('flex'); }} className="justify-self-start text-xs text-ink-3 hover:text-ink">Revenir au départ</button>
        </div>
      </div>
    </div>
  );
}
