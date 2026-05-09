import { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Wallet, PieChart, Activity, Download } from 'lucide-react';
import { Card, Button } from '../../components/ui/Base';
import { useStats } from '../../hooks/useTrade';
import { useQuery } from '@tanstack/react-query';
import { DateRangePicker, type DateRange } from '../../components/ui/DateRangePicker';
import { TaxEstimator } from './TaxEstimator';
import { ExportReport } from '../export/ExportReport';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
    label: 'All Time',
  });

  const { query: statsQuery } = useStats(dateRange.from, dateRange.to);
  const { data: stats, isLoading } = useQuery(statsQuery);

  const profitCurveData = useMemo(() => {
    if (!stats?.profit_curve) return null;
    return {
      labels: stats.profit_curve.map((p: any) => new Date(p.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Cumulative Net Profit',
          data: stats.profit_curve.map((p: any) => p.profit),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 2,
        }
      ]
    };
  }, [stats]);

  const chargeBreakdownData = useMemo(() => {
    if (!stats?.charge_breakdown) return null;
    const labels = Object.keys(stats.charge_breakdown).map(k => k.toUpperCase().replace('_', ' '));
    const data = Object.values(stats.charge_breakdown);
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            'rgba(59, 130, 246, 0.6)',
            'rgba(16, 185, 129, 0.6)',
            'rgba(245, 158, 11, 0.6)',
            'rgba(239, 68, 68, 0.6)',
            'rgba(139, 92, 246, 0.6)',
            'rgba(236, 72, 153, 0.6)',
          ],
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
        }
      ]
    };
  }, [stats]);

  const segmentPerformanceData = useMemo(() => {
    if (!stats?.segment_stats) return null;
    const labels = Object.keys(stats.segment_stats).map(s => s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    const data = Object.values(stats.segment_stats).map((s: any) => s.profit);
    return {
      labels,
      datasets: [
        {
          label: 'Net Profit by Segment',
          data,
          backgroundColor: data.map(v => v >= 0 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'),
          borderRadius: 8,
        }
      ]
    };
  }, [stats]);

  const handleExport = () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const params = new URLSearchParams();
    if (dateRange.from) params.set('from', dateRange.from);
    if (dateRange.to) params.set('to', dateRange.to);
    const qs = params.toString();
    window.open(`${baseUrl}/export/csv${qs ? '?' + qs : ''}`, '_blank');
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } } }
    },
    plugins: { legend: { display: false } }
  } as const;

  return (
    <div className="space-y-8 pb-10">

      {/* Date filter + Export row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <DateRangePicker onChange={setDateRange} />
          {dateRange.label !== 'All Time' && (
            <span className="text-[10px] text-primary/70 font-bold uppercase tracking-widest">
              Showing: {dateRange.label}
            </span>
          )}
        </div>
        <Button onClick={handleExport} variant="primary" className="text-xs">
          <Download size={14} />
          EXPORT CSV
        </Button>
      </div>

      {/* PDF Export Row */}
      <ExportReport />

      {/* Top Stats */}
      {isLoading ? (
        <div className="text-center py-20 animate-pulse text-muted font-bold tracking-widest">
          LOADING QUANTUM DATA…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              label="Total Net P&L"
              value={`₹${(stats?.total_net_profit ?? 0).toLocaleString()}`}
              icon={(stats?.total_net_profit ?? 0) >= 0 ? TrendingUp : TrendingDown}
              trend={(stats?.total_net_profit ?? 0) >= 0 ? 'up' : 'down'}
            />
            <StatCard
              label="Total Charges"
              value={`₹${stats?.total_charges?.toLocaleString()}`}
              icon={Wallet}
            />
            <StatCard
              label="Efficiency"
              value={`${(stats?.total_net_profit ?? 0) > 0 ? (100 - ((stats?.total_charges ?? 0) / ((stats?.total_net_profit ?? 0) + (stats?.total_charges ?? 0))) * 100).toFixed(1) : 0}%`}
              icon={Activity}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Chart */}
            <Card className="lg:col-span-8 p-8 h-[400px]">
              <h3 className="text-sm font-black text-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" />
                CUMULATIVE PROFIT CURVE
              </h3>
              <div className="h-[300px]">
                {profitCurveData ? (
                  <Line data={profitCurveData} options={chartOpts} />
                ) : (
                  <EmptyChart />
                )}
              </div>
            </Card>

            {/* Charge Pie */}
            <Card className="lg:col-span-4 p-8 h-[400px]">
              <h3 className="text-sm font-black text-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <PieChart size={16} className="text-secondary" />
                FEE DISTRIBUTION
              </h3>
              <div className="h-[300px] flex items-center justify-center">
                {chargeBreakdownData ? (
                  <Pie
                    data={chargeBreakdownData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { color: 'rgba(255,255,255,0.5)', font: { size: 10 }, padding: 20 }
                        }
                      }
                    }}
                  />
                ) : (
                  <EmptyChart />
                )}
              </div>
            </Card>

            {/* Segment Bar */}
            <Card className="lg:col-span-12 p-8 h-[400px]">
              <h3 className="text-sm font-black text-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Activity size={16} className="text-accent" />
                SEGMENT-WISE PERFORMANCE
              </h3>
              <div className="h-[300px]">
                {segmentPerformanceData ? (
                  <Bar data={segmentPerformanceData} options={chartOpts} />
                ) : (
                  <EmptyChart />
                )}
              </div>
            </Card>

            {/* Tax Estimator — always uses ALL trades regardless of date filter */}
            <div className="lg:col-span-12">
              <TaxEstimator />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-full flex items-center justify-center">
      <p className="text-xs text-muted/30 font-bold uppercase tracking-widest">No data in range</p>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend }: { label: string, value: string, icon: any, trend?: 'up' | 'down' }) {
  return (
    <Card className="p-6 relative group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-white/5 text-muted group-hover:bg-primary/20 group-hover:text-primary transition-all duration-500">
          <Icon size={20} />
        </div>
        {trend && (
            <div className={trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}>
                {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      </div>
    </Card>
  );
}
