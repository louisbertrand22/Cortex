import { motion } from 'motion/react';
import { useState } from 'react';

// Intégrer N applications : point à point, EAI (hub) ou ESB (bus) — combien d'interfaces à maintenir ?
// (GEN ARCHI session 3, « EAI » et « EAI / ESB »)
type Mode = 'p2p' | 'eai' | 'esb';
const modes: { id: Mode; label: string; text: string }[] = [
  { id: 'p2p', label: 'Point à point', text: 'Chaque application parle directement à chacune des autres : une interface par couple, et chaque nouvelle application en ajoute autant qu’il y en a déjà.' },
  { id: 'eai', label: 'EAI · hub', text: 'La « pieuvre du SI » : un connecteur par application vers un hub central qui transforme et route. Peu d’interfaces, mais une scalabilité faible : tout passe par le hub.' },
  { id: 'esb', label: 'ESB · bus', text: 'Le « next gen EAI » : un bus de messages où chaque application pose et consomme ses messages. Toujours un connecteur par application, et le bus passe à l’échelle en scale out.' },
];
const names = ['RH', 'CRM', 'Stock', 'Web', 'Paie', 'BI', 'Achats', 'ERP', 'Mobile', 'Compta', 'Ventes', 'GED'];

export default function IntegrationTopologyIsland() {
  const [mode, setMode] = useState<Mode>('p2p');
  const [n, setN] = useState(6);
  const m = modes.find((x) => x.id === mode)!;
  const links = mode === 'p2p' ? (n * (n - 1)) / 2 : n;

  // applications sur un cercle (p2p, eai) ou de part et d'autre d'un bus (esb)
  const pos = (i: number) => {
    if (mode === 'esb') {
      const top = i % 2 === 0;
      const k = Math.floor(i / 2);
      const cols = Math.ceil(n / 2);
      return { x: 4 + (k + 0.5) * (92 / cols), y: top ? 14 : 66 };
    }
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: 50 + 31 * Math.cos(a), y: 40 + 29 * Math.sin(a) };
  };

  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < n; i++) {
    const p = pos(i);
    if (mode === 'p2p') for (let j = i + 1; j < n; j++) { const q = pos(j); lines.push({ x1: p.x, y1: p.y, x2: q.x, y2: q.y }); }
    else if (mode === 'eai') lines.push({ x1: p.x, y1: p.y, x2: 50, y2: 40 });
    else lines.push({ x1: p.x, y1: p.y, x2: p.x, y2: 40 });
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Topologie d'intégration">
        {modes.map((x) => (
          <button key={x.id} type="button" role="tab" aria-selected={mode === x.id} onClick={() => setMode(x.id)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${mode === x.id ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            {x.label}
          </button>
        ))}
      </div>
      <label className="grid gap-1.5 text-sm">
        <span className="flex justify-between text-ink-2"><span>Applications à intégrer</span><span className="font-mono text-ink">{n}</span></span>
        <input type="range" min={3} max={12} value={n} onChange={(e) => setN(Number(e.target.value))} className="accent-[var(--signal)]" />
      </label>

      <svg viewBox="0 0 100 80" className="w-full rounded-xl border border-line bg-bg" role="img" aria-label={`${n} applications, ${links} interfaces`}>
        {lines.map((l, k) => (
          <motion.line key={`${mode}-${n}-${k}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={mode === 'p2p' ? 'var(--danger)' : 'var(--synapse)'} strokeWidth={0.4} strokeOpacity={0.7}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: Math.min(k * 0.01, 0.4) }} />
        ))}
        {mode === 'eai' && (
          <g>
            <circle cx={50} cy={40} r={8} fill="var(--signal-soft)" stroke="var(--signal)" strokeWidth={0.6} />
            <text x={50} y={41.5} textAnchor="middle" fontSize={4.2} fontWeight={600} fill="var(--ink)">EAI</text>
          </g>
        )}
        {mode === 'esb' && (
          <g>
            <rect x={6} y={36} width={88} height={8} rx={4} fill="var(--signal-soft)" stroke="var(--signal)" strokeWidth={0.6} />
            <text x={50} y={41.5} textAnchor="middle" fontSize={4} fontWeight={600} fill="var(--ink)">ESB · bus de messages</text>
          </g>
        )}
        {Array.from({ length: n }).map((_, i) => {
          const p = pos(i);
          return (
            <g key={i}>
              <rect x={p.x - 6.8} y={p.y - 3.6} width={13.6} height={7.2} rx={1.6} fill="var(--surface)" stroke="var(--line-strong)" strokeWidth={0.4} />
              <text x={p.x} y={p.y + 1.3} textAnchor="middle" fontSize={3.5} fill="var(--ink)">{names[i]}</text>
            </g>
          );
        })}
      </svg>

      <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
        <p className="font-mono text-3xl font-semibold" style={{ color: mode === 'p2p' ? 'var(--danger)' : 'var(--synapse)' }}>
          {links} <span className="text-sm font-normal text-ink-2">{mode === 'p2p' ? 'interfaces' : 'connecteurs'}</span>
        </p>
        <p className="text-sm text-ink-2">{m.text}</p>
      </div>
    </div>
  );
}
