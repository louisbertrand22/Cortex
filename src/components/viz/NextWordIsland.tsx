import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';

/**
 * Mini « modèle de langage » jouet : un arbre de mots suivants avec leurs probabilités.
 * Chaque nœud liste les candidats ; `next` absent = fin de phrase.
 */
type Cand = { w: string; p: number; next?: string };
const tree: Record<string, Cand[]> = {
  start: [{ w: 'jouer', p: 0.38, next: 'jouer' }, { w: 'regarder', p: 0.27, next: 'regarder' }, { w: 'réviser', p: 0.2, next: 'reviser' }, { w: 'manger', p: 0.15, next: 'manger' }],
  jouer: [{ w: 'au', p: 0.55, next: 'jouerAu' }, { w: 'avec', p: 0.3, next: 'jouerAvec' }, { w: 'à', p: 0.15, next: 'jouerA' }],
  jouerAu: [{ w: 'foot', p: 0.6 }, { w: 'basket', p: 0.25 }, { w: 'Uno', p: 0.15 }],
  jouerAvec: [{ w: 'mes', p: 0.65, next: 'jouerMes' }, { w: 'mon', p: 0.35, next: 'jouerMon' }],
  jouerMes: [{ w: 'potes', p: 0.6 }, { w: 'cousins', p: 0.25 }, { w: 'voisins', p: 0.15 }],
  jouerMon: [{ w: 'frère', p: 0.55 }, { w: 'chien', p: 0.3 }, { w: 'chat', p: 0.15 }],
  jouerA: [{ w: 'la', p: 0.7, next: 'jouerLa' }, { w: 'Minecraft', p: 0.3 }],
  jouerLa: [{ w: 'console', p: 0.65 }, { w: 'pétanque', p: 0.25 }, { w: 'belote', p: 0.1 }],
  regarder: [{ w: 'un', p: 0.5, next: 'regarderUn' }, { w: 'des', p: 0.3, next: 'regarderDes' }, { w: 'la', p: 0.2, next: 'regarderLa' }],
  regarderUn: [{ w: 'film', p: 0.6 }, { w: 'match', p: 0.3 }, { w: 'documentaire', p: 0.1 }],
  regarderDes: [{ w: 'vidéos', p: 0.55 }, { w: 'séries', p: 0.3 }, { w: 'mangas', p: 0.15 }],
  regarderLa: [{ w: 'télé', p: 0.6 }, { w: 'finale', p: 0.3 }, { w: 'pluie', p: 0.1 }],
  reviser: [{ w: 'pour', p: 0.5, next: 'reviserPour' }, { w: 'mes', p: 0.5, next: 'reviserMes' }],
  reviserPour: [{ w: 'le', p: 0.75, next: 'reviserLe' }, { w: 'demain', p: 0.25 }],
  reviserLe: [{ w: 'contrôle', p: 0.7 }, { w: 'brevet', p: 0.2 }, { w: 'code', p: 0.1 }],
  reviserMes: [{ w: 'maths', p: 0.5 }, { w: 'cours', p: 0.3 }, { w: 'fiches', p: 0.2 }],
  manger: [{ w: 'une', p: 0.5, next: 'mangerUne' }, { w: 'chez', p: 0.3, next: 'mangerChez' }, { w: 'des', p: 0.2, next: 'mangerDes' }],
  mangerUne: [{ w: 'pizza', p: 0.6 }, { w: 'raclette', p: 0.25 }, { w: 'crêpe', p: 0.15 }],
  mangerChez: [{ w: 'mamie', p: 0.55 }, { w: 'Léo', p: 0.3 }, { w: 'moi', p: 0.15 }],
  mangerDes: [{ w: 'pâtes', p: 0.5 }, { w: 'burgers', p: 0.3 }, { w: 'sushis', p: 0.2 }],
};
const PROMPT = 'Ce soir, après les cours, je vais';

/** Applique la température : T petit = on écrase vers le plus probable, T grand = on aplatit. */
function withTemperature(cands: Cand[], T: number) {
  if (T <= 0.01) return cands.map((_, i) => (i === 0 ? 1 : 0));
  const w = cands.map((c) => Math.pow(c.p, 1 / T));
  const s = w.reduce((a, b) => a + b, 0);
  return w.map((x) => x / s);
}

