import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

const T = {
  mat: '… Pendant le congé maternité, vous conservez tous vos avantages contractuels et continuez d’acquérir des congés payés.',
  h1: '## Congé de naissance',
  rule: 'Règle — À la naissance de votre enfant, vous avez droit à 20 jours ouvrés de congé de naissance à plein salaire, que vous ayez accouché ou non. À prendre dans les six mois, en un bloc ou en trois blocs d’au moins cinq jours.',
  exc: 'Exception — Si vous avez rejoint l’entreprise moins de six mois avant la naissance, seuls 5 des 20 jours sont payés ; les 15 autres ne le sont pas.',
  twins: 'Pour des jumeaux ou plus, ajoutez cinq jours ouvrés.',
  h2: '## Congé d’adoption',
  ado: 'Si vous adoptez un enfant, l’adoptant principal a droit au même congé que le congé maternité …',
};
type Chunk = { id: string; rank: number; score: number; text: string[]; prefix?: string; key?: 'rule' | 'exc' | 'both' };
type Strat = { id: string; name: string; how: string; total: number; chunks: Chunk[]; ok: boolean; outcome: string };

const strats: Strat[] = [
  { id: 'fixed', name: 'Taille fixe', how: 'Tous les 500 caractères, où que ça tombe.', total: 30, ok: false,
    outcome: 'Top 1 seul : « Il n’y a aucune exception mentionnée [birth-leave#2]. » Faux pour un nouvel arrivant — et la source citée n’existe pas.',
    chunks: [
      { id: 'parental-leave#2', rank: 1, score: 0.824, key: 'rule', text: [T.mat, T.h1, T.rule, 'Exception — Si vous avez rejoint l’entre'] },
      { id: 'parental-leave#3', rank: 2, score: 0.771, key: 'exc', text: ['prise moins de six mois avant la naissance, seuls 5 des 20 jours sont payés ; les 15 autres ne le sont pas.', T.twins, T.h2, T.ado] },
    ] },
  { id: 'recursive', name: 'Récursif', how: '500 caractères max, coupe d’abord au paragraphe, sinon à la ligne, la phrase, le mot.', total: 33, ok: true,
    outcome: 'Top 1 seul : la réponse complète, exception comprise. Mais le titre « Congé de naissance » a fini dans le chunk précédent.',
    chunks: [
      { id: 'parental-leave#2', rank: 3, score: 0.75, text: [T.mat, T.h1] },
      { id: 'parental-leave#3', rank: 1, score: 0.814, key: 'both', text: [T.rule, T.exc, T.twins] },
      { id: 'parental-leave#4', rank: 2, score: 0.769, text: [T.h2, T.ado] },
    ] },
  { id: 'semantic', name: 'Sémantique', how: 'Coupe entre deux phrases dont le sens s’éloigne.', total: 41, ok: false,
    outcome: 'L’exception se retrouve seule (150 caractères), rien n’y dit qu’elle parle du congé de naissance. Le rang 1 va à « jumeaux… », qui ne contient ni la règle ni l’exception → « Unknown ».',
    chunks: [
      { id: 'parental-leave#2', rank: 2, score: 0.763, key: 'rule', text: [T.mat, T.h1, T.rule] },
      { id: 'parental-leave#3', rank: 3, score: 0.726, key: 'exc', text: [T.exc] },
      { id: 'parental-leave#4', rank: 1, score: 0.77, text: [T.twins, T.h2, T.ado] },
    ] },
  { id: 'structure', name: 'Structure du document', how: 'Un chunk par titre.', total: 55, ok: true,
    outcome: '« Congé de naissance » devient un chunk sous son propre titre : règle et exception restent ensemble, rang 1.',
    chunks: [
      { id: 'parental-leave#2', rank: 4, score: 0.741, text: [T.mat] },
      { id: 'parental-leave#3', rank: 1, score: 0.827, key: 'both', text: [T.h1, T.rule, T.exc, T.twins] },
      { id: 'parental-leave#4', rank: 6, score: 0.7, text: [T.h2, T.ado] },
    ] },
  { id: 'llm', name: 'Par LLM', how: 'Un modèle génératif lit le texte et choisit où chaque passage commence ; le texte reste mot pour mot.', total: 63, ok: true,
    outcome: 'Ici, il coupe exactement aux titres (comme « structure »). Sur tout le livret, il coupe plus fin : 63 chunks contre 55. Plus cher à l’indexation.',
    chunks: [
      { id: 'parental-leave#2', rank: 4, score: 0.741, text: [T.mat] },
      { id: 'parental-leave#3', rank: 1, score: 0.827, key: 'both', text: [T.h1, T.rule, T.exc, T.twins] },
      { id: 'parental-leave#4', rank: 6, score: 0.7, text: [T.h2, T.ado] },
    ] },
  { id: 'context', name: 'Sémantique + préfixe', how: 'Avant l’embedding, chaque chunk reçoit un préfixe : document > section > dernier titre au-dessus.', total: 41, ok: true,
    outcome: 'L’exception dit désormais d’où elle vient : elle passe du rang 3 (0,726) au rang 1 (0,802). Réponse complète depuis un chunk de 150 caractères.',
    chunks: [
      { id: 'parental-leave#2', rank: 3, score: 0.773, key: 'rule', prefix: 'Livret salarié > Congé parental', text: [T.mat, T.h1, T.rule] },
      { id: 'parental-leave#3', rank: 1, score: 0.802, key: 'exc', prefix: 'Livret salarié > Congé parental > Congé de naissance', text: [T.exc] },
      { id: 'parental-leave#4', rank: 2, score: 0.776, prefix: 'Livret salarié > Congé parental > Congé de naissance', text: [T.twins, T.h2, T.ado] },
    ] },
];

