import { motion } from 'motion/react';
import { useState } from 'react';

/**
 * Les positions sur le libre arbitre : deux questions (tout est-il déterminé ?
 * la liberté est-elle compatible avec le déterminisme ?) donnent quatre positions.
 */
type Det = 'oui' | 'non';
type Comp = 'oui' | 'non';
const POS: Record<string, { name: string; free: string; who: string; idea: string; objection: string }> = {
  'oui-non': {
    name: 'Déterminisme dur',
    free: 'La liberté est une illusion',
    who: 'Spinoza, d’Holbach',
    idea: 'Tout a une cause, y compris nos décisions. Nous nous croyons libres parce que nous ignorons ces causes. Comprendre cette nécessité est la seule « libération » possible.',
    objection: 'Si personne n’est libre, peut-on encore blâmer, punir, féliciter ? Et que vaut la délibération qu’on vit de l’intérieur ?',
  },
  'oui-oui': {
    name: 'Compatibilisme',
    free: 'Libre = agir selon ses propres désirs, sans contrainte',
    who: 'Hobbes, Hume, Frankfurt',
    idea: 'Être libre ne veut pas dire échapper aux causes, mais agir selon ce qu’on veut, sans être forcé. Le prisonnier n’est pas libre ; celui qui choisit son dessert l’est, même si son choix a des causes.',
    objection: 'Si mes désirs eux-mêmes sont déterminés par mes gènes et mon éducation, suis-je vraiment l’auteur de mes choix ?',
  },
  'non-non': {
    name: 'Libre arbitre (libertarisme)',
    free: 'Je peux réellement choisir autrement',
    who: 'Descartes, Kant (comme être moral), Sartre',
    idea: 'Au moment de choisir, plusieurs possibles sont réellement ouverts, et c’est moi qui tranche. Sartre : l’homme est « condamné à être libre », il n’a aucune excuse.',
    objection: 'Si ma décision n’a pas de cause, d’où vient-elle ? Un choix sans cause ressemble plus à du hasard qu’à de la liberté.',
  },
  'non-oui': {
    name: 'Indéterminisme sans liberté',
    free: 'Le hasard n’est pas la liberté',
    who: 'une objection plus qu’une école',
    idea: 'La physique quantique suggère que tout n’est pas déterminé. Mais un neurone qui s’active au hasard ne fait pas de moi un être libre : je ne contrôle pas le hasard plus que la nécessité.',
    objection: 'C’est justement le défi lancé au libre arbitre : trouver une place entre la nécessité et le hasard.',
  },
};

export default function FreedomMapIsland() {
  const [det, setDet] = useState<Det>('oui');
  const [comp, setComp] = useState<Comp>('oui');
  const key = `${det}-${comp}`;
  const p = POS[key];

  const Q = ({ label, value, set }: { label: string; value: string; set: (v: 'oui' | 'non') => void }) => (
    <div className="grid gap-1.5">
      <p className="text-sm text-ink">{label}</p>
      <div className="flex gap-2">
        {(['oui', 'non'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => set(v)}
            aria-pressed={value === v}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${value === v ? 'border-signal bg-signal-soft text-ink' : 'border-line bg-surface text-ink-2 hover:text-ink'}`}
          >
            {v === 'oui' ? 'Oui' : 'Non'}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
      <div className="grid content-start gap-4">
        <Q label="1. Tout ce qui arrive, y compris mes décisions, est-il entièrement déterminé par des causes antérieures ?" value={det} set={setDet} />
        <Q
          label={det === 'oui' ? '2. Peut-on être libre dans un monde entièrement déterminé ?' : '2. Ce qui n’est pas déterminé vient-il seulement du hasard ?'}
          value={comp}
          set={setComp}
        />
        <div className="grid grid-cols-2 gap-1.5 text-center text-xs" aria-hidden="true">
          {['oui-non', 'oui-oui', 'non-non', 'non-oui'].map((k) => (
            <div key={k} className={`rounded-md border px-2 py-1.5 ${k === key ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-3'}`}>
              {POS[k].name}
            </div>
          ))}
        </div>
      </div>
      <motion.div key={key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="grid content-start gap-2 rounded-xl border border-line bg-surface p-4">
        <p className="text-xs text-ink-3">Ta position</p>
        <p className="font-display text-3xl text-ink">{p.name}</p>
        <p className="text-sm font-semibold text-ink">{p.free}</p>
        <p className="text-xs text-ink-3">Défendue par : {p.who}</p>
        <p className="text-sm text-ink-2">{p.idea}</p>
        <p className="border-l-2 border-amber pl-3 text-sm text-ink-2"><strong className="text-ink">L’objection :</strong> {p.objection}</p>
      </motion.div>
    </div>
  );
}
