import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, Loader2, X, Wifi, WifiOff } from 'lucide-react';
import api from '../../lib/api';

interface QuoteData {
  symbol: string;
  exchange: string;
  ltp: number;
  open: number;
  high: number;
  low: number;
  prev_close: number;
  change: number;
  change_pct: number;
  volume: number;
}

interface Props {
  exchange: string;
  onPriceSelected: (price: number) => void;
}

export function TickerSearch({ exchange, onPriceSelected }: Props) {
  const [symbol, setSymbol] = useState('');
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchQuote = useCallback(async (sym: string) => {
    if (!sym.trim()) return;
    setLoading(true);
    setError(null);
    setQuote(null);
    setDismissed(false);
    try {
      const { data } = await api.get<QuoteData>('/quote', {
        params: { symbol: sym.trim(), exchange },
      });
      setQuote(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        'Could not fetch price. Check ticker or try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [exchange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setSymbol(val);
    setQuote(null);
    setError(null);
    // Debounce: auto-fetch after 800ms of no typing
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length >= 2) {
      debounceRef.current = setTimeout(() => fetchQuote(val), 800);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      fetchQuote(symbol);
    }
  };

  const handleUsePrice = () => {
    if (quote) {
      onPriceSelected(quote.ltp);
      setDismissed(true);
    }
  };

  const isUp = (quote?.change ?? 0) >= 0;
  const mcxMode = exchange === 'MCX';

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">
          Live Price Lookup
        </span>
        {mcxMode ? (
          <span className="flex items-center gap-1 text-[9px] text-amber-400/70 font-bold">
            <WifiOff size={10} /> MCX not supported
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[9px] text-emerald-400/70 font-bold">
            <Wifi size={10} /> Yahoo Finance
          </span>
        )}
      </div>

      {/* Input Row */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/50 pointer-events-none"
          />
          <input
            type="text"
            value={symbol}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={mcxMode ? 'Not available for MCX' : 'RELIANCE, INFY, NIFTY50…'}
            disabled={mcxMode}
            className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold text-white placeholder-muted/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed font-mono tracking-wider"
          />
          {loading && (
            <Loader2
              size={14}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary animate-spin"
            />
          )}
        </div>
      </div>

      {/* Quote Card */}
      <AnimatePresence>
        {quote && !dismissed && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className={`relative rounded-xl border p-4 ${
              isUp
                ? 'border-emerald-500/20 bg-emerald-500/5'
                : 'border-rose-500/20 bg-rose-500/5'
            }`}
          >
            {/* Dismiss button */}
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-2.5 right-2.5 text-muted/40 hover:text-muted transition-colors"
            >
              <X size={13} />
            </button>

            <div className="flex items-start justify-between pr-5">
              {/* Left: symbol + price */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-white tracking-wider">
                    {quote.symbol}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/10 text-muted font-bold">
                    {quote.exchange}
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black font-mono text-white tabular-nums">
                    ₹{quote.ltp.toLocaleString()}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-xs font-bold mb-0.5 ${
                      isUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {isUp ? '+' : ''}
                    {quote.change} ({isUp ? '+' : ''}
                    {quote.change_pct}%)
                  </span>
                </div>
              </div>

              {/* Right: OHLC mini-grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-right">
                {[
                  { label: 'Open', value: quote.open },
                  { label: 'High', value: quote.high },
                  { label: 'Low', value: quote.low },
                  { label: 'Prev', value: quote.prev_close },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[8px] text-muted/50 uppercase font-bold">{label}</p>
                    <p className="text-[11px] font-mono font-black text-white/70">
                      ₹{value?.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Use as Buy Price button */}
            <button
              onClick={handleUsePrice}
              className="mt-3 w-full py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary text-[10px] font-black tracking-widest uppercase hover:bg-primary/30 transition-all duration-200"
            >
              ↳ Use ₹{quote.ltp} as Buy Price
            </button>
          </motion.div>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[10px] text-rose-400 font-bold px-1"
          >
            ⚠ {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