export default function NextWordIsland() {
  const [T, setT] = useState(1);
  const [path, setPath] = useState<Cand[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const node = path.length ? path[path.length - 1].next : 'start';
  const cands = node ? tree[node] : [];
  const probs = useMemo(() => withTemperature(cands, T), [cands, T]);
  const done = path.length > 0 && !node;

  const pick = (c: Cand) => {
    const next = [...path, c];
    setPath(next);
    if (!c.next) setHistory((h) => [`${PROMPT} ${next.map((x) => x.w).join(' ')}.`, ...h].slice(0, 4));
  };
  const sample = (from: Cand[], ps: number[]) => {
    let r = Math.random(), i = 0;
    while (i < ps.length - 1 && r > ps[i]) { r -= ps[i]; i++; }
    return from[i];
  };
  const auto = () => {
    // Écrit la phrase entière d'un coup, mot après mot
    let p: Cand[] = done ? [] : [...path];
    let n: string | undefined = p.length ? p[p.length - 1].next : 'start';
    while (n) { const c = sample(tree[n], withTemperature(tree[n], T)); p = [...p, c]; n = c.next; }
    setPath(p);
    setHistory((h) => [`${PROMPT} ${p.map((x) => x.w).join(' ')}.`, ...h].slice(0, 4));
  };

  return (
    <div className="grid gap-5">
      <div className="rounded-xl border border-line bg-bg p-4 text-lg leading-relaxed">
        <span className="text-ink-2">{PROMPT}</span>{' '}
        <AnimatePresence>
          {path.map((c, i) => (
            <motion.span key={i + c.w} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-medium text-signal">{c.w} </motion.span>
          ))}
        </AnimatePresence>
        {done ? <span className="text-signal">.</span> : <span className="ml-0.5 inline-block h-5 w-0.5 translate-y-0.5 animate-pulse bg-ink" />}
      </div>

      {!done && (
        <div className="grid gap-2">
          <p className="text-xs text-ink-3">Mots suivants possibles et leur probabilité : clique pour choisir toi-même</p>
          {cands.map((c, i) => (
            <button key={node + c.w} type="button" onClick={() => pick(c)} className="grid grid-cols-[6.5rem_1fr_3rem] items-center gap-3 rounded-lg px-1 py-0.5 text-left text-sm hover:bg-surface-2">
              <span className="truncate font-mono text-ink">{c.w}</span>
              <span className="h-5 overflow-hidden rounded bg-surface-2">
                <motion.span className="block h-full rounded" style={{ background: i === 0 ? 'var(--signal)' : 'var(--line-strong)' }} animate={{ width: `${probs[i] * 100}%` }} transition={{ type: 'spring', stiffness: 160, damping: 22 }} />
              </span>
              <span className="text-right font-mono text-ink-2">{Math.round(probs[i] * 100)} %</span>
            </button>
          ))}
        </div>
      )}

      <label className="grid gap-1.5 text-sm">
        <span className="flex justify-between text-ink-2"><span>Température (le « grain de folie »)</span><span className="font-mono text-ink">{T.toFixed(1)}</span></span>
        <input type="range" min={0} max={2} step={0.1} value={T} onChange={(e) => setT(Number(e.target.value))} className="accent-[var(--signal)]" />
        <span className="flex justify-between text-xs text-ink-3"><span>0 · toujours le mot le plus probable</span><span>2 · imprévisible</span></span>
      </label>

      <div className="flex flex-wrap gap-2">
        {!done && <button type="button" onClick={() => pick(sample(cands, probs))} className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-bg">L’IA choisit le mot suivant</button>}
        <button type="button" onClick={auto} className="rounded-xl border border-line-strong px-4 py-2 text-sm text-ink">{done ? 'Écrire une autre phrase' : 'Finir la phrase d’un coup'}</button>
        {path.length > 0 && <button type="button" onClick={() => setPath([])} className="rounded-xl px-3 py-2 text-sm text-ink-3 hover:text-ink">Effacer</button>}
      </div>

      {history.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-ink-3">Phrases écrites (même début, même « modèle ») :</p>
          <ol className="grid gap-1.5 text-sm">
            {history.map((h, k) => (
              <motion.li key={history.length - k} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1 - k * 0.18, y: 0 }} className="rounded-lg border border-line bg-surface px-3 py-2 text-ink-2">{h}</motion.li>
            ))}
          </ol>
        </div>
      )}
      <p className="text-xs text-ink-3">Vocabulaire et probabilités inventés pour l’exemple : un vrai modèle choisit parmi environ 100 000 morceaux de mots.</p>
    </div>
  );
}
