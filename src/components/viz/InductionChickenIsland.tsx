import { motion } from 'motion/react';
import { useState } from 'react';

/**
 * Le poulet inductiviste de Russell : nourri chaque matin, il devient de plus en plus
 * sûr que demain il le sera encore. Sa confiance suit la règle de succession de Laplace,
 * (n + 1) / (n + 2) après n matins sans exception… jusqu'au matin de la fête.
 */
const LAST = 300;
const conf = (n: number) => (n + 1) / (n + 2);
const pct = (v: number) => `${(v * 100).toFixed(1).replace('.', ',')} %`;
const X = (d: number) => 15 + (d / LAST) * 81;
const Y = (c: number) => 40 - (c - 0.5) * 2 * 34;

export default function InductionChickenIsland() {
  const [day, setDay] = useState(3);
  const over = day > LAST;
  const n = Math.min(day, LAST);
  const go = (d: number) => setDay(Math.min(LAST + 1, d));

  const pts = Array.from({ length: n + 1 }, (_, i) => i).filter((i) => i % 3 === 0 || i === n);
  const path = pts.map((i, k) => `${k ? 'L' : 'M'}${X(i).toFixed(2)},${Y(conf(i)).toFixed(2)}`).join(' ');

  return (
    <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
      <svg viewBox="0 0 100 50" className="w-full" role="img" aria-label={`Confiance du poulet après ${n} matins : ${pct(conf(n))}`}>
        {[0.5, 0.75, 1].map((c) => (
          <g key={c}>
            <line x1="15" x2="96" y1={Y(c)} y2={Y(c)} stroke="var(--line)" strokeWidth="0.3" />
            <text x="13" y={Y(c) + 1.2} textAnchor="end" fontSize="3.5" fill="var(--ink-3)">{c * 100} %</text>
          </g>
        ))}
        <path d={path} fill="none" stroke="var(--signal)" strokeWidth="0.8" />
        <motion.circle animate={{ cx: X(n), cy: Y(conf(n)) }} transition={{ duration: 0.3 }} r="1.5" fill="var(--signal)" />
        {over && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <line x1={X(LAST)} x2={X(LAST)} y1="4" y2="44" stroke="var(--danger)" strokeWidth="0.6" strokeDasharray="1.5 1" />
            <text x={X(LAST) - 1.5} y="24" textAnchor="end" fontSize="3.5" fill="var(--danger)">jour de fête</text>
          </motion.g>
        )}
        <text x="15" y="48.5" fontSize="3.5" fill="var(--ink-3)">jour 0</text>
        <text x="96" y="48.5" textAnchor="end" fontSize="3.5" fill="var(--ink-3)">jour {LAST}</text>
      </svg>

      <div className="grid content-start gap-3">
        <div className={`rounded-xl border p-3 ${over ? 'border-danger bg-danger-soft' : 'border-line bg-surface'}`}>
          <p className="text-xs text-ink-3">{over ? `Matin ${LAST + 1}` : `Après ${n} matin${n > 1 ? 's' : ''} nourri${n > 1 ? 's' : ''}`}</p>
          <p className={`font-display text-ink tabular-nums ${over ? "text-2xl" : "text-4xl"}`}>{over ? 'Le fermier arrive… sans grain.' : pct(conf(n))}</p>
          <p className="text-xs text-ink-2">{over ? `Sa confiance n’a jamais été aussi haute : ${pct(conf(LAST))}.` : 'de certitude que demain, il sera encore nourri'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!over && (
            <>
              <button type="button" onClick={() => go(day + 1)} className="rounded-full border border-signal bg-signal-soft px-3 py-1.5 text-sm text-ink">Matin suivant</button>
              <button type="button" onClick={() => go(day + 50)} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-2 hover:text-ink">+ 50 matins</button>
            </>
          )}
          <button type="button" onClick={() => setDay(3)} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-2 hover:text-ink">Recommencer</button>
        </div>
        <p className="text-sm text-ink-2">
          {over
            ? 'Chaque observation renforçait sa conviction, et aucune ne pouvait l’avertir. Le nombre d’observations ne garantit jamais la suivante.'
            : 'Chaque matin confirme la règle « le fermier me nourrit ». Avance jusqu’au bout de l’histoire.'}
        </p>
      </div>
    </div>
  );
}
