import { useEffect, useRef, useState } from 'react';

/**
 * Un perceptron qui apprend à séparer des pommes et des citrons.
 * x = couleur (0 jaune → 1 rouge), y = poids (0 léger → 1 lourd).
 */
type Fruit = { x: number; y: number; label: 1 | -1 };
const fruits: Fruit[] = [
  [0.78, 0.62], [0.85, 0.75], [0.7, 0.8], [0.92, 0.58], [0.66, 0.68], [0.88, 0.88], [0.75, 0.52],
].map(([x, y]) => ({ x, y, label: 1 as const }))
  .concat([
    [0.15, 0.3], [0.25, 0.22], [0.3, 0.42], [0.12, 0.48], [0.35, 0.18], [0.22, 0.55], [0.4, 0.35],
  ].map(([x, y]) => ({ x, y, label: -1 as const })));
// Les exemples sont montrés en alternant pomme / citron
const order = [0, 7, 1, 8, 2, 9, 3, 10, 4, 11, 5, 12, 6, 13];
const START = { w1: -0.3, w2: 0.6, b: -0.1 };
const LR = 0.25;

type Model = typeof START;
const score = (m: Model, x: number, y: number) => m.w1 * x + m.w2 * y + m.b;
const guess = (m: Model, x: number, y: number): 1 | -1 => (score(m, x, y) > 0 ? 1 : -1);
const errors = (m: Model) => fruits.filter((f) => guess(m, f.x, f.y) !== f.label).length;

// Repère : [0,1]² → viewBox 100×100 (y vers le haut)
const X = (x: number) => 8 + x * 88;
const Y = (y: number) => 90 - y * 84;

/** Zone « pomme » : le carré découpé par la droite w1·x + w2·y + b = 0. */
function appleZone(m: Model) {
  const square = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const out: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const a = square[i], c = square[(i + 1) % 4];
    const sa = score(m, a[0], a[1]), sc = score(m, c[0], c[1]);
    if (sa > 0) out.push(a);
    if (sa > 0 !== sc > 0) {
      const t = sa / (sa - sc);
      out.push([a[0] + t * (c[0] - a[0]), a[1] + t * (c[1] - a[1])]);
    }
  }
  return out.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ');
}

