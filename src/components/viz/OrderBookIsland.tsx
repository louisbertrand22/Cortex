import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

/** Carnet d'ordres de l'action (fictive) Cycléa : passer un ordre au marché ou à cours limité. */
type Level = { price: number; qty: number };
const ASKS: Level[] = [
  { price: 13.52, qty: 300 },
  { price: 13.54, qty: 500 },
  { price: 13.56, qty: 800 },
  { price: 13.6, qty: 1200 },
];
const BIDS: Level[] = [
  { price: 13.48, qty: 400 },
  { price: 13.46, qty: 600 },
  { price: 13.44, qty: 900 },
  { price: 13.4, qty: 1500 },
];
const eur = (v: number) => v.toFixed(2).replace('.', ',');
const qty = (v: number) => v.toLocaleString('fr-FR');

export default function OrderBookIsland() {
  const [asks, setAsks] = useState<Level[]>(ASKS);
  const [bids, setBids] = useState<Level[]>(BIDS);
  const [last, setLast] = useState(13.5);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [type, setType] = useState<'market' | 'limit'>('market');
  const [amount, setAmount] = useState(500);
  const [limit, setLimit] = useState(13.5);
  const [msg, setMsg] = useState('Choisis un sens, un type d’ordre et une quantité, puis envoie l’ordre.');

  const send = () => {
    const book = (side === 'buy' ? asks : bids).map((l) => ({ ...l }));
    const crosses = (p: number) => type === 'market' || (side === 'buy' ? p <= limit : p >= limit);
    let left = amount;
    let cost = 0;
    let levels = 0;
    let lastPrice = last;
    while (left > 0 && book.length && crosses(book[0].price)) {
      const take = Math.min(left, book[0].qty);
      cost += take * book[0].price;
      left -= take;
      lastPrice = book[0].price;
      levels++;
      book[0].qty -= take;
      if (book[0].qty === 0) book.shift();
    }
    const done = amount - left;
    let rest = '';
    let mine: Level[] = side === 'buy' ? bids : asks;
    if (left > 0 && type === 'limit') {
      const existing = mine.find((l) => Math.abs(l.price - limit) < 1e-9);
      mine = existing
        ? mine.map((l) => (l === existing ? { ...l, qty: l.qty + left } : l))
        : [...mine, { price: limit, qty: left }].sort((a, b) => (side === 'buy' ? b.price - a.price : a.price - b.price));
      rest = ` ${qty(left)} titres restent en attente dans le carnet à ${eur(limit)} €.`;
    } else if (left > 0) {
      rest = ` Il n’y avait pas assez de vendeurs : ${qty(left)} titres n’ont pas été exécutés.`;
    }
    if (side === 'buy') {
      setAsks(book);
      setBids(mine);
    } else {
      setBids(book);
      setAsks(mine);
    }
    if (done > 0) setLast(lastPrice);
    setMsg(
      done > 0
        ? `${side === 'buy' ? 'Achat' : 'Vente'} de ${qty(done)} titres à ${eur(cost / done)} € en moyenne, sur ${levels} niveau${levels > 1 ? 'x' : ''} de prix.${rest}`
        : `Aucune contrepartie à ${eur(limit)} € ou mieux : ton ordre attend dans le carnet.${rest}`,
    );
  };

  const reset = () => {
    setAsks(ASKS);
    setBids(BIDS);
    setLast(13.5);
    setMsg('Carnet remis à zéro.');
  };

  const spread = asks.length && bids.length ? asks[0].price - bids[0].price : null;
  const maxQty = Math.max(...asks.map((l) => l.qty), ...bids.map((l) => l.qty), 1);
  const row = (l: Level, kind: 'ask' | 'bid') => (
    <motion.div
      layout
      key={`${kind}-${l.price}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative grid grid-cols-2 px-3 py-1 font-mono text-sm tabular-nums"
    >
      <motion.span
        className={`absolute inset-y-0.5 right-0 rounded-sm ${kind === 'ask' ? 'bg-signal-soft' : 'bg-synapse-soft'}`}
        animate={{ width: `${(l.qty / maxQty) * 100}%` }}
      />
      <span className={`relative ${kind === 'ask' ? 'text-signal' : 'text-synapse'}`}>{eur(l.price)} €</span>
      <span className="relative text-right text-ink">{qty(l.qty)}</span>
    </motion.div>
  );

  const btn = (on: boolean) => `rounded-full border px-3 py-1.5 text-sm transition-colors ${on ? 'border-signal bg-signal-soft text-ink' : 'border-line bg-surface text-ink-2 hover:text-ink'}`;

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="grid grid-cols-2 border-b border-line px-3 py-2 text-xs text-ink-3">
          <span>Prix</span>
          <span className="text-right">Quantité</span>
        </div>
        <p className="px-3 pt-2 text-xs text-ink-3">Vendeurs (offre)</p>
        <AnimatePresence initial={false}>{[...asks].reverse().map((l) => row(l, 'ask'))}</AnimatePresence>
        <div className="my-1 flex justify-between border-y border-line bg-surface-2 px-3 py-1.5 text-xs text-ink-2">
          <span>Dernier cours : <strong className="font-mono text-ink">{eur(last)} €</strong></span>
          <span>Écart : <span className="font-mono">{spread === null ? '—' : `${eur(spread)} €`}</span></span>
        </div>
        <AnimatePresence initial={false}>{bids.map((l) => row(l, 'bid'))}</AnimatePresence>
        <p className="px-3 pb-2 text-xs text-ink-3">Acheteurs (demande)</p>
      </div>

      <div className="grid content-start gap-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn(side === 'buy')} onClick={() => setSide('buy')}>Acheter</button>
          <button type="button" className={btn(side === 'sell')} onClick={() => setSide('sell')}>Vendre</button>
          <span className="w-2" />
          <button type="button" className={btn(type === 'market')} onClick={() => setType('market')}>Au marché</button>
          <button type="button" className={btn(type === 'limit')} onClick={() => setType('limit')}>À cours limité</button>
        </div>
        <label className="grid gap-1 text-sm">
          <span className="flex justify-between text-ink-2"><span>Quantité</span><span className="font-mono text-ink tabular-nums">{qty(amount)} titres</span></span>
          <input type="range" min={100} max={3000} step={100} value={amount} onChange={(e) => setAmount(Number(e.target.value))} aria-label="Quantité de titres" className="accent-[var(--signal)]" />
        </label>
        {type === 'limit' && (
          <label className="grid gap-1 text-sm">
            <span className="flex justify-between text-ink-2">
              <span>{side === 'buy' ? 'Prix maximum' : 'Prix minimum'}</span>
              <span className="font-mono text-ink tabular-nums">{eur(limit)} €</span>
            </span>
            <input type="range" min={13.3} max={13.7} step={0.02} value={limit} onChange={(e) => setLimit(Number(e.target.value))} aria-label="Prix limite" className="accent-[var(--signal)]" />
          </label>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={send} className="rounded-full bg-signal px-4 py-2 text-sm font-semibold text-bg hover:opacity-90">
            Envoyer l’ordre
          </button>
          <button type="button" onClick={reset} className="text-xs text-ink-3 hover:text-ink">Recommencer</button>
        </div>
        <motion.p key={msg} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-ink-2">{msg}</motion.p>
      </div>
    </div>
  );
}
