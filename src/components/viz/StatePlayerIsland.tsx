import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

// State : le lecteur multimédia de l'exposé, chaque état décide de l'action et de la transition (ACOO session 7, « State »)
type StateName = 'StoppedState' | 'PlayingState' | 'PausedState';
type Action = 'play' | 'stop';
// table fidèle au code de l'exposé : message affiché et état suivant (null = pas de transition)
const behavior: Record<StateName, Record<Action, { msg: string; next: StateName | null }>> = {
  StoppedState: { play: { msg: 'Démarrage de la lecture', next: 'PlayingState' }, stop: { msg: 'Déjà arrêté', next: null } },
  PlayingState: { play: { msg: 'Mise en pause', next: 'PausedState' }, stop: { msg: 'Arrêt de la lecture', next: 'StoppedState' } },
  PausedState: { play: { msg: 'Reprise de la lecture', next: 'PlayingState' }, stop: { msg: 'Arrêt depuis pause', next: 'StoppedState' } },
};
const states: { name: StateName; icon: string }[] = [
  { name: 'StoppedState', icon: '■' },
  { name: 'PlayingState', icon: '▶' },
  { name: 'PausedState', icon: '❚❚' },
];
type Line = { id: number; from: StateName; action: Action; msg: string; next: StateName | null };

export default function StatePlayerIsland() {
  const [state, setState] = useState<StateName>('StoppedState');
  const [log, setLog] = useState<Line[]>([]);

  const press = (action: Action) => {
    const { msg, next } = behavior[state][action];
    setLog((l) => [{ id: (l[0]?.id ?? 0) + 1, from: state, action, msg, next }, ...l].slice(0, 4));
    if (next) setState(next);
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Client → Player</span>
        <button type="button" onClick={() => press('play')} className="rounded-xl bg-signal px-3 py-1.5 font-mono text-sm font-medium text-bg">player.play()</button>
        <button type="button" onClick={() => press('stop')} className="rounded-xl border border-line px-3 py-1.5 font-mono text-sm text-ink-2 hover:border-signal">player.stop()</button>
      </div>

      <div>
        <p className="mb-2 font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">État courant du Player (Context)</p>
        <div className="grid grid-cols-3 gap-2">
          {states.map((s) => {
            const on = s.name === state;
            return (
              <motion.div key={s.name} animate={{ scale: on ? 1 : 0.96 }}
                className={`rounded-xl border p-2 text-center ${on ? 'border-signal bg-signal-soft' : 'border-line bg-bg'}`}>
                <p className={`text-lg ${on ? 'text-signal' : 'text-ink-3'}`} aria-hidden="true">{s.icon}</p>
                <p className="font-mono text-[0.7rem] break-all text-ink sm:text-xs">{s.name}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-bg p-3">
        <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Délégation · qui a traité l'appel</p>
        {log.length === 0 && <p className="mt-2 text-sm text-ink-3">Appuie sur play() ou stop() : le Player passe le relais à son état.</p>}
        <ol className="mt-2 grid gap-1.5">
          <AnimatePresence initial={false}>
            {log.map((l, i) => (
              <motion.li key={l.id} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: i ? 0.55 : 1, y: 0 }}
                className="rounded-md bg-surface-2 px-2 py-1.5 font-mono text-xs text-ink">
                <span className="text-ink-3">{l.from}.</span>{l.action}(player)
                <span className="text-ink-3"> → </span>« {l.msg} »
                <span className={l.next ? 'text-synapse' : 'text-ink-3'}>{l.next ? ` → setState(${l.next})` : ' → pas de transition'}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      </div>
      <p className="text-sm text-ink-2">Le même bouton play() met en lecture, en pause ou reprend : le Player ne teste jamais son état, c'est l'objet état courant qui choisit le comportement et la transition.</p>
    </div>
  );
}
