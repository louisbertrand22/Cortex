import { motion } from 'motion/react';
import { useState } from 'react';

/**
 * Prix d'une obligation de nominal 1 000 € selon le taux du marché.
 * Prix = somme des coupons et du remboursement, actualisés au taux du marché.
 */
const NOMINAL = 1000;
const START = { coupon: 1, years: 10, market: 1 };
const PRESETS = [
  { id: 'issue', label: 'À l’émission', market: 1, text: 'Le taux du marché égale le coupon : l’obligation vaut son nominal, 1 000 €.' },
  { id: 'up', label: 'Les taux montent à 3,5 %', market: 3.5, text: 'Personne n’achètera ton coupon de 1 % au prix plein alors que les obligations neuves paient 3,5 % : son prix doit baisser.' },
  { id: 'down', label: 'Les taux tombent à 0 %', market: 0, text: 'Ton coupon de 1 % devient précieux : les acheteurs acceptent de le payer plus cher que 1 000 €.' },
] as const;

function price(coupon: number, years: number, y: number) {
  const c = (NOMINAL * coupon) / 100;
  const r = y / 100;
  let p = 0;
  let dur = 0;
  for (let t = 1; t <= years; t++) {
    const cf = c + (t === years ? NOMINAL : 0);
    const pv = cf / Math.pow(1 + r, t);
    p += pv;
    dur += t * pv;
  }
  return { p, duration: dur / p / (1 + r) }; // duration modifiée
}

const n = (v: number, d = 1) => v.toFixed(d).replace('.', ',');
const X = (y: number) => 12 + (y / 8) * 84;

export default function BondPriceIsland() {
  const [s, setS] = useState(START);
  const [note, setNote] = useState<string>(PRESETS[0].text);
  const { p, duration } = price(s.coupon, s.years, s.market);
  const raw = (p / NOMINAL - 1) * 100;
  const change = Math.abs(raw) < 0.05 ? 0 : raw;

  // courbe prix / taux pour la plage 0..8 %
  const pts = Array.from({ length: 33 }, (_, i) => i * 0.25).map((y) => ({ y, p: price(s.coupon, s.years, y).p }));
  const maxP = Math.max(...pts.map((q) => q.p), NOMINAL * 1.05);
  const minP = Math.min(...pts.map((q) => q.p), NOMINAL * 0.95);
  const Y = (v: number) => 52 - ((v - minP) / (maxP - minP)) * 46;
  const d = pts.map((q, i) => `${i ? 'L' : 'M'}${X(q.y).toFixed(2)},${Y(q.p).toFixed(2)}`).join(' ');

  const set = (patch: Partial<typeof START>, text?: string) => {
    setS((v) => ({ ...v, ...patch }));
    setNote(text ?? 'Tu règles toi-même : compare le taux du marché au coupon de ton obligation.');
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((pr) => (
          <button
            key={pr.id}
            type="button"
            onClick={() => set({ coupon: 1, years: 10, market: pr.market }, pr.text)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${s.coupon === 1 && s.years === 10 && s.market === pr.market ? 'border-signal bg-signal-soft text-ink' : 'border-line bg-surface text-ink-2 hover:text-ink'}`}
          >
            {pr.label}
          </button>
        ))}
      </div>

      <div className="grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
        <svg viewBox="0 0 100 66" className="w-full" role="img" aria-label={`Prix de l'obligation : ${Math.round(p)} euros pour un taux de marché de ${n(s.market)} %`}>
          <line x1="12" x2="96" y1="54" y2="54" stroke="var(--line-strong)" strokeWidth="0.4" />
          <line x1="12" x2="96" y1={Y(NOMINAL)} y2={Y(NOMINAL)} stroke="var(--ink-3)" strokeWidth="0.3" strokeDasharray="1.2 1" />
          <text x="11" y={Y(NOMINAL) + 1.2} textAnchor="end" fontSize="3.5" fill="var(--ink-3)">1 000</text>
          {[0, 2, 4, 6, 8].map((y) => (
            <text key={y} x={X(y)} y="59" textAnchor="middle" fontSize="3.5" fill="var(--ink-3)">{y} %</text>
          ))}
          <motion.path animate={{ d }} transition={{ duration: 0.4 }} fill="none" stroke="var(--signal)" strokeWidth="0.9" />
          <motion.circle animate={{ cx: X(s.market), cy: Y(p) }} r="1.8" fill="var(--ink)" transition={{ duration: 0.4 }} />
          <text x="96" y="5" textAnchor="end" fontSize="3.5" fill="var(--ink-3)">prix de l’obligation (€)</text>
          <text x="96" y="64.5" textAnchor="end" fontSize="3.5" fill="var(--ink-3)">taux du marché →</text>
        </svg>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-xl border p-3 ${change < -0.5 ? 'border-danger/30 bg-danger-soft' : change > 0.5 ? 'border-synapse/35 bg-synapse-soft' : 'border-line bg-surface'}`}>
              <p className="text-xs text-ink-3">Prix</p>
              <p className="font-display text-3xl text-ink tabular-nums">{Math.round(p).toLocaleString('fr-FR')} €</p>
              <p className="text-xs text-ink-2">{change > 0 ? '+' : ''}{n(change)} % vs nominal</p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-3">
              <p className="text-xs text-ink-3">Sensibilité</p>
              <p className="font-display text-3xl text-ink tabular-nums">{n(duration)}</p>
              <p className="text-xs text-ink-2">≈ −{n(duration)} % si les taux montent de 1 point</p>
            </div>
          </div>
          <label className="grid gap-1 text-sm">
            <span className="flex justify-between text-ink-2"><span>Taux du marché</span><span className="font-mono text-ink tabular-nums">{n(s.market, 2)} %</span></span>
            <input type="range" min={0} max={8} step={0.25} value={s.market} onChange={(e) => set({ market: Number(e.target.value) })} aria-label="Taux du marché" className="accent-[var(--signal)]" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="flex justify-between text-ink-2"><span>Coupon de l’obligation</span><span className="font-mono text-ink tabular-nums">{n(s.coupon)} %</span></span>
            <input type="range" min={0} max={8} step={0.5} value={s.coupon} onChange={(e) => set({ coupon: Number(e.target.value) })} aria-label="Coupon de l'obligation" className="accent-[var(--signal)]" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="flex justify-between text-ink-2"><span>Années restantes</span><span className="font-mono text-ink tabular-nums">{s.years} ans</span></span>
            <input type="range" min={1} max={30} step={1} value={s.years} onChange={(e) => set({ years: Number(e.target.value) })} aria-label="Années avant remboursement" className="accent-[var(--signal)]" />
          </label>
        </div>
      </div>
      <motion.p key={note} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-ink-2">{note}</motion.p>
    </div>
  );
}
