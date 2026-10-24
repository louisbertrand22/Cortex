import { motion } from 'motion/react';
import { useState } from 'react';

// Les cinq points d'intégration d'une application (UBSI session 3, « Cadre général d'intégration »)
const tiers = [
  {
    id: 'manuel', short: 'Manuel', layer: 'Utilisateur',
    def: 'Un utilisateur intervient dans la transmission des informations entre deux applications.',
    plus: ['Rapidité d’implémentation', 'Souplesse pour des processus complexes'],
    minus: ['Sécurité', 'Contrôles de cohérence des données', 'Pertes de données'],
    out: ['Lecture visuelle', 'Extraction / export de fichiers'],
    in: ['Saisie manuelle dans les écrans', 'Chargement / import de fichiers'],
  },
  {
    id: 'ihm', short: 'IHM', layer: 'IHM',
    def: 'Une application s’appuie sur l’IHM existante d’une autre, ou intègre directement son IHM avec les services de cette autre application.',
    plus: ['Découplage fonctionnel des règles de gestion', 'Moins d’échanges et de copies de données', 'Vitesse de mise en œuvre', 'Performance'],
    minus: ['Sécurité', 'Cohérence visuelle et ergonomie', 'Contraintes techniques selon les modalités', 'Passage de contexte et cohérence du parcours'],
    out: ['Exposition d’URL, de pages, de portlets', 'Exposition de fragments d’IHM', 'Post IHM'],
    in: ['Redirection d’URL', 'iFrame', 'Widget / portlet', 'Intégration de fragments d’IHM', 'Appel de service'],
  },
  {
    id: 'as', short: 'AS', layer: 'AS',
    def: 'Une application s’appuie sur son serveur d’application pour s’intégrer.',
    plus: ['Tiers naturel pour porter le service'],
    minus: ['Propagation de l’identité du tiers à l’origine'],
    out: ['Exposition de (web) services', 'Envoi de messages', 'Envoi de fichiers', 'Intégration directe dans la base cible'],
    in: ['Consommation de (web) services', 'Réception de messages', 'Réception de fichiers', 'Extraction directe depuis la base source'],
  },
  {
    id: 'batch', short: 'Batch', layer: 'Batch',
    def: 'Une application s’appuie sur des traitements batch pour s’intégrer.',
    plus: ['Tiers naturel pour porter des traitements de masse'],
    minus: ['Inadapté aux traitements synchrones et aux messages unitaires rapides'],
    out: ['Envoi de messages', 'Envoi de fichiers', 'Export direct vers la base cible'],
    in: ['Réception de messages', 'Réception de fichiers', 'Import direct depuis la base source'],
  },
  {
    id: 'bd', short: 'Base de données', layer: 'Base de données',
    def: 'Une application s’appuie sur l’accès (direct) à sa base de données pour s’intégrer.',
    plus: ['Interface d’accès normalisée et « naturelle » (SQL)'],
    minus: ['L’AS et l’IHM ne « voient » pas ce qui se passe dans la base', 'Expose le modèle de données aux partenaires', 'Impose des mécanismes de sécurité base de données'],
    out: ['Accès direct aux tables', 'Accès via des vues', 'Tables d’interface de sortie'],
    in: ['Accès direct aux tables', 'Accès via des vues', 'Tables d’interface d’entrée'],
  },
];

const stack = ['Utilisateur', 'IHM', 'AS', 'Batch', 'Base de données'];

function List({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <div className="grid content-start gap-1.5">
      <p className="font-mono text-[0.65rem] tracking-wider uppercase" style={{ color: tone }}>{title}</p>
      <ul className="grid gap-1 text-sm text-ink-2">
        {items.map((x) => <li key={x} className="flex gap-1.5"><span aria-hidden style={{ color: tone }}>•</span>{x}</li>)}
      </ul>
    </div>
  );
}

export default function IntegrationTiersIsland() {
  const [t, setT] = useState(2);
  const T = tiers[t];
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Point d’intégration">
        {tiers.map((x, i) => (
          <button key={x.id} type="button" role="tab" aria-selected={t === i} onClick={() => setT(i)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${t === i ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            {x.short}
          </button>
        ))}
      </div>
      <div className="grid gap-4 rounded-xl border border-line bg-bg p-4 sm:grid-cols-[9rem_1fr]">
        <div className="grid content-start gap-1.5" aria-label="Architecture générique d’une application">
          {stack.map((s) => {
            const on = s === T.layer;
            return (
              <motion.div key={s} animate={{ scale: on ? 1.04 : 1 }}
                className="rounded-md border px-2 py-1 text-center font-mono text-[0.7rem]"
                style={{ borderColor: on ? 'var(--signal)' : 'var(--line)', background: on ? 'var(--signal-soft)' : 'transparent', color: on ? 'var(--ink)' : 'var(--ink-3)' }}>
                {on ? '▸ ' : ''}{s}
              </motion.div>
            );
          })}
        </div>
        <motion.div key={T.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="grid gap-4">
          <p className="text-sm text-ink"><span className="font-semibold">Intégration {T.short === 'Manuel' ? 'manuelle' : `par ${T.short === 'Base de données' ? 'la base de données' : T.short === 'Batch' ? 'le batch' : `l’${T.short}`}`}.</span> {T.def}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <List title="Motivations" items={T.plus} tone="var(--synapse)" />
            <List title="Freins / limites" items={T.minus} tone="var(--danger)" />
            <List title="Mécanismes de sortie" items={T.out} tone="var(--signal)" />
            <List title="Mécanismes d’entrée" items={T.in} tone="var(--amber)" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
