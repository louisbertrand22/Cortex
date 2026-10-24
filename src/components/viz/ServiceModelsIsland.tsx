import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

// Les neuf couches du schéma « Packaged Software / IaaS / PaaS / SaaS » du support (session 1)
const layers = ['Applications', 'Data', 'Runtime', 'Middleware', 'O/S', 'Virtualization', 'Servers', 'Storage', 'Networking'];

const models = [
  { id: 'onprem', short: 'On-premise', title: 'Packaged Software', verb: 'Tu héberges', provider: 0, ex: 'Ton datacenter, tes serveurs, ton hyperviseur : tout est à toi, y compris les pannes.', pay: 'Achat du matériel et des licences' },
  { id: 'iaas', short: 'IaaS', title: 'Infrastructure as a Service', verb: 'Host', provider: 5, ex: 'AWS EC2, Azure VM, OpenStack, VMware : tu reçois une machine (une « instance ») et un réseau, tu installes le reste.', pay: 'À l’heure d’instance, au Go stocké' },
  { id: 'paas', short: 'PaaS', title: 'Platform as a Service', verb: 'Build', provider: 7, ex: 'xPaaS : une base de données managée (AWS RDS, Azure SQL). aPaaS : OpenShift, Google App Engine, tu pousses ton code.', pay: 'À l’instance de base, à la requête' },
  { id: 'saas', short: 'SaaS', title: 'Software as a Service', verb: 'Consume', provider: 9, ex: 'Office 365, Gmail, Salesforce, la paie : tu utilises l’application, rien de plus.', pay: 'À l’utilisateur' },
];

export default function ServiceModelsIsland() {
  const [m, setM] = useState(1);
  const M = models[m];
  // les `provider` couches du bas sont gérées par le fournisseur
  const byProvider = (i: number) => i >= layers.length - M.provider;
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Modèle de service">
        {models.map((x, i) => (
          <button key={x.id} type="button" role="tab" aria-selected={m === i} onClick={() => setM(i)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${m === i ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            {x.short}
          </button>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-[minmax(0,15rem)_1fr]">
        <div className="grid gap-1 rounded-xl border border-line bg-bg p-3">
          {layers.map((l, i) => {
            const prov = byProvider(i);
            return (
              <motion.div key={l} layout className="flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs"
                animate={{ backgroundColor: prov ? 'var(--surface-2)' : 'var(--signal-soft)', borderColor: prov ? 'var(--line)' : 'var(--signal)' }}
                transition={{ duration: 0.3, delay: (layers.length - i) * 0.03 }}>
                <span className={prov ? 'text-ink-3' : 'font-medium text-ink'}>{l}</span>
                <span className={`font-mono text-[0.65rem] ${prov ? 'text-ink-3' : 'text-signal'}`}>{prov ? 'fournisseur' : 'toi'}</span>
              </motion.div>
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={m} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <p className="font-mono text-xs tracking-widest text-signal uppercase">{M.verb}</p>
            <p className="mt-1 text-lg font-semibold text-ink">{M.title}</p>
            <p className="mt-2 text-sm text-ink-2">{M.ex}</p>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-ink-3">Tu gères</dt>
              <dd className="font-medium text-ink">{layers.length - M.provider} couche{layers.length - M.provider > 1 ? 's' : ''} sur {layers.length}</dd>
              <dt className="text-ink-3">Facturation</dt>
              <dd className="text-ink">{M.pay}</dd>
            </dl>
            <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden>
              <motion.div className="h-full bg-signal" animate={{ width: `${((layers.length - M.provider) / layers.length) * 100}%` }} transition={{ type: 'spring', stiffness: 140, damping: 22 }} />
            </div>
            <p className="mt-1.5 text-xs text-ink-3">Plus tu montes, moins tu gères… et moins tu choisis.</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
