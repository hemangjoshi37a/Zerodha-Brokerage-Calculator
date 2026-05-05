import type { Trade } from '../../types';
import { Card, Label } from '../../components/ui/Base';
import { TrendingUp, TrendingDown, Info, ShieldCheck, Activity } from 'lucide-react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  Filler
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  Filler
);

interface ResultsDisplayProps {
  trade: Trade | null;
}

export function ResultsDisplay({ trade }: ResultsDisplayProps) {
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
      </Card>
    );
  }

  const { results } = trade;
  const isProfit = results.net_profit >= 0;

  const doughnutData = {
    labels: ['Brokerage', 'Govt Taxes'],
    datasets: [{
      data: [results.brokerage, results.total_charges - results.brokerage],
      backgroundColor: ['#3b82f6', '#8b5cf6'],
      hoverBackgroundColor: ['#60a5fa', '#a78bfa'],
      borderWidth: 0,
      cutout: '75%'
    }]
  };

  const lineData = {
    labels: Array.from({ length: 11 }, (_, i) => (trade.buy_price * (0.95 + i * 0.01)).toFixed(0)),
    datasets: [{
      label: 'Expected Profit',
      data: Array.from({ length: 11 }, (_, i) => {
        const p = trade.buy_price * (0.95 + i * 0.01);
        return ((p - trade.buy_price) * trade.quantity) - results.total_charges;
      }),
      borderColor: isProfit ? '#10b981' : '#3b82f6',
      backgroundColor: isProfit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 2,
    }]
  };

  return (
    <div className="space-y-6">
      <Card className="text-center relative overflow-hidden group">
        <div className={`absolute inset-0 opacity-5 pointer-events-none bg-gradient-to-br ${isProfit ? 'from-accent' : 'from-red-500'} to-transparent`} />
        <Label className="mb-2">Estimated Net Profit / Loss</Label>
        <div className={`text-6xl font-black flex items-center justify-center gap-4 transition-transform duration-500 group-hover:scale-105 ${isProfit ? 'text-accent' : 'text-red-500'}`}>
          <span className="text-3xl opacity-50">₹</span>
          {results.net_profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          {isProfit ? <TrendingUp size={44} /> : <TrendingDown size={44} />}
        </div>
        <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase">
            <ShieldCheck size={14} className="text-accent" />
            SECURE CALCULATION
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase">
            <Activity size={14} className="text-primary" />
            REAL-TIME DATA
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">Charges Composition</h3>
            <div className="text-[10px] font-bold px-2 py-1 rounded bg-white/5 text-muted">RATIO ANALYSIS</div>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[220px]">
            <Doughnut 
              data={doughnutData} 
              options={{ 
                plugins: { 
                  legend: { 
                    position: 'bottom', 
                    labels: { 
                      color: '#9ca3af',
                      padding: 20,
                      font: { size: 10, weight: 'bold' },
                      usePointStyle: true
                    } 
                  } 
                } 
              }} 
            />
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">Profit Projection</h3>
            <div className="text-[10px] font-bold px-2 py-1 rounded bg-white/5 text-muted">±5% RANGE</div>
          </div>
          <div className="h-[220px]">
            <Line 
              data={lineData} 
              options={{ 
                maintainAspectRatio: false,
                scales: { 
                  x: { grid: { display: false }, ticks: { color: '#4b5563', font: { size: 9 } } },
                  y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#4b5563', font: { size: 9 } } }
                },
                plugins: { legend: { display: false } }
              }} 
            />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">Detailed Charge Breakdown</h3>
          <Info size={14} className="text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          <div className="space-y-4">
            <BreakdownRow label="Brokerage" value={results.brokerage} />
            <BreakdownRow label="STT / CTT" value={results.stt} />
            <BreakdownRow label="Exchange Txn" value={results.exchange_txn_charges} />
          </div>
          <div className="space-y-4">
            <BreakdownRow label="GST (18%)" value={results.gst} />
            <BreakdownRow label="SEBI Charges" value={results.sebi_charges} />
            <BreakdownRow label="Stamp Duty" value={results.stamp_duty} />
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-black text-muted uppercase mb-1">Total Trading Cost</p>
            <p className="text-2xl font-bold text-primary">₹ {results.total_charges.toFixed(2)}</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-[10px] font-black text-muted uppercase mb-1">Break-even Points</p>
            <p className="text-2xl font-bold text-white">{results.points_to_breakeven.toFixed(2)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex justify-between items-center group">
      <span className="text-xs text-muted group-hover:text-white/80 transition-colors">{label}</span>
      <span className="text-xs font-bold font-mono">₹ {value.toFixed(2)}</span>
    </div>
  );
}
