import { useState } from 'react';

const samples = {
  en: { label: 'Anglais', tokens: ['The', ' sensor', ' stopped', ' respond', 'ing', ' last', ' night', '.'] },
  fr: { label: 'Français', tokens: ['Le', ' capteur', ' a', ' cessé', ' de', ' répond', 're', ' cette', ' nuit', '.'] },
};
const palette = ['var(--signal-soft)', 'var(--synapse-soft)', 'var(--amber-soft)', 'var(--info-soft)'];

const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: n < 10 ? 2 : 0 });

export default function TokenizerIsland() {
  const [lang, setLang] = useState<'en' | 'fr'>('fr');
  const [input, setInput] = useState(2000);
  const [output, setOutput] = useState(400);
  const [calls, setCalls] = useState(20000);
  const [ratio, setRatio] = useState(4);
  const priceIn = 1; // $ par million de tokens d'entrée (illustratif)
  const perCall = (input * priceIn + output * priceIn * ratio) / 1e6;
  const s = samples[lang];

  const slider = (label: string, v: number, set: (n: number) => void, min: number, max: number, step: number, unit = '') => (
    <label className="grid gap-1 text-sm">
      <span className="flex justify-between text-ink-2"><span>{label}</span><span className="font-mono text-ink">{fmt(v)}{unit}</span></span>
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(Number(e.target.value))} className="accent-[var(--signal)]" />
    </label>
  );

  return (
    <div className="grid gap-6">
      <div>
        <div className="mb-3 flex items-center gap-2">
          {(['en', 'fr'] as const).map((k) => (
            <button key={k} type="button" onClick={() => setLang(k)} className={`rounded-lg border px-3 py-1 text-sm ${lang === k ? 'border-signal text-ink' : 'border-line text-ink-3'}`}>{samples[k].label}</button>
          ))}
          <span className="ml-auto font-mono text-sm text-ink-2"><span className="text-signal">{s.tokens.length}</span> tokens</span>
        </div>
        <div className="flex flex-wrap gap-y-2 rounded-xl border border-line bg-bg p-4 font-mono text-[0.95rem]">
          {s.tokens.map((t, i) => (
            <span key={lang + i} className="rounded px-0.5 whitespace-pre text-ink" style={{ background: palette[i % palette.length], animation: `fadein .4s ${i * 0.05}s both` }}>{t}</span>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-3">Découpage illustratif (pas la sortie d’un vrai tokenizer). Une boîte = un token. Ici 10 tokens contre 8 : en moyenne, le français coûte ~20–30 % de tokens en plus.</p>
      </div>
      <div className="grid gap-4 rounded-xl border border-line bg-bg p-4 sm:grid-cols-2">
        <div className="grid gap-3">
          {slider('Tokens d’entrée par appel', input, setInput, 100, 50000, 100)}
          {slider('Tokens de sortie par appel', output, setOutput, 50, 4000, 50)}
          {slider('Appels par jour', calls, setCalls, 100, 100000, 100)}
          {slider('Prix sortie / prix entrée', ratio, setRatio, 3, 5, 1, '×')}
        </div>
        <div className="grid content-center gap-3 sm:border-l sm:border-line sm:pl-4">
          <div><p className="text-xs text-ink-3">Coût par appel</p><p className="font-display text-3xl text-ink">${perCall.toFixed(4)}</p></div>
          <div><p className="text-xs text-ink-3">Coût par mois (30 j)</p><p className="font-display text-4xl text-signal">${fmt(perCall * calls * 30)}</p></div>
          <div className="text-xs text-ink-3">
            Part de la sortie dans la facture : <span className="font-mono text-ink">{Math.round(((output * ratio) / (input + output * ratio)) * 100)} %</span><br />
            Hypothèse : 1 $ / million de tokens d’entrée — l’ordre de grandeur compte, pas le prix.
          </div>
        </div>
      </div>
      <style>{`@keyframes fadein{from{opacity:0;transform:translateY(4px)}}`}</style>
    </div>
  );
}
