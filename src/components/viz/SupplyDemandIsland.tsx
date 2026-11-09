import { motion } from 'motion/react';
import { useState } from 'react';

/**
 * Offre et demande : le marché des glaces sur une plage.
 * Prix P et quantité Q en unités abstraites (0 à 10), converties en € et en cornets pour l'affichage.
 * Demande : P = 8 + d − 0,7 Q · Offre : P = 1 − s + 0,7 Q (s > 0 = offre qui augmente, la courbe descend).
 */
const SCENARIOS = [
  { id: 'base', label: 'Situation de départ', d: 0, s: 0, text: 'Le prix s’établit là où les deux courbes se croisent : autant de glaces voulues que de glaces proposées.' },
  { id: 'heat', label: 'Canicule', d: 2, s: 0, text: 'Plus de monde veut une glace à chaque prix : la demande se déplace vers la droite. Le prix monte et on vend plus.' },
  { id: 'frost', label: 'Lait plus cher', d: 0, s: -1.8, text: 'Produire coûte plus cher : à chaque prix, les vendeurs proposent moins. L’offre recule, le prix monte, on vend moins.' },
  { id: 'kiosk', label: 'Nouveaux kiosques', d: 0, s: 1.8, text: 'Plus de vendeurs sur la plage : l’offre augmente. Le prix baisse et on vend plus.' },
  { id: 'rain', label: 'Été pluvieux', d: -2, s: 0, text: 'Moins d’envies de glace : la demande recule. Le prix baisse et on vend moins.' },
] as const;

const X = (q: number) => 12 + q * 8.4; // Q 0..10 → 12..96
const Y = (p: number) => 60 - p * 5.4; // P 0..10 → 60..6
const eq = (d: number, s: number) => {
  const q = (7 + d + s) / 1.4;
  return { q, p: 8 + d - 0.7 * q };
};
const euros = (p: number) => (p * 0.5).toFixed(2).replace('.', ',');
const cones = (q: number) => Math.round(q * 40);

