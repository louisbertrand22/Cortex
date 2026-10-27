import { motion } from 'motion/react';
import { useState } from 'react';

// Les quatre styles d'API et le choix selon le consommateur ou l'opération
// (ARLA session 3, « Types d'API », « Même besoin, 4 façons de l'exprimer », « Pas de "meilleur style" »)
type S = 'REST' | 'GraphQL' | 'POST Action' | 'gRPC';
const styles: Record<S, { contrat: string; transport: string; usage: string; origine: string; principe: string; code: string; forts: string[]; limites: string[]; verdict: string }> = {
  REST: {
    contrat: 'OpenAPI', transport: 'HTTP + JSON', usage: 'APIs publiques, CRUD', origine: 'Roy Fielding, 2000',
    principe: 'Tout est ressource, identifiée par une URL, manipulée avec les verbes HTTP ; le serveur répond avec des codes de statut standards. Chaque requête est stateless : elle porte tout son contexte.',
    code: 'GET /orders/42\nGET /orders/42/items',
    forts: ['Cache HTTP natif (GET, ETag, CDN)', 'Standard, universel et « discoverable »', 'Outillage mature : OpenAPI, curl, navigateur'],
    limites: ['Over-fetching / under-fetching', 'Multiples allers-retours pour agréger', 'Actions non-CRUD difficiles à modéliser'],
    verdict: 'Le choix par défaut pour une API publique orientée ressources.',
  },
  GraphQL: {
    contrat: 'Schéma SDL', transport: 'HTTP + JSON, endpoint unique', usage: 'Front web & mobile, BFF', origine: 'Facebook, 2012',
    principe: 'Le client décrit exactement les champs qu’il veut ; le serveur expose un schéma typé sur un endpoint unique (POST /graphql). Lectures = queries, écritures = mutations, temps réel = subscriptions.',
    code: 'query {\n  order(id: 42) {\n    id status items { id sku qty }\n  }\n}',
    forts: ['Données exactes : ni trop, ni trop peu', '1 seul aller-retour pour plusieurs ressources', 'Schéma typé et introspection'],
    limites: ['Pas de cache HTTP natif (tout en POST)', 'Complexité N+1 côté serveur', 'Coût des requêtes à maîtriser (profondeur)'],
    verdict: 'Quand plusieurs clients (web, mobile) ont des besoins de données différents.',
  },
  'POST Action': {
    contrat: 'OpenAPI, sémantique RPC', transport: 'HTTP POST + JSON', usage: 'Actions métier non-CRUD', origine: 'Ex. : API web de Slack',
    principe: 'On expose des actions nommées, pas des ressources : un endpoint = un verbe métier, appelé en POST avec ses paramètres dans le body. Du RPC sur HTTP, documenté en OpenAPI.',
    code: 'POST /getOrderDetails\n{ "orderId": 42 }',
    forts: ['Simple à concevoir et à comprendre', 'Colle aux intentions métier', 'Pas de débat sur le « bon » verbe HTTP'],
    limites: ['Perd le cache HTTP', 'Perd l’idempotence implicite des verbes', 'Peu standardisé : chaque API a ses conventions'],
    verdict: 'Quand l’opération est une action métier qui ne rentre pas dans le CRUD.',
  },
  gRPC: {
    contrat: 'Fichier .proto', transport: 'HTTP/2 + Protobuf (binaire)', usage: 'Service à service', origine: 'Google, 2015',
    principe: 'On appelle une fonction distante comme une fonction locale. Le .proto génère client et serveur dans chaque langage ; les messages voyagent en binaire sur HTTP/2, avec streaming dans les deux sens.',
    code: 'service OrderService {\n  rpc GetOrder (GetOrderRequest)\n    returns (Order);\n}',
    forts: ['Haute performance (binaire, HTTP/2)', 'Typage fort, code généré', 'Streaming bidirectionnel natif'],
    limites: ['Peu lisible, peu débogable (binaire)', 'Support web limité (gRPC-Web + proxy)', 'Couplage fort au .proto et à son outillage'],
    verdict: 'Pour la communication interne entre services, quand la performance compte.',
  },
};
const situations: { group: string; label: string; style: S }[] = [
  { group: 'Qui consomme ?', label: 'Un navigateur ou une app mobile', style: 'GraphQL' },
  { group: 'Qui consomme ?', label: 'Un partenaire externe', style: 'REST' },
  { group: 'Qui consomme ?', label: 'Un autre service interne', style: 'gRPC' },
  { group: 'Qui consomme ?', label: 'Un agent IA', style: 'POST Action' },
  { group: 'Quelle opération ?', label: 'Une lecture flexible', style: 'GraphQL' },
  { group: 'Quelle opération ?', label: 'Une action métier', style: 'POST Action' },
  { group: 'Quelle opération ?', label: 'Une communication interne à basse latence', style: 'gRPC' },
];
const names = Object.keys(styles) as S[];

export default function ApiStylesIsland() {
  const [style, setStyle] = useState<S>('REST');
  const [sit, setSit] = useState<number | null>(1);
  const s = styles[style];

  return (
    <div className="grid gap-5">
      {(['Qui consomme ?', 'Quelle opération ?'] as const).map((g) => (
        <div key={g} className="grid gap-2">
          <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">{g}</p>
          <div className="flex flex-wrap gap-2">
            {situations.map((x, i) => x.group === g && (
              <button key={x.label} type="button" aria-pressed={sit === i} onClick={() => { setSit(i); setStyle(x.style); }}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${sit === i ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
                {x.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-2 border-t border-line pt-4" role="tablist" aria-label="Style d'API">
        {names.map((n) => (
          <button key={n} type="button" role="tab" aria-selected={style === n} onClick={() => { setStyle(n); setSit(null); }}
            className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${style === n ? 'border-ink bg-ink text-bg' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            {n}
          </button>
        ))}
      </div>

      <motion.div key={style} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 rounded-xl border border-line bg-bg p-4">
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([['Contrat', s.contrat], ['Transport', s.transport], ['Usage principal', s.usage], ['Origine', s.origine]] as const).map(([k, v]) => (
            <div key={k} className="rounded-lg bg-surface-2 px-3 py-2">
              <dt className="text-[0.65rem] text-ink-3">{k}</dt>
              <dd className="text-sm font-medium text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="grid gap-4 sm:grid-cols-2">
          <p className="text-sm text-ink-2">{s.principe}</p>
          <pre className="overflow-x-auto rounded-lg bg-surface-2 p-3 font-mono text-xs text-ink">{s.code}</pre>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ul className="grid gap-1 rounded-lg bg-synapse-soft p-3 text-sm text-ink">
            <li className="text-xs font-semibold text-synapse">+ Points forts</li>
            {s.forts.map((f) => <li key={f}>{f}</li>)}
          </ul>
          <ul className="grid gap-1 rounded-lg bg-danger-soft p-3 text-sm text-ink">
            <li className="text-xs font-semibold text-danger">− Limites</li>
            {s.limites.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
        <p className="text-sm font-medium text-ink">→ {s.verdict}</p>
      </motion.div>
      <p className="text-sm text-ink-2">En pratique, une même plateforme combine souvent plusieurs styles : REST en public, gRPC en interne.</p>
    </div>
  );
}
