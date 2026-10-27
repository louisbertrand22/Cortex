import { motion } from 'motion/react';
import { useState } from 'react';

// Bridge : N entités × M formats en héritage, contre N + M en composition (ACOO session 2, « Bridge »)
const entities = ['User', 'Task', 'Company', 'Product', 'Invoice', 'Order'];
const formats = ['Json', 'Xml', 'Csv', 'Yaml', 'Pdf', 'Html'];

function Stepper({ label, value, set }: { label: string; value: number; set: (n: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-ink-2">{label}</span>
      <button type="button" aria-label={`Retirer ${label}`} onClick={() => set(Math.max(1, value - 1))} disabled={value <= 1} className="size-8 rounded-lg border border-line text-ink-2 hover:border-line-strong disabled:opacity-40">−</button>
      <span className="w-6 text-center font-mono text-ink tabular-nums">{value}</span>
      <button type="button" aria-label={`Ajouter ${label}`} onClick={() => set(Math.min(6, value + 1))} disabled={value >= 6} className="size-8 rounded-lg border border-line text-ink-2 hover:border-line-strong disabled:opacity-40">+</button>
    </div>
  );
}

const Chip = ({ name, tone }: { name: string; tone: string }) => (
  <motion.li layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={`rounded-md px-1.5 py-0.5 font-mono text-[0.65rem] text-ink ${tone}`}>{name}</motion.li>
);

export default function ClassExplosionIsland() {
  const [n, setN] = useState(3);
  const [m, setM] = useState(3);
  const es = entities.slice(0, n);
  const fs = formats.slice(0, m);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Stepper label="Entités" value={n} set={setN} />
        <Stepper label="Formats" value={m} set={setM} />
        <button type="button" onClick={() => { setN(3); setM(3); }} className="rounded-xl border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-line-strong">Recommencer</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-bg p-3">
          <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Héritage · une classe par combinaison</p>
          <p className="mt-1 text-2xl font-semibold text-danger tabular-nums">{n} × {m} = {n * m} classes</p>
          <ul className="mt-3 flex flex-wrap gap-1">
            {es.flatMap((e) => fs.map((f) => <Chip key={e + f} name={`${e}${f}Exporter`} tone="bg-danger-soft" />))}
          </ul>
        </div>
        <div className="rounded-xl border border-line bg-bg p-3">
          <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Bridge · deux hiérarchies reliées par composition</p>
          <p className="mt-1 text-2xl font-semibold text-synapse tabular-nums">{n} + {m} = {n + m} classes</p>
          <p className="mt-3 text-xs text-ink-3">Abstraction raffinée (Exporter)</p>
          <ul className="mt-1 flex flex-wrap gap-1">{es.map((e) => <Chip key={e} name={`${e}Exporter`} tone="bg-signal-soft" />)}</ul>
          <p className="mt-3 text-xs text-ink-3">Implémenteur concret (IFormatter)</p>
          <ul className="mt-1 flex flex-wrap gap-1">{fs.map((f) => <Chip key={f} name={`${f}Formatter`} tone="bg-synapse-soft" />)}</ul>
        </div>
      </div>

      <p className="text-sm text-ink-2">
        Ajouter un format coûte <span className="font-semibold text-danger">{n} classes</span> en héritage, <span className="font-semibold text-synapse">une seule</span> avec le Bridge.
        {n * m - (n + m) > 0 ? ` Ici, le Bridge économise ${n * m - (n + m)} classes.` : ' Avec si peu de combinaisons, le Bridge n’économise rien : il ne se justifie que si les deux dimensions grandissent.'}
      </p>
    </div>
  );
}
