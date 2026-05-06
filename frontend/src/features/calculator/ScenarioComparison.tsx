import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card, Label, Button, CustomSelect } from '../../components/ui/Base';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, Plus, Trash2, RefreshCcw, Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import type { CalculationRequest } from '../../types';

const SEGMENT_LABELS: Record<string, string> = {
  equity_intraday: 'EQ Intraday',
  equity_delivery: 'EQ Delivery',
  equity_futures: 'EQ Futures',
  equity_options: 'EQ Options',
  currency_futures: 'Curr Futures',
  currency_options: 'Curr Options',
  commodity_futures: 'Comm Futures',
  commodity_options: 'Comm Options',
};

const segmentOptions = Object.entries(SEGMENT_LABELS).map(([value, label]) => ({ value, label }));
const exchangeOptions = [
  { value: 'NSE', label: 'NSE' },
  { value: 'BSE', label: 'BSE' },
  { value: 'MCX', label: 'MCX' },
];

type ScenarioInput = {
  name: string;
  segment: string;
  exchange: string;
  buy_price: number;
  sell_price: number;
  quantity: number;
  multiplier: number;
};

type ScenarioResult = {
  net_profit: number;
  total_charges: number;
  brokerage: number;
  turnover: number;
  roi_pct: number;
  charge_to_turnover_pct: number;
};

const defaultScenario = (base?: CalculationRequest): ScenarioInput => ({
  name: 'Scenario',
  segment: base?.segment ?? 'equity_intraday',
  exchange: base?.exchange ?? 'NSE',
  buy_price: base?.buy_price ?? 1000,
  sell_price: base?.sell_price ?? 1100,
  quantity: base?.quantity ?? 100,
  multiplier: base?.multiplier ?? 1,
});

interface Props {
  formData: CalculationRequest;
}

export function ScenarioComparison({ formData }: Props) {
  const [scenarios, setScenarios] = useState<ScenarioInput[]>([
    { ...defaultScenario(formData), name: 'Base' },
    { ...defaultScenario(formData), name: 'Bull Case', sell_price: formData.sell_price * 1.05 },
  ]);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ scenarios: ScenarioResult[] }>('/compare', {
        scenarios: scenarios.map(s => ({
          segment: s.segment,
          exchange: s.exchange,
          buy_price: s.buy_price,
          sell_price: s.sell_price,
          quantity: s.quantity,
          multiplier: s.multiplier,
        })),
      });
      return data.scenarios;
    },
  });

  const results = mutation.data;
  const bestIdx = results
    ? results.reduce((best, r, i) => (r.net_profit > results[best].net_profit ? i : best), 0)
    : -1;

  const updateScenario = (idx: number, key: keyof ScenarioInput, val: any) => {
    setScenarios(prev => prev.map((s, i) => i === idx ? { ...s, [key]: val } : s));
  };

  const addScenario = () => {
    if (scenarios.length < 4) {
      setScenarios(prev => [...prev, { ...defaultScenario(formData), name: `Scenario ${prev.length + 1}` }]);
    }
  };

  const removeScenario = (idx: number) => {
    setScenarios(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
            <GitCompare size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Scenario Comparison</h3>
            <p className="text-[9px] text-muted uppercase tracking-widest">Compare up to 4 trades</p>
          </div>
        </div>
        {scenarios.length < 4 && (
          <button onClick={addScenario}
            className="flex items-center gap-1 text-[10px] text-muted hover:text-primary transition-colors font-bold px-3 py-1.5 border border-white/10 rounded-lg hover:border-primary/30">
            <Plus size={12} /> ADD
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
        {scenarios.map((s, idx) => (
          <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <input
                value={s.name}
                onChange={e => updateScenario(idx, 'name', e.target.value)}
                className="bg-transparent font-black text-sm text-white outline-none border-b border-transparent focus:border-primary/40 transition-colors w-32"
              />
              {scenarios.length > 2 && (
                <button onClick={() => removeScenario(idx)}
                  className="text-muted/40 hover:text-rose-500 transition-colors p-1">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Segment</Label>
                <CustomSelect
                  value={s.segment}
                  onChange={val => updateScenario(idx, 'segment', val)}
                  options={segmentOptions}
                />
              </div>
              <div className="space-y-1">
                <Label>Exchange</Label>
                <CustomSelect
                  value={s.exchange}
                  onChange={val => updateScenario(idx, 'exchange', val)}
                  options={exchangeOptions}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['buy_price', 'sell_price', 'quantity'] as const).map(field => (
                <div key={field} className="space-y-1">
                  <Label>{field === 'buy_price' ? 'Buy ₹' : field === 'sell_price' ? 'Sell ₹' : 'Qty'}</Label>
                  <input
                    type="number"
                    value={s[field]}
                    onChange={e => updateScenario(idx, field, parseFloat(e.target.value) || 0)}
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-2 text-xs text-white font-mono outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="w-full"
        variant="outline"
      >
        {mutation.isPending
          ? <RefreshCcw size={14} className="animate-spin" />
          : <><GitCompare size={14} /> RUN COMPARISON</>}
      </Button>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3 pt-2 border-t border-white/5"
          >
            <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Results</p>
            {results.map((r, i) => {
              const isWinner = i === bestIdx;
              const isProfit = r.net_profit >= 0;
              return (
                <div key={i}
                  className={`rounded-xl p-4 border transition-all duration-300 ${isWinner ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/5 bg-white/5'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {isWinner && <Trophy size={13} className="text-yellow-400" />}
                      <span className="text-xs font-black text-white">{scenarios[i].name}</span>
                    </div>
                    <span className={`text-sm font-black font-mono ${isProfit ? 'text-emerald-400' : 'text-rose-400'} flex items-center gap-1`}>
                      {isProfit ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      ₹ {r.net_profit.toFixed(2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <MiniStat label="ROI" value={`${r.roi_pct}%`} />
                    <MiniStat label="Charges" value={`₹ ${r.total_charges.toFixed(0)}`} />
                    <MiniStat label="Cost %" value={`${r.charge_to_turnover_pct}%`} />
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-black/30 rounded-lg px-2 py-1.5 text-center">
      <p className="text-[8px] text-muted/60 uppercase tracking-wider">{label}</p>
      <p className="text-[11px] font-bold font-mono text-white mt-0.5">{value}</p>
    </div>
  );
}
