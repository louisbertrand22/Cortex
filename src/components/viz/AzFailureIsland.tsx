import { motion } from 'motion/react';
import { useState } from 'react';

// Trois topologies, calquées sur la ligne « Résilience & DRP » du modèle de maturité IaaS (session 1)
const topologies = [
  { id: 'mono', short: 'Mono-AZ', title: 'Virtual 2 Virtual', regions: [['AZ a']], note: 'Le cloud vu comme un datacenter virtuel : tout dans une AZ, DRP manuel.' },
  { id: 'dual', short: 'Multi-AZ · 1 région', title: 'Virtual 2 Cloud', regions: [['AZ a', 'AZ b']], note: 'Deux AZ derrière un load balancer : la panne d’un datacenter ne coupe pas le service.' },
  { id: 'multi', short: 'Multi-AZ · multi-région', title: 'Born 2 be Cloud', regions: [['AZ a', 'AZ b'], ['AZ a', 'AZ b']], note: 'Plusieurs régions, routées par le DNS (Route 53) : même une région entière peut tomber.' },
];

const regionNames = ['eu-west', 'us-east'];
type Fault = { kind: 'instance' | 'az' | 'region'; label: string } | null;

export default function AzFailureIsland() {
  const [t, setT] = useState(1);
  const [fault, setFault] = useState<Fault>(null);
  const T = topologies[t];

  // une instance par AZ ; la panne vise toujours la première instance / AZ / région
  const isDown = (r: number, a: number) => !!fault && r === 0 && (fault.kind === 'region' || a === 0);
  const total = T.regions.reduce((n, azs) => n + azs.length, 0);
  const up = T.regions.reduce((n, azs, r) => n + azs.filter((_, a) => !isDown(r, a)).length, 0);
  // mono-AZ : on compte deux instances dans la même AZ, donc une panne d'instance seule ne coupe pas
  const serviceUp = T.id === 'mono' ? fault === null || fault.kind === 'instance' : up > 0;

  const faults: NonNullable<Fault>[] = [
    { kind: 'instance', label: 'Panne d’une instance' },
    { kind: 'az', label: 'Panne d’une AZ (un datacenter)' },
    { kind: 'region', label: 'Panne d’une région' },
  ];
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Topologie de déploiement">
        {topologies.map((x, i) => (
          <button key={x.id} type="button" role="tab" aria-selected={t === i} onClick={() => { setT(i); setFault(null); }}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${t === i ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            {x.short}
          </button>
        ))}
      </div>
      <div className="grid gap-3 rounded-xl border border-line bg-bg p-4">
        <div className="mx-auto rounded-lg border border-line bg-surface px-3 py-1 font-mono text-xs text-ink-2">
          {T.regions.length > 1 ? 'DNS (Route 53)' : 'Load balancer (ELB)'}
        </div>
        <div className={`grid gap-3 ${T.regions.length > 1 ? 'sm:grid-cols-2' : ''}`}>
          {T.regions.map((azs, r) => {
            const regionDown = fault?.kind === 'region' && r === 0;
            return (
              <motion.div key={`${T.id}-${r}`} layout className="rounded-lg border-2 border-dashed p-3"
                animate={{ borderColor: regionDown ? 'var(--danger)' : 'var(--line-strong)' }}>
                <p className="mb-2 font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Région {regionNames[r]} {regionDown && '· ✗ hors service'}</p>
                <div className="grid grid-cols-2 gap-2">
                  {azs.map((az, a) => {
                    const azDown = isDown(r, a) && fault?.kind !== 'instance';
                    const instances = T.id === 'mono' ? 2 : 1;
                    return (
                      <div key={az} className={`rounded-md border p-2 ${T.id === 'mono' ? 'col-span-2' : ''}`}
                        style={{ borderColor: azDown ? 'var(--danger)' : 'var(--amber)', background: azDown ? 'var(--danger-soft)' : 'transparent' }}>
                        <p className="mb-1.5 text-[0.65rem] text-amber">{az}{azDown && ' · ✗'}</p>
                        <div className="flex gap-1.5">
                          {Array.from({ length: instances }).map((_, k) => {
                            const dead = azDown || (fault?.kind === 'instance' && r === 0 && a === 0 && k === 0);
                            return (
                              <motion.span key={k} animate={{ opacity: dead ? 0.45 : 1 }}
                                className="rounded px-2 py-1 font-mono text-[0.65rem]"
                                style={{ background: dead ? 'var(--danger-soft)' : 'var(--synapse-soft)', color: dead ? 'var(--danger)' : 'var(--ink-2)' }}>
                                {dead ? '✗ EC2' : 'EC2'}
                              </motion.span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {faults.map((f) => (
          <button key={f.kind} type="button" onClick={() => setFault(f)}
            className={`rounded-xl border px-3 py-1.5 text-sm ${fault?.kind === f.kind ? 'border-danger bg-danger-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            {f.label}
          </button>
        ))}
        <button type="button" onClick={() => setFault(null)} className="rounded-xl bg-ink px-3 py-1.5 text-sm font-medium text-bg">Recommencer</button>
      </div>
      <div>
        <p className={`text-base font-semibold ${serviceUp ? 'text-synapse' : 'text-danger'}`}>
          {fault === null ? '✓ Service nominal' : serviceUp ? `✓ Le service tient · ${fault.label.toLowerCase()}` : `✗ Service coupé · ${fault.label.toLowerCase()}`}
        </p>
        <p className="mt-1 text-sm text-ink-2"><span className="font-medium text-ink">{T.title}.</span> {T.note}</p>
        {fault && T.id !== 'mono' && <p className="mt-1 text-xs text-ink-3">{up} emplacement{up > 1 ? 's' : ''} sur {total} encore actif{up > 1 ? 's' : ''}.</p>}
      </div>
    </div>
  );
}
