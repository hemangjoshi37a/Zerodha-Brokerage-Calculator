import { useState, useEffect, useRef } from 'react';
import type { Trade } from '../../types';
import { Card, Label } from '../../components/ui/Base';
import {
  TrendingUp, TrendingDown, Info, ShieldCheck, Activity,
  Copy, Check, ReceiptIndianRupee, Percent, BarChart2
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  BarElement,
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler
);

interface ResultsDisplayProps {
  trade: Trade | null;
}

// Animated counter for the net profit number
function AnimatedNumber({ value, prefix = '' }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    const duration = 600;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setDisplay(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(tick);
      else prevRef.current = end;
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
    </span>
  );
}

export function ResultsDisplay({ trade }: ResultsDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'charges' | 'projection'>('overview');

  const handleCopy = () => {
    if (!trade) return;
    const { results: r } = trade;
    const text = [
      `Segment: ${trade.segment.replace(/_/g, ' ').toUpperCase()}`,
      `Exchange: ${trade.exchange}`,
      `Buy: ₹${trade.buy_price} | Sell: ₹${trade.sell_price} | Qty: ${trade.quantity}`,
      `---`,
      `Net P&L: ₹${r.net_profit.toFixed(2)}`,
      `Total Charges: ₹${r.total_charges.toFixed(2)}`,
      `Breakeven at: ₹${r.points_to_breakeven.toFixed(2)}`,
      `Brokerage: ₹${r.brokerage.toFixed(2)} | STT: ₹${r.stt.toFixed(2)}`,
      `GST: ₹${r.gst.toFixed(2)} | Stamp: ₹${r.stamp_duty.toFixed(2)}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!trade) {
    return (
      <Card className="flex flex-col items-center justify-center min-h-[450px] text-muted space-y-6 group" glow>
        <div className="p-6 rounded-full bg-white/5 group-hover:bg-primary/10 transition-colors duration-500">
          <Activity size={48} className="opacity-20 group-hover:opacity-50 transition-opacity" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-white/60">Awaiting Data Input</p>
          <p className="text-sm text-muted">Configure your trade parameters to begin analysis</p>
        </div>
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs opacity-30">
          {['ROI', 'CHARGES', 'BREAKEVEN'].map(l => (
            <div key={l} className="bg-white/5 rounded-xl h-12 flex items-center justify-center">
              <span className="text-[8px] font-bold tracking-widest text-muted">{l}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const { results } = trade;
  const isProfit = results.net_profit >= 0;
  const isDelivery = trade.segment === 'equity_delivery';
  const capitalDeployed = trade.buy_price * trade.quantity * (trade.multiplier ?? 1);
  const roiPct = capitalDeployed > 0 ? (results.net_profit / capitalDeployed) * 100 : 0;
  const chargePct = results.turnover > 0 ? (results.total_charges / results.turnover) * 100 : 0;
  const effectiveBrokerageRate = results.turnover > 0 ? (results.brokerage / results.turnover) * 100 : 0;

  // STCG estimate: delivery trades held short-term → 15% on profit
  const stcgTax = isDelivery && isProfit ? results.net_profit * 0.15 : 0;
  const postTaxProfit = isDelivery && isProfit ? results.net_profit - stcgTax : results.net_profit;

  // Chart: Doughnut charge breakdown
  const doughnutData = {
    labels: ['Brokerage', 'STT/CTT', 'GST', 'Stamp', 'Exchange', 'SEBI'],
    datasets: [{
      data: [
        results.brokerage,
        results.stt,
        results.gst,
        results.stamp_duty,
        results.exchange_txn_charges,
        results.sebi_charges,
      ],
      backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'],
      hoverBackgroundColor: ['#60a5fa', '#a78bfa', '#fbbf24', '#34d399', '#f87171', '#22d3ee'],
      borderWidth: 0,
      cutout: '70%',
    }],
  };

  // Chart: P&L projection across a range of exit prices
  const priceRange = Array.from({ length: 13 }, (_, i) => trade.buy_price * (0.94 + i * 0.01));
  const lineData = {
    labels: priceRange.map(p => `₹${p.toFixed(0)}`),
    datasets: [{
      label: 'Net P&L',
      data: priceRange.map(p => ((p - trade.buy_price) * trade.quantity) - results.total_charges),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.07)',
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointBackgroundColor: priceRange.map(p =>
        ((p - trade.buy_price) * trade.quantity) - results.total_charges >= 0 ? '#10b981' : '#ef4444'
      ),
      borderWidth: 2,
    }],
  };

  // Chart: Charges bar breakdown
  const barData = {
    labels: ['Brokerage', 'STT', 'Exchange', 'SEBI', 'GST', 'Stamp'],
    datasets: [{
      label: 'Charge (₹)',
      data: [results.brokerage, results.stt, results.exchange_txn_charges, results.sebi_charges, results.gst, results.stamp_duty],
      backgroundColor: ['rgba(59,130,246,0.6)', 'rgba(139,92,246,0.6)', 'rgba(245,158,11,0.6)', 'rgba(6,182,212,0.6)', 'rgba(239,68,68,0.6)', 'rgba(16,185,129,0.6)'],
      borderRadius: 6,
    }],
  };

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#4b5563', font: { size: 9 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4b5563', font: { size: 9 } } },
    },
  };

  return (
    <div className="space-y-5">
      {/* Hero P&L card */}
      <Card className="text-center relative overflow-hidden group" glow>
        <div className={`absolute inset-0 opacity-5 pointer-events-none bg-gradient-to-br ${isProfit ? 'from-emerald-400' : 'from-rose-500'} to-transparent`} />

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-all group/copy"
          title="Copy results"
        >
          <AnimatePresence mode="wait">
            {copied
              ? <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={14} className="text-emerald-400" /></motion.div>
              : <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy size={14} /></motion.div>}
          </AnimatePresence>
        </button>

        <Label className="mb-2">Estimated Net P&L</Label>
        <div className={`text-5xl lg:text-6xl font-black flex items-center justify-center gap-3 py-2 ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
          <span className="text-2xl opacity-40">₹</span>
          <AnimatedNumber value={results.net_profit} />
          {isProfit ? <TrendingUp size={40} /> : <TrendingDown size={40} />}
        </div>

        {/* Quick metric pills */}
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <MetricPill label="ROI" value={`${roiPct >= 0 ? '+' : ''}${roiPct.toFixed(3)}%`} color={roiPct >= 0 ? 'emerald' : 'rose'} icon={Percent} />
          <MetricPill label="CHARGES" value={`₹ ${results.total_charges.toFixed(2)}`} color="blue" icon={ReceiptIndianRupee} />
          <MetricPill label="COST/TURN" value={`${chargePct.toFixed(3)}%`} color="violet" icon={BarChart2} />
        </div>

        {isDelivery && isProfit && (
          <div className="mt-4 mx-auto max-w-xs bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 text-center">
            <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wider mb-0.5">STCG Tax Estimate (15%)</p>
            <p className="text-sm font-black text-amber-300">−₹ {stcgTax.toFixed(2)}</p>
            <p className="text-[9px] text-muted mt-0.5">Post-tax: ₹ {postTaxProfit.toFixed(2)}</p>
          </div>
        )}

        <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase">
            <ShieldCheck size={13} className="text-emerald-400" /> SECURE CALC
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase">
            <Activity size={13} className="text-primary animate-pulse" /> REAL-TIME
          </div>
        </div>
      </Card>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-black/40 border border-white/5 rounded-xl p-1">
        {(['overview', 'charges', 'projection'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${activeTab === tab ? 'bg-primary text-white' : 'text-muted hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {/* Doughnut */}
              <Card className="flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Charges Composition</h3>
                  <div className="text-[9px] font-bold px-2 py-1 rounded bg-white/5 text-muted">RATIO</div>
                </div>
                <div className="h-[190px] flex items-center justify-center">
                  <Doughnut data={doughnutData} options={{
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { color: '#9ca3af', padding: 12, font: { size: 9, weight: 'bold' }, usePointStyle: true }
                      }
                    }
                  }} />
                </div>
              </Card>

              {/* Key metrics */}
              <Card className="space-y-3">
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Advanced Metrics</h3>
                <AdvRow label="Gross Profit" value={`₹ ${results.gross_profit?.toFixed(2) ?? '—'}`} />
                <AdvRow label="Total Cost" value={`₹ ${results.total_charges.toFixed(2)}`} />
                <AdvRow label="Turnover" value={`₹ ${results.turnover.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
                <AdvRow label="Breakeven Exit" value={`₹ ${results.points_to_breakeven.toFixed(4)}`} />
                <div className="border-t border-white/5 pt-3 space-y-3">
                  <AdvRow label="Eff. Brokerage Rate" value={`${effectiveBrokerageRate.toFixed(4)}%`} highlight />
                  <AdvRow label="Cost / Turnover" value={`${chargePct.toFixed(4)}%`} highlight />
                  <AdvRow label="ROI on Capital" value={`${roiPct.toFixed(3)}%`} highlight color={roiPct >= 0 ? 'emerald' : 'rose'} />
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'charges' && (
          <motion.div key="charges" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Card className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Detailed Breakdown</h3>
                <Info size={14} className="text-muted" />
              </div>
              <div className="h-[180px]">
                <Bar data={barData} options={{ ...commonChartOptions, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ₹ ${Number(c.raw).toFixed(2)}` } } } }} />
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-3 border-t border-white/5">
                <BreakdownRow label="Brokerage" value={results.brokerage} />
                <BreakdownRow label="STT / CTT" value={results.stt} />
                <BreakdownRow label="Exchange Txn" value={results.exchange_txn_charges} />
                <BreakdownRow label="GST (18%)" value={results.gst} />
                <BreakdownRow label="SEBI Charges" value={results.sebi_charges} />
                <BreakdownRow label="Stamp Duty" value={results.stamp_duty} />
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <span className="text-[10px] font-black text-muted uppercase">TOTAL COST</span>
                <span className="text-lg font-black text-primary font-mono">₹ {results.total_charges.toFixed(2)}</span>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'projection' && (
          <motion.div key="projection" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">P&L Projection (±6% range)</h3>
                <div className="text-[9px] px-2 py-1 rounded bg-white/5 text-muted font-bold">SCENARIO</div>
              </div>
              <div className="h-[260px]">
                <Line data={lineData} options={{
                  maintainAspectRatio: false,
                  scales: {
                    x: { grid: { display: false }, ticks: { color: '#374151', font: { size: 8 } } },
                    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#374151', font: { size: 8 }, callback: (v) => `₹${Number(v).toFixed(0)}` } }
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (c) => ` Net P&L: ₹ ${Number(c.raw).toFixed(2)}` } }
                  }
                }} />
              </div>
              <p className="text-[9px] text-muted/50 text-center mt-3">
                Green dots = profitable exits | Red dots = loss exits | Blue line = charge-adjusted curve
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricPill({ label, value, color, icon: Icon }: { label: string; value: string; color: string; icon: any }) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold ${colorMap[color] ?? colorMap.blue}`}>
      <Icon size={12} />
      <span className="text-muted/60">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function AdvRow({ label, value, highlight, color }: { label: string; value: string; highlight?: boolean; color?: string }) {
  const textColor = color === 'emerald' ? 'text-emerald-400' : color === 'rose' ? 'text-rose-400' : 'text-white';
  return (
    <div className="flex justify-between items-center">
      <span className={`text-[10px] ${highlight ? 'text-muted/80' : 'text-muted/60'} uppercase tracking-wider`}>{label}</span>
      <span className={`text-xs font-black font-mono ${highlight ? textColor : 'text-white/80'}`}>{value}</span>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center group">
      <span className="text-[10px] text-muted group-hover:text-white/80 transition-colors">{label}</span>
      <span className="text-[10px] font-bold font-mono">₹ {value.toFixed(2)}</span>
    </div>
  );
}
