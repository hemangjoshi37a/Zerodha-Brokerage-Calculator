import React, { useState } from 'react';
import type { SegmentType, CalculationRequest } from '../../types';
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
  Sparkles
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

export function CalculatorForm() {
  const [formData, setFormData] = useState<CalculationRequest>({
    segment: 'equity_intraday',
    exchange: 'NSE',
    buy_price: 1000,
    sell_price: 1100,
    quantity: 100,
    multiplier: 1
  });

  const calculateMutation = useCalculate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateMutation.mutate(formData);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  return (
    <Card className="w-full relative group p-8" glow>
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-primary/40 transition-colors duration-1000" />
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-secondary/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-secondary/40 transition-colors duration-1000" />

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary shadow-inner">
              <Layers size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">Trade Config</h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <p className="text-[9px] text-muted font-black uppercase tracking-[0.2em]">Ready for Analysis</p>
              </div>
            </div>
          </div>
          <Sparkles className="text-primary/40 animate-pulse" size={20} />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <Label>Market Exchange</Label>
            <CustomSelect 
              value={formData.exchange}
              onChange={(val) => handleSelectChange('exchange', val)}
              options={exchangeOptions}
              icon={Boxes}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Buy Price (Entry)</Label>
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
            <Label>Sell Price (Exit)</Label>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Trade Quantity</Label>
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

        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full text-lg"
            disabled={calculateMutation.isPending}
          >
            {calculateMutation.isPending ? (
              <RefreshCcw className="animate-spin" size={22} />
            ) : (
              <>
                <Zap size={18} className="fill-white" />
                GENERATE ANALYTICS
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
