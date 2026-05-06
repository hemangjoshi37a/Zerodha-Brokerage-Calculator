import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { CalculationRequest } from '../../types';
import { Button, Input, Card, Label, CustomSelect } from '../../components/ui/Base';
import { useCalculate } from '../../hooks/useTrade';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownLeft,
  Hash,
  Zap,
  Globe,
  Boxes,
  Sparkles,
  Keyboard,
} from 'lucide-react';

const segmentOptions = [
  { value: 'equity_intraday', label: 'Equity Intraday' },
  { value: 'equity_delivery', label: 'Equity Delivery' },
  { value: 'equity_futures', label: 'Equity Futures' },
  { value: 'equity_options', label: 'Equity Options' },
  { value: 'currency_futures', label: 'Currency Futures' },
  { value: 'currency_options', label: 'Currency Options' },
  { value: 'commodity_futures', label: 'Commodity Futures' },
  { value: 'commodity_options', label: 'Commodity Options' },
];

const exchangeOptions = [
  { value: 'NSE', label: 'NSE' },
  { value: 'BSE', label: 'BSE' },
  { value: 'MCX', label: 'MCX' },
];

const strategyPresets = [
  { value: 'none', label: 'Manual Configuration' },
  { value: 'bluechip', label: 'Blue Chip Delivery', data: { segment: 'equity_delivery', buy_price: 2500, sell_price: 2650, quantity: 40 } },
  { value: 'scalp', label: 'Intraday Scalp', data: { segment: 'equity_intraday', buy_price: 450.5, sell_price: 452.2, quantity: 1500 } },
  { value: 'nifty', label: 'Nifty Futures', data: { segment: 'equity_futures', buy_price: 22000, sell_price: 22150, quantity: 50 } },
  { value: 'options', label: 'BankNifty Options', data: { segment: 'equity_options', buy_price: 320, sell_price: 385, quantity: 15 } },
  { value: 'crude', label: 'Crude Oil Futures', data: { segment: 'commodity_futures', buy_price: 6200, sell_price: 6350, quantity: 1, multiplier: 100 } },
  { value: 'usdinr', label: 'USD/INR Futures', data: { segment: 'currency_futures', buy_price: 83.5, sell_price: 83.9, quantity: 5 } },
];

interface Props {
  formData: CalculationRequest;
  onFormChange: (data: CalculationRequest) => void;
}

export function CalculatorForm({ formData, onFormChange }: Props) {
  const [selectedStrategy, setSelectedStrategy] = useState('none');
  const [autoCalc, setAutoCalc] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const calculateMutation = useCalculate();

  // Keyboard shortcut: Ctrl+Enter to calculate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        calculateMutation.mutate(formData);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [formData, calculateMutation]);

  // Auto-recalculate with 700ms debounce
  const triggerAutoCalc = useCallback((data: CalculationRequest) => {
    if (!autoCalc) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (data.buy_price > 0 && data.sell_price > 0 && data.quantity > 0) {
        calculateMutation.mutate(data);
      }
    }, 700);
  }, [autoCalc, calculateMutation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    calculateMutation.mutate(formData);
  };

  const handleStrategyChange = (val: string) => {
    setSelectedStrategy(val);
    const preset = strategyPresets.find(p => p.value === val);
    if (preset && preset.data) {
      const updated = { ...formData, ...preset.data } as CalculationRequest;
      onFormChange(updated);
      triggerAutoCalc(updated);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    const updated = { ...formData, [name]: value };
    onFormChange(updated);
    setSelectedStrategy('none');
    triggerAutoCalc(updated);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: parseFloat(value) || 0 };
    onFormChange(updated);
    setSelectedStrategy('none');
    triggerAutoCalc(updated);
  };

  // Profit preview badge (pure local estimate, no API call)
  const roughProfit =
    formData.buy_price > 0 && formData.sell_price > 0 && formData.quantity > 0
      ? (formData.sell_price - formData.buy_price) * formData.quantity
      : null;

  return (
    <Card className="w-full relative group p-7" glow>
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-primary/40 transition-colors duration-1000" />
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-secondary/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-secondary/40 transition-colors duration-1000" />

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary shadow-inner">
              <Layers size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">Trade Config</h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[9px] text-muted font-black uppercase tracking-[0.2em]">
                  {autoCalc ? 'Auto-Calc ON' : 'Auto-Calc OFF'} · Ctrl+Enter
                </p>
              </div>
            </div>
          </div>
          {/* Auto-calc toggle */}
          <button
            type="button"
            onClick={() => setAutoCalc(prev => !prev)}
            className={`flex items-center gap-1.5 text-[9px] font-bold px-3 py-1.5 rounded-lg border transition-all ${autoCalc ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-white/10 text-muted hover:border-primary/30'}`}
          >
            <Keyboard size={11} />
            AUTO
          </button>
        </header>

        {/* Gross profit badge */}
        <AnimatePresence>
          {roughProfit !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-black ${roughProfit >= 0 ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-rose-500/20 bg-rose-500/5 text-rose-400'}`}>
                <span className="text-muted/60 text-[9px] uppercase tracking-wider">Gross Move (pre-charges)</span>
                <span>{roughProfit >= 0 ? '+' : ''}₹ {roughProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Strategy preset */}
        <div className="space-y-2">
          <Label>Quick Strategy Preset</Label>
          <CustomSelect
            value={selectedStrategy}
            onChange={handleStrategyChange}
            options={strategyPresets}
            icon={Sparkles}
          />
        </div>

        {/* Segment + Exchange */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Trading Segment</Label>
            <CustomSelect
              value={formData.segment}
              onChange={(val) => handleSelectChange('segment', val)}
              options={segmentOptions}
              icon={Globe}
            />
          </div>
          <div className="space-y-2">
            <Label>Exchange</Label>
            <CustomSelect
              value={formData.exchange}
              onChange={(val) => handleSelectChange('exchange', val)}
              options={exchangeOptions}
              icon={Boxes}
            />
          </div>
        </div>

        {/* Buy / Sell */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Buy Price (₹)</Label>
            <Input
              type="number"
              name="buy_price"
              value={formData.buy_price}
              onChange={handleInputChange}
              icon={ArrowUpRight}
              step="0.05"
            />
          </div>
          <div className="space-y-2">
            <Label>Sell Price (₹)</Label>
            <Input
              type="number"
              name="sell_price"
              value={formData.sell_price}
              onChange={handleInputChange}
              icon={ArrowDownLeft}
              step="0.05"
            />
          </div>
        </div>

        {/* Quantity + Multiplier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              icon={Hash}
            />
          </div>
          <AnimatePresence>
            {formData.segment.includes('commodity') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, height: 0 }}
                animate={{ opacity: 1, scale: 1, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.9, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <Label>Lot Multiplier</Label>
                <Input
                  type="number"
                  name="multiplier"
                  value={formData.multiplier}
                  onChange={handleInputChange}
                  icon={Zap}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full text-lg"
          disabled={calculateMutation.isPending}
        >
          {calculateMutation.isPending
            ? <RefreshCcw className="animate-spin" size={22} />
            : <><Zap size={18} className="fill-white" /> CALCULATE & SAVE</>}
        </Button>

        {calculateMutation.isError && (
          <p className="text-[10px] text-rose-400 text-center font-bold">Calculation failed. Check your inputs.</p>
        )}
      </form>
    </Card>
  );
}
