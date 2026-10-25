import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

/** Itérer sur une réponse : chaque relance garde ce qui précède et corrige un défaut de la réponse. */
type Id = 'short' | 'table' | 'example' | 'quiz';
const asks: { id: Id; text: string }[] = [
  { id: 'short', text: 'Trop long : fais-moi ça en 4 lignes maximum.' },
  { id: 'table', text: 'Mets les dates clés dans un tableau.' },
  { id: 'example', text: 'Ajoute un exemple concret : ce que vivait un paysan.' },
  { id: 'quiz', text: 'Termine par 3 questions pour me tester, sans les réponses.' },
];
const FIRST = 'Fais-moi une fiche de révision sur la Révolution française.';

const LONG = 'La Révolution française est une période de bouleversements politiques et sociaux qui commence en France en 1789. Elle trouve ses origines dans une grave crise financière du royaume, dans les inégalités entre les trois ordres (clergé, noblesse, tiers état) et dans la diffusion des idées des Lumières, qui remettent en cause le pouvoir absolu du roi. Elle conduit à l’abolition des privilèges, à la Déclaration des droits de l’homme et du citoyen, puis à la fin de la monarchie et à la proclamation de la République. Elle traverse ensuite des périodes de guerre et de violence, comme la Terreur, avant de s’achever avec la prise de pouvoir de Napoléon Bonaparte en 1799. Son héritage est immense : les idées de liberté, d’égalité et de souveraineté du peuple…';
const SHORT = [
  'Causes : crise financière, inégalités entre les trois ordres, idées des Lumières.',
  '1789 : le peuple se révolte, les privilèges sont abolis, les droits de l’homme proclamés.',
  '1792 : fin de la monarchie, la France devient une République.',
  '1799 : Bonaparte prend le pouvoir, la Révolution s’achève.',
];
const DATES = [
  ['5 mai 1789', 'Ouverture des États généraux'],
  ['14 juillet 1789', 'Prise de la Bastille'],
  ['4 août 1789', 'Abolition des privilèges'],
  ['26 août 1789', 'Déclaration des droits de l’homme et du citoyen'],
  ['septembre 1792', 'Fin de la monarchie, proclamation de la République'],
  ['novembre 1799', 'Coup d’État de Bonaparte'],
];
const EXAMPLE = 'Exemple : en 1789, un paysan paie des impôts au roi, la dîme à l’Église et des droits à son seigneur, alors que les nobles échappent à une grande partie de ces impôts. Cette injustice explique une partie de la colère.';
const QUIZ = ['Quels sont les trois ordres de la société avant 1789 ?', 'Que se passe-t-il le 14 juillet 1789 ?', 'En quelle année la France devient-elle une République ?'];
const FEEDBACK: Record<Id, string> = {
  short: 'Réponse courte : facile à relire la veille du contrôle.',
  table: 'Les dates sont rangées : tu les retiens d’un coup d’œil.',
  example: 'Un exemple concret : l’idée abstraite devient une image.',
  quiz: 'Tu t’entraînes au lieu de seulement lire.',
};

export default function RefineIsland() {
  const [done, setDone] = useState<Id[]>([]);
  const has = (id: Id) => done.includes(id);
  const add = (id: Id) => setDone((d) => (d.includes(id) ? d : [...d, id]));

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]">
      <div className="grid content-start gap-3">
        <div className="grid gap-2 text-sm">
          <p className="justify-self-end rounded-xl rounded-br-sm bg-ink px-3 py-2 text-bg">{FIRST}</p>
          <AnimatePresence initial={false}>
            {done.map((id) => (
              <motion.p key={id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="justify-self-end rounded-xl rounded-br-sm bg-ink px-3 py-2 text-bg">
                {asks.find((a) => a.id === id)!.text}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>
        <p className="mt-2 text-xs text-ink-3">Relance la conversation :</p>
        {asks.map((a) => (
          <button key={a.id} type="button" disabled={has(a.id)} onClick={() => add(a.id)} aria-pressed={has(a.id)}
            className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${has(a.id) ? 'border-line bg-surface-2 text-ink-3' : 'border-line bg-surface text-ink-2 hover:border-signal'}`}>
            {has(a.id) ? '✓ ' : '+ '}{a.text}
          </button>
        ))}
        <button type="button" onClick={() => setDone([])} className="justify-self-start rounded-xl bg-ink px-3 py-1.5 text-sm font-medium text-bg">Recommencer</button>
      </div>

      <div className="grid content-start gap-3">
        <motion.div key={done.join('-')} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="grid gap-3 rounded-xl border border-line bg-bg p-4 text-[0.9375rem] leading-relaxed text-ink">
          <p className="font-mono text-xs text-ink-3">réponse de l’IA · version {done.length + 1}</p>
          {!has('short') && !has('table') && <p>{LONG}</p>}
          {has('short') && !has('table') && <ul className="grid gap-1">{SHORT.map((s) => <li key={s}>• {s}</li>)}</ul>}
          {has('short') && has('table') && <p>Causes : crise financière, inégalités entre les trois ordres, idées des Lumières.</p>}
          {!has('short') && has('table') && <p>La Révolution française (1789-1799) met fin à la monarchie absolue. Elle naît d’une crise financière, des inégalités entre les trois ordres et des idées des Lumières.</p>}
          {has('table') && (
            <table className="w-full text-sm">
              <tbody>
                {DATES.map(([d, e]) => (
                  <tr key={d} className="border-t border-line">
                    <td className="py-1 pr-3 font-mono text-xs whitespace-nowrap text-signal">{d}</td>
                    <td className="py-1 text-ink-2">{e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {has('example') && <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm text-ink-2">{EXAMPLE}</p>}
          {has('quiz') && (
            <div className="text-sm">
              <p className="font-semibold">Teste-toi :</p>
              <ol className="mt-1 grid gap-0.5 text-ink-2">{QUIZ.map((q, i) => <li key={q}>{i + 1}. {q}</li>)}</ol>
            </div>
          )}
        </motion.div>
        <ul className="grid gap-1.5 text-sm">
          {done.length === 0 && <li className="rounded-lg border border-line bg-surface px-3 py-2 text-ink-2">Première réponse : correcte, mais un pavé difficile à réviser. Pas besoin de tout réécrire : dis-lui ce qui ne va pas.</li>}
          {done.map((id) => (
            <motion.li key={id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-ink-2">
              <span className="text-synapse">✓</span>{FEEDBACK[id]}
            </motion.li>
          ))}
          {done.length === asks.length && <li className="px-1 text-ink">Quatre petites relances, et le pavé est devenu une vraie fiche de révision.</li>}
        </ul>
      </div>
    </div>
  );
}
