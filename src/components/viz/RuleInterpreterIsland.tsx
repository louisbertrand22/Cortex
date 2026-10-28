import { motion } from 'motion/react';
import { useState } from 'react';

// Interpreter : évaluer l'arbre de l'expression du support selon un contexte (ACOO session 6, « Interpreter »)
type Ctx = { age: number; city: string; role: string };
type Node =
  | { kind: 'or' | 'and'; children: Node[] }
  | { kind: 'cmp'; field: keyof Ctx; op: '>' | '='; value: number | string };

const expr: Node = {
  kind: 'or',
  children: [
    { kind: 'and', children: [{ kind: 'cmp', field: 'age', op: '>', value: 25 }, { kind: 'cmp', field: 'city', op: '=', value: 'Paris' }] },
    { kind: 'cmp', field: 'role', op: '=', value: 'admin' },
  ],
};

const interpret = (n: Node, c: Ctx): boolean =>
  n.kind === 'cmp'
    ? n.op === '>' ? Number(c[n.field]) > Number(n.value) : c[n.field] === n.value
    : n.kind === 'and' ? n.children.every((ch) => interpret(ch, c)) : n.children.some((ch) => interpret(ch, c));

const label = (n: Node) =>
  n.kind === 'cmp' ? `CompareExpr("${n.field}", "${n.op}", ${typeof n.value === 'string' ? `"${n.value}"` : n.value})` : n.kind === 'and' ? 'AndExpr' : 'OrExpr';

function Tree({ n, c, depth = 0 }: { n: Node; c: Ctx; depth?: number }) {
  const v = interpret(n, c);
  return (
    <div className={depth ? 'ml-4 border-l border-line pl-3' : ''}>
      <motion.div key={String(v)} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}
        className={`my-1 inline-flex flex-wrap items-center gap-2 rounded-md border px-2 py-1 font-mono text-xs ${v ? 'border-synapse bg-synapse-soft' : 'border-line bg-surface-2'} text-ink`}>
        <span className="text-[0.6rem] tracking-wider text-ink-3 uppercase">{n.kind === 'cmp' ? 'terminal' : 'non terminal'}</span>
        {label(n)}
        <span className={v ? 'text-synapse' : 'text-ink-3'}>→ {v ? 'true' : 'false'}</span>
      </motion.div>
      {n.kind !== 'cmp' && n.children.map((ch, i) => <Tree key={i} n={ch} c={c} depth={depth + 1} />)}
    </div>
  );
}

export default function RuleInterpreterIsland() {
  const [ctx, setCtx] = useState<Ctx>({ age: 30, city: 'Lyon', role: 'user' });
  const result = interpret(expr, ctx);
  const Choice = ({ field, options }: { field: 'city' | 'role'; options: string[] }) => (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-10 font-mono text-xs text-ink-3">{field}</span>
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={ctx[field] === o} onClick={() => setCtx({ ...ctx, [field]: o })}
          className={`rounded-lg border px-2.5 py-1 font-mono text-xs ${ctx[field] === o ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>{o}</button>
      ))}
    </div>
  );

  return (
    <div className="grid gap-5">
      <div className="grid gap-2 rounded-xl border border-line bg-bg p-3">
        <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Context · les données de l'utilisateur</p>
        <label className="flex flex-wrap items-center gap-2 text-xs">
          <span className="w-10 font-mono text-ink-3">age</span>
          <input type="range" min={18} max={40} value={ctx.age} onChange={(e) => setCtx({ ...ctx, age: Number(e.target.value) })} aria-label="Âge" className="accent-[var(--signal)]" />
          <span className="font-mono text-ink">{ctx.age}</span>
        </label>
        <Choice field="city" options={['Paris', 'Lyon']} />
        <Choice field="role" options={['user', 'admin']} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-bg p-3">
        <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">expr.interpret(context) · chaque nœud s'évalue en interrogeant ses enfants</p>
        <Tree n={expr} c={ctx} />
      </div>

      <p className={`text-sm font-medium ${result ? 'text-synapse' : 'text-ink-2'}`}>
        {result ? '✓ La règle est satisfaite : accès accordé.' : 'La règle n’est pas satisfaite : accès refusé.'} Change le contexte, l'arbre (la grammaire) reste le même.
      </p>
    </div>
  );
}
