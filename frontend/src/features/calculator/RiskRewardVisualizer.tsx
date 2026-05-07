import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, ShieldAlert, ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  buyPrice: number;
  sellPrice: number;
  stopLoss?: number;
  targetPrice?: number;
  isShort?: boolean;
}

export function RiskRewardVisualizer({ buyPrice, sellPrice, stopLoss, targetPrice, isShort = false }: Props) {
  const { 
    min, 
    max, 
    entryPos, 
    exitPos, 
    slPos, 
    tpPos, 
    isProfit,
    rrRatio
  } = useMemo(() => {
    const prices = [buyPrice, sellPrice];
    if (stopLoss) prices.push(stopLoss);
    if (targetPrice) prices.push(targetPrice);
    
    const minP = Math.min(...prices) * 0.98;
    const maxP = Math.max(...prices) * 1.02;
    const range = maxP - minP;
    
    const getPos = (p: number) => ((p - minP) / range) * 100;
    
    const isProf = isShort ? sellPrice < buyPrice : sellPrice > buyPrice;
    
    let rr = 0;
    if (stopLoss && targetPrice) {
      const risk = Math.abs(buyPrice - stopLoss);
      const reward = Math.abs(targetPrice - buyPrice);
      rr = reward / risk;
    }

    return {
      min: minP,
      max: maxP,
      entryPos: getPos(buyPrice),
      exitPos: getPos(sellPrice),
      slPos: stopLoss ? getPos(stopLoss) : null,
      tpPos: targetPrice ? getPos(targetPrice) : null,
      isProfit: isProf,
      rrRatio: rr
    };
  }, [buyPrice, sellPrice, stopLoss, targetPrice, isShort]);

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
          <ArrowRightLeft size={16} className="text-primary" />
          Risk-Reward Visualizer
        </h3>
        {rrRatio > 0 && (
          <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">
            R:R Ratio — 1:{rrRatio.toFixed(2)}
          </div>
        )}
      </div>

      <div className="relative h-24 flex items-center px-2">
        {/* Baseline */}
        <div className="absolute left-0 right-0 h-1 bg-white/5 rounded-full" />
        
        {/* Profit/Loss Zones */}
        {stopLoss && (
           <div 
             className={`absolute h-1 rounded-full ${isShort ? 'bg-emerald-500/30' : 'bg-rose-500/30'}`}
             style={{ 
               left: `${Math.min(entryPos, slPos)}%`, 
               width: `${Math.abs(entryPos - slPos)}%` 
             }}
           />
        )}
        {targetPrice && (
           <div 
             className={`absolute h-1 rounded-full ${isShort ? 'bg-rose-500/30' : 'bg-emerald-500/30'}`}
             style={{ 
               left: `${Math.min(entryPos, tpPos)}%`, 
               width: `${Math.abs(entryPos - tpPos)}%` 
             }}
           />
        )}

        {/* Entry Marker */}
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute z-20 flex flex-col items-center gap-1"
          style={{ left: `${entryPos}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-3 h-3 rounded-full bg-white border-2 border-black shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          <span className="text-[9px] font-black text-white uppercase tracking-tighter">Entry</span>
          <span className="text-[10px] font-mono text-white/60">₹{buyPrice}</span>
        </motion.div>

        {/* Exit Marker */}
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute z-20 flex flex-col items-center gap-1"
          style={{ left: `${exitPos}%`, transform: 'translateX(-50%)' }}
        >
          <div className={`w-3 h-3 rounded-full ${isProfit ? 'bg-emerald-400' : 'bg-rose-400'} border-2 border-black shadow-lg`} />
          <span className={`text-[9px] font-black uppercase tracking-tighter ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isProfit ? 'Profit' : 'Loss'}
          </span>
          <span className="text-[10px] font-mono text-white/60">₹{sellPrice}</span>
        </motion.div>

        {/* SL Marker */}
        {slPos !== null && (
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute z-10 flex flex-col items-center gap-1"
            style={{ left: `${slPos}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-3 h-3 rounded-lg bg-rose-500/40 border border-rose-500/60 rotate-45 flex items-center justify-center">
              <ShieldAlert size={8} className="text-rose-200 -rotate-45" />
            </div>
            <span className="text-[9px] font-black text-rose-400 uppercase tracking-tighter">SL</span>
            <span className="text-[10px] font-mono text-rose-400/60">₹{stopLoss}</span>
          </motion.div>
        )}

        {/* Target Marker */}
        {tpPos !== null && (
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute z-10 flex flex-col items-center gap-1"
            style={{ left: `${tpPos}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500/60 flex items-center justify-center">
              <Target size={8} className="text-emerald-200" />
            </div>
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">Target</span>
            <span className="text-[10px] font-mono text-emerald-400/60">₹{targetPrice}</span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/5 group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Potential Upside</span>
          </div>
          <p className="text-xl font-black text-white">
            {targetPrice ? `+₹${((targetPrice - buyPrice) * 100 / buyPrice).toFixed(2)}%` : 'N/A'}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/5 group hover:border-rose-500/30 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={14} className="text-rose-400" />
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Max Downside</span>
          </div>
          <p className="text-xl font-black text-white">
            {stopLoss ? `-₹${((buyPrice - stopLoss) * 100 / buyPrice).toFixed(2)}%` : 'N/A'}
          </p>
        </div>
      </div>
      
      <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl text-[10px] text-muted leading-relaxed font-bold italic">
        "Risk comes from not knowing what you're doing." — Warren Buffett. Always set your stop-loss before entering a trade.
      </div>
    </div>
  );
}
