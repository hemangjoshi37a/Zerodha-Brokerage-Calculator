import { useState, useEffect } from 'react';
import { Card, Label, Input } from '../../components/ui/Base';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PositionSizerResult {
  recommended_qty: number;
  risk_amount: number;
  risk_per_unit: number;
  capital_at_risk_pct: number;
  max_loss: number;
  margin_required: number;
}

interface Props {
  buyPrice: number;
}

function computePosition(capital: number, riskPct: number, stopLossAmt: number, buyPrice: number): PositionSizerResult {
  const risk_amount = (capital * riskPct) / 100;
  const risk_per_unit = Math.max(stopLossAmt, 0.01);
  const recommended_qty = Math.max(1, Math.floor(risk_amount / risk_per_unit));
  const max_loss = recommended_qty * risk_per_unit;
  const margin_required = recommended_qty * buyPrice;
  const capital_at_risk_pct = (max_loss / capital) * 100;
  return { recommended_qty, risk_amount, risk_per_unit, capital_at_risk_pct, max_loss, margin_required };
}

export function PositionSizer({ buyPrice }: Props) {
  const [capital, setCapital] = useState<number>(100000);
  const [riskPct, setRiskPct] = useState<number>(2);
  const [stopLossAmt, setStopLossAmt] = useState<number>(20);
  const [result, setResult] = useState<PositionSizerResult | null>(null);

  useEffect(() => {
    if (capital > 0 && riskPct > 0 && stopLossAmt > 0 && buyPrice > 0) {
      setResult(computePosition(capital, riskPct, stopLossAmt, buyPrice));
    }
  }, [capital, riskPct, stopLossAmt, buyPrice]);

  const isOverexposed = result ? result.capital_at_risk_pct > 5 : false;

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
          <Calculator size={18} />
        </div>
        <div>
          <h3 className="text-sm font-black text-white">Position Sizer</h3>
          <p className="text-[9px] text-muted uppercase tracking-widest">Risk-based lot calculator</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Total Capital (₹)</Label>
            <Input
              type="number"
              value={capital}
              onChange={e => setCapital(parseFloat(e.target.value) || 0)}
              icon={Wallet}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Risk per Trade (%)</Label>
            <Input
              type="number"
              value={riskPct}
              onChange={e => setRiskPct(parseFloat(e.target.value) || 0)}
              step="0.5"
              icon={AlertCircle}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Stop-Loss Amount per Unit (₹)</Label>
          <Input
            type="number"
            value={stopLossAmt}
            onChange={e => setStopLossAmt(parseFloat(e.target.value) || 0)}
            step="0.5"
          />
          <p className="text-[10px] text-muted/60 mt-1">
            If buy price is ₹{buyPrice.toFixed(2)}, SL at ₹{(buyPrice - stopLossAmt).toFixed(2)}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3 pt-2 border-t border-white/5"
          >
            {/* Recommended Qty — hero number */}
            <div className={`rounded-xl p-4 border text-center ${isOverexposed ? 'border-rose-500/30 bg-rose-500/5' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
              <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Recommended Quantity</p>
              <p className={`text-4xl font-black font-mono ${isOverexposed ? 'text-rose-400' : 'text-emerald-400'}`}>
                {result.recommended_qty.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted mt-1">units / shares</p>
            </div>

            {/* Risk stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <SizerStat label="Capital at Risk" value={`₹ ${result.risk_amount.toFixed(0)}`} sub={`${riskPct}% of capital`} />
              <SizerStat label="Max Loss" value={`₹ ${result.max_loss.toFixed(0)}`} sub="If SL hits" />
              <SizerStat label="Capital Required" value={`₹ ${result.margin_required.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} sub="Approx margin" />
              <SizerStat label="Actual Risk %" value={`${result.capital_at_risk_pct.toFixed(2)}%`} sub="True exposure" />
            </div>

            {isOverexposed ? (
              <div className="flex items-center gap-2 text-[10px] text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                <AlertCircle size={13} />
                HIGH RISK: Position exceeds 5% capital exposure
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                <CheckCircle2 size={13} />
                SAFE ZONE: Risk within recommended limits
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function SizerStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white/5 rounded-xl px-3 py-2.5">
      <p className="text-[9px] text-muted/60 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-black font-mono text-white mt-0.5">{value}</p>
      <p className="text-[9px] text-muted/50 mt-0.5">{sub}</p>
    </div>
  );
}
