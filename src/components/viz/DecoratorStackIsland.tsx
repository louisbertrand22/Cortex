import { AnimatePresence, motion } from 'motion/react';
import { useState, type ReactNode } from 'react';

// Decorator : envelopper un Coffee dans des décorateurs et suivre la délégation de getCost() (ACOO session 2, « Decorator »)
type Deco = { id: string; cls: string; label: string; desc: string; apply: (c: number) => number; formula: (inner: string) => string };

const decos: Deco[] = [
  { id: 'milk', cls: 'MilkDecorator', label: '+ Lait', desc: 'lait', apply: (c) => c + 0.5, formula: (i) => `${i} + 0,50` },
  { id: 'sugar', cls: 'SugarDecorator', label: '+ Sucre', desc: 'sucre', apply: (c) => c + 0.1, formula: (i) => `${i} + 0,10` },
  { id: 'promo', cls: 'PromoDecorator', label: '− 20 % (promo)', desc: 'promo −20 %', apply: (c) => c * 0.8, formula: (i) => `0,8 × (${i})` },
];
const BASE = 2;
const eur = (x: number) => `${x.toFixed(2).replace('.', ',')} €`;

export default function DecoratorStackIsland() {
  const [stack, setStack] = useState<string[]>(['milk']);
  const layers = stack.map((id) => decos.find((d) => d.id === id)!);

  const cost = layers.reduce((c, d) => d.apply(c), BASE);
  const description = ['Café', ...layers.map((d) => d.desc)].join(', ');
  const formula = layers.reduce((f, d) => d.formula(f), '2,00');
  const reversed = [...layers].reverse().reduce((c, d) => d.apply(c), BASE);

  // de l'extérieur vers l'intérieur
  const outerFirst = [...layers].reverse();

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {decos.map((d) => (
          <button key={d.id} type="button" onClick={() => setStack((s) => (s.length < 5 ? [...s, d.id] : s))} disabled={stack.length >= 5}
            className="rounded-xl border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-signal disabled:opacity-40">{d.label}</button>
        ))}
        <button type="button" onClick={() => setStack((s) => s.slice(0, -1))} disabled={stack.length === 0} className="rounded-xl border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-line-strong disabled:opacity-40">Retirer l’enveloppe extérieure</button>
        <button type="button" onClick={() => setStack(['milk'])} className="rounded-xl border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-line-strong">Recommencer</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-xl border border-line bg-bg p-3">
          <p className="mb-2 font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">L’objet que voit le client (un Drink)</p>
          <AnimatePresence initial={false}>
            {outerFirst.reduceRight<ReactNode>(
              (inner, d, i) => (
                <motion.div key={`${d.id}-${outerFirst.length - i}`} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="rounded-lg border border-signal bg-signal-soft/40 p-2">
                  <p className="mb-1.5 font-mono text-[0.7rem] text-ink">{d.cls}</p>
                  {inner}
                </motion.div>
              ),
              <motion.div layout className="rounded-lg border border-line-strong bg-surface-2 p-2 font-mono text-[0.7rem] text-ink">Coffee · {eur(BASE)}</motion.div>,
            )}
          </AnimatePresence>
        </div>

        <div className="grid content-start gap-3">
          <div className="rounded-xl border border-line bg-bg p-3">
            <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">drink.getDescription()</p>
            <p className="mt-1 text-sm text-ink">{description}</p>
          </div>
          <div className="rounded-xl border border-line bg-bg p-3">
            <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">drink.getCost() · chaque couche délègue à celle qu’elle enveloppe</p>
            <p className="mt-1 font-mono text-xs break-words text-ink-2">{formula}</p>
            <p className="mt-1 text-2xl font-semibold text-signal tabular-nums">{eur(cost)}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-ink-2">
        {Math.abs(reversed - cost) > 1e-9
          ? `Dans l’ordre inverse, la même boisson coûterait ${eur(reversed)} : avec une remise, l’ordre des décorateurs change le résultat.`
          : 'Ajoute une promo puis du lait (ou l’inverse) : tant qu’on ne fait qu’additionner, l’ordre des enveloppes ne change pas le prix.'}
      </p>
    </div>
  );
}
