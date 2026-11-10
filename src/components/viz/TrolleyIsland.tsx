import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

/**
 * Le dilemme du tramway (Foot 1967, Thomson 1976-1985) en trois variantes. On choisit,
 * puis on voit ce que répondent l'utilitarisme, la morale kantienne et l'éthique des vertus.
 */
const CASES = [
  {
    id: 'aiguillage',
    title: 'L’aiguillage',
    text: 'Un tramway fou fonce vers cinq ouvriers. Tu es à côté d’un aiguillage : en le basculant, tu envoies le tramway sur une voie où se trouve un seul ouvrier.',
    act: 'Basculer l’aiguillage',
    wait: 'Ne rien faire',
    views: {
      util: 'Basculer : un mort vaut mieux que cinq. Le calcul est simple.',
      kant: 'Discuté : il est interdit de tuer un innocent, mais ici l’ouvrier n’est pas utilisé comme moyen, sa mort est un effet secondaire de la déviation. Beaucoup de kantiens le jugent permis, d’autres refusent de « choisir » qui meurt.',
      vertu: 'La personne prudente et bienveillante agit sans doute, mais avec gravité : ce choix reste un drame, pas une simple opération.',
    },
  },
  {
    id: 'passerelle',
    title: 'La passerelle',
    text: 'Même tramway, mêmes cinq ouvriers. Tu es sur une passerelle au-dessus de la voie, à côté d’un homme très corpulent. Le pousser sur la voie arrêterait le tramway : il mourrait, les cinq seraient sauvés.',
    act: 'Pousser l’homme',
    wait: 'Ne rien faire',
    views: {
      util: 'Pousser : le bilan est le même qu’avec l’aiguillage, un mort contre cinq. Un utilitariste strict ne voit pas de différence.',
      kant: 'Interdit : tu utilises cet homme comme un simple moyen, son corps devient l’outil du sauvetage. C’est violer sa dignité.',
      vertu: 'Une personne vertueuse ne pousse pas un innocent dans le vide : le geste lui-même révèle et forme un caractère capable de tuer.',
    },
  },
  {
    id: 'chirurgien',
    title: 'Le chirurgien',
    text: 'Cinq patients mourront sans greffe (cœur, foie, reins, poumons). Un visiteur en parfaite santé passe pour un bilan : ses organes sont compatibles avec les cinq.',
    act: 'Prélever ses organes',
    wait: 'Ne rien faire',
    views: {
      util: 'Le calcul dit « un contre cinq »… mais si les hôpitaux faisaient cela, plus personne n’oserait y entrer. Un utilitariste attentif aux conséquences à long terme refuse aussi.',
      kant: 'Absolument interdit : c’est l’exemple même de la personne réduite à un moyen.',
      vertu: 'Impensable pour un bon médecin : la confiance et le soin sont le cœur de sa vertu propre.',
    },
  },
];
const THEORIES = [
  { id: 'util', label: 'Utilitarisme', who: 'Bentham, Mill', tone: 'border-signal' },
  { id: 'kant', label: 'Morale du devoir', who: 'Kant', tone: 'border-synapse' },
  { id: 'vertu', label: 'Éthique des vertus', who: 'Aristote', tone: 'border-amber' },
] as const;

export default function TrolleyIsland() {
  const [c, setC] = useState(0);
  const [choice, setChoice] = useState<Record<number, 'act' | 'wait'>>({});
  const k = CASES[c];
  const mine = choice[c];

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Variantes">
        {CASES.map((x, i) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setC(i)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${c === i ? 'border-signal bg-signal-soft text-ink' : 'border-line bg-surface text-ink-2 hover:text-ink'}`}
          >
            {i + 1}. {x.title}
            {choice[i] ? ' ✓' : ''}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={c} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="grid gap-4">
          <p className="rounded-xl border border-line bg-surface p-4 text-base text-ink">{k.text}</p>
          <div className="flex flex-wrap gap-2">
            {(['act', 'wait'] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setChoice((v) => ({ ...v, [c]: a }))}
                aria-pressed={mine === a}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${mine === a ? 'border-signal bg-signal-soft text-ink' : 'border-line bg-surface text-ink-2 hover:text-ink'}`}
              >
                {a === 'act' ? k.act : k.wait}
              </button>
            ))}
          </div>

          {mine ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-3">
              <div className="grid gap-3 md:grid-cols-3">
                {THEORIES.map((t) => (
                  <div key={t.id} className={`rounded-xl border-l-2 ${t.tone} bg-surface p-3`}>
                    <p className="text-sm font-semibold text-ink">{t.label}</p>
                    <p className="text-xs text-ink-3">{t.who}</p>
                    <p className="mt-1 text-sm text-ink-2">{k.views[t.id]}</p>
                  </div>
                ))}
              </div>
              {Object.keys(choice).length === CASES.length && (
                <p className="text-sm text-ink-2">
                  <strong className="text-ink">Tes trois réponses :</strong> {CASES.map((x, i) => `${x.title.toLowerCase()} : ${choice[i] === 'act' ? 'agir' : 'ne rien faire'}`).join(' · ')}.{' '}
                  {choice[0] === 'act' && choice[1] === 'wait'
                    ? 'Comme la grande majorité des gens : même bilan, mais pousser quelqu’un te paraît différent. Pourquoi ? C’est tout le problème.'
                    : choice[0] === choice[1]
                      ? 'Tu es cohérent sur le bilan : peu de gens le sont. Qu’est-ce qui, pour toi, justifie que les deux cas se valent ?'
                      : 'Une combinaison rare : qu’est-ce qui rend la passerelle plus acceptable que l’aiguillage, selon toi ?'}
                </p>
              )}
            </motion.div>
          ) : (
            <p className="text-sm text-ink-3">Fais ton choix pour voir ce qu’en disent les trois grandes théories morales.</p>
          )}
        </motion.div>
      </AnimatePresence>
      <button type="button" onClick={() => { setChoice({}); setC(0); }} className="justify-self-start text-xs text-ink-3 hover:text-ink">Recommencer</button>
    </div>
  );
}
