import { motion } from 'motion/react';
import { useState } from 'react';

// Prototype : copie superficielle ou profonde d'un Report, puis modification du clone (ACOO session 1, « Prototype »)
type Headers = { id: string; logo: string };
type Report = { title: string; headers: Headers };
type Mode = 'shallow' | 'deep';

const template = (): Report => ({ title: 'Monthly Report', headers: { id: 'H1', logo: 'logo-bleu.png' } });

export default function CloneDepthIsland() {
  const [mode, setMode] = useState<Mode>('shallow');
  const [orig, setOrig] = useState<Report>(template);
  const [clone, setClone] = useState<Report | null>(null);
  const [touched, setTouched] = useState<'title' | 'logo' | null>(null);

  const reset = (m: Mode = mode) => { setMode(m); setOrig(template()); setClone(null); setTouched(null); };

  const doClone = () => {
    setClone(mode === 'shallow' ? { ...orig } : { ...orig, headers: { ...orig.headers, id: 'H2' } });
    setTouched(null);
  };
  const editTitle = () => { if (!clone) return; setClone({ ...clone, title: 'March Report' }); setTouched('title'); };
  const editLogo = () => {
    if (!clone) return;
    if (mode === 'shallow') {
      // même objet Headers : la modification se voit des deux côtés
      const h = { ...orig.headers, logo: 'logo-rouge.png' };
      setOrig({ ...orig, headers: h });
      setClone({ ...clone, headers: h });
    } else setClone({ ...clone, headers: { ...clone.headers, logo: 'logo-rouge.png' } });
    setTouched('logo');
  };

  const shared = clone !== null && clone.headers.id === orig.headers.id;
  const leaked = touched === 'logo' && shared;

  const Box = ({ name, r, hl }: { name: string; r: Report; hl: boolean }) => (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl border p-3 ${hl ? 'border-danger' : 'border-line'} bg-bg`}>
      <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">{name}</p>
      <p className="mt-1 font-mono text-xs text-ink">Title = "{r.title}"</p>
      <p className="font-mono text-xs text-ink">Headers → <span className="rounded bg-surface-2 px-1">{r.headers.id}</span></p>
    </motion.div>
  );
  const HeadersBox = ({ h, owners }: { h: Headers; owners: string }) => (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-xl border border-dashed p-3 ${leaked ? 'border-danger bg-danger-soft' : 'border-line-strong bg-surface-2'}`}>
      <p className="font-mono text-[0.65rem] tracking-wider text-ink-3 uppercase">Objet Headers {h.id} · référencé par {owners}</p>
      <p className="mt-1 font-mono text-xs text-ink">logo = "{h.logo}"</p>
    </motion.div>
  );

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Type de copie">
        {(['shallow', 'deep'] as Mode[]).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => reset(m)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${mode === m ? 'border-signal bg-signal-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}>
            {m === 'shallow' ? 'Copie superficielle (shallow)' : 'Copie profonde (deep)'}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={doClone} disabled={clone !== null} className="rounded-xl bg-signal px-3 py-1.5 text-sm font-medium text-bg disabled:opacity-40">1. report1 = template.Clone()</button>
        <button type="button" onClick={editTitle} disabled={!clone} className="rounded-xl border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-line-strong disabled:opacity-40">2a. report1.Title = "March Report"</button>
        <button type="button" onClick={editLogo} disabled={!clone} className="rounded-xl border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-line-strong disabled:opacity-40">2b. report1.Headers.logo = "logo-rouge.png"</button>
        <button type="button" onClick={() => reset()} className="rounded-xl border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-line-strong">Recommencer</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid content-start gap-3">
          <Box name="Prototype · template" r={orig} hl={leaked} />
          {!shared && <HeadersBox h={orig.headers} owners="template" />}
        </div>
        <div className="grid content-start gap-3">
          {clone ? <Box name="Clone · report1" r={clone} hl={false} /> : <div className="rounded-xl border border-dashed border-line p-3 text-sm text-ink-3">Pas encore de clone : clique sur « 1. Clone() ».</div>}
          {clone && !shared && <HeadersBox h={clone.headers} owners="report1" />}
        </div>
        {shared && <div className="sm:col-span-2"><HeadersBox h={orig.headers} owners="template et report1" /></div>}
      </div>

      <p className={`text-sm font-medium ${leaked ? 'text-danger' : touched ? 'text-synapse' : 'text-ink-2'}`}>
        {!clone && 'Choisis un type de copie, clone le prototype, puis modifie le clone.'}
        {clone && !touched && (shared ? 'Les deux rapports pointent vers le même objet Headers : seule la référence a été copiée.' : 'Chaque rapport a son propre objet Headers : la copie a suivi la référence.')}
        {touched === 'title' && '✓ Title est une valeur copiée dans le clone : le prototype garde « Monthly Report ».'}
        {touched === 'logo' && (leaked ? '✕ Le prototype a changé de logo aussi : le clone partage son objet Headers.' : '✓ Le prototype garde son logo : le clone a sa propre copie de Headers.')}
      </p>
    </div>
  );
}
