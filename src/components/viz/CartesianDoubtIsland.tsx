import { motion } from 'motion/react';
import { useState } from 'react';

/**
 * Le doute méthodique de Descartes (Méditations, I-II) : trois raisons de douter,
 * appliquées l'une après l'autre à des croyances ordinaires. À la fin, seule reste
 * la certitude « je pense, je suis ».
 */
const STEPS = [
  { title: 'Avant le doute', reason: 'Tout ce que je crois savoir, je l’ai reçu des sens, de l’éducation, de l’habitude. Mais lequel de ces savoirs est vraiment certain ?' },
  { title: '1. Les sens trompent', reason: 'Mes sens me trompent parfois : une tour carrée paraît ronde de loin, un bâton semble brisé dans l’eau. Il est prudent de ne pas se fier entièrement à qui nous a trompés une fois.' },
  { title: '2. Le rêve', reason: 'En rêve, je crois être assis près du feu, habillé, alors que je suis couché dans mon lit. Il n’y a aucun indice sûr pour distinguer la veille du sommeil. Mais, éveillé ou endormi, 2 + 3 font toujours 5.' },
  { title: '3. Le malin génie', reason: 'Et si un génie trompeur, très puissant et très rusé, employait toute son énergie à me tromper, même quand je compte les côtés d’un carré ? Rien ne me garantit le contraire.' },
  { title: '4. Le cogito', reason: 'Mais s’il me trompe, c’est que je suis. Pour être trompé, pour douter, il faut penser ; et pour penser, il faut être. « Je suis, j’existe » est nécessairement vrai chaque fois que je le pense.' },
];

/** `falls` = étape du doute qui renverse la croyance (0 = jamais). */
const BELIEFS = [
  { text: 'La tour, au loin, est ronde', kind: 'perception lointaine', falls: 1 },
  { text: 'Le soleil est petit, comme un disque', kind: 'perception', falls: 1 },
  { text: 'Je suis assis près du feu, en robe de chambre', kind: 'situation présente', falls: 2 },
  { text: 'J’ai un corps, ces mains sont à moi', kind: 'corps', falls: 2 },
  { text: 'Il existe un monde extérieur, la Terre, le ciel', kind: 'monde', falls: 2 },
  { text: '2 + 3 = 5', kind: 'mathématiques', falls: 3 },
  { text: 'Un carré a quatre côtés', kind: 'mathématiques', falls: 3 },
  { text: 'Je pense, donc je suis', kind: 'conscience de soi', falls: 0 },
];

export default function CartesianDoubtIsland() {
  const [step, setStep] = useState(0);
  const standing = BELIEFS.filter((b) => b.falls === 0 || b.falls > step).length;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Étapes du doute">
        {STEPS.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => setStep(i)}
            aria-pressed={step === i}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${step === i ? 'border-signal bg-signal-soft text-ink' : 'border-line bg-surface text-ink-2 hover:text-ink'}`}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_1.2fr]">
        <motion.div key={step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="grid content-start gap-3">
          <p className="text-sm text-ink-2">{STEPS[step].reason}</p>
          <p className="text-xs text-ink-3">
            Croyances encore debout : <span className="font-mono text-ink tabular-nums">{standing} / {BELIEFS.length}</span>
          </p>
          <div className="flex gap-2">
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={() => setStep(step + 1)} className="rounded-full border border-signal bg-signal-soft px-3 py-1.5 text-sm text-ink">
                Douter encore
              </button>
            ) : (
              <button type="button" onClick={() => setStep(0)} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-2 hover:text-ink">
                Recommencer
              </button>
            )}
          </div>
        </motion.div>

        <ul className="grid gap-2">
          {BELIEFS.map((b) => {
            const fallen = b.falls !== 0 && b.falls <= step;
            const cogito = b.falls === 0;
            const lit = cogito && step === STEPS.length - 1;
            return (
              <motion.li
                key={b.text}
                animate={{ opacity: fallen ? 0.4 : 1, x: fallen ? 6 : 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-baseline justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${lit ? 'border-synapse bg-synapse-soft' : 'border-line bg-surface'}`}
              >
                <span className={fallen ? 'text-ink-3 line-through' : 'text-ink'}>
                  {fallen ? '✗ ' : lit ? '✓ ' : ''}
                  {b.text}
                </span>
                <span className="shrink-0 text-xs text-ink-3">{fallen ? `douteux (${b.falls === 1 ? 'sens' : b.falls === 2 ? 'rêve' : 'génie'})` : b.kind}</span>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