export default function SupplyDemandIsland() {
  const [d, setD] = useState(0);
  const [s, setS] = useState(0);
  const [note, setNote] = useState<string>(SCENARIOS[0].text);
  const base = eq(0, 0);
  const now = eq(d, s);
  const moved = d !== 0 || s !== 0;
  const dp = now.p - base.p;
  const dq = now.q - base.q;
  const arrow = (v: number) => (Math.abs(v) < 0.05 ? '=' : v > 0 ? '↑' : '↓');

  const pick = (sc: (typeof SCENARIOS)[number]) => {
    setD(sc.d);
    setS(sc.s);
    setNote(sc.text);
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            type="button"
            onClick={() => pick(sc)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${d === sc.d && s === sc.s ? 'border-signal bg-signal-soft text-ink' : 'border-line bg-surface text-ink-2 hover:text-ink'}`}
          >
            {sc.label}
          </button>
        ))}
      </div>

      <div className="grid items-center gap-6 md:grid-cols-[1.5fr_1fr]">
        <svg viewBox="0 0 100 70" className="w-full" role="img" aria-label="Courbes d'offre et de demande et prix d'équilibre">
          <defs>
            <clipPath id="sd-plot">
              <rect x="12" y="4" width="86" height="56" />
            </clipPath>
          </defs>
          <line x1="12" y1="60" x2="98" y2="60" stroke="var(--line-strong)" strokeWidth="0.4" />
          <line x1="12" y1="4" x2="12" y2="60" stroke="var(--line-strong)" strokeWidth="0.4" />
          <text x="97" y="66" textAnchor="end" fontSize="3.6" fill="var(--ink-3)">quantité vendue →</text>
          <text x="10" y="6" textAnchor="end" fontSize="3.6" fill="var(--ink-3)" transform="rotate(-90 10 6)">← prix</text>

          <g clipPath="url(#sd-plot)">
            {moved && (
              <g opacity="0.35">
                <line x1={X(0)} y1={Y(8)} x2={X(10)} y2={Y(1)} stroke="var(--ink-3)" strokeWidth="0.5" strokeDasharray="1.5 1" />
                <line x1={X(0)} y1={Y(1)} x2={X(10)} y2={Y(8)} stroke="var(--ink-3)" strokeWidth="0.5" strokeDasharray="1.5 1" />
              </g>
            )}
            <motion.line animate={{ y1: Y(8 + d), y2: Y(1 + d) }} x1={X(0)} x2={X(10)} stroke="var(--signal)" strokeWidth="0.9" transition={{ duration: 0.6 }} />
            <motion.line animate={{ y1: Y(1 - s), y2: Y(8 - s) }} x1={X(0)} x2={X(10)} stroke="var(--synapse)" strokeWidth="0.9" transition={{ duration: 0.6 }} />
            <motion.line animate={{ x2: X(now.q), y1: Y(now.p), y2: Y(now.p) }} x1={12} stroke="var(--ink-3)" strokeWidth="0.35" strokeDasharray="1 1" transition={{ duration: 0.6 }} />
            <motion.line animate={{ x1: X(now.q), x2: X(now.q), y1: Y(now.p) }} y2={60} stroke="var(--ink-3)" strokeWidth="0.35" strokeDasharray="1 1" transition={{ duration: 0.6 }} />
            {moved && <circle cx={X(base.q)} cy={Y(base.p)} r="1.2" fill="var(--ink-3)" opacity="0.5" />}
            <motion.circle animate={{ cx: X(now.q), cy: Y(now.p) }} r="1.8" fill="var(--ink)" transition={{ duration: 0.6 }} />
          </g>
          <motion.text animate={{ y: Y(8 + d) - 1.8 }} x={X(0.4)} fontSize="3.6" fill="var(--signal)" fontWeight="600" transition={{ duration: 0.6 }}>Demande</motion.text>
          <motion.text animate={{ y: Y(8 - s) - 1.8 }} x={X(10)} textAnchor="end" fontSize="3.6" fill="var(--synapse)" fontWeight="600" transition={{ duration: 0.6 }}>Offre</motion.text>
        </svg>

        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line bg-surface p-3">
              <p className="text-xs text-ink-3">Prix du cornet</p>
              <p className="font-display text-3xl text-ink tabular-nums">{euros(now.p)} €</p>
              <p className="text-xs text-ink-2">{arrow(dp)} {moved ? `départ : ${euros(base.p)} €` : 'prix d’équilibre'}</p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-3">
              <p className="text-xs text-ink-3">Glaces vendues / jour</p>
              <p className="font-display text-3xl text-ink tabular-nums">{cones(now.q)}</p>
              <p className="text-xs text-ink-2">{arrow(dq)} {moved ? `départ : ${cones(base.q)}` : 'quantité d’équilibre'}</p>
            </div>
          </div>
          <motion.p key={note} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-ink-2">{note}</motion.p>
          <label className="grid gap-1 text-sm">
            <span className="text-ink-2"><span className="font-semibold text-signal">Demande</span> : envie d’acheter</span>
            <input type="range" min={-2} max={2} step={0.2} value={d} onChange={(e) => { setD(Number(e.target.value)); setNote('Tu déplaces les courbes toi-même : regarde dans quel sens bougent le prix et la quantité.'); }} aria-label="Déplacer la demande" className="accent-[var(--signal)]" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-ink-2"><span className="font-semibold text-synapse">Offre</span> : envie de vendre</span>
            <input type="range" min={-2} max={2} step={0.2} value={s} onChange={(e) => { setS(Number(e.target.value)); setNote('Tu déplaces les courbes toi-même : regarde dans quel sens bougent le prix et la quantité.'); }} aria-label="Déplacer l'offre" className="accent-[var(--synapse)]" />
          </label>
        </div>
      </div>
    </div>
  );
}
