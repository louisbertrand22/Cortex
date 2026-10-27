import { motion } from 'motion/react';
import { useState } from 'react';

// Rejouer N fois une requête : l'état final change-t-il ? (ARLA session 3, « Idempotence »)
type Note = { id: number; montant: number };
type State = Note[];
type Result = { state: State; status: string };
type Req = { label: string; method: string; path: string; body?: string; apply: (s: State, n: number) => Result };

const initial: State = [{ id: 42, montant: 50 }];
const set42 = (s: State, montant: number) => s.map((x) => (x.id === 42 ? { ...x, montant } : x));
const has42 = (s: State) => s.some((x) => x.id === 42);

const reqs: Req[] = [
  { label: 'GET', method: 'GET', path: '/notes/42', apply: (s) => ({ state: s, status: has42(s) ? '200 OK' : '404 Not Found' }) },
  { label: 'PUT', method: 'PUT', path: '/notes/42', body: '{ "montant": 80 }', apply: (s) => ({ state: has42(s) ? set42(s, 80) : [...s, { id: 42, montant: 80 }], status: '200 OK' }) },
  { label: 'DELETE', method: 'DELETE', path: '/notes/42', apply: (s) => ({ state: s.filter((x) => x.id !== 42), status: has42(s) ? '204 No Content' : '404 Not Found (ou 204)' }) },
  { label: 'POST', method: 'POST', path: '/notes', body: '{ "montant": 50 }', apply: (s, n) => ({ state: [...s, { id: 100 + n, montant: 50 }], status: '201 Created' }) },
  {
    label: 'POST + Idempotency-Key', method: 'POST', path: '/notes', body: 'Idempotency-Key: 9f1c…\n{ "montant": 50 }',
    apply: (s) => (s.some((x) => x.id === 101) ? { state: s, status: '201 Created (rejouée, dédupliquée)' } : { state: [...s, { id: 101, montant: 50 }], status: '201 Created' }),
  },
  { label: 'PATCH replace', method: 'PATCH', path: '/notes/42', body: '{ "op": "replace", "montant": 80 }', apply: (s) => ({ state: set42(s, 80), status: '200 OK' }) },
  { label: 'PATCH $inc', method: 'PATCH', path: '/notes/42', body: '{ "$inc": { "montant": 10 } }', apply: (s) => ({ state: s.map((x) => (x.id === 42 ? { ...x, montant: x.montant + 10 } : x)), status: '200 OK' }) },
];

const same = (a: State, b: State) => JSON.stringify(a) === JSON.stringify(b);

export default function IdempotenceIsland() {
  const [r, setR] = useState(3);
  const [n, setN] = useState(0);
  const req = reqs[r];

  // état après 1 envoi et après n envois
  let state = initial;
  let status = '—';
  const statuses: string[] = [];
  for (let i = 1; i <= n; i++) {
    const res = req.apply(state, i);
    state = res.state;
    status = res.status;
    statuses.push(res.status);
  }
  const once = req.apply(initial, 1).state;
  const idempotent = same(state, once);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Requête à rejouer">
        {reqs.map((x, i) => (
          <button key={x.label} type="button" role="tab" aria-selected={r === i} onClick={() => { setR(i); setN(0); }}
            className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${r === i ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            {x.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid content-start gap-2">
          <pre className="overflow-x-auto rounded-lg bg-surface-2 p-3 font-mono text-xs text-ink">{`${req.method} ${req.path}${req.body ? `\n${req.body}` : ''}`}</pre>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setN((x) => Math.min(x + 1, 6))} disabled={n >= 6}
              className="rounded-xl bg-signal px-3 py-1.5 text-sm font-medium text-bg disabled:opacity-40">{n === 0 ? 'Envoyer' : 'Rejouer la requête'}</button>
            <button type="button" onClick={() => setN(0)} className="rounded-xl border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-line-strong">Recommencer</button>
          </div>
          <p className="text-xs text-ink-2">Envois : <span className="font-mono text-ink">{n}</span>{n > 0 && <> · dernière réponse : <span className="font-mono text-ink">{status}</span></>}</p>
          {statuses.length > 1 && <p className="text-xs text-ink-3">Réponses successives : {statuses.join(' · ')}</p>}
        </div>

        <div className="rounded-xl border border-line bg-bg p-3">
          <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">État du serveur · table notes</p>
          <ul className="mt-2 grid gap-1">
            {state.length === 0 && <li className="text-sm text-ink-3">(vide)</li>}
            {state.map((x) => (
              <motion.li key={x.id} layout initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                className={`flex justify-between rounded-md px-2 py-1 font-mono text-xs ${x.id === 42 ? 'bg-surface-2 text-ink' : 'bg-amber-soft text-ink'}`}>
                <span>note #{x.id}</span><span>{x.montant} €</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {n >= 2 ? (
        <motion.p key={`${r}-${idempotent}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className={`text-base font-semibold ${idempotent ? 'text-synapse' : 'text-danger'}`}>
          {idempotent ? `✓ Idempotent : après ${n} envois, même état qu’après un seul` : `✕ Pas idempotent : ${n} envois, ${n} effets`}
        </motion.p>
      ) : (
        <p className="text-sm text-ink-2">Envoie la requête, puis rejoue-la comme le ferait un client après un doute réseau.</p>
      )}
      <p className="text-sm text-ink-2">Idempotent ne veut pas dire « même réponse » : regarde DELETE, dont la deuxième réponse peut changer alors que l’état final reste le même.</p>
    </div>
  );
}
