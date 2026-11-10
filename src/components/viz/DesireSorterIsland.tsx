import { motion } from 'motion/react';
import { useState } from 'react';

/**
 * Le tri des désirs d'Épicure (Lettre à Ménécée) : naturels et nécessaires, naturels
 * seulement, ou vains (ni naturels ni nécessaires). Classer chaque désir, puis comparer.
 */
type Cat = 'necessaire' | 'naturel' | 'vain';
const CATS: { id: Cat; label: string; hint: string }[] = [
  { id: 'necessaire', label: 'Naturel et nécessaire', hint: 'à satisfaire : sans lui, on souffre ou on meurt' },
  { id: 'naturel', label: 'Naturel seulement', hint: 'à modérer : il varie le plaisir, sans être indispensable' },
  { id: 'vain', label: 'Vain', hint: 'à écarter : il naît de l’opinion et n’a pas de limite' },
];
const DESIRES: { text: string; cat: Cat; why: string }[] = [
  { text: 'Boire quand on a soif', cat: 'necessaire', why: 'Un besoin du corps, facile à satisfaire : un verre d’eau suffit.' },
  { text: 'Boire un grand cru plutôt que de l’eau', cat: 'naturel', why: 'La soif est naturelle, mais le grand cru ne fait que varier le plaisir : on peut s’en passer sans souffrir.' },
  { text: 'Être plus riche que ses voisins', cat: 'vain', why: 'Un désir né de la comparaison, qui n’a aucune limite : on n’est jamais assez riche par rapport aux autres.' },
  { text: 'Avoir des amis sur qui compter', cat: 'necessaire', why: 'Pour Épicure, l’amitié est nécessaire au bonheur : c’est l’un des plus grands biens, et il vivait entouré d’amis au Jardin.' },
  { text: 'Devenir célèbre', cat: 'vain', why: 'La gloire dépend de l’opinion des autres : elle expose au trouble et ne se rassasie jamais.' },
  { text: 'Désir sexuel', cat: 'naturel', why: 'Naturel, mais pas nécessaire au sens d’Épicure : on ne meurt pas de ne pas le satisfaire, et il peut causer du trouble.' },
  { text: 'Avoir un abri contre le froid', cat: 'necessaire', why: 'Nécessaire à la vie et à la tranquillité du corps.' },
  { text: 'Posséder le dernier téléphone à la sortie', cat: 'vain', why: 'Ce n’est pas le besoin de communiquer (naturel), mais le désir de nouveauté et de statut, entretenu par l’opinion et sans fin.' },
];

export default function DesireSorterIsland() {
  const [answers, setAnswers] = useState<Record<number, Cat>>({});
  const [focus, setFocus] = useState(0);
  const done = Object.keys(answers).length === DESIRES.length;
  const score = DESIRES.filter((d, i) => answers[i] === d.cat).length;
  const d = DESIRES[focus];
  const picked = answers[focus];

  const pick = (c: Cat) => {
    if (picked) return;
    setAnswers((a) => ({ ...a, [focus]: c }));
  };
  const next = () => {
    const i = DESIRES.findIndex((_, k) => !(k in answers) && k !== focus);
    if (i >= 0) setFocus(i);
  };

  return (
    <div className="grid gap-5 md:grid-cols-[1.1fr_1fr]">
      <div className="grid content-start gap-3">
        <p className="text-xs text-ink-3">Désir {focus + 1} sur {DESIRES.length} · range-le dans une catégorie</p>
        <motion.p key={focus} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-signal bg-signal-soft p-4 text-lg text-ink">
          {d.text}
        </motion.p>
        <div className="grid gap-2">
          {CATS.map((c) => {
            const state = !picked ? 'idle' : c.id === d.cat ? 'right' : c.id === picked ? 'wrong' : 'other';
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => pick(c.id)}
                disabled={!!picked}
                className={`grid rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  state === 'right' ? 'border-synapse bg-synapse-soft' : state === 'wrong' ? 'border-danger bg-surface' : state === 'other' ? 'border-line bg-surface opacity-60' : 'border-line bg-surface hover:border-signal'
                }`}
              >
                <span className="text-ink">{state === 'right' ? '✓ ' : state === 'wrong' ? '✗ ' : ''}{c.label}</span>
                <span className="text-xs text-ink-3">{c.hint}</span>
              </button>
            );
          })}
        </div>
        {picked && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid justify-items-start gap-2">
            <p className="text-sm text-ink-2">{d.why}</p>
            {!done && (
              <button type="button" onClick={next} className="rounded-full border border-signal bg-signal-soft px-3 py-1.5 text-sm text-ink">Désir suivant</button>
            )}
          </motion.div>
        )}
      </div>

      <div className="grid content-start gap-2">
        <p className="text-xs text-ink-3">Ton tri {done ? `· ${score} / ${DESIRES.length} comme Épicure` : ''}</p>
        {DESIRES.map((x, i) => (
          <button
            key={x.text}
            type="button"
            onClick={() => setFocus(i)}
            className={`flex items-baseline justify-between gap-3 rounded-lg border px-3 py-1.5 text-left text-sm ${focus === i ? 'border-signal' : 'border-line'} bg-surface`}
          >
            <span className="text-ink-2">{x.text}</span>
            <span className={`shrink-0 text-xs ${answers[i] === undefined ? 'text-ink-3' : answers[i] === x.cat ? 'text-synapse' : 'text-danger'}`}>
              {answers[i] === undefined ? '…' : CATS.find((c) => c.id === answers[i])!.label}
            </span>
          </button>
        ))}
        {done && (
          <button type="button" onClick={() => { setAnswers({}); setFocus(0); }} className="justify-self-start rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-2 hover:text-ink">
            Recommencer
          </button>
        )}
      </div>
    </div>
  );
}
