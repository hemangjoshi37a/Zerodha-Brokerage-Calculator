import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalculatorForm } from './features/calculator/CalculatorForm';
import { ResultsDisplay } from './features/calculator/ResultsDisplay';
import { HistoryList } from './features/history/HistoryList';
import { AnalyticsDashboard } from './features/analytics/AnalyticsDashboard';
import { TargetPriceEngine } from './features/calculator/TargetPriceEngine';
import { ScenarioComparison } from './features/calculator/ScenarioComparison';
import { PositionSizer } from './features/calculator/PositionSizer';
import type { Trade, CalculationRequest } from './types';
import { useCalculate, useStats } from './hooks/useTrade';
import {
  Wallet, ShieldCheck, Activity,
  BarChart3, LayoutGrid, Target, GitCompare, Calculator
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from './components/ui/Base';

type ViewType = 'calculator' | 'analytics' | 'tools';

function App() {
  const [view, setView] = useState<ViewType>('calculator');
  const [toolTab, setToolTab] = useState<'target' | 'compare' | 'sizer'>('target');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  // Shared form state — lifted up so tools can read it
  const [formData, setFormData] = useState<CalculationRequest>({
    segment: 'equity_intraday',
    exchange: 'NSE',
    buy_price: 1000,
    sell_price: 1100,
    quantity: 100,
    multiplier: 1,
  });

  const calculateMutation = useCalculate();
  const { query: statsQuery } = useStats();
  const { data: stats } = useQuery(statsQuery);

  useEffect(() => {
    if (calculateMutation.data) {
      setSelectedTrade(calculateMutation.data);
    }
  }, [calculateMutation.data]);

  const navTabs: { id: ViewType; label: string; icon: any }[] = [
    { id: 'calculator', label: 'CALCULATOR', icon: LayoutGrid },
    { id: 'analytics', label: 'ANALYTICS', icon: BarChart3 },
    { id: 'tools', label: 'TOOLS', icon: Calculator },
  ];

  const toolTabs = [
    { id: 'target' as const, label: 'TARGET PRICE', icon: Target },
    { id: 'compare' as const, label: 'COMPARE', icon: GitCompare },
    { id: 'sizer' as const, label: 'POSITION SIZER', icon: Calculator },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12 min-h-screen flex flex-col">
      {/* Header */}
      <header className="mb-10 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 border border-primary/20"
        >
          <ShieldCheck size={14} />
          <span>INSTITUTIONAL GRADE TRADING ANALYTICS</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl lg:text-7xl font-black bg-gradient-to-b from-white to-white/30 bg-clip-text text-transparent mb-6 tracking-tighter"
        >
          BROKERAGE QUANT
        </motion.h1>

        {/* ── TODAY'S INSERTIONS LIVE COUNTER ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-7"
        >
          <div className="relative flex items-center gap-5 px-8 py-4 bg-black/50 border border-white/8 rounded-2xl backdrop-blur-xl shadow-[0_0_40px_rgba(59,130,246,0.08)]">
            {/* Animated glow ring */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-40" />
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center">
                <Activity size={22} className="text-primary" />
              </div>
            </div>

            <div className="text-left">
              <p className="text-[9px] font-black text-muted uppercase tracking-[0.25em] mb-0.5">
                Today's Insertions
              </p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black font-mono text-white leading-none tabular-nums">
                  {stats?.today_trades ?? 0}
                </span>
                <span className="text-xs text-muted/60 font-bold mb-1">
                  / {stats?.total_trades ?? 0} total
                </span>
              </div>
            </div>

            <div className="w-px h-10 bg-white/5 mx-1" />

            <div className="text-left">
              <p className="text-[9px] font-black text-muted uppercase tracking-[0.25em] mb-0.5">
                Today's Net P&L
              </p>
              <span className={`text-xl font-black font-mono leading-none tabular-nums ${
                (stats?.total_net_profit ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {(stats?.total_net_profit ?? 0) >= 0 ? '+' : ''}
                ₹{(stats?.total_net_profit ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Live indicator */}
            <div className="absolute top-2.5 right-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[8px] font-bold text-emerald-400/70 uppercase tracking-widest">LIVE</span>
            </div>
          </div>
        </motion.div>

        {/* Main nav */}
        <div className="flex items-center justify-center gap-1.5 p-1.5 bg-black/40 border border-white/5 rounded-2xl w-fit mx-auto backdrop-blur-xl">
          {navTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-black text-[10px] tracking-widest",
                view === id ? "bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]" : "text-muted hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </header>


      <main className="flex-grow">
        <AnimatePresence mode="wait">

          {/* === CALCULATOR VIEW === */}
          {view === 'calculator' && (
            <motion.div
              key="calc"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left: Form + live metrics */}
              <div className="lg:col-span-4 space-y-5">
                <CalculatorForm formData={formData} onFormChange={setFormData} />

                <div className="hidden lg:block glass-panel p-5 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Activity className="text-primary animate-pulse" size={16} />
                    <span>LIVE METRICS</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <MetricBox label="TODAY" value={stats?.today_trades?.toString() ?? '0'} />
                    <MetricBox label="TOTAL" value={stats?.total_trades?.toString() ?? '0'} />
                    {stats?.total_net_profit !== undefined && (
                      <>
                        <MetricBox
                          label="NET P&L"
                          value={`₹${Math.abs(stats.total_net_profit).toFixed(0)}`}
                          color={stats.total_net_profit >= 0 ? 'emerald' : 'rose'}
                        />
                        <MetricBox
                          label="CHARGES"
                          value={`₹${(stats.total_charges ?? 0).toFixed(0)}`}
                          color="blue"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Center: Results */}
              <div className="lg:col-span-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTrade?.id ?? 'empty'}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ResultsDisplay trade={selectedTrade} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right: History */}
              <div className="lg:col-span-3">
                <HistoryList onSelect={setSelectedTrade} />
              </div>
            </motion.div>
          )}

          {/* === ANALYTICS VIEW === */}
          {view === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <AnalyticsDashboard />
            </motion.div>
          )}

          {/* === TOOLS VIEW === */}
          {view === 'tools' && (
            <motion.div
              key="tools"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-6"
            >
              {/* Tool sub-nav */}
              <div className="flex items-center gap-1.5 p-1.5 bg-black/40 border border-white/5 rounded-xl w-fit backdrop-blur-xl">
                {toolTabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setToolTab(id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-black text-[9px] tracking-widest",
                      toolTab === id ? "bg-secondary text-white shadow-[0_0_14px_rgba(139,92,246,0.3)]" : "text-muted hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon size={12} />
                    {label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {toolTab === 'target' && (
                  <motion.div key="target" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <p className="text-xs text-muted font-bold uppercase tracking-widest">
                        Using current form config — go to Calculator tab to change inputs.
                      </p>
                      <TargetPriceEngine formData={formData} />
                    </div>
                    <div className="glass-panel p-6 space-y-4">
                      <h3 className="text-sm font-black text-white">How it works</h3>
                      <div className="space-y-3 text-xs text-muted/70 leading-relaxed">
                        <p>The <span className="text-primary font-bold">Target Price Engine</span> uses a precise binary-search algorithm to reverse-calculate the exact exit price needed to achieve your desired net profit — <em>after</em> all Zerodha charges are deducted.</p>
                        <p>It also computes your <span className="text-blue-400 font-bold">true breakeven</span> exit (the price at which charges are exactly covered) and your <span className="text-rose-400 font-bold">stop-loss level</span> with the associated P&L impact.</p>
                        <p className="font-bold text-white/60">This is more accurate than simple (target ÷ qty + buy) math because it accounts for STT, GST, stamp duty, and exchange charges.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {toolTab === 'compare' && (
                  <motion.div key="compare" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ScenarioComparison formData={formData} />
                    <div className="glass-panel p-6 space-y-4">
                      <h3 className="text-sm font-black text-white">Scenario Comparison</h3>
                      <div className="space-y-3 text-xs text-muted/70 leading-relaxed">
                        <p>Add up to <span className="text-primary font-bold">4 scenarios</span> and compare them side-by-side. Each scenario is fully independent — you can change the segment, exchange, buy/sell prices, and quantity per scenario.</p>
                        <p>The <span className="text-yellow-400 font-bold">🏆 winner</span> (highest net profit) is automatically highlighted. You'll see ROI%, total charges, and cost-to-turnover ratio for each scenario.</p>
                        <p className="font-bold text-white/60">Note: Comparison runs do NOT save to your trade history.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {toolTab === 'sizer' && (
                  <motion.div key="sizer" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PositionSizer buyPrice={formData.buy_price} />
                    <div className="glass-panel p-6 space-y-4">
                      <h3 className="text-sm font-black text-white">Position Sizer</h3>
                      <div className="space-y-3 text-xs text-muted/70 leading-relaxed">
                        <p>The <span className="text-amber-400 font-bold">Position Sizer</span> uses the <span className="text-white font-bold">1% / 2% rule</span> of professional risk management.</p>
                        <p>Input your <em>total capital</em>, the <em>maximum % you're willing to risk</em> on this trade, and your <em>per-unit stop-loss distance</em>. The sizer calculates the maximum safe lot size.</p>
                        <div className="bg-white/5 rounded-xl p-3 font-mono text-[10px] space-y-1 text-white/60">
                          <p>qty = floor(capital × risk% ÷ stop_loss_per_unit)</p>
                          <p>max_loss = qty × stop_loss_per_unit</p>
                        </div>
                        <p className="font-bold text-rose-400/80">⚠ Never risk more than 2% of capital on a single trade.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-muted font-bold tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <Wallet size={14} />
          <span>BROKERAGE QUANT v3.1</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SYSTEM OPERATIONAL
          </span>
          <span>© 2024 HJ ZERODHA PRO</span>
        </div>
      </footer>
    </div>
  );
}

function MetricBox({ label, value, color }: { label: string; value: string; color?: string }) {
  const colors: Record<string, string> = {
    emerald: 'text-emerald-400',
    rose: 'text-rose-400',
    blue: 'text-blue-400',
  };
  return (
    <div className="bg-black/20 rounded-xl p-3 border border-border group hover:border-primary/30 transition-colors">
      <p className="text-[9px] text-muted mb-1 group-hover:text-primary/70 transition-colors uppercase tracking-wider">{label}</p>
      <p className={`font-mono text-base font-black ${color ? colors[color] : 'text-primary'}`}>{value}</p>
    </div>
  );
}

export default App;
