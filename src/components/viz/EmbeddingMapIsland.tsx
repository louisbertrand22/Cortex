import { motion } from 'motion/react';
import { useState } from 'react';

type Pt = { id: string; x: number; y: number; group: 'people' | 'animals' | 'cars' | 'text'; sentence?: boolean };
const pts: Pt[] = [
  { id: 'homme', x: 18, y: 22, group: 'people' }, { id: 'femme', x: 27, y: 15, group: 'people' }, { id: 'reine', x: 33, y: 27, group: 'people' }, { id: 'roi', x: 22, y: 33, group: 'people' },
  { id: 'chien', x: 70, y: 22, group: 'animals' }, { id: 'chat', x: 79, y: 17, group: 'animals' }, { id: 'poule', x: 76, y: 32, group: 'animals' },
  { id: 'Renault', x: 58, y: 72, group: 'cars' }, { id: 'Peugeot', x: 68, y: 79, group: 'cars' },
  { id: 'golf', x: 45, y: 55, group: 'text' },
  { id: '« Ma Golf a besoin de pneus neufs »', x: 56, y: 64, group: 'text', sentence: true },
];
const groups = [
  { g: 'people', label: 'Personnes', cx: 25, cy: 24, rx: 15, ry: 15 },
  { g: 'animals', label: 'Animaux', cx: 75, cy: 24, rx: 12, ry: 13 },
  { g: 'cars', label: 'Voitures', cx: 63, cy: 74, rx: 15, ry: 12 },
];
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

export default function EmbeddingMapIsland() {
  const [sel, setSel] = useState('chat');
  const p = pts.find((q) => q.id === sel)!;
  const near = pts.filter((q) => q.id !== sel).sort((a, b) => dist(p, a) - dist(p, b)).slice(0, 3);
  const sim = (q: Pt) => Math.max(0, 1 - dist(p, q) / 110);
  return (
    <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
      <svg viewBox="0 0 100 92" className="w-full rounded-xl border border-line bg-bg" role="img" aria-label="Carte 2D des embeddings">
        {groups.map((g) => (
          <g key={g.g}>
            <ellipse cx={g.cx} cy={g.cy} rx={g.rx} ry={g.ry} fill="none" stroke="var(--line-strong)" strokeDasharray="1.5 1.5" strokeWidth="0.35" />
            <text x={g.cx} y={g.cy - g.ry - 1.5} textAnchor="middle" fontSize="2.8" fill="var(--ink-3)">{g.label}</text>
          </g>
        ))}
        {near.map((q) => (
          <motion.line key={sel + q.id} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="var(--signal)" strokeWidth="0.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
        ))}
        {pts.map((q) => (
          <g key={q.id} onClick={() => setSel(q.id)} className="cursor-pointer">
            <circle cx={q.x} cy={q.y} r={q.id === sel ? 2.2 : q.sentence ? 1.3 : 1.6} fill={q.id === sel ? 'var(--signal)' : q.sentence ? 'var(--ink-3)' : 'var(--amber)'} />
            <text x={q.sentence ? q.x - 2.6 : q.x + 2.6} y={q.y + 1} textAnchor={q.sentence ? 'end' : 'start'} fontSize={q.sentence ? 2.3 : 3} fill={q.id === sel ? 'var(--ink)' : 'var(--ink-2)'}>{q.id}</text>
          </g>
        ))}
        <text x="2" y="90" fontSize="2.4" fill="var(--ink-3)">dimension 1 →</text>
      </svg>
      <div className="grid content-start gap-3 text-sm">
        <p className="text-ink-2">Clique un point : on trace ses <strong className="text-ink">3 plus proches voisins</strong>, comme une recherche vectorielle.</p>
        <div className="rounded-xl border border-line bg-bg p-4">
          <p className="font-mono text-xs text-ink-3">requête</p>
          <p className="font-semibold text-ink">{sel}</p>
          <ol className="mt-3 grid gap-1.5">
            {near.map((q, i) => (
              <li key={q.id} className="flex justify-between gap-3"><span className="text-ink-2">{i + 1}. {q.id}</span><span className="font-mono text-ink">{sim(q).toFixed(2)}</span></li>
            ))}
          </ol>
        </div>
        <p className="text-xs text-ink-3">Positions placées à la main. Un vrai modèle utilise 768 à 3 072 dimensions ; seules les distances ont un sens, pas les coordonnées. Le mot « golf » seul est ambigu (voiture, sport, lieu) : la phrase, elle, atterrit chez les voitures.</p>
      </div>
    </div>
  );
}
