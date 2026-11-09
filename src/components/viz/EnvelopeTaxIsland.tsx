import { motion } from 'motion/react';
import { useState } from 'react';

/**
 * Impôt sur un gain selon l'enveloppe (règles 2026, simplifiées) :
 * - CTO : prélèvement forfaitaire unique 12,8 % + prélèvements sociaux 18,6 % = 31,4 % ;
 * - PEA : 31,4 % avant 5 ans, 18,6 % (prélèvements sociaux seuls) après ;
 * - assurance-vie (versements ≤ 150 000 €) : 12,8 % + 17,2 % avant 8 ans ;
 *   après 8 ans, 17,2 % sur tout le gain + 7,5 % sur la part qui dépasse l'abattement (4 600 € ou 9 200 €).
 * Hypothèse : on retire tout, et le gain retiré est celui indiqué. Option du barème progressif ignorée.
 */
const START = { gain: 10000, years: 6, couple: false };
const eur = (v: number) => `${Math.round(v).toLocaleString('fr-FR')} €`;

function taxes(gain: number, years: number, couple: boolean) {
  const cto = gain * 0.314;
  const pea = gain * (years >= 5 ? 0.186 : 0.314);
  const allowance = couple ? 9200 : 4600;
  const av = years >= 8 ? gain * 0.172 + Math.max(0, gain - allowance) * 0.075 : gain * 0.3;
  return [
    { id: 'cto', label: 'Compte-titres (CTO)', tax: cto, rule: '31,4 % quelle que soit la durée' },
    { id: 'pea', label: 'PEA', tax: pea, rule: years >= 5 ? 'plus de 5 ans : prélèvements sociaux seuls (18,6 %)' : 'moins de 5 ans : 31,4 % et clôture du plan' },
    {
      id: 'av',
      label: 'Assurance-vie',
      tax: av,
      rule: years >= 8 ? `plus de 8 ans : 17,2 % + 7,5 % au-delà de ${eur(allowance)} de gain` : 'moins de 8 ans : 30 %',
    },
  ];
}

export default function EnvelopeTaxIsland() {
  const [s, set] = useState(START);
  const rows = taxes(s.gain, s.years, s.couple);
  const max = Math.max(...rows.map((r) => r.tax), 1);
  const best = Math.min(...rows.map((r) => r.tax));

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
      <div className="grid content-start gap-4">
        <label className="grid gap-1 text-sm">
          <span className="flex justify-between text-ink-2"><span>Gain retiré</span><span className="font-mono text-ink tabular-nums">{eur(s.gain)}</span></span>
          <input type="range" min={1000} max={50000} step={1000} value={s.gain} onChange={(e) => set((v) => ({ ...v, gain: Number(e.target.value) }))} aria-label="Montant du gain" className="accent-[var(--signal)]" />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="flex justify-between text-ink-2"><span>Ancienneté de l’enveloppe</span><span className="font-mono text-ink tabular-nums">{s.years} an{s.years > 1 ? 's' : ''}</span></span>
          <input type="range" min={1} max={15} step={1} value={s.years} onChange={(e) => set((v) => ({ ...v, years: Number(e.target.value) }))} aria-label="Ancienneté de l'enveloppe en années" className="accent-[var(--signal)]" />
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" checked={s.couple} onChange={(e) => set((v) => ({ ...v, couple: e.target.checked }))} className="size-4 accent-[var(--signal)]" />
          Couple marié ou pacsé (abattement assurance-vie doublé)
        </label>
        <button type="button" onClick={() => set(START)} className="justify-self-start text-xs text-ink-3 hover:text-ink">Revenir au départ</button>
      </div>

      <div className="grid gap-3">
        <p className="text-xs text-ink-3">Impôts et prélèvements sociaux sur ce gain</p>
        {rows.map((r) => (
          <div key={r.id} className="grid gap-1">
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-ink">{r.label}{Math.abs(r.tax - best) < 0.5 && <span className="ml-2 rounded-full bg-synapse-soft px-2 py-0.5 text-xs text-synapse">le moins taxé</span>}</span>
              <span className="font-mono text-ink tabular-nums">{eur(r.tax)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-surface-2">
              <motion.div className="h-full rounded-full" style={{ background: Math.abs(r.tax - best) < 0.5 ? 'var(--synapse)' : 'var(--signal)' }} animate={{ width: `${(r.tax / max) * 100}%` }} transition={{ duration: 0.4 }} />
            </div>
            <p className="text-xs text-ink-3">{r.rule}</p>
          </div>
        ))}
        <p className="text-xs text-ink-3">Règles 2026 simplifiées : option pour le barème de l’impôt sur le revenu ignorée, versements en assurance-vie inférieurs à 150 000 €. Ne remplace pas un conseil fiscal.</p>
      </div>
    </div>
  );
}
