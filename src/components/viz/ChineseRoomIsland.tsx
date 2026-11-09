import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

/**
 * La chambre chinoise de Searle (1980) : tu es enfermé dans une pièce, tu reçois des
 * messages en chinois et tu réponds en suivant un manuel de règles purement formelles.
 * De dehors, tes réponses sont parfaites. Mais as-tu compris quoi que ce soit ?
 */
const RULES = [
  { inp: '你好吗？', out: '我很好，谢谢。', fr: ['Comment vas-tu ?', 'Je vais bien, merci.'] },
  { inp: '你叫什么名字？', out: '我叫小明。', fr: ['Comment t’appelles-tu ?', 'Je m’appelle Xiaoming.'] },
  { inp: '今天天气怎么样？', out: '今天天气很好。', fr: ['Quel temps fait-il aujourd’hui ?', 'Il fait très beau aujourd’hui.'] },
  { inp: '你喜欢喝茶吗？', out: '我很喜欢喝茶。', fr: ['Aimes-tu boire du thé ?', 'J’aime beaucoup boire du thé.'] },
];
const BOOK = [2, 0, 3, 1]; // ordre d'affichage des règles dans le manuel

export default function ChineseRoomIsland() {
  const [q, setQ] = useState(0);
  const [log, setLog] = useState<{ q: number; ok: boolean }[]>([]);
  const [reveal, setReveal] = useState(false);
  const [miss, setMiss] = useState<number | null>(null);
  const done = q >= RULES.length;

  const answer = (r: number) => {
    if (done) return;
    if (r !== q) {
      setMiss(r);
      return;
    }
    setMiss(null);
    setLog((l) => [...l, { q, ok: true }]);
    setQ(q + 1);
  };
  const restart = () => {
    setQ(0);
    setLog([]);
    setReveal(false);
    setMiss(null);
  };

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="grid content-start gap-3">
        <p className="text-xs uppercase tracking-wider text-ink-3">Dans la chambre · le manuel de règles</p>
        <p className="text-sm text-ink-2">
          {done ? 'Plus de messages.' : 'Un message passe sous la porte. Trouve la règle dont la forme correspond, et clique dessus pour renvoyer la réponse.'}
        </p>
        {!done && (
          <motion.p key={q} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-signal bg-signal-soft p-3 text-center text-2xl text-ink">
            {RULES[q].inp}
          </motion.p>
        )}
        <div className="grid gap-2">
          {BOOK.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => answer(r)}
              disabled={done}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${miss === r ? 'border-danger' : 'border-line hover:border-signal'} bg-surface text-ink-2`}
            >
              Si tu reçois <span className="text-base text-ink">{RULES[r].inp}</span>, renvoie <span className="text-base text-ink">{RULES[r].out}</span>
              {reveal && <span className="mt-1 block text-xs text-synapse">{RULES[r].fr[0]} → {RULES[r].fr[1]}</span>}
            </button>
          ))}
        </div>
        {miss !== null && !done && <p className="text-xs text-danger">Ce n’est pas la même suite de signes : compare-les trait par trait.</p>}
      </div>

      <div className="grid content-start gap-3">
        <p className="text-xs uppercase tracking-wider text-ink-3">Dehors · ce que voit l’observateur</p>
        <div className="grid min-h-40 content-start gap-2 rounded-xl border border-line bg-surface p-3">
          {log.length === 0 && <p className="text-sm text-ink-3">Aucun échange pour l’instant.</p>}
          <AnimatePresence>
            {log.map((e) => (
              <motion.div key={e.q} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="grid gap-0.5 text-sm">
                <p className="text-ink-2">Question : {RULES[e.q].inp}{reveal && <span className="text-xs text-synapse"> ({RULES[e.q].fr[0]})</span>}</p>
                <p className="text-ink">Réponse : {RULES[e.q].out}{reveal && <span className="text-xs text-synapse"> ({RULES[e.q].fr[1]})</span>}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {done && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-ink-2">
            <strong className="text-ink">Verdict de l’observateur : « Il parle parfaitement chinois ! »</strong> Pourtant, tu n’as fait que comparer des formes. Searle : un ordinateur ne fait rien d’autre.
          </motion.p>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setReveal((v) => !v)} className="rounded-full border border-synapse/50 bg-surface px-3 py-1.5 text-sm text-ink-2 hover:text-ink">
            {reveal ? 'Cacher la traduction' : 'Révéler la traduction'}
          </button>
          <button type="button" onClick={restart} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-2 hover:text-ink">Recommencer</button>
        </div>
      </div>
    </div>
  );
}
