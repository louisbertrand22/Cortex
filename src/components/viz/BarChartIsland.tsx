import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

export type Bar = { label: string; value: number; highlight?: boolean };

/** Barres horizontales qui se remplissent à l'entrée dans le viewport. */
export default function BarChartIsland({ data, unit = '', max }: { data: Bar[]; unit?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const top = max ?? Math.max(...data.map((d) => d.value));
  return (
    <div ref={ref} className="grid gap-2.5" role="list">
      {data.map((d, i) => (
        <div key={d.label} role="listitem" className="grid grid-cols-[minmax(5rem,7.5rem)_1fr_auto] items-center gap-3 text-sm">
          <span className={d.highlight ? 'font-semibold text-ink' : 'text-ink-2'}>{d.label}</span>
          <div className="h-6 overflow-hidden rounded-md bg-surface-2">
            <motion.div
              className="h-full rounded-md"
              style={{ background: d.highlight ? 'var(--signal)' : 'var(--line-strong)' }}
              initial={{ width: 0 }}
              animate={inView ? { width: `${(d.value / top) * 100}%` } : {}}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <span className={`min-w-[4.5rem] whitespace-nowrap text-right font-mono tabular-nums ${d.highlight ? 'text-signal' : 'text-ink-3'}`}>
            {d.value}
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}
