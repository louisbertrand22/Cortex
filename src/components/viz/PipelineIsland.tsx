import { motion, useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export type PipelineStep = { title: string; caption?: string; detail?: string; tone?: 'signal' | 'synapse' | 'muted' };

/**
 * Pipeline animé : les étapes apparaissent en séquence, un « paquet » parcourt
 * les connecteurs en boucle, et un clic sur une étape affiche son détail.
 */
export default function PipelineIsland({ steps, loop = true }: { steps: PipelineStep[]; loop?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!inView || !auto || !loop) return;
    const t = setInterval(() => setActive((a) => (a + 1) % steps.length), 2200);
    return () => clearInterval(t);
  }, [inView, auto, loop, steps.length]);

  const tone = (s: PipelineStep, on: boolean) => {
    const c = s.tone === 'synapse' ? 'var(--synapse)' : s.tone === 'muted' ? 'var(--ink-3)' : 'var(--signal)';
    return on ? { borderColor: c, boxShadow: `0 0 0 3px color-mix(in oklab, ${c} 18%, transparent)` } : {};
  };

  return (
    <div ref={ref} className="w-full">
      <ol className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-0">
        {steps.map((s, i) => (
          <li key={i} className="flex flex-col md:flex-1 md:flex-row md:items-center">
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => { setActive(i); setAuto(false); }}
              className="relative w-full rounded-xl border border-line bg-surface-2 px-3 py-3 text-left transition-[border-color,box-shadow] duration-300 md:min-h-[6.5rem]"
              style={tone(s, active === i)}
              aria-pressed={active === i}
            >
              <span className="font-mono text-[0.65rem] tracking-[0.12em] text-ink-3">{String(i + 1).padStart(2, '0')}</span>
              <span className="mt-0.5 block text-sm font-semibold leading-snug text-ink">{s.title}</span>
              {s.caption && <span className="mt-1 block text-xs leading-snug text-ink-3">{s.caption}</span>}
            </motion.button>
            {i < steps.length - 1 && (
              <div className="relative mx-auto h-5 w-px bg-line-strong md:mx-0 md:h-px md:w-6 md:shrink-0" aria-hidden="true">
                {inView && active === i && <span key={`p-${active}`} className="pipeline-packet" />}
              </div>
            )}
          </li>
        ))}
      </ol>
      {steps[active]?.detail && (
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 rounded-xl border border-line bg-bg px-4 py-3 text-sm leading-relaxed text-ink-2"
          aria-live="polite"
        >
          <span className="mr-2 font-mono text-xs text-signal">{String(active + 1).padStart(2, '0')}</span>
          {steps[active].detail}
        </motion.div>
      )}
    </div>
  );
}