const colors = ['var(--signal)', 'var(--synapse)', 'var(--amber)', 'var(--info)'];

export default function ChunkingIsland() {
  const [s, setS] = useState(0);
  const st = strats[s];
  return (
    <div className="grid gap-4">
      <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm text-ink-2">Question : <strong className="text-ink">« Combien de jours de congé ai-je à la naissance de mon enfant ? »</strong> — il faut <em>deux</em> phrases : la règle et son exception.</p>
      <div className="flex flex-wrap gap-2" role="tablist">
        {strats.map((x, i) => (
          <button key={x.id} type="button" role="tab" aria-selected={s === i} onClick={() => setS(i)} className={`rounded-lg border px-3 py-1.5 text-sm ${s === i ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>{x.name}</button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={st.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="grid gap-3">
          <p className="text-sm text-ink-2"><span className="font-semibold text-ink">Comment ça coupe :</span> {st.how} <span className="font-mono text-xs text-ink-3">· livret : {st.total} chunks</span></p>
          {st.chunks.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="rounded-xl border bg-bg p-3 text-[0.85rem] leading-relaxed" style={{ borderColor: c.rank === 1 ? 'var(--signal)' : 'var(--line)', borderLeft: `4px solid ${colors[i]}` }}>
              <div className="mb-1.5 flex flex-wrap items-center gap-2 font-mono text-[0.7rem]">
                <span className="text-ink-3">{c.id}</span>
                <span className={`rounded px-1.5 py-0.5 ${c.rank === 1 ? 'bg-signal text-bg' : 'bg-surface-2 text-ink-2'}`}>rang {c.rank}</span>
                <span className="text-ink-2">{c.score.toFixed(3)}</span>
                {c.key && <span className="ml-auto text-synapse">{c.key === 'both' ? 'règle + exception' : c.key === 'rule' ? 'règle' : 'exception'}</span>}
              </div>
              {c.prefix && <p className="mb-1 font-mono text-[0.7rem] text-synapse">{c.prefix}</p>}
              {c.text.map((t, k) => <p key={k} className={t.startsWith('##') ? 'font-semibold text-ink' : 'text-ink-2'}>{t.replace(/^## /, '')}</p>)}
            </motion.div>
          ))}
          <p className={`rounded-lg border px-3 py-2 text-sm ${st.ok ? 'border-synapse/40 bg-synapse-soft' : 'border-danger/40 bg-danger-soft'} text-ink`}>
            <span className="font-semibold">{st.ok ? '✓ ' : '✕ '}</span>{st.outcome}
          </p>
        </motion.div>
      </AnimatePresence>
      <p className="text-xs text-ink-3">Scores mesurés dans le cours (nomic-embed-text + qwen3:4b-instruct, livret fictif en anglais, traduit ici). Avec un top 3, toutes les stratégies récupèrent l’exception sur ce petit livret : la coupe se voit dans les rangs et dans ce que donne le top 1 seul.</p>
    </div>
  );
}
