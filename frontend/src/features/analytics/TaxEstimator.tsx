import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Receipt, AlertTriangle, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../../components/ui/Base';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';

interface TaxCategory {
  label: string;
  trade_count: number;
  net_pnl: number;
  taxable_amount: number;
  rate_pct: number;
  note: string;
  estimated_tax: number;
}

interface TaxData {
  disclaimer: string;
  summary: {
    total_pnl: number;
    total_estimated_tax: number;
    effective_rate_pct: number;
  };
  categories: {
    speculative: TaxCategory;
    business: TaxCategory;
    stcg: TaxCategory;
    ltcg: TaxCategory;
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  speculative: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
  business: 'text-violet-400 border-violet-500/20 bg-violet-500/5',
  stcg: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
  ltcg: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
};

const CATEGORY_BADGES: Record<string, string> = {
  speculative: 'bg-amber-500/10 text-amber-400',
  business: 'bg-violet-500/10 text-violet-400',
  stcg: 'bg-blue-500/10 text-blue-400',
  ltcg: 'bg-emerald-500/10 text-emerald-400',
};

function fmt(n: number) {
  return `₹${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function CategoryRow({ id, cat }: { id: string; cat: TaxCategory }) {
  const [expanded, setExpanded] = useState(false);
  const colorClasses = CATEGORY_COLORS[id] ?? 'text-muted border-white/10 bg-white/5';
  const badgeClasses = CATEGORY_BADGES[id] ?? 'bg-white/10 text-muted';

  if (cat.trade_count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-xl border p-4 ${colorClasses} space-y-2`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${badgeClasses}`}>
              {cat.rate_pct}% rate
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider">
              {cat.trade_count} trade{cat.trade_count !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs font-bold text-white/80 mt-1 leading-tight">{cat.label}</p>
        </div>

        <div className="text-right ml-4 flex-shrink-0">
          <p className="text-[9px] text-muted/60 uppercase font-bold">Est. Tax</p>
          <p className="text-lg font-black font-mono">
            {cat.estimated_tax > 0 ? fmt(cat.estimated_tax) : '—'}
          </p>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Net P&L', value: fmt(cat.net_pnl), pos: cat.net_pnl >= 0 },
          { label: 'Taxable', value: fmt(cat.taxable_amount) },
          { label: 'Rate', value: `${cat.rate_pct}%` },
        ].map(({ label, value, pos }) => (
          <div key={label} className="bg-black/20 rounded-lg p-2 text-center">
            <p className="text-[8px] text-muted/50 uppercase font-bold">{label}</p>
            <p className={`text-xs font-black font-mono ${pos === false ? 'text-rose-400' : pos ? 'text-emerald-400' : ''}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Expandable note */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-1 text-[9px] text-muted/50 hover:text-muted transition-colors"
      >
        {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        {expanded ? 'Hide note' : 'Show note'}
      </button>
      {expanded && (
        <p className="text-[10px] text-muted/60 leading-relaxed border-t border-white/5 pt-2">
          {cat.note}
        </p>
      )}
    </motion.div>
  );
}

export function TaxEstimator() {
  const { data, isLoading, isError } = useQuery<TaxData>({
    queryKey: ['tax-estimate'],
    queryFn: async () => {
      const { data } = await api.get<TaxData>('/tax-estimate');
      return data;
    },
    refetchInterval: 30_000,
  });

  const categoryOrder: (keyof TaxData['categories'])[] = [
    'speculative',
    'business',
    'stcg',
    'ltcg',
  ];

  const hasData = useMemo(
    () =>
      data &&
      Object.values(data.categories).some((c) => c.trade_count > 0),
    [data],
  );

  return (
    <Card className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Receipt size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">
              Tax P&L Estimator
            </h3>
            <p className="text-[9px] text-muted/60 font-bold uppercase tracking-wider mt-0.5">
              FY 2024–25 · Estimate Only
            </p>
          </div>
        </div>

        {data?.summary && (
          <div className="text-right">
            <p className="text-[9px] text-muted/50 uppercase font-bold">Total Est. Tax</p>
            <p className="text-2xl font-black font-mono text-amber-400">
              {fmt(data.summary.total_estimated_tax)}
            </p>
            <p className="text-[9px] text-muted/50 font-mono">
              Eff. rate {data.summary.effective_rate_pct}%
            </p>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8 text-muted/50 text-xs font-bold animate-pulse uppercase tracking-widest">
          Computing tax estimate…
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
          <AlertTriangle size={14} />
          Failed to load tax estimate
        </div>
      )}

      {/* No data */}
      {!isLoading && !isError && !hasData && (
        <div className="text-center py-8 space-y-2">
          <TrendingDown size={28} className="text-muted/20 mx-auto" />
          <p className="text-xs text-muted/40 font-bold uppercase tracking-widest">
            No saved trades yet
          </p>
        </div>
      )}

      {/* Category rows */}
      {hasData && data && (
        <div className="space-y-3">
          {categoryOrder.map((id) => (
            <CategoryRow key={id} id={id} cat={data.categories[id]} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      {hasData && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <AlertTriangle size={12} className="text-amber-400/60 mt-0.5 flex-shrink-0" />
          <p className="text-[9px] text-muted/50 leading-relaxed">
            {data?.disclaimer}
          </p>
        </div>
      )}
    </Card>
  );
}
