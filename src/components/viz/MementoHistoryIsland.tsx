import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

// Memento : un canevas (Originator), un historique de mementos (Caretaker), complet ou incrémental (ACOO session 7, « Memento »)
type Shape = { id: string; label: string; icon: string; x: number; y: number };
type Mode = 'complet' | 'delta';
// memento complet : copie de tout l'état ; memento incrémental : seulement le déplacement d'une forme
type Memento = { kind: 'complet'; shapes: Shape[] } | { kind: 'delta'; id: string; dx: number; dy: number };

const COLS = 6;
const ROWS = 4;
const initial: Shape[] = [
  { id: 'rond', label: 'Rond', icon: '●', x: 0, y: 0 },
  { id: 'carre', label: 'Carré', icon: '■', x: 2, y: 1 },
  { id: 'triangle', label: 'Triangle', icon: '▲', x: 4, y: 3 },
];
const moves = [
  { label: 'Déplacer vers la gauche', icon: '←', dx: -1, dy: 0 },
  { label: 'Déplacer vers le haut', icon: '↑', dx: 0, dy: -1 },
  { label: 'Déplacer vers le bas', icon: '↓', dx: 0, dy: 1 },
  { label: 'Déplacer vers la droite', icon: '→', dx: 1, dy: 0 },
];
// valeurs mémorisées : 3 par forme (id, x, y) pour un memento complet, 3 en tout (id, dx, dy) pour un delta
const size = (m: Memento) => (m.kind === 'complet' ? m.shapes.length * 3 : 3);

export default function MementoHistoryIsland() {
  const [shapes, setShapes] = useState<Shape[]>(initial);
  const [selected, setSelected] = useState('carre');
  const [mode, setMode] = useState<Mode>('complet');
  const [history, setHistory] = useState<Memento[]>([]);

  const move = (dx: number, dy: number) => {
    const s = shapes.find((sh) => sh.id === selected)!;
    const x = Math.min(COLS - 1, Math.max(0, s.x + dx));
    const y = Math.min(ROWS - 1, Math.max(0, s.y + dy));
    if (x === s.x && y === s.y) return;
    // le Caretaker demande un memento à l'Originator avant chaque modification
    const m: Memento = mode === 'complet' ? { kind: 'complet', shapes: shapes.map((sh) => ({ ...sh })) } : { kind: 'delta', id: s.id, dx: x - s.x, dy: y - s.y };
    setHistory((h) => [...h, m]);
    setShapes(shapes.map((sh) => (sh.id === s.id ? { ...sh, x, y } : sh)));
  };
  const undo = () => {
    const m = history.at(-1);
    if (!m) return;
    setHistory((h) => h.slice(0, -1));
    // l'Originator relit le memento : copie intégrale, ou déplacement inverse
    setShapes(m.kind === 'complet' ? m.shapes : shapes.map((sh) => (sh.id === m.id ? { ...sh, x: sh.x - m.dx, y: sh.y - m.dy } : sh)));
  };
  const switchMode = (m: Mode) => { setMode(m); setHistory([]); };
  const reset = () => { setShapes(initial); setHistory([]); };
  const total = history.reduce((n, m) => n + size(m), 0);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Memento</span>
        {(['complet', 'delta'] as Mode[]).map((m) => (
          <button key={m} type="button" aria-pressed={mode === m} onClick={() => switchMode(m)}
            className={`rounded-lg border px-2.5 py-1 text-xs ${mode === m ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            {m === 'complet' ? 'Tout l’état' : 'Incrémental (delta)'}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid gap-3 rounded-xl border border-line bg-bg p-3">
          <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Originator · le canevas</p>
          <div className="grid grid-cols-6 gap-1" role="img" aria-label={shapes.map((s) => `${s.label} en colonne ${s.x + 1}, ligne ${s.y + 1}`).join(', ')}>
            {Array.from({ length: COLS * ROWS }, (_, i) => {
              const s = shapes.find((sh) => sh.x === i % COLS && sh.y === Math.floor(i / COLS));
              return (
                <div key={i} className="flex aspect-square items-center justify-center rounded border border-line bg-surface-2">
                  {s && <motion.span layoutId={s.id} className={`text-lg leading-none ${s.id === selected ? 'text-signal' : 'text-ink-2'}`}>{s.icon}</motion.span>}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {shapes.map((s) => (
              <button key={s.id} type="button" aria-pressed={selected === s.id} onClick={() => setSelected(s.id)}
                className={`rounded-lg border px-2 py-1 text-xs ${selected === s.id ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>{s.icon} {s.label}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {moves.map((m) => (
              <button key={m.label} type="button" aria-label={m.label} onClick={() => move(m.dx, m.dy)}
                className="min-w-9 rounded-lg border border-line px-2.5 py-1 text-sm text-ink-2 hover:border-signal">{m.icon}</button>
            ))}
            <button type="button" onClick={undo} disabled={!history.length} className="rounded-lg bg-signal px-3 py-1 text-sm font-medium text-bg disabled:opacity-40">↶ Annuler</button>
            <button type="button" onClick={reset} className="rounded-lg border border-line px-3 py-1 text-sm text-ink-2 hover:border-line-strong">Recommencer</button>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-bg p-3">
          <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Caretaker · la pile de mementos</p>
          {history.length === 0 && <p className="mt-2 text-sm text-ink-3">Vide : choisis une forme et déplace-la avec les flèches.</p>}
          <ol className="mt-2 grid gap-1">
            <AnimatePresence initial={false}>
              {history.map((m, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="flex justify-between gap-2 rounded-md bg-surface-2 px-2 py-1 font-mono text-xs text-ink">
                  <span>■ Memento n°{i + 1}</span>
                  <span className="text-ink-3">{m.kind === 'complet' ? `${m.shapes.length} formes` : `${m.id} (${m.dx > 0 ? '+' : ''}${m.dx}, ${m.dy > 0 ? '+' : ''}${m.dy})`} · {size(m)} valeurs</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
          <p className="mt-3 text-xs text-ink-2">Historique : <span className="font-mono text-ink">{total}</span> valeurs mémorisées</p>
        </div>
      </div>
      <p className="text-sm text-ink-2">Le Caretaker empile des boîtes noires sans jamais lire leur contenu : seul le canevas sait les créer et les relire. Un memento complet copie tout l'état, un delta ne garde que le déplacement, mais il ne marche que si on annule dans l'ordre.</p>
    </div>
  );
}
