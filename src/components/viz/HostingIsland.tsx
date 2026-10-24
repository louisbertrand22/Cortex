import { motion } from 'motion/react';
import { useMemo, useState } from 'react';

type Pos = { id: string; short: string; title: string; sub?: string; gpus: string; crosses: string; pay: string; ex: string; line: number };
// line = position de la frontière (0 = tout à l'extérieur, 1 = tout chez soi)
const positions: Pos[] = [
  { id: '1', short: '1', title: 'API publique', gpus: 'Ceux du fournisseur, pour tous ses clients', crosses: 'Prompt et documents', pay: 'Au token', ex: 'OpenAI, Anthropic, Google, Mistral, DeepSeek (traité en Chine, droit chinois). Catalogues : Amazon Bedrock, Google Vertex AI, Microsoft Foundry.', line: 0.62 },
  { id: '2a', short: '2 · Région', title: 'Cloud dédié — région choisie', gpus: 'Ceux du cloud, partagés, dans cette région', crosses: 'Prompt et documents, gardés dans la région', pay: 'Au token', ex: 'Azure Data Zone EU, profil EU d’Amazon Bedrock.', line: 0.5 },
  { id: '2b', short: '2 · Réservé', title: 'Cloud dédié — capacité réservée', gpus: 'Ceux du cloud, réservés à ton entreprise', crosses: 'Prompt et documents, vers ta capacité réservée', pay: 'La capacité, utilisée ou non', ex: 'Azure Provisioned Throughput, Amazon Bedrock Provisioned Throughput.', line: 0.42 },
  { id: '2c', short: '2 · SecNumCloud', title: 'Cloud qualifié SecNumCloud', gpus: 'Ceux d’un opérateur qualifié', crosses: 'Prompt et documents, vers l’opérateur qualifié', pay: 'Au token ou à l’heure GPU', ex: 'Outscale et Cloud Temple proposent des modèles. S3NS est qualifié, mais son IA générative n’est pas dans le périmètre.', line: 0.34 },
  { id: '3', short: '3', title: 'GPU internes', gpus: 'Les tiens', crosses: 'Rien', pay: 'Investissement initial, puis coûts de fonctionnement', ex: 'BNP Paribas, dans ses propres datacenters.', line: 0.04 },
];

const constraints = [
  { id: 'perso', label: 'Données personnelles', rule: 'RGPD : région UE + accord de traitement (DPA)', min: 1 },
  { id: 'health', label: 'Données de santé', rule: 'HDS : hébergeur certifié HDS dans l’EEE', min: 1, hds: true },
  { id: 'state', label: 'Opérateur de l’État, données sensibles', rule: 'SREN art. 31 : cloud qualifié SecNumCloud', min: 3 },
  { id: 'never', label: 'Ne doit jamais sortir (défense, secret stratégique)', rule: 'Ta politique de sécurité : une contrainte, pas une économie', min: 4 },
];

export default function HostingIsland() {
  const [checked, setChecked] = useState<string[]>([]);
  const [manual, setManual] = useState<number | null>(null);
  const required = useMemo(() => Math.max(0, ...constraints.filter((c) => checked.includes(c.id)).map((c) => c.min)), [checked]);
  const idx = manual !== null && manual >= required ? manual : required;
  const p = positions[idx];
  const hds = checked.includes('health');
  return (
    <div className="grid gap-5">
      <div className="relative h-36 overflow-hidden rounded-xl border border-line bg-bg">
        <motion.div className="absolute inset-y-0 left-0 bg-surface-2" animate={{ width: `${p.line * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
        <motion.div className="absolute inset-y-0 w-0.5 bg-amber" animate={{ left: `${p.line * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }}>
          <span className="absolute top-2 left-2 font-mono text-[0.65rem] whitespace-nowrap text-amber uppercase">la ligne</span>
        </motion.div>
        <span className="absolute bottom-2 left-3 font-mono text-[0.65rem] text-ink-3 uppercase">Extérieur</span>
        <span className="absolute right-3 bottom-2 font-mono text-[0.65rem] text-ink-3 uppercase">Ton entreprise</span>
        <motion.div className="absolute top-1/2 -translate-y-1/2 rounded-lg border border-signal bg-signal-soft px-3 py-2 text-xs" animate={{ left: idx === 4 ? '58%' : `${Math.max(2, p.line * 100 - 28)}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }}>
          <p className="font-semibold text-ink">Modèle · GPU</p>
          <p className="text-ink-3">{idx === 0 ? '+ autres clients' : idx === 1 ? 'région UE · autres clients' : idx === 2 ? 'réservé pour toi' : idx === 3 ? 'opérateur qualifié' : 'dans tes murs'}</p>
        </motion.div>
        <div className="absolute top-1/2 right-4 -translate-y-1/2 rounded-lg border border-line-strong bg-surface px-3 py-2 text-xs">
          <p className="font-semibold text-ink">Assistant maintenance</p><p className="text-ink-3">prompt + manuels</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {positions.map((q, i) => (
          <button key={q.id} type="button" disabled={i < required} onClick={() => setManual(i)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${idx === i ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>{q.short}</button>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <p className="text-lg font-semibold text-ink">{p.title}{hds && idx < 4 && <span className="ml-2 rounded bg-amber-soft px-1.5 py-0.5 align-middle font-mono text-xs text-amber">+ HDS</span>}</p>
          <dl className="mt-3 grid gap-2 text-sm">
            <div><dt className="text-xs text-ink-3">Qui opère les GPU</dt><dd className="text-ink">{p.gpus}</dd></div>
            <div><dt className="text-xs text-ink-3">Ce qui traverse la ligne</dt><dd className="text-ink">{p.crosses}</dd></div>
            <div><dt className="text-xs text-ink-3">Comment tu paies</dt><dd className="text-ink">{p.pay}</dd></div>
            <div><dt className="text-xs text-ink-3">Exemples</dt><dd className="text-ink-2">{p.ex}</dd></div>
          </dl>
        </div>
        <fieldset className="rounded-xl border border-line bg-bg p-4">
          <legend className="px-1 text-xs font-semibold tracking-wide text-ink uppercase">Contraintes de ton cas d’usage</legend>
          <div className="grid gap-2.5">
            {constraints.map((c) => (
              <label key={c.id} className="flex cursor-pointer gap-2.5 text-sm">
                <input type="checkbox" className="mt-1 accent-[var(--signal)]" checked={checked.includes(c.id)} onChange={(e) => { setManual(null); setChecked((x) => (e.target.checked ? [...x, c.id] : x.filter((y) => y !== c.id))); }} />
                <span><span className="text-ink">{c.label}</span><br /><span className="text-xs text-ink-3">{c.rule}</span></span>
              </label>
            ))}
          </div>
          <p className="mt-3 border-t border-line pt-3 text-xs text-ink-3">Plusieurs lignes s’appliquent ? <strong className="text-ink">La plus stricte fixe la ligne.</strong> Grille de lecture, pas un avis juridique.</p>
        </fieldset>
      </div>
    </div>
  );
}