export default function TeachIsland() {
  const [m, setM] = useState<Model>(START);
  const [seen, setSeen] = useState(0);
  const [last, setLast] = useState<{ i: number; ok: boolean } | null>(null);
  const [probe, setProbe] = useState<{ x: number; y: number } | null>(null);
  const [auto, setAuto] = useState(false);
  const mRef = useRef(m);
  mRef.current = m;
  const seenRef = useRef(seen);
  seenRef.current = seen;

  const step = () => {
    const i = order[seenRef.current % order.length];
    const f = fruits[i];
    const cur = mRef.current;
    const ok = guess(cur, f.x, f.y) === f.label;
    const next = ok ? cur : { w1: cur.w1 + LR * f.label * f.x, w2: cur.w2 + LR * f.label * f.y, b: cur.b + LR * f.label };
    mRef.current = next;
    seenRef.current += 1;
    setM(next);
    setSeen(seenRef.current);
    setLast({ i, ok });
    return errors(next);
  };

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => { if (step() === 0) setAuto(false); }, 160);
    return () => clearInterval(id);
  }, [auto]);

  const reset = () => { setAuto(false); setM(START); setSeen(0); setLast(null); setProbe(null); };
  const errs = errors(m);
  const lastFruit = last && fruits[last.i];

  const onPlot = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width * 100 - 8) / 88;
    const y = (90 - (e.clientY - r.top) / r.height * 100) / 84;
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) setProbe({ x, y });
  };

  return (
    <div className="grid gap-5 md:grid-cols-[1.3fr_1fr]">
      <svg viewBox="0 0 100 100" className="w-full cursor-crosshair rounded-xl border border-line bg-bg" onClick={onPlot} role="img" aria-label="Pommes et citrons placés selon leur couleur et leur poids, séparés par la frontière apprise">
        <polygon points={appleZone(m)} fill="var(--signal-soft)" />
        <rect x={X(0)} y={Y(1)} width={88} height={84} fill="none" stroke="var(--line-strong)" strokeWidth="0.3" />
        <text x={X(0.5)} y="98" textAnchor="middle" fontSize="3" fill="var(--ink-3)">couleur : jaune → rouge</text>
        <text x="3.5" y={Y(0.5)} textAnchor="middle" fontSize="3" fill="var(--ink-3)" transform={`rotate(-90 3.5 ${Y(0.5)})`}>poids : léger → lourd</text>
        {fruits.map((f, i) => {
          const wrong = guess(m, f.x, f.y) !== f.label;
          const color = f.label === 1 ? 'var(--signal)' : 'var(--amber)';
          return (
            <g key={i}>
              {last?.i === i && <circle cx={X(f.x)} cy={Y(f.y)} r="4.4" fill="none" stroke="var(--ink)" strokeWidth="0.5" />}
              <circle cx={X(f.x)} cy={Y(f.y)} r="2.4" fill={color} stroke={wrong ? 'var(--ink)' : 'none'} strokeWidth="0.6" strokeDasharray={wrong ? '1 0.8' : undefined} />
            </g>
          );
        })}
        {probe && (
          <g>
            <circle cx={X(probe.x)} cy={Y(probe.y)} r="2.8" fill="var(--surface)" stroke="var(--ink)" strokeWidth="0.6" />
            <text x={X(probe.x)} y={Y(probe.y) + 1.1} textAnchor="middle" fontSize="3" fill="var(--ink)">?</text>
          </g>
        )}
      </svg>

      <div className="grid content-start gap-4 text-sm">
        <div className="flex flex-wrap gap-3 text-xs text-ink-2">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-signal" /> pomme</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-amber" /> citron</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-signal-soft ring-1 ring-line" /> zone où la machine dit « pomme »</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-line bg-bg p-3">
            <p className="text-xs text-ink-3">Exemples vus</p>
            <p className="font-mono text-2xl text-ink tabular-nums">{seen}</p>
          </div>
          <div className="rounded-xl border border-line bg-bg p-3">
            <p className="text-xs text-ink-3">Fruits mal classés</p>
            <p className={`font-mono text-2xl tabular-nums ${errs ? 'text-signal' : 'text-synapse'}`}>{errs} / {fruits.length}</p>
          </div>
        </div>

        <p className="min-h-[3.2rem] rounded-xl border border-line bg-surface-2 px-3 py-2 leading-relaxed text-ink-2">
          {!lastFruit && 'La machine part d’une règle au hasard. Montre-lui des fruits un par un : à chaque erreur, elle déplace un peu sa frontière.'}
          {lastFruit && errs === 0 && <><strong className="text-synapse">Entraînement terminé.</strong> Elle ne se trompe plus sur aucun fruit. Teste-la avec un fruit mystère !</>}
          {lastFruit && errs > 0 && (last!.ok
            ? <>Exemple : un{lastFruit.label === 1 ? 'e pomme' : ' citron'}. <strong className="text-ink">Bonne réponse</strong>, elle ne change rien.</>
            : <>Exemple : un{lastFruit.label === 1 ? 'e pomme' : ' citron'}. <strong className="text-signal">Raté !</strong> Elle corrige sa règle pour se rapprocher de la bonne réponse.</>)}
        </p>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { setAuto(false); step(); }} className="rounded-xl bg-ink px-4 py-2 font-medium text-bg">Montrer un fruit</button>
          <button type="button" onClick={() => setAuto((a) => !a)} disabled={!errs} className="rounded-xl border border-line-strong px-4 py-2 text-ink disabled:opacity-40">{auto ? 'Pause' : 'Entraîner en continu'}</button>
          <button type="button" onClick={reset} className="rounded-xl px-3 py-2 text-ink-3 hover:text-ink">Recommencer</button>
        </div>

        {probe
          ? <p className="rounded-xl border border-line bg-bg px-3 py-2 text-ink-2">Fruit mystère : la machine pense que c’est <strong className="text-ink">{guess(m, probe.x, probe.y) === 1 ? 'une pomme 🍎' : 'un citron 🍋'}</strong>.</p>
          : <p className="text-xs text-ink-3">Astuce : clique n’importe où dans le graphique pour lui montrer un fruit mystère.</p>}
      </div>
    </div>
  );
}
