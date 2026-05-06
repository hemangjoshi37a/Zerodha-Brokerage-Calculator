import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card, Label, Input, Button } from '../../components/ui/Base';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, ShieldAlert, ArrowRight, RefreshCcw } from 'lucide-react';
import type { CalculationRequest } from '../../types';

interface TargetResult {
  target_exit_price: number;
  breakeven_exit_price: number;
  stop_loss_price: number | null;
  stop_loss_pnl: number | null;
  target_profit: number;
  buy_price: number;
  quantity: number;
}

interface Props {
  formData: CalculationRequest;
}

export function TargetPriceEngine({ formData }: Props) {
  const [targetProfit, setTargetProfit] = useState<number>(1000);
  const [stopLossPct, setStopLossPct] = useState<number>(2);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<TargetResult>('/target-price', {
        segment: formData.segment,
        exchange: formData.exchange,
        buy_price: formData.buy_price,
        quantity: formData.quantity,
        multiplier: formData.multiplier ?? 1,
        target_profit: targetProfit,
        stop_loss_pct: stopLossPct,
      });
      return data;
    },
  });

  const r = mutation.data;

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
          <Target size={18} />
        </div>
        <div>
          <h3 className="text-sm font-black text-white">Target Price Engine</h3>
          <p className="text-[9px] text-muted uppercase tracking-widest">Reverse-calculate your exit</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Target Profit (₹)</Label>
          <Input
            type="number"
            value={targetProfit}
            onChange={e => setTargetProfit(parseFloat(e.target.value) || 0)}
            icon={TrendingUp}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Stop-Loss (%)</Label>
          <Input
            type="number"
            value={stopLossPct}
            onChange={e => setStopLossPct(parseFloat(e.target.value) || 0)}
            icon={ShieldAlert}
            step="0.1"
          />
        </div>
      </div>

      <Button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="w-full"
        variant="outline"
      >
        {mutation.isPending
          ? <RefreshCcw size={14} className="animate-spin" />
          : <><Target size={14} /> CALCULATE TARGETS</>}
      </Button>

      <AnimatePresence>
        {r && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3 pt-2 border-t border-white/5"
          >
            <TargetRow
              label="Target Exit Price"
              value={`₹ ${r.target_exit_price.toFixed(2)}`}
              sub={`Move required: ₹ ${(r.target_exit_price - r.buy_price).toFixed(2)} / unit`}
              color="text-emerald-400"
            />
            <TargetRow
              label="Breakeven Exit"
              value={`₹ ${r.breakeven_exit_price.toFixed(2)}`}
              sub="Price where you cover all charges"
              color="text-blue-400"
            />
            {r.stop_loss_price && (
              <TargetRow
                label="Stop-Loss Level"
                value={`₹ ${r.stop_loss_price.toFixed(2)}`}
                sub={`Max loss: ₹ ${Math.abs(r.stop_loss_pnl ?? 0).toFixed(2)}`}
                color="text-rose-400"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function TargetRow({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
      <div>
        <p className="text-[10px] text-muted uppercase tracking-wider font-bold">{label}</p>
        <p className="text-[10px] text-muted/60 mt-0.5">{sub}</p>
      </div>
      <div className={`text-base font-black font-mono ${color}`}>
        <span className="flex items-center gap-1"><ArrowRight size={12} />{value}</span>
      </div>
    </div>
  );
}
