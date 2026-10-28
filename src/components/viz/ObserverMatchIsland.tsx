import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';

// Observer : un match (sujet) notifie ses bots abonnés, en push ou en pull (ACOO session 6, « Observer »)
type Mode = 'push' | 'pull';
type Event = 'but' | 'fin';
type Bot = { id: string; name: string; cares: Event | null; react: (s: State) => string };
type State = { score: string; buteur: string; statut: string };

const bots: Bot[] = [
  { id: 'goal', name: 'GoalTweeter', cares: 'but', react: (s) => `tweete « BUT du ${s.buteur} ! ${s.score} »` },
  { id: 'summary', name: 'MatchSummaryBot', cares: 'fin', react: (s) => `publie le résumé : ${s.score}, match ${s.statut}` },
  { id: 'daily', name: 'DailyRecapBot', cares: null, react: () => 'vérifie l’heure du bilan quotidien : rien à faire' },
];
const buteurs = ['n°9', 'n°10', 'n°7', 'n°11'];

type Line = { id: number; text: string; tone: 'subject' | 'call' | 'react' | 'ignore' };

export default function ObserverMatchIsland() {
  const [mode, setMode] = useState<Mode>('push');
  const [subs, setSubs] = useState<Record<string, boolean>>({ goal: true, summary: true, daily: false });
  const [state, setState] = useState<State>({ score: '0-0', buteur: '—', statut: 'en cours' });
  const [log, setLog] = useState<Line[][]>([]);
  const [calls, setCalls] = useState(0);
  const uidRef = useRef(0);

  const fire = (ev: Event) => {
    let uid = uidRef.current;
    if (state.statut === 'terminé') return;
    const goals = Number(state.score.split('-')[0]);
    const next: State = ev === 'but'
      ? { score: `${goals + 1}-${state.score.split('-')[1]}`, buteur: buteurs[goals % buteurs.length], statut: 'en cours' }
      : { ...state, statut: 'terminé' };
    const lines: Line[] = [{ id: uid++, text: `Match.${ev === 'but' ? 'marquerBut()' : 'terminer()'} → notifier()`, tone: 'subject' }];
    let n = 0;
    bots.filter((b) => subs[b.id]).forEach((b) => {
      if (mode === 'push') { lines.push({ id: uid++, text: `${b.name}.actualiser(${next.score}, ${next.buteur}, ${next.statut})`, tone: 'call' }); n += 1; }
      else { lines.push({ id: uid++, text: `${b.name}.actualiser() → match.getEtat()`, tone: 'call' }); n += 2; }
      const relevant = b.cares === ev;
      lines.push({ id: uid++, text: `   ${b.name} ${relevant ? b.react(next) : b.cares ? 'ignore cet événement' : b.react(next)}`, tone: relevant ? 'react' : 'ignore' });
    });
    uidRef.current = uid;
    setState(next);
    setCalls((c) => c + n);
    setLog((l) => [lines, ...l].slice(0, 3));
  };
  const reset = () => { setState({ score: '0-0', buteur: '—', statut: 'en cours' }); setLog([]); setCalls(0); };
  const toneCls = { subject: 'text-signal', call: 'text-ink', react: 'text-synapse', ignore: 'text-ink-3' };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Mode de notification">
        {(['push', 'pull'] as Mode[]).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); reset(); }}
            className={`rounded-lg border px-3 py-1.5 text-sm ${mode === m ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            {m === 'push' ? 'Push · les données dans update' : 'Pull · notification minimale'}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid content-start gap-3">
          <div className="rounded-xl border border-line bg-bg p-3">
            <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Sujet · Match</p>
            <p className="mt-1 text-2xl font-semibold text-ink tabular-nums">{state.score}</p>
            <p className="text-xs text-ink-3">dernier buteur : {state.buteur} · {state.statut}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => fire('but')} disabled={state.statut === 'terminé'} className="rounded-xl bg-signal px-3 py-1.5 text-sm font-medium text-bg disabled:opacity-40">⚽ But !</button>
              <button type="button" onClick={() => fire('fin')} disabled={state.statut === 'terminé'} className="rounded-xl border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-line-strong disabled:opacity-40">Fin du match</button>
              <button type="button" onClick={reset} className="rounded-xl border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-line-strong">Recommencer</button>
            </div>
          </div>
          <div className="rounded-xl border border-line bg-bg p-3">
            <p className="mb-2 font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Observateurs · attacher / détacher</p>
            {bots.map((b) => (
              <label key={b.id} className="flex items-center gap-2 py-0.5 font-mono text-xs text-ink">
                <input type="checkbox" checked={subs[b.id]} onChange={(e) => setSubs((s) => ({ ...s, [b.id]: e.target.checked }))} className="accent-[var(--signal)]" />
                {b.name}
              </label>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-line bg-bg p-3">
          <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Journal des appels, le plus récent en haut · {calls} appel{calls > 1 ? 's' : ''} vers les observateurs et le sujet</p>
          {log.length === 0 && <p className="mt-2 text-sm text-ink-3">Marque un but pour déclencher une notification.</p>}
          <div className="mt-2 grid gap-2">
            <AnimatePresence initial={false}>
              {log.map((group, gi) => (
                <motion.ul key={group[0].id} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className={`grid gap-0.5 rounded-md p-1.5 ${gi === 0 ? 'bg-surface-2' : 'opacity-60'}`}>
                  {group.map((l) => (
                    <li key={l.id} className={`font-mono text-[0.7rem] break-words whitespace-pre-wrap ${toneCls[l.tone]}`}>{l.text}</li>
                  ))}
                </motion.ul>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <p className="text-sm text-ink-2">Le match ne connaît ses bots qu'à travers l'interface commune : on en attache ou détache un sans toucher à la classe Match. Compare le nombre d'appels en push et en pull pour un même scénario.</p>
    </div>
  );
}
